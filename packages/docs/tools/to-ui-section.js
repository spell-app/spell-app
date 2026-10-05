/**
 * Convert pages from the OLD section markup to `<ui-section>`:  `node tools/to-ui-section.js <page>...` (paths
 * from the root, or an area:  `pages.js` `pageFile()`).  Prints a summary per page;  idempotent (a converted page has nothing left to do).
 * - old:  `<section class="s2|s3">` > `<ui-sticky class="spell-h2|spell-h3">` > `<h2|h3 id>` (icons, title), then the
 *   content
 * - new:  `<ui-section id header sticky collapsible dividing>` (`spell-docs/ui-section-test.html` shows every piece)
 * - `convertSections()` is the conversion, on a parsed document:  `plan-doc.js` `migrate` runs it too
 * - then tidies each page (`pages.js` `tidy()`:  link targets, oxfmt), as every script that writes one does
 * - NEVER run it on the goals pages (`templates/goals/`, the repo root's `goals/`):  they keep the old markup
 */
import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

import { parseHTML } from "linkedom"

import { pageFile, serialize, tidy } from "./pages.js"

/** The attributes every converted section gets:  a rule under every title, every section folds. */
const SECTION_FLAGS = ["sticky", "collapsible", "dividing"]

/** Section attributes that come first, in this order, so plan phases read `id data-phase data-status header ...`. */
const LEADING = ["data-phase", "data-status"]

/**
 * Convert every old-markup section in `document` to `<ui-section>`;  returns what it did:
 * `{ converted, slotHeaders, multiIcons, droppedIds, levels, skipped }`.
 * - the section takes its HEADING's `id` (the anchor other pages link to:  NEVER changed);  an `id` of the old
 *   `<section>` itself (`phases-section`) is dropped:  listed in `droppedIds`, and the page's links to it
 *   (`href="#phases-section"`) go to the heading's id
 * - the old section's other attributes stay (`data-phase`, `data-status` ...), but its `s2` / `s3` class and
 *   `data-fold` (`"closed"` -> `collapsed`)
 * - the heading's content:
 *   - its `<ui-icon>`:  `slot="icon"`, first in the section;  several stay together in a `<span slot="icon">`
 *   - a runtime-made `ui-label.spell-count`:  dropped;  any other `ui-label` (`.plan-update`) stays in the title
 *   - plain text only:  `header="..."`, whitespace collapsed;  any element in it (`<code>`, `<a>`, a label):  a
 *     `<span slot="header">` holding it all (listed in `slotHeaders`)
 * - the heading level is implied by nesting (2 at the top, +1 per level):  a section whose old heading says
 *   otherwise gets `level` (listed in `levels`)
 * - a section not shaped as above is left alone:  listed in `skipped`
 */
export function convertSections(document) {
  const report = { converted: 0, slotHeaders: [], multiIcons: [], droppedIds: [], levels: [], skipped: [] }
  const levelOf = new Map()
  for (const section of Array.from(document.querySelectorAll("section.s2, section.s3"))) {
    const sticky = section.firstElementChild
    const heading = sticky?.matches("ui-sticky") ? sticky.firstElementChild : null
    if (!heading?.matches("h2, h3") || !heading.id) {
      report.skipped.push(section.outerHTML.slice(0, 80))
      continue
    }
    const converted = convertSection(document, section, sticky, heading, report)
    levelOf.set(converted, Number(heading.localName.slice(1)))
  }
  // the level nesting implies, against the old heading's
  for (const [section, level] of levelOf) {
    let implied = 2
    for (let up = section.parentElement?.closest("ui-section"); up; up = up.parentElement?.closest("ui-section"))
      implied++
    if (implied === level) continue
    section.setAttribute("level", String(level))
    report.levels.push(`#${section.id}:  h${level}, nested as h${implied}`)
  }
  return report
}

/** One old section to a `<ui-section>`, in its place;  returns the new element. */
function convertSection(document, section, sticky, heading, report) {
  const attributes = [["id", heading.id]]
  const kept = Array.from(section.attributes).filter(({ name }) => !["id", "class", "data-fold"].includes(name))
  kept.sort((a, b) => rank(a.name) - rank(b.name))
  for (const { name, value } of kept) attributes.push([name, value])
  const classes = (section.getAttribute("class") ?? "").split(/\s+/).filter((name) => name && !/^s[23]$/.test(name))
  if (classes.length) attributes.push(["class", classes.join(" ")])
  const oldId = section.getAttribute("id")
  if (oldId && oldId !== heading.id) {
    report.droppedIds.push(oldId)
    for (const link of document.querySelectorAll(`a[href="#${oldId}"]`)) link.setAttribute("href", `#${heading.id}`)
  }

  const { icons, title } = splitHeading(heading)
  const rich = title.some((node) => node.nodeType === 1)
  if (!rich)
    attributes.push([
      "header",
      title
        .map((node) => node.textContent)
        .join("")
        .replace(/\s+/g, " ")
        .trim()
    ])
  for (const flag of SECTION_FLAGS) attributes.push([flag, ""])
  if (section.getAttribute("data-fold") === "closed") attributes.push(["collapsed", ""])
  const result = createElement(document, "ui-section", attributes)

  // the whitespace before the old title indents what takes its place:  the slotted icon and title
  const children = Array.from(section.childNodes)
  const at = children.indexOf(sticky)
  const indent = children
    .slice(0, at)
    .filter((node) => node.nodeType === 3)
    .map((node) => node.textContent)
    .join("")
  const slotted = []
  if (icons.length === 1) {
    icons[0].setAttribute("slot", "icon")
    slotted.push(icons[0])
  } else if (icons.length > 1) {
    const span = createElement(document, "span", [["slot", "icon"]])
    span.append(...interleave(document, icons))
    slotted.push(span)
    report.multiIcons.push(heading.id)
  }
  if (rich) {
    const span = createElement(document, "span", [["slot", "header"]])
    span.append(...trimmed(title))
    slotted.push(span)
    report.slotHeaders.push(heading.id)
  }
  for (const node of slotted) result.append(document.createTextNode(indent), node)
  result.append(...children.slice(at + 1))
  section.replaceWith(result)
  report.converted++
  return result
}

