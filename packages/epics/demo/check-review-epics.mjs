/**
 * Check the `<epic-*>` review controls in a real browser, as Owen uses them (epic `epic-components` P9, the colour
 * scheme and fill rule of P14, decision Q20):  clicks through every flow, has the plan-doc tool do Claude's side on
 * the same copy, and reads the inbox back.
 * Usage (from the repo root):
 *   node packages/epics/demo/check-review-epics.mjs [--doc <name> [--from <folder>]] [outDir]
 * - the doc:  a SCRATCH COPY, never a real one:  `review-sample.html` (default), or `--doc <name>`, a copy of
 *   `epics/<name>/` (its skeleton and parts:  a doc in `<epic-page>` markup;  never its inbox or details), or of
 *   `--from <folder>` (a converted copy:  `spell dev plan-doc convert <name> --out <folder>`).  Copied to
 *   `demo/shots/epics/<name>/<name>.plan.html` (git-ignored):  the review routes take plan docs only
 *   (`epics/<name>/<name>.plan.html`), its inbox file lands beside it, and the tool finds it there
 *   (`PlanDocFiles({ root: demo/shots })`)
 * - the server:  a page server of its OWN on this checkout (`PageServer`, no pid file, a free port), so the routes are
 *   this branch's code as it is now;  stopped at the end
 * - Owen's side, clicked:
 *   - every item's buttons:  ONE group, Approve, Revisit, Make Todo, then Do Now apart (the wand);  an
 *     Overview sub-section's without Approve;  the note box's:  Later, the x (skip this:  Owen, 2026-10-09;  no
 *     "now":  Do Now is the line's)
 *   - the fill:  Approve pressed dashed green, again none;  Make Todo the same
 *   - Revisit on an item with details:  it opens, its box focused;  ten lines grow it;  the box's x saves a skip
 *     WITH its note, the id chip dashed grey
 *   - Revisit on an item without details:  a box under its line;  a draft saved on Tab, back after a reload;  Later:
 *     a revisit soon, shown under the line, and Edit puts it back in the box
 *   - Do Now WITH a note (an Overview sub-section):  a revisit now, dashed while nobody listens, the tooltip saying
 *     so;  clicked again:  called off, the note back in its box
 *   - a pick on a judgement call's REPLY cards (I8:  picks work anywhere;  the call added to the copy, its text and
 *     a reply each holding cards):  the mark names that set (`choices: 1`), its pill dashed, the text's untouched
 *   - Send:  the header's button unsent -> sent;  the marks outlined
 * - Claude's side, by the plan-doc tool on the copy (`PlanDocCommands`), the page reloaded after each:
 *   - Do Now without a note on an item:  `inbox listen`, `inbox wait` takes it:  its button outlined, its icon
 *     turning (`data-busy`);  `status underway`:  a blue Underway card, the item `progress`;  `status done`:  the
 *     card green;  `inbox done`:  Do Now CLEARED (`review-as="now"`:  the buttons are Owen's input, the chip carries
 *     the result)
 *   - `inbox apply`:  the sent Approve CLEARED (`review-as="approve"`), the chip solid green;  the skip:  reviewed,
 *     still open, its note kept as Owen's reply;  the pick approves its call (closed, the reply's set `chosen`, a
 *     Done card `Chose C · ...`), its pill SOLID
 *   - Review Now:  the revisit waiting asked now
 * - fails (exit 1) unless each shows on the page AND lands in the inbox (read back through `GET /api/review/inbox`);
 *   at 280px and 900px, light and dark, no review control runs past the window, none sits over its line's title, and
 *   every button's glyph is centred in it (within 1px);  the header's round buttons too
 * - screenshots (outDir, default `demo/shots/`):  `review-<width>-<scheme>.png`, `review-marked.png`,
 *   `review-done.png`, `review-picked.png` / `review-picked-dark.png` (the pick applied)
 * - REFUSES to run while the copy's inbox file exists (a run killed half way:  delete it);  deletes it afterwards
 * - re-runs itself under `tsx` (the page server, `ReviewInbox` and the tool are TypeScript)
 */
import { spawnSync } from "node:child_process"
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, "../../..")
const SHOTS = join(HERE, "shots")
const SERVER_TSCONFIG = join(ROOT, "packages/server/tsconfig.json")

if (!process.env.CHECK_REVIEW_UNDER_TSX) {
  const run = spawnSync(
    process.execPath,
    ["--import", "tsx", fileURLToPath(import.meta.url), ...process.argv.slice(2)],
    {
      stdio: "inherit",
      cwd: ROOT,
      env: { ...process.env, CHECK_REVIEW_UNDER_TSX: "1", TSX_TSCONFIG_PATH: SERVER_TSCONFIG }
    }
  )
  process.exit(run.status ?? 1)
}

const { chromium } = await import("playwright")
const { PageServer } = await import("../../server/src/page/PageServer.ts")
const { PlanDocCommands } = await import("../src/tool/PlanDocCommands.ts")
const { PlanDocFiles } = await import("../src/tool/PlanDocFiles.ts")

