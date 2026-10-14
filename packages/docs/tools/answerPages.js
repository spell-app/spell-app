/**
 * The pages Claude makes for Owen to answer ON, as the tools write them (epic `epic-workflow` P12):  details pages
 * (`details.js`) and syntax-choices pages (`choices.js`), in the epics pack's `<epic-*>` elements.
 * - What's here:  their templates (the tools' own, tracked with each branch as the elements are), and the
 *   ELEMENTS they're built from, made on a parsed page (linkedom):  never HTML put together in strings.
 *   - text a spec gives as HTML (Claude writes it:  `lede`, `summary`, `body` ...) goes in as HTML, through
 *     `appendHTML()`;  titles, letters and ids go in attributes, as values
 * - `migrate.js` uses the same makers to convert a page in the old markup (its step `answer-elements`).
 * - Plain node JS:  no types;  the specs' shapes are in `details.js` (`DetailsSpec`) and `choices.js` (`ChoicesData`).
 */
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

/** The tools' own page templates:  `templates/` beside this file. */
export const TOOL_TEMPLATES = join(dirname(fileURLToPath(import.meta.url)), "templates")

/** The tag of a question, its text, its options' box, an option, a box Owen types in, a fold. */
export const ASK = "epic-ask"
export const QUESTION = "epic-question"
export const CHOICES = "epic-choices"
export const OPTION = "epic-option"
export const TEXT_BOX = "epic-text-box"
export const ASIDE = "epic-aside"
export const FIELD = "epic-field"
export const ROWS = "epic-choice-rows"
export const ROW = "epic-choice-row"

/** Every `<ui-section>` of a page:  a rule under every title, every section folds. */
export const SECTION_FLAGS = { sticky: true, collapsible: true, dividing: true }

/** The labelled lines of a page's "Where we are" box, from a spec's `where`. */
const WHERE_LABELS = [
  ["epic", "Epic"],
  ["justNow", "Just now"],
  ["decides", "This decides"]
]

////////////////
// ## Making elements
////////////////

/**
 * A new `tag` in `document`, with `attributes` (`true`:  present, empty;  `false` / `undefined` / `null`:  left
 * out), holding `children` (nodes;  a string is text).
 */
export function make(document, tag, attributes = {}, children = []) {
  const element = document.createElement(tag)
  // backwards:  linkedom puts each new attribute FIRST, so the page reads them in the order given
  for (const [name, value] of Object.entries(attributes).reverse()) {
    if (value === undefined || value === null || value === false) continue
    element.setAttribute(name, value === true ? "" : String(value))
  }
  for (const child of children) element.append(typeof child === "string" ? document.createTextNode(child) : child)
  return element
}

/** Append `html` (a spec's HTML text, as Claude wrote it) to `element`, parsed;  `element` returned. */
export function appendHTML(element, html) {
  if (!html) return element
  const holder = element.ownerDocument.createElement("template")
  holder.innerHTML = html
  element.append(...Array.from((holder.content ?? holder).childNodes))
  return element
}

/** `html` in a new `tag` (a spec's one-line text, `<p>`-wrapped). */
export function htmlIn(document, tag, html) {
  return appendHTML(make(document, tag), html)
}

////////////////
// ## The page's head
////////////////

/**
 * Fill a new page's head from the template:  `<title>`, h1, breadcrumb, description, the "Asked" date.
 * - `asked`:  the `[data-details-asked]`-style line's selector
 */
export function fillHead(document, { title, description, asked, date }) {
  document.querySelector("title").textContent = title
  document.querySelector("h1").textContent = title
  const crumb = document.querySelector("ui-breadcrumb-section[active]")
  if (crumb) crumb.textContent = title
  document.querySelector('meta[name="description"]').setAttribute("content", description)
  const line = document.querySelector(asked)
  if (line) line.textContent = date
}

/**
 * The page's own words from `spec`:  the lede, "Asked by", the "Where we are" box (`{ epic, justNow, decides }`,
 * each an `<epic-field label>`);  all HTML.
 */
export function fillWords(document, spec) {
  const lede = document.querySelector("p.lede")
  if (lede && spec.lede) lede.replaceChildren(...appendHTML(document.createElement("div"), spec.lede).childNodes)
  const by = document.querySelector("[data-details-by]")
  if (by && spec.askedBy) by.replaceChildren(...appendHTML(document.createElement("div"), spec.askedBy).childNodes)
  const where = document.querySelector("ui-message.spell-where")
  if (where && spec.where) {
    const fields = WHERE_LABELS.filter(([key]) => spec.where[key]).map(([key, label]) =>
      appendHTML(make(document, FIELD, { label }), spec.where[key])
    )
    where.replaceChildren(...fields)
  }
}

