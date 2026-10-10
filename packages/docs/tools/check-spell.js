/**
 * Check a `.html` doc in a real browser.
 * Usage:  node scripts/check-spell.js <folder>/<doc>.html [outDir]
 * - screenshots:  desktop top, desktop mid-page, phone mid-page (outDir, default a temp folder);  a plan doc also a
 *   phone-width open item, its line stuck (`phone-item.png`)
 * - fails (exit 1) on:
 *   - console / page errors
 *   - a `ui-*` or `epic-*` element (the `epics` pack's, a plan doc's) that isn't defined, or never rendered (no
 *     shadow root)
 *   - a toolbar (`nav.spell-toolbar`, epic `airplane` P8) that doesn't list every top-level section (the goals
 *     pages':  the h2s heading a sticky section;  a plan doc's:  its `<epic-*>` blocks), or an entry that points
 *     nowhere;  and a page that still draws the old floating rail (`nav.spell-rail`)
 *   - horizontal scroll at phone width
 *   - a content column squeezed at phone width (a wide-screen grid rule leaking into the narrow layout)
 *   - a top-level section's title (`<ui-section>` pages, a plan doc's `<epic-*>` blocks) or h2 (`section.s2` pages)
 *     that doesn't stick when scrolled into its section, or sticks under the fixed site header.  A plan doc's start
 *     folded:  its largest item section is opened first (`openBiggestSection()`)
 *   - no toolbar entry marked current after scrolling
 *   - a `ui-accordion.spell-code` without a `<pre>`
 *   - a toolbar not stuck at the top at phone width, or wider than the window
 *   - a plan doc's open item (`<epic-item>`, epic `windows-and-review` Q6) whose line doesn't stick right under its
 *     section's stuck title while its details are read;  at desktop and phone width (`checkItemLine()`)
 * - loads the page from `file://`, or from the page server when its `<body>` says `data-spell-needs-server`
 * - reports, never fails on:  icons with no `<svg>` drawn in their shadow tree (no reliable "done loading" signal)
 * - prints a JSON summary on stdout (last thing written), problems on stderr
 * - Look at the screenshots too:  the checks can't see overlap, clipping or ugly wrapping.
 */
import { mkdtempSync, mkdirSync, readFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { pathToFileURL } from "node:url"

import { chromium } from "playwright"

import { ensurePageServer, pageFile, serverUrl } from "./pages.js"

/**
 * Elements the page's packs define, as `ui-*` (Spell UI) and `epic-*` (the `epics` pack, plan docs):  a tag that
 * looks like one of theirs must be defined and draw into a shadow root.
 */
const PACK_TAG = /^(ui|epic)-/

/** The page's navigation:  its toolbar, a plan doc's or any other page's (`spell-doc-runtime.js` `buildNavigation()`). */
const NAV = "nav.spell-toolbar"

const [docArg, outArg] = process.argv.slice(2)
if (!docArg) {
  console.error(
    "usage:  node tools/check-spell.js <page> [outDir]   (e.g. guides/solid/solid-2.html:  `pages.js` `pageFile()`)"
  )
  process.exit(2)
}
const docPath = pageFile(docArg, process.cwd())
const out = outArg ?? mkdtempSync(join(tmpdir(), "check-spell-"))
mkdirSync(out, { recursive: true })
const seen = new Map()
const url = pageUrl(docPath)
const browser = await chromium.launch()

const desk = await open({ width: 1440, height: 900 })
await desk.screenshot({ path: join(out, "desk-top.png") })
const desktop = await desk.evaluate(inspectPage, NAV)
if (desktop.undefinedTags.length) problem(`undefined elements:  ${desktop.undefinedTags.join(", ")}`)
for (const [tag, count] of Object.entries(desktop.unrendered)) problem(`${count} <${tag}> without a shadow root`)
if (desktop.missingFromRail.length)
  problem(`top-level sections missing from the toolbar:  ${desktop.missingFromRail.join(", ")}`)
if (desktop.oldRail) problem("the page drew the old floating rail, not a toolbar")
if (desktop.danglingRail.length) problem(`toolbar entries pointing nowhere:  ${desktop.danglingRail.join(", ")}`)
if (desktop.codeWithoutPre) problem(`${desktop.codeWithoutPre} ui-accordion.spell-code without a <pre>`)
if (desktop.icons.blankCount) console.error(`NOTE: ${desktop.icons.blankCount} icon(s) with no <svg> drawn`)

await desk.evaluate(openBiggestSection)
await desk.waitForTimeout(800)
const middle = await desk.evaluate(scrollToMiddleSection)
await desk.waitForTimeout(600)
await desk.screenshot({ path: join(out, "desk-mid.png") })
const stuck = await desk.evaluate(stuckAndActive, { id: middle.id, nav: NAV })
if (middle.id && !stuck.stuck)
  problem(
    `${middle.tag} #${middle.id} not stuck at the top (its title's top at ${stuck.top}px, ${stuck.covering ?? "nothing"} showing at its middle)`
  )
if (desktop.topLevel && !stuck.active) problem("no toolbar entry marked current after scrolling")

const fold = await checkFold(desk)
if (fold.problem) problem(`fold:  ${fold.problem}`)
const itemLine = { desktop: await checkItemLine(desk) }

const phone = await open({ width: 390, height: 844 })
await phone.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))
await phone.waitForTimeout(400)
await phone.screenshot({ path: join(out, "phone-mid.png") })
const overflow = await phone.evaluate(() => document.documentElement.scrollWidth - innerWidth)
if (overflow > 0) problem(`${overflow}px horizontal scroll at phone width`)
itemLine.phone = await checkItemLine(phone, join(out, "phone-item.png"))
await phone.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))
const mainWidth = await phone.evaluate(() => Math.round(document.querySelector("main").getBoundingClientRect().width))
if (mainWidth < 390 - 40) problem(`content column only ${mainWidth}px wide at phone width (390px)`)
const rail = await phone.evaluate(navOnScreen, NAV)
if (desktop.topLevel && !rail.shown) problem("the toolbar isn't shown at the top at phone width")