////////////////
// ## Settings
////////////////

const args = process.argv.slice(2)
const flagValue = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined)
const docName = flagValue("--doc") ?? "review-sample"
const fromFolder = flagValue("--from")
const flagged = new Set(["--doc", "--from"].flatMap((name) => (args.includes(name) ? [args.indexOf(name) + 1] : [])))
const out = args.find((arg, index) => !arg.startsWith("--") && !flagged.has(index)) ?? SHOTS
const NOBODY = /No Claude session/
const NOTE = "check-review-epics:  why not reuse the details route?"
const SKIP_NOTE = "check-review-epics:  nothing to do, the routes settle it"
const SECTION_NOTE = "check-review-epics:  is the Overview part clear?"
const SESSION = "check-review-epics"
const HOLD_MS = 900
const problems = []
const summary = { doc: docName }

////////////////
// ## The copy
////////////////

const folder = join(SHOTS, "epics", docName)
const file = join(folder, `${docName}.plan.html`)
const inboxFile = join(folder, `${docName}.inbox.json`)
if (existsSync(inboxFile)) {
  console.error(`check-review-epics:  ${inboxFile} exists (an earlier run's?):  delete it first`)
  process.exit(2)
}
copyDoc()

// the tool links a doc's bare file names (`AS.Linker`) through its checkout's `packages/`:  shots/ has none
mkdirSync(join(SHOTS, "packages"), { recursive: true })

/** The plan-doc tool, on the copy:  what Claude runs, its output kept for the summary. */
const tool = new PlanDocCommands({ files: new PlanDocFiles({ root: SHOTS }) })
const said = []
tool.print = (text) => void said.push(text)
tool.warn = (text) => void said.push(`! ${text}`)

/** A judgement call to pick on (I8):  its text's cards, and a reply's;  the pick is the reply's `C`. */
const pickCall = await addPickCall()

const server = await new PageServer({ root: ROOT }).start({
  port: 47_600 + Math.floor(Math.random() * 300),
  pidFile: false
})
const base = `http://127.0.0.1:${server.info.port}`
const pagePath = `/${file.slice(ROOT.length + 1)}`
const url = `${base}${pagePath}`
summary.url = url

const browser = await chromium.launch()
try {
  await run()
} catch (error) {
  problems.push(`threw:  ${error.stack ?? error}`)
} finally {
  await browser.close()
  await server.stop()
  rmSync(inboxFile, { force: true })
}
summary.tool = said
console.log(JSON.stringify(summary, null, 2))
if (problems.length) {
  console.error(problems.map((problem) => `- ${problem}`).join("\n"))
  process.exit(1)
}

////////////////
// ## Flows
////////////////

