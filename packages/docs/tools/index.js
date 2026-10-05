/**
 * `spell dev docs index`:  rewrite the lists in `index.html` from every page's `<title>` and description.
 * Usage (from `packages/docs`):  node scripts/index.js
 * - Groups:
 *   - Guides:  every page outside `templates/` and `epics/`
 *   - Epics:  `epics/<name>/<name>.plan.html`, each card's title after its state (`epicState()`:  planning, [3/6],
 *     done, stalled), read from its phase sections (`#phases`) and "updated" date;  the page server adds the
 *     running epics' cards (`RUNNING`)
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

/**
 * The page server's slot for running epics' cards, first in the Epics list (`$/server/page` `RunningEpics`
 * `MARKER`).
 */
const RUNNING = "<!-- running-epics -->"

/** Days without an update after which an epic with phases left shows as stalled. */
const STALLED_DAYS = 3

/**
 * The groups, in page order:  section id, title, icon (the rail's), which pages, what to say when there are none.
 * - an icon must be in `ICONS` in `bundle-spell-ui.js`
 */
const GROUPS = [
  {
    id: "guides",
    title: "Guides",
    icon: "book open",
    has: (path) => !/^(templates|epics)\//.test(path),
    none: "No guides yet."
  },
  {
    id: "epics",
    title: "Epics",
    icon: "layer group",
    has: (path) => path.startsWith("epics/"),
    none: "No epics yet:  run /epic in Claude Code."
  },
  {
    id: "templates",
    title: "Templates",
    icon: "copy",
    has: (path) => path.startsWith("templates/"),
    none: "No templates yet."
  }
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
 * - a plan doc's title without its `Epic: ` (`plan-doc.js` `TITLE_PREFIX`):  its card is in Epics already
 */
function describe(path) {
  const { document } = parseHTML(readFileSync(join(DOCS, path), "utf8"))
  const full = document.querySelector("title")?.textContent.trim() || path
  const title = path.startsWith("epics/") ? full.replace(/^Epic:\s*/, "") : full
  const description = document.querySelector('meta[name="description"]')?.getAttribute("content")?.trim() ?? ""
  // a plan's phases:  its phase sections in `#phases` (every plan doc has them):  `<ui-section data-phase>`, or
  // `section[data-phase]` in a doc not yet migrated (`plan-doc.js` reads them the same way).  Epics only:  the
  // runtime's test page (`spell-docs/ui-section-test.html`) has phases too
  const sections = path.startsWith("epics/")
    ? document.querySelectorAll("ui-section#phases ui-section[data-phase], #phases-section section[data-phase]")
    : []
  const phases = Array.from(sections, (section) => ({
    status: section.getAttribute("data-status"),
    label: phaseLabel(section)
  }))
  // a plan doc's "updated" stamp (`plan-doc.js` `touch()`):  how long since anyone worked on it
  const updated = document.getElementById("plan-updated")?.textContent.trim() || null
  return { path, title, description, phases, updated }
}

/** A phase section's title, whitespace collapsed:  its `header` (else `slot="header"`), or an old one's h3. */
function phaseLabel(section) {
  const source =
    section.localName === "ui-section"
      ? (section.getAttribute("header") ?? section.querySelector(':scope > [slot="header"]')?.textContent)
      : section.querySelector("h3")?.textContent
  return (source ?? "").replace(/\s+/g, " ").trim()
}

/**
 * One group's section:  a `<ui-section>` with the group's icon, and a card per page.
 * - Epics:  ALWAYS a card list (`ui-cards.spell-epics`), its first line the page server's slot for the running
 *   epics' cards (`RUNNING`):  they join the merged ones in one list
 */
function section(group, list) {
  const epics = group.id === "epics"
  const cards = list.map(epics ? epicCard : card)
  const body =
    epics || list.length
      ? `<ui-cards class="spell-grid${epics ? " spell-epics" : ""}" stackable>\n${epics ? `${RUNNING}\n` : ""}` +
        `${cards.join("\n")}\n</ui-cards>`
      : `<p class="meta">${text(group.none)}</p>`
  return `<ui-section id="${group.id}" header="${attr(group.title)}" sticky collapsible dividing>
<ui-icon slot="icon" name="${group.icon}"></ui-icon>
${body}
</ui-section>`
}

/** A page's card:  linked title, description, path. */
function card(page) {
  return `<ui-card><ui-content>
<ui-header><a href="${attr(page.path)}">${text(page.title)}</a></ui-header>
${page.description ? `<ui-description>${text(page.description)}</ui-description>` : ""}
<ui-meta>${text(page.path)}</ui-meta>
</ui-content></ui-card>`
}

/**
 * An epic's card:  its state mark before the title (`epicState()`), then as `card()`, the active phase in the
 * meta line.
 * - `data-epic`:  its name, so the page server drops this card when the epic is running in a worktree too
 * - `data-status`:  `done` or `open`, so the section counts it, and its filter steps through them (`open` blue,
 *   `done` grey:  `spell-doc-runtime.js`)
 * - SAME markup as `$/server/page` `RunningEpics`' cards:  change both
 */
function epicCard(page) {
  const state = epicState(page.phases, page.updated)
  const active = page.phases.find((phase) => phase.status === "active")
  return `<ui-card data-epic="${attr(page.path.split("/")[1])}" data-status="${state.done ? "done" : "open"}"><ui-content>
<ui-header>${state.mark} <a href="${attr(page.path)}">${text(page.title)}</a></ui-header>
${page.description ? `<ui-description>${text(page.description)}</ui-description>` : ""}
<ui-meta>${active ? `${text(active.label)} · ` : ""}${text(page.path)}</ui-meta>
</ui-content></ui-card>`
}

/**
 * An epic's state, from its phases and its "updated" date:  `{ done, mark }`, `mark` the HTML before its title.
 * - planning:  no phases yet (a blue thought bubble)
 * - done:  every phase done (a green check)
 * - stalled:  phases left, and no update for more than `STALLED_DAYS` (a yellow pause;  the date on hover)
 * - in progress:  `[3/6]`, phases done of all
 * - SAME as `$/server/page` `RunningEpics`' `stateMark()`:  change both
 */
function epicState(phases, updated) {
  const done = phases.filter((phase) => phase.status === "done").length
  if (!phases.length) return { done: false, mark: stateIcon("comment dots", "blue", "planning") }
  if (done === phases.length) return { done: true, mark: stateIcon("circle check", "green", "done") }
  const idle = updated ? (Date.now() - new Date(`${updated}T00:00`).getTime()) / 86_400_000 : 0
  if (idle > STALLED_DAYS) {
    return { done: false, mark: stateIcon("circle pause", "yellow", `stalled:  no update since ${updated}`) }
  }
  const count = `${done}/${phases.length}`
  return { done: false, mark: `<ui-label class="spell-epic-state" size="mini" basic>${count}</ui-label>` }
}

/** An epic state's icon:  `name` (in `ICONS`), `color`, `title` on hover. */
function stateIcon(name, color, title) {
  return `<ui-icon class="spell-epic-state" name="${name}" color="${color}" title="${attr(title)}"></ui-icon>`
}

/** Escape for HTML text. */
function text(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

/** Escape for a double-quoted attribute value. */
function attr(value) {
  return text(value).replace(/"/g, "&quot;")
}
