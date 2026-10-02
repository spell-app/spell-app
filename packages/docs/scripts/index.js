/**
 * `yarn docs:index`:  rewrite the lists in `index.html` from every page's `<title>` and description.
 * Usage (from `packages/docs`):  node scripts/index.js
 * - Groups:
 *   - Guides:  every page outside `templates/` and `plans/`
 *   - Plans:  `plans/<name>/<name>.html`, with a status badge read from its phase sections (`#phases`)
 *   - Templates:  `templates/**`
 * - Writes ONLY between `<!-- index:start -->` and `<!-- index:end -->`;  the rest of the page is hand-authored.
 * - Then tidies the page like any other (`pages.js` `tidy()`:  link targets, oxfmt), so a re-run with nothing new
 *   changes nothing.
 */
import { readFileSync, writeFileSync } from "node:fs"
import { join, relative } from "node:path"

import { parseHTML } from "linkedom"

import { DOCS, findPages, tidy } from "./pages.js"

/** The index page, relative to `DOCS`. */
const INDEX = "index.html"
const START = "<!-- index:start -->"
const END = "<!-- index:end -->"

/** The groups, in page order:  heading id, heading, which pages, what to say when there are none. */
const GROUPS = [
  { id: "guides", title: "Guides", has: (path) => !/^(templates|plans)\//.test(path), none: "No guides yet." },
  {
    id: "plans",
    title: "Plans",
    has: (path) => path.startsWith("plans/"),
    none: "No plans yet:  run /plan-doc in Claude Code."
  },
  { id: "templates", title: "Templates", has: (path) => path.startsWith("templates/"), none: "No templates yet." }
]

const pages = findPages()
  .map((path) => relative(DOCS, path))
  .filter((path) => path !== INDEX)
  .map(describe)

const index = join(DOCS, INDEX)
const html = readFileSync(index, "utf8")
const start = html.indexOf(START)
const end = html.indexOf(END)
if (start < 0 || end < start) {
  console.error(`${INDEX}:  missing ${START} ... ${END}`)
  process.exit(1)
}
const sections = GROUPS.map((group) =>
  section(
    group,
    pages.filter((page) => group.has(page.path))
  )
)
writeFileSync(index, `${html.slice(0, start)}${START}\n${sections.join("\n")}\n${END}${html.slice(end + END.length)}`)
if (!tidy([INDEX])) process.exit(1)
console.log(`${INDEX}:  ${GROUPS.map((g) => `${pages.filter((p) => g.has(p.path)).length} ${g.id}`).join(", ")}`)

/**
 * What the index shows for page `path`:  title, description, and a plan's status.
 * - title falls back to the file name, so a page without one still shows up (and looks wrong enough to fix)
 */
function describe(path) {
  const { document } = parseHTML(readFileSync(join(DOCS, path), "utf8"))
  const title = document.querySelector("title")?.textContent.trim() || path
  const description = document.querySelector('meta[name="description"]')?.getAttribute("content")?.trim() ?? ""
  // a plan's phases:  its phase sections in `#phases` (every plan doc has them, old layout or new)
  const phases = Array.from(document.querySelectorAll("#phases-section section[data-phase]"), (section) => ({
    status: section.getAttribute("data-status"),
    label: (section.querySelector("h3")?.textContent ?? "").replace(/\s+/g, " ").trim()
  }))
  return { path, title, description, phases }
}

/** One group's section:  a sticky h2 and a card per page. */
function section(group, list) {
  const body = list.length
    ? `<ui-cards class="spell-grid" stackable>\n${list.map(card).join("\n")}\n</ui-cards>`
    : `<p class="meta">${text(group.none)}</p>`
  return `<section class="s2">
<ui-sticky class="spell-h2"><h2 id="${group.id}">${group.title}</h2></ui-sticky>
${body}
</section>`
}

/** A page's card:  linked title, description, path, and a plan's status badge. */
function card(page) {
  return `<ui-card><ui-content>
<ui-header><a href="${attr(page.path)}">${text(page.title)}</a>${badge(page.phases)}</ui-header>
${page.description ? `<ui-description>${text(page.description)}</ui-description>` : ""}
<ui-meta>${text(page.path)}</ui-meta>
</ui-content></ui-card>`
}

/**
 * A plan's status:  the active phase (orange), all done (green), or not started (grey).
 * - nothing for a page with no phase list
 */
function badge(phases) {
  if (!phases.length) return ""
  const done = phases.filter((phase) => phase.status === "done").length
  const active = phases.find((phase) => phase.status === "active")
  const [color, label] = active
    ? ["orange", `${active.label} (${done}/${phases.length})`]
    : done === phases.length
      ? ["green", "done"]
      : ["grey", done ? `${done}/${phases.length} phases done` : "not started"]
  return ` <ui-label size="mini" color="${color}">${text(label)}</ui-label>`
}

/** Escape for HTML text. */
function text(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

/** Escape for a double-quoted attribute value. */
function attr(value) {
  return text(value).replace(/"/g, "&quot;")
}