async function run() {
  const context = await browser.newContext({ viewport: { width: 900, height: 1000 }, deviceScaleFactor: 2 })
  // on every load, a live reload's too:  `rootOf(id)` queries element `id`'s shadow root, then those of the
  // `<epic-review>`s / `<epic-new-item>`s drawn in it (its review controls, P10)
  await context.addInitScript(() => {
    window.rootOf = (id) => {
      const root = document.getElementById(id).shadowRoot
      const roots = () => [
        root,
        ...Array.from(root.querySelectorAll("epic-review, epic-new-item"), (inner) => inner.shadowRoot).filter(Boolean)
      ]
      return {
        querySelector: (selector) =>
          roots()
            .map((it) => it.querySelector(selector))
            .find(Boolean) ?? null,
        querySelectorAll: (selector) => roots().flatMap((it) => Array.from(it.querySelectorAll(selector))),
        // the focused element, inside the review control that holds the focus
        get activeElement() {
          const active = root.activeElement
          return active?.shadowRoot?.activeElement ?? active
        }
      }
    }
  })
  const page = await context.newPage()
  const logs = []
  page.on("pageerror", (error) => logs.push(`pageerror:  ${error.message}`))
  page.on("console", (message) => message.type() === "error" && logs.push(`console:  ${message.text()}`))
  await open(page)

  // every item and Overview part:  the group (Approve, Revisit, Make Todo), then Do Now apart
  const ids = await page.evaluate(() =>
    Array.from(document.querySelectorAll("epic-item, epic-section[kind='overview-part']"), (element) => element.id)
  )
  const sections = ids.filter((id) => /^o\d+$/.test(id))
  const items = ids.filter((id) => !/^o\d+$/.test(id))
  summary.items = items.length
  summary.sections = sections.length
  for (const id of ids) {
    const layout = await page.evaluate(
      (id) => ({
        group: Array.from(
          rootOf(id).querySelectorAll(".review-group ui-button[data-action]"),
          (button) => button.dataset.action
        ),
        apart: Array.from(
          rootOf(id).querySelectorAll(".review-controls > ui-button.review-do-now"),
          (button) => button.dataset.action
        )
      }),
      id
    )
    // a todo's:  the plane (next phase), Revisit, the x (drop), no Do Now (Owen, 2026-10-09)
    const todo = /^t\d+$/.test(id)
    const group = todo
      ? ["next", "revisit", "drop"]
      : /^o\d+$/.test(id)
        ? ["revisit", "todo"]
        : ["approve", "revisit", "todo"]
    expect(`${id}'s buttons`, layout, { group, apart: todo ? [] : ["details"] })
  }
  expect(
    "<epic-page reviewing>",
    await page.evaluate(() => document.querySelector("epic-page").hasAttribute("reviewing")),
    true
  )

  const { question, approved, withDetails, bare } = pickItems(
    (
      await page.evaluate(() =>
        Array.from(document.querySelectorAll("epic-item"), (item) => ({
          id: item.id,
          open: item.getAttribute("status") === "open",
          details: item.hasAttribute("source") || Array.from(item.children).some((child) => !child.hasAttribute("slot"))
        }))
      )
    ).filter((item) => item.id !== pickCall)
  )
  const section = sections[0]
  summary.picked = { question, approved, withDetails, bare, section }

  // the fill:  pressed dashed in its colour;  pressed again, none
  await press(page, question, "approve")
  await expectMark(page, question, { action: "approve" }, "Approve")
  expect("Approve pressed:  dashed green", await buttonState(page, question, "approve"), {
    fill: "dashed",
    color: "green"
  })
  await press(page, question, "approve")
  await expectMark(page, question, undefined, "Approve again (cleared)")
  expect("Approve again:  none", (await buttonState(page, question, "approve")).fill, "none")
  await press(page, question, "todo")
  await expectMark(page, question, { action: "todo" }, "the line's Make Todo")
  expect("Make Todo pressed:  dashed green", await buttonState(page, question, "todo"), {
    fill: "dashed",
    color: "green"
  })
  await press(page, question, "todo")
  await expectMark(page, question, undefined, "Make Todo again (cleared)")

  // an Approve to see through:  sent, then applied (cleared, the chip green)
  await press(page, approved, "approve")
  await expectMark(page, approved, { action: "approve" }, `Approve on ${approved}`)

  // a todo's plane and x (Owen, 2026-10-09):  marked dashed, green and grey;  applied below
  const todos = items.filter((id) => /^t\d+$/.test(id))
  if (todos.length >= 2) {
    await press(page, todos[0], "next")
    await expectMark(page, todos[0], { action: "next" }, `the plane on ${todos[0]}`)
    expect(`${todos[0]}'s plane:  dashed green`, await buttonState(page, todos[0], "next"), {
      fill: "dashed",
      color: "green"
    })
    await press(page, todos[1], "drop")
    await expectMark(page, todos[1], { action: "drop" }, `the x on ${todos[1]}`)
    expect(`${todos[1]}'s x:  dashed grey`, await buttonState(page, todos[1], "drop"), {
      fill: "dashed",
      color: "grey"
    })
  }

  // Revisit on an item with details:  opens, docked box focused, grows, the box's x (skip this) with the note
  await press(page, withDetails, "revisit")
  await page
    .waitForFunction(
      (id) => document.getElementById(id).open && rootOf(id).activeElement?.matches("textarea"),
      withDetails,
      { timeout: 4000 }
    )
    .catch(() => problems.push(`${withDetails}:  Revisit didn't open it with its note box focused`))
  expect(
    `${withDetails}'s note box buttons (Do Now is the line's)`,
    await page.evaluate(
      (id) => Array.from(rootOf(id).querySelectorAll(".note-actions button"), (button) => button.dataset.how),
      withDetails
    ),
    ["soon", "skip"]
  )
  const before = await boxHeight(page, withDetails)
  await page.keyboard.type(Array.from({ length: 10 }, (_, line) => `line ${line + 1}`).join("\n"))
  const after = await boxHeight(page, withDetails)
  if (!(after > before + 60)) problems.push(`${withDetails}:  the note box didn't grow (${before} -> ${after})`)
  await page.keyboard.press("ControlOrMeta+a")
  await page.keyboard.type(SKIP_NOTE)
  await noteButton(page, withDetails, "skip")
  await expectMark(page, withDetails, { action: "skip", note: SKIP_NOTE }, "the box's x (skip this)")
  expect(`${withDetails}'s box emptied`, await noteValue(page, withDetails), "")
  // no line button wears a skip:  the id chip alone shows it, dashed grey
  expect(
    `${withDetails}'s chip, skipped, unsent:  dashed grey`,
    await page.evaluate((id) => {
      const chip = rootOf(id).querySelector("[part~='id']")
      return { fill: chip.dataset.fill, color: chip.dataset.color }
    }, withDetails),
    { fill: "dashed", color: "grey" }
  )

  // an item without details:  a box under its line, a draft saved on Tab, back after a reload, Later, Edit
  await press(page, bare, "revisit")
  await page.waitForTimeout(300)
  await page.keyboard.type(NOTE)
  await page.keyboard.press("Tab")
  await waitInbox(page, (inbox) => inbox.drafts[bare]?.note === NOTE, `${bare}:  the draft saved on Tab`)
  const floppy = await page.evaluate((id) => rootOf(id).querySelector(".note-saved")?.getAttribute("title") ?? "", bare)
  if (!/^Saved/.test(floppy)) problems.push(`${bare}:  the floppy says "${floppy}", not Saved`)
  await open(page)
  const bubble = await page.evaluate((id) => !!rootOf(id).querySelector(".review-noted"), bare)
  if (!bubble) problems.push(`${bare}:  no note bubble for its draft after a reload`)
  await page.evaluate((id) => (document.getElementById(id).open = true), bare)
  await page.waitForTimeout(600)
  expect(`${bare}'s box after a reload`, await noteValue(page, bare), NOTE)
  await page.evaluate((id) => rootOf(id).querySelector("textarea").focus(), bare)
  await noteButton(page, bare, "soon")
  await expectMark(page, bare, { action: "revisit", when: "soon", note: NOTE }, "Later")
  const saidNote = await page.evaluate((id) => rootOf(id).querySelector(".said")?.textContent ?? "", bare)
  if (!saidNote.includes("revisit soon") || !saidNote.includes(NOTE))
    problems.push(`${bare}:  the said note reads "${saidNote}"`)
  expect(`${bare}'s Revisit, unsent:  dashed blue`, await buttonState(page, bare, "revisit"), {
    fill: "dashed",
    color: "blue"
  })
  await page.locator(`#${bare} .said-edit`).click()
  await page.waitForTimeout(300)
  expect(`${bare}:  Edit puts the note back`, await noteValue(page, bare), NOTE)
  // left in the box, not changed:  the mark stays as it was
  await page.keyboard.press("Escape")

  // Do Now WITH a note (an Overview part):  a revisit now;  queued with nobody listening:  dashed;  again:  called off
  if (section) {
    await press(page, section, "revisit")
    await page
      .waitForFunction((id) => rootOf(id).activeElement?.matches("textarea"), section, { timeout: 4000 })
      .catch(() => problems.push(`${section}:  Revisit didn't focus its note box`))
    await page.keyboard.type(SECTION_NOTE)
    await press(page, section, "details")
    await waitInbox(
      page,
      (inbox) =>
        inbox.now.some((each) => each.id === section && each.action === "revisit" && each.note === SECTION_NOTE),
      `${section}:  Do Now with its note, a revisit now`
    )
    await page.waitForTimeout(200)
    expect(`${section}'s Do Now, queued:  dashed blue`, await buttonState(page, section, "details"), {
      fill: "dashed",
      color: "blue",
      busy: false
    })
    const tip = await page.evaluate(
      (id) => rootOf(id).querySelector('ui-button[data-action="details"]').getAttribute("aria-label"),
      section
    )
    if (!NOBODY.test(tip)) problems.push(`${section}:  a queued request doesn't say nobody is listening:  "${tip}"`)
    await page.screenshot({ path: join(out, "review-marked.png") })
    await press(page, section, "details")
    await waitInbox(
      page,
      (inbox) => !inbox.now.length && inbox.drafts[section]?.note === SECTION_NOTE,
      `${section}:  called off, note kept`
    )
    await page.waitForTimeout(300)
    expect(`${section}'s box after calling off`, await noteValue(page, section), SECTION_NOTE)
  }

  // a pick on the judgement call's REPLY cards (I8):  its set named by position, the pill dashed;  the text's untouched
  await page.evaluate((id) => (document.getElementById(id).open = true), pickCall)
  await page.waitForTimeout(400)
  expect(`${pickCall}'s pills, text then reply`, await pickPills(page, pickCall), [
    ["choose", "choose"],
    ["choose", "choose", "choose"]
  ])
  await page.locator(`#${pickCall} epic-reply epic-option[letter="C"] button[part~="choose"]`).click()
  await expectMark(page, pickCall, { action: "pick", pick: "C", choices: 1 }, "a pick on a reply's cards")
  expect(`${pickCall}'s pills, C picked`, await pickPills(page, pickCall), [
    ["choose", "choose"],
    ["choose", "choose", "dashed"]
  ])

  // the header:  Send with unsent marks, its tooltip saying nobody listens;  a click sends;  the marks outlined
  expect("the header's buttons, marks unsent", await headerState(page), { send: "unsent", now: "ready", nobody: true })
  await page.locator("epic-page button.send").click()
  await waitInbox(page, (inbox) => !!inbox.sent, "Send:  the marks sent")
  await page.waitForTimeout(200)
  expect("the header's buttons, marks sent", await headerState(page), { send: "sent", now: "ready", nobody: true })
  expect(`${approved}'s Approve, sent:  outlined`, (await buttonState(page, approved, "approve")).fill, "outline")
  expect(`${bare}'s Revisit, sent:  outlined`, (await buttonState(page, bare, "revisit")).fill, "outline")
  expect(`${pickCall}'s pick, sent:  outlined`, (await pickPills(page, pickCall))[1][2], "outline")

  // Do Now without a note, held on its way:  asked;  queued, nobody listening:  dashed
  await holdNext(page, "now")
  await press(page, question, "details")
  await waitInbox(page, (inbox) => inbox.now.some((each) => each.id === question), "Do Now queued")
  await page.waitForTimeout(200)
  expect("Do Now, queued:  dashed, not turning", await buttonState(page, question, "details"), {
    fill: "dashed",
    color: "blue",
    busy: false
  })

  // Claude listens and takes it:  outlined, its icon turning
  await tool.run(["inbox", docName, "listen", "--session", SESSION])
  await tool.run(["inbox", docName, "wait", "--timeout", "5", "--json"])
  await open(page)
  expect("listening:  the header's tooltips", (await headerState(page)).nobody, false)
  expect("Do Now, taken:  outlined and turning", await buttonState(page, question, "details"), {
    fill: "outline",
    color: "blue",
    busy: true
  })

  // its status card:  Underway (blue, the item `progress`), then Done (green);  `inbox done`:  Do Now solid
  await tool.run(["status", docName, question, "underway", "<p>Write what the question's text leaves out.</p>"])
  await open(page)
  expect(`${question}:  an Underway card, the item in progress`, await statusOf(page, question), {
    cards: ["underway"],
    state: "progress"
  })
  await tool.run(["status", docName, question, "done", "<p>Added the cost of each option.</p>"])
  await tool.run(["inbox", docName, "done", question])
  await open(page)
  const done = await statusOf(page, question)
  expect(`${question}:  the card Done`, done.cards, ["done"])
  // handled:  the buttons CLEAR (Owen's input, taken), the chip carries the result (Owen, 2026-10-08)
  expect("Do Now, done:  cleared, not turning", await buttonState(page, question, "details"), {
    fill: "none",
    color: "blue",
    busy: false
  })
  expect(`${question}'s review-as`, await attribute(page, question, "review-as"), "now")

  // `inbox apply`:  the sent Approve applied, its button cleared, the chip green;  the skip reviewed, its note kept
  await tool.run(["inbox", docName, "apply"])
  await open(page)
  expect(`${approved}'s review-as`, await attribute(page, approved, "review-as"), "approve")
  expect(`${approved}'s Approve, applied:  cleared`, (await buttonState(page, approved, "approve")).fill, "none")
  expect(`${approved}'s chip, applied:  its state's, solid`, await chipState(page, approved), {
    fill: null,
    state: "recent"
  })
  expect(
    `${withDetails}:  skipped`,
    await page.evaluate((id) => {
      const item = document.getElementById(id)
      return {
        reviewAs: item.getAttribute("review-as"),
        status: item.getAttribute("status"),
        // the doc squeezes runs of spaces
        note: item.querySelector('epic-reply[from="Owen"][re="skip"]')?.textContent.replace(/\s+/g, " ") ?? null,
        chip: rootOf(id).querySelector("[part~='id']").dataset.fill ?? null
      }
    }, withDetails),
    { reviewAs: "skip", status: "open", note: SKIP_NOTE.replace(/\s+/g, " "), chip: null }
  )
  // a todo's plane:  queued for the next phase, a Done card, the buttons cleared;  its x:  canceled, grey
  if (todos.length >= 2) {
    expect(`${todos[0]}'s review-as`, await attribute(page, todos[0], "review-as"), "next")
    expect(`${todos[0]}:  queued, a Done card`, (await statusOf(page, todos[0])).cards.at(-1), "done")
    expect(`${todos[0]}'s plane, applied:  cleared`, (await buttonState(page, todos[0], "next")).fill, "none")
    expect(`${todos[1]}:  canceled`, await attribute(page, todos[1], "status"), "canceled")
    expect(`${todos[1]}'s chip:  grey`, await chipState(page, todos[1]), { fill: null, state: "old" })
  }
  // the pick:  the call approved with the reply's C (closed), that set chosen, a Done card, the pill solid
  expect(
    `${pickCall}, picked C from its reply`,
    await page.evaluate((id) => {
      const item = document.getElementById(id)
      return {
        status: item.getAttribute("status"),
        reviewAs: item.getAttribute("review-as"),
        chosen: Array.from(item.querySelectorAll("epic-choices"), (set) => set.getAttribute("chosen")),
        card: item.querySelector(':scope > epic-status[slot="status"]')?.textContent.trim()
      }
    }, pickCall),
    { status: "done", reviewAs: "approve", chosen: [null, "C"], card: "Chose C · Option C" }
  )
  await page.evaluate((id) => {
    const item = document.getElementById(id)
    item.open = true
    // the reply's Choices aside, unfolded:  its panels drawn
    item.querySelector("epic-reply epic-choices").shadowRoot.querySelector("[part~='toggle']").click()
  }, pickCall)
  await page.waitForTimeout(400)
  expect(`${pickCall}'s pills, applied`, await pickPills(page, pickCall), [
    [null, null],
    [null, null, "solid"]
  ])
  await page.locator(`#${pickCall} epic-reply`).scrollIntoViewIfNeeded()
  await page.screenshot({ path: join(out, "review-picked.png") })
  await page.emulateMedia({ colorScheme: "dark" })
  await page.screenshot({ path: join(out, "review-picked-dark.png") })
  await page.emulateMedia({ colorScheme: "light" })
  await page.locator(`#${question}`).scrollIntoViewIfNeeded()
  await page.screenshot({ path: join(out, "review-done.png") })

  // Review Now:  the revisit waiting (sent, to talk over) asked now
  await page.locator("epic-page button.review-now").click()
  await waitInbox(
    page,
    (inbox) => inbox.now.some((each) => each.id === bare),
    `Review Now:  ${bare}'s revisit asked now`
  )
  await tool.run(["inbox", docName, "unlisten"])

  await layouts(context)
  summary.inbox = await readInbox(page)
  if (logs.length) problems.push(...logs)
}

