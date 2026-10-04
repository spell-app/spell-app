/**
 * Check a plan doc's review actions (plan doc `review-review`, P5) in a real browser, against this checkout's page
 * server and its review routes (`scripts/reviewRoutes.ts`).
 * Usage:  node scripts/check-review.js [epic name] [outDir]   (default `review-review`;  from `packages/docs`)
 * - clicks through what Owen would:  an item's ellipsis menu -> Approve, Add to todo, Add Details;  Revisit with a
 *   note (the draft must survive a reload), saved "soon";  another revisited "now" (its spinner must show while the
 *   request waits);  "Choose" on an open question's option card;  then "Send to Claude"
 * - fails (exit 1) unless each shows on the page (button colors, the picked card, the send button's states) AND
 *   lands in the inbox file (read back through `GET /api/review/inbox`);  after a reload every mark still shows;  an
 *   in-place update (a log line it adds with `yarn plan-doc log <name> ... --here`, then removes) keeps the
 *   buttons and marks without reloading;  at 280px and 700px, light and dark, no item title runs under its button,
 *   and no review control runs past the window
 * - screenshots (outDir, default a temp folder):  `review-<width>-<scheme>.png`, a menu and a Revisit box open
 * - REFUSES to run on an inbox that already has marks (they'd be Owen's);  SIDE EFFECT:  deletes the inbox file
 *   afterwards, and its log line from the doc (reformatting it with oxfmt)
 * - prints a JSON summary on stdout, problems on stderr
 */
import { execFileSync } from "node:child_process"
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, relative } from "node:path"

import { chromium } from "playwright"

import { DOCS, ensurePageServer, planDocIn, serverUrl, tidy } from "./pages.js"

const name = process.argv[2] ?? "review-review"
const out = process.argv[3] ?? mkdtempSync(join(tmpdir(), "check-review-"))
const file = planDocIn(join(DOCS, "epics", name), name) ?? join(DOCS, "epics", name, `${name}.plan.html`)
const inboxFile = join(DOCS, "epics", name, `${name}.inbox.json`)
const served = ensurePageServer()
if (!served) {
  console.error("check-review:  no page server")
  process.exit(2)
}
const url = serverUrl(served.base, file)
const pagePath = new URL(url).pathname
const stamp = `check-review-${Date.now()}`
const NOTE = "check-review:  why not reuse the details route?"
const problems = []
const summary = { url, out }

const before = await inbox()
if (!before) {
  console.error("check-review:  the page server has no review routes (GET /api/review/inbox):  restart it")
  process.exit(2)
}
if (Object.keys(before.marks).length || before.now.length) {
  console.error(`check-review:  the inbox already has marks (${relative(DOCS, inboxFile)}):  not touching them`)
  process.exit(2)
}

