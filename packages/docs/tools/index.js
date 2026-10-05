/**
 * `spell dev docs index`:  write the docs home's area cards and each area's list page, from every page's `<title>`
 * and description (claude-design P5).
 * Usage (from `packages/docs`):  node tools/index.js
 * - The home, `pages/index.html`:  a routing page, one card per area in the top bar's order (`areaCards()`;  the
 *   site header's `PROPERTIES`), each with its count, written between `<!-- areas:start -->` and `<!-- areas:end -->`
 *   - NOT `index:start` / `index:end`:  the home is shared, so an older checkout's `index.js` (which wrote three lists
 *     into the home) runs against it too;  finding no markers, it stops instead of writing its lists back
 * - The list pages (`LISTS`), each `<area>/index.html`, written between `<!-- index:start -->` and
 *   `<!-- index:end -->`;  a missing one is made from `skeleton()` first, so the rest of it is hand-authored after:
 *   - Epics:  `epics/<name>/<name>.plan.html`, open ones first, each card's title after its state (`epicState()`:
 *     planning, [3/6], done, stalled), read from its phase sections (`#phases`) and "updated" date;  the page server
 *     adds the running epics' cards (`RUNNING`)
 *   - Guides:  `guides/**`
 *   - Templates:  `templates/**`, and the "Writing docs" notes (`WRITING_DOCS`, in its skeleton)
 *   - Brand:  `brand/**`
 * - Paths are from the checkout's root;  links from the page's own folder.
 * - Then tidies the pages like any other (`pages.js` `tidy()`:  link targets, oxfmt), so a re-run with nothing new
 *   changes nothing.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { join, relative } from "node:path"
import { pathToFileURL } from "node:url"

import { parseHTML } from "linkedom"

import { BRAND, EPICS, GOALS, GUIDES, HOME, LIST_PAGES, ROOT, TEMPLATES, findPages, tidy } from "./pages.js"

/** The docs home, from the checkout's root. */
const INDEX = relative(ROOT, HOME)

/** The home's markers:  its area cards go between. */
export const HOME_START = "<!-- areas:start -->"
export const HOME_END = "<!-- areas:end -->"

/** A list page's markers:  its cards go between. */
export const START = "<!-- index:start -->"
export const END = "<!-- index:end -->"

/**
 * The page server's slot for running epics' cards, first in the Epics list (`$/server/page` `RunningEpics`
 * `MARKER`).
 */
const RUNNING = "<!-- running-epics -->"

/** Days without an update after which an epic with phases left shows as stalled. */
const STALLED_DAYS = 3

/** Spell UI's component pages (tracked, per branch):  the home's Spell UI count. */
const UI_COMPONENTS = join(ROOT, "packages/ui/site/components")

/** The "Writing docs" notes, on the Templates page (the home had them before P5). */
const WRITING_DOCS = `<ui-section id="writing-docs" header="Writing docs" sticky collapsible dividing collapsed>
<ui-icon slot="icon" name="pen to square"></ui-icon>
<ul>
<li>Start from a template:  <code>spell dev docs new durable &lt;topic&gt;/&lt;topic&gt;.html --title "Title"</code>.</li>
<li>A plan doc:  run <code>/epic &lt;name&gt;</code> in Claude Code.  Never copy the plan template by hand.</li>
<li>The rules:  <a href="../packages/docs/AGENTS.md">AGENTS.md</a>.  How the pages work:
<a href="../guides/spell-docs/spell-docs.md">spell-docs.md</a>.</li>
<li><code>docs new</code> lists the page on its area's page;  after renaming one or changing its title, run
<code>spell dev docs index</code>.</li>
</ul>
</ui-section>`

/** The Brand page's notes:  the files beside its pages. */
const BRAND_NOTES = `<ui-section id="files" header="Files" sticky collapsible dividing collapsed>
<ui-icon slot="icon" name="folder"></ui-icon>
<ul>
<li><code>brand/design-system.json</code>:  the design system's push record (<code>spell dev design pushed</code>).</li>
<li><code>brand/README.md</code>:  what this folder holds.</li>
<li>More brand pages arrive with P11 (Brand) of epic <code>claude-design</code>, once the <code>design-system</code>
epic merges.</li>
</ul>
</ui-section>`

