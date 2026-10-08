/**
 * Details pages:  turns the questions Claude wrote into a form Owen answers ON the page, and sends the answer back
 * through the page server, which wakes the waiting session (`spell dev details wait`).
 * - A classic script, loaded BEFORE `spell-ui.js`:  it only builds markup, so every `ui-*` it makes is upgraded
 *   with the rest of the page.
 * - Builds, from `ui-section.spell-question` > `.spell-option[data-option][data-title]`:
 *   - one `ui-segment` card per option:  a `ui-radio` (or `ui-checkbox` under `data-multiple`) labelled
 *     `A · title`, ticked to start with under `data-checked`, a Recommended label (`data-recommended`), the
 *     one-line summary, and its
 *     `.spell-option-details` folded in a `ui-accordion`
 *   - an "Other" box per question;  a comment box under every other section with no sections inside it
 *   - Send in the sticky page header, with where the answer stands ("Not sent", "Sent 10/8/26 14:34 · 5 of 17
 *     decided", "Changes not sent");  a notes box at the page's end
 * - Answer:  `POST /api/details/answer` (`tools/detailsRoutes.ts`) writes `<slug>.answer.json` beside the page;
 *   on load, `GET` reads it back into the page.
 * - NEVER locks (Owen, 2026-10-08):  a partial answer is fine, everything stays editable, and every Send sends the
 *   whole page again (the route marks what changed since the send before).
 * - Opened from disk, or a server without the route:  Send says to answer in chat instead.
 */
