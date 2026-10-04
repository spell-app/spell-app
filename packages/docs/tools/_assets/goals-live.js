/*
 * Live goals pages:  buttons to add thoughts and to start Claude sessions.
 * Loaded after `spell-ui.js` by every goals page (`goals/**`, `templates/goals/**`).  Rules:  `goals/AGENTS.md`.
 * - Served by the page server (`yarn goals open`, `yarn server`) with goals' route module
 *   (`packages/docs/tools/goals/goalsRoutes.ts`), a page has `window.GOALS_SERVER` (`{ api }`) and the server's own
 *   `window.SPELL_SERVER` (`{ token, ... }`):
 *   - thoughts save through `POST <api>/thought`;  Claude sessions start through `POST <api>/run`, in a terminal
 *   - writes carry the server's token (`x-server-token`)
 *   - live reload is the page server's (`/_server/live.js`), not ours
 * - Opened from disk (`file://`):  the same buttons explain how to start the server, and link to the page on it.
 * - Classic script, no imports:  `file://` pages can't load modules.  `window.SpellUI.UI` is the bundle's `UI`.
 * - The buttons follow the docs' rule:  pills with an icon and text, or circles with an icon, an `aria-label` and a
 *   `<ui-popup>` tooltip right after.
 */
;(function () {
  /** goals' routes on this server, when it has them:  `{ api, token }` */
  const SERVER =
    window.GOALS_SERVER && window.SPELL_SERVER
      ? { ...window.GOALS_SERVER, token: window.SPELL_SERVER.token }
      : undefined
  const body = document.body
  const SET = body.dataset.set
  const TOPIC = body.dataset.topic
  /** This page's target:  `spell/motivation`, or `spell` on a set's contents page. */
  const BASE = SET ? (TOPIC ? `${SET}/${TOPIC}` : SET) : ""
  /** What the page calls itself in messages. */
  const NAME = BASE || "the goals home page"
  const DEFAULT_PORT = 4747

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true })
  else start()

  ////////////////
  // ## Start
  ////////////////

  /** Wire the page:  the buttons, once the runtime has built the contents. */
  function start() {
    if (!SET) return
    addHeadingTools()
    addItemTools()
    whenPresent(".spell-toc-head", addSidebarTools)
  }

  /** Run `fn(element)` once `selector` exists:  the runtime builds the contents sidebar after load. */
  function whenPresent(selector, fn, tries = 40) {
    const found = document.querySelector(selector)
    if (found) return fn(found)
    if (tries > 0) setTimeout(() => whenPresent(selector, fn, tries - 1), 50)
  }

  ////////////////
  // ## Buttons
  ////////////////

  /**
   * The contents sidebar's goals buttons:  Talk, Thought and Update under its head, and a round VS Code button
   * beside its own.
   * - Update shows how many thoughts wait on the page
   */
  function addSidebarTools(head) {
    const waiting = document.querySelectorAll('li.goals-thought[data-status="new"]').length
    const tools = document.createElement("div")
    tools.className = "goals-toc-tools"
    tools.innerHTML =
      pill("talk", "comments", "Talk", `Talk ${NAME} through with Claude:  /goals ${BASE}`, true) +
      pill("thought", "comment dots", "Thought", `Jot a thought about ${NAME}, for Claude to digest later`) +
      pill(
        "update",
        "wand magic sparkles",
        waiting ? `Update <span class="goals-count">${waiting}</span>` : "Update",
        `Have Claude work the new thoughts into ${NAME}:  /goals-update ${BASE}`
      )
    head.after(tools)
    // VS Code is a round tool, beside expand / collapse / code
    head
      .querySelector(".spell-toc-tools")
      ?.insertAdjacentHTML(
        "beforeend",
        `<span class="goals-tool-gap"></span>` +
          circle("vscode", "up right from square", "Open in VS Code", "Show this page in VS Code, beside your code")
      )
    head.addEventListener("click", (event) => {
      if (event.target.closest('[data-goals="vscode"]')) void openVSCode(BASE)
    })
    tools.addEventListener("click", (event) => {
      const button = event.target.closest("[data-goals]")
      if (!button) return
      const action = button.dataset.goals
      if (action === "talk") return run("goals", BASE)
      if (action === "thought") return openThought(BASE, NAME)
      if (action === "update") return run("goals-update", BASE)
    })
  }

  /**
   * A thought bubble and a talk button on every section heading (`h2`, and the goal horizons' `h3`s), shown on
   * hover or focus.
   */
  function addHeadingTools() {
    for (const heading of document.querySelectorAll(
      "main ui-sticky.spell-h2 > h2[id], main ui-sticky.spell-h3 > h3[id]"
    )) {
      if (heading.id === "history") continue
      const label = heading.textContent.replace(/^\s*\d+\.\s*/, "").trim()
      const target = `${BASE}/${heading.id}`
      const tools = document.createElement("span")
      tools.className = "goals-heading-tools"
      tools.innerHTML =
        circle("thought", "comment dots", `Add a thought about ${label}`, `Add a thought about ${label}`) +
        circle("talk", "comments", `Talk ${label} through`, `Talk ${label} through with Claude`)
      tools.addEventListener("click", (event) => {
        const button = event.target.closest("[data-goals]")
        if (!button) return
        event.preventDefault()
        event.stopPropagation()
        if (button.dataset.goals === "thought") openThought(target, label)
        else void run("goals", target)
      })
      heading.append(tools)
    }
  }

  /** A thought bubble and a talk button on every item (`G1`, `Q3` ...), shown on hover or focus. */
  function addItemTools() {
    for (const item of document.querySelectorAll("ol.plan-items > li[id]")) {
      const id = item.id.toUpperCase()
      const title = item.querySelector(".plan-title")?.textContent.trim() ?? ""
      const label = `${id} · ${title}`
      const target = `${BASE}/${id}`
      const tools = document.createElement("span")
      tools.className = "goals-item-tools"
      tools.innerHTML =
        circle("thought", "comment dots", `Add a thought about ${id}`, `Add a thought about ${id}`) +
        circle("talk", "comments", `Talk ${id} through`, `Talk ${id} through with Claude:  /goals ${target}`)
      tools.addEventListener("click", (event) => {
        const button = event.target.closest("[data-goals]")
        if (!button) return
        if (button.dataset.goals === "thought") openThought(target, label)
        else void run("goals", target)
      })
      // after the item's line (title, tag, note), before its thoughts and folded details
      const after = item.querySelector(":scope > ul.goals-thoughts, :scope > ui-accordion")
      if (after) after.before(tools)
      else item.append(tools)
    }
  }

  /** A pill button:  icon and text, with a tooltip. */
  function pill(action, icon, text, tip, primary = false) {
    return (
      `<ui-button data-goals="${action}" circular size="tiny" ${primary ? "primary" : "basic"} icon="${icon}">${text}</ui-button>` +
      tooltip(tip)
    )
  }

  /** A round, icon-only button, with an `aria-label` and a tooltip. */
  function circle(action, icon, label, tip) {
    return (
      `<ui-button data-goals="${action}" circular basic size="mini" icon="${icon}" aria-label="${escape(label)}"></ui-button>` +
      tooltip(tip)
    )
  }

  /** A tooltip for the element before it. */
  function tooltip(text) {
    return `<ui-popup inverted size="mini" position="bottom center" content="${escape(text)}"></ui-popup>`
  }

  ////////////////
  // ## Thoughts
  ////////////////

  /** Ask for a thought about `target` (`label` for the reader), then save it. */
  function openThought(target, label) {
    if (!SERVER) return openNoServer()
    const modal = thoughtModal()
    modal.querySelector(".goals-modal-about").innerHTML =
      `About <b>${escape(label)}</b>, on <code>${escape(target.split("/").slice(0, 2).join("/"))}</code>`
    const field = modal.querySelector("textarea")
    field.value = ""
    modal.dataset.target = target
    show(modal)
    setTimeout(() => field.focus(), 60)
  }

  /** The thought dialog, made once. */
  function thoughtModal() {
    let modal = document.getElementById("goals-thought-modal")
    if (modal) return modal
    modal = element(`<ui-modal id="goals-thought-modal" size="small" closable>
  <ui-header><ui-icon name="comment dots"></ui-icon> Add a thought</ui-header>
  <ui-content>
    <p class="goals-modal-about"></p>
    <textarea class="goals-textarea" rows="6" aria-label="Your thought"
      placeholder="Anything:  a hunch, a correction, a story, a link.  Claude works these in with /goals-update."></textarea>
    <p class="goals-modal-hint">⌘ Enter saves.  Saved thoughts appear on the page, marked new.</p>
  </ui-content>
  <ui-actions>
    <ui-button class="deny" circular basic icon="xmark">Cancel</ui-button>
    <ui-button class="goals-save" circular primary icon="paper plane">Save thought</ui-button>
  </ui-actions>
</ui-modal>`)
    const field = modal.querySelector("textarea")
    const save = modal.querySelector(".goals-save")
    const submit = async () => {
      const text = field.value.trim()
      if (!text) return field.focus()
      save.setAttribute("loading", "")
      try {
        const answer = await post(`${SERVER.api}/thought`, { target: modal.dataset.target, text })
        hide(modal)
        toast("Thought saved", `${answer.target} · ${answer.id}:  the page reloads with it.`, "success")
      } catch (error) {
        toast("Couldn't save the thought", error.message, "error")
      } finally {
        save.removeAttribute("loading")
      }
    }
    save.addEventListener("click", submit)
    field.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) void submit()
    })
    document.body.append(modal)
    return modal
  }

  ////////////////
  // ## Claude
  ////////////////

  /**
   * Start Claude Code on `/<skill> <target>`, in a terminal window, through the server.
   * - not installed or not logged in:  the setup dialog, which retries once Claude is ready
   */
  async function run(skill, target) {
    if (!SERVER) return openNoServer(`/${skill} ${target}`)
    try {
      const answer = await post(`${SERVER.api}/run`, { skill, target }, [409])
      if (answer.needs) return openSetup(answer.needs, () => run(skill, target))
      toast("Claude is starting", `In ${answer.how}:  /${skill} ${target}`, "success")
    } catch (error) {
      if (error.command) return openCommand(`Run this in a terminal`, error.message, error.command)
      toast("Couldn't start Claude", error.message, "error")
    }
  }

  /**
   * The Claude setup dialog:  what Claude Code is, then the step that's missing (`install` or `login`), with
   * buttons;  "Check again" runs `retry` once Claude is ready.
   */
  function openSetup(needs, retry) {
    const modal = setupModal()
    modal.retry = retry
    stepTo(modal, needs)
    show(modal)
  }

  /** The setup dialog, made once. */
  function setupModal() {
    let modal = document.getElementById("goals-claude-modal")
    if (modal) return modal
    modal = element(`<ui-modal id="goals-claude-modal" size="small" closable>
  <ui-header><ui-icon name="wand magic sparkles"></ui-icon> Set up Claude</ui-header>
  <ui-content>
    <p>Talking a topic through runs <b>Claude Code</b>, Anthropic's assistant for working in a project, in a terminal
      window.  It reads these pages, asks you questions, and writes your answers back here.  Two steps, once:</p>
    <ui-steps class="goals-setup-steps" vertical ordered size="mini">
      <ui-step data-step="install" header="Install Claude Code"
        description="One command in a terminal.  Needs a Claude subscription or an Anthropic API account."></ui-step>
      <ui-step data-step="login" header="Log in"
        description="Opens your browser to sign in to your Claude account."></ui-step>
      <ui-step data-step="talk" header="Talk"
        description="Back here:  every speech-bubble button starts a session."></ui-step>
    </ui-steps>
    <div class="goals-setup goals-setup-install">
      <pre><code>curl -fsSL https://claude.ai/install.sh | bash</code></pre>
      <div class="goals-setup-buttons">
        <ui-button class="goals-copy" circular basic size="small" icon="copy">Copy command</ui-button>
        <ui-button circular basic size="small" icon="up right from square"
          href="https://docs.claude.com/en/docs/claude-code/setup" target="ext-claude-code-setup">Install guide</ui-button>
      </div>
    </div>
    <div class="goals-setup goals-setup-login">
      <div class="goals-setup-buttons">
        <ui-button class="goals-login" circular primary size="small" icon="right to bracket">Log in, in a terminal</ui-button>
      </div>
      <p class="goals-modal-hint">Runs <code>claude auth login</code>.  Finish in your browser, then come back and check again.</p>
    </div>
  </ui-content>
  <ui-actions>
    <ui-button class="deny" circular basic icon="xmark">Later</ui-button>
    <ui-button class="goals-recheck" circular primary icon="arrows rotate">Check again</ui-button>
  </ui-actions>
</ui-modal>`)
    modal
      .querySelector(".goals-copy")
      .addEventListener("click", () => copy(modal.querySelector(".goals-setup-install code").textContent))
    modal.querySelector(".goals-login").addEventListener("click", async () => {
      try {
        const answer = await post(`${SERVER.api}/claude/login`, {})
        toast("Logging in", `Finish in ${answer.how} and your browser, then press Check again.`, "info")
      } catch (error) {
        if (error.command) return openCommand("Log in from a terminal", error.message, error.command)
        toast("Couldn't start the login", error.message, "error")
      }
    })
    modal.querySelector(".goals-recheck").addEventListener("click", async (event) => {
      const button = event.currentTarget
      button.setAttribute("loading", "")
      try {
        const status = await (await fetch(`${SERVER.api}/claude`)).json()
        if (!status.installed) return stepTo(modal, "install")
        if (!status.loggedIn) return stepTo(modal, "login")
        stepTo(modal, "talk")
        hide(modal)
        modal.retry?.()
      } finally {
        button.removeAttribute("loading")
      }
    })
    document.body.append(modal)
    return modal
  }

  /** Show the setup step `name` (`install`, `login` or `talk`):  earlier steps done, its own buttons shown. */
  function stepTo(modal, name) {
    const order = ["install", "login", "talk"]
    for (const step of modal.querySelectorAll("ui-step")) {
      const at = order.indexOf(step.dataset.step)
      step.toggleAttribute("completed", at < order.indexOf(name))
      step.toggleAttribute("selected", at === order.indexOf(name))
    }
    for (const part of modal.querySelectorAll(".goals-setup"))
      part.hidden = !part.classList.contains(`goals-setup-${name}`)
  }

  ////////////////
  // ## VS Code, no server, plain commands
  ////////////////

  /** Show `target` in VS Code's Simple Browser, beside the editor. */
  async function openVSCode(target) {
    if (!SERVER) return openNoServer(`yarn goals open-vs ${target}`)
    try {
      await post(`${SERVER.api}/open-vscode`, { target })
      toast("Opening in VS Code", "Beside your editor, in Simple Browser.", "success")
    } catch (error) {
      toast("Couldn't open VS Code", error.message, "error")
    }
  }

  /**
   * The page came from disk, so nothing can be saved or started:  how to start the server, and a link to this
   * page on it (if it's running).
   */
  function openNoServer(what) {
    const command = `yarn goals open ${BASE}`
    const modal = commandModal()
    modal.querySelector("ui-header").textContent = "Start the page server"
    modal.querySelector(".goals-modal-about").innerHTML =
      `${what ? `<code>${escape(what)}</code> needs` : "Thoughts and Claude sessions need"} the page server:  a small ` +
      `local web server that saves to these pages and starts Claude for you.  Start it from the project:`
    modal.querySelector("code.goals-command").textContent = command
    const link = modal.querySelector(".goals-served")
    const served = servedURL()
    link.hidden = !served
    if (served) link.setAttribute("href", served)
    show(modal)
  }

  /** A command to run by hand:  `title`, why, and the command with a copy button. */
  function openCommand(title, why, command) {
    const modal = commandModal()
    modal.querySelector("ui-header").textContent = title
    modal.querySelector(".goals-modal-about").textContent = why
    modal.querySelector("code.goals-command").textContent = command
    modal.querySelector(".goals-served").hidden = true
    show(modal)
  }

  /** The command dialog, made once. */
  function commandModal() {
    let modal = document.getElementById("goals-command-modal")
    if (modal) return modal
    modal = element(`<ui-modal id="goals-command-modal" size="small" closable>
  <ui-header>Run a command</ui-header>
  <ui-content>
    <p class="goals-modal-about"></p>
    <pre><code class="goals-command"></code></pre>
    <div class="goals-setup-buttons">
      <ui-button class="goals-copy" circular basic size="small" icon="copy">Copy command</ui-button>
      <ui-button class="goals-served" circular basic size="small" icon="up right from square" target="_self"
        >Open this page from the server</ui-button>
    </div>
  </ui-content>
  <ui-actions><ui-button class="approve" circular primary icon="check">OK</ui-button></ui-actions>
</ui-modal>`)
    modal
      .querySelector(".goals-copy")
      .addEventListener("click", () => copy(modal.querySelector("code.goals-command").textContent))
    document.body.append(modal)
    return modal
  }

  /**
   * This page's URL on a page server at the default port (its real port is in `.spell-server.json`, which a
   * `file://` page can't read), worked out from where the docs' assets are:  the project root is the folder above
   * `packages/docs/tools/_assets/`.
   */
  function servedURL() {
    const sheet = document.querySelector('link[href$="_assets/spell-doc.css"]')
    if (!sheet || location.protocol !== "file:") return ""
    const assets = new URL(sheet.getAttribute("href"), location.href).pathname
    const root = assets.replace(/packages\/docs\/_assets\/spell-doc\.css$/, "")
    if (root === assets || !location.pathname.startsWith(root)) return ""
    return `http://127.0.0.1:${DEFAULT_PORT}/${location.pathname.slice(root.length)}${location.hash}`
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** POST `data` as JSON to the server;  resolves to its answer, or rejects with its error (`command` attached). */
  async function post(path, data, okStatuses = []) {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Server-Token": SERVER.token },
      body: JSON.stringify(data)
    })
    const answer = await response.json().catch(() => ({}))
    // a server restarted since:  its new token comes with a reload
    if (response.status === 403 && /token/.test(answer.error ?? "")) location.reload()
    if (response.ok || okStatuses.includes(response.status)) return answer
    const error = new Error(answer.error ?? `${response.status} ${response.statusText}`)
    error.command = answer.command
    throw error
  }

  /** Show / hide a `<ui-modal>`. */
  function show(modal) {
    modal.setAttribute("open", "")
  }
  function hide(modal) {
    modal.removeAttribute("open")
  }

  /** A toast, through `UI.toast()`;  the console if toasts aren't there. */
  function toast(title, message, type) {
    try {
      window.SpellUI.UI.toast({ title, message, type, position: "bottom right", displayTime: 4000, showIcon: true })
    } catch {
      console.info(`${title}:  ${message}`)
    }
  }

  /** Copy `text`, and say so. */
  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text)
      toast("Copied", text, "success")
    } catch {
      toast("Couldn't copy", "Select the command and copy it yourself.", "warning")
    }
  }

  /** One element from HTML. */
  function element(html) {
    const template = document.createElement("template")
    template.innerHTML = html.trim()
    return template.content.firstElementChild
  }

  /** Escape for HTML text and attributes. */
  function escape(text) {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
  }
})()
