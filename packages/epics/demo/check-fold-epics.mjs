/**
 * Check that folding never moves what was clicked (I7 of epic `airplane`), in a real browser:
 * the line or title folded stays where it is on screen, to the pixel, from the click until 1.5s after.
 * Usage (from the repo root):
 *   node packages/epics/demo/check-fold-epics.mjs [--doc <name>] [--item <id>] [--guide <path>] [outDir]
 * - the plan doc:  a SCRATCH COPY of `epics/<name>/` (default `airplane`), in `demo/shots/fold/epics/<name>/`
 *   (git-ignored):  the review routes take plan docs only (`epics/<name>/<name>.plan.html`)
 *   - one reply is made on it (the reply case);  its inbox file is deleted at the end
 *   - REFUSES to run while the copy's inbox file exists (a run killed half way:  delete it)
 * - the item:  `--item <id>` (default:  the first item with details in a Todos or Questions section);
 *   the item near the page's END:  the doc's last item with details
 * - the guide:  `--guide <path from the root>` (default `guides/solid/solid-2.html`), read as it is (a fold writes
 *   only the reader's own storage)
 * - the server:  a page server of its OWN on this checkout (`PageServer`, no pid file, a free port);  stopped at the end
 * - at 1200 x 900 and 390 x 844, the cases:
 *   - an item a link landed on (`#q5`), folded at once by its chevron;  by a click on its line;
 *     and after a wheel moves it to mid window
 *   - the doc's last item, landed on by a link:  near the page's end, where the page's height matters
 *     (folding shortens the page, and the browser would pull the reader back)
 *   - an item opened by a click, with no link before, folded by its chevron
 *   - a phase a link opened, folded by a click on its title
 *   - a reply on an open item (Revisit, a note, Later:  it folds by itself), then a click on the NEXT item's line,
 *     which opens it:  that line must not move either (Owen, 2026-10-10:  "clicking item headers jumps to top of
 *     page, seems maybe related to auto-closing after I reply")
 *   - the guide:  a section a link opened (a heading in it), folded by a click on its title;
 *     a click on plain text in a section, which must not scroll at all
 * - fails (exit 1) on a page error, a fold that doesn't happen, an item fold that doesn't animate,
 *   or a line / title that moves more than 1px:
 *   - what moved them, before I7's fix:
 *     the runtime let go of the page's held height by taking it off to measure, and that one layout clamped the
 *     scroll (20-80px);  and a click on any text in a plan doc focused the page header's first link
 *     (`<epic-page>` delegated focus), which scrolled the page to its top
 * - screenshots (outDir, default `demo/shots/fold/`):  `<case>-<width>.png`, after each fold
 * - re-runs itself under `tsx` (the page server is TypeScript)
 */
import { spawnSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, "../../..")

if (!process.env.CHECK_FOLD_UNDER_TSX) {
  const run = spawnSync(
    process.execPath,
    ["--import", "tsx", fileURLToPath(import.meta.url), ...process.argv.slice(2)],
    {
      stdio: "inherit",
      cwd: ROOT,
      env: {
        ...process.env,
        CHECK_FOLD_UNDER_TSX: "1",
        TSX_TSCONFIG_PATH: join(ROOT, "packages/server/tsconfig.json")
      }
    }
  )
  process.exit(run.status ?? 1)
}

const { chromium } = await import("playwright")
const { PageServer } = await import("../../server/src/page/PageServer.ts")

////////////////
// ## Settings
////////////////

const args = process.argv.slice(2)
const flagValue = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined)
const docName = flagValue("--doc") ?? "airplane"
const guide = flagValue("--guide") ?? "guides/solid/solid-2.html"
const flagged = new Set(
  ["--doc", "--item", "--guide"].flatMap((name) => (args.includes(name) ? [args.indexOf(name) + 1] : []))
)
const out = args.find((arg, index) => !arg.startsWith("--") && !flagged.has(index)) ?? join(HERE, "shots/fold")
const SIZES = [
  { width: 1200, height: 900 },
  { width: 390, height: 844 }
]
/** How long after the click the line is watched:  the fold (300ms), the runtime's hold (600ms), and a margin. */
const WATCH_MS = 1500
/** The most a line may move, px. */
const TOLERANCE = 1
/** The reply case's note. */
const NOTE = "check-fold-epics:  a reply, so the item folds by itself"
const problems = []
const summary = {}

