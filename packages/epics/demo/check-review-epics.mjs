/**
 * Check the `<epic-*>` review controls (epic `epic-components` P9) in a real browser, as `packages/docs/tools/
 * check-review.js` checks the old runtime's:  clicks through every flow, then reads the inbox back.
 * Usage (from the repo root):
 *   node packages/epics/demo/check-review-epics.mjs [--stub] [--doc <name>] [outDir]
 * - the doc:  a COPY, never a shared doc:  `review-sample.html` (default), or `--doc <name>`, a preview copy from
 *   `preview-epics/<name>/` (with its parts).  Copied to `demo/shots/epics/<name>/<name>.plan.html` (git-ignored):
 *   the review routes take plan docs only (`epics/<name>/<name>.plan.html`), and its inbox file lands beside it
 * - the server:  a page server of its OWN on this checkout (`PageServer`, no pid file, a free port), so the routes are
 *   this branch's code as it is now;  stopped at the end
 * - `--stub`:  the review routes answered in the browser (Playwright `route()`) by a `ReviewInbox` in this process,
 *   as `reviewRoutes.ts` does but WITHOUT its item check:  for while `ReviewInbox.itemIds()` doesn't know
 *   `<epic-item>` / `<epic-section>` ids yet.  Without it, the real routes
 * - clicks through what Owen would:
 *   - every item and Overview sub-section has its controls;  Overview ones without Approve;  `<epic-page reviewing>`
 *   - Approve, again (cleared);  the line's Make Todo, again (cleared)
 *   - Revisit on an item with details:  it opens, its docked box focused;  ten lines typed grow the box;  the box's
 *     Make Todo saves the todo WITH its note, and empties the box
 *   - Revisit on an item without details:  a box under its line;  a note typed, then Tab:  saved as a draft at once
 *     (the floppy's tooltip);  after a reload the box is back with it;  Later:  a revisit soon, shown under the line
 *     ("You · revisit soon"), and Edit puts it back in the box
 *   - an Overview sub-section's Revisit and Do Now:  queued, nobody listening:  the dashed ring;  clicked again:
 *     called off, the note back in its box as a draft
 *   - Add Details Now, its request held:  the spinner (`loading`) while it's on its way
 *   - a session listening (the inbox file's `listening`, written through `ReviewInbox.update()`):  no dashed ring
 *   - the page header (P10):  Send blue with unsent marks (its tooltip:  nobody listening), a click sends them
 *     (`inbox.sent`), then outlined;  listening:  no "nobody" in its tooltip;  Review Now asks each revisit now
 * - fails (exit 1) unless each shows on the page AND lands in the inbox (read back through `GET /api/review/inbox`);
 *   at 280px and 900px, light and dark, no review control runs past the window, none sits over its line's title, and
 *   every button's glyph is centred in it (within 1px);  the header's round buttons too
 * - screenshots (outDir, default `demo/shots/`):  `review-<width>-<scheme>.png`, `review-marked.png`
 * - REFUSES to run while the copy's inbox file exists (a run killed half way:  delete it);  deletes it afterwards
 * - re-runs itself under `tsx` (the page server and `ReviewInbox` are TypeScript)
 */
import { spawnSync } from "node:child_process"
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, "../../..")
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
const { ReviewInbox } = await import("../src/tool/ReviewInbox.ts")

////////////////
// ## Settings
////////////////

const args = process.argv.slice(2)
const stub = args.includes("--stub")
const docAt = args.indexOf("--doc")
const docName = docAt >= 0 ? args[docAt + 1] : "review-sample"
const out = args.find((arg, index) => !arg.startsWith("--") && index !== docAt + 1) ?? join(HERE, "shots")
const NOBODY = /No Claude session/
const NOTE = "check-review-epics:  why not reuse the details route?"
const TODO_NOTE = "check-review-epics:  follow up once the routes settle"
const SECTION_NOTE = "check-review-epics:  is the Overview part clear?"
const HOLD_MS = 900
const problems = []
const summary = { doc: docName, stub }

