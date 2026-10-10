/**
 * Check P10's page header and section tools on preview copies (`preview-epics/<name>/`), in a real browser:  the
 * review line, the step label (the state in it), the Phases section's `open/all` badge (against the items and phases in
 * the doc), the state filter (a chip hides its items and says how many), and the Phases section's Plan changes box.
 * Usage (from the repo root):
 *   node packages/epics/demo/check-header-epics.mjs [--doc <name>]... [outDir]
 * - the docs:  `review-review` (a Plan changes box) and `epic-components` (items in every state) unless named
 * - the server:  a page server of its OWN on this checkout (`PageServer`, no pid file, a free port);  stopped at the
 *   end.  Send / Review Now need the review routes on a plan doc's path:  `check-review-epics.mjs` checks those
 * - fails (exit 1) on a page error, a wrong count, a filter that doesn't hide, a missing box, a header control or
 *   chip running past the window, or a glyph off its box's centre by more than 1px;  at 280px and 900px, light and dark
 * - screenshots (outDir, default `demo/shots/p10/`):  `<doc>-<width>-<scheme>-top.png` (the header),
 *   `-phases.png`, `-filtered.png`
 * - re-runs itself under `tsx` (the page server is TypeScript)
 */
import { spawnSync } from "node:child_process"
import { mkdirSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, "../../..")

if (!process.env.CHECK_HEADER_UNDER_TSX) {
  const run = spawnSync(
    process.execPath,
    ["--import", "tsx", fileURLToPath(import.meta.url), ...process.argv.slice(2)],
    {
      stdio: "inherit",
      cwd: ROOT,
      env: {
        ...process.env,
        CHECK_HEADER_UNDER_TSX: "1",
        TSX_TSCONFIG_PATH: join(ROOT, "packages/server/tsconfig.json")
      }
    }
  )
  process.exit(run.status ?? 1)
}

const { chromium } = await import("playwright")
const { PageServer } = await import("../../server/src/page/PageServer.ts")

const args = process.argv.slice(2)
const docs = args.flatMap((arg, index) => (args[index - 1] === "--doc" ? [arg] : []))
if (!docs.length) docs.push("review-review", "epic-components")
const out = args.find((arg, index) => !arg.startsWith("--") && args[index - 1] !== "--doc") ?? join(HERE, "shots/p10")
mkdirSync(out, { recursive: true })
const problems = []
const summary = {}

const server = await new PageServer({ root: ROOT }).start({
  port: 47_900 + Math.floor(Math.random() * 90),
  pidFile: false
})
const browser = await chromium.launch()
try {
  for (const doc of docs) await check(doc)
} catch (error) {
  problems.push(`threw:  ${error.stack ?? error}`)
} finally {
  await browser.close()
  await server.stop()
}
console.log(JSON.stringify(summary, null, 2))
if (problems.length) {
  console.error(problems.map((problem) => `- ${problem}`).join("\n"))
  process.exit(1)
}

////////////////
// ## One doc
////////////////

