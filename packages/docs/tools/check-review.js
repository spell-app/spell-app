/**
 * Check a plan doc's review actions (plan doc `review-review`, P5) in a real browser, against this checkout's page
 * server and its review routes (`tools/reviewRoutes.ts`).
 * Usage:  node tools/check-review.js [epic name] [outDir]   (default `review-review`;  from `packages/docs`)
 * - clicks through what Owen would:  an item's ellipsis menu -> Approve, Add to todo, Add Details;  Revisit with a
 *   note (saved to the inbox as typed, "Saved";  it must survive a reload at ANOTHER address, `localhost`, whose
 *   localStorage is its own), saved "soon", then shown under its item with Edit (epic `windows-and-review` P1);
 *   another revisited "now" (its spinner must show while the
 *   request waits);  "Choose" on an open question's option card, then a Revisit on it ("pick B, but ...":  both
 *   kept, the letter changes and drops without losing the note);  then "Send to Claude", and `spell dev plan-doc
 *   inbox <name> wait` must print the pick with its note
 * - the items:  the first five judgement calls, topped up from the other lists;  the question:  the doc's first open
 *   one with option cards A and B (`openQuestionWithCards()`).  None:  the "Choose" steps are skipped, and the
 *   summary's `items.pick` says so
 * - a SPLIT doc (P3 of `claude-design`:  item details load when opened):  the question is opened before its cards
 *   are clicked (`openQuestion()`), and after the reload its button must show the pick's letter BEFORE its details
 *   load;  the log line goes into the log's part file
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

import { EPICS, ROOT, ensurePageServer, planDocIn, planLogFile, serverUrl, tidy } from "./pages.js"

const name = process.argv[2] ?? "review-review"
const out = process.argv[3] ?? mkdtempSync(join(tmpdir(), "check-review-"))
const file = planDocIn(join(EPICS, name), name) ?? join(EPICS, name, `${name}.plan.html`)
const inboxFile = join(EPICS, name, `${name}.inbox.json`)
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

/** The open question whose cards the "Choose" steps pick:  `review-review`'s Q7, any doc's first;  or none. */
const Q = openQuestionWithCards()
const before = await inbox()
if (!before) {
  console.error("check-review:  the page server has no review routes (GET /api/review/inbox):  restart it")
  process.exit(2)
}
if (Object.keys(before.marks).length || before.now.length || existsSync(inboxFile)) {
  console.error(`check-review:  the inbox already has marks (${relative(ROOT, inboxFile)}):  not touching them`)
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

  // the items to mark:  the first five judgement calls (open or closed:  every item has a menu), topped up from the
  // other lists when there are fewer;  and an open question's cards (`Q`)
  const ids = await page.evaluate((skip) => {
    const items = Array.from(document.querySelectorAll(".plan-items > [data-status][id]")).filter(
      (item) => item.id !== skip
    )
    const judgements = items.filter((item) => item.parentElement.dataset.kind === "judgement")
    return [...judgements, ...items.filter((item) => !judgements.includes(item))].map((item) => item.id)
  }, Q)
  if (ids.length < 5) throw new Error(`only ${ids.length} items:  need 5`)
  const [approve, todo, soon, now, details] = ids
  summary.items = { approve, todo, soon, now, details, pick: Q ?? "none:  no open question with option cards A and B" }
  for (const id of [approve, todo, soon, now, details]) await page.evaluate(unfold, id)
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
  // the next item's button in view first:  Playwright scrolls to what it clicks, which is not the page scrolling
  await page.locator(`#${soon} .plan-act-button`).scrollIntoViewIfNeeded()
  const scrolled = await page.evaluate(() => scrollY)

  // Revisit soon, with a note that survives a reload before it's saved
  await pickInMenu(page, soon, "Revisit")
  // measured before typing:  Playwright's `fill()` scrolls a box half out of the window into it, the page doesn't
  const afterBox = await page.evaluate(() => scrollY)
  if (afterBox !== scrolled) problems.push(`opening the menu or the Revisit box scrolled (${scrolled} -> ${afterBox})`)
  await page.fill(`#${soon} .plan-revisit-note`, NOTE)
  // saved to the inbox as typed (epic `windows-and-review` P1):  the status says so, the inbox has it
  await page
    .waitForFunction(
      (id) => /^Saved /.test(document.querySelector(`#${id} .plan-revisit-status`)?.textContent ?? ""),
      soon,
      { timeout: 5000 }
    )
    .catch(() => problems.push("the Revisit note never said Saved"))
  if ((await inbox()).drafts?.[soon]?.note !== NOTE) problems.push("the Revisit note isn't a draft in the inbox")
  // reloaded at ANOTHER address (localhost, not 127.0.0.1):  its own localStorage, so only the inbox can bring it back
  const elsewhere = url.replace("//127.0.0.1:", "//localhost:")
  await open(page, elsewhere)
  for (const id of [approve, todo, soon, now, details]) await page.evaluate(unfold, id)
  const draft = await page.evaluate((id) => document.querySelector(`#${id} .plan-revisit-note`)?.value, soon)
  if (draft !== NOTE) problems.push(`the Revisit draft didn't survive a reload at another address ("${draft}")`)
  const bubble = await page.evaluate((id) => {
    const noted = document.querySelector(`#${id} .plan-act-noted`)
    return noted && !noted.hidden ? noted.querySelector("ui-icon")?.getAttribute("name") : null
  }, soon)
  if (bubble !== "comment outline") problems.push(`a draft's line shows ${bubble ?? "no"} note bubble`)
  await open(page)
  for (const id of [approve, todo, soon, now, details]) await page.evaluate(unfold, id)
  await page.click(`#${soon} .plan-revisit-soon`)
  await expectButton(page, soon, "orange", "revisit", (mark) => mark.when === "soon" && mark.note === NOTE)
  if (await page.$(`#${soon} .plan-revisit`)) problems.push("the Revisit box stayed open after saving")
  if ((await inbox()).drafts?.[soon]) problems.push("the draft stayed after the note became a mark")
  // the note stays in view, with Edit (I1:  a sent note used to vanish)
  const noteShown = await page.evaluate((id) => document.querySelector(`#${id} .plan-said-note`)?.textContent, soon)
  if (noteShown !== NOTE) problems.push(`the saved note isn't shown under its item ("${noteShown}")`)
  await page.click(`#${soon} .plan-said-edit`)
  const editing = await page.evaluate((id) => document.querySelector(`#${id} .plan-revisit-note`)?.value, soon)
  if (editing !== NOTE) problems.push(`Edit didn't reopen the note ("${editing}")`)
  await page.click(`#${soon} .plan-revisit-soon`)
  await page.waitForTimeout(300)

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

  // Choose an option card in an open question (`Q`:  A / B);  none in the doc:  skipped (the summary says so)
  if (Q) {
    await openQuestion(page, Q)
    await page.click(`#${Q} .plan-choose[data-letter="B"]`)
    await page.waitForTimeout(300)
    const card = await page.evaluate((id) => {
      const pill = document.querySelector(`#${id} .plan-choose[data-letter="B"]`)
      const column = pill?.closest("ui-column")
      return { picked: column?.hasAttribute("data-picked"), folded: !column?.hasAttribute("data-open") }
    }, Q)
    if (!card.picked) problems.push(`${Q}'s card B isn't framed as picked`)
    if (!card.folded) problems.push("a click on Choose also unfolded the card")
    const picked = (await inbox()).marks[Q]
    if (picked?.action !== "pick" || picked.pick !== "B") problems.push(`inbox:  ${Q} is ${JSON.stringify(picked)}`)

    // "pick B, but ..." (I3):  a Revisit on the picked question keeps the pick;  choosing again keeps the note
    await pickInMenu(page, Q, "Revisit")
    await page.fill(`#${Q} .plan-revisit-note`, PICK_NOTE)
    await page.click(`#${Q} .plan-revisit-soon`)
    await page.waitForTimeout(300)
    const both = (mark) => mark.when === "soon" && mark.note === PICK_NOTE
    await expectButton(page, Q, "orange", "revisit", (mark) => both(mark) && mark.pick === "B")
    if ((await pickShown(page, Q)).letter !== "B")
      problems.push(`pick + revisit:  ${Q} shows ${JSON.stringify(await pickShown(page, Q))}`)
    await page.click(`#${Q} .plan-choose[data-letter="A"]`)
    await page.waitForTimeout(300)
    await expectButton(page, Q, "orange", "revisit", (mark) => both(mark) && mark.pick === "A")
    const changed = await pickShown(page, Q)
    if (changed.letter !== "A" || changed.picked !== "A")
      problems.push(`choosing A:  ${Q} shows ${JSON.stringify(changed)}`)
    // the chosen pill again:  just the pick goes, the note stays
    await page.click(`#${Q} .plan-choose[data-letter="A"]`)
    await page.waitForTimeout(300)
    await expectButton(page, Q, "orange", "revisit", (mark) => both(mark) && !("pick" in mark))
    const dropped = await pickShown(page, Q)
    if (dropped.letter || dropped.picked) problems.push(`un-picking A:  ${Q} shows ${JSON.stringify(dropped)}`)
    await page.click(`#${Q} .plan-choose[data-letter="B"]`)
    await page.waitForTimeout(300)
    await expectButton(page, Q, "orange", "revisit", (mark) => both(mark) && mark.pick === "B")
  }

  // what Owen sees before sending:  the marked items, the picked card
  for (const [id, shot] of [[approve, "review-marked.png"], ...(Q ? [[Q, "review-picked.png"]] : [])]) {
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
  if (!/^sent /m.test(work)) problems.push(`\`inbox wait\` didn't hand the send over:\n${work}`)
  if (Q) {
    const qAt = lines.findIndex((line, at) => at > talkAt && new RegExp(`^\\s+- ${Q.toUpperCase()}\\s`).test(line))
    summary.wait = lines.slice(qAt, qAt + 2)
    const combo = lines[qAt + 1]?.trim() ?? ""
    if (talkAt < 0 || qAt < 0 || !combo.startsWith("picks B · ") || !combo.endsWith(`, asks:  "${PICK_NOTE}"`))
      problems.push(
        `\`inbox wait\` didn't print ${Q.toUpperCase()}'s pick with its note under "to talk over":\n${work}`
      )
  }

  // reload:  everything still shows.  The buttons on the item LINES first, details not loaded (a split doc loads
  // an item's details only when it's opened):  the pick's letter on its button;  then its card, once opened
  await open(page)
  const lines0 = await page.evaluate(marksShown, null)
  if (Q && lines0[Q]?.letter !== "B")
    problems.push(`after reload, details not open:  ${Q} is ${JSON.stringify(lines0[Q])}`)
  if (Q) await openQuestion(page, Q)
  const shown = await page.evaluate(marksShown, Q)
  summary.afterReload = shown
  const want = { [approve]: "green", [todo]: "violet", [soon]: "orange", [now]: "orange", [details]: "blue" }
  for (const [id, color] of Object.entries(want))
    if (shown[id]?.color !== color || !shown[id]?.sent)
      problems.push(`after reload:  ${id} is ${JSON.stringify(shown[id])}`)
  if (Q && (shown[Q]?.letter !== "B" || !shown.picked))
    problems.push(`after reload:  ${Q} is ${JSON.stringify(shown[Q])}`)

  // an in-place update keeps the buttons and the marks;  the log unfolded first:  a split doc loads its body only then
  await page.evaluate(unfold, "log")
  await page.waitForFunction(() => document.querySelector("#log .plan-log"), null, { timeout: 10_000 })
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
  const updated = await page.evaluate(marksShown, Q)
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
  if (Q) {
    await page.evaluate(unfold, "decisions")
    await page.locator(`#${Q} .plan-act-button`).scrollIntoViewIfNeeded()
    await pickInMenu(page, Q, "Clear")
    const cleared = await pickShown(page, Q)
    const left = (await inbox()).marks[Q]
    if (left || cleared.letter || cleared.picked || cleared.color)
      problems.push(`Clear on ${Q} left ${JSON.stringify({ inbox: left, page: cleared })}`)
  }
  if (errors.length) problems.push(`page errors:  ${errors.join(" | ")}`)
  await context.close()

  // widths and schemes:  nothing runs under a button, nothing scrolls sideways
  summary.screenshots = []
  for (const width of [280, 700])
    for (const scheme of ["light", "dark"]) {
      const shot = await browser.newContext({ viewport: { width, height: 800 }, colorScheme: scheme })
      const view = await shot.newPage()
      await open(view)
      for (const id of [approve, todo, soon, now, details]) await view.evaluate(unfold, id)
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
async function open(page, at = url) {
  await page.goto(at)
  // attached, not visible:  a plan doc starts with every section folded, its items out of sight
  await page.waitForSelector(".plan-act-button", { state: "attached", timeout: 15_000 })
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

/**
 * The picked question `id`'s button and cards as shown:  `{ color, letter, picked }` (`picked`:  the framed card's
 * letter).
 */
async function pickShown(page, id) {
  return page.evaluate((item) => {
    const button = document.querySelector(`#${item} .plan-act-button`)
    return {
      color: button?.dataset.color,
      letter: button?.querySelector(".plan-act-letter")?.textContent || undefined,
      picked: document.querySelector(`#${item} ui-column[data-picked] .plan-choose`)?.dataset.letter
    }
  }, id)
}

/**
 * The first OPEN question of the doc with option cards A and B, for the "Choose" steps;  `null` when there's none
 * (those steps are skipped, and the summary says so).  From `plan-doc items --json`, which reads a split doc whole:
 * on the page its details (and so its cards) load only once it's opened.
 */
function openQuestionWithCards() {
  try {
    const { sections } = JSON.parse(planDoc("items", name, "--section", "questions", "--filter", "open", "--json"))
    const question = sections[0]?.items.find(
      (item) => /attached="top">\s*A\b/.test(item.detailsHtml ?? "") && /attached="top">\s*B\b/.test(item.detailsHtml)
    )
    return question?.id.toLowerCase() ?? null
  } catch {
    return null
  }
}

/**
 * Open question `id`'s details on the page and wait for its "Choose" pills:  a split doc loads them only now
 * (`<ui-accordion source>`), and the pills come once the page has re-wired around the body.
 */
async function openQuestion(page, id) {
  await page.evaluate(unfold, "decisions")
  await page.evaluate((item) => {
    const accordion = document.querySelector(`#${item} > ui-accordion`)
    if (accordion && !String(accordion.open ?? "")) accordion.open = "0"
  }, id)
  await page.waitForSelector(`#${id} .plan-choose[data-letter="B"]`, { timeout: 10_000 })
  await page.waitForTimeout(200)
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

/**
 * Take this run's line out of the doc's log (a `<ui-event>`), then reformat that file:  the doc, or a split doc's
 * log part (`planLogFile()`).
 */
function removeLogLine() {
  const log = planLogFile(file)
  const html = readFileSync(log, "utf8")
  const at = html.indexOf(stamp)
  if (at < 0) return
  const start = html.lastIndexOf("<ui-event", at)
  const close = html.indexOf("</ui-event", at)
  const end = html.indexOf(">", close) + 1
  if (start < 0 || close < 0 || end <= 0) return console.error(`check-review:  remove "${stamp}" from the log by hand`)
  writeFileSync(log, html.slice(0, start) + html.slice(end))
  tidy([log])
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

/**
 * In the page:  each marked item's button (`color`, `sent`, `letter`), and whether question `pick`'s card B is
 * picked (its details must be open:  a split doc loads them only then).
 */
function marksShown(pick) {
  const shown = {}
  for (const button of document.querySelectorAll(".plan-items > [data-status][id] .plan-act-button[data-color]")) {
    const id = button.closest("[data-status][id]").id
    shown[id] = {
      color: button.dataset.color,
      sent: button.hasAttribute("data-sent"),
      letter: button.querySelector(".plan-act-letter")?.textContent || undefined
    }
  }
  if (pick) shown.picked = !!document.querySelector(`#${pick} ui-column[data-picked] .plan-choose[data-letter="B"]`)
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
