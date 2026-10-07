/**
 * Check that a live edit updates a plan doc in `<epic-*>` markup IN PLACE (P10 of epic `epic-components`), in a real
 * browser:  the `<epic-*>` elements are patched, never replaced, and the reader's state stays.
 * Usage:  node demo/check-live-epics.mjs [epic name] [--item <id>] [--bundle <spell-ui.js>]   (from `packages/epics`)
 * - works on a COPY of a preview doc (`preview-epics/<name>/`, the converter's, git-ignored):
 *   `preview-epics/check-live/epics/<name>/` (a plan doc's own path:  the page asks the review routes only there),
 *   served by this checkout's page server;  deleted afterwards
 * - the page is REVIEWED:  the review routes (`/api/review/...`) are answered here, an empty inbox with a session
 *   listening (the real routes refuse a page outside `epics/`), so the items draw their review controls
 * - the reader's state:  item `--item` (default `q2`:  one with a part, not approved) opened by a link to it (its
 *   part loads), a half-typed note in its note box (`<epic-item>`'s, in its shadow root) with the focus, the page
 *   scrolled to put the item a third of the way down
 * - three edits, each announced as the page server's watcher would (`announce()`), waited for on the page, then
 *   checked:  the page did NOT reload (a `window` marker survives), the item, the page and the Overview are the SAME
 *   elements (a marker on each), the item is still open, `<epic-page reviewing>` stays, the note's text and focus
 *   are kept, the scroll is where it was (2px)
 *   1. the doc:  the item's `title` changes (an attribute patched in place)
 *   2. the item's PART (`parts/<id>.htm`):  a paragraph added (the part re-fetched in place:  `wireSourceBodies()`)
 *   3. the doc:  the Overview's summary text changes (a child of an `<epic-*>` element replaced, not the element)
 * - `--bundle`:  serve this file in place of the checkout's `spell-ui.js` (a runtime not yet built into it)
 * - prints a JSON summary on stdout, problems on stderr;  exit 1 on any problem, 2 without a preview copy or server
 */
import { execFileSync } from "node:child_process"
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { chromium } from "playwright"

/** The checkout's root. */
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..")

/** What the reader types into the note box. */
const NOTE = "half-typed note"

/** How long an edit may take to show on the page. */
const EDIT_TIMEOUT_MS = 10_000

/** The inbox the faked review routes answer with:  nothing marked, a session listening. */
const INBOX = { marks: {}, drafts: {}, sent: null, now: [], working: {}, listening: { session: "check-live" } }

const args = process.argv.slice(2)
const name = args.find((arg, at) => !arg.startsWith("--") && !args[at - 1]?.startsWith("--")) ?? "windows-and-review"
const itemId = valueOf("--item") ?? "q2"
const bundle = valueOf("--bundle")
const source = join(ROOT, "preview-epics", name)
// under an `epics/<name>/` folder:  the page asks the review routes only on a plan doc's own path (`PLAN_DOC_PAGE`)
const copyRoot = join(ROOT, "preview-epics", "check-live")
const copy = join(copyRoot, "epics", name)
const docFile = join(copy, `${name}.plan.html`)
const partFile = join(copy, "parts", `${itemId}.htm`)
if (!existsSync(join(source, `${name}.plan.html`))) {
  console.error(`check-live-epics:  no preview copy ${join(source, `${name}.plan.html`)}`)
  process.exit(2)
}
rmSync(copyRoot, { recursive: true, force: true })
cpSync(source, copy, { recursive: true })
// a preview copy sits two folders under the root;  this one, four
writeFileSync(docFile, readFileSync(docFile, "utf8").replaceAll('"../../', '"../../../../'))
const url = pageUrl(`preview-epics/check-live/epics/${name}/${name}.plan.html`)
if (!url) {
  rmSync(copyRoot, { recursive: true, force: true })
  console.error("check-live-epics:  no page server (`spell dev server url` printed nothing)")
  process.exit(2)
}

