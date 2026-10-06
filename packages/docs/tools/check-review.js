/**
 * Check a plan doc's review actions (plan doc `review-review`, P5;  the buttons:  epic `windows-and-review` P2) in a
 * real browser, against this checkout's page server and its review routes (`tools/reviewRoutes.ts`).
 * Usage:  node tools/check-review.js [epic name] [outDir]   (default `review-review`;  from `packages/docs`)
 * - clicks through what Owen would, on the four buttons at each item's line end (`.plan-act`:  Approve, Make Todo,
 *   Revisit Now, Add Details Now):
 *   - Approve, then again (cleared), then again;  Make Todo, whose note box opens:  it must grow with ten lines
 *     typed, and its check saves the todo WITH its note
 *   - Revisit Now with a note (saved to the inbox as typed, "Saved";  it must survive a reload at ANOTHER address,
 *     `localhost`, whose localStorage is its own), saved "soon", then shown under its item with Edit (P1);  another
 *     revisited "now":  its button must spin (`loading`) while the request waits
 *   - Add Details Now;  then "nevermind" on another item:  its button clicked again while the request is still on
 *     its way, and again once it's queued:  nothing left on `now`, `canceled[id]` set, the button idle
 *   - "Choose" on an open question's option card, then a Revisit on it ("pick B, but ...":  both kept, the letter
 *     changes and drops without losing the note);  then "Send to Claude", and `spell dev plan-doc inbox <name> wait`
 *     must print the pick with its note;  at the end the chosen Revisit clicked again leaves the plain pick, and
 *     the chosen pill again clears it
 * - the items:  the first six judgement calls, topped up from the other lists;  the question:  the doc's first open
 *   one with option cards A and B (`openQuestionWithCards()`).  None:  the "Choose" steps are skipped, and the
 *   summary's `items.pick` says so
 * - a SPLIT doc (P3 of `claude-design`:  item details load when opened):  the question is opened before its cards
 *   are clicked (`openQuestion()`), and after the reload its line must show the pick's letter BEFORE its details
 *   load;  the log line goes into the log's part file
 * - starts with a STALE `listening` in the inbox (a session killed without `unlisten`):  the page must say nobody
 *   is reviewing (the send button's tooltip, the revisit-now notice);  after `inbox listen`, it must not
 * - fails (exit 1) unless each shows on the page (which button is chosen and sent, its color, the picked card, the
 *   send button's states) AND lands in the inbox file (read back through `GET /api/review/inbox`);  after a reload
 *   every mark still shows;  an in-place update (a log line it adds with `spell dev plan-doc log <name> ...`, then
 *   removes) keeps the buttons and marks without reloading;  at 280px and 700px, light and dark, no item title runs
 *   under its buttons, and no review control runs past the window
 * - screenshots (outDir, default a temp folder):  `review-marked.png`, `review-picked.png`, and
 *   `review-<width>-<scheme>.png` with a Revisit box open and a button's tooltip showing
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
const TODO_NOTE = "check-review:  follow up once the routes settle"
const PICK_NOTE = "check-review:  B, but only for plan docs?"
/** Matches what the page says with nobody listening (`NOBODY_LISTENING` in the runtime). */
const NOBODY = /No Claude session/
/** Each button's color once chosen (`REVIEW_ACTIONS` in the runtime):  green decided, orange pending. */
const COLORS = { approve: "green", todo: "green", revisit: "orange", details: "orange" }
/** How long the held `POST now` waits:  long enough to see the spinner, and to call it off on its way. */
const HOLD_MS = 900
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

  // the items to mark:  the first six judgement calls (open or closed:  every item has the buttons), topped up from
  // the other lists when there are fewer;  and an open question's cards (`Q`)
  const ids = await page.evaluate((skip) => {
    const items = Array.from(document.querySelectorAll(".plan-items > [data-status][id]")).filter(
      (item) => item.id !== skip
    )
    const judgements = items.filter((item) => item.parentElement.dataset.kind === "judgement")
    return [...judgements, ...items.filter((item) => !judgements.includes(item))].map((item) => item.id)
  }, Q)
  if (ids.length < 6) throw new Error(`only ${ids.length} items:  need 6`)
  const [approve, todo, soon, now, details, nevermind] = ids
  const marked = [approve, todo, soon, now, details, nevermind]
  summary.items = {
    approve,
    todo,
    soon,
    now,
    details,
    nevermind,
    pick: Q ?? "none:  no open question with option cards A and B"
  }
  for (const id of marked) await page.evaluate(unfold, id)
  const count = await page.evaluate(() => ({
    items: document.querySelectorAll(".plan-items > [data-status][id]").length,
    acts: document.querySelectorAll(".plan-items > [data-status][id] .plan-act").length,
    buttons: document.querySelectorAll(".plan-items > [data-status][id] .plan-act ui-button[data-action]").length,
    send: document.querySelector(".spell-page-head .plan-send")?.dataset.state
  }))
  summary.count = count
  if (count.acts !== count.items) problems.push(`${count.items} items but ${count.acts} button groups`)
  if (count.buttons !== 4 * count.items) problems.push(`${count.items} items but ${count.buttons} buttons, not 4 each`)
  if (count.send !== "idle") problems.push(`send button starts "${count.send}", not idle (grey)`)

  // Approve;  again clears it (no Clear row any more);  a third time marks it again
  await press(page, approve, "approve")
  await expectButton(page, approve, "approve")
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
  if (unfolded) problems.push(`a click on ${approve}'s Approve also opened its details`)
  await press(page, approve, "approve")
  const toggled = { inbox: (await inbox()).marks[approve], chosen: await chosenOn(page, approve) }
  if (toggled.inbox || toggled.chosen.length) problems.push(`Approve clicked again left ${JSON.stringify(toggled)}`)
  await press(page, approve, "approve")
  await expectButton(page, approve, "approve")

  // Make Todo:  marked at once, its note box opens;  the box grows as it's typed in;  its check saves the note
  await press(page, todo, "todo")
  const todoBox = `#${todo} > .plan-revisit[data-action="todo"]`
  if (!(await page.$(todoBox))) problems.push("Make Todo didn't open its note box")
  else {
    const mark = (await inbox()).marks[todo]
    if (mark?.action !== "todo") problems.push(`Make Todo:  inbox ${todo} is ${JSON.stringify(mark)}, not a todo`)
    const note = `${todoBox} .plan-revisit-note`
    const short = await page.$eval(note, (box) => box.getBoundingClientRect().height)
    await page.fill(note, Array.from({ length: 10 }, (_, line) => `line ${line + 1}`).join("\n"))
    await page.waitForTimeout(100)
    const tall = await page.$eval(note, (box) => box.getBoundingClientRect().height)
    summary.noteGrows = { short, tall }
    if (tall < short + 60) problems.push(`the note box didn't grow with ten lines (${short}px -> ${tall}px)`)
    await page.fill(note, TODO_NOTE)
    await page.click(`${todoBox} .plan-revisit-soon`)
    await page.waitForTimeout(300)
    await expectButton(page, todo, "todo", (mark) => mark.note === TODO_NOTE)
    if (await page.$(todoBox)) problems.push("the todo's note box stayed open after its check")
    const shown = await page.evaluate((id) => document.querySelector(`#${id} .plan-said-note`)?.textContent, todo)
    if (shown !== TODO_NOTE) problems.push(`the todo's note isn't shown under its item ("${shown}")`)
  }
  // the next item's buttons in view first:  Playwright scrolls to what it clicks, which is not the page scrolling
  await page.locator(`#${soon} .plan-act`).scrollIntoViewIfNeeded()
  const scrolled = await page.evaluate(() => scrollY)

  // Revisit soon, with a note that survives a reload before it's saved
  await press(page, soon, "revisit")
  // measured before typing:  Playwright's `fill()` scrolls a box half out of the window into it, the page doesn't
  const afterBox = await page.evaluate(() => scrollY)
  if (afterBox !== scrolled) problems.push(`opening the Revisit box scrolled (${scrolled} -> ${afterBox})`)
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
  for (const id of marked) await page.evaluate(unfold, id)
  const draft = await page.evaluate((id) => document.querySelector(`#${id} .plan-revisit-note`)?.value, soon)
  if (draft !== NOTE) problems.push(`the Revisit draft didn't survive a reload at another address ("${draft}")`)
  const bubble = await page.evaluate((id) => {
    const noted = document.querySelector(`#${id} .plan-act-noted`)
    return noted && !noted.hidden ? noted.querySelector("ui-icon")?.getAttribute("name") : null
  }, soon)
  if (bubble !== "comment outline") problems.push(`a draft's line shows ${bubble ?? "no"} note bubble`)
  await open(page)
  for (const id of marked) await page.evaluate(unfold, id)
  await page.click(`#${soon} .plan-revisit-soon`)
  await page.waitForTimeout(300)
  await expectButton(page, soon, "revisit", (mark) => mark.when === "soon" && mark.note === NOTE)
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

  // Revisit now:  the request held a moment, so its button must spin
  await holdNow(page)
  await press(page, now, "revisit")
  await page.fill(`#${now} .plan-revisit-note`, "check-review:  now")
  const posted = page.waitForResponse((response) => response.url().includes("/api/review/now"))
  await page.click(`#${now} .plan-revisit-now`)
  await page.waitForTimeout(150)
  const spinning = await buttonState(page, now, "revisit")
  if (!spinning.loading || spinning.waiting)
    problems.push(`revisit now:  the button didn't spin while its request waited (${JSON.stringify(spinning)})`)
  await posted
  await page.waitForTimeout(150)
  await expectButton(page, now, "revisit", (mark) => mark.when === "now")
  const queued = await inbox()
  if (!queued.now.some((entry) => entry.id === now)) problems.push(`revisit now:  ${now} not queued on \`now\``)
  const said = await page.evaluate(() => document.querySelector(".plan-review-notice:not([hidden])")?.textContent)
  if (queued.listening) problems.push("the stale listening came back as listening")
  if (!NOBODY.test(said ?? "")) problems.push("a stale listening, but the page didn't say nobody is reviewing (D6, I4)")
  const ring = await buttonState(page, now, "revisit")
  if (!ring.waiting || ring.loading)
    problems.push(`revisit now, queued with nobody listening:  not a still ring (${JSON.stringify(ring)})`)

  // Add Details Now
  await press(page, details, "details", { settle: 0 })
  await page.waitForResponse((response) => response.url().includes("/api/review/now"))
  await page.waitForTimeout(150)
  await expectButton(page, details, "details")

  // "nevermind":  clicked again while the request is on its way;  then asked again, and called off once queued
  await press(page, nevermind, "details", { settle: 150 })
  const asked = await buttonState(page, nevermind, "details")
  if (!asked.loading) problems.push(`nevermind:  Add Details Now didn't spin while its request waited`)
  await press(page, nevermind, "details", { settle: HOLD_MS + 600 })
  await expectCalledOff(page, nevermind, "on its way")
  await page.unroute("**/api/review/now")
  await press(page, nevermind, "details", { settle: 0 })
  await page.waitForResponse((response) => response.url().includes("/api/review/now"))
  await page.waitForTimeout(200)
  if (!(await inbox()).now.some((entry) => entry.id === nevermind))
    problems.push(`nevermind:  asked again, ${nevermind} isn't queued on \`now\``)
  await press(page, nevermind, "details", { settle: 600 })
  await expectCalledOff(page, nevermind, "queued")

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
    await press(page, Q, "revisit")
    await page.fill(`#${Q} .plan-revisit-note`, PICK_NOTE)
    await page.click(`#${Q} .plan-revisit-soon`)
    await page.waitForTimeout(300)
    const both = (mark) => mark.when === "soon" && mark.note === PICK_NOTE
    await expectButton(page, Q, "revisit", (mark) => both(mark) && mark.pick === "B")
    if ((await pickShown(page, Q)).letter !== "B")
      problems.push(`pick + revisit:  ${Q} shows ${JSON.stringify(await pickShown(page, Q))}`)
    await page.click(`#${Q} .plan-choose[data-letter="A"]`)
    await page.waitForTimeout(300)
    await expectButton(page, Q, "revisit", (mark) => both(mark) && mark.pick === "A")
    const changed = await pickShown(page, Q)
    if (changed.letter !== "A" || changed.picked !== "A")
      problems.push(`choosing A:  ${Q} shows ${JSON.stringify(changed)}`)
    // the chosen pill again:  just the pick goes, the note stays
    await page.click(`#${Q} .plan-choose[data-letter="A"]`)
    await page.waitForTimeout(300)
    await expectButton(page, Q, "revisit", (mark) => both(mark) && !("pick" in mark))
    const dropped = await pickShown(page, Q)
    if (dropped.letter || dropped.picked) problems.push(`un-picking A:  ${Q} shows ${JSON.stringify(dropped)}`)
    await page.click(`#${Q} .plan-choose[data-letter="B"]`)
    await page.waitForTimeout(300)
    await expectButton(page, Q, "revisit", (mark) => both(mark) && mark.pick === "B")
  }

  // what Owen sees before sending:  the marked items, the picked card
  for (const [id, shot] of [[approve, "review-marked.png"], ...(Q ? [[Q, "review-picked.png"]] : [])]) {
    await page.locator(`#${id} .plan-act`).scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)
    await page.screenshot({ path: join(out, shot) })
  }

  // a session listens now (a fresh heartbeat):  the page stops saying nobody is reviewing
  planDoc("inbox", name, "listen", "--session", "check-review")
  try {
    await page.waitForFunction(
      (nobody) => !new RegExp(nobody).test(document.querySelector(".plan-send")?.title),
      NOBODY.source,
      { timeout: 10_000 }
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
  // an item's details only when it's opened):  the pick's letter on its line;  then its card, once opened
  await open(page)
  const lines0 = await page.evaluate(marksShown, null)
  if (Q && lines0[Q]?.letter !== "B")
    problems.push(`after reload, details not open:  ${Q} is ${JSON.stringify(lines0[Q])}`)
  if (Q) await openQuestion(page, Q)
  const shown = await page.evaluate(marksShown, Q)
  summary.afterReload = shown
  const want = { [approve]: "approve", [todo]: "todo", [soon]: "revisit", [now]: "revisit", [details]: "details" }
  for (const [id, action] of Object.entries(want)) {
    const got = shown[id]
    if (got?.chosen !== action || got.color !== COLORS[action] || !got.sent)
      problems.push(`after reload:  ${id} is ${JSON.stringify(got)}, not ${action} sent`)
  }
  if (shown[nevermind])
    problems.push(`after reload:  the called-off ${nevermind} is ${JSON.stringify(shown[nevermind])}`)
  if (Q && (shown[Q]?.letter !== "B" || shown[Q]?.chosen !== "revisit" || !shown.picked))
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
  const after = await page.evaluate(() => {
    const items = document.querySelectorAll(".plan-items > [data-status][id]").length
    const acts = document.querySelectorAll(".plan-items > [data-status][id] .plan-act").length
    const buttons = document.querySelectorAll(".plan-items > [data-status][id] .plan-act ui-button[data-action]")
    return acts === items && buttons.length === 4 * items && document.querySelectorAll(".plan-send").length === 1
  })
  if (!after) problems.push("the in-place update lost (or doubled) buttons")
  removeLogLine()

  // un-doing "pick B, but ...":  the chosen Revisit again leaves the plain pick;  the chosen pill again clears it
  if (Q) {
    await page.evaluate(unfold, "decisions")
    await page.locator(`#${Q} .plan-act`).scrollIntoViewIfNeeded()
    await press(page, Q, "revisit")
    const plain = { inbox: (await inbox()).marks[Q], page: await pickShown(page, Q) }
    if (plain.inbox?.action !== "pick" || plain.inbox.pick !== "B" || plain.page.letter !== "B" || plain.page.chosen)
      problems.push(`Revisit clicked again on ${Q} left ${JSON.stringify(plain)}, not the plain pick B`)
    await page.click(`#${Q} .plan-choose[data-letter="B"]`)
    await page.waitForTimeout(300)
    const cleared = await pickShown(page, Q)
    const left = (await inbox()).marks[Q]
    if (left || cleared.letter || cleared.picked || cleared.chosen)
      problems.push(`un-picking B on ${Q} left ${JSON.stringify({ inbox: left, page: cleared })}`)
  }
  if (errors.length) problems.push(`page errors:  ${errors.join(" | ")}`)
  await context.close()

  // widths and schemes:  nothing runs under the buttons, nothing scrolls sideways
  summary.screenshots = []
  for (const width of [280, 700])
    for (const scheme of ["light", "dark"]) {
      const shot = await browser.newContext({ viewport: { width, height: 800 }, colorScheme: scheme })
      const view = await shot.newPage()
      await open(view)
      for (const id of marked) await view.evaluate(unfold, id)
      await view.waitForTimeout(400)
      const layout = await view.evaluate(overlaps)
      for (const problem of layout) problems.push(`${width}px ${scheme}:  ${problem}`)
      // a Revisit box open (on the unmarked item:  nothing written), the working Add Details' tooltip showing
      await press(view, nevermind, "revisit")
      await view.evaluate(scrollNear, now)
      await view.hover(`#${details} .plan-act ui-button[data-action="details"]`)
      await view.waitForTimeout(600)
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
  await page.waitForSelector(".plan-act ui-button[data-action]", { state: "attached", timeout: 15_000 })
  await page.waitForTimeout(500)
}

/** Click item `id`'s `action` button (`approve`, `todo`, `revisit`, `details`), then wait `settle` ms. */
async function press(page, id, action, { settle = 300 } = {}) {
  await page.click(`#${id} .plan-act ui-button[data-action="${action}"]`)
  if (settle) await page.waitForTimeout(settle)
}

/** Hold every `POST now` for `HOLD_MS` before it goes on:  the spinner must show while it waits. */
async function holdNow(page) {
  await page.route("**/api/review/now", async (route) => {
    await new Promise((done) => setTimeout(done, HOLD_MS))
    await route.continue()
  })
}

/**
 * Item `id`'s `action` button must be chosen, in that action's color, and no other button unless a note box is open
 * on the item;  the inbox must hold an `action` mark for it (and pass `check`).
 */
async function expectButton(page, id, action, check = () => true) {
  const chosen = await chosenOn(page, id)
  const color = (await buttonState(page, id, action)).color
  const boxOpen = !!(await page.$(`#${id} > .plan-revisit`))
  if (!chosen.includes(action) || (!boxOpen && chosen.length !== 1))
    problems.push(`${id}:  chosen ${JSON.stringify(chosen)}, not just ${action}`)
  if (color !== COLORS[action]) problems.push(`${id}:  ${action} is ${color}, not ${COLORS[action]}`)
  const mark = (await inbox()).marks[id]
  if (mark?.action !== action || !check(mark)) problems.push(`inbox:  ${id} is ${JSON.stringify(mark)}`)
}

/**
 * Item `id`'s immediate request was called off ("nevermind", `when` it was clicked):  nothing on `now`, no mark,
 * `canceled[id]` set;  its button idle (not spinning, waiting, or chosen).
 */
async function expectCalledOff(page, id, when) {
  const read = await inbox()
  const state = await buttonState(page, id, "details")
  const left = {
    now: read.now.some((entry) => entry.id === id),
    mark: read.marks[id],
    canceled: read.canceled?.[id],
    button: state
  }
  summary[`nevermind ${when}`] = left
  if (left.now || left.mark || !left.canceled || state.loading || state.waiting || state.chosen)
    problems.push(`nevermind (${when}):  ${id} left ${JSON.stringify(left)}`)
}

/** The actions of item `id`'s chosen buttons. */
async function chosenOn(page, id) {
  return page.evaluate(
    (item) =>
      Array.from(
        document.querySelectorAll(`#${item} .plan-act ui-button[data-chosen]`),
        (button) => button.dataset.action
      ),
    id
  )
}

/** Item `id`'s `action` button as shown:  `{ color, chosen, sent, loading, waiting }`. */
async function buttonState(page, id, action) {
  return page.evaluate(
    ([item, which]) => {
      const button = document.querySelector(`#${item} .plan-act ui-button[data-action="${which}"]`)
      return {
        color: button?.dataset.color,
        chosen: !!button?.hasAttribute("data-chosen"),
        sent: !!button?.hasAttribute("data-sent"),
        loading: !!button?.hasAttribute("loading"),
        waiting: !!button?.hasAttribute("data-waiting")
      }
    },
    [id, action]
  )
}

/**
 * The picked question `id`'s line and cards as shown:  `{ chosen, letter, picked }` (`chosen`:  its chosen button's
 * action;  `letter`:  the line's pick letter;  `picked`:  the framed card's letter).
 */
async function pickShown(page, id) {
  return page.evaluate((item) => {
    const letter = document.querySelector(`#${item} .plan-act-pick:not([hidden])`)
    return {
      chosen: document.querySelector(`#${item} .plan-act ui-button[data-chosen]`)?.dataset.action,
      letter: letter?.textContent || undefined,
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
 * In the page:  each marked item's line (`chosen`:  its chosen button's action, `color`, `sent`, `letter`:  the
 * pick's), and whether question `pick`'s card B is picked (its details must be open:  a split doc loads them only
 * then).
 */
function marksShown(pick) {
  const shown = {}
  for (const act of document.querySelectorAll(".plan-items > [data-status][id] .plan-act")) {
    const button = act.querySelector("ui-button[data-chosen]")
    const letter = act.querySelector(".plan-act-pick:not([hidden])")?.textContent || undefined
    if (!button && !letter) continue
    shown[act.closest("[data-status][id]").id] = {
      chosen: button?.dataset.action,
      color: button?.dataset.color,
      sent: !!button?.hasAttribute("data-sent"),
      letter
    }
  }
  if (pick) shown.picked = !!document.querySelector(`#${pick} ui-column[data-picked] .plan-choose[data-letter="B"]`)
  return shown
}

/** In the page:  items whose title runs under their buttons, and a page wider than the window. */
function overlaps() {
  const found = []
  for (const item of document.querySelectorAll(".plan-items > [data-status][id]")) {
    const title = item.querySelector(".plan-title")
    const act = item.querySelector(".plan-act")
    if (!title || !act || !title.getClientRects().length) continue
    const box = act.getBoundingClientRect()
    for (const line of title.getClientRects())
      if (line.right > box.left + 1 && line.bottom > box.top && line.top < box.bottom) {
        found.push(`${item.id}'s title runs under its buttons`)
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