////////////////
// ## The copy
////////////////

const folder = join(HERE, "shots/epics", docName)
const file = join(folder, `${docName}.plan.html`)
const inboxFile = join(folder, `${docName}.inbox.json`)
if (existsSync(inboxFile)) {
  console.error(`check-review-epics:  ${inboxFile} exists (an earlier run's?):  delete it first`)
  process.exit(2)
}
copyDoc()

const server = await new PageServer({ root: ROOT }).start({
  port: 47_600 + Math.floor(Math.random() * 300),
  pidFile: false
})
const base = `http://127.0.0.1:${server.info.port}`
const pagePath = `/${file.slice(ROOT.length + 1)}`
const url = `${base}${pagePath}`
summary.url = url
const memory = new ReviewInbox()

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
  // on every load, a live reload's too
  await context.addInitScript(() => (window.rootOf = (id) => document.getElementById(id).shadowRoot))
  const page = await context.newPage()
  const logs = []
  page.on("pageerror", (error) => logs.push(`pageerror:  ${error.message}`))
  page.on("console", (message) => message.type() === "error" && logs.push(`console:  ${message.text()}`))
  if (stub) await stubRoutes(context)
  await open(page)

  // every item and Overview part has its controls;  the Overview's without Approve
  const ids = await page.evaluate(() =>
    Array.from(document.querySelectorAll("epic-item, epic-section[kind='overview-part']"), (element) => element.id)
  )
  const sections = ids.filter((id) => /^o\d+$/.test(id))
  const items = ids.filter((id) => !/^o\d+$/.test(id))
  summary.items = items.length
  summary.sections = sections.length
  for (const id of ids) {
    const actions = await page.evaluate(
      (id) => Array.from(rootOf(id).querySelectorAll("ui-button[data-action]"), (button) => button.dataset.action),
      id
    )
    const want = /^o\d+$/.test(id) ? ["todo", "revisit", "details"] : ["approve", "todo", "revisit", "details"]
    expect(`${id}'s buttons`, actions, want)
  }
  expect(
    "<epic-page reviewing>",
    await page.evaluate(() => document.querySelector("epic-page").hasAttribute("reviewing")),
    true
  )

  const [question, withDetails, bare] = pickItems(items)
  const section = sections[0]

  // Approve, again (cleared);  Make Todo, again (cleared)
  await press(page, question, "approve")
  await expectMark(page, question, { action: "approve" }, "Approve")
  expect("Approve chosen, green", await buttonState(page, question, "approve"), { chosen: true, color: "green" })
  await press(page, question, "approve")
  await expectMark(page, question, undefined, "Approve again (cleared)")
  await press(page, question, "todo")
  await expectMark(page, question, { action: "todo" }, "the line's Make Todo")
  await press(page, question, "todo")
  await expectMark(page, question, undefined, "Make Todo again (cleared)")

  // Revisit on an item with details:  opens, docked box focused, grows, Make Todo with the note
  await press(page, withDetails, "revisit")
  await page
    .waitForFunction(
      (id) => document.getElementById(id).open && rootOf(id).activeElement?.matches("textarea"),
      withDetails,
      { timeout: 4000 }
    )
    .catch(() => problems.push(`${withDetails}:  Revisit didn't open it with its note box focused`))
  const before = await boxHeight(page, withDetails)
  await page.keyboard.type(Array.from({ length: 10 }, (_, line) => `line ${line + 1}`).join("\n"))
  const after = await boxHeight(page, withDetails)
  if (!(after > before + 60)) problems.push(`${withDetails}:  the note box didn't grow (${before} -> ${after})`)
  await page.keyboard.press("ControlOrMeta+a")
  await page.keyboard.type(TODO_NOTE)
  await noteButton(page, withDetails, "todo")
  await expectMark(page, withDetails, { action: "todo", note: TODO_NOTE }, "the box's Make Todo")
  expect(`${withDetails}'s box emptied`, await noteValue(page, withDetails), "")

  // an item without details:  a box under its line, a draft saved on Tab, back after a reload, Later, Edit
  await press(page, bare, "revisit")
  await page.waitForTimeout(300)
  await page.keyboard.type(NOTE)
  await page.keyboard.press("Tab")
  await waitInbox(page, (inbox) => inbox.drafts[bare]?.note === NOTE, `${bare}:  the draft saved on Tab`)
  const floppy = await page.evaluate((id) => rootOf(id).querySelector(".note-saved")?.getAttribute("title") ?? "", bare)
  if (!/^Saved/.test(floppy)) problems.push(`${bare}:  the floppy says "${floppy}", not Saved`)
  await open(page)
  // an item with details keeps its box docked in them, folded:  the line's bubble shows the draft;  opened, the box
  const bubble = await page.evaluate((id) => !!rootOf(id).querySelector(".review-noted"), bare)
  if (!bubble) problems.push(`${bare}:  no note bubble for its draft after a reload`)
  await page.evaluate((id) => (document.getElementById(id).open = true), bare)
  await page.waitForTimeout(600)
  expect(`${bare}'s box after a reload`, await noteValue(page, bare), NOTE)
  await page.evaluate((id) => rootOf(id).querySelector("textarea").focus(), bare)
  await noteButton(page, bare, "soon")
  await expectMark(page, bare, { action: "revisit", when: "soon", note: NOTE }, "Later")
  const said = await page.evaluate((id) => rootOf(id).querySelector(".said")?.textContent ?? "", bare)
  if (!said.includes("revisit soon") || !said.includes(NOTE)) problems.push(`${bare}:  the said note reads "${said}"`)
  await page.locator(`#${bare} .said-edit`).click()
  await page.waitForTimeout(300)
  expect(`${bare}:  Edit puts the note back`, await noteValue(page, bare), NOTE)

  // an Overview part:  Revisit, Do Now -> queued with nobody listening (dashed);  again -> called off, note kept
  if (section) {
    await press(page, section, "revisit")
    await page
      .waitForFunction((id) => rootOf(id).activeElement?.matches("textarea"), section, { timeout: 4000 })
      .catch(() => problems.push(`${section}:  Revisit didn't focus its note box`))
    await page.keyboard.type(SECTION_NOTE)
    await noteButton(page, section, "now")
    await waitInbox(page, (inbox) => inbox.now.some((each) => each.id === section), `${section}:  Do Now queued`)
    await page.waitForTimeout(200)
    expect(`${section}'s Revisit, queued`, await buttonState(page, section, "revisit"), {
      chosen: true,
      color: "orange",
      waiting: true
    })
    const tip = await page.evaluate(
      (id) => rootOf(id).querySelector('ui-button[data-action="revisit"]').getAttribute("aria-label"),
      section
    )
    if (!NOBODY.test(tip)) problems.push(`${section}:  a queued request doesn't say nobody is listening:  "${tip}"`)
    await page.screenshot({ path: join(out, "review-marked.png") })
    await press(page, section, "revisit")
    await waitInbox(
      page,
      (inbox) => !inbox.now.length && inbox.drafts[section]?.note === SECTION_NOTE,
      `${section}:  called off, note kept`
    )
    await page.waitForTimeout(300)
    expect(`${section}'s box after calling off`, await noteValue(page, section), SECTION_NOTE)
  }

  // the header (P10):  Send blue with unsent marks, its tooltip saying nobody listens;  a click sends, then outlined
  expect("the header's buttons, marks unsent", await headerState(page), { send: "unsent", now: "ready", nobody: true })
  await page.locator("epic-page button.send").click()
  await waitInbox(page, (inbox) => !!inbox.sent, "Send:  the marks sent")
  await page.waitForTimeout(200)
  expect("the header's buttons, marks sent", await headerState(page), { send: "sent", now: "ready", nobody: true })

  // Add Details Now, held on its way:  the spinner
  await holdNext(page, "now")
  await press(page, question, "details")
  await page.waitForTimeout(150)
  expect("Add Details Now spinning while asked", (await buttonState(page, question, "details")).loading, true)
  await waitInbox(page, (inbox) => inbox.now.some((each) => each.id === question), "Add Details Now queued")

  // a session listening:  no dashed ring
  await listen()
  await page.evaluate(() => window.dispatchEvent(new Event("visibilitychange")))
  await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")))
  await page.waitForTimeout(500)
  expect("listening:  no dashed ring", (await buttonState(page, question, "details")).waiting, false)
  expect("listening:  the header's tooltips", (await headerState(page)).nobody, false)

  // Review Now (P10):  every mark sent, each revisit waiting asked now
  await page.locator("epic-page button.review-now").click()
  await waitInbox(
    page,
    (inbox) => inbox.now.some((each) => each.id === bare),
    `Review Now:  ${bare}'s revisit asked now`
  )

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
    const root = host.shadowRoot
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
  // the page header's round buttons (P10):  in the window, each glyph centred
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