;(function details() {
  /** Where the answer goes. */
  const API = "/api/details/answer"

  /** Every question section, in page order. */
  const questions = [...document.querySelectorAll("ui-section.spell-question")]
  if (!questions.length) return
  /** How tall an option's text shows before "Show more", in px. */
  const CLAMP = 150

  for (const question of questions) buildQuestion(question)
  // controls report `selected` only once drawn:  a frame after their definition
  void Promise.all(["ui-radio", "ui-checkbox"].map((tag) => customElements.whenDefined(tag))).then(() =>
    requestAnimationFrame(() => questions.forEach(markState))
  )
  buildComments()
  const send = buildSend()
  void clampCards()
  const status = document.querySelector("[data-details-status]")
  /** The page as last sent (`snapshot()`), to tell "Changes not sent";  `null` before the first send. */
  let sentSnapshot = null
  /** The answer as last sent, for the header's line. */
  let sentAnswer = null
  for (const type of ["click", "ui-change", "input", "keyup"])
    document.addEventListener(type, () => queueMicrotask(refresh))
  refresh()
  void loadAnswer()

  ////////////////
  // ## Building
  ////////////////

  /**
   * Turn `question`'s `.spell-option`s into cards, then add its "Other" box.
   * - `data-select-all`:  "Select all" / "Select none" buttons in its title (the shown cards only)
   * - `data-filter`:  an "Open | All" toggle in its title;  Open (the default) hides cards marked `data-done`
   */
  function buildQuestion(question) {
    const multiple = question.hasAttribute("data-multiple")
    const cards = [...question.querySelectorAll(":scope > .spell-option")].map((option) => {
      const card = buildOption(question.id, option, multiple)
      option.replaceWith(card)
      return card
    })
    const tools = el("span", { slot: "actions", class: "spell-question-tools" })
    if (multiple && question.hasAttribute("data-select-all")) tools.append(buildSelectAll(question, cards))
    if (question.hasAttribute("data-filter")) tools.append(buildFilter(question, cards))
    if (tools.childElementCount) question.append(tools)
    if (question.hasAttribute("data-more")) wireMore(question, cards)
    // a textarea that grows as it's typed in (`details.css`):  every "tell me more" box (Owen, 2026-10-06)
    const other = el("ui-textarea", {
      class: "spell-other",
      name: `${question.id}-other`,
      rows: "1",
      placeholder: multiple ? "Other:  add your own" : "Other:  your own answer",
      fluid: ""
    })
    question.append(other)
    markState(question)
    for (const type of ["click", "ui-change", "input"])
      question.addEventListener(type, () => queueMicrotask(() => markState(question)))
  }

  /**
   * `question`'s state, as `data-state` on it and on its rail entry (the runtime copies it when it builds the rail):
   * - `working` (orange):  Claude has more to do:  "Provide more details" asked on a card, or only Other written
   * - `done` (green):  a card picked
   * - `attention` (red):  nothing yet
   */
  function markState(question) {
    const picked = [...question.querySelectorAll("ui-radio, ui-checkbox")].some((control) => control.selected)
    const other = String(question.querySelector(".spell-other")?.value ?? "").trim()
    const more = question.querySelector(".spell-option-card[data-more]")
    const state = more || (other && !picked) ? "working" : picked ? "done" : "attention"
    question.dataset.state = state
    document.querySelector(`nav.spell-rail [data-rail="${CSS.escape(question.id)}"]`)?.setAttribute("data-state", state)
  }

  /**
   * ONE button that ticks every shown card ("Select all"), or, once they all are, unticks them ("Select none");
   * its label follows the ticks as they change.
   */
  function buildSelectAll(question, cards) {
    const button = el("ui-button", { size: "mini", basic: "", circular: "" })
    button.addEventListener("click", () => {
      const all = shownControls(cards).every((control) => control.selected)
      for (const control of shownControls(cards)) control.selected = !all
      relabel()
    })
    // a tick, a filter change:  the label follows (after the control has flipped)
    question.addEventListener("click", () => queueMicrotask(relabel))
    question.addEventListener("ui-change", () => queueMicrotask(relabel))
    // boxes report `selected` only once drawn:  a frame after their definition
    void customElements.whenDefined("ui-checkbox").then(() => requestAnimationFrame(relabel))
    relabel()
    return button

    /** "Select none" while every shown card is ticked, else "Select all". */
    function relabel() {
      const controls = shownControls(cards)
      button.textContent =
        controls.length && controls.every((control) => control.selected) ? "Select none" : "Select all"
    }
  }

  /** The tick boxes of `cards` the filter shows, not locked. */
  function shownControls(cards) {
    return cards
      .filter((card) => !card.hidden)
      .map((card) => card.querySelector("ui-checkbox, ui-radio"))
      .filter((control) => control && !control.hasAttribute("disabled"))
  }

  /**
   * "Provide more details" on each card (`data-more` on the question):  a (?) at the card's top right.  Pressed:  the
   * card is ticked too, and the answer carries its letter under `<question id>-more` (`collect()`), so Claude
   * explains that one in full before asking.
   * - its own answer key, not a new field:  the page server's route takes `{ picked }` per key as it is
   */
  function wireMore(question, cards) {
    for (const card of cards) {
      // just the icon:  no border, grey, blue while on (`details.css`)
      const button = el(
        "button",
        { type: "button", class: "spell-more-details", "aria-label": "Provide more details", "aria-pressed": "false" },
        el("ui-icon", { name: "circle question" })
      )
      const tip = el("ui-popup", { inverted: "", size: "mini", content: "Provide more details" })
      button.addEventListener("click", () => {
        if (button.disabled) return
        const on = !card.hasAttribute("data-more")
        card.toggleAttribute("data-more", on)
        button.toggleAttribute("active", on)
        button.setAttribute("aria-pressed", String(on))
        const control = card.querySelector("ui-checkbox, ui-radio")
        if (on && control) control.selected = true
      })
      // under the tick box, above the state icon
      card.querySelector(".spell-option-side > :is(ui-checkbox, ui-radio)").after(button, tip)
    }
  }

  /** "Open | All" for `question`'s `cards`:  Open hides the `data-done` ones;  returns the button group. */
  function buildFilter(question, cards) {
    const group = el("ui-buttons", { size: "mini", basic: "" })
    const buttons = ["open", "all"].map((show) => {
      const button = el("ui-button", { "data-show": show }, show === "open" ? "Open" : "All")
      button.addEventListener("click", () => apply(show))
      group.append(button)
      return button
    })
    apply("open")
    return group

    /** Show `show`'s cards, that button pressed. */
    function apply(show) {
      for (const card of cards) card.hidden = show === "open" && card.hasAttribute("data-done")
      for (const button of buttons) button.toggleAttribute("active", button.dataset.show === show)
    }
  }

  /**
   * Clamp each card's text to `CLAMP` px, with "Show more" / "Show less" at its bottom left, once the page has
   * drawn (heights are only known then).
   */
  async function clampCards() {
    await Promise.all(["ui-segment", "ui-checkbox", "ui-radio"].map((tag) => customElements.whenDefined(tag)))
    await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)))
    for (const summary of document.querySelectorAll(".spell-option-summary")) {
      if (summary.scrollHeight <= CLAMP + 24) continue
      summary.classList.add("spell-clamped")
      const toggle = el("button", { type: "button", class: "spell-show-more" }, "Show more")
      toggle.addEventListener("click", () => {
        const open = summary.classList.toggle("spell-clamped")
        toggle.textContent = open ? "Show more" : "Show less"
      })
      summary.after(toggle)
    }
  }

  /**
   * A card for `option` of question `id`, in two columns:
   * - left (`.spell-option-side`):  the control, then (`wireMore()`) the "more details" button, then the state icon
   *   (`data-state-icon`, `-color`, `-label`)
   * - right (`.spell-option-main`):  `A · title` on its own line (a click on it is the control's), the Recommended
   *   label or a text badge (`data-badge`) beside it, then the summary and the folded details
   * - why two columns:  a title inside the control's label wrapped raggedly under the box
   */
  function buildOption(id, option, multiple) {
    const letter = option.dataset.option
    const title = option.dataset.title ?? ""
    const card = el("ui-segment", { class: "spell-option-card", "data-option": letter, "data-title": title })
    const control = el(multiple ? "ui-checkbox" : "ui-radio", {
      name: id,
      value: letter,
      "aria-label": `${letter} · ${title}`
    })
    // ticked to start with (`data-checked`):  `/epic review`'s item picker ticks what isn't reviewed yet
    if (option.hasAttribute("data-checked")) control.setAttribute("checked", "")
    const side = el("div", { class: "spell-option-side" }, control)
    if (option.dataset.stateIcon) {
      const label = option.dataset.stateLabel ?? ""
      const color = option.dataset.stateColor ?? "grey"
      const icon = el("ui-icon", {
        class: "spell-option-state",
        name: option.dataset.stateIcon,
        color,
        "aria-label": label
      })
      side.append(icon, el("ui-popup", { inverted: "", size: "mini", content: label }))
    }
    const name = el("div", { class: "spell-option-name" }, el("b", {}, letter), ` · ${title}`)
    name.addEventListener("click", () => {
      if (control.hasAttribute("disabled")) return
      control.selected = multiple ? !control.selected : true
    })
    const heading = el("div", { class: "spell-option-heading" }, name)
    if (option.hasAttribute("data-recommended")) {
      card.setAttribute("data-recommended", "")
      heading.append(el("ui-label", { size: "mini", color: "green", icon: "thumbs up" }, "Recommended"))
    }
    if (option.dataset.badge) {
      const color = option.dataset.badgeColor ?? "grey"
      heading.append(el("ui-label", { size: "mini", color, basic: "" }, option.dataset.badge))
    }
    // hidden under the question's "Open" (`data-filter`)
    if (option.hasAttribute("data-done")) card.setAttribute("data-done", "")
    const more = option.querySelector(":scope > .spell-option-details")
    const summary = el("div", { class: "spell-option-summary" }, ...[...option.childNodes].filter((n) => n !== more))
    const main = el("div", { class: "spell-option-main" }, heading, summary)
    // the fold only when it holds something, titled for what it holds (`data-title`), never "More on A"
    if (more?.textContent.trim()) {
      const fold = el("ui-accordion", { class: "spell-aside spell-option-more", styled: "" })
      fold.append(el("ui-title", {}, more.dataset.title ?? "Details"), el("ui-content", {}, ...more.childNodes))
      main.append(fold)
    }
    // the grid in a wrapper:  the segment slots its children, so it can't lay them out itself
    card.append(el("div", { class: "spell-option-grid" }, side, main))
    return card
  }

  /**
   * A comment box at the end of every section that isn't a question and holds no section itself (`1.2 What exists
   * today`, not `1. Context`, whose sub-sections each have one).  Sent as `comments`, by section id.
   */
  function buildComments() {
    for (const section of document.querySelectorAll("ui-section[id]:not(.spell-question)")) {
      if (section.querySelector("ui-section") || section.closest(".spell-question")) continue
      section.append(
        el("ui-textarea", {
          class: "spell-comment",
          name: `comment-${section.id}`,
          "data-section": section.id,
          rows: "1",
          placeholder: "Comment on this section",
          fluid: ""
        })
      )
    }
  }

  /**
   * Send, in the sticky page header (`.spell-page-head`, right of the title):  where the answer stands, then a round
   * blue Send;  an error, when there is one, on its own line under them.  The notes box goes after the last question.
   */
  function buildSend() {
    const head = document.querySelector(".spell-page-head") ?? document.querySelector("h1").parentElement
    const state = el("span", { class: "spell-send-state" })
    const button = el("ui-button", {
      class: "spell-send",
      primary: "",
      circular: "",
      icon: "paper plane",
      "aria-label": "Send"
    })
    const tip = el("ui-popup", {
      inverted: "",
      size: "mini",
      content: "Send what's on the page:  a partial answer is fine, send again any time"
    })
    const error = el("ui-message", { class: "spell-send-error", state: "negative", size: "small", hidden: "" })
    head.append(el("div", { class: "spell-send-head" }, state, button, tip), error)
    const notes = el("ui-textarea", {
      class: "spell-notes",
      name: "notes",
      rows: "2",
      placeholder: "Notes for Claude:  anything, any time",
      fluid: ""
    })
    questions.at(-1).after(el("div", { id: "notes", class: "spell-notes-block" }, notes))
    button.addEventListener("click", () => void submit())
    return { button, state, error, notes }
  }

  ////////////////
  // ## Answering
  ////////////////

  /** Send the whole page;  it stays as it is, editable. */
  async function submit() {
    const { answers, comments, notes } = gather()
    const empty = Object.values(answers).every((each) => !each.picked.length && !each.other)
    if (!sentAnswer && empty && !notes && !Object.keys(comments).length)
      return fail("Pick an option, or write something (Other, a comment, a note) first.")
    const server = window.SPELL_SERVER
    if (!server?.token) return fail("This page isn't on the page server, so it can't send:  answer in chat instead.")
    send.button.setAttribute("loading", "")
    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "content-type": "application/json", "x-server-token": server.token },
        body: JSON.stringify({ page: location.pathname, answers, comments, notes })
      })
      const body = await response.json().catch(() => ({}))
      if (response.status === 403 && /token/.test(body.error ?? ""))
        return fail("The page server restarted since this page loaded:  reload the page, then Send again.")
      if (response.status === 404 && !body.error)
        return fail("This page server can't take answers yet:  answer in chat.")
      if (!response.ok) return fail(body.error ?? `Send failed (${response.status}):  answer in chat instead.`)
      sentAnswer = body.answer
      sentSnapshot = snapshot()
      send.error.setAttribute("hidden", "")
      refresh()
    } catch (error) {
      fail(`Send failed (${error.message}):  answer in chat instead.`)
    } finally {
      send.button.removeAttribute("loading")
    }
  }

  /** What the page holds now:  `{ answers, comments, notes }`, as the route takes them. */
  function gather() {
    const comments = {}
    for (const box of document.querySelectorAll(".spell-comment")) {
      const text = String(box.value ?? "").trim()
      if (text) comments[box.dataset.section] = text
    }
    return { answers: collect(), comments, notes: String(send.notes.value ?? "").trim() }
  }

  /** `gather()` as one string, to compare with what was sent. */
  function snapshot() {
    return JSON.stringify(gather())
  }

  /** What's picked, by question id:  `{ picked: ["B"], other?: "..." }`. */
  function collect() {
    const answers = {}
    for (const question of questions) {
      const picked = [...question.querySelectorAll("ui-radio, ui-checkbox")]
        .filter((control) => control.selected)
        .map((control) => control.getAttribute("value"))
      const other = String(question.querySelector(".spell-other")?.value ?? "").trim()
      answers[question.id] = other ? { picked, other } : { picked }
      // "Provide more details" (`wireMore()`):  the cards asked for, as their own answer key
      if (question.hasAttribute("data-more")) {
        const more = [...question.querySelectorAll(".spell-option-card[data-more]")].map((card) => card.dataset.option)
        answers[`${question.id}-more`] = { picked: more }
      }
    }
    return answers
  }

  /** The answer already sent, if any (`<slug>.answer.json`, through the route):  put back into the page. */
  async function loadAnswer() {
    if (!window.SPELL_SERVER) return
    try {
      const response = await fetch(`${API}?page=${encodeURIComponent(location.pathname)}`, { cache: "no-store" })
      if (!response.ok) return
      const { answer } = await response.json()
      if (!answer) return
      // set controls only once they're upgraded:  a property set before would shadow the element's own
      await Promise.all(
        ["ui-radio", "ui-checkbox", "ui-input", "ui-textarea"].map((tag) => customElements.whenDefined(tag))
      )
      show(answer)
      // the controls report what they were set to a frame later
      await new Promise((done) => requestAnimationFrame(done))
      sentAnswer = answer
      sentSnapshot = snapshot()
      refresh()
    } catch {
      // opened from disk, or no answer yet:  nothing to show
    }
  }

  /** Put `answer` into the page:  picks, Other, "more details", comments, notes. */
  function show(answer) {
    for (const question of questions) {
      const got = answer.answers?.[question.id] ?? { picked: [] }
      for (const control of question.querySelectorAll("ui-radio, ui-checkbox"))
        control.selected = got.picked.includes(control.getAttribute("value"))
      const other = question.querySelector(".spell-other")
      if (other) other.value = got.other ?? ""
      const more = answer.answers?.[`${question.id}-more`]?.picked ?? []
      for (const card of question.querySelectorAll(".spell-option-card")) {
        const on = more.includes(card.dataset.option)
        card.toggleAttribute("data-more", on)
        card.querySelector(".spell-more-details")?.toggleAttribute("active", on)
      }
    }
    for (const box of document.querySelectorAll(".spell-comment"))
      box.value = answer.comments?.[box.dataset.section] ?? ""
    send.notes.value = answer.notes ?? ""
    for (const question of questions) markState(question)
  }

  /**
   * The header's line, and the meta list's status label, from where the answer stands:
   * - never sent:  "Not sent"
   * - sent, and the page as sent:  "Sent 10/8/26 14:34 · 5 of 17 decided"
   * - edited since:  "Changes not sent"
   */
  function refresh() {
    const changed = sentSnapshot !== null && snapshot() !== sentSnapshot
    const decided = questions.filter((question) => question.dataset.state !== "attention").length
    const [text, color, label] = !sentAnswer
      ? ["Not sent", "grey", "waiting for your answer"]
      : changed
        ? ["Changes not sent", "orange", "changes not sent"]
        : [`Sent ${when(sentAnswer.answered)} · ${decided} of ${questions.length} decided`, "green", "answered"]
    send.state.textContent = text
    send.state.dataset.color = color
    if (status) {
      status.textContent = label
      status.setAttribute("color", color)
    }
  }

  /** `iso` as the plan docs write dates:  `10/8/26 14:34`, local time. */
  function when(iso) {
    const date = new Date(iso)
    const time = `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`
    return `${date.getMonth() + 1}/${date.getDate()}/${String(date.getFullYear()).slice(2)} ${time}`
  }

  /** Show `message` under the header's Send. */
  function fail(message) {
    send.error.replaceChildren(el("p", {}, message))
    send.error.removeAttribute("hidden")
  }

  /** A new `tag` with `attributes`, holding `children` (nodes or text). */
  function el(tag, attributes = {}, ...children) {
    const node = document.createElement(tag)
    for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value)
    node.append(...children)
    return node
  }
})()