/**
 * The list pages, each `<area>/index.html`:  section id, title, icon (the rail's, and the home card's), which pages,
 * what to say when there are none, and its skeleton's description, lede and notes (`extra`).
 * - an icon must be in `ICONS` in `bundle-spell-ui.js`
 */
export const LISTS = [
  {
    id: "epics",
    dir: EPICS,
    title: "Epics",
    icon: "layer group",
    has: (path) => path.startsWith("epics/"),
    none: "No epics yet:  run /epic in Claude Code.",
    description: "Every epic's plan doc, open ones first:  phases, questions, decisions.",
    lede: "Every epic's plan doc, open ones first:  one per <code>/epic</code> session, with its phases, questions, decisions and log."
  },
  {
    id: "guides",
    dir: GUIDES,
    title: "Guides",
    icon: "book open",
    has: (path) => path.startsWith("guides/"),
    none: "No guides yet.",
    description: "Every guide in the spell monorepo:  design notes, references, how things work and why.",
    lede: "Every guide in the spell monorepo:  design notes, references, how things work and why."
  },
  {
    id: "templates",
    dir: TEMPLATES,
    title: "Templates",
    icon: "copy",
    has: (path) => path.startsWith("templates/"),
    none: "No templates yet.",
    description: "A starting point for every kind of docs page, and how to write one.",
    lede: "A starting point for every kind of docs page, and how to write one.",
    extra: WRITING_DOCS
  },
  {
    id: "brand",
    dir: BRAND,
    title: "Brand",
    icon: "palette",
    has: (path) => path.startsWith("brand/"),
    none: "No brand pages yet.",
    description:
      "Spell's brand pages:  built in Claude Design on the Spell design system, brought back with /design pull.",
    lede: "Spell's brand pages:  built in Claude Design on the Spell design system, brought back with <code>/design pull</code>.",
    extra: BRAND_NOTES
  }
]

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main()

/** Write every list page, then the home's cards;  tidy them;  print what each holds. */
function main() {
  const lists = new Set(LIST_PAGES.map((file) => relative(ROOT, file)))
  const pages = [...findPages(), ...findPages(BRAND)]
    .map((path) => relative(ROOT, path))
    .filter((path) => path !== INDEX && !lists.has(path))
    .map(describe)
  const written = []
  const report = []
  for (const list of LISTS) {
    if (!existsSync(list.dir)) continue
    const file = join(list.dir, "index.html")
    if (!existsSync(file)) writeFileSync(file, skeleton(list))
    const mine = pages.filter((page) => list.has(page.path))
    if (!writeBetween(file, START, END, listSection(list, mine))) process.exit(1)
    written.push(file)
    report.push(`${relative(ROOT, file)}:  ${mine.length}`)
  }
  const cards = areaCards(pages)
  if (!writeBetween(HOME, HOME_START, HOME_END, homeSection(cards))) process.exit(1)
  if (!tidy([HOME, ...written])) process.exit(1)
  console.log(`${INDEX}:  ${cards.length} areas;  ${report.join(", ")}`)
}

/**
 * Replace what's between `start` and `end` in `file` with `body`;  `false` (and why, on stderr) when the markers are
 * missing.
 */
function writeBetween(file, start, end, body) {
  const html = readFileSync(file, "utf8")
  const from = html.indexOf(start)
  const to = html.indexOf(end)
  if (from < 0 || to < from) {
    console.error(`${relative(ROOT, file)}:  missing ${start} ... ${end}`)
    return false
  }
  writeFileSync(file, `${html.slice(0, from)}${start}\n${body}\n${end}${html.slice(to + end.length)}`)
  return true
}

/**
 * What the lists show for page `path`:  title, description, and a plan's status.
 * - title falls back to the file name, so a page without one still shows up (and looks wrong enough to fix)
 * - a plan doc's title without its `Epic: ` (`plan-doc.js` `TITLE_PREFIX`):  its card is in Epics already
 */