/** Copy the doc (and its parts) to `folder`, its relative links moved three folders deeper. */
function copyDoc() {
  rmSync(folder, { recursive: true, force: true })
  mkdirSync(folder, { recursive: true })
  if (docName === "review-sample") {
    const html = readFileSync(join(HERE, "review-sample.html"), "utf8")
      .replaceAll('"../../', '"../../../../../')
      .replaceAll('"../pack/', '"../../../../pack/')
    writeFileSync(file, html)
    return
  }
  const from = join(ROOT, "preview-epics", docName)
  cpSync(from, folder, { recursive: true })
  // a preview copy sits two folders under the root;  this one, six
  const html = readFileSync(join(from, `${docName}.plan.html`), "utf8").replaceAll('"../../', '"../../../../../../')
  writeFileSync(file, html)
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

/** The items to click:  a question, one with details, one without (else the last). */
function pickItems(items) {
  const question = items.find((id) => id.startsWith("q")) ?? items[0]
  return [question, items.find((id) => id.startsWith("j")) ?? items[1], items.find((id) => id === "j2") ?? items.at(-1)]
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

/** `id`'s `action` button, as drawn. */
function buttonState(page, id, action) {
  return page
    .evaluate(
      ({ id, action }) => {
        const button = rootOf(id).querySelector(`ui-button[data-action="${action}"]`)
        return {
          chosen: button.hasAttribute("data-chosen"),
          color: button.dataset.color,
          waiting: button.hasAttribute("data-waiting"),
          loading: button.hasAttribute("loading")
        }
      },
      { id, action }
    )
    .then((state) =>
      action === "details"
        ? state
        : { chosen: state.chosen, color: state.color, ...(state.waiting && { waiting: true }) }
    )
}

/** The page header's Send and Review Now (P10), as drawn:  their states, and whether Send says nobody listens. */
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

/** A Claude session listening on the inbox. */
async function listen() {
  if (stub) memory.setListening("check-review-epics")
  else await ReviewInbox.updateAsync(inboxFile, (inbox) => inbox.setListening("check-review-epics"))
}

/** `--stub`:  the review routes, answered here by `memory`, as `reviewRoutes.ts` would (no item check). */
async function stubRoutes(context) {
  await context.route("**/api/review/**", async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname.replace("/api/review/", "")
    if (path === "inbox") return route.fulfill({ json: memory.forPage() })
    const body = request.postDataJSON()
    try {
      if (path === "mark") memory.setMark(body.id, body.mark)
      if (path === "now") memory.requestNow(body.id, body.action, body.note ?? "")
      if (path === "cancel") memory.cancelNow(body.id)
      if (path === "draft") memory.setDraft(body.id, body.action, body.note ?? null)
      if (path === "send" && body.now === true) memory.reviewNow()
      else if (path === "send") memory.markSent()
    } catch (error) {
      return route.fulfill({ status: 400, json: { error: error.message } })
    }
    return route.fulfill({ json: memory.forPage() })
  })
}