////////////////
// ## Layout
////////////////

/** At 280px and 900px, light and dark:  nothing past the window, nothing over a title, every glyph centred. */
async function layouts(context) {
  for (const scheme of ["light", "dark"]) {
    for (const width of [280, 900]) {
      const page = await context.newPage()
      await page.emulateMedia({ colorScheme: scheme })
      await page.setViewportSize({ width, height: 1100 })
      await open(page)
      const opened = await page.evaluate(() => {
        const item = document.querySelector("epic-item")
        item.open = true
        item.setAttribute("open", "")
        return item.id
      })
      await page.waitForTimeout(500)
      const { found, measured } = await page.evaluate(measure, width)
      for (const problem of found) problems.push(`${width}px ${scheme}:  ${problem}`)
      if (!measured) problems.push(`${width}px ${scheme}:  no review controls in view to measure`)
      await page.locator(`#${opened}`).scrollIntoViewIfNeeded()
      await page.screenshot({ path: join(out, `review-${width}-${scheme}.png`) })
      await page.close()
    }
  }
}

/** In the page:  what's wrong with the controls' layout at `width`. */
function measure(width) {
  const found = []
  let measured = 0
  for (const host of document.querySelectorAll("epic-item, epic-section[kind='overview-part']")) {
    const root = rootOf(host.id)
    const controls = root.querySelector(".review-controls")
    if (!controls) continue
    const box = controls.getBoundingClientRect()
    // folded away:  nothing to measure
    if (!box.width) continue
    measured++
    if (box.right > width + 0.5 || box.left < -0.5) found.push(`${host.id}'s controls run past the window`)
    const title = root.querySelector(".title, .header")
    if (title) {
      const range = document.createRange()
      range.selectNodeContents(title)
      for (const rect of range.getClientRects()) {
        const overlaps =
          rect.right > box.left + 1 &&
          rect.left < box.right - 1 &&
          rect.bottom > box.top + 1 &&
          rect.top < box.bottom - 1
        if (overlaps && rect.width > 1) found.push(`${host.id}'s title runs under its controls`)
      }
    }
    for (const button of controls.querySelectorAll("ui-button")) {
      // a turning icon is mid-turn:  its box isn't centred while it turns
      if (button.hasAttribute("data-busy")) continue
      const inner = button.shadowRoot?.querySelector("button")
      const glyph = button.shadowRoot?.querySelector("svg, ui-icon")
      if (!inner || !glyph) continue
      const outer = inner.getBoundingClientRect()
      const icon = (glyph.shadowRoot?.querySelector("svg") ?? glyph).getBoundingClientRect()
      const dx = Math.abs(outer.left + outer.width / 2 - (icon.left + icon.width / 2))
      const dy = Math.abs(outer.top + outer.height / 2 - (icon.top + icon.height / 2))
      if (dx > 1 || dy > 1)
        found.push(`${host.id}'s ${button.dataset.action} glyph off centre by ${dx.toFixed(1)}, ${dy.toFixed(1)}`)
    }
  }
  // the page header's round buttons:  in the window, each glyph centred
  const head = document.querySelector("epic-page")?.shadowRoot
  for (const button of head?.querySelectorAll("button.send, button.review-now, button.git") ?? []) {
    const outer = button.getBoundingClientRect()
    const icon = button.querySelector("svg")?.getBoundingClientRect()
    if (outer.right > width + 0.5) found.push(`the header's ${button.className} runs past the window`)
    if (!icon) continue
    const dx = Math.abs(outer.left + outer.width / 2 - (icon.left + icon.width / 2))
    const dy = Math.abs(outer.top + outer.height / 2 - (icon.top + icon.height / 2))
    if (dx > 1 || dy > 1)
      found.push(`the header's ${button.className} glyph off centre by ${dx.toFixed(1)}, ${dy.toFixed(1)}`)
  }
  return { found: [...new Set(found)], measured }
}

