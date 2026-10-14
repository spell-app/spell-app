/**
 * Convert a page Owen answers on from its OLD markup (before epic `epic-workflow` P12) to the epics pack's elements,
 * once:  the migration step `answer-elements` (`migrate.js`, J26:  the old page scripts go, so one way of drawing is
 * left).  Every word, id and answer key is kept:  the answers beside a page read the same afterwards.
 * - a DETAILS page (`convertDetailsPage()`):  `ui-section.spell-question` > `.spell-option[data-option][data-title]`,
 *   drawn by `_assets/details.js`, becomes a `<ui-section>` holding an `<epic-ask>` of an `<epic-question>` and an
 *   `<epic-choices>` of `<epic-option>`s;  the comment boxes, notes and Send that script added become
 *   `<epic-text-box>`es and an `<epic-send>`, written into the page
 * - a SYNTAX-CHOICES page (`convertChoicesPage()`):  its tables, drawn from `<slug>.rows.json` by
 *   `_assets/syntax-choices.js`, are written into the page from that file, as `<epic-choice-rows>` of
 *   `<epic-choice-row>`s, with its `<epic-choices-bar>`
 * - both:  the meta list and the "Where we are" box become `<epic-field label>`s, and the page loads the epics pack
 *   (`<ui-root>` + `<ui-components>`) and `spell-ui.js` instead of the old script and sheet
 * - idempotent:  a converted page has none of the old markup left (`needsConversion()`)
 * - On a parsed page (linkedom), never markup put together in strings:  the makers are `answerPages.js`'s.
 */
import {
  ASIDE,
  ASK,
  CHOICES,
  FIELD,
  OPTION,
  QUESTION,
  TEXT_BOX,
  choiceSections,
  commentBox,
  make
} from "./answerPages.js"

/** Old markup a page Owen answers on still has:  its questions, or the old page scripts. */
export const OLD_ANSWER_MARKUP = /class="[^"]*\bspell-question\b|_assets\/details\.js|_assets\/syntax-choices\.js/

/** Does page `html` still need converting? */
export function needsConversion(html) {
  return OLD_ANSWER_MARKUP.test(html)
}

////////////////
// ## Details pages
////////////////

/**
 * Convert the details page `document` in place;  what it did, `{ changed, notes }`.
 * - a page with no questions had no form (the old script built none):  only its old script and sheet go
 */
export function convertDetailsPage(document) {
  const notes = []
  const questions = [...document.querySelectorAll("ui-section.spell-question")]
  dropOldAssets(document, ["details.css", "details.js"])
  if (questions.length) {
    loadPack(document)
    const head = document.querySelector(".spell-page-head")
    if (head && !head.querySelector("epic-send")) head.append(make(document, "epic-send"))
    convertMeta(document, notes)
    for (const question of questions) convertQuestion(document, question)
    notes.push(`${questions.length} questions -> <epic-ask>`)
    // a comment box under every section that isn't a question and holds none (`details.js` `buildComments()`)
    let boxes = 0
    for (const section of document.querySelectorAll("ui-section[id]")) {
      if (section.querySelector(`ui-section, ${ASK}, ${TEXT_BOX}`) || isInQuestion(section)) continue
      section.append(commentBox(document, section.id))
      boxes++
    }
    if (boxes) notes.push(`${boxes} comment boxes`)
    // the notes, after the last question
    if (!document.querySelector(`${TEXT_BOX}[type="notes"]`))
      lastSectionOf(questions.at(-1)).after(make(document, TEXT_BOX, { type: "notes" }))
  } else notes.push("no questions:  its old script and sheet dropped")
  return { changed: true, notes }
}

/**
 * One old question section, converted in place:  its prose before the first option into an `<epic-question>`, its
 * options into an `<epic-choices>`, anything after them after that, all in an `<epic-ask>`;  its `data-multiple`,
 * `data-select-all`, `data-filter` and `data-more` become the ask's.
 */
