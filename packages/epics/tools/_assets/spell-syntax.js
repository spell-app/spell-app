/*
 * The spell syntax guide (`guides/spell-syntax/spell-syntax.html`):
 * draws every rule of the base spell language, one table per module, from the syntax table generated from the code;
 * keeps what Owen types over its boxes;
 * and turns each wand into a comment asking Claude for more details.  Then boots the docs bundle.
 * - Loaded INSTEAD of `spell-ui.js`, as `core-reference.js` is:
 *   the runtime builds the toolbar and the sticky titles from `main`'s sections once, at start,
 *   so this script fetches, draws, then adds `spell-ui.js` (same folder), whatever happened.
 * - The data:  the JSON `<body data-choices-rows>` names, from the page:
 *   `packages/spell/spellSyntax.json`, written by `yarn gen:syntax` in `packages/spell`
 *   (`src/node/spellSyntax.ts` has its shape, `SpellSyntaxData`).
 *   - Fetched from the checkout SERVING the page, so each branch shows its own rules.
 *   - From `file://` it says so where the tables go:  the page needs the page server.
 * - Built from elements (`el()`), never from markup in strings.
 * - Each module:  a nested `<ui-section>` where `[data-syntax-modules]` is, holding a table Rule name | Syntax |
 *   Purpose, a row per rule class (its internal classes first).
 *   - OPEN, as every section of this page, unlike other docs pages (Owen, 2026-10-12:  "Start out with all
 *     everything expanded")
 * - EXPAND ALL and COLLAPSE ALL at the right of the page toolbar, the ivory band (`wireFoldAll()`).
 * - Rule name:  the class's name, a link to its source (its rule names its tooltip), with a pencil to suggest another
 *   name;  then each syntax it's registered with, a bullet each;  then its aliases, "aka:  `expression`".
 * - Syntax:  each syntax's example, from its tests, and what each writer makes of it.
 * - BOXES, pre-filled with what the code has:  the class's name (behind its pencil), and each example's output from
 *   each writer.
 *   - Owen types over one to suggest another;  a changed box is marked, its round button puts the code's back.
 *   - Keyed `<Class>.<field>`:  `IsGtLt.name`, `IsGtLt.js`, `IsGtLt.ts`, `IsGtLt.py`;
 *     the second example's `AssignmentStatement.js.2`, and so on.
 *   - Saved through the syntax-choices routes (`choicesRoutes.ts`), never into the code:
 *     - 5s after typing stops, and as the page goes away:
 *       `POST /api/docs/choices/draft`, `spell-syntax.draft.json` beside the page
 *     - Send:  `POST /api/docs/choices/answer`, `spell-syntax.answer.json`, which `epic choices wait <page>` exits with
 *   - Kept apart from the generated data, so regenerating it keeps them:
 *     a box whose code now says what Owen typed is no longer a change, and one for a rule that's gone is kept as is.
 * - The WAND beside each purpose asks Claude for more details there:
 *   - it adds a COMMENT (`POST /api/docs/comments`, `commentsRoutes.ts`) on the module's table, quoting the purpose,
 *     "Provide more details here:  `IsGtLt`."
 *   - the runtime draws its thread in that cell;  Claude answers on it (`epic comments answer`)
 *   - `epic comments wait <page>`, run in the background, wakes a session with it
 *   - while its comment waits for Claude, the wand is blue, and a click does nothing more
 * - Classic script, no imports:  same rule as every docs asset.
 */