/**
 * A new element with `attributes` (`[name, value]` pairs) IN THAT ORDER, as written by hand.
 * - parsed from HTML:  linkedom's `setAttribute` puts each new attribute FIRST, so a built element's would come
 *   out reversed
 */
export function createElement(document, tag, attributes = []) {
  const template = document.createElement("template")
  const list = attributes.map(([name, value]) => (value === "" ? ` ${name}` : ` ${name}="${attribute(value)}"`))
  template.innerHTML = `<${tag}${list.join("")}></${tag}>`
  return template.content.firstChild
}

/** Escape for a double-quoted attribute value. */
function attribute(value) {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

/**
 * A heading's nodes as `{ icons, title }`:  its `<ui-icon>` children, and the rest of its content (moved, not
 * copied) without the runtime's `ui-label.spell-count`.
 */
function splitHeading(heading) {
  const icons = []
  const title = []
  for (const node of Array.from(heading.childNodes)) {
    if (node.nodeType === 1 && node.matches("ui-icon")) icons.push(node)
    else if (node.nodeType === 1 && node.matches("ui-label.spell-count")) continue
    else if (node.nodeType === 1 || node.nodeType === 3) title.push(node)
  }
  return { icons, title }
}

/** `nodes` without whitespace-only text at either end, and the outer text's leading / trailing space trimmed. */
function trimmed(nodes) {
  const list = [...nodes]
  while (list[0]?.nodeType === 3 && !list[0].textContent.trim()) list.shift()
  while (list.at(-1)?.nodeType === 3 && !list.at(-1).textContent.trim()) list.pop()
  if (list[0]?.nodeType === 3) list[0].textContent = list[0].textContent.replace(/^\s+/, "")
  if (list.at(-1)?.nodeType === 3) list.at(-1).textContent = list.at(-1).textContent.replace(/\s+$/, "")
  return list
}

/** `elements` with a space between each, so several icons don't touch. */
function interleave(document, elements) {
  return elements.flatMap((element, index) => (index ? [document.createTextNode(" "), element] : [element]))
}

/** Sort key of an attribute:  `LEADING` ones first, in order, then the rest as they were. */
function rank(name) {
  const index = LEADING.indexOf(name)
  return index < 0 ? LEADING.length : index
}

/** One line per page:  what changed, and anything a person should look at. */
function describe(page, report) {
  if (!report.converted && !report.skipped.length) return `${page}:  nothing to convert`
  const lines = [`${page}:  ${report.converted} sections -> <ui-section>`]
  if (report.slotHeaders.length)
    lines.push(`  slot="header" titles:  ${report.slotHeaders.map((id) => `#${id}`).join(", ")}`)
  if (report.multiIcons.length) lines.push(`  several icons:  ${report.multiIcons.map((id) => `#${id}`).join(", ")}`)
  if (report.droppedIds.length)
    lines.push(`  section ids dropped (the heading's id wins):  ${report.droppedIds.map((id) => `#${id}`).join(", ")}`)
  if (report.levels.length) lines.push(`  level set:  ${report.levels.join(";  ")}`)
  for (const skipped of report.skipped) lines.push(`  SKIPPED (not section > ui-sticky > h2|h3[id]):  ${skipped}`)
  return lines.join("\n")
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const pages = process.argv.slice(2)
  if (!pages.length) {
    console.error(
      "usage:  node tools/to-ui-section.js <page>...    (from the root, or an area:  `pages.js` `pageFile()`)"
    )
    process.exit(2)
  }
  const written = []
  for (const page of pages) {
    if (/(^|\/)goals\//.test(page)) {
      console.error(`${page}:  a goals page keeps the old markup:  skipped`)
      continue
    }
    const file = pageFile(page)
    const { document } = parseHTML(readFileSync(file, "utf8"))
    const report = convertSections(document)
    console.log(describe(page, report))
    if (!report.converted) continue
    writeFileSync(file, serialize(document))
    written.push(file)
  }
  if (written.length && !tidy(written)) process.exit(1)
}