////////////////
// ## Helpers
////////////////

/**
 * Copy the doc (and its parts) to `folder`, its relative links moved deeper:  the sample sits in `demo/` (two
 * folders under the package), a real doc in `epics/<name>/`;  the copy six folders under the root.
 */
function copyDoc() {
  rmSync(folder, { recursive: true, force: true })
  mkdirSync(folder, { recursive: true })
  if (docName === "review-sample" && !fromFolder) {
    const html = readFileSync(join(HERE, "review-sample.html"), "utf8")
      .replaceAll('"../../', '"../../../../../')
      .replaceAll('"../pack/', '"../../../../pack/')
    writeFileSync(file, html)
    return
  }
  const from = resolve(fromFolder ?? join(ROOT, "epics", docName))
  const skeleton = join(from, `${docName}.plan.html`)
  if (!existsSync(skeleton)) {
    console.error(`check-review-epics:  no ${skeleton}`)
    process.exit(2)
  }
  // two folders under the root -> six;  a part one deeper
  writeFileSync(file, readFileSync(skeleton, "utf8").replaceAll('"../../', '"../../../../../../'))
  const parts = join(from, "parts")
  if (!existsSync(parts)) return
  mkdirSync(join(folder, "parts"))
  for (const name of readdirSync(parts)) {
    const text = readFileSync(join(parts, name), "utf8").replaceAll('"../../../', '"../../../../../../../')
    writeFileSync(join(folder, "parts", name), text)
  }
  // never the real doc's inbox, agents or details:  the copy starts clean
}

