/**
 * Check that every control the `<epic-*>` elements draw shows a browser tooltip (epic `airplane`):
 * the `title` the browser would show when the pointer rests on it.
 * - Owen (2026-10-10):  "The buttons don't have browser tooltips -- unclear what they do."
 * - What shows is NOT "has the control a `title`":
 *   - the browser hit-tests the pointer to the innermost element under it
 *     (through shadow roots:  `<ui-button>`'s inner `<button>`, an icon's `<svg>`)
 *   - Chrome then walks up to the first element with a `title`
 *     (an EMPTY one stops it:  the cards' `title=""`, which hides the element's own `title`)
 *   - VS Code's side bar does NOT:  Electron 38 and later, on macOS, shows a `title` only while that innermost
 *     element carries it itself (electron/electron#49843, open), so an icon inside a titled button shows nothing
 * - So this checks the strict case, at each control's centre:  the innermost element there must carry the `title`.
 *   - the fix it holds the pack to:  `Tooltip.css` (in `epic-item/`) lets the pointer through a titled control's insides
 *   - it fails on a control whose centre has no `title` of its own, or is covered by something else
 *
 * Usage (from the repo root):
 *   node packages/epics/demo/check-tooltips-epics.mjs [--doc <name>] [--list]
 * - the doc:  a SCRATCH COPY, as `check-review-epics.mjs` makes it
 *   - `review-sample.html` (default), with a judgement call of option cards added
 *   - or `--doc <name>`, a copy of `epics/<name>/`
 * - what it opens, so their controls are drawn:  every section and item unfolded, an item's note box (Revisit),
 *   the toolbar's New form, the git line, and an "Agents running" panel
 *   (one agent, its `/api/epics/agents` answered here)
 * - `--list`:  print every control and its tooltip (the audit's table), not just the ones without
 * - fails (exit 1) on a page error, or a control with no tooltip
 * - the server:  a page server of its OWN on this checkout (`PageServer`, no pid file, a free port);  stopped at the end
 * - re-runs itself under `tsx` (the page server and the tool are TypeScript)
 */
import { spawnSync } from "node:child_process"
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, "../../..")
const SHOTS = join(HERE, "shots")