const folder = join(HERE, "shots/fold/epics", docName)
const inboxFile = join(folder, `${docName}.inbox.json`)
if (existsSync(inboxFile)) {
  console.error(`check-fold-epics:  ${inboxFile} exists (an earlier run's?):  delete it first`)
  process.exit(2)
}
copyDoc()
mkdirSync(out, { recursive: true })

const server = await new PageServer({ root: ROOT }).start({
  port: 47_900 + Math.floor(Math.random() * 90),
  pidFile: false
})
const base = `http://127.0.0.1:${server.info.port}`
const docUrl = `${base}/packages/epics/demo/shots/fold/epics/${docName}/${docName}.plan.html`
const browser = await chromium.launch()
try {
  for (const size of SIZES) {
    const ids = await pickIds(size)
    await itemCase(size, "item-link-chevron", { hash: ids.item, click: "chevron" })
    await itemCase(size, "item-link-line", { hash: ids.item, click: "line" })
    await itemCase(size, "item-link-mid", { hash: ids.item, click: "chevron", wheelTo: 0.45 })
    await itemCase(size, "item-end-link", { hash: ids.last, click: "chevron" })
    await itemCase(size, "item-no-link", { item: ids.item, click: "chevron" })
    if (ids.phase) await phaseCase(size, ids)
    if (ids.next) await replyCase(size, ids)
    await guideCases(size)
  }
} catch (error) {
  problems.push(`threw:  ${error.stack ?? error}`)
} finally {
  await browser.close()
  await server.stop()
  rmSync(inboxFile, { force: true })
}
console.log(JSON.stringify(summary, null, 2))
if (problems.length) {
  console.error(problems.map((problem) => `- ${problem}`).join("\n"))
  process.exit(1)
}

////////////////
// ## Cases
////////////////

/**
 * An item, folded:  `hash` lands on it (a link), else `item` is opened by a click on its chevron;
 * `wheelTo` (a fraction of the window) first wheels its line there.
 */
async function itemCase(size, name, { hash, item, click, wheelTo }) {
  const id = hash ?? item
  const { page, logs } = await openPage(size, hash ? `${docUrl}#${hash}` : docUrl)
  const where = `${name} #${id} ${size.width}px`
  if (hash) await page.waitForFunction((id) => document.getElementById(id)?.open, id, { timeout: 15_000 })
  else {
    await page.waitForTimeout(1500)
    await page.evaluate((id) => {
      const item = document.getElementById(id)
      for (const fold of document.querySelectorAll("epic-overview, epic-section, epic-phase"))
        if (fold.contains(item)) fold.setAttribute("open", "")
    }, id)
    await page.waitForTimeout(400)
    await page.evaluate((id) => document.getElementById(id).scrollIntoView({ block: "center" }), id)
    await page.waitForTimeout(200)
    await clickAt(page, await pointOf(page, id, "toggle"))
    await page.waitForTimeout(800)
  }
  if (wheelTo !== undefined) {
    // a wheel, as the reader's:  the landing's late re-land stands aside for it
    const top = await page.evaluate((id) => lineOf(id).getBoundingClientRect().top, id)
    await page.mouse.move(size.width / 2, size.height / 2)
    await page.mouse.wheel(0, top - size.height * wheelTo)
    await page.waitForTimeout(400)
  }
  // a link's fold comes quickly:  the landing may still be settling
  else if (hash) await page.waitForTimeout(150)
  const point = await pointOf(page, id, click === "line" ? "title" : "toggle")
  const watched = await watchWhile(page, () => clickAt(page, point), {
    measure: `lineOf(${JSON.stringify(id)})`,
    details: `document.getElementById(${JSON.stringify(id)}).shadowRoot.querySelector(".details")`
  })
  const folded = await page.evaluate((id) => !document.getElementById(id).open, id)
  if (!folded) problems.push(`${where}:  didn't fold`)
  if (!watched.animated) problems.push(`${where}:  the details didn't animate (${watched.heights})`)
  report(where, watched)
  await finish(page, logs, where, `${name}-${size.width}`)
}

