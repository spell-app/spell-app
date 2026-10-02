/**
 * Check a `.html` doc in a real browser.
 * Usage:  node scripts/check-spell.js <folder>/<doc>.html [outDir]
 * - screenshots:  desktop top, desktop mid-page, phone mid-page, phone contents drawer (outDir, default a temp folder)
 * - fails (exit 1) on:
 *   - console / page errors
 *   - a `ui-*` element that isn't defined, or never rendered (no shadow root)
 *   - a contents list that doesn't match the headings, or a `data-target` that points nowhere
 *   - horizontal scroll at phone width
 *   - a content column squeezed at phone width (a wide-screen grid rule leaking into the narrow layout)
 *   - an h2 that doesn't stick when scrolled into its section
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
    `h2 #${middle.id} not stuck at the top (its top at ${stuck.top}px, ${stuck.covering ?? "nothing"} showing at its middle)`
  )
if (!stuck.active) problem("no active contents link after scrolling")

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
  return page
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
  const headingIds = [...document.querySelectorAll("main h2[id], main h3[id], main h4[id]")].map((h) => h.id)
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
 * Scroll into the middle `section.s2`, part way down, and return its h2's id.
 * - only sections that can scroll up to the top:  a short page's last section never sticks
 */
function scrollToMiddleSection() {
  const room = document.documentElement.scrollHeight - innerHeight
  const sections = [...document.querySelectorAll("section.s2")].filter(
    (s) => s.getBoundingClientRect().top + scrollY + 200 < room
  )
  const middle = sections[Math.floor(sections.length / 2)]
  middle?.scrollIntoView()
  window.scrollBy(0, Math.min(600, (middle?.offsetHeight ?? 0) / 2))
  return { id: middle?.querySelector("h2")?.id }
}

/**
 * Whether h2 `id` sits at the top of the viewport, and which contents link is active.
 * - stuck:  its top is within 160px of the viewport top -- room for a sticky bar above it, e.g. CHEATSHEET's
 *   filter -- AND it's what shows at its own middle.  Scrolled mid-section, an h2 that DIDN'T stick is far above;
 *   one stuck but covered, e.g. by an h3 sticking at the same offset, doesn't count.  One its short section's end
 *   pushed out (`:state(bound)`) does:  it stuck, then left with its section.
 * - active:  a selected `ui-item`, or a title `<a class="active">`
 */
function stuckAndActive(id) {
  const h2 = id && document.getElementById(id)
  const left = document.querySelector("main").getBoundingClientRect().left + 40
  const rect = h2?.getBoundingClientRect()
  const probe = rect ? Math.max(4, rect.top + rect.height / 2) : 16
  const shown = document.elementFromPoint(left, probe)
  const active = document.querySelector(
    "#spell-toc ui-item[selected]:not([selected=false]), #spell-toc ui-item.selected, #spell-toc a.active"
  )
  const covering = shown?.closest("h1, h2, h3, h4, [id]")
  // a short section's end pushes its h2 out (`:state(bound)`), under whatever sticks above it:  sticky works
  let bound = false
  try {
    bound = !!h2?.parentElement?.matches("ui-sticky:state(bound)")
  } catch {
    // a browser without custom states:  judge by position alone
  }
  return {
    stuck: bound || (!!rect && rect.top >= -2 && rect.top <= 160 && shown?.closest("h2")?.id === id),
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