const browser = await chromium.launch()
try {
  const context = await browser.newContext({ viewport: { width: 700, height: 900 } })
  const page = await context.newPage()
  const errors = []
  page.on("pageerror", (error) => errors.push(String(error)))
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()))
  await open(page)

  // the items to mark:  the first five judgement calls (open or closed:  every item has a menu), and Q7's cards
  const ids = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.plan-items[data-kind="judgement"] > [data-status][id]'), (item) => item.id)
  )
  if (ids.length < 5) throw new Error(`only ${ids.length} judgement calls:  need 5`)
  const [approve, todo, soon, now, details] = ids
  summary.items = { approve, todo, soon, now, details, pick: "q7" }
  await page.evaluate(unfold, "judgements")
  const count = await page.evaluate(() => ({
    items: document.querySelectorAll(".plan-items > [data-status][id]").length,
    buttons: document.querySelectorAll(".plan-items > [data-status][id] .plan-act-button").length,
    send: document.querySelector(".spell-page-head .plan-send")?.dataset.state
  }))
  summary.count = count
  if (count.buttons !== count.items) problems.push(`${count.items} items but ${count.buttons} ellipsis buttons`)
  if (count.send !== "idle") problems.push(`send button starts "${count.send}", not idle (grey)`)

  // Approve, Add to todo
  await pickInMenu(page, approve, "Approve")
  await expectButton(page, approve, "green", "approve")
  const unfolded = await page.evaluate((id) => {
    const accordion = document.querySelector(`#${id} > ui-accordion`)
    return accordion ? String(accordion.open ?? "") : ""
  }, approve)
  if (unfolded) problems.push(`a click on ${approve}'s ellipsis also opened its details`)
  await pickInMenu(page, todo, "Add to todo")
  await expectButton(page, todo, "violet", "todo")
  const scrolled = await page.evaluate(() => scrollY)

  // Revisit soon, with a note that survives a reload before it's saved
  await pickInMenu(page, soon, "Revisit")
  await page.fill(`#${soon} .plan-revisit-note`, NOTE)
  if ((await page.evaluate(() => scrollY)) !== scrolled) problems.push("opening the menu or the Revisit box scrolled")
  await open(page)
  await page.evaluate(unfold, "judgements")
  const draft = await page.evaluate((id) => document.querySelector(`#${id} .plan-revisit-note`)?.value, soon)
  if (draft !== NOTE) problems.push(`the Revisit draft didn't survive a reload ("${draft}")`)
  await page.click(`#${soon} .plan-revisit-soon`)
  await expectButton(page, soon, "orange", "revisit", (mark) => mark.when === "soon" && mark.note === NOTE)
  if (await page.$(`#${soon} .plan-revisit`)) problems.push("the Revisit box stayed open after saving")

  // Revisit now:  the request held a moment, so its spinner must show
  await page.route("**/api/review/now", async (route) => {
    await new Promise((done) => setTimeout(done, 700))
    await route.continue()
  })
  await pickInMenu(page, now, "Revisit")
  await page.fill(`#${now} .plan-revisit-note`, "check-review:  now")
  const posted = page.waitForResponse((response) => response.url().includes("/api/review/now"))
  await page.click(`#${now} .plan-revisit-now`)
  await page.waitForTimeout(150)
  const spinning = await page.evaluate((id) => {
    const spin = document.querySelector(`#${id} .plan-act-spin`)
    return !!spin && !spin.hidden && !spin.hasAttribute("data-waiting")
  }, now)
  if (!spinning) problems.push("no spinner while the revisit-now request waited")
  await posted
  await expectButton(page, now, "orange", "revisit", (mark) => mark.when === "now")
  const queued = await inbox()
  if (!queued.now.some((entry) => entry.id === now)) problems.push(`revisit now:  ${now} not queued on \`now\``)
  const said = await page.evaluate(() => document.querySelector(".plan-review-notice:not([hidden])")?.textContent)
  if (!queued.listening && !/No Claude session/.test(said ?? ""))
    problems.push("nobody listening, but the page didn't say so (D6)")

  // Add Details
  await pickInMenu(page, details, "Add Details")
  await page.waitForResponse((response) => response.url().includes("/api/review/now"))
  await expectButton(page, details, "blue", "details")
  await page.unroute("**/api/review/now")

  // Choose an option card in an open question (Q7:  A / B)
  await page.evaluate(unfold, "decisions")
  await page.evaluate(() => {
    const accordion = document.querySelector("#q7 > ui-accordion")
    if (accordion) accordion.open = "0"
  })
  await page.waitForTimeout(300)
  await page.click('#q7 .plan-choose[data-letter="B"]')
  await page.waitForTimeout(300)
  const card = await page.evaluate(() => {
    const pill = document.querySelector('#q7 .plan-choose[data-letter="B"]')
    const column = pill?.closest("ui-column")
    return { picked: column?.hasAttribute("data-picked"), folded: !column?.hasAttribute("data-open") }
  })
  if (!card.picked) problems.push("Q7's card B isn't framed as picked")
  if (!card.folded) problems.push("a click on Choose also unfolded the card")
  const picked = (await inbox()).marks.q7
  if (picked?.action !== "pick" || picked.pick !== "B") problems.push(`inbox:  q7 is ${JSON.stringify(picked)}`)

  // what Owen sees before sending:  the marked items, the picked card
  for (const [id, shot] of [
    [approve, "review-marked.png"],
    ["q7", "review-picked.png"]
  ]) {
    await page.locator(`#${id} .plan-act-button`).scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)
    await page.screenshot({ path: join(out, shot) })
  }

  // Send to Claude:  blue before, outlined after
  const sendBefore = await page.$eval(".plan-send", (button) => button.dataset.state)
  if (sendBefore !== "unsent") problems.push(`send button before sending:  "${sendBefore}", not unsent (blue)`)
  await page.click(".plan-send")
  await page.waitForTimeout(400)
  const sendAfter = await page.$eval(".plan-send", (button) => button.dataset.state)
  if (sendAfter !== "sent") problems.push(`send button after sending:  "${sendAfter}", not sent (outlined)`)
  if (!(await inbox()).sent) problems.push("inbox:  `sent` not set")

  // reload:  everything still shows
  await open(page)
  const shown = await page.evaluate(marksShown)
  summary.afterReload = shown
  const want = { [approve]: "green", [todo]: "violet", [soon]: "orange", [now]: "orange", [details]: "blue" }
  for (const [id, color] of Object.entries(want))
    if (shown[id]?.color !== color || !shown[id]?.sent)
      problems.push(`after reload:  ${id} is ${JSON.stringify(shown[id])}`)
  if (shown.q7?.letter !== "B" || !shown.q7picked) problems.push(`after reload:  q7 is ${JSON.stringify(shown.q7)}`)

  // an in-place update keeps the buttons and the marks
  await page.evaluate(() => (window.__checkReview = true))
  execFileSync("yarn", ["plan-doc", "log", name, stamp, "--here"], { cwd: DOCS, stdio: "ignore" })
  try {
    await page.waitForFunction((text) => document.getElementById("log")?.textContent.includes(text), stamp, {
      timeout: 10_000
    })
  } catch {
    problems.push("the new log line never showed up")
  }
  await page.waitForTimeout(800)
  const updated = await page.evaluate(marksShown)
  if (!(await page.evaluate(() => window.__checkReview === true))) problems.push("the update reloaded the page")
  if (JSON.stringify(updated) !== JSON.stringify(shown)) problems.push("the in-place update changed the marks shown")
  const after = await page.evaluate(
    () =>
      document.querySelectorAll(".plan-items > [data-status][id] .plan-act-button").length ===
        document.querySelectorAll(".plan-items > [data-status][id]").length &&
      document.querySelectorAll(".plan-send").length === 1
  )
  if (!after) problems.push("the in-place update lost (or doubled) buttons")
  removeLogLine()
  if (errors.length) problems.push(`page errors:  ${errors.join(" | ")}`)
  await context.close()

  // widths and schemes:  nothing runs under a button, nothing scrolls sideways
  summary.screenshots = []
  for (const width of [280, 700])
    for (const scheme of ["light", "dark"]) {
      const shot = await browser.newContext({ viewport: { width, height: 800 }, colorScheme: scheme })
      const view = await shot.newPage()
      await open(view)
      await view.evaluate(unfold, "judgements")
      await view.waitForTimeout(400)
      const layout = await view.evaluate(overlaps)
      for (const problem of layout) problems.push(`${width}px ${scheme}:  ${problem}`)
      // a Revisit box and a menu open, the menu's item at the top
      await view.evaluate(scrollNear, todo)
      await pickInMenu(view, approve, "Revisit")
      await view.click(`#${todo} .plan-act-button`)
      await view.waitForSelector(".plan-act-menu:popover-open")
      const path = join(out, `review-${width}-${scheme}.png`)
      await view.screenshot({ path })
      summary.screenshots.push(path)
      await shot.close()
    }
} catch (error) {
  problems.push(`stopped:  ${error.message}`)
} finally {
  await browser.close()
  removeLogLine()
  rmSync(inboxFile, { force: true })
}

