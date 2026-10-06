/*
 * Syntax-choices pages (`templates/syntax-choices.html`, `spell dev choices`):  draws one table per section from the
 * rows beside the page, saves what Owen types as he goes, and sends it all on "Do it".
 * - Loaded INSTEAD of `spell-ui.js`, as `commands.js` is:  the runtime builds the contents sidebar, the rail and the
 *   sticky titles from `main`'s sections once, at start, so the sections must be in the page before it runs.  This
 *   script fetches, draws, then adds `spell-ui.js` (same folder), whatever happened.
 * - The rows:  `<slug>.rows.json` beside the page (`choices.js` has the shape:  `{ sections, rows }`), fetched, so
 *   the page needs the PAGE SERVER;  from `file://` it shows a notice where the tables go.
 * - Each section:  a `<ui-section>` (folded, like every docs section;  "Expand all" in the toolbar), its rule, then a
 *   table File | Purpose | Current | Recommended, rows by file, then line.
 *   - File:  `vscode://file/<checkout>/<file>:<line>`, which VS Code opens AT the line.  The checkout is the one the
 *     page server serves (`SPELL_SERVER.root`;  a `/worktrees/<w>/` page:  that worktree).  In VS Code's side bar the
 *     frame can't follow it, so the click goes to the view as `{ spell: "open", kind: "external" }`, which hands it to
 *     `vscode.env.openExternal()`:  VS Code's own scheme comes back to VS Code (`packages/vscode/src/DocView.ts`)
 *   - Recommended:  a box pre-filled with Claude's call, one line of text (a `<textarea>` that wraps and grows, so a
 *     long use site shows whole;  Enter adds no line);  a box that differs is marked, with a round button putting
 *     the recommendation back
 * - Saving (`tools/choicesRoutes.ts`):  5s after the last keystroke, and as the page goes away (`fetch` with
 *   `keepalive`:  `sendBeacon` can't carry the server's token header), the changed boxes and the feedback go to
 *   `POST /api/choices/draft`;  on load, `GET` restores them.  The toolbar says "saved 12:04", or why it can't.
 * - The toolbar, pinned to the window's bottom:  the feedback (grows with its text), "Do it", the counts, the save
 *   status, Expand all.  "Do it":  `POST /api/choices/answer`, which `spell dev choices wait` exits with;  pressed
 *   again after changes, it sends again.
 * - Classic script, no imports:  same rule as every docs asset.
 */
