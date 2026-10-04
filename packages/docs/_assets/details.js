/**
 * Details pages:  turns the questions Claude wrote into a form Owen answers ON the page, and sends the answer back
 * through the page server, which wakes the waiting session (`yarn details wait`).
 * - A classic script, loaded BEFORE `spell-ui.js`:  it only builds markup, so every `ui-*` it makes is upgraded
 *   with the rest of the page, and the contents sidebar sees the Send section.
 * - Builds, from `ui-section.spell-question` > `.spell-option[data-option][data-title]`:
 *   - one `ui-segment` card per option:  a `ui-radio` (or `ui-checkbox` under `data-multiple`) labelled
 *     `A · title`, ticked to start with under `data-checked`, a Recommended label (`data-recommended`), the
 *     one-line summary, and its
 *     `.spell-option-details` folded in a `ui-accordion`
 *   - an "Other" box per question
 *   - a Send section:  notes, Send, the answer once sent, Change answer
 * - Answer:  `POST /api/details/answer` (`scripts/detailsRoutes.ts`) writes `<slug>.answer.json` beside the page;
 *   on load, `GET` reads it back:  the page shows the answer and locks.
 * - Opened from disk, or a server without the route:  Send says to answer in chat instead.
 */
;(function details() {
  /** Where the answer goes. */
  const API = "/api/details/answer"

  /** Every question section, in page order. */
  const questions = [...document.querySelectorAll("ui-section.spell-question")]
  if (!questions.length) return
  for (const question of questions) buildQuestion(question)
  const send = buildSend()
  const status = document.querySelector("[data-details-status]")
  void loadAnswer()

  ////////////////
  // ## Building
  ////////////////

  /** Turn `question`'s `.spell-option`s into cards, then add its "Other" box. */
  function buildQuestion(question) {
    const multiple = question.hasAttribute("data-multiple")
    for (const option of question.querySelectorAll(":scope > .spell-option")) {
      option.replaceWith(buildOption(question.id, option, multiple))
    }
    const other = el("ui-input", {
      class: "spell-other",
      name: `${question.id}-other`,
      placeholder: multiple ? "Other:  add your own" : "Other:  your own answer",
      fluid: ""
    })
    question.append(other)
  }

  /** A card for `option` of question `id`:  control, Recommended label, summary, folded details. */
  function buildOption(id, option, multiple) {
    const letter = option.dataset.option
    const title = option.dataset.title ?? ""
    const card = el("ui-segment", { class: "spell-option-card", "data-option": letter, "data-title": title })
    const control = el(multiple ? "ui-checkbox" : "ui-radio", { name: id, value: letter })
    // ticked to start with (`data-checked`):  `/epic review`'s item picker ticks what isn't reviewed yet
    if (option.hasAttribute("data-checked")) control.setAttribute("checked", "")
    control.append(el("b", {}, letter), ` · ${title}`)
    const head = el("div", { class: "spell-option-head" }, control)
    if (option.hasAttribute("data-recommended")) {
      card.setAttribute("data-recommended", "")
      head.append(el("ui-label", { size: "mini", color: "green", icon: "thumbs up" }, "Recommended"))
    }
    card.append(head)
    const more = option.querySelector(":scope > .spell-option-details")
    const summary = el("div", { class: "spell-option-summary" }, ...[...option.childNodes].filter((n) => n !== more))
    card.append(summary)
    if (more) {
      const fold = el("ui-accordion", { class: "spell-aside spell-option-more", styled: "" })
      fold.append(el("ui-title", {}, `More on ${letter}`), el("ui-content", {}, ...more.childNodes))
      card.append(fold)
    }
    return card
  }

  /** The Send section, after the last question:  notes, Send, what was sent, Change answer. */
  function buildSend() {
    const section = el("ui-section", { id: "send", header: "Send", sticky: "", collapsible: "", dividing: "" })
    section.append(el("ui-icon", { slot: "icon", name: "paper plane" }))
    const notes = el("ui-textarea", {
      class: "spell-notes",
      name: "notes",
      rows: "3",
      placeholder: "Notes for Claude",
      fluid: ""
    })
    const button = el("ui-button", { class: "spell-send", primary: "", circular: "", icon: "paper plane" }, "Send")
    const error = el("ui-message", { class: "spell-send-error", state: "negative", size: "small", hidden: "" })
    const sent = el("ui-message", { class: "spell-sent", state: "positive", header: "Sent", hidden: "" })
    const summary = el("div", { class: "spell-sent-summary" })
    const change = el(
      "ui-button",
      { class: "spell-change", basic: "", circular: "", icon: "pen to square" },
      "Change answer"
    )
    sent.append(summary, change)
    section.append(notes, el("div", { class: "spell-send-row" }, button), error, sent)
    questions.at(-1).after(section)
    button.addEventListener("click", () => void submit())
    change.addEventListener("click", () => lock(false))
    return { section, notes, button, error, sent, summary }
  }

  ////////////////
  // ## Answering
  ////////////////

  /** Send the answer;  on success, show it and lock the page. */
  async function submit() {
    const answers = collect()
    const notes = String(send.notes.value ?? "").trim()
    const empty = Object.values(answers).every((each) => !each.picked.length && !each.other)
    if (empty && !notes) return fail("Pick an option (or write in Other, or a note) first.")
    const server = window.SPELL_SERVER
    if (!server?.token) return fail("This page isn't on the page server, so it can't send:  answer in chat instead.")
    send.button.setAttribute("loading", "")
    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "content-type": "application/json", "x-server-token": server.token },
        body: JSON.stringify({ page: location.pathname, answers, notes })
      })
      const body = await response.json().catch(() => ({}))
      if (response.status === 403 && /token/.test(body.error ?? ""))
        return fail("The page server restarted since this page loaded:  reload the page, then Send again.")
      if (response.status === 404 && !body.error)
        return fail("This page server can't take answers yet:  answer in chat.")
      if (!response.ok) return fail(body.error ?? `Send failed (${response.status}):  answer in chat instead.`)
      show(body.answer)
    } catch (error) {
      fail(`Send failed (${error.message}):  answer in chat instead.`)
    } finally {
      send.button.removeAttribute("loading")
    }
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
    }
    return answers
  }

  /** The answer already sent, if any (`<slug>.answer.json`, through the route):  shown, page locked. */
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
    } catch {
      // opened from disk, or no answer yet:  nothing to show
    }
  }

  /** Show `answer` on the page:  controls set, summary written, locked. */
  function show(answer) {
    for (const question of questions) {
      const got = answer.answers?.[question.id] ?? { picked: [] }
      for (const control of question.querySelectorAll("ui-radio, ui-checkbox"))
        control.selected = got.picked.includes(control.getAttribute("value"))
      const other = question.querySelector(".spell-other")
      if (other) other.value = got.other ?? ""
    }
    send.notes.value = answer.notes ?? ""
    send.summary.replaceChildren(...summarize(answer))
    lock(true)
  }

  /** Lines saying what `answer` holds, per question, then the notes and when. */
  function summarize(answer) {
    const list = el("ul")
    for (const question of questions) {
      const got = answer.answers?.[question.id] ?? { picked: [] }
      const titles = got.picked.map((letter) => {
        const card = question.querySelector(`.spell-option-card[data-option="${CSS.escape(letter)}"]`)
        return `${letter} · ${card?.dataset.title ?? ""}`
      })
      if (got.other) titles.push(`Other:  ${got.other}`)
      const label = question.getAttribute("header")?.split(" · ")[0] ?? question.id
      list.append(el("li", {}, el("b", {}, `${label}:`), `  ${titles.join(";  ") || "(no answer)"}`))
    }
    if (answer.notes) list.append(el("li", {}, el("b", {}, "Notes:"), `  ${answer.notes}`))
    const when = el("p", { class: "meta" }, `Sent ${new Date(answer.answered).toLocaleString()}.`)
    return [list, when]
  }

  /** Lock (or unlock, to change the answer) every control;  the Send row and the "Sent" message trade places. */
  function lock(locked) {
    for (const control of document.querySelectorAll(
      ".spell-question ui-radio, .spell-question ui-checkbox, .spell-other, .spell-notes"
    ))
      control.toggleAttribute("disabled", locked)
    document.body.classList.toggle("spell-details-answered", locked)
    send.button.toggleAttribute("hidden", locked)
    send.sent.toggleAttribute("hidden", !locked)
    send.error.setAttribute("hidden", "")
    if (status) {
      status.textContent = locked ? "answered" : "changing your answer"
      status.setAttribute("color", locked ? "green" : "orange")
    }
  }

  /** Show `message` under Send. */
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
