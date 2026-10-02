/**
 * Check a `.html` doc in a real browser.
 * Usage:  node scripts/check-spell.js <folder>/<doc>.html [outDir]
 * - screenshots:  desktop top, desktop mid-page, phone mid-page, phone contents drawer (outDir, default a temp folder)
 * - fails (exit 1) on:
 *   - console / page errors
 *   - a `ui-*` element that isn't defined, or never rendered (no shadow root)
 *   - a contents list that doesn't match the sections / headings, or a `data-target` that points nowhere
 *   - horizontal scroll at phone width
 *   - a content column squeezed at phone width (a wide-screen grid rule leaking into the narrow layout)
 *   - a top-level section's title (`<ui-section>` pages) or h2 (`section.s2` pages) that doesn't stick when scrolled
 *     into its section
 *   - no active contents link after scrolling
 *   - a `ui-accordion.spell-code` without a `<pre>`
 *   - a contents drawer that doesn't open at phone width
 * - reports, never fails on:  icons with no `<svg>` drawn in their shadow tree (no reliable "done loading" signal)
 * - prints a JSON summary on stdout (last thing written), problems on stderr
 * - Look at the screenshots too:  the checks can't see overlap, clipping or ugly wrapping.
 */
import { mkdtempSync, mkdirSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { pathToFileURL } from "node:url"

import { chromium } from "playwright"

const [docPath, outArg] = process.argv.slice(2)
if (!docPath) {
  console.error("usage:  node scripts/check-spell.js <folder>/<doc>.html [outDir]")
  process.exit(2)
}
const out = outArg ?? mkdtempSync(join(tmpdir(), "check-spell-"))
mkdirSync(out, { recursive: true })
const url = pathToFileURL(resolve(docPath)).href
const seen = new Map()
const browser = await chromium.launch()

const desk = await open({ width: 1440, height: 900 })
await desk.screenshot({ path: join(out, "desk-top.png") })
const desktop = await desk.evaluate(inspectPage)
if (desktop.undefinedTags.length) problem(`undefined elements:  ${desktop.undefinedTags.join(", ")}`)
for (const [tag, count] of Object.entries(desktop.unrendered)) problem(`${count} <${tag}> without a shadow root`)
if (desktop.headings !== desktop.tocLinks)
  problem(`contents has ${desktop.tocLinks} links for ${desktop.headings} headings`)
if (desktop.danglingTargets.length) problem(`data-target points nowhere:  ${desktop.danglingTargets.join(", ")}`)
if (desktop.missingFromToc.length) problem(`headings missing from contents:  ${desktop.missingFromToc.join(", ")}`)
if (desktop.codeWithoutPre) problem(`${desktop.codeWithoutPre} ui-accordion.spell-code without a <pre>`)
if (desktop.icons.blankCount) console.error(`NOTE: ${desktop.icons.blankCount} icon(s) with no <svg> drawn`)

const middle = await desk.evaluate(scrollToMiddleSection)
await desk.waitForTimeout(600)
await desk.screenshot({ path: join(out, "desk-mid.png") })
const stuck = await desk.evaluate(stuckAndActive, middle.id)
if (middle.id && !stuck.stuck)
  problem(
    `${middle.tag} #${middle.id} not stuck at the top (its title's top at ${stuck.top}px, ${stuck.covering ?? "nothing"} showing at its middle)`
  )
if (!stuck.active) problem("no active contents link after scrolling")

const fold = await checkFold(desk)
if (fold.problem) problem(`fold:  ${fold.problem}`)

const phone = await open({ width: 390, height: 844 })
await phone.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))
await phone.waitForTimeout(400)
await phone.screenshot({ path: join(out, "phone-mid.png") })
const overflow = await phone.evaluate(() => document.documentElement.scrollWidth - innerWidth)
if (overflow > 0) problem(`${overflow}px horizontal scroll at phone width`)
const mainWidth = await phone.evaluate(() => Math.round(document.querySelector("main").getBoundingClientRect().width))
if (mainWidth < 390 - 40) problem(`content column only ${mainWidth}px wide at phone width (390px)`)
const drawer = { opened: false }
try {
  await phone.click(".spell-toc-open", { timeout: 3000 })
  await phone.waitForTimeout(500)
  Object.assign(drawer, await phone.evaluate(drawerOnScreen))
} catch (error) {
  drawer.error = String(error).split("\n")[0]
}
await phone.screenshot({ path: join(out, "phone-toc.png") })
if (!drawer.opened) problem(`contents drawer didn't open at phone width${drawer.error ? `:  ${drawer.error}` : ""}`)