;(function spellSyntax() {
  /** Where drafts and answers go (`choicesRoutes.ts`). */
  const CHOICES_API = "/api/docs/choices"
  /** Where comments go (`commentsRoutes.ts`). */
  const COMMENTS_API = "/api/docs/comments"
  /** How long after the last change the draft is saved, in ms:  as a choice page. */
  const SAVE_DELAY = 5000
  /** The writers, in the Syntax column's order. */
  const WRITERS = ["js", "ts", "py"]
  /** A wand's words, as its comment starts and as its tooltip. */
  const WAND_WORDS = "Provide more details here"
  /** A purpose the class's docstring doesn't give. */
  const NO_PURPOSE = "(no docstring yet)"
  /** How much of a table's text a comment's excerpt keeps:  `BlockAnchors.js` `EXCERPT_LENGTH`. */
  const EXCERPT_LENGTH = 80
  /** The toolbar's fold buttons:  folds every section?, its icon, its words. */
  const FOLD_BUTTONS = [
    [false, "angles down", "Expand all"],
    [true, "angles up", "Collapse all"]
  ]
  /** Where the runtime remembers this page's folds, `{ [section id]: folded }`:  `spell-doc-runtime.js` `wireFolds()`. */
  const FOLDS_KEY = `spell-folds:${location.pathname}`
  const script = document.currentScript
  const bundle = new URL("spell-ui.js", script.src).href
  const server = window.SPELL_SERVER

  /** Every box, by key (`IsGtLt.py`):  `{ key, input, reset, holder, generated }`. */
  const boxes = new Map()
  /** Every wand, by class name. */
  const wands = new Map()
  /** What Owen typed for rules no longer on the page (renamed, removed):  kept, and saved again as is. */
  let orphans = {}
  /** The toolbar's parts, once drawn. */
  let bar
  /** The draft save waiting for typing to stop. */
  let timer
  /** Something changed since the last save. */
  let isUnsaved = false
  /** The answer last sent, if any. */
  let sent

  void start()

  ////////////////
  // ## Start
  ////////////////

  /** Draw from the data (or the notice), boot the bundle, then restore what was typed and asked. */
  async function start() {
    let data
    try {
      data = await load()
      if (data) draw(data)
    } catch (error) {
      notice(`Couldn't draw the rules:  ${error.message}`)
    }
    document.body.append(el("script", { src: bundle }))
    wireFoldAll()
    if (data) await restore()
  }

  /** The syntax table, or `undefined` after showing why not. */
  async function load() {
    const path = document.body.dataset.choicesRows
    if (!path) throw new Error("the page's `<body>` has no `data-choices-rows`")
    if (location.protocol === "file:") {
      notice(
        "This page draws its rules from the checkout serving it, and saves what you type, through the page server:  open it with `spell dev docs open guides/spell-syntax/spell-syntax.html`."
      )
      return undefined
    }
    const response = await fetch(path, { cache: "no-store" })
    if (!response.ok) throw new Error(`${path.split("/").pop()}:  ${response.status} ${response.statusText}`)
    return response.json()
  }

  ////////////////
  // ## Drawing
  ////////////////

  /** The stats, a section per module where `[data-syntax-modules]` is, then the toolbar at `main`'s end. */
  function draw(data) {
    const modules = data.modules ?? []
    const rows = modules.flatMap((module) => module.rules)
    const stats = document.querySelector("[data-syntax-stats]")
    stats?.replaceChildren(
      el("ui-statistic", { value: String(modules.length), label: "modules" }),
      el("ui-statistic", { value: String(rows.filter((rule) => !rule.internal).length), label: "rule classes" }),
      el("ui-statistic", { value: String(rows.filter((rule) => rule.internal).length), label: "internal" })
    )
    const holder = document.querySelector("[data-syntax-modules]")
    const number = sectionNumber(holder.closest("ui-section"))
    holder.replaceWith(...modules.map((module, i) => moduleSection(module, number ? `${number}.${i + 1} ` : "")))
    bar = drawBar()
    wire()
    count()
  }

  /** One module:  an open `<ui-section>`, its count, its table. */
  function moduleSection({ module, rules }, prefix) {
    const internal = rules.filter((rule) => rule.internal).length
    const registered = rules.length - internal
    const badge = [
      registered ? `${registered} ${registered === 1 ? "rule" : "rules"}` : "",
      internal ? `${internal} internal` : ""
    ].filter(Boolean)
    const table = el(
      "table",
      {},
      el("thead", {}, el("tr", {}, el("th", {}, "Rule name"), el("th", {}, "Syntax"), el("th", {}, "Purpose"))),
      el("tbody", {}, ...rules.map(ruleRow))
    )
    return el(
      "ui-section",
      {
        id: `module-${slug(module)}`,
        header: `${prefix}${module}`,
        badge: badge.join(" · "),
        sticky: "",
        collapsible: "",
        dividing: ""
      },
      el(
        "ui-table",
        { id: `rules-${slug(module)}`, class: "spell-syntax-table", celled: "", compact: "", unstackable: "" },
        table
      )
    )
  }

  /** One rule class's row:  its name, syntaxes and aliases;  each example in each writer;  its purpose and wand. */
  function ruleRow(rule) {
    return el(
      "tr",
      { id: `rule-${rule.className}`, "data-rule": rule.className },
      nameCell(rule),
      syntaxCell(rule),
      purposeCell(rule)
    )
  }

  /**
   * Rule name:  the class's name, opening its source, its rule names as its tooltip;  its pencil, showing the box to
   * suggest another name;  each syntax, a bullet;  then its aliases, "aka:  `expression`".
   */
  function nameCell(rule) {
    const tip = rule.ruleNames.length ? rule.ruleNames.join(", ") : "no rule name of its own"
    const name = el(rule.file ? "a" : "span", { class: "spell-syntax-source", title: tip }, rule.className)
    if (rule.file) name.href = fileUrl(rule)
    const rename = el(
      "button",
      {
        type: "button",
        class: "spell-choice-reset spell-syntax-rename",
        title: `Suggest another name for ${rule.className}`,
        "aria-label": `Suggest another name for ${rule.className}`
      },
      el("ui-icon", { name: "pen to square" })
    )
    const nameBox = box(rule, "name", rule.className, `Class name of ${rule.className}`)
    nameBox.hidden = true
    const syntaxes = rule.syntaxes.filter((form) => form.syntax)
    const syntaxList = syntaxes.length
      ? el(
          "ul",
          { class: "spell-syntax-syntaxes" },
          ...syntaxes.map((form) => el("li", {}, el("code", {}, form.syntax)))
        )
      : rule.internal
        ? ""
        : el("p", { class: "spell-syntax-none" }, "matched by its code:  no syntax of its own")
    const aka = rule.aliases.length
      ? el(
          "p",
          { class: "spell-syntax-aka" },
          el("em", {}, "aka"),
          ":  ",
          ...rule.aliases.flatMap((alias, i) => [i ? ", " : "", el("code", {}, alias)])
        )
      : ""
    return el(
      "td",
      { class: "spell-syntax-name" },
      el("div", { class: "spell-syntax-class" }, name, rename),
      nameBox,
      syntaxList,
      aka
    )
  }

  /** Syntax:  each syntax's example, and each writer's output for it;  why there's none, where there's none. */
  function syntaxCell(rule) {
    const examples = rule.syntaxes.filter((form) => form.example)
    if (!examples.length)
      return el(
        "td",
        { class: "spell-syntax-outputs" },
        el("em", { class: "spell-syntax-none" }, rule.internal ? "no syntax of its own" : "no test to show it with yet")
      )
    return el("td", { class: "spell-syntax-outputs" }, ...examples.map((form, i) => example(rule, form, i)))
  }

  /**
   * One example:  the spell, the syntax it matches its tooltip;  then each writer's output, in a box.
   * - its boxes keyed `<Class>.js` for the first example, `<Class>.js.2` for the second ...
   */
  function example(rule, form, i) {
    const suffix = i ? `.${i + 1}` : ""
    const lines = WRITERS.map((writer) => {
      const output = form.outputs[writer]
      const value =
        "code" in output
          ? box(rule, `${writer}${suffix}`, output.code, `${writer} for ${form.example}`)
          : el("em", { class: "spell-syntax-none" }, `(${output.error})`)
      return el("li", {}, el("b", {}, writer), value)
    })
    const tip = form.syntax ? `Matches:  ${form.syntax}` : "Matched by the rule's own code"
    return el(
      "ul",
      { class: "spell-syntax-writers" },
      el("li", { class: "spell-syntax-input" }, el("b", {}, "e.g."), el("code", { title: tip }, form.example)),
      ...lines
    )
  }

  /** Purpose:  **internal** first for a class nobody registers, its one sentence, the wand. */
  function purposeCell(rule) {
    const text = el(
      "span",
      { class: "spell-syntax-purpose-text" },
      ...(rule.internal ? [el("b", {}, "internal"), " "] : []),
      ...withCode(rule.purpose || NO_PURPOSE)
    )
    const tip = `${WAND_WORDS}:  ask Claude, in a comment here`
    const wand = el("ui-button", {
      class: "spell-syntax-wand",
      circular: "",
      basic: "",
      size: "mini",
      icon: "wand magic sparkles",
      title: tip,
      "aria-label": `${WAND_WORDS}:  ${rule.className}`
    })
    wand.addEventListener("click", () => void askForDetails(rule, wand, text))
    wands.set(rule.className, wand)
    return el("td", { class: "spell-syntax-purpose" }, el("p", {}, text, " ", wand))
  }

  /**
   * A box holding `value`, keyed `<Class>.<field>`, with its round reset button.
   * - one line for the class's name (Enter adds none);  as many as the code has for a writer's output
   */
  function box(rule, field, value, label) {
    const key = `${rule.className}.${field}`
    const input = el("textarea", {
      class: "spell-choice-input",
      rows: "1",
      spellcheck: "false",
      autocomplete: "off",
      "aria-label": label,
      ...(field === "name" && { "data-one-line": "" })
    })
    input.value = value
    const reset = el(
      "button",
      { type: "button", class: "spell-choice-reset", "aria-label": "Back to what the code has", hidden: "" },
      el("ui-icon", { name: "clock rotate left" })
    )
    reset.title = `Back to ${value.split("\n")[0]}${value.includes("\n") ? " ..." : ""}`
    const holder = el("div", { class: "spell-choice-field spell-syntax-box", "data-box": key }, input, reset)
    boxes.set(key, { key, input, reset, holder, generated: value })
    return holder
  }

  /**
   * The toolbar after the last section, pinned to the window's bottom (`syntax-choices.css`, as a syntax-choices
   * page's):  feedback with Send to its right;  under them the count and the save status;  then an error or "Sent".
   */
  function drawBar() {
    const feedback = el("ui-textarea", {
      class: "spell-choices-feedback",
      name: "feedback",
      rows: "1",
      placeholder: "Feedback for Claude:  anything the boxes don't say",
      fluid: ""
    })
    const send = el(
      "ui-button",
      {
        class: "spell-choices-send",
        primary: "",
        circular: "",
        icon: "paper plane",
        title: "Send every changed box, and the feedback, to Claude"
      },
      "Send"
    )
    const saved = el("span", { class: "spell-choices-saved" })
    const error = el("ui-message", { class: "spell-choices-error", state: "negative", size: "small", hidden: "" })
    const done = el("ui-message", { class: "spell-choices-sent", state: "positive", size: "small", hidden: "" })
    document
      .querySelector("main")
      .append(
        el(
          "div",
          { id: "choices-bar", class: "spell-choices-bar" },
          el("div", { class: "spell-choices-row" }, feedback, send),
          el("div", { class: "spell-choices-meta" }, saved),
          error,
          done
        )
      )
    return { feedback, send, saved, error, done }
  }

  /** Show `message` where the tables go. */
  function notice(message) {
    const holder = document.querySelector("[data-syntax-modules]") ?? document.querySelector("main")
    holder?.prepend(
      el("ui-message", { state: "warning", header: "Rules not drawn" }, el("p", {}, ...withCode(message)))
    )
  }

  ////////////////
  // ## Expand all, Collapse all
  ////////////////

  /**
   * Expand all and Collapse all, at the right of the page toolbar:  the ivory band the runtime builds in the page
   * header once the bundle runs (`buildPageToolbar()`).
   * - added as soon as the toolbar is there, and again whenever the runtime builds it anew (a live update)
   * - each opens or folds every section and sub-section (`foldAll()`)
   * - drawn as the toolbar's section buttons:  their words go when the section titles go (`fitTitles()`)
   */
  function wireFoldAll() {
    const head = document.querySelector(".spell-page-head")
    if (!head) return
    const add = () => {
      const toolbar = head.querySelector(":scope > nav.spell-toolbar")
      if (toolbar && !toolbar.querySelector(".spell-syntax-folds")) toolbar.append(foldButtons())
    }
    // a frame after the toolbar comes:  an icon drawn while the bundle is still starting stays blank
    new MutationObserver(() => requestAnimationFrame(add)).observe(head, { childList: true })
    add()
    document.addEventListener("ui-open", keepFolds)
    document.addEventListener("ui-close", keepFolds)
  }

  /** The two buttons, in a box of their own. */
  function foldButtons() {
    const buttons = FOLD_BUTTONS.map(([isFolded, icon, label]) => {
      const button = el(
        "button",
        { type: "button", class: "spell-toolbar-item spell-syntax-fold", title: label },
        el("span", { class: "spell-toolbar-icon" }, el("ui-icon", { name: icon })),
        el("span", { class: "spell-toolbar-label" }, label)
      )
      button.addEventListener("click", () => foldAll(isFolded))
      return button
    })
    return el("div", { class: "spell-syntax-folds" }, ...buttons)
  }

  /**
   * Fold (`isFolded`) or open every section and sub-section at once, without their height animation, remembered as
   * the reader's folds (`saveFolds()`).
   * - folding them all shows the page from its top:  every title, folded, fits in a window or two
   */
  function foldAll(isFolded) {
    const main = document.querySelector("main")
    main.style.setProperty("--ui-section-duration", "0s")
    for (const section of main.querySelectorAll("ui-section[collapsible]"))
      section.toggleAttribute("collapsed", isFolded)
    saveFolds()
    if (isFolded) scrollTo({ top: 0, behavior: "instant" })
    requestAnimationFrame(() => requestAnimationFrame(() => main.style.removeProperty("--ui-section-duration")))
  }

  /**
   * The reader folded or opened one section:  remember every section's fold again, after the runtime saved that one.
   * - why:  the runtime saves the folds it knows of when the page loaded, plus that one;  it doesn't know what
   *   Expand all / Collapse all did, and a reload would undo it
   * - a `ui-open` it can't cancel is the browser's own reveal (find in page):  not the reader's, as for the runtime
   */
  function keepFolds(event) {
    const section = event.target
    if (event.defaultPrevented || !event.cancelable || section.localName !== "ui-section" || !section.id) return
    saveFolds({ [section.id]: !event.detail?.open })
  }

  /**
   * Remember every section's fold as it is now (`changing` as it's about to be), where the runtime reads them
   * when the page loads (`FOLDS_KEY`).
   */
  function saveFolds(changing = {}) {
    const folds = {}
    for (const section of document.querySelectorAll("main ui-section[collapsible][id]"))
      folds[section.id] = section.hasAttribute("collapsed")
    try {
      localStorage.setItem(FOLDS_KEY, JSON.stringify({ ...folds, ...changing }))
    } catch {
      // storage blocked (a private window):  the folds just aren't remembered
    }
  }

  ////////////////
  // ## Editing
  ////////////////

  /** Typing, resets, pencils, source links, feedback, Send, and saving as the page goes away. */
  function wire() {
    const main = document.querySelector("main")
    main.addEventListener("input", (event) => {
      const holder = event.target.closest?.(".spell-syntax-box")
      if (!holder) return
      // the class's name is one line:  a pasted line break goes
      if (event.target.hasAttribute("data-one-line") && /\n/.test(event.target.value))
        event.target.value = event.target.value.replace(/\s*\n\s*/g, " ")
      mark(boxes.get(holder.dataset.box))
      changed()
    })
    main.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && event.target.hasAttribute?.("data-one-line")) event.preventDefault()
    })
    main.addEventListener("click", (event) => {
      const rename = event.target.closest?.(".spell-syntax-rename")
      if (rename) {
        showNameBox(boxes.get(`${rename.closest("tr").dataset.rule}.name`), "toggle")
        return
      }
      const reset = event.target.closest?.(".spell-choice-reset")
      const holder = reset?.closest(".spell-syntax-box")
      if (holder) {
        const one = boxes.get(holder.dataset.box)
        one.input.value = one.generated
        mark(one)
        changed()
        one.input.focus()
        return
      }
      const link = event.target.closest?.("a.spell-syntax-source")
      // in VS Code's side bar the frame can't follow `vscode://`:  the view opens it (`DocView.open()`)
      if (link && window.parent !== window) {
        event.preventDefault()
        window.parent.postMessage({ spell: "open", url: link.href, kind: "external" }, "*")
      }
    })
    bar.feedback.addEventListener("ui-input", changed)
    bar.send.addEventListener("click", () => void send())
    addEventListener("pagehide", () => void save({ keepalive: true }))
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") void save({ keepalive: true })
    })
  }

  /**
   * Mark `one` box changed (it differs from what the code has) or not:  the box, its reset button, its row.
   * - a changed name's box stays in view
   */
  function mark(one) {
    const isChanged = isBoxChanged(one)
    one.holder.toggleAttribute("data-changed", isChanged)
    one.reset.hidden = !isChanged
    if (isChanged && one.key.endsWith(".name")) showNameBox(one, "show")
    const row = one.holder.closest("tr")
    row.toggleAttribute("data-edited", !!row.querySelector(".spell-syntax-box[data-changed]"))
  }

  /**
   * Show the class name's box, `one`, under the name (and focus it), or hide it:  its pencil's click (`toggle`), or a
   * changed name (`show`).
   * - a changed name's box never hides:  the pencil focuses it instead
   */
  function showNameBox(one, how) {
    const isShown = how === "show" || one.holder.hidden || isBoxChanged(one)
    one.holder.hidden = !isShown
    one.holder.closest("td").querySelector(".spell-syntax-rename").toggleAttribute("data-open", isShown)
    if (isShown && how === "toggle") one.input.focus()
  }

  /** Does `one` box differ from what the code has? */
  function isBoxChanged(one) {
    return one.input.value.trim() !== one.generated.trim()
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

  /**
   * The count, on Send's tooltip:  no line of its own under the bar (Owen, 2026-10-13:  "Lose the `0 boxes saved`
   * bit").
   */
  function count() {
    const changes = [...boxes.values()].filter(isBoxChanged).length
    const kept = Object.keys(orphans).length
    const rules = new Set([...boxes.values()].filter(isBoxChanged).map((one) => one.key.split(".")[0])).size
    bar.send.title =
      `Send ${changes} changed ${changes === 1 ? "box" : "boxes"}, in ${rules} ${rules === 1 ? "rule" : "rules"}` +
      (kept ? ` (and ${kept} kept for rules no longer here)` : "") +
      `, and the feedback, to Claude`
  }

  /** The boxes that differ from the code, as typed, by key;  and what was typed for rules no longer here. */
  function collect() {
    const values = { ...orphans }
    for (const one of boxes.values()) if (isBoxChanged(one)) values[one.key] = one.input.value
    return values
  }

  ////////////////
  // ## Saving and sending
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
      const { draft } = await post(CHOICES_API, "draft", { keepalive })
      setSaved(`saved ${time(draft.saved)}`)
    } catch (error) {
      isUnsaved = true
      setSaved(`can't save:  ${error.message}`, { isError: true })
    }
  }

  /** Send:  every changed box and the feedback;  show what was sent, or why not. */
  async function send() {
    clearTimeout(timer)
    bar.error.hidden = true
    bar.send.setAttribute("loading", "")
    try {
      const { answer } = await post(CHOICES_API, "answer")
      isUnsaved = false
      setSaved(`saved ${time(answer.answered)}`)
      showSent(answer)
    } catch (error) {
      showError(`Not sent:  ${error.message}`)
    } finally {
      bar.send.removeAttribute("loading")
    }
  }

  /**
   * POST the page's boxes to `/api/docs/choices/<what>`;  the route's answer.
   * - throws an `Error` saying, in Owen's words, what to do:  reload, restart the server, open it from the server
   */
  async function post(api, what, { keepalive = false } = {}) {
    return postJSON(
      `${api}/${what}`,
      { page: location.pathname, values: collect(), feedback: String(bar.feedback.value ?? "").trim() },
      { keepalive }
    )
  }

  /** POST `body` to `url` with the page server's token;  the answer, or throws saying what to do. */
  async function postJSON(url, body, { keepalive = false } = {}) {
    if (!server?.token)
      throw new Error("this page isn't on the page server:  open it with `spell dev docs open <page>`")
    const response = await fetch(url, {
      method: "POST",
      keepalive,
      headers: { "content-type": "application/json", "x-server-token": server.token },
      body: JSON.stringify(body)
    })
    const answer = await response.json().catch(() => ({}))
    if (response.ok) return answer
    if (response.status === 403 && /token/.test(answer.error ?? ""))
      throw new Error("the page server restarted since this page loaded:  reload the page (your boxes come back)")
    // no route at all:  a server started before it existed
    if (response.status === 404 && !answer.error)
      throw new Error("page server too old, restart it (`spell dev server stop`, then `spell dev server ensure`)")
    throw new Error(answer.error ?? `${response.status} ${response.statusText}`)
  }

  /** What was typed and sent before, into the boxes;  then which wands are waiting for Claude. */
  async function restore() {
    if (!server) return
    try {
      const [draft, answer] = await Promise.all([fetchJSON(`${CHOICES_API}/draft`), fetchJSON(`${CHOICES_API}/answer`)])
      const last = draft?.draft ?? answer?.answer
      if (last) {
        orphans = {}
        for (const [key, value] of Object.entries(last.values ?? {})) {
          const one = boxes.get(key)
          if (!one) {
            orphans[key] = value
            continue
          }
          one.input.value = value
          mark(one)
        }
        // a property set before the element upgrades would shadow its own
        await customElements.whenDefined("ui-textarea")
        bar.feedback.value = last.feedback ?? ""
        count()
      }
      if (draft?.draft) setSaved(`saved ${time(draft.draft.saved)}`)
      if (answer?.answer) showSent(answer.answer)
    } catch (error) {
      setSaved(`can't load what you typed:  ${error.message}`, { isError: true })
    }
    await markWands()
  }

  /** `GET url?page=<this page>`, as JSON;  `undefined` when the route says no. */
  async function fetchJSON(url) {
    const response = await fetch(`${url}?page=${encodeURIComponent(location.pathname)}`, { cache: "no-store" })
    if (response.status === 404) throw new Error("page server too old, restart it")
    return response.ok ? response.json() : undefined
  }

  /** The toolbar's quiet save status;  `isError`:  in red. */
  function setSaved(message, { isError = false } = {}) {
    bar.saved.textContent = message
    bar.saved.classList.toggle("spell-choices-failed", isError)
  }

  /** `message` in the toolbar's error box. */
  function showError(message) {
    bar.error.replaceChildren(el("p", {}, message))
    bar.error.hidden = false
  }

  /**
   * The "Sent" message for `answer`;  `isStale`:  changed since, so it says to press Send again.
   * - SIDE EFFECT:  remembers `answer` as the one sent
   */
  function showSent(answer, { isStale = false } = {}) {
    sent = answer
    const changes = Object.keys(answer.values ?? {}).length
    const again = answer.changes ? ` (sent ${answer.changes + 1} times)` : ""
    const words = isStale
      ? `Sent at ${time(answer.answered)}${again};  changed since:  press Send again to send the new ones.`
      : `Sent to Claude at ${time(answer.answered)}${again}:  ${changes} ${changes === 1 ? "box" : "boxes"}.  Change anything and press Send again to resend.`
    bar.done.setAttribute("state", isStale ? "warning" : "positive")
    bar.done.replaceChildren(el("p", {}, words))
    bar.done.hidden = false
  }

  ////////////////
  // ## The wand:  a comment asking for more details
  ////////////////

  /**
   * Ask Claude for more details on `rule`'s purpose:  a comment on its module's table, quoting `text` (the purpose),
   * so its thread shows in that cell.
   * - once per wait:  while its comment waits for Claude, a click does nothing more
   * - NEVER throws:  a failure shows in the toolbar
   */
  async function askForDetails(rule, wand, text) {
    if (wand.hasAttribute("data-asked")) return
    bar.error.hidden = true
    wand.setAttribute("loading", "")
    try {
      const table = wand.closest("ui-table")
      const section = table.closest("ui-section")
      await postJSON(COMMENTS_API, {
        page: location.pathname,
        action: "add",
        anchor: table.id,
        kind: "table",
        label: section?.getAttribute("header") ?? "",
        excerpt: squash(textOf(table)).slice(0, EXCERPT_LENGTH).trim(),
        quote: squash(textOf(text)),
        offset: offsetOf(table, text),
        text: `${WAND_WORDS}:  \`${rule.className}\`.`
      })
      showAsked(rule.className, true)
    } catch (error) {
      showError(`Not asked:  ${error.message}`)
    } finally {
      wand.removeAttribute("loading")
    }
  }

  /** Mark the wands whose comment is waiting for Claude:  this page's comments, as the server has them. */
  async function markWands() {
    try {
      const answer = await fetchJSON(COMMENTS_API)
      const asked = new Set()
      for (const comment of answer?.comments ?? []) {
        const className = new RegExp(`^${WAND_WORDS}:  \`([^\`]+)\``).exec(comment.text ?? "")?.[1]
        if (className && comment.turn === "claude") asked.add(className)
      }
      for (const className of wands.keys()) showAsked(className, asked.has(className))
    } catch {
      // the comments routes aren't there:  the wands just stay as they are
    }
  }

  /** Show `className`'s wand as asked (blue:  Claude has it to do) or not. */
  function showAsked(className, isAsked) {
    const wand = wands.get(className)
    if (!wand) return
    wand.toggleAttribute("data-asked", isAsked)
    wand.toggleAttribute("primary", isAsked)
    wand.toggleAttribute("basic", !isAsked)
    wand.title = isAsked
      ? "Asked Claude for more details:  the thread is below"
      : `${WAND_WORDS}:  ask Claude, in a comment here`
  }

  /**
   * `block`'s text as a comment reads it (`BlockAnchors.js` `textOf()`):  its text nodes, a space after each
   * element's, the runtime's own additions left out.
   */
  function textOf(block) {
    return runsOf(block)
      .map((run) => run.text)
      .join("")
  }

  /** Where `node` starts in `block`'s squashed text, in characters (`BlockAnchors.js` `offsetIn()`). */
  function offsetOf(block, node) {
    let before = ""
    for (const run of runsOf(block)) {
      if (run.node === node) return squash(`${before}x`).length - 1
      before += run.text
    }
    return 0
  }

  /** `block`'s text runs, in order:  `{ node, text }`;  `node` is set on each element's first run. */
  function runsOf(block) {
    const runs = []
    const walk = (node) => {
      if (node.nodeType === 3) return runs.push({ node: null, text: node.textContent })
      if (node.nodeType !== 1 || (node !== block && node.matches("[data-spell-added]"))) return
      runs.push({ node, text: "" })
      for (const child of node.childNodes) walk(child)
      runs.push({ node: null, text: " " })
    }
    walk(block)
    return runs
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** `rule`'s file at its line, for VS Code:  `vscode://file/<checkout>/<file>:<line>`;  `#` off the page server. */
  function fileUrl(rule) {
    const root = server?.root
    if (!root) return "#"
    const worktree = location.pathname.match(/^\/worktrees\/([^/]+)\//)?.[1]
    const checkout = worktree ? `${root}/.claude/worktrees/${worktree}` : root
    return `vscode://file${encodeURI(`${checkout}/${rule.file}`)}:${rule.line}`
  }

  /** `section`'s number, from its header (`2. The rules` => `2`);  none:  `""`. */
  function sectionNumber(section) {
    return /^\s*(\d+(?:\.\d+)*)\.?\s/.exec(section?.getAttribute("header") ?? "")?.[1] ?? ""
  }

  /** `text` as nodes:  its `` `code` `` spans as `<code>`, the rest as text. */
  function withCode(text) {
    return String(text)
      .split("`")
      .map((part, i) => (i % 2 ? el("code", {}, part) : part))
      .filter((part) => part !== "")
  }

  /** `text` as an id's part:  lower-kebab-case. */
  function slug(text) {
    return String(text)
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/[^A-Za-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase()
  }

  /** `text` with runs of white space as one space, trimmed. */
  function squash(text) {
    return String(text ?? "")
      .replace(/\s+/g, " ")
      .trim()
  }

  /** `iso`'s time of day, `12:04`. */
  function time(iso) {
    return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
  }

  /** A new `tag` with `attributes`, holding `children` (nodes or text;  `""` skipped). */
  function el(tag, attributes = {}, ...children) {
    const node = document.createElement(tag)
    for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value)
    node.append(...children.filter((child) => child !== ""))
    return node
  }
})()