await browser.close()
const problems = [...seen].map(([text, count]) => (count > 1 ? `${text}  (x${count})` : text))
const summary = {
  doc: docPath,
  ok: problems.length === 0,
  problems,
  elements: desktop.elements,
  topLevel: desktop.topLevel,
  railEntries: desktop.railEntries,
  codeBlocks: desktop.codeBlocks,
  icons: {
    total: desktop.icons.total,
    drawn: desktop.icons.total - desktop.icons.blankCount,
    blank: desktop.icons.blank
  },
  middle: middle.id,
  stuck: stuck.stuck,
  atTop: stuck.covering,
  active: stuck.active,
  fold,
  itemLine,
  overflow,
  mainWidth,
  rail,
  screenshots: out
}
for (const problem of problems) console.error("PROBLEM:", problem)
console.log(JSON.stringify(summary, null, 2))
process.exit(problems.length ? 1 : 0)

/**
 * Where to load `file` from:  `file://`, or the page server for a page that needs one.
 * - a page whose `<body>` says `data-spell-needs-server` (the `commands` template:  it fetches its JSON) loads from
 *   this checkout's page server, started if need be;  a server that won't start is a problem, and `file://` is used
 */
function pageUrl(file) {
  const local = pathToFileURL(resolve(file)).href
  if (!/<body\b[^>]*\bdata-spell-needs-server\b/.test(readFileSync(file, "utf8"))) return local
  const served = ensurePageServer()
  if (served) return serverUrl(served.base, file)
  problem("page needs the page server, and it didn't start")
  return local
}

/**
 * Record a problem, once per distinct first line:  a broken element logs the same error for every instance.
 * - long stack traces are cut to their first line, 300 characters
 */
function problem(text) {
  const line = String(text).split("\n")[0].slice(0, 300)
  seen.set(line, (seen.get(line) ?? 0) + 1)
}

/** A page at `viewport`, collecting errors as problems, once every pack tag in it is defined (or 10s passed). */
async function open(viewport) {
  const page = await browser.newPage({ viewport })
  const label = `${viewport.width}px`
  page.on("pageerror", (error) => problem(`page error (${label}):  ${error}`))
  page.on("console", (message) => message.type() === "error" && problem(`console (${label}):  ${message.text()}`))
  await page.goto(url)
  await settle(page)
  return page
}

/** Wait until every pack tag on `page` is defined (or 10s passed), then a second for the runtime. */
async function settle(page) {
  await page
    .waitForFunction(
      (pattern) =>
        [...document.querySelectorAll("*")].every(
          (el) => !new RegExp(pattern).test(el.localName) || customElements.get(el.localName)
        ),
      PACK_TAG.source,
      { timeout: 10000 }
    )
    .catch(() => {})
  await page.waitForTimeout(1000)
}