function describe(path) {
  const { document } = parseHTML(readFileSync(`${ROOT}/${path}`, "utf8"))
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

////////////////
// ## The home
////////////////

/**
 * The home's cards, in the top bar's order (Owen, 2026-10-05, Q6 of `claude-design`):  Epics, Guides, Brand,
 * Spell UI, Templates, Goals, App.  Each `{ id, title, icon, href?, count?, description, meta? }`.
 * - `id`:  the card's id, so the old `pages/index.html#epics` / `#guides` / `#templates` links land on its card
 * - `href`:  from the home's folder;  none for the App, which only the page server has (`/editor/`):  a link there
 *   would break from `file://`, and `doc-links.js --check` can't resolve it
 * - Spell UI:  its site's own page (`packages/ui/site/index.html`);  the top bar's tab opens it at `/ui/`
 * - `pages`:  every page `describe()`d, so the counts come from the same data as the list pages
 */
export function areaCards(pages) {
  const of = (id) => pages.filter((page) => LISTS.find((list) => list.id === id).has(page.path))
  const epics = of("epics").map((page) => epicState(page.phases, page.updated))
  const done = epics.filter((state) => state.done).length
  return [
    {
      id: "epics",
      title: "Epics",
      icon: "layer group",
      href: "../epics/index.html",
      count: `${epics.length - done} running · ${done} done`,
      description: "Plan docs, one per /epic session:  phases, questions, decisions and the log of the work."
    },
    {
      id: "guides",
      title: "Guides",
      icon: "book open",
      href: "../guides/index.html",
      count: plural(of("guides").length, "guide"),
      description: "Design notes, references and how-tos:  how each part of spell works, and why."
    },
    {
      id: "brand",
      title: "Brand",
      icon: "palette",
      href: "../brand/index.html",
      count: plural(of("brand").length, "page"),
      description: "Spell's brand, built in Claude Design on the Spell design system:  the pony, for now."
    },
    {
      id: "spell-ui",
      title: "Spell UI",
      icon: "puzzle piece",
      href: "../packages/ui/site/index.html",
      count: plural(htmlFiles(UI_COMPONENTS).filter((name) => name !== "index.html").length, "component page"),
      description: "Fomantic UI reborn as ui-* custom elements, on Solid 2:  every element, with examples and its API.",
      meta: "best served at /ui/, by the page server"
    },
    {
      id: "templates",
      title: "Templates",
      icon: "copy",
      href: "../templates/index.html",
      count: plural(of("templates").length, "template"),
      description: "A starting point for every kind of page, and the notes on writing docs."
    },
    {
      id: "goals",
      title: "Goals",
      icon: "bullseye",
      href: "../goals/index.html",
      count: plural(goalSets(), "goal set"),
      description: "The plan for each project:  goals by topic, the questions still open, Owen's thoughts on them."
    },
    {
      id: "app",
      title: "App",
      icon: "wand magic sparkles",
      description: "The spell editor:  write and run spell in the browser.",
      meta: "Page server only:  /editor/, the top bar's App tab (spell dev server ensure)"
    }
  ]
}

/** The home's one section:  the area cards in a grid. */
function homeSection(cards) {
  return `<ui-section id="areas" header="Areas" sticky collapsible dividing>
<ui-icon slot="icon" name="compass"></ui-icon>
<ui-cards class="spell-grid spell-areas" stackable>
${cards.map(areaCard).join("\n")}
</ui-cards>
</ui-section>`
}

/**
 * An area's card:  icon and linked title, its count, what's there.
 * - `target="_self"`:  the home is a site's front page, so its cards navigate in place, as the top bar's tabs do
 *   (`doc-links.js` exempts `_self` from one-tab-per-destination)
 */
function areaCard(area) {
  const title = area.href
    ? `<a href="${attr(area.href)}" target="_self">${text(area.title)}</a>`
    : `<span>${text(area.title)}</span>`
  const meta = [area.count, area.meta].filter(Boolean).map(text).join(" · ")
  return `<ui-card id="${area.id}"><ui-content>
<ui-header><ui-icon name="${area.icon}"></ui-icon> ${title}</ui-header>
${meta ? `<ui-meta>${meta}</ui-meta>` : ""}
<ui-description>${text(area.description)}</ui-description>
</ui-content></ui-card>`
}

/** `count` and `noun`, plural unless 1:  `3 guides`, `1 page`. */
function plural(count, noun) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`
}

/** The `.html` files directly in `dir`;  none when it's missing. */
function htmlFiles(dir) {
  return existsSync(dir) ? readdirSync(dir).filter((name) => name.endsWith(".html")) : []
}

/** How many goal sets there are:  folders of `goals/` with an `index.html`. */
function goalSets() {
  if (!existsSync(GOALS)) return 0
  return readdirSync(GOALS, { withFileTypes: true }).filter(
    (entry) => !entry.name.startsWith(".") && existsSync(join(GOALS, entry.name, "index.html"))
  ).length
}

////////////////
// ## The list pages
////////////////

/**
 * A new list page:  site header, breadcrumb back to the home, sticky title, lede, the markers, then `list.extra`.
 * - every list page is `<area>/index.html`, one folder deep:  `..` up to the root
 * - written once, when missing;  after that only between the markers
 */
export function skeleton(list) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${text(list.title)}</title>
<meta name="description" content="${attr(list.description)}" />
<link rel="stylesheet" href="../packages/docs/tools/_assets/spell-doc.css" />
</head>
<body class="spell-doc-page">
<spell-site-header root=".."></spell-site-header>
<div class="spell-doc">
<main class="spell-doc-main">
<ui-breadcrumb class="spell-crumbs" size="small" aria-label="Breadcrumb">
<ui-breadcrumb-section href="../pages/index.html" target="_self">Docs</ui-breadcrumb-section>
<ui-breadcrumb-section active>${text(list.title)}</ui-breadcrumb-section>
</ui-breadcrumb>
<ui-sticky class="spell-h1"><header class="spell-page-head"><h1>${text(list.title)}</h1></header></ui-sticky>
<p class="lede">${list.lede}</p>
${START}
${END}
${list.extra ?? ""}
</main>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
<script src="../packages/docs/tools/_assets/spell-ui.js"></script>
</body>
</html>
`
}