/** Every width and scheme of `doc`. */
async function check(doc) {
  const url = `http://127.0.0.1:${server.info.port}/preview-epics/${doc}/${doc}.plan.html`
  for (const scheme of ["light", "dark"]) {
    for (const width of [280, 900]) {
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
        deviceScaleFactor: 2,
        colorScheme: scheme
      })
      const page = await context.newPage()
      const logs = []
      page.on("pageerror", (error) => logs.push(`pageerror:  ${error.message}`))
      // a failed load is reported by `response` below, with its URL:  the review routes refuse a preview copy's path
      page.on("console", (message) => {
        if (message.type() === "error" && !/^Failed to load resource/.test(message.text()))
          logs.push(`console:  ${message.text()}`)
      })
      page.on("response", (response) => {
        if (response.status() >= 400 && !response.url().includes("/api/review/"))
          logs.push(`${response.status()}:  ${response.url()}`)
      })
      const where = `${doc} ${width}px ${scheme}`
      await page.goto(url)
      await page.waitForFunction(
        () => document.querySelector("epic-page")?.shadowRoot?.querySelector(".review-line"),
        null,
        {
          timeout: 15_000
        }
      )
      await page.waitForTimeout(800)
      const name = (what) => join(out, `${doc}-${width}-${scheme}-${what}.png`)
      await page.screenshot({ path: name("top") })

      // the header and the counts
      const facts = await page.evaluate(readFacts, width)
      summary[where] = facts.summary
      for (const problem of facts.problems) problems.push(`${where}:  ${problem}`)

      // the Phases section, open:  its Plan changes box (when the doc has copies)
      await page.evaluate(() => document.querySelector("#phases").setAttribute("open", ""))
      await page.waitForTimeout(600)
      const box = await page.evaluate(() => {
        const copies = document.querySelectorAll('#phases > epic-updated[slot="changes"]').length
        const drawn = document.querySelector("#phases").shadowRoot.querySelector('[part~="changes"]')
        return { copies, drawn: !!drawn, width: drawn?.getBoundingClientRect().right ?? 0 }
      })
      if (!!box.copies !== box.drawn) problems.push(`${where}:  ${box.copies} copies, box drawn:  ${box.drawn}`)
      if (box.width > width + 0.5) problems.push(`${where}:  the Plan changes box runs past the window`)
      await page.locator("#phases").scrollIntoViewIfNeeded()
      await page.screenshot({ path: name("phases") })
      await page.evaluate(() => document.querySelector("#phases").removeAttribute("open"))

      // a filter:  the first item section with two states or more;  its first chip hides that state's items
      const filtered = await page.evaluate(async () => {
        const section = Array.from(document.querySelectorAll("epic-section")).find(
          (it) => it.shadowRoot?.querySelectorAll('[part~="filter"] button[data-color]').length >= 2
        )
        if (!section) return null
        section.setAttribute("open", "")
        const chip = section.shadowRoot.querySelector('[part~="filter"] button[data-color]')
        const state = chip.dataset.state
        chip.click()
        await new Promise((done) => setTimeout(done, 300))
        const items = Array.from(section.querySelectorAll(":scope > epic-item"))
        const hidden = items.filter((item) => getComputedStyle(item).display === "none")
        const note = section.shadowRoot.querySelector('[part~="hidden-note"]')?.textContent ?? ""
        return { id: section.id, state, hidden: hidden.length, note }
      })
      if (filtered) {
        if (!filtered.hidden || filtered.note !== `${filtered.hidden} hidden · show all`)
          problems.push(`${where}:  #${filtered.id}'s ${filtered.state} chip:  ${JSON.stringify(filtered)}`)
        await page.locator(`#${filtered.id}`).scrollIntoViewIfNeeded()
        await page.screenshot({ path: name("filtered") })
        // shown again for the next run:  the choice is remembered per page
        await page.evaluate(
          (id) => document.getElementById(id).shadowRoot.querySelector('[part~="hidden-note"]').click(),
          filtered.id
        )
      }
      summary[where].filtered = filtered
      if (logs.length) problems.push(...logs.map((log) => `${where}:  ${log}`))
      await context.close()
    }
  }
}

/** In the page:  the header's controls and every section's badge, checked;  what it found. */
function readFacts(width) {
  const found = []
  const page = document.querySelector("epic-page")
  const root = page.shadowRoot
  const line = root.querySelector(".review-line")
  const epic = page.getAttribute("epic")
  if (!line.textContent.includes(`/epic review ${epic}`)) found.push(`the review line reads "${line.textContent}"`)
  // every round control of the header, and every chip, in the window and its glyph centred
  const boxes = [
    ...root.querySelectorAll("button.send, button.review-now, button.git"),
    ...Array.from(document.querySelectorAll("epic-section"), (section) =>
      Array.from(section.shadowRoot?.querySelectorAll('[part~="filter"] button, button.toggle') ?? [])
    ).flat()
  ]
  for (const box of boxes) {
    const outer = box.getBoundingClientRect()
    if (!outer.width) continue
    if (outer.right > width + 0.5) found.push(`${box.className} runs past the window`)
    const glyph = box.querySelector("svg")?.getBoundingClientRect()
    if (!glyph) continue
    const dx = Math.abs(outer.left + outer.width / 2 - (glyph.left + glyph.width / 2))
    const dy = Math.abs(outer.top + outer.height / 2 - (glyph.top + glyph.height / 2))
    if (dx > 1 || dy > 1) found.push(`${box.className}'s glyph off centre by ${dx.toFixed(1)}, ${dy.toFixed(1)}`)
  }
  // each section's badge:  open / all of its items (or phases), as counted here
  const badges = {}
  for (const section of document.querySelectorAll("epic-page > epic-section")) {
    const counted = section.querySelectorAll(":scope > epic-item, :scope > epic-phase")
    const open = Array.from(counted).filter(
      (it) => !["done", "decided", "canceled"].includes(it.getAttribute("status"))
    ).length
    // only the Phases section shows its count:  an item section's chips say the numbers (Owen, 2026-10-10)
    const want = counted.length && section.getAttribute("kind") === "phases" ? `${open}/${counted.length}` : null
    const badge = section.shadowRoot.querySelector("ui-section").getAttribute("badge")
    badges[section.id] = badge
    if (badge !== want) found.push(`#${section.id}'s badge ${badge}, wanted ${want}`)
  }
  return {
    problems: found,
    summary: {
      state: state?.title ?? null,
      step: step?.textContent.trim() ?? null,
      badges
    }
  }
}
