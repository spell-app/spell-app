/**
 * Check a plan doc's review actions (plan doc `review-review`, P5) in a real browser, against this checkout's page
 * server and its review routes (`tools/reviewRoutes.ts`).
 * Usage:  node tools/check-review.js [epic name] [outDir]   (default `review-review`;  from `packages/docs`)
 * - clicks through what Owen would:  an item's ellipsis menu -> Approve, Add to todo, Add Details;  Revisit with a
 *   note (the draft must survive a reload), saved "soon";  another revisited "now" (its spinner must show while the
 *   request waits);  "Choose" on an open question's option card, then a Revisit on it ("pick B, but ...":  both
 *   kept, the letter changes and drops without losing the note);  then "Send to Claude", and `spell dev plan-doc
 *   inbox <name> wait` must print the pick with its note
 * - starts with a STALE `listening` in the inbox (a session killed without `unlisten`):  the page must say nobody
 *   is reviewing (the send button's tooltip, the revisit-now notice);  after `inbox listen`, it must not
 * - fails (exit 1) unless each shows on the page (button colors, the picked card, the send button's states) AND
 *   lands in the inbox file (read back through `GET /api/review/inbox`);  after a reload every mark still shows;  an
 *   in-place update (a log line it adds with `spell dev plan-doc log <name> ...`, then removes) keeps the
 *   buttons and marks without reloading;  at 280px and 700px, light and dark, no item title runs under its button,
 *   and no review control runs past the window
 * - screenshots (outDir, default a temp folder):  `review-<width>-<scheme>.png`, a menu and a Revisit box open
 * - REFUSES to run while the inbox file exists (its marks, or a session listening, would be Owen's);  SIDE EFFECT:
 *   writes the inbox (by hand, then `spell dev plan-doc inbox <name> listen` / `wait`), deletes it afterwards,
 *   and its log line from the doc (reformatting it with oxfmt)
 * - prints a JSON summary on stdout, problems on stderr
 */
import { execFileSync } from "node:child_process"
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, relative } from "node:path"

import { chromium } from "playwright"

import { DOCS, ROOT, ensurePageServer, planDocIn, serverUrl, tidy } from "./pages.js"

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
const PICK_NOTE = "check-review:  B, but only for plan docs?"
/** Matches what the page says with nobody listening (`NOBODY_LISTENING` in the runtime). */
const NOBODY = /No Claude session/
const problems = []
const summary = { url, out }