;(function syntaxChoices() {
  /** Where drafts and answers go. */
  const API = "/api/choices"
  /** How long after the last change the draft is saved, in ms (Owen:  "5 sec debounce is fine"). */
  const SAVE_DELAY = 5000
  /** A section's icon when its data names none. */
  const SECTION_ICON = "list check"
  /** A page the route saves for:  in a `details/` folder (`choicesRoutes.ts` `choicesPage()`). */
  const SAVED_PAGE = /\/details\/[^/]+\.html$/
  /** The docs runtime's per-page fold store:  `spell-doc-runtime.js` `FOLD_KEY_PREFIX`. */
  const FOLD_KEY = "spell-folds:"
  const script = document.currentScript
  const bundle = new URL("spell-ui.js", script.src).href
  const server = window.SPELL_SERVER

  /** Every row, by id. */
  const rows = new Map()
  /** The toolbar's parts, once drawn. */
  let bar
  /** The draft save waiting for typing to stop. */
  let timer
  /** Something changed since the last save. */
  let isUnsaved = false
  /** The answer last sent, if any:  the "Sent" message follows it. */
  let sent

  void start()

  ////////////////
  // ## Start
  ////////////////

  /** Draw from the rows (or the notice), boot the bundle, then restore what was typed. */
  async function start() {
    let data
    try {
      data = await load()
      if (data) draw(data)
    } catch (error) {
      notice(`Couldn't draw the rows:  ${error.message}`)
    }
    const tag = document.createElement("script")
    tag.src = bundle
    document.body.append(tag)
    if (data) await restore()
  }

  /** The page's rows, or `undefined` after showing why not. */
  async function load() {
    const file = location.pathname.replace(/\.html?$/, ".rows.json")
    if (location.protocol === "file:") {
      notice(
        `This page draws its rows from ${file.split("/").pop()}, and saves what you type, through the page server:  open it with \`spell dev choices show <page>\`.`
      )
      return undefined
    }
    const response = await fetch(file, { cache: "no-store" })
    if (!response.ok) throw new Error(`${file.split("/").pop()}:  ${response.status} ${response.statusText}`)
    return response.json()
  }

  ////////////////
  // ## Drawing
  ////////////////

  /** The sections where `[data-choices-sections]` is, then the toolbar at `main`'s end. */
  function draw(data) {
    const holder = document.querySelector("[data-choices-sections]")
    const html = (data.sections ?? []).map((section) => sectionHTML(section, data.rows ?? [])).join("\n")
    holder.insertAdjacentHTML("beforebegin", html)
    holder.remove()
    for (const row of data.rows ?? []) {
      const tr = document.querySelector(`tr[data-choice="${CSS.escape(row.id)}"]`)
      if (tr) rows.set(row.id, { ...row, tr, input: tr.querySelector("textarea"), reset: tr.querySelector("button") })
    }
    bar = drawBar()
    wire()
    count()
  }

  /** One section:  a folded `<ui-section>`, its rule, its table. */
  function sectionHTML(section, all) {
    const mine = all
      .filter((row) => row.section === section.id)
      .sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)
    const rule = section.description ? `<p class="spell-choices-rule">${text(section.description)}</p>` : ""
    return `<ui-section id="${attr(section.id)}" header="${attr(section.title)}" badge="${attr(badge(mine, 0))}" sticky collapsible dividing collapsed>
      <ui-icon slot="icon" name="${attr(section.icon ?? SECTION_ICON)}"></ui-icon>${rule}
      <ui-table class="spell-choices-table" celled compact unstackable>
        <table>
          <thead><tr><th>File</th><th>Purpose</th><th>Current</th><th>Recommended</th></tr></thead>
          <tbody>${mine.map(rowHTML).join("")}</tbody>
        </table>
      </ui-table>
    </ui-section>`
  }

  /** A section's count:  renames and rows that stay, and how many Owen changed. */
  function badge(mine, changed) {
    const renames = mine.filter((row) => row.recommended !== row.current).length
    const counts = [`${renames} to rename`, `${mine.length - renames} stay`]
    if (changed) counts.push(`${changed} changed`)
    return counts.join(" · ")
  }

  /** One row:  the file link (and its folder), purpose (and note), current, the box. */
  function rowHTML(row) {
    const slash = row.file.lastIndexOf("/")
    const folder = row.file.slice(0, slash).replace(/^packages\//, "")
    const name = row.file.slice(slash + 1)
    const stays = row.recommended === row.current
    const tag = stays ? ` <ui-label class="spell-choice-stays" size="mini" basic>stays</ui-label>` : ""
    const note = row.note ? `<div class="spell-choice-note">${text(row.note)}</div>` : ""
    const label = `Recommended for ${row.current}`
    return `<tr id="${attr(`row-${row.id}`)}" data-choice="${attr(row.id)}"${stays ? " data-stays" : ""}>
      <td class="spell-choice-file"><a class="spell-choice-link" href="${attr(fileUrl(row))}" title="${attr(`Open ${row.file}:${row.line} in VS Code`)}">${escape(name)}<span class="spell-choice-line">:${row.line}</span></a><div class="spell-choice-folder">${escape(folder)}</div></td>
      <td class="spell-choice-purpose">${escape(row.purpose)}${tag}${note}</td>
      <td class="spell-choice-current"><code>${escape(row.current)}</code></td>
      <td class="spell-choice-pick"><div class="spell-choice-field"><textarea class="spell-choice-input" rows="1" spellcheck="false" autocomplete="off" aria-label="${attr(label)}">${escape(row.recommended)}</textarea><button type="button" class="spell-choice-reset" aria-label="Back to the recommendation" title="${attr(`Back to ${row.recommended}`)}" hidden><ui-icon name="clock rotate left"></ui-icon></button></div></td>
    </tr>`
  }

  /**
   * `row`'s file at its line, for VS Code:  `vscode://file/<checkout>/<file>:<line>`;  `#` before the page server
   * says where the checkout is (the link then does nothing).
   */
  function fileUrl(row) {
    const root = server?.root
    if (!root) return "#"
    const worktree = location.pathname.match(/^\/worktrees\/([^/]+)\//)?.[1]
    const checkout = worktree ? `${root}/.claude/worktrees/${worktree}` : root
    return `vscode://file${encodeURI(`${checkout}/${row.file}`)}:${row.line}`
  }

  /**
   * The toolbar after the last section, pinned to the window's bottom (`syntax-choices.css`):  feedback with "Do it"
   * to its right;  under them the counts, the save status and Expand all;  then an error or the "Sent" message.
   */
  function drawBar() {
    const section = el("div", { id: "choices-bar", class: "spell-choices-bar" })
    const feedback = el("ui-textarea", {
      class: "spell-choices-feedback",
      name: "feedback",
      rows: "1",
      placeholder: "Feedback for Claude:  anything the boxes don't say",
      fluid: ""
    })
    const send = el(
      "ui-button",
      { class: "spell-choices-send", primary: "", circular: "", icon: "paper plane" },
      "Do it"
    )
    const count = el("span", { class: "spell-choices-count" })
    const saved = el("span", { class: "spell-choices-saved" })
    const expand = el(
      "ui-button",
      { class: "spell-choices-expand", size: "mini", basic: "", circular: "", icon: "angles down" },
      "Expand all"
    )
    const error = el("ui-message", { class: "spell-choices-error", state: "negative", size: "small", hidden: "" })
    const done = el("ui-message", { class: "spell-choices-sent", state: "positive", size: "small", hidden: "" })
    section.append(
      el("div", { class: "spell-choices-row" }, feedback, send),
      el("div", { class: "spell-choices-meta" }, count, saved, expand),
      error,
      done
    )
    document.querySelector("main").append(section)
    return { feedback, send, count, saved, expand, error, done }
  }

  /** Show `message` where the tables go. */
  function notice(message) {
    const holder = document.querySelector("[data-choices-sections]") ?? document.querySelector("main")
    holder?.insertAdjacentHTML(
      "afterbegin",
      `<ui-message state="warning" header="Rows not drawn"><p>${text(message)}</p></ui-message>`
    )
  }

  ////////////////
  // ## Editing
  ////////////////

  /** Typing, resets, file links, feedback, Do it, Expand all, and saving as the page goes away. */
  function wire() {
    const main = document.querySelector("main")
    main.addEventListener("input", (event) => {
      if (!event.target.matches?.(".spell-choice-input")) return
      // one line of text:  a pasted line break goes
      if (/\n/.test(event.target.value)) event.target.value = event.target.value.replace(/\s*\n\s*/g, " ")
      mark(event.target.closest("tr"))
      changed()
    })
    // Enter in a box adds no line
    main.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && event.target.matches?.(".spell-choice-input")) event.preventDefault()
    })
    main.addEventListener("click", (event) => {
      const reset = event.target.closest?.(".spell-choice-reset")
      if (reset) {
        const row = rows.get(reset.closest("tr").dataset.choice)
        row.input.value = row.recommended
        mark(row.tr)
        changed()
        row.input.focus()
        return
      }
      const link = event.target.closest?.(".spell-choice-link")
      // in VS Code's side bar the frame can't follow `vscode://`:  the view opens it (`DocView.open()`)
      if (link && window.parent !== window) {
        event.preventDefault()
        window.parent.postMessage({ spell: "open", url: link.href, kind: "external" }, "*")
      }
    })
    bar.feedback.addEventListener("ui-input", changed)
    bar.send.addEventListener("click", () => void send())
    bar.expand.addEventListener("click", expandAll)
    addEventListener("pagehide", () => void save({ keepalive: true }))
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") void save({ keepalive: true })
    })
  }

  /** Mark `tr` changed (its box differs from the recommendation) or not:  the mark, the reset button. */
  function mark(tr) {
    const row = rows.get(tr.dataset.choice)
    const isChanged = row.input.value.trim() !== row.recommended
    tr.toggleAttribute("data-changed", isChanged)
    row.reset.hidden = !isChanged
  }

  /** Something changed:  recount, and save once typing stops. */
  function changed() {
    count()
    isUnsaved = true
    clearTimeout(timer)
    timer = setTimeout(() => void save(), SAVE_DELAY)
    setSaved("not saved yet")
    if (sent) showSent(sent, { isStale: true })
  }

  /** The toolbar's count, and each section's badge. */
  function count() {
    const changedRows = [...rows.values()].filter((row) => row.tr.hasAttribute("data-changed"))
    bar.count.textContent = `${changedRows.length} changed of ${rows.size}`
    for (const section of document.querySelectorAll("ui-section:has(.spell-choices-table)")) {
      const mine = [...rows.values()].filter((row) => row.section === section.id)
      section.setAttribute("badge", badge(mine, mine.filter((row) => changedRows.includes(row)).length))
    }
  }

  /**
   * Unfold every section, or, once they all are, fold them again;  the button follows.
   * - remembered as the reader's own folds are:  a property set fires no `ui-open`, so this writes the runtime's
   *   store itself (`spell-doc-runtime.js` `wireFolds()`, key `FOLD_KEY_PREFIX` + path)
   */
  function expandAll() {
    const sections = [...document.querySelectorAll("ui-section:has(.spell-choices-table)")]
    const isAllOpen = sections.every((section) => !section.collapsed)
    for (const section of sections) section.collapsed = isAllOpen
    labelExpand(!isAllOpen)
    try {
      const key = `${FOLD_KEY}${location.pathname}`
      const folds = JSON.parse(localStorage.getItem(key) ?? "{}")
      for (const section of sections) folds[section.id] = isAllOpen
      localStorage.setItem(key, JSON.stringify(folds))
    } catch {
      // storage blocked:  the folds just aren't remembered
    }
  }

  /** The Expand all button for `isAllOpen` sections:  "Collapse all" once they all are. */
  function labelExpand(isAllOpen) {
    bar.expand.textContent = isAllOpen ? "Collapse all" : "Expand all"
    bar.expand.setAttribute("icon", isAllOpen ? "angles up" : "angles down")
  }

  /** The boxes that differ from their recommendation:  id -> what's in it, as typed. */
  function collect() {
    const values = {}
    for (const row of rows.values()) if (row.tr.hasAttribute("data-changed")) values[row.id] = row.input.value
    return values
  }

  /** The feedback box's text, trimmed. */
  function feedbackText() {
    return String(bar.feedback.value ?? "").trim()
  }

  ////////////////
  // ## Saving
  ////////////////

  /**
   * Save the draft now, if anything changed since the last save.
   * - `keepalive`:  the page is going away;  the request outlives it
   * - NEVER throws:  a failure shows in the toolbar, and the next change tries again
   */
  async function save({ keepalive = false } = {}) {
    clearTimeout(timer)
    if (!isUnsaved) return
    isUnsaved = false
    setSaved("saving…")
    try {
      const { draft } = await post("draft", { keepalive })
      setSaved(`saved ${time(draft.saved)}`)
    } catch (error) {
      isUnsaved = true
      setSaved(`can't save:  ${error.message}`, { isError: true })
    }
  }

  /** "Do it":  send every changed box and the feedback;  show what was sent, or why not. */
  async function send() {
    clearTimeout(timer)
    bar.error.hidden = true
    bar.send.setAttribute("loading", "")
    try {
      const { answer } = await post("answer")
      isUnsaved = false
      setSaved(`saved ${time(answer.answered)}`)
      showSent(answer)
    } catch (error) {
      bar.error.replaceChildren(el("p", {}, `Not sent:  ${error.message}`))
      bar.error.hidden = false
    } finally {
      bar.send.removeAttribute("loading")
    }
  }

  /**
   * POST the page's choices to `/api/choices/<what>`;  the route's answer.
   * - throws an `Error` saying, in Owen's words, what to do:  reload, restart the server, open it from the server
   */
  async function post(what, { keepalive = false } = {}) {
    if (!server?.token) throw new Error("this page isn't on the page server:  open it with `spell dev choices show`")
    const response = await fetch(`${API}/${what}`, {
      method: "POST",
      keepalive,
      headers: { "content-type": "application/json", "x-server-token": server.token },
      body: JSON.stringify({ page: location.pathname, values: collect(), feedback: feedbackText() })
    })
    const body = await response.json().catch(() => ({}))
    if (response.ok) return body
    if (response.status === 403 && /token/.test(body.error ?? ""))
      throw new Error("the page server restarted since this page loaded:  reload the page (your boxes come back)")
    // no route at all:  a server started before `choicesRoutes.ts` existed
    if (response.status === 404 && !body.error)
      throw new Error("page server too old, restart it (`spell dev server stop`, then `spell dev server ensure`)")
    throw new Error(body.error ?? `${response.status} ${response.statusText}`)
  }

  /** What was typed and sent before:  the boxes, the feedback, "saved", "Sent". */
  async function restore() {
    if (!server) return
    // the template (or a copy outside a `details/` folder):  the route takes only real pages, so ask nothing
    if (!SAVED_PAGE.test(location.pathname)) return setSaved("a template:  nothing here is saved")
    try {
      const [draft, answer] = await Promise.all([fetchJson("draft"), fetchJson("answer")])
      const last = draft ?? answer
      if (last) {
        for (const [id, value] of Object.entries(last.values ?? {})) {
          const row = rows.get(id)
          if (!row) continue
          row.input.value = value
          mark(row.tr)
        }
        // a property set before the element upgrades would shadow its own
        await customElements.whenDefined("ui-textarea")
        bar.feedback.value = last.feedback ?? ""
        count()
      }
      if (draft) setSaved(`saved ${time(draft.saved)}`)
      if (answer) showSent(answer)
      // the runtime has put back the reader's folds by the frame after `ui-section` defines
      await customElements.whenDefined("ui-section")
      requestAnimationFrame(() => {
        const sections = [...document.querySelectorAll("ui-section:has(.spell-choices-table)")]
        labelExpand(sections.every((section) => !section.collapsed))
      })
    } catch (error) {
      setSaved(`can't load what you typed:  ${error.message}`, { isError: true })
    }
  }

  /** `GET /api/choices/<what>` for this page:  the draft or answer, or `undefined`. */
  async function fetchJson(what) {
    const response = await fetch(`${API}/${what}?page=${encodeURIComponent(location.pathname)}`, {
      cache: "no-store"
    })
    if (response.status === 404) throw new Error("page server too old, restart it")
    if (!response.ok) return undefined
    return (await response.json())[what] ?? undefined
  }

  /** The toolbar's quiet save status;  `isError`:  in red. */
  function setSaved(message, { isError = false } = {}) {
    bar.saved.textContent = message
    bar.saved.classList.toggle("spell-choices-failed", isError)
  }

  /**
   * The "Sent" message for `answer`;  `isStale`:  changed since, so it says to press Do it again.
   * - SIDE EFFECT:  remembers `answer` as the one sent
   */
  function showSent(answer, { isStale = false } = {}) {
    sent = answer
    const changes = Object.keys(answer.values ?? {}).length
    const again = answer.changes ? ` (sent ${answer.changes + 1} times)` : ""
    const what = `${changes} changed, ${rows.size - changes} as recommended`
    const words = isStale
      ? `Sent at ${time(answer.answered)}${again};  changed since:  press Do it again to send the new ones.`
      : `Sent to Claude at ${time(answer.answered)}${again}:  ${what}.  Change anything and press Do it again to resend.`
    bar.done.setAttribute("state", isStale ? "warning" : "positive")
    bar.done.replaceChildren(el("p", {}, words))
    bar.done.hidden = false
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** `iso`'s time of day, `12:04`. */
  function time(iso) {
    return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
  }

  /** `value` escaped for HTML text;  `` `code` `` becomes `<code>`. */
  function text(value) {
    return escape(value).replace(/`([^`]+)`/g, "<code>$1</code>")
  }

  /** `value` escaped for HTML text. */
  function escape(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  }

  /** `value` safe in a double-quoted attribute. */
  function attr(value) {
    return escape(value).replace(/"/g, "&quot;")
  }

  /** A new `tag` with `attributes`, holding `children` (nodes or text). */
  function el(tag, attributes = {}, ...children) {
    const node = document.createElement(tag)
    for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value)
    node.append(...children)
    return node
  }
})()