for (const problem of problems) console.error(`PROBLEM:  ${problem}`)
console.log(JSON.stringify({ ...summary, ok: !problems.length }, null, 2))
process.exit(problems.length ? 1 : 0)

////////////////
// ## Steps
////////////////

/** Load (or reload) the doc and wait for the review buttons. */
async function open(page) {
  await page.goto(url)
  await page.waitForSelector(".plan-act-button", { timeout: 15_000 })
  await page.waitForTimeout(500)
}

/** Open item `id`'s menu and click its row `label`. */
async function pickInMenu(page, id, label) {
  await page.click(`#${id} .plan-act-button`)
  await page.waitForSelector(".plan-act-menu:popover-open")
  await page.click(`.plan-act-menu > button:has-text("${label}")`)
  await page.waitForTimeout(300)
}

/** Item `id`'s button must be `color`, and the inbox must hold an `action` mark for it (and pass `check`). */
async function expectButton(page, id, color, action, check = () => true) {
  const shown = await page.evaluate((item) => document.querySelector(`#${item} .plan-act-button`)?.dataset.color, id)
  if (shown !== color) problems.push(`${id}:  button is ${shown ?? "grey"}, not ${color}`)
  const mark = (await inbox()).marks[id]
  if (mark?.action !== action || !check(mark)) problems.push(`inbox:  ${id} is ${JSON.stringify(mark)}`)
}