const before = await inbox()
if (!before) {
  console.error("check-review:  the page server has no review routes (GET /api/review/inbox):  restart it")
  process.exit(2)
}
if (Object.keys(before.marks).length || before.now.length || existsSync(inboxFile)) {
  console.error(`check-review:  the inbox already has marks (${relative(DOCS, inboxFile)}):  not touching them`)
  process.exit(2)
}
// a session that died without `unlisten`, five minutes ago:  the page must treat it as nobody (I4).  Written by hand
// before the page opens:  nothing else writes the inbox yet
const gone = new Date(Date.now() - 5 * 60_000).toISOString()
writeFileSync(
  inboxFile,
  JSON.stringify({ ...before, listening: { session: "check-review-gone", since: gone, seen: gone } }, null, 2)
)

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
  // the stale `listening` (I4):  still in the file, but nobody to the route and the page
  const stale = { file: JSON.parse(readFileSync(inboxFile, "utf8")).listening, route: (await inbox()).listening }
  stale.sendTip = await page.$eval(".plan-send", (button) => button.title)
  summary.stale = stale
  if (!stale.file) problems.push("the stale `listening` is gone from the inbox file")
  if (stale.route) problems.push(`a stale listening still answers as listening:  ${JSON.stringify(stale.route)}`)
  if (!NOBODY.test(stale.sendTip)) problems.push(`stale listening:  the send tooltip says "${stale.sendTip}"`)
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
  if (queued.listening) problems.push("the stale listening came back as listening")
  if (!NOBODY.test(said ?? "")) problems.push("a stale listening, but the page didn't say nobody is reviewing (D6, I4)")

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

  // "pick B, but ..." (I3):  a Revisit on the picked question keeps the pick;  choosing again keeps the note
  await pickInMenu(page, "q7", "Revisit")
  await page.fill("#q7 .plan-revisit-note", PICK_NOTE)
  await page.click("#q7 .plan-revisit-soon")
  await page.waitForTimeout(300)
  const both = (mark) => mark.when === "soon" && mark.note === PICK_NOTE
  await expectButton(page, "q7", "orange", "revisit", (mark) => both(mark) && mark.pick === "B")
  if ((await q7Shown(page)).letter !== "B")
    problems.push(`pick + revisit:  q7 shows ${JSON.stringify(await q7Shown(page))}`)
  await page.click('#q7 .plan-choose[data-letter="A"]')
  await page.waitForTimeout(300)
  await expectButton(page, "q7", "orange", "revisit", (mark) => both(mark) && mark.pick === "A")
  const changed = await q7Shown(page)
  if (changed.letter !== "A" || changed.picked !== "A")
    problems.push(`choosing A:  q7 shows ${JSON.stringify(changed)}`)
  // the chosen pill again:  just the pick goes, the note stays
  await page.click('#q7 .plan-choose[data-letter="A"]')
  await page.waitForTimeout(300)
  await expectButton(page, "q7", "orange", "revisit", (mark) => both(mark) && !("pick" in mark))
  const dropped = await q7Shown(page)
  if (dropped.letter || dropped.picked) problems.push(`un-picking A:  q7 shows ${JSON.stringify(dropped)}`)
  await page.click('#q7 .plan-choose[data-letter="B"]')
  await page.waitForTimeout(300)
  await expectButton(page, "q7", "orange", "revisit", (mark) => both(mark) && mark.pick === "B")

  // what Owen sees before sending:  the marked items, the picked card
  for (const [id, shot] of [
    [approve, "review-marked.png"],
    ["q7", "review-picked.png"]
  ]) {
    await page.locator(`#${id} .plan-act-button`).scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)
    await page.screenshot({ path: join(out, shot) })
  }

  // a session listens now (a fresh heartbeat):  the page stops saying nobody is reviewing
  planDoc("inbox", name, "listen", "--session", "check-review")
  try {
    await page.waitForFunction(
      (nobody) => !new RegExp(nobody).test(document.querySelector(".plan-send")?.title),
      NOBODY.source,
      {
        timeout: 10_000
      }
    )
  } catch {
    problems.push("after `inbox listen`, the send tooltip still says nobody is reviewing")
  }

  // Send to Claude:  blue before, outlined after
  const sendBefore = await page.$eval(".plan-send", (button) => button.dataset.state)
  if (sendBefore !== "unsent") problems.push(`send button before sending:  "${sendBefore}", not unsent (blue)`)
  await page.click(".plan-send")
  await page.waitForTimeout(400)
  const sendAfter = await page.$eval(".plan-send", (button) => button.dataset.state)
  if (sendAfter !== "sent") problems.push(`send button after sending:  "${sendAfter}", not sent (outlined)`)
  if (!(await inbox()).sent) problems.push("inbox:  `sent` not set")
  const sentNotice = await page.evaluate(() => document.querySelector(".plan-review-notice:not([hidden])")?.textContent)
  if (!/^Sent \d+ to Claude/.test(sentNotice ?? ""))
    problems.push(`a session listening, but the send said "${sentNotice}"`)

  // Claude's side:  `wait` hands the send over, Q7 as "picks B · <card>, asks:  <note>" under "to talk over"
  const work = planDoc("inbox", name, "wait", "--timeout", "5")
  const lines = work.split("\n")
  const talkAt = lines.findIndex((line) => /^\s+revisit, to talk over \(\d+\):$/.test(line))
  const q7At = lines.findIndex((line, at) => at > talkAt && /^\s+- Q7\s/.test(line))
  summary.wait = lines.slice(q7At, q7At + 2)
  const combo = lines[q7At + 1]?.trim() ?? ""
  if (talkAt < 0 || q7At < 0 || !combo.startsWith("picks B · ") || !combo.endsWith(`, asks:  "${PICK_NOTE}"`))
    problems.push(`\`inbox wait\` didn't print Q7's pick with its note under "to talk over":\n${work}`)

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
  planDoc("log", name, stamp)
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

  // Clear on "pick B, but ...":  the pick and the note both go
  await page.evaluate(unfold, "decisions")
  await page.locator("#q7 .plan-act-button").scrollIntoViewIfNeeded()
  await pickInMenu(page, "q7", "Clear")
  const clearedQ7 = await q7Shown(page)
  const leftQ7 = (await inbox()).marks.q7
  if (leftQ7 || clearedQ7.letter || clearedQ7.picked || clearedQ7.color)
    problems.push(`Clear on q7 left ${JSON.stringify({ inbox: leftQ7, page: clearedQ7 })}`)
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

/** Q7's button and cards as shown:  `{ color, letter, picked }` (`picked`:  the framed card's letter). */
async function q7Shown(page) {
  return page.evaluate(() => {
    const button = document.querySelector("#q7 .plan-act-button")
    return {
      color: button?.dataset.color,
      letter: button?.querySelector(".plan-act-letter")?.textContent || undefined,
      picked: document.querySelector("#q7 ui-column[data-picked] .plan-choose")?.dataset.letter
    }
  })
}

/**
 * `spell dev plan-doc <args>`, its output;  a non-zero exit (`wait`'s timeout:  2) still answers what it printed.
 * - THIS checkout's CLI (`node packages/cli/bin/spell.mjs`), so it runs this branch's `plan-doc.js`, with no
 *   `yarn cli:install` link needed;  the doc is the shared one wherever it runs from
 */
function planDoc(...args) {
  try {
    return execFileSync("node", [join(ROOT, "packages/cli/bin/spell.mjs"), "dev", "plan-doc", ...args], {
      cwd: ROOT,
      encoding: "utf8"
    })
  } catch (error) {
    return `${error.stdout ?? ""}${error.stderr ?? ""}`
  }
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