await browser.close()
const problems = [...seen].map(([text, count]) => (count > 1 ? `${text}  (x${count})` : text))
const summary = {
  doc: docPath,
  ok: problems.length === 0,
  problems,
  elements: desktop.elements,
  headings: desktop.headings,
  tocLinks: desktop.tocLinks,
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
  overflow,
  mainWidth,
  drawer,
  screenshots: out
}
for (const problem of problems) console.error("PROBLEM:", problem)
console.log(JSON.stringify(summary, null, 2))
process.exit(problems.length ? 1 : 0)

/**
 * Record a problem, once per distinct first line:  a broken element logs the same error for every instance.
 * - long stack traces are cut to their first line, 300 characters
 */
function problem(text) {
  const line = String(text).split("\n")[0].slice(0, 300)
  seen.set(line, (seen.get(line) ?? 0) + 1)
}

/** A page at `viewport`, collecting errors as problems, once every `ui-*` tag in it is defined (or 10s passed). */
async function open(viewport) {
  const page = await browser.newPage({ viewport })
  const label = `${viewport.width}px`
  page.on("pageerror", (error) => problem(`page error (${label}):  ${error}`))
  page.on("console", (message) => message.type() === "error" && problem(`console (${label}):  ${message.text()}`))
  await page.goto(url)
  await settle(page)
  return page
}