/**
 * The FOLD check:  a reader's fold works, and the page remembers it.  The check that would have caught the old
 * markup's dead chevron (2026-10-01).
 * - target:  `<ui-section>` pages, the first top-level `ui-section[collapsible]` (an open one if any);  old pages,
 *   the first `section.s2`'s h2
 * - clicks its toggle as a reader would:  the shadow `button[part~=toggle]`, or the old chevron `ui-button.spell-fold`
 * - expects it folded (`collapsed` + `:state(collapsed)`, or `section.spell-folded`) with its content hidden;  still
 *   folded after a reload;  unfolded by a second click
 * - returns `{ target, steps, problem? }`;  starts from the page's own state, whatever it is
 * - SIDE EFFECT:  clears the page's saved folds (`localStorage` `spell-folds:<path>`) at the end
 */
async function checkFold(page) {
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(300)
  const target = await page.evaluate(foldTarget)
  if (!target) return { target, steps: [], problem: "no foldable section on the page" }
  const steps = []
  const initial = await page.evaluate(foldState, target)
  steps.push({ step: "initial", ...initial })
  let problem = await toggleAndExpect("click", !initial.folded)
  if (!problem) {
    await page.reload()
    await settle(page)
    const state = await page.evaluate(foldState, target)
    steps.push({ step: "reload", ...state })
    if (state.folded !== !initial.folded)
      problem = `#${target.id} ${initial.folded ? "folded" : "unfolded"} again after a reload:  the fold wasn't remembered`
  }
  if (!problem) problem = await toggleAndExpect("click again", initial.folded)
  await page.evaluate(() => localStorage.removeItem(`spell-folds:${location.pathname}`))
  return problem ? { target, steps, problem } : { target, steps }

  /** Click the target's toggle, wait out the fold animation, and check it is `folded`;  a problem, or undefined. */
  async function toggleAndExpect(step, folded) {
    const toggle = await page.evaluateHandle(foldToggle, target)
    const element = toggle.asElement()
    if (!element) return `#${target.id} has no fold toggle`
    try {
      await element.click({ timeout: 3000 })
    } catch (error) {
      return `#${target.id}'s toggle can't be clicked:  ${String(error).split("\n")[0]}`
    }
    await page.waitForTimeout(700)
    const state = await page.evaluate(foldState, target)
    steps.push({ step, ...state })
    const word = folded ? "fold" : "unfold"
    if (state.folded !== folded) return `#${target.id} didn't ${word} on a ${step} of its toggle`
    if (state.contentVisible === folded)
      return `#${target.id} ${word}ed, but its content is ${folded ? "still" : "not"} visible`
    return undefined
  }
}

/**
 * The ITEM LINE check (plan docs, epic `windows-and-review` Q6):  an open item's line sticks right under its
 * section's stuck title while its details are read.
 * - target:  the first `<epic-item>` with details (`source`, or children of its own) in a top-level item section;
 *   its section and it opened, its part loaded;  details shorter than two windows get filler paragraphs
 *   (`p[data-check-filler]`), and `main` room below, so the page can scroll anywhere in them
 * - scrolled to the middle of its details:  its line's top within 2px of its section's stuck title's bottom
 * - `shot`:  a screenshot of the stuck state, when given
 * - returns `{ target, line, under }`, or `{ target: null }` on a page without plan items;  records problems
 * - SIDE EFFECT:  a reload afterwards drops the filler and the room
 */
async function checkItemLine(page, shot) {
  const label = `${page.viewportSize().width}px`
  const target = await page.evaluate(openItem)
  if (!target) return { target: null }
  await page
    .waitForFunction(
      (id) => {
        const item = document.getElementById(id)
        return !item.hasAttribute("source") || item.matches(":state(loaded), :state(error)")
      },
      target,
      { timeout: 5000 }
    )
    .catch(() => {})
  await page.waitForTimeout(400)
  await page.evaluate(lengthenItem, target)
  await page.waitForTimeout(400)
  const stuck = await page.evaluate(itemStuck, target)
  if (shot) await page.screenshot({ path: shot })
  if (Math.abs(stuck.line - stuck.under) > 2)
    problem(
      `item ${target} (${label}):  its line at ${stuck.line}px, not stuck under its section's title (${stuck.under}px)`
    )
  await page.reload()
  await settle(page)
  return { target, ...stuck }
}