function convertQuestion(document, section) {
  const ask = make(document, ASK, {
    multiple: section.hasAttribute("data-multiple"),
    "select-all": section.hasAttribute("data-select-all"),
    filter: section.hasAttribute("data-filter"),
    "more-details": section.hasAttribute("data-more")
  })
  for (const name of ["data-multiple", "data-select-all", "data-filter", "data-more"]) section.removeAttribute(name)
  section.classList.remove("spell-question")
  if (!section.classList.length) section.removeAttribute("class")
  const nodes = [...section.childNodes].filter((node) => node.nodeType !== 1 || !node.hasAttribute("slot"))
  const firstOption = nodes.findIndex(isOldOption)
  const lastOption = nodes.findLastIndex(isOldOption)
  const before = firstOption < 0 ? nodes : nodes.slice(0, firstOption)
  if (before.some(hasContent)) ask.append(make(document, QUESTION, {}, before))
  else for (const node of before) node.remove()
  if (firstOption >= 0) {
    const options = nodes.slice(firstOption, lastOption + 1)
    // a stray node between options (a comment, white space) stays with the options it sits between
    ask.append(
      make(
        document,
        CHOICES,
        {},
        options.map((node) => (isOldOption(node) ? convertOption(document, node) : node))
      )
    )
    const after = nodes.slice(lastOption + 1)
    if (after.some(hasContent)) ask.append(...after)
    else for (const node of after) node.remove()
  }
  section.append(ask)
}

/** One old `.spell-option` as an `<epic-option>`:  its `data-*` as attributes, its folded details an `<epic-aside>`. */
function convertOption(document, old) {
  const data = (name) => old.getAttribute(`data-${name}`) ?? undefined
  const option = make(document, OPTION, {
    letter: data("option"),
    title: data("title") ?? data("option"),
    recommended: old.hasAttribute("data-recommended"),
    selected: old.hasAttribute("data-checked"),
    done: old.hasAttribute("data-done"),
    badge: data("badge"),
    "badge-color": data("badge-color"),
    "state-icon": data("state-icon"),
    "state-color": data("state-color"),
    "state-label": data("state-label")
  })
  for (const node of [...old.childNodes]) {
    if (node.nodeType === 1 && node.classList.contains("spell-option-details")) {
      const aside = make(document, ASIDE, { title: node.getAttribute("data-title") ?? "Details" }, [...node.childNodes])
      option.append(aside)
    } else option.append(node)
  }
  old.remove()
  return option
}

/** Is `node` an old option card's markup? */
function isOldOption(node) {
  return node.nodeType === 1 && node.classList.contains("spell-option")
}

/** Does `node` hold anything a reader sees (not white space, not a comment)? */
function hasContent(node) {
  return node.nodeType === 1 || (node.nodeType === 3 && !!node.textContent.trim())
}

/** Is `section` a question's, or inside one (a section holding an `<epic-ask>`)? */
function isInQuestion(section) {
  for (let at = section; at; at = at.parentElement?.closest("ui-section"))
    if ([...at.children].some((child) => child.localName === ASK)) return true
  return false
}

/** The top-level section `section` sits in (itself, when it's one). */
function lastSectionOf(section) {
  let top = section
  for (let up = top.parentElement?.closest("ui-section"); up; up = up.parentElement?.closest("ui-section")) top = up
  return top
}

////////////////
// ## Syntax-choices pages
////////////////

/**
 * Convert the syntax-choices page `document` in place, its rows from `data` (`ChoicesData`, checked:  the rows file
 * beside it);  what it did, `{ changed, notes }`.
 * - the old script drew the rows where `[data-choices-sections]` was, and its bar at `main`'s end:  the same places
 */
export function convertChoicesPage(document, data) {
  const notes = []
  dropOldAssets(document, ["syntax-choices.css", "syntax-choices.js"], { keepBundle: true })
  loadPack(document)
  document.body.removeAttribute("data-spell-needs-server")
  convertMeta(document, notes)
  const holder = document.querySelector("[data-choices-sections]")
  const sections = choiceSections(document, data)
  if (holder) holder.replaceWith(...sections)
  else document.querySelector("main")?.append(...sections)
  notes.push(`${data.rows.length} rows in ${sections.length} sections -> <epic-choice-rows>`)
  const main = document.querySelector("main")
  if (main && !main.querySelector("epic-choices-bar")) main.append(make(document, "epic-choices-bar"))
  return { changed: true, notes }
}

////////////////
// ## Both
////////////////

/** A meta line's marks, kept on its field. */
const MARKS = ["data-details-asked", "data-choices-asked", "data-choices-rows"]

/**
 * The page's meta list (`ui-list.spell-meta`) as `<epic-field label>`s in a `div.spell-details-meta`, and the
 * "Where we are" box's list as `<epic-field label>`s:  each `Label:  text` line a field.
 * - the old Status line goes:  `<epic-send>` says where the answer stands
 * - a line with no `Label:` stays, as a paragraph
 */