/** Wait until every `ui-*` tag on `page` is defined (or 10s passed), then a second for the runtime. */
async function settle(page) {
  await page
    .waitForFunction(
      () =>
        [...document.querySelectorAll("*")].every(
          (el) => !el.localName.startsWith("ui-") || customElements.get(el.localName)
        ),
      undefined,
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

/** The section the fold check works on:  `{ id, kind }` (`ui-section`, or `section` for the old markup's h2 id). */
function foldTarget() {
  // one with content to hide, open to start with, if there is one
  const sections = [...document.querySelectorAll("main > ui-section[collapsible][id]")]
  if (sections.length) {
    const filled = (section) => [...section.children].some((child) => !child.hasAttribute("slot"))
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

/** The element a reader clicks to fold the target:  the shadow toggle button, or the old chevron host. */
function foldToggle({ id, kind }) {
  const element = document.getElementById(id)
  if (kind === "ui-section") return element?.shadowRoot?.querySelector('button[part~="toggle"]') ?? null
  return element?.querySelector(":scope > ui-button.spell-fold") ?? null
}

/**
 * The target's fold:  `{ folded, contentVisible }`.
 * - `<ui-section>`:  folded when its `collapsed` is true AND it says `:state(collapsed)`;  content:  its first
 *   unslotted child
 * - old markup:  `section.spell-folded`;  content:  the element after the heading's `ui-sticky`
 * - visible:  `checkVisibility()`, which sees `hidden="until-found"` (content-visibility) and `display: none`
 */
function foldState({ id, kind }) {
  const element = document.getElementById(id)
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
 * Static checks, run in the page:  element definitions and rendering, contents vs headings, code blocks, icons.
 * - "rendered" means has a shadow root:  every @spell-app/ui element renders into one.
 * - icons:  `<ui-icon>` plus any `ui-*` with an `icon` attribute, looked for an `<svg>` anywhere in its shadow tree.
 */
function inspectPage() {
  const all = [...document.querySelectorAll("*")].filter((el) => el.localName.startsWith("ui-"))
  const elements = {}
  const unrendered = {}
  for (const el of all) {
    elements[el.localName] = (elements[el.localName] ?? 0) + 1
    if (customElements.get(el.localName) && !el.shadowRoot)
      unrendered[el.localName] = (unrendered[el.localName] ?? 0) + 1
  }
  const undefinedTags = Object.keys(elements).filter((tag) => !customElements.get(tag))
  // `<ui-section>` pages:  the sections are entries too (their headings are in their shadow roots)
  const headingIds = [...document.querySelectorAll("main ui-section[id], main h2[id], main h3[id], main h4[id]")].map(
    (h) => h.id
  )
  const targets = [...document.querySelectorAll("#spell-toc [data-target]")].map((a) => a.dataset.target)
  const icons = all.filter((el) => el.localName === "ui-icon" || el.hasAttribute("icon"))
  const blank = icons.filter((el) => !hasSvg(el.shadowRoot))
  return {
    elements,
    unrendered,
    undefinedTags,
    headings: headingIds.length,
    tocLinks: targets.length,
    danglingTargets: targets.filter((id) => !document.getElementById(id)),
    missingFromToc: headingIds.filter((id) => !targets.includes(id)),
    codeBlocks: document.querySelectorAll("ui-accordion.spell-code").length,
    codeWithoutPre: [...document.querySelectorAll("ui-accordion.spell-code")].filter((a) => !a.querySelector("pre"))
      .length,
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
 * Scroll into the middle top-level section (`main > ui-section`, or `section.s2`), part way down, and return its
 * id (the h2's, for `section.s2`) and what it is.
 * - only sections that can scroll up to the top:  a short page's last section never sticks
 */
function scrollToMiddleSection() {
  const room = document.documentElement.scrollHeight - innerHeight
  const sections = [...document.querySelectorAll("main > ui-section, section.s2")].filter(
    (s) => s.getBoundingClientRect().top + scrollY + 200 < room
  )
  const middle = sections[Math.floor(sections.length / 2)]
  middle?.scrollIntoView()
  window.scrollBy(0, Math.min(600, (middle?.offsetHeight ?? 0) / 2))
  const section = middle?.localName === "ui-section"
  return { id: section ? middle.id : middle?.querySelector("h2")?.id, tag: section ? "ui-section" : "h2" }
}

/**
 * Whether section / h2 `id`'s title sits at the top of the viewport, and which contents link is active.
 * - stuck:  its title's top is within 160px of the viewport top -- room for a sticky bar above it, e.g.
 *   CHEATSHEET's filter -- AND it's what shows at its own middle.  Scrolled mid-section, a title that DIDN'T stick
 *   is far above;  one stuck but covered, e.g. by an h3 sticking at the same offset, doesn't count.
 *   - `<ui-section>`:  its title is its shadow `title` part, and it must ALSO say `:state(stuck)`;  what shows
 *     there is the section host (the shadow retargets to it), not a nested section's
 *   - h2:  one its short section's end pushed out (`:state(bound)`) counts:  it stuck, then left with its section
 * - active:  a selected `ui-item`, or a title `<a class="active">`
 */
function stuckAndActive(id) {
  const element = id && document.getElementById(id)
  const section = element?.localName === "ui-section" ? element : null
  const title = section ? section.shadowRoot?.querySelector('[part~="title"]') : element
  const left = document.querySelector("main").getBoundingClientRect().left + 40
  const rect = title?.getBoundingClientRect()
  const probe = rect ? Math.max(4, rect.top + rect.height / 2) : 16
  const shown = document.elementFromPoint(left, probe)
  const active = document.querySelector(
    "#spell-toc ui-item[selected]:not([selected=false]), #spell-toc ui-item.selected, #spell-toc a.active"
  )
  const covering = shown?.closest("h1, h2, h3, h4, [id]")
  const atTop = !!rect && rect.top >= -2 && rect.top <= 160
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
  const ownTitle = section ? shown?.closest("ui-section") === section : shown?.closest("h2")?.id === id
  return {
    stuck: section ? stuckState && atTop && ownTitle : bound || (atTop && ownTitle),
    top: rect && Math.round(rect.top),
    covering: covering && `${covering.localName}#${covering.id}`,
    active: active?.textContent.trim()
  }
}

/** Whether the contents aside is visible and mostly inside the phone viewport. */
function drawerOnScreen() {
  const toc = document.getElementById("spell-toc")
  const rect = toc.getBoundingClientRect()
  const style = getComputedStyle(toc)
  const visible = style.visibility !== "hidden" && style.display !== "none" && rect.width > 0 && rect.height > 0
  const onScreen = rect.left < innerWidth - 40 && rect.right > 40
  return { opened: visible && onScreen, left: Math.round(rect.left), width: Math.round(rect.width) }
}