/**
 * A list page's section:  a `<ui-section>` with the list's icon, and a card per page.
 * - Epics:  ALWAYS a card list (`ui-cards.spell-epics`), its first line the page server's slot for the running
 *   epics' cards (`RUNNING`):  they join the merged ones in one list;  open epics before done ones (`epicOrder()`)
 * - open, not `collapsed`:  the list IS the page
 */
export function listSection(list, pages) {
  const epics = list.id === "epics"
  const from = relative(ROOT, list.dir)
  const cards = epics ? epicOrder(pages).map((page) => epicCard(page, from)) : pages.map((page) => card(page, from))
  const body =
    epics || pages.length
      ? `<ui-cards class="spell-grid${epics ? " spell-epics" : ""}" stackable>\n${epics ? `${RUNNING}\n` : ""}` +
        `${cards.join("\n")}\n</ui-cards>`
      : `<p class="meta">${text(list.none)}</p>`
  return `<ui-section id="${list.id}" header="${attr(list.title)}" sticky collapsible dividing>
<ui-icon slot="icon" name="${list.icon}"></ui-icon>
${body}
</ui-section>`
}

/** Epic `pages` with the open ones first, each group in its own order (by name). */
export function epicOrder(pages) {
  const done = (page) => epicState(page.phases, page.updated).done
  return [...pages.filter((page) => !done(page)), ...pages.filter(done)]
}

/** Page `path` (from the checkout's root) as a link from folder `from` (a list page's):  `solid/solid-2.html`. */
function href(path, from) {
  return relative(from, path)
}

/** A page's card, on the list page in folder `from`:  linked title, description, path. */
function card(page, from) {
  return `<ui-card><ui-content>
<ui-header><a href="${attr(href(page.path, from))}">${text(page.title)}</a></ui-header>
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
function epicCard(page, from) {
  const state = epicState(page.phases, page.updated)
  const active = page.phases.find((phase) => phase.status === "active")
  return `<ui-card data-epic="${attr(page.path.split("/")[1])}" data-status="${state.done ? "done" : "open"}"><ui-content>
<ui-header>${state.mark} <a href="${attr(href(page.path, from))}">${text(page.title)}</a></ui-header>
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