/**
 * A reply on an open item (Revisit, a note, Later), which folds it by itself;  then a click on the next item's line.
 * - the reply waits in the copy's inbox, deleted at the end
 */
async function replyCase(size, ids) {
  const { page, logs } = await openPage(size, `${docUrl}#${ids.item}`)
  const where = `reply-then-line #${ids.next} ${size.width}px`
  await page.waitForFunction((id) => document.getElementById(id)?.open, ids.item, { timeout: 15_000 })
  const reviewing = await page
    .waitForFunction(() => document.querySelector("epic-page")?.hasAttribute("reviewing"), null, { timeout: 15_000 })
    .then(() => true)
    .catch(() => false)
  if (!reviewing) return problems.push(`${where}:  the page never said it's being reviewed (<epic-page reviewing>)`)
  await page.waitForTimeout(1200)
  // a reply:  Revisit opens the note box, focused;  a note, then Later
  await page.locator(`#${ids.item} ui-button[data-action="revisit"]`).first().click()
  await page.waitForTimeout(300)
  await page.keyboard.type(NOTE)
  await page.locator(`#${ids.item} .note-actions button[data-how="soon"]`).first().click()
  // the item folds by itself (J51's animation, then the runtime's hold), its focused button gone with it
  await page.waitForTimeout(1000)
  if (await page.evaluate((id) => document.getElementById(id).open, ids.item))
    problems.push(`${where}:  #${ids.item} didn't fold after the reply`)
  const point = await pointOf(page, ids.next, "title")
  if (point.y < 0 || point.y > size.height) {
    problems.push(`${where}:  #${ids.next}'s line isn't in the window (${Math.round(point.y)})`)
    return finish(page, logs, where)
  }
  const watched = await watchWhile(page, () => clickAt(page, point), { measure: `lineOf(${JSON.stringify(ids.next)})` })
  if (!(await page.evaluate((id) => document.getElementById(id).open, ids.next)))
    problems.push(`${where}:  #${ids.next} didn't open`)
  report(where, watched)
  await finish(page, logs, where, `reply-then-line-${size.width}`)
}

/** A phase a link opened, folded by a click on its title. */
async function phaseCase(size, ids) {
  const { page, logs } = await openPage(size, `${docUrl}#${ids.phase}`)
  const where = `phase-link #${ids.phase} ${size.width}px`
  await page.waitForFunction((id) => document.getElementById(id)?.open, ids.phase, { timeout: 15_000 })
  await page.waitForTimeout(150)
  const measure = `document.getElementById(${JSON.stringify(ids.phase)}).shadowRoot.querySelector(".header")`
  const point = await page.evaluate((measure) => {
    const box = eval(measure).getBoundingClientRect()
    return { x: box.left + Math.min(40, box.width / 2), y: box.top + box.height / 2 }
  }, measure)
  const watched = await watchWhile(page, () => clickAt(page, point), { measure })
  if (await page.evaluate((id) => document.getElementById(id).open, ids.phase)) problems.push(`${where}:  didn't fold`)
  report(where, watched)
  await finish(page, logs, where, `phase-link-${size.width}`)
}

/**
 * The guide:  a section a link opened (a heading in it), folded by a click on its title;
 * then a click on plain text in an open section, which must not scroll.
 */