if (!process.env.CHECK_TOOLTIPS_UNDER_TSX) {
  const run = spawnSync(
    process.execPath,
    ["--import", "tsx", fileURLToPath(import.meta.url), ...process.argv.slice(2)],
    {
      stdio: "inherit",
      cwd: ROOT,
      env: {
        ...process.env,
        CHECK_TOOLTIPS_UNDER_TSX: "1",
        TSX_TSCONFIG_PATH: join(ROOT, "packages/server/tsconfig.json")
      }
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
const docName = args.includes("--doc") ? args[args.indexOf("--doc") + 1] : "tooltip-sample"
const listAll = args.includes("--list")
const problems = []

/** The agent the "Agents running" panel shows:  `/api/epics/agents` answered by the page itself. */
const AGENT = {
  name: "airplane-tooltips",
  task: "check every control's tooltip",
  status: "active",
  started: "2026-10-10T09:00:00Z",
  redirects: [{ note: "and the chips too", at: "2026-10-10T09:05:00Z", told: "" }]
}

/**
 * Controls drawn by a Spell UI element inside an `<epic-*>`, whose tooltip is Spell UI's to add:  reported, not failed.
 * - `drawnBy`:  the element whose shadow root draws it;  `control`:  how the report names it (its start)
 */
const KNOWN = [
  {
    drawnBy: "ui-code",
    control: "button.copy",
    why: "Spell UI's own Copy (it says Copy on it);  its title needs the docs bundle rebuilt (packages/epics/tools/_assets)"
  },
  {
    drawnBy: "ui-section",
    control: "span.fold.icon",
    why:
      "Spell UI's end chevron:  its title is on the span, the pointer lands on its <svg>;  the fold button beside it " +
      "shows the tooltip.  Fixing it is a <ui-section> change and a docs bundle rebuild"
  }
]

////////////////
// ## The copy
////////////////

const folder = join(SHOTS, "epics", docName)
const file = join(folder, `${docName}.plan.html`)
const inboxFile = join(folder, `${docName}.inbox.json5`)
copyDoc()
mkdirSync(join(SHOTS, "packages"), { recursive: true })
const tool = new PlanDocCommands({ files: new PlanDocFiles({ root: SHOTS }) })
tool.print = () => {}
tool.warn = () => {}
if (docName === "tooltip-sample") await addPickCall()

const server = await new PageServer({ root: ROOT }).start({
  port: 47_300 + Math.floor(Math.random() * 300),
  pidFile: false
})
const url = `http://127.0.0.1:${server.info.port}/${file.slice(ROOT.length + 1)}`

const browser = await chromium.launch()
let controls = []
try {
  controls = await run()
} catch (error) {
  problems.push(`threw:  ${error.stack ?? error}`)
} finally {
  await browser.close()
  await server.stop()
  rmSync(inboxFile, { force: true })
  rmSync(inboxFile.replace(/\.json5$/, ".json"), { force: true })
}
const missing = controls.filter((control) => !control.tip)
for (const control of missing) {
  const known = KNOWN.find((it) => it.drawnBy === control.drawnBy && control.control.startsWith(it.control))
  if (known) console.log(`known, not failed:  ${control.element} ${control.control}:  ${known.why}`)
  else problems.push(`no tooltip:  ${control.element} ${control.control} (${control.why})`)
}
if (listAll) for (const control of controls) console.log(`${control.element}\t${control.control}\t${control.tip}`)
console.log(`check-tooltips-epics:  ${controls.length} controls, ${missing.length} without a tooltip`)
if (problems.length) {
  console.error(problems.map((problem) => `- ${problem}`).join("\n"))
  process.exit(1)
}

////////////////
// ## The run
////////////////

/** Open the copy, unfold and open everything that draws controls, then hit-test every control. */
async function run() {
  const context = await browser.newContext({ viewport: { width: 900, height: 1000 } })
  const page = await context.newPage()
  page.on("pageerror", (error) => problems.push(`pageerror:  ${error.message}`))
  await page.route("**/api/epics/agents?*", (route) => route.fulfill({ json: { agents: [AGENT] } }))
  await page.goto(url)
  await page
    .waitForFunction(() => document.querySelector("epic-page")?.hasAttribute("reviewing"), null, { timeout: 15_000 })
    .catch(() => problems.push("the page never said it's being reviewed (<epic-page reviewing>)"))
  await page.evaluate(() => {
    for (const fold of document.querySelectorAll("epic-overview, epic-section, epic-item, epic-phase"))
      fold.setAttribute("open", "")
  })
  await page.waitForTimeout(600)
  // every panel and card a fold button folded (code, asides, More Details, option panels ...):  unfolded
  for (let pass = 0; pass < 2; pass++) {
    await page.evaluate(() => {
      for (const host of document.querySelectorAll(
        "epic-code, epic-aside, epic-more, epic-original, epic-choices, epic-option, epic-reply, epic-answer, epic-status, epic-note, epic-update"
      ))
        host.shadowRoot?.querySelector('button[aria-expanded="false"]')?.click()
    })
    await page.waitForTimeout(300)
  }
  // an item's note box (Revisit opens it), and the toolbar's New form;  the agents panel starts open
  await clickDeep(page, 'ui-button[data-action="revisit"]')
  await clickDeep(page, "epic-page >>> button.new-button")
  await page.waitForTimeout(400)
  return page.evaluate(survey)
}

/** Click the first element `selector` finds, through shadow roots (`>>>`);  nothing when there's none. */
async function clickDeep(page, selector) {
  const found = await page.evaluate((selector) => {
    const all = (root, css) => [root, ...deepRoots(root)].flatMap((it) => [...it.querySelectorAll(css)])
    function deepRoots(root) {
      return [...root.querySelectorAll("*")].flatMap((it) =>
        it.shadowRoot ? [it.shadowRoot, ...deepRoots(it.shadowRoot)] : []
      )
    }
    const [outer, inner] = selector.split(" >>> ")
    const hosts = all(document, outer)
    const target = inner ? hosts.flatMap((host) => (host.shadowRoot ? all(host.shadowRoot, inner) : []))[0] : hosts[0]
    if (!target) return false
    target.scrollIntoView({ block: "center" })
    ;(target.shadowRoot?.querySelector("button") ?? target).click()
    return true
  }, selector)
  if (found) await page.waitForTimeout(300)
}

////////////////
// ## In the page
////////////////

/**
 * In the page:  every control, and the tooltip the browser would show over its centre.
 * - a control:  a `<button>` (a `<ui-button>`'s inner one counted as the `<ui-button>`), a `<summary>`,
 *   an element with `role="button"`, the header's step and bedtime labels
 * - drawn ones only:  a control with no box (folded away, `display: none`) is skipped
 */
function survey() {
  const CONTROLS = "button, summary, [role='button'], ui-label.step, ui-label.bedtime, span.fold.icon[title]"
  const found = []
  const roots = (root) =>
    [...root.querySelectorAll("*")].flatMap((it) => (it.shadowRoot ? [it.shadowRoot, ...roots(it.shadowRoot)] : []))
  for (const root of [document, ...roots(document)]) {
    if (!(root instanceof ShadowRoot)) continue
    const element = root.host.localName
    // a Spell UI element an `<epic-*>` draws (`<ui-button>`, `<ui-section>`):  its controls count as that element's
    const owner = element.startsWith("epic-") ? element : ownerTag(root.host)
    if (!owner.startsWith("epic-")) continue
    for (const control of root.querySelectorAll(CONTROLS)) {
      // a `<ui-button>`'s inner `<button>`:  reported as the `<ui-button>`
      const host = element === "ui-button" ? root.host : control
      // folded away (`hidden="until-found"`, `display: none`):  not under any pointer
      if (!control.checkVisibility()) continue
      host.scrollIntoView({ block: "center" })
      const box = control.getBoundingClientRect()
      if (!box.width || !box.height) continue
      const x = box.left + box.width / 2
      const y = box.top + box.height / 2
      const hit = deepHit(x, y)
      const covered = !hit || !composedContains(host, hit)
      // strict (VS Code's side bar):  the element under the pointer's own `title`;  Chrome's walk, for the report
      const tip = covered ? "" : (hit.getAttribute("title") ?? "").trim()
      const chromeTip = covered ? "" : (tooltipOf(hit) ?? "")
      found.push({
        element: owner,
        drawnBy: element,
        control: describe(host),
        tip,
        why: covered
          ? `covered by ${hit ? describe(hit) : "nothing"}`
          : `under the pointer:  ${describe(hit)}, no title of its own;  Chrome would show "${chromeTip}"`
      })
    }
  }
  return found

  /** The innermost element at `x, y`, through every shadow root. */
  function deepHit(x, y) {
    let hit = document.elementFromPoint(x, y)
    while (hit?.shadowRoot) {
      const inner = hit.shadowRoot.elementFromPoint(x, y)
      // nothing in its shadow root takes the pointer (`pointer-events: none`):  the host is the hit
      if (!inner || inner === hit || !hit.shadowRoot.contains(inner)) break
      hit = inner
    }
    return hit
  }

  /** Chrome's tooltip for `node`:  the first `title` up the flat tree;  `""` when an empty one stops it. */
  function tooltipOf(node) {
    for (let it = node; it; it = flatParent(it)) {
      if (it.nodeType === Node.ELEMENT_NODE && it.hasAttribute("title")) return it.getAttribute("title").trim()
    }
    return undefined
  }

  /** `node`'s parent in the flat tree:  its slot when slotted, a shadow root's host. */
  function flatParent(node) {
    if (node.assignedSlot) return node.assignedSlot
    const parent = node.parentNode
    return parent instanceof ShadowRoot ? parent.host : parent
  }

  /** Is `inner` `outer`, or inside it, through shadow roots and slots? */
  function composedContains(outer, inner) {
    for (let it = inner; it; it = it.parentNode instanceof ShadowRoot ? it.parentNode.host : it.parentNode) {
      if (it === outer) return true
    }
    for (let it = inner; it; it = flatParent(it)) if (it === outer) return true
    return false
  }

  /** The `<epic-*>` element whose shadow root draws `host`. */
  function ownerTag(host) {
    for (let it = host.getRootNode(); it instanceof ShadowRoot; it = it.host.getRootNode()) {
      if (it.host.localName.startsWith("epic-")) return it.host.localName
    }
    return "page"
  }

  /** A short name for a control:  its tag, classes, action and words. */
  function describe(element) {
    const classes = typeof element.className === "string" ? element.className.trim().split(/\s+/).filter(Boolean) : []
    const action = element.dataset?.action ?? element.dataset?.how ?? element.dataset?.state
    const words = (element.getAttribute("aria-label") ?? element.textContent ?? "").trim().replace(/\s+/g, " ")
    return [
      element.localName + classes.map((name) => `.${name}`).join(""),
      action && `[${action}]`,
      words && `"${words.slice(0, 40)}"`
    ]
      .filter(Boolean)
      .join(" ")
  }
}

////////////////
// ## Helpers
////////////////

/** Copy the doc (and its parts) to `folder`, its relative links moved deeper (as `check-review-epics.mjs` does). */
function copyDoc() {
  rmSync(folder, { recursive: true, force: true })
  mkdirSync(folder, { recursive: true })
  if (docName === "tooltip-sample") {
    const html = readFileSync(join(HERE, "review-sample.html"), "utf8")
      .replaceAll('"../../', '"../../../../../')
      .replaceAll('"../pack/', '"../../../../pack/')
      .replaceAll('epic="review-sample"', 'epic="tooltip-sample"')
    writeFileSync(file, html)
    return
  }
  const from = join(ROOT, "epics", docName)
  const skeleton = join(from, `${docName}.plan.html`)
  if (!existsSync(skeleton)) {
    console.error(`check-tooltips-epics:  no ${skeleton}`)
    process.exit(2)
  }
  writeFileSync(file, readFileSync(skeleton, "utf8").replaceAll('"../../', '"../../../../../../'))
  const parts = join(from, "parts")
  if (!existsSync(parts)) return
  mkdirSync(join(folder, "parts"))
  for (const name of readdirSync(parts)) {
    const text = readFileSync(join(parts, name), "utf8").replaceAll('"../../../', '"../../../../../../../')
    writeFileSync(join(folder, "parts", name), text)
  }
}

/** A judgement call with option cards, so their Choose pills are drawn. */
async function addPickCall() {
  const cards = (letters) =>
    `<epic-choices>${letters.map((letter) => `<epic-option letter="${letter}" title="Option ${letter}"><p>why ${letter}</p></epic-option>`).join("")}</epic-choices>`
  await tool.run(["add", docName, "judgement", "check-tooltips-epics:  which store?", "--details", cards(["A", "B"])])
}