/** The inbox, through the route;  undefined when the server has none. */
async function inbox() {
  try {
    const response = await fetch(`${served.base}/api/review/inbox?page=${encodeURIComponent(pagePath)}`)
    return response.ok ? await response.json() : undefined
  } catch {
    return undefined
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
  if (start < 0 || close < 0 || end <= 0) return console.error(`check-review:  remove "${stamp}" from the log by hand`)
  writeFileSync(file, html.slice(0, start) + html.slice(end))
  tidy([file])
}

////////////////
// ## In the page
////////////////

/** In the page:  unfold the top-level section holding list `kind`'s items (or section `id`). */
function unfold(which) {
  const kinds = { judgements: "judgement", decisions: "decision" }
  const list = document.querySelector(`.plan-items[data-kind="${kinds[which] ?? which}"]`)
  let section = list?.closest("ui-section") ?? document.getElementById(which)
  while (section?.parentElement?.closest("ui-section")) section = section.parentElement.closest("ui-section")
  if (!section?.hasAttribute("collapsed")) return
  section.shadowRoot?.querySelector('[part~="title"]')?.click()
  if (section.hasAttribute("collapsed")) section.collapsed = false
}

/** In the page:  scroll item `id` to 200px below the window's top. */
function scrollNear(id) {
  const item = document.getElementById(id)
  scrollTo({ top: scrollY + item.getBoundingClientRect().top - 200, behavior: "instant" })
}

/** In the page:  each marked item's button (`color`, `sent`, `letter`), and whether Q7's card B is picked. */
function marksShown() {
  const shown = {}
  for (const button of document.querySelectorAll(".plan-items > [data-status][id] .plan-act-button[data-color]")) {
    const id = button.closest("[data-status][id]").id
    shown[id] = {
      color: button.dataset.color,
      sent: button.hasAttribute("data-sent"),
      letter: button.querySelector(".plan-act-letter")?.textContent || undefined
    }
  }
  shown.q7picked = !!document.querySelector('#q7 ui-column[data-picked] .plan-choose[data-letter="B"]')
  return shown
}

/** In the page:  items whose title runs under their button, and a page wider than the window. */
function overlaps() {
  const found = []
  for (const item of document.querySelectorAll(".plan-items > [data-status][id]")) {
    const title = item.querySelector(".plan-title")
    const button = item.querySelector(".plan-act-button")
    if (!title || !button || !title.getClientRects().length) continue
    const act = button.getBoundingClientRect()
    for (const line of title.getClientRects())
      if (line.right > act.left + 1 && line.bottom > act.top && line.top < act.bottom) {
        found.push(`${item.id}'s title runs under its button`)
        break
      }
  }
  // the review controls only:  at 280px the doc's own long `code` lines already run wide (from `file://` too)
  for (const control of document.querySelectorAll(".plan-act, .plan-revisit, .plan-send, .plan-choose")) {
    const box = control.getBoundingClientRect()
    if (box.width && box.right > innerWidth + 1) found.push(`${control.className} runs past the window's edge`)
  }
  return found
}