/** In the page:  open the first plan item with details, and the blocks around it;  its id, or null. */
function openItem() {
  const blocks = "epic-overview, epic-section, epic-phase"
  const item = [...document.querySelectorAll("main epic-page > epic-section > epic-item")].find(
    (it) => it.hasAttribute("source") || [...it.children].some((child) => !child.hasAttribute("slot"))
  )
  if (!item) return null
  for (let block = item.parentElement.closest(blocks); block; block = block.parentElement?.closest(blocks))
    block.open = true
  item.open = true
  return item.id
}

/** In the page:  item `id`'s details at least two windows tall (filler paragraphs), and room below `main`. */
function lengthenItem(id) {
  const item = document.getElementById(id)
  for (let count = 0; count < 40 && item.getBoundingClientRect().height < 2 * innerHeight; count++) {
    const filler = document.createElement("p")
    filler.dataset.checkFiller = ""
    filler.textContent = "Filler for the item line check, a line of text long enough to reach the right edge. ".repeat(
      3
    )
    item.append(filler)
  }
  document.querySelector("main").style.paddingBottom = `${2 * innerHeight}px`
}

/**
 * In the page, scrolled to the middle of item `id`'s details:  where its line is (`line`), and where its section's
 * stuck title ends (`under`):  the title of the `<ui-section>` the section draws in its shadow root.
 */
function itemStuck(id) {
  const item = document.getElementById(id)
  const box = item.getBoundingClientRect()
  window.scrollBy(0, box.top + box.height / 2 - innerHeight / 2)
  const line = item.shadowRoot.querySelector('[part~="line"]').getBoundingClientRect()
  const section = item.parentElement.closest("epic-section")
  const title = section.shadowRoot.querySelector("ui-section").shadowRoot.querySelector('[part~="title"]')
  return { line: Math.round(line.top), under: Math.round(title.getBoundingClientRect().bottom) }
}

/**
 * The section the fold check works on:  `{ id, kind }` (`ui-section`;  `epic` for a plan doc's top-level block;
 * `section` for the old markup's h2 id).
 */
function foldTarget() {
  // one with content to hide, open to start with, if there is one
  const filled = (section) => [...section.children].some((child) => !child.hasAttribute("slot"))
  const blocks = [...document.querySelectorAll("main epic-page > :is(epic-overview, epic-section)[id]")]
  if (blocks.length) {
    const best = blocks.find((block) => filled(block) && block.open) ?? blocks.find(filled) ?? blocks[0]
    return { id: best.id, kind: "epic" }
  }
  const sections = [...document.querySelectorAll("main > ui-section[collapsible][id]")]
  if (sections.length) {
    const best =
      sections.find((section) => filled(section) && !section.hasAttribute("collapsed")) ??
      sections.find(filled) ??
      sections[0]
    return { id: best.id, kind: "ui-section" }
  }
  const headings = [...document.querySelectorAll("main section.s2 > ui-sticky > h2[id]")]
  const h2 = headings.find((heading) => heading.closest("section").children.length > 1) ?? headings[0]
  return h2 ? { id: h2.id, kind: "section" } : null
}

/**
 * The element a reader clicks to fold the target:  the shadow toggle button (a plan doc's block:  the one of the
 * `<ui-section>` it draws in its shadow root), or the old chevron host.
 */
function foldToggle({ id, kind }) {
  const element = document.getElementById(id)
  const section = kind === "epic" ? element?.shadowRoot?.querySelector("ui-section") : element
  if (kind !== "section") return section?.shadowRoot?.querySelector('button[part~="toggle"]') ?? null
  return element?.querySelector(":scope > ui-button.spell-fold") ?? null
}

/**
 * The target's fold:  `{ folded, contentVisible }`.
 * - `<ui-section>`:  folded when its `collapsed` is true AND it says `:state(collapsed)`;  content:  its first
 *   unslotted child
 * - a plan doc's block:  folded when it isn't `open` and doesn't say `:state(open)`;  content:  the same
 * - old markup:  `section.spell-folded`;  content:  the element after the heading's `ui-sticky`
 * - visible:  `checkVisibility()`, which sees `hidden="until-found"` (content-visibility) and `display: none`
 */
function foldState({ id, kind }) {
  const element = document.getElementById(id)
  if (kind === "epic") {
    const content = [...element.children].find((child) => !child.hasAttribute("slot"))
    return {
      folded: !element.open && !element.matches(":state(open)"),
      contentVisible: content ? content.checkVisibility({ visibilityProperty: true }) : null
    }
  }
  if (kind === "ui-section") {
    let state = !!element.collapsed
    try {
      state = element.matches(":state(collapsed)")
    } catch {
      // a browser without custom states:  the property alone
    }
    const content = [...element.children].find((child) => !child.hasAttribute("slot"))
    return {
      folded: !!element.collapsed && state,
      contentVisible: content ? content.checkVisibility({ visibilityProperty: true }) : null
    }
  }
  const section = element.closest("section")
  const content = section.children[1]
  return {
    folded: section.classList.contains("spell-folded"),
    contentVisible: content ? content.checkVisibility({ visibilityProperty: true }) : null
  }
}

