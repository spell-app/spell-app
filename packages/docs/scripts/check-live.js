/**
 * Check that a live edit updates a doc IN PLACE, and that the address follows the reading position, in a real
 * browser (plan doc `review-review`, D10).
 * Usage:  node scripts/check-live.js [epic name]   (default `review-review`;  from `packages/docs`)
 * - serves the doc from this checkout's page server (`ensurePageServer()`), unfolds two sections, types into a
 *   textarea it adds, scrolls mid-page, then appends a log line (`yarn plan-doc log <name> "check-live ..."`)
 * - fails (exit 1) unless, after the edit:  the page did NOT reload (a `window` marker survives), the scroll
 *   position, the folds, the typed text and its focus are kept, and the new log line is in the page
 * - also:  the address follows the section scrolled to (`#id`, no reload), and a fresh load of that address lands
 *   on it
 * - SIDE EFFECT:  removes its log line from the doc afterwards (and reformats the doc with oxfmt)
 * - prints a JSON summary on stdout, problems on stderr
 */
import { execFileSync } from "node:child_process"
import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

import { chromium } from "playwright"

import { DOCS, ensurePageServer, serverUrl, tidy } from "./pages.js"

const name = process.argv[2] ?? "review-review"
const file = join(DOCS, "epics", name, `${name}.html`)
const served = ensurePageServer()
if (!served) {
  console.error("check-live:  no page server")
  process.exit(2)
}
const url = serverUrl(served.base, file)
const stamp = `check-live-${Date.now()}`
const problems = []
// the sections the reader unfolds
const SECTIONS = ["overview", "o1", "log"]
const summary = { url }
const browser = await chromium.launch()
// one context:  the fresh load sees the folds the reader saved
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })

try {
  const page = await context.newPage()
  const errors = []
  page.on("pageerror", (error) => errors.push(String(error)))
  await page.goto(url)
  await page.waitForFunction(() => document.getElementById("spell-toc") && window.SPELL_SERVER?.readPage)
  await page.waitForTimeout(800)

  // the reader's state:  sections unfolded, a half-typed note with focus, mid-page
  for (const id of SECTIONS) {
    await page.evaluate(unfold, id)
    await page.waitForTimeout(400)
  }
  const before = await page.evaluate(addNote)
  await page.fill("#check-live-note", "half-typed note")
  await page.evaluate(() => {
    const box = document.getElementById("o1").getBoundingClientRect()
    scrollTo({ top: scrollY + box.top + box.height / 2 - innerHeight / 2, behavior: "instant" })
  })
  await page.waitForTimeout(600)
  Object.assign(before, await page.evaluate(() => ({ y: scrollY, hash: location.hash })))
  summary.before = before
  if (!before.hash) problems.push("the address didn't follow the scroll (no #hash mid-page)")

  execFileSync("yarn", ["plan-doc", "log", name, stamp], { cwd: DOCS, stdio: "ignore" })
  try {
    await page.waitForFunction((text) => document.getElementById("log")?.textContent.includes(text), stamp, {
      timeout: 10_000
    })
  } catch {
    problems.push("the new log line never showed up")
  }
  await page.waitForTimeout(800)
  const after = await page.evaluate(stateAfter)
  summary.after = after
  if (!after.marker) problems.push("the page reloaded (its window marker is gone)")
  if (Math.abs(after.y - before.y) > 2) problems.push(`scroll moved:  ${before.y} -> ${after.y}`)
  if (after.folded.length) problems.push(`sections folded again:  ${after.folded.join(", ")}`)
  if (after.note !== "half-typed note") problems.push(`typed text lost:  "${after.note}"`)
  if (after.focus !== "check-live-note") problems.push(`focus lost (now on ${after.focus || "nothing"})`)

  // a fresh load of the followed address lands on its section
  const fresh = await context.newPage()
  await fresh.goto(`${url}${before.hash}`)
  await fresh.waitForFunction(() => document.getElementById("spell-toc"))
  await fresh.waitForTimeout(1200)
  const landing = await fresh.evaluate((hash) => {
    const target = document.getElementById(decodeURIComponent(hash.slice(1)))
    return { hash: location.hash, top: Math.round(target?.getBoundingClientRect().top ?? NaN) }
  }, before.hash)
  summary.landing = landing
  if (landing.hash !== before.hash) problems.push(`fresh load moved the address:  ${before.hash} -> ${landing.hash}`)
  if (!(landing.top >= 0 && landing.top < 300))
    problems.push(`fresh load of ${before.hash}:  target at ${landing.top}px`)
  if (errors.length) problems.push(`page errors:  ${errors.join(" | ")}`)
} finally {
  await browser.close()
  removeLogLine()
}

for (const problem of problems) console.error(`PROBLEM:  ${problem}`)
console.log(JSON.stringify({ ...summary, ok: !problems.length }, null, 2))
process.exit(problems.length ? 1 : 0)

/**
 * In the page:  unfold section `id` as the reader would, by a click on its title (so the fold is saved);  the
 * property when the click didn't take.
 */
function unfold(id) {
  const section = document.getElementById(id)
  if (!section.hasAttribute("collapsed")) return
  section.shadowRoot?.querySelector('[part~="title"]')?.click()
  if (section.hasAttribute("collapsed")) section.collapsed = false
}

/** In the page:  mark the window, add a textarea to 1.1 and focus it;  returns the folds saved. */
function addNote() {
  window.__checkLive = true
  const note = document.createElement("textarea")
  note.id = "check-live-note"
  document.getElementById("o1").append(note)
  note.focus()
  return { saved: localStorage.getItem(`spell-folds:${location.pathname}`) }
}

/** In the page, after the edit:  what survived. */
function stateAfter() {
  const folded = ["overview", "o1", "log"].filter((id) => document.getElementById(id)?.hasAttribute("collapsed"))
  return {
    marker: window.__checkLive === true,
    y: scrollY,
    folded,
    note: document.getElementById("check-live-note")?.value ?? null,
    focus: document.activeElement?.id ?? ""
  }
}

/** Take this run's line out of the doc's log (a `<ui-event>`), then reformat the doc. */
function removeLogLine() {
  const html = readFileSync(file, "utf8")
  const at = html.indexOf(stamp)
  if (at < 0) return
  const start = html.lastIndexOf("<ui-event", at)
  const close = html.indexOf("</ui-event", at)
  const end = html.indexOf(">", close) + 1
  if (start < 0 || close < 0 || end <= 0) return console.error(`check-live:  remove "${stamp}" from the log by hand`)
  writeFileSync(file, html.slice(0, start) + html.slice(end))
  tidy([file])
}