////////////////
// ## Questions
////////////////

/**
 * One question's `<ui-section>`, from a `DetailsSpec` question:  its `<epic-ask>`, holding the question's text and
 * its options;  `i`:  its place, for the default id (`q1` ...) and title (`Q1`).
 */
export function questionSection(document, question, i) {
  const id = question.id ?? `q${i + 1}`
  const ask = make(document, ASK, {
    multiple: !!question.multiple,
    "select-all": !!question.selectAll,
    filter: !!question.filter,
    "more-details": !!question.moreDetails
  })
  if (question.text) ask.append(make(document, QUESTION, {}, [htmlIn(document, "p", question.text)]))
  const options = (question.options ?? []).map((option, j) => optionElement(document, option, j))
  if (options.length) ask.append(make(document, CHOICES, {}, options))
  return make(document, "ui-section", { id, header: question.title ?? `Q${i + 1}`, ...SECTION_FLAGS }, [
    make(document, "ui-icon", { slot: "icon", name: "circle question" }),
    ask
  ])
}

/**
 * One option's `<epic-option>`, from a `DetailsSpec` option;  `j`:  its place, for the default letter (`A` ...).
 * - its summary a `<p>`, then its body;  its details folded in an `<epic-aside>`, titled `detailsTitle`
 */
export function optionElement(document, option, j) {
  const letter = option.letter ?? String.fromCharCode(65 + j)
  const element = make(document, OPTION, {
    letter,
    title: option.title ?? letter,
    recommended: !!option.recommended,
    selected: !!option.checked,
    done: !!option.done,
    badge: option.badge,
    "badge-color": option.badgeColor,
    "state-icon": option.state?.icon,
    "state-color": option.state?.color,
    "state-label": option.state?.label
  })
  if (option.summary) element.append(htmlIn(document, "p", option.summary))
  appendHTML(element, option.body)
  if (option.details)
    element.append(appendHTML(make(document, ASIDE, { title: option.detailsTitle ?? "Details" }), option.details))
  return element
}

////////////////
// ## Syntax-choices rows
////////////////

/** A syntax-choices section's icon when its data names none. */
const SECTION_ICON = "list check"

/**
 * One `<ui-section>` per section of syntax-choices `data` (`ChoicesData`, checked:  every row has its `id`), each
 * holding its rule and an `<epic-choice-rows>` of its `<epic-choice-row>`s.
 * - with the File column (the default), rows by file, then line;  without it (`fileColumn: false`), in the data's
 *   order
 * - folded, as every docs section starts (Expand all is on the bar)
 */
export function choiceSections(document, data) {
  const hasFile = data.fileColumn !== false
  return data.sections.map((section) => {
    const rows = data.rows.filter((row) => row.section === section.id)
    if (hasFile) rows.sort((one, other) => one.file.localeCompare(other.file) || one.line - other.line)
    const table = make(
      document,
      ROWS,
      { stacked: data.stacked === true, "no-file": !hasFile },
      rows.map((row) => choiceRow(document, row))
    )
    const rule = section.description
      ? [make(document, "p", { class: "spell-choices-rule" }, withCode(document, section.description))]
      : []
    return make(document, "ui-section", { id: section.id, header: section.title, ...SECTION_FLAGS, collapsed: true }, [
      make(document, "ui-icon", { slot: "icon", name: section.icon ?? SECTION_ICON }),
      ...rule,
      table
    ])
  })
}

/** One row's `<epic-choice-row>`:  its data, as attributes. */
export function choiceRow(document, row) {
  return make(document, ROW, {
    name: row.id,
    file: row.file,
    line: row.line,
    purpose: row.purpose,
    note: row.note,
    current: row.current,
    recommended: row.recommended
  })
}

/** `text`'s pieces as nodes:  its `` `code` `` spans as `<code>`, the rest as text. */
export function withCode(document, text) {
  return String(text)
    .split(/`([^`]+)`/)
    .map((piece, i) => (i % 2 ? make(document, "code", {}, [piece]) : piece))
    .filter((piece) => piece !== "")
}

/** The comment box at the end of a section that isn't a question:  its comment, keyed by the section's id. */
export function commentBox(document, sectionId) {
  return make(document, TEXT_BOX, { for: sectionId })
}