/** Load the page, wait for the controls. */
async function open(page) {
  await page.goto(url)
  await page
    .waitForFunction(() => document.querySelector("epic-page")?.hasAttribute("reviewing"), null, { timeout: 15_000 })
    .catch(() => problems.push("the page never said it's being reviewed (<epic-page reviewing>)"))
  // every section unfolded, as a reader looking at its items has them
  await page.evaluate(() => {
    for (const fold of document.querySelectorAll("epic-overview, epic-section")) fold.setAttribute("open", "")
  })
  await page.waitForTimeout(600)
}

/**
 * The items to click, four different ones (`items`:  `{ id, open, details }` each, in page order):  a question (Do
 * Now's lifecycle on it);  an open item with details;  an open one without;  an open item Approve closes or reviews,
 * not a question (approving one needs a recommended option).
 */
function pickItems(items) {
  const taken = new Set()
  const take = (...tests) => {
    for (const test of tests) {
      const found = items.find((item) => !taken.has(item.id) && test(item))
      if (found) return taken.add(found.id) && found.id
    }
    throw new Error(`check-review-epics:  the doc hasn't the items the check needs (${JSON.stringify(items)})`)
  }
  const question = take(
    (item) => item.open && item.id.startsWith("q"),
    (item) => item.open
  )
  const bare = take(
    (item) => item.open && !item.details,
    () => true
  )
  const withDetails = take(
    (item) => item.open && item.details && item.id.startsWith("j"),
    (item) => item.details
  )
  // not a todo:  a todo has no Approve (Owen, 2026-10-09)
  const approved = take(
    (item) => item.open && !item.id.startsWith("q") && !item.id.startsWith("t"),
    (item) => item.open && !item.id.startsWith("t")
  )
  return { question, approved, withDetails, bare }
}