function convertMeta(document, notes) {
  const list = document.querySelector("ui-list.spell-meta")
  if (list) {
    const fields = []
    for (const item of list.querySelectorAll("ui-item")) {
      if (item.querySelector("[data-details-status]")) continue
      // the marks the tools fill lines by:  `new` writes the date into `data-details-asked` ...
      const marks = Object.fromEntries(MARKS.map((name) => [name, item.hasAttribute(name)]))
      if (item.getAttribute("icon") === "comments") marks["data-details-by"] = true
      fields.push(labelled(document, item, textLabel(item), marks))
    }
    list.replaceWith(make(document, "div", { class: "spell-details-meta" }, fields))
    notes.push("meta list -> <epic-field>s")
  }
  const where = document.querySelector("ui-message.spell-where")
  const lines = where?.querySelector(":scope > ul")
  if (lines) {
    const items = [...lines.children].filter((child) => child.localName === "li")
    if (items.every((item) => boldLabel(item))) {
      lines.replaceWith(...items.map((item) => labelled(document, item, boldLabel(item))))
      notes.push("Where we are -> <epic-field>s")
    }
  }
}

/**
 * `line`'s content as an `<epic-field label>`, its `label` (`{ label, node, rest }`:  the node holding the label,
 * and the text after it in that node) taken off its front;  none:  a `<p>` of it.
 */
function labelled(document, line, label, marks = {}) {
  if (!label) return make(document, "p", {}, [...line.childNodes])
  if (label.rest === undefined) label.node.remove()
  else label.node.textContent = label.rest
  const nodes = [...line.childNodes]
  // the space after the colon:  the field draws its own
  const first = nodes[0]
  if (first?.nodeType === 3) first.textContent = first.textContent.replace(/^\s+/, "")
  return make(document, FIELD, { label: label.label, ...marks }, nodes)
}

/** A line starting `Label:` in text (`Asked by:  session x`):  its label, and the text after it;  else `undefined`. */
function textLabel(line) {
  const first = [...line.childNodes].find((node) => node.nodeType !== 3 || node.textContent.trim())
  const match = first?.nodeType === 3 ? /^\s*([^:\n]{1,30}):\s*(.*)$/s.exec(first.textContent) : null
  return match ? { label: match[1].trim(), node: first, rest: match[2] } : undefined
}

/** A line starting `<b>Label:</b>` (`<li><b>Epic:</b>  ...`):  its label, the `<b>` going;  else `undefined`. */
function boldLabel(line) {
  const first = [...line.childNodes].find((node) => node.nodeType !== 3 || node.textContent.trim())
  const match = first?.localName === "b" ? /^\s*(.+?):\s*$/.exec(first.textContent) : null
  return match ? { label: match[1], node: first } : undefined
}

/**
 * Drop the page's old sheet and script (`names`, in `_assets/`);  a syntax-choices page loaded `spell-ui.js` from
 * its script, so it gets the bundle's tag (`keepBundle`), and `highlight.min.js` before it.
 */
function dropOldAssets(document, names, { keepBundle = false } = {}) {
  for (const tag of document.querySelectorAll("link[href], script[src]")) {
    const url = tag.getAttribute("href") ?? tag.getAttribute("src")
    if (!names.includes(url.split("/").pop())) continue
    if (keepBundle && tag.localName === "script") {
      const assets = url.slice(0, url.lastIndexOf("/") + 1)
      tag.replaceWith(
        make(document, "script", { src: `${assets}highlight.min.js` }),
        make(document, "script", { src: `${assets}spell-ui.js` })
      )
    } else tag.remove()
  }
}

/**
 * Wrap the page's body in `<ui-root>`, its first child the epics pack's `<ui-components source>`, as a plan doc's
 * is;  the scripts stay after it.  The way up to the root comes from the page's `spell-ui.js`.
 */
function loadPack(document) {
  if (document.querySelector("ui-root")) return
  const bundle = document.querySelector('script[src$="_assets/spell-ui.js"]')?.getAttribute("src") ?? ""
  const up = bundle.slice(0, bundle.indexOf("packages/docs/tools/_assets/"))
  const body = document.body
  const scripts = [...body.childNodes].filter((node) => node.localName === "script")
  const rest = [...body.childNodes].filter((node) => !scripts.includes(node))
  const root = make(document, "ui-root", {}, [
    make(document, "ui-components", { source: `${up}packages/epics/pack/epics.pack.js` }),
    ...rest
  ])
  body.replaceChildren(root, ...scripts)
}