/**
 * Static checks, run in the page:  element definitions and rendering, the rail vs the top-level sections, code
 * blocks, icons.
 * - the packs' elements:  `ui-*` (Spell UI) and `epic-*` (the `epics` pack:  `PACK_TAG`, written out here, as this
 *   runs in the page)
 * - "rendered" means has a shadow root:  every @spell-app/ui element renders into one, and so does every pack's.
 * - icons:  `<ui-icon>` plus any `ui-*` with an `icon` attribute, looked for an `<svg>` anywhere in its shadow tree.
 */
function inspectPage(nav) {
  const all = [...document.querySelectorAll("*")].filter((el) => /^(ui|epic)-/.test(el.localName))
  const elements = {}
  const unrendered = {}
  for (const el of all) {
    elements[el.localName] = (elements[el.localName] ?? 0) + 1
    if (customElements.get(el.localName) && !el.shadowRoot)
      unrendered[el.localName] = (unrendered[el.localName] ?? 0) + 1
  }
  const undefinedTags = Object.keys(elements).filter((tag) => !customElements.get(tag))
  // the toolbar's entries:  the top-level sections (a plan doc's top-level blocks), or the h2s heading a sticky section
  const top = "main > ui-section[id], main epic-page > :is(epic-overview, epic-section, epic-phase)[id]"
  const sections = [...document.querySelectorAll(top)]
  const topLevel = (
    sections.length ? sections : [...document.querySelectorAll("main section.s2 > ui-sticky > h2[id]")]
  ).map((element) => element.id)
  const railIds = [...document.querySelectorAll(`:is(${nav}) [data-rail]`)].map((entry) => entry.dataset.rail)
  const icons = all.filter(
    (el) => el.localName === "ui-icon" || (el.localName.startsWith("ui-") && el.hasAttribute("icon"))
  )
  const blank = icons.filter((el) => !hasSvg(el.shadowRoot))
  return {
    elements,
    unrendered,
    undefinedTags,
    topLevel: topLevel.length,
    railEntries: railIds.length,
    oldRail: !!document.querySelector("nav.spell-rail"),
    danglingRail: railIds.filter((id) => !document.getElementById(id)),
    missingFromRail: topLevel.filter((id) => !railIds.includes(id)),
    codeBlocks: document.querySelectorAll("ui-accordion.spell-code").length,
    // a `<ui-code>` draws its own `<pre>`, in its shadow root
    codeWithoutPre: [...document.querySelectorAll("ui-accordion.spell-code")].filter(
      (a) => !a.querySelector("pre, ui-code")
    ).length,
    icons: { total: icons.length, blankCount: blank.length, blank: blank.slice(0, 10).map(describe) }
  }

  /** Whether `root` or any shadow root nested in it holds an `<svg>`. */
  function hasSvg(root) {
    if (!root) return false
    if (root.querySelector("svg")) return true
    return [...root.querySelectorAll("*")].some((el) => hasSvg(el.shadowRoot))
  }

  /** Short label for an element in the report, e.g. `ui-input[icon=search]`. */
  function describe(el) {
    const icon = el.getAttribute("icon") ?? el.getAttribute("name") ?? el.textContent.trim().slice(0, 20)
    return `${el.localName}[${icon}]`
  }
}

/**
 * In the page:  a plan doc starts folded, so nothing would be tall enough to stick over:  open its top-level item
 * section with the most items (they're in the doc itself, never in a part), as a reader would to read it.  Not saved
 * (no event):  the fold check starts from it.
 */
function openBiggestSection() {
  const sections = [...document.querySelectorAll("main epic-page > epic-section[id]")]
  const items = (section) => section.querySelectorAll(":scope > epic-item").length
  const biggest = sections.sort((a, b) => items(b) - items(a))[0]
  if (biggest && items(biggest) > 2) biggest.open = true
}

/**
 * Scroll into the middle top-level section (`main > ui-section`, a plan doc's top-level block, or `section.s2`),
 * part way down, and return its id (the h2's, for `section.s2`) and what it is.
 * - only sections that can scroll up to the top:  a short page's last section never sticks
 */