/** Click `id`'s `action` button, with the mouse (Playwright's CSS reaches into open shadow roots). */
async function press(page, id, action) {
  await page.locator(`#${id} ui-button[data-action="${action}"]`).first().click()
  await page.waitForTimeout(150)
}

/** Click `id`'s note box button `how`, with the mouse. */
async function noteButton(page, id, how) {
  await page.locator(`#${id} .note-actions button[data-how="${how}"]`).first().click()
  await page.waitForTimeout(250)
}

/** `id`'s `action` button, as drawn:  its fill, its colour;  Do Now's turning icon too. */
function buttonState(page, id, action) {
  return page.evaluate(
    ({ id, action }) => {
      const button = rootOf(id).querySelector(`ui-button[data-action="${action}"]`)
      const state = { fill: button.dataset.fill, color: button.dataset.color }
      return action === "details" ? { ...state, busy: button.hasAttribute("data-busy") } : state
    },
    { id, action }
  )
}

/**
 * Item `id`'s id chip, as drawn:  its fill (`null`:  no live mark, so its state's colour, solid) and its state (the
 * item box's class word:  `recent`, `open` ...).
 */
function chipState(page, id) {
  return page.evaluate((id) => {
    const root = document.getElementById(id).shadowRoot
    const chip = root.querySelector("[part~='id']")
    const box = root.querySelector("[part~='base']")
    const state = ["attention", "progress", "open", "recent", "old"].find((name) => box.classList.contains(name))
    return { fill: chip.dataset.fill ?? null, state }
  }, id)
}