const problems = []
const summary = { url, item: itemId, bundle: bundle ?? null, edits: [] }
const browser = await chromium.launch()

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  const errors = []
  page.on("pageerror", (error) => errors.push(String(error)))
  await page.route("**/api/review/**", (route) => route.fulfill({ json: { ...INBOX, listening: listener() } }))
  if (bundle) {
    const script = readFileSync(resolve(bundle))
    await page.route("**/packages/docs/tools/_assets/spell-ui.js", (route) =>
      route.fulfill({ body: script, contentType: "text/javascript" })
    )
  }
  await page.goto(url)
  await page.waitForFunction(() => customElements.get("epic-item") && window.SPELL_SERVER?.readPage, null, {
    timeout: 20_000
  })
  await page.waitForTimeout(800)

  // the reader's state:  the item opened through a link, its part loaded, a note typed, the item a third down
  await page.evaluate((id) => (location.hash = `#${id}`), itemId)
  await page.waitForFunction((id) => document.getElementById(id)?.matches(":state(loaded)"), itemId, {
    timeout: EDIT_TIMEOUT_MS
  })
  const note = page.locator(`#${itemId} textarea`).first()
  try {
    await note.waitFor({ timeout: EDIT_TIMEOUT_MS })
    await note.fill(NOTE)
  } catch {
    problems.push(`#${itemId} drew no note box (is the page reviewed?  is P9's ReviewControls in the pack?)`)
  }
  await page.waitForTimeout(400)
  await page.evaluate(readerState, itemId)
  const before = await page.evaluate(stateNow, itemId)
  summary.before = before
  if (!before.open) problems.push(`#${itemId} didn't open from a link to it`)
  if (before.note === NOTE && !before.focused) problems.push("the note box didn't keep the focus")

  await edit("an item's title (the doc)", "doc", () => {
    const html = readFileSync(docFile, "utf8")
    const changed = html.replace(new RegExp(`(id="${itemId}"\\s+title=")([^"]*)"`), `$1$2 (check-live)"`)
    if (changed === html) throw new Error(`no title on #${itemId} in ${docFile}`)
    writeFileSync(docFile, changed)
    return (id) => document.getElementById(id)?.getAttribute("title")?.endsWith("(check-live)")
  })
  await edit("the item's part (parts/<id>.htm)", "part", () => {
    writeFileSync(partFile, `${readFileSync(partFile, "utf8")}\n<p id="check-live-part">check-live</p>\n`)
    return () => !!document.getElementById("check-live-part")
  })
  await edit("the Overview's summary (a child of <epic-overview>)", "doc", () => {
    const html = readFileSync(docFile, "utf8")
    const changed = html.replace(/(<p slot="summary">)/, `$1check-live summary. `)
    if (changed === html) throw new Error(`no Overview summary in ${docFile}`)
    writeFileSync(docFile, changed)
    return () => !!document.querySelector("epic-overview > [slot=summary]")?.textContent.includes("check-live summary")
  })
  if (errors.length) problems.push(`page errors:  ${errors.join(" | ")}`)

  /**
   * Make one edit to `file` (`"doc"`, or the item's `"part"`:  `change()` writes it, returns a page predicate for
   * "it's in"), announce it, wait for it on the page, then check the reader's state against `before`.
   */
  async function edit(label, file, change) {
    const shown = change()
    await page.evaluate(announce, { file, id: itemId })
    let landed = true
    try {
      await page.waitForFunction(shown, itemId, { timeout: EDIT_TIMEOUT_MS })
    } catch {
      landed = false
      problems.push(`${label}:  never showed up on the page`)
    }
    await page.waitForTimeout(800)
    const after = await page.evaluate(stateNow, itemId)
    summary.edits.push({ label, landed, after })
    const lost = []
    if (!after.marker) lost.push("the page reloaded (its window marker is gone)")
    for (const kept of ["page", "item", "overview"]) if (!after.same[kept]) lost.push(`<epic-${kept}> was replaced`)
    if (!after.open) lost.push(`#${itemId} folded`)
    if (before.reviewing && !after.reviewing) lost.push("<epic-page> lost its `reviewing` (page state)")
    if (after.note !== before.note) lost.push(`typed text lost:  "${after.note}"`)
    if (before.focused && !after.focused) lost.push("the note box lost the focus")
    if (Math.abs(after.y - before.y) > 2) lost.push(`scroll moved:  ${before.y} -> ${after.y}`)
    for (const problem of lost) problems.push(`${label}:  ${problem}`)
  }
} catch (error) {
  problems.push(`the check itself failed:  ${error.stack ?? error}`)
} finally {
  await browser.close()
  rmSync(copyRoot, { recursive: true, force: true })
}

for (const problem of problems) console.error(`PROBLEM:  ${problem}`)
console.log(JSON.stringify({ ...summary, ok: !problems.length }, null, 2))
process.exit(problems.length ? 1 : 0)

////////////////
// ## In the page
////////////////

/** In the page:  mark the window and the elements that must survive, scroll the item a third of the way down. */
function readerState(id) {
  window.__checkLive = true
  const item = document.getElementById(id)
  for (const element of [document.querySelector("epic-page"), item, document.querySelector("epic-overview")])
    element.__checkLive = true
  const top = item.getBoundingClientRect().top
  scrollTo({ top: scrollY + top - innerHeight / 3, behavior: "instant" })
}

/**
 * In the page:  tell its live client `file` changed (`"doc"`:  the page's own file;  `"part"`:  item `id`'s part),
 * as the page server's watcher would (`window.__spellLiveChange`, `packages/server/src/liveClient.ts`).  The page
 * server doesn't watch `preview-epics/` (`package.json` `pageServer.watch`);  everything after this is the real path.
 */
function announce({ file, id }) {
  const path =
    file === "doc"
      ? window.SPELL_SERVER.file
      : new URL(document.getElementById(id).getAttribute("source"), document.baseURI).pathname
  window.__spellLiveChange(path)
}

/** In the page:  where things stand. */
function stateNow(id) {
  const item = document.getElementById(id)
  const note = item?.shadowRoot?.querySelector("textarea")
  return {
    marker: window.__checkLive === true,
    same: {
      page: document.querySelector("epic-page")?.__checkLive === true,
      item: item?.__checkLive === true,
      overview: document.querySelector("epic-overview")?.__checkLive === true
    },
    open: !!item?.hasAttribute("open"),
    reviewing: !!document.querySelector("epic-page")?.hasAttribute("reviewing"),
    note: note?.value ?? null,
    focused: !!note && document.activeElement === item && item.shadowRoot.activeElement === note,
    y: scrollY
  }
}

////////////////
// ## Helpers
////////////////

/** A session listening, as the routes answer it:  its heartbeat now. */
function listener() {
  return { ...INBOX.listening, seen: new Date().toISOString() }
}

/** The value after flag `flag`, if given. */
function valueOf(flag) {
  const at = args.indexOf(flag)
  return at < 0 ? undefined : args[at + 1]
}

/** This checkout's page server's URL for `file` (from the checkout's root), or `undefined` without one. */
function pageUrl(file) {
  try {
    const out = execFileSync("node", [join(ROOT, "packages/cli/bin/spell.mjs"), "dev", "server", "url", file], {
      cwd: ROOT,
      encoding: "utf8"
    })
    return out.trim().split("\n").pop() || undefined
  } catch {
    return undefined
  }
}