async function guideCases(size) {
  const url = `${base}/${guide}`
  const probe = await openPage(size, url)
  await probe.page.waitForTimeout(1200)
  const target = await probe.page.evaluate(() => {
    for (const section of document.querySelectorAll("main ui-section[collapsible][id]")) {
      const heading = section.querySelector("ui-section[id] h3[id], ui-section[id], h3[id], h4[id], p[id]")
      if (heading?.id && heading !== section) return { section: section.id, heading: heading.id }
    }
    return null
  })
  await probe.page.close()
  if (!target) return problems.push(`${guide}:  no section with an id inside`)

  const { page, logs } = await openPage(size, `${url}#${target.heading}`)
  const where = `guide-link #${target.section} ${size.width}px`
  await page.waitForFunction((id) => !document.getElementById(id)?.collapsed, target.section, { timeout: 15_000 })
  await page.waitForTimeout(150)
  const measure = `document.getElementById(${JSON.stringify(target.section)}).shadowRoot.querySelector('[part~="title"]')`
  const point = await page.evaluate((measure) => {
    const box = eval(measure).getBoundingClientRect()
    return { x: box.left + Math.min(80, box.width / 2), y: box.top + box.height / 2 }
  }, measure)
  const watched = await watchWhile(page, () => clickAt(page, point), { measure })
  if (!(await page.evaluate((id) => document.getElementById(id).collapsed, target.section)))
    problems.push(`${where}:  didn't fold`)
  report(where, watched)
  await page.screenshot({ path: join(out, `guide-link-${size.width}.png`) })

  // plain text, in the window:  a click there must not move the page
  const textWhere = `guide-text ${size.width}px`
  await page.evaluate((id) => document.getElementById(id).removeAttribute("collapsed"), target.section)
  await page.waitForTimeout(500)
  const text = await page.evaluate(() => {
    for (const paragraph of document.querySelectorAll("main ui-section p")) {
      const box = paragraph.getBoundingClientRect()
      if (box.top > innerHeight * 0.4 && box.bottom < innerHeight - 10 && box.width > 100)
        return { x: box.left + 30, y: box.top + 6 }
    }
    return null
  })
  if (text) {
    const before = await page.evaluate(() => scrollY)
    await clickAt(page, text)
    await page.waitForTimeout(400)
    const moved = (await page.evaluate(() => scrollY)) - before
    summary[textWhere] = moved
    if (Math.abs(moved) > TOLERANCE) problems.push(`${textWhere}:  a click on text scrolled the page ${moved}px`)
  }
  await finish(page, logs, where)
}

////////////////
// ## Helpers
////////////////

/** A fresh page (no remembered folds), its errors collected, a few helpers installed. */
async function openPage(size, url) {
  const context = await browser.newContext({ viewport: size })
  const page = await context.newPage()
  const logs = []
  page.on("pageerror", (error) => logs.push(`pageerror:  ${error.message}`))
  page.on("console", (message) => {
    if (message.type() === "error" && !/^Failed to load resource/.test(message.text()))
      logs.push(`console:  ${message.text()}`)
  })
  await page.addInitScript(() => {
    /** An item's line, in its shadow root. */
    globalThis.lineOf = (id) => document.getElementById(id).shadowRoot.querySelector('[part~="line"]')
  })
  await page.goto(url)
  return { page, logs }
}

/** The items and phase the cases fold, from the doc (`--item` names the first). */
async function pickIds(size) {
  const { page } = await openPage(size, docUrl)
  await page.waitForFunction(() => document.querySelector("epic-item")?.shadowRoot?.querySelector(".line"), null, {
    timeout: 15_000
  })
  const ids = await page.evaluate((wanted) => {
    const withDetails = Array.from(document.querySelectorAll("epic-item[id]")).filter(
      (item) => item.hasAttribute("source") || item.children.length
    )
    const listed = withDetails.filter((item) => item.closest('epic-section:is([kind="todos"], [kind="questions"])'))
    // a phase opens for a link to it, as for one to an item in it
    const phase = document.querySelector("epic-phase[id]")
    const item = wanted ? document.getElementById(wanted) : (listed[0] ?? withDetails[0])
    // the next item with details in the same section:  the reply case opens it
    const siblings = withDetails.filter((other) => other.parentElement === item?.parentElement)
    return {
      item: item?.id,
      next: siblings[siblings.indexOf(item) + 1]?.id,
      last: withDetails.at(-1)?.id,
      phase: phase?.id
    }
  }, flagValue("--item"))
  await page.context().close()
  if (!ids.item) throw new Error(`check-fold-epics:  ${docName} has no item with details`)
  summary.ids = ids
  return ids
}