/**
 * Item `id`'s Choose pills, per card set (`<epic-choices>`, in page order), as the fill rule draws them:  `choose`
 * (a grey outline), `dashed` (picked, unsent), `outline` (sent), `solid` (applied);  `null` with no pill.
 */
function pickPills(page, id) {
  return page.evaluate(
    (id) =>
      Array.from(document.getElementById(id).querySelectorAll("epic-choices"), (set) =>
        Array.from(set.querySelectorAll(":scope > epic-option"), (option) => {
          const pill = option.shadowRoot.querySelector("[part~='choose']")
          if (!pill) return null
          if (pill.classList.contains("applied"))
            return getComputedStyle(pill).backgroundColor === getComputedStyle(pill).borderTopColor
              ? "solid"
              : "applied, not solid"
          if (pill.getAttribute("aria-pressed") !== "true") return "choose"
          return getComputedStyle(pill).borderTopStyle === "dashed" ? "dashed" : "outline"
        })
      ),
    id
  )
}

/**
 * Add to the copy, by the tool, a judgement call whose text holds option cards and whose reply holds three more
 * (`A`-`C`, `Option C` ...);  returns its id.
 */
async function addPickCall() {
  const cards = (letters) =>
    `<epic-choices>${letters.map((letter) => `<epic-option letter="${letter}" title="Option ${letter}"><p>why ${letter}</p></epic-option>`).join("")}</epic-choices>`
  const details =
    `<p>Two ways to store it.</p>${cards(["A", "B"])}` +
    `<epic-reply from="Claude" at="2026-10-08 10:00"><p>Or a third.</p>${cards(["A", "B", "C"])}</epic-reply>`
  await tool.run(["add", docName, "judgement", "check-review-epics:  which store?", "--details", details])
  return said.at(-1).toLowerCase()
}

/** `id`'s status cards (their `state`, in order) and its chip's state. */
function statusOf(page, id) {
  return page.evaluate((id) => {
    const item = document.getElementById(id)
    return {
      cards: Array.from(item.querySelectorAll(':scope > epic-status[slot="status"]'), (card) =>
        card.getAttribute("state")
      ),
      state: item.getAttribute("state")
    }
  }, id)
}

/** `id`'s attribute `name`, as the doc has it. */
function attribute(page, id, name) {
  return page.evaluate(({ id, name }) => document.getElementById(id).getAttribute(name), { id, name })
}

/** The page header's Send and Review Now, as drawn:  their states, and whether Send says nobody listens. */
function headerState(page) {
  return page.evaluate((nobody) => {
    const root = document.querySelector("epic-page").shadowRoot
    const send = root.querySelector("button.send")
    const now = root.querySelector("button.review-now")
    return {
      send: send?.dataset.state ?? null,
      now: now?.dataset.state ?? null,
      nobody: new RegExp(nobody).test(send?.title ?? "")
    }
  }, NOBODY.source)
}

/** `id`'s note box's text;  none drawn:  `null`. */
function noteValue(page, id) {
  return page.evaluate((id) => rootOf(id).querySelector("textarea")?.value ?? null, id)
}

/** `id`'s note box's height. */
function boxHeight(page, id) {
  return page.evaluate((id) => rootOf(id).querySelector("textarea")?.getBoundingClientRect().height ?? 0, id)
}

/** The inbox, as the page's routes answer it. */
function readInbox(page) {
  return page.evaluate(
    async (pagePath) => (await fetch(`/api/review/inbox?page=${encodeURIComponent(pagePath)}`)).json(),
    pagePath
  )
}

/** Wait (2s at most) for the inbox to pass `test`. */
async function waitInbox(page, test, what) {
  for (let tries = 0; tries < 20; tries++) {
    if (test(await readInbox(page))) return
    await page.waitForTimeout(100)
  }
  problems.push(`${what}:  not in the inbox`)
}

/** Wait for `id`'s mark to be `mark` (`undefined`:  none). */
async function expectMark(page, id, mark, what) {
  await waitInbox(
    page,
    (inbox) =>
      mark ? Object.entries(mark).every(([key, value]) => inbox.marks[id]?.[key] === value) : !inbox.marks[id],
    `${what} (${id})`
  )
}

/** Note a problem unless `actual` deep-equals `wanted`. */
function expect(what, actual, wanted) {
  if (JSON.stringify(actual) !== JSON.stringify(wanted))
    problems.push(`${what}:  ${JSON.stringify(actual)}, wanted ${JSON.stringify(wanted)}`)
}

/** Have the next POST to `route` wait `HOLD_MS`. */
async function holdNext(page, route) {
  let held = false
  await page.route(`**/api/review/${route}`, async (request) => {
    if (!held) {
      held = true
      await new Promise((resolve) => setTimeout(resolve, HOLD_MS))
    }
    await request.fallback()
  })
}