function scrollToMiddleSection() {
  const room = document.documentElement.scrollHeight - innerHeight
  // a section barely taller than its title (an empty "Todos" in a new plan doc) has no middle to stick over:  skip it
  const top = "main > ui-section, main epic-page > :is(epic-overview, epic-section), section.s2"
  const sections = [...document.querySelectorAll(top)].filter(
    (s) => s.getBoundingClientRect().top + scrollY + 200 < room && s.offsetHeight > 200
  )
  const middle = sections[Math.floor(sections.length / 2)]
  middle?.scrollIntoView()
  window.scrollBy(0, Math.min(600, (middle?.offsetHeight ?? 0) / 2))
  if (middle?.localName.startsWith("epic-")) return { id: middle.id, tag: middle.localName }
  const section = middle?.localName === "ui-section"
  return { id: section ? middle.id : middle?.querySelector("h2")?.id, tag: section ? "ui-section" : "h2" }
}

/**
 * Whether section / h2 `id`'s title sits at the top of the viewport, and which rail entry is current.
 * - stuck:  its title's top is within 160px BELOW the fixed site header (`--spell-site-header-height`;  never under
 *   it) -- room for a sticky bar above it, e.g. a plan doc's page header, CHEATSHEET's filter -- AND it's what shows
 *   at its own middle.  Scrolled mid-section, a title that DIDN'T stick
 *   is far above;  one stuck but covered, e.g. by an h3 sticking at the same offset, doesn't count.
 *   - `<ui-section>`:  its title is its shadow `title` part, and it must ALSO say `:state(stuck)`;  what shows
 *     there is the section host (the shadow retargets to it), not a nested section's
 *   - a plan doc's block:  the same, of the `<ui-section>` it draws in its shadow root;  what shows there is the
 *     block's host
 *   - h2:  one its short section's end pushed out (`:state(bound)`) counts:  it stuck, then left with its section
 * - active:  the rail's `selected` entry
 */
function stuckAndActive({ id, nav }) {
  const element = id && document.getElementById(id)
  const epic = !!element?.localName.startsWith("epic-")
  const section = epic
    ? element.shadowRoot?.querySelector("ui-section")
    : element?.localName === "ui-section"
      ? element
      : null
  const title = section ? section.shadowRoot?.querySelector('[part~="title"]') : element
  const left = document.querySelector("main").getBoundingClientRect().left + 40
  const rect = title?.getBoundingClientRect()
  const probe = rect ? Math.max(4, rect.top + rect.height / 2) : 16
  const shown = document.elementFromPoint(left, probe)
  const active = document.querySelector(`:is(${nav}) [data-rail][selected]`)
  const covering = shown?.closest("h1, h2, h3, h4, [id]")
  const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--spell-site-header-height"))
  const below = header || 0
  const atTop = !!rect && rect.top >= below - 2 && rect.top <= below + 160
  // a short section's end pushes its h2 out (`:state(bound)`), under whatever sticks above it:  sticky works
  let bound = false
  let stuckState = false
  try {
    bound = !!element?.parentElement?.matches("ui-sticky:state(bound)")
    stuckState = !!section?.matches(":state(stuck)")
  } catch {
    // a browser without custom states:  judge by position alone
    stuckState = true
  }
  const host = epic ? element : section
  const ownTitle = section
    ? shown?.closest(epic ? element.localName : "ui-section") === host
    : shown?.closest("h2")?.id === id
  return {
    stuck: section ? stuckState && atTop && ownTitle : bound || (atTop && ownTitle),
    top: rect && Math.round(rect.top),
    covering: covering && `${covering.localName}#${covering.id}`,
    active: (
      active?.querySelector(".spell-rail-label")?.textContent ??
      active?.getAttribute("title") ??
      active?.textContent
    )?.trim()
  }
}

/**
 * Whether the page's toolbar is shown inside the phone viewport:  stuck in the top half of the window (the page is
 * scrolled mid-way), no wider than it;  where it is, how big.
 */
function navOnScreen(nav) {
  const element = document.querySelector(nav)
  if (!element) return { shown: false }
  const rect = element.getBoundingClientRect()
  const visible = getComputedStyle(element).display !== "none" && rect.width > 0 && rect.height > 0
  const placed = rect.left >= -1 && rect.right <= innerWidth + 1 && rect.top >= 0 && rect.bottom <= innerHeight / 2
  return {
    shown: visible && placed,
    left: Math.round(rect.left),
    top: Math.round(rect.top),
    width: Math.round(rect.width)
  }
}