/** Where to click:  the middle of an item's chevron (`toggle`), or the start of its title. */
async function pointOf(page, id, part) {
  return page.evaluate(
    ({ id, part }) => {
      const box = document.getElementById(id).shadowRoot.querySelector(`[part~="${part}"]`).getBoundingClientRect()
      return part === "title"
        ? { x: box.left + Math.min(20, box.width / 2), y: box.top + 8 }
        : { x: box.left + box.width / 2, y: box.top + box.height / 2 }
    },
    { id, part }
  )
}

/** A real mouse click at `point` (no scrolling it into view first, as Playwright's `click()` would). */
async function clickAt(page, { x, y }) {
  await page.mouse.click(x, y)
}

/**
 * Watch `measure`'s top (and `details`' height) every frame, from just before `act()` to `WATCH_MS` after.
 * - returns `{ moved, end, at, animated, heights }`:  the furthest it moved, where it ended, when it moved most,
 *   and whether the details passed through a height between open and folded
 */
async function watchWhile(page, act, { measure, details }) {
  await page.evaluate(
    ({ measure, details, watchMs }) => {
      const target = eval(measure)
      const box = details ? eval(details) : null
      const start = performance.now()
      const samples = (globalThis.foldSamples = [])
      const tick = () => {
        samples.push({
          at: Math.round(performance.now() - start),
          top: target.getBoundingClientRect().top,
          height: box ? box.getBoundingClientRect().height : 0
        })
        if (performance.now() - start < watchMs) requestAnimationFrame(tick)
      }
      tick()
    },
    { measure, details, watchMs: WATCH_MS }
  )
  await act()
  await page.waitForTimeout(WATCH_MS + 200)
  const samples = await page.evaluate(() => globalThis.foldSamples)
  const first = samples[0]
  const worst = samples.reduce((most, sample) =>
    Math.abs(sample.top - first.top) > Math.abs(most.top - first.top) ? sample : most
  )
  const heights = samples.map((sample) => Math.round(sample.height))
  const full = heights[0]
  return {
    moved: Math.round((worst.top - first.top) * 10) / 10,
    end: Math.round((samples.at(-1).top - first.top) * 10) / 10,
    at: worst.at,
    animated: heights.some((height) => height > 1 && height < full - 1),
    heights: [...new Set(heights)].slice(0, 6).join(" ")
  }
}

/** Note what moved;  a problem past `TOLERANCE`. */
function report(where, { moved, end, at }) {
  summary[where] = { moved, end, at }
  if (Math.abs(moved) > TOLERANCE) problems.push(`${where}:  moved ${moved}px (at ${at}ms), ended ${end}px off`)
}

/** Screenshot (when named), its errors reported, its context closed. */
async function finish(page, logs, where, shot) {
  if (shot) await page.screenshot({ path: join(out, `${shot}.png`) })
  if (logs.length) problems.push(...logs.map((log) => `${where}:  ${log}`))
  await page.context().close()
}

/**
 * Copy the doc (and its parts) to `folder`, its relative links moved deeper, as `check-review-epics.mjs` does:
 * a real doc sits two folders under the root, the copy seven.  Never its inbox, agents or details.
 */
function copyDoc() {
  const from = join(ROOT, "epics", docName)
  const skeleton = join(from, `${docName}.plan.html`)
  if (!existsSync(skeleton)) {
    console.error(`check-fold-epics:  no ${skeleton}`)
    process.exit(2)
  }
  rmSync(folder, { recursive: true, force: true })
  mkdirSync(folder, { recursive: true })
  writeFileSync(
    join(folder, `${docName}.plan.html`),
    readFileSync(skeleton, "utf8").replaceAll('"../../', '"../../../../../../../')
  )
  const parts = join(from, "parts")
  if (!existsSync(parts)) return
  mkdirSync(join(folder, "parts"))
  for (const name of readdirSync(parts)) {
    const text = readFileSync(join(parts, name), "utf8").replaceAll('"../../../', '"../../../../../../../../')
    writeFileSync(join(folder, "parts", name), text)
  }
}
