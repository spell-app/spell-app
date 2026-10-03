/// <reference types="node" />

import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs"
import { basename, isAbsolute, join, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

import { chromium, type Browser, type BrowserContextOptions, type Page } from "playwright"

/**
 * Checks the plain-HTML Spell UI docs pages (`site/*.html`, `site/components/ui-<name>.html`) in headless chromium,
 * served by this checkout's page server at `/ui/`.
 * - Run:  `yarn site:check <page...>` (in `packages/ui`), or `yarn site:check --all`;  `--out <dir>` for the
 *   screenshots (default `tools/results/site-check/`, git-ignored).
 * - A page is a path (absolute, from the cwd, or from `site/`), a tag (`ui-button` =>
 *   `site/components/ui-button.html`) or a name (`index` => `site/index.html`).
 * - Problems (exit 1):
 *   - console errors, page errors, failed requests and responses >= 400 (favicon aside)
 *   - `ui-*` / `spell-*` elements still undefined once settled;  defined `ui-*` with no shadow root
 *   - component pages:  not exactly one `ui-tabs.site-tabs` with panes `examples`, `usage`, `api`, `theming`;  a pane
 *     that isn't the shown one when loaded with its `#hash`, or shows under 50px
 *   - `ui-docs-toc`:  hidden or empty on desktop, visible on phone
 *   - horizontal scroll at phone width, listing the elements past the edge, outermost and deepest:  what a fixer
 *     needs;  a nav button (`ui-button.site-menu-button`) whose flyout doesn't open
 * - Every page is checked, whatever failed before it.  Problems go to stderr, with each page's URL, counts and
 *   screenshots;  a JSON summary is the last thing on stdout.
 * - Look at the screenshots too:  the checks can't see overlap, clipping or ugly wrapping.
 * - Replaces the Astro site's `check` script.  Model:  the docs' checker, `packages/docs/scripts/check-spell.js`.
 */
export class SiteCheck {
  /** `packages/ui/`. */
  static readonly PACKAGE = fileURLToPath(new URL("..", import.meta.url))

  /** `packages/ui/site/`:  what the page server mounts at `/ui/`. */
  static readonly SITE = join(SiteCheck.PACKAGE, "site")

  /** Repo root (of this worktree):  where `yarn server ensure` runs. */
  static readonly REPO = resolve(SiteCheck.PACKAGE, "..", "..")

  /** Default screenshot folder;  `tools/results` is git-ignored. */
  static readonly OUT = join(SiteCheck.PACKAGE, "tools", "results", "site-check")

  /** Component pages' tab panes, in order. */
  static readonly TABS = ["examples", "usage", "api", "theming"]

  /** Desktop viewport. */
  static readonly DESKTOP: BrowserContextOptions = { viewport: { width: 1440, height: 900 } }

  /** Phone viewport:  an iPhone 14-ish, touch, retina. */
  static readonly PHONE: BrowserContextOptions = {
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2
  }

  /** How long a page may take to define its elements;  past it, the undefined ones are reported, not waited on. */
  static readonly SETTLE_MS = 15000

  /** The same page's later loads, once one didn't settle:  it won't settle now either, so don't wait it out again. */
  static readonly RESETTLE_MS = 3000

  /** Pane shorter than this counts as empty. */
  static readonly MIN_PANE_HEIGHT = 50

  /** Page files to check, absolute. */
  readonly files: string[]

  /** Screenshot folder, absolute. */
  readonly out: string

  /** Page server origin, e.g. `http://127.0.0.1:54769`;  set by `run()`. */
  base = ""

  /** The one browser every page shares;  set by `run()`. */
  private browser?: Browser

  constructor(files: string[], out: string = SiteCheck.OUT) {
    this.files = files
    this.out = out
  }

  /**
   * Parse the command line, check every page, print, and exit.
   * - SIDE EFFECT:  `process.exit()`:  0 all clean, 1 any problem, 2 bad arguments or no server
   */
  static async main(argv: string[] = process.argv.slice(2)): Promise<never> {
    // `yarn site:check` runs in `packages/ui`;  paths the user typed are relative to where they typed them
    const cwd = process.env.INIT_CWD ?? process.cwd()
    let out = SiteCheck.OUT
    let all = false
    const names: string[] = []
    for (let i = 0; i < argv.length; i++) {
      const arg = argv[i]!
      if (arg === "--all") all = true
      else if (arg === "--out") out = resolve(cwd, argv[++i] ?? SiteCheck.fail("--out needs a folder"))
      else if (arg === "--keep-going") continue
      else if (arg === "--help" || arg === "-h") SiteCheck.fail(USAGE, 0)
      else if (arg.startsWith("--")) SiteCheck.fail(`unknown option ${arg}\n${USAGE}`)
      else names.push(arg)
    }
    const files = all ? SiteCheck.allPages() : names.map((name) => SiteCheck.resolvePage(name, cwd))
    if (!files.length) SiteCheck.fail(USAGE)
    const check = new SiteCheck([...new Set(files)], out)
    const reports = await check.run()
    const ok = reports.every((report) => report.ok)
    console.log(JSON.stringify({ ok, base: check.base, out: check.out, pages: reports }, null, 2))
    process.exit(ok ? 0 : 1)
  }

  /**
   * Find a page file from what was typed, first match wins:
   * - absolute path
   * - relative to `cwd`
   * - relative to `site/`
   * - a tag, `ui-button` => `site/components/ui-button.html`
   * - a name, `index` => `site/index.html`
   * - SIDE EFFECT:  exits (2) when nothing matches, or the page isn't under `site/` (the server wouldn't serve it)
   */
  static resolvePage(name: string, cwd: string): string {
    const html = name.endsWith(".html") ? name : `${name}.html`
    const candidates = isAbsolute(name)
      ? [name]
      : [
          resolve(cwd, name),
          join(SiteCheck.SITE, name),
          ...(/^[a-z]+(-[a-z0-9]+)+$/.test(name) ? [join(SiteCheck.SITE, "components", html)] : []),
          join(SiteCheck.SITE, html)
        ]
    const file = candidates.find((path) => existsSync(path) && statSync(path).isFile())
    if (!file) return SiteCheck.fail(`no page "${name}";  tried:\n  ${candidates.join("\n  ")}`)
    if (relative(SiteCheck.SITE, file).startsWith("..")) return SiteCheck.fail(`${file} is not under ${SiteCheck.SITE}`)
    return file
  }

  /** Every page:  `site/*.html` and `site/components/*.html`, minus `_`-prefixed ones (smoke pages, partials). */
  static allPages(): string[] {
    return [SiteCheck.SITE, join(SiteCheck.SITE, "components")].flatMap((folder) =>
      existsSync(folder)
        ? readdirSync(folder)
            .filter((file) => file.endsWith(".html") && !file.startsWith("_"))
            .sort()
            .map((file) => join(folder, file))
        : []
    )
  }

  /** Print `message` to stderr and exit (`code`, default 2). */
  static fail(message: string, code = 2): never {
    ;(code ? console.error : console.log)(message)
    process.exit(code)
  }

  /**
   * Find the page server, then check every page in one browser.
   * - SIDE EFFECT:  `yarn server ensure` starts the server if it isn't running;  writes screenshots to `out`
   */
  async run(): Promise<PageReport[]> {
    this.base = await this.ensureServer()
    mkdirSync(this.out, { recursive: true })
    this.browser = await chromium.launch()
    const reports: PageReport[] = []
    try {
      for (const file of this.files) {
        const report = await this.checkPage(file)
        this.print(report)
        reports.push(report)
      }
    } finally {
      await this.browser.close()
    }
    return reports
  }

  /**
   * The page server's origin, once it serves the site bundle.
   * - `yarn server ensure` prints `{ base, port, ... }` as JSON, maybe after yarn's own lines:  parsed from the first
   *   `{`
   * - SIDE EFFECT:  exits (2) when there's no server, or it doesn't serve `/ui/_assets/site.js`
   */
  async ensureServer(): Promise<string> {
    let base: string
    try {
      const text = execFileSync("yarn", ["server", "ensure"], {
        cwd: SiteCheck.REPO,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        timeout: 60000
      })
      base = (JSON.parse(text.slice(text.indexOf("{"))) as { base: string }).base.replace(/\/$/, "")
    } catch (error) {
      return SiteCheck.fail(
        `can't start or find the page server (\`yarn server ensure\` in ${SiteCheck.REPO}):  ${error}`
      )
    }
    const probe = `${base}/ui/_assets/site.js`
    const status = await fetch(probe, { signal: AbortSignal.timeout(10000) }).then(
      (response) => response.status,
      (error: unknown) => String(error)
    )
    if (status !== 200)
      SiteCheck.fail(`the page server doesn't serve the site bundle:  ${probe} => ${status}.  Run \`yarn site:build\`?`)
    return base
  }

  /** Check one page at desktop, phone and dark;  never throws:  a crash is one more problem. */
  async checkPage(file: string): Promise<PageReport> {
    const path = relative(SiteCheck.SITE, file).split(sep).join("/")
    const report: PageReport = {
      page: path,
      url: `${this.base}/ui/${path}`,
      ok: false,
      problems: [],
      notes: [],
      counts: {},
      screenshots: []
    }
    const seen = new Map<string, number>()
    const context: CheckContext = { file, path, name: basename(file, ".html"), report, problem, unsettled: false }
    for (const step of [this.checkDesktop, this.checkPhone, this.checkDark]) {
      try {
        await step.call(this, context)
      } catch (error) {
        problem(`${step.name} crashed:  ${error}`)
      }
    }
    report.problems = [...seen].map(([text, count]) => (count > 1 ? `${text}  (x${count})` : text))
    report.notes = [...new Set(report.notes)]
    report.ok = report.problems.length === 0
    return report

    /**
     * Record a problem once per distinct first line (800 characters at most).
     * - a broken element logs the same error once per instance:  counted, not repeated
     */
    function problem(text: string) {
      const line = String(text).split("\n")[0]!.slice(0, 800)
      seen.set(line, (seen.get(line) ?? 0) + 1)
    }
  }

  ////////////////
  // ## Viewports
  ////////////////

  /**
   * Desktop:  errors, element definitions, tabs (each loaded fresh from its `#hash`), contents list, screenshots.
   * - non-component pages:  tabs only if they have `ui-tabs.site-tabs`;  else a top and a full-page screenshot
   */
  private async checkDesktop(check: CheckContext): Promise<void> {
    const { report, problem, name } = check
    const page = await this.open(check, SiteCheck.DESKTOP, "desktop")
    try {
      await this.load(page, report.url, check)
      const elements = await page.evaluate(inspectElements)
      report.counts.elements = elements.total
      report.counts.tags = Object.keys(elements.tags).length
      for (const [tag, count] of Object.entries(elements.undefined)) problem(`${count} <${tag}> never defined`)
      for (const [tag, count] of Object.entries(elements.unrendered)) problem(`${count} <${tag}> without a shadow root`)

      const tabs = await page.evaluate(tabsState)
      const component = check.path.startsWith("components/")
      report.counts.tabs = tabs.values
      let values: string[] = []
      if (component) {
        if (tabs.count !== 1) problem(`${tabs.count} ui-tabs.site-tabs (a component page needs exactly one)`)
        if (tabs.values.join() !== SiteCheck.TABS.join())
          problem(`tab panes [${tabs.values.join(", ")}], expected [${SiteCheck.TABS.join(", ")}]`)
        values = tabs.values.filter((value) => SiteCheck.TABS.includes(value))
      } else if (tabs.count) values = tabs.values.filter(Boolean)

      if (!values.length) {
        await this.tocCheck(page, check, "the page", true)
        await this.shoot(page, check, `${name}-desk-top.png`)
        await this.shoot(page, check, `${name}-desk-full.png`, true)
        return
      }
      report.counts.toc = {}
      report.counts.paneHeights = {}
      for (const value of values) {
        // a fresh load, so the hash-on-load path is what's tested
        await page.goto("about:blank")
        await this.load(page, `${report.url}#${value}`, check)
        await page.evaluate(() => window.scrollTo(0, 0))
        const state = await page.evaluate(tabsState)
        const index = state.values.indexOf(value)
        const height = state.heights[index] ?? 0
        report.counts.paneHeights[value] = height
        if (state.shown.join() !== value)
          problem(`#${value} loaded, but the shown pane is [${state.shown.join(", ") || "none"}]`)
        if (height <= SiteCheck.MIN_PANE_HEIGHT) problem(`pane "${value}" is ${height}px tall:  no visible content`)
        await this.tocCheck(page, check, `#${value}`, value === values[0])
        await this.shoot(page, check, `${name}-desk-${value}.png`)
        if (value === values[0]) await this.shoot(page, check, `${name}-desk-full.png`, true)
      }
    } finally {
      await page.context().close()
    }
  }

  /**
   * Phone:  horizontal scroll (with its widest leaf offenders), the contents list hidden, the nav flyout opening;
   * screenshots top, middle, full page and nav.
   */
  private async checkPhone(check: CheckContext): Promise<void> {
    const { report, problem, name } = check
    const page = await this.open(check, SiteCheck.PHONE, "phone")
    try {
      await this.load(page, report.url, check)
      const width = await page.evaluate(overflowState)
      report.counts.phoneOverflow = width.overflow
      if (width.overflow > 0) {
        report.counts.phoneOffenders = width.offenders
        report.counts.phoneOutermost = width.outermost
        problem(
          `${width.overflow}px horizontal scroll at phone width;  outermost:  ${width.outermost.join(", ")};  ` +
            `deepest:  ${width.offenders.join(", ")}`
        )
      }
      const toc = await page.evaluate(tocState)
      if (toc?.visible) problem("ui-docs-toc visible at phone width (should be hidden)")
      await this.shoot(page, check, `${name}-phone-top.png`)
      await page.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - window.innerHeight) / 2))
      await page.waitForTimeout(400)
      await this.shoot(page, check, `${name}-phone-mid.png`)
      await this.shoot(page, check, `${name}-phone-full.png`, true)

      await page.evaluate(() => window.scrollTo(0, 0))
      const menu = page.locator("ui-button.site-menu-button").first()
      if (!(await menu.count())) {
        report.notes.push("no ui-button.site-menu-button:  nav flyout not checked")
        return
      }
      let error = ""
      try {
        await menu.click({ timeout: 3000 })
      } catch (thrown) {
        error = `:  ${String(thrown).split("\n")[0]}`
      }
      await page.waitForTimeout(600)
      const nav = await page.evaluate(navState)
      report.counts.navOpen = nav
      if (!nav) problem(`nav flyout didn't open from ui-button.site-menu-button${error}`)
      await this.shoot(page, check, `${name}-phone-nav.png`)
    } finally {
      await page.context().close()
    }
  }

  /** Dark scheme:  one desktop screenshot (errors still count). */
  private async checkDark(check: CheckContext): Promise<void> {
    const page = await this.open(check, { ...SiteCheck.DESKTOP, colorScheme: "dark" }, "dark")
    try {
      await this.load(page, check.report.url, check)
      await this.shoot(page, check, `${check.name}-desk-dark.png`)
    } finally {
      await page.context().close()
    }
  }

  ////////////////
  // ## Helpers
  ////////////////

  /**
   * A page in a fresh context, its errors and failed requests reported as `check`'s problems, labelled `label`.
   * - ignores `favicon.ico`, and console "Failed to load resource" lines (the response / request listeners report
   *   those, with their URL)
   * - `net::ERR_ABORTED` is a note:  a navigation (the next tab's fresh load) cancels what's still in flight
   */
  private async open(check: CheckContext, options: BrowserContextOptions, label: string): Promise<Page> {
    const context = await this.browser!.newContext(options)
    // HACK:  tsx compiles this file with esbuild `keepNames`, which wraps the in-page probes' inner functions in
    // `__name(...)`, a helper the page doesn't have (as `hmr.e2e.ts`)
    await context.addInitScript("globalThis.__name = (fn) => fn")
    const page = await context.newPage()
    page.setDefaultTimeout(20000)
    const { problem, report } = check
    page.on("pageerror", (error) => problem(`page error (${label}):  ${error}`))
    page.on("console", (message) => {
      if (message.type() !== "error" || message.text().startsWith("Failed to load resource")) return
      problem(`console (${label}):  ${message.text()}`)
    })
    page.on("response", (response) => {
      if (response.status() >= 400 && !isFavicon(response.url()))
        problem(`HTTP ${response.status()} (${label}):  ${response.url()}`)
    })
    page.on("requestfailed", (request) => {
      if (isFavicon(request.url())) return
      const text = `request failed (${label}):  ${request.url()}  ${request.failure()?.errorText ?? ""}`
      if (request.failure()?.errorText.includes("ERR_ABORTED")) report.notes.push(text)
      else problem(text)
    })
    return page
  }

  /**
   * Go to `url` and let it settle:  every `ui-*` / `spell-*` element defined (at most `SETTLE_MS`), the network idle,
   * then half a second for the runtime.
   * - a page that doesn't settle is NOT a problem here:  `inspectElements` reports what stayed undefined
   * - SIDE EFFECT:  sets `check.unsettled` when it doesn't, so later loads wait only `RESETTLE_MS`
   */
  private async load(page: Page, url: string, check: CheckContext): Promise<void> {
    await page.goto(url, { timeout: 30000 })
    const timeout = check.unsettled ? SiteCheck.RESETTLE_MS : SiteCheck.SETTLE_MS
    const settled = await page.waitForFunction(allDefined, undefined, { timeout }).then(
      () => true,
      () => false
    )
    if (!settled) {
      check.unsettled = true
      check.report.notes.push(`${url}:  not every element defined after ${timeout / 1000}s`)
    }
    await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {})
    await page.waitForTimeout(500)
  }

  /**
   * The contents list (`ui-docs-toc`), if the page has one:  visible on desktop while it has entries.
   * - `where` labels the problem;  `required` makes zero entries a problem (the first pane), else a note.
   */
  private async tocCheck(page: Page, check: CheckContext, where: string, required: boolean): Promise<void> {
    const toc = await page.evaluate(tocState)
    if (!toc) return
    const counts = (check.report.counts.toc ??= {})
    counts[where] = toc.entries
    // an EMPTY toc's rail is hidden on purpose (site.css:  the content takes its room, e.g. the API tab)
    if (!toc.visible && toc.entries) check.problem(`ui-docs-toc hidden on desktop (${where})`)
    if (!toc.entries) {
      if (required) check.problem(`ui-docs-toc has no entries (${where})`)
      else check.report.notes.push(`ui-docs-toc has no entries (${where})`)
    }
  }

  /** Screenshot `page` to `out/<file>`:  the viewport, or the full page;  listed in the report. */
  private async shoot(page: Page, check: CheckContext, file: string, fullPage = false): Promise<void> {
    const path = join(this.out, file)
    await page.screenshot({ path, fullPage, timeout: 30000 })
    check.report.screenshots.push(path)
  }

  /** Print one page's result to stderr:  URL, problems, notes, counts, screenshots. */
  private print(report: PageReport): void {
    const lines = [`\n${report.ok ? "OK" : "FAILED"}  ${report.url}`]
    for (const text of report.problems) lines.push(`  PROBLEM:  ${text}`)
    for (const text of report.notes) lines.push(`  NOTE:  ${text}`)
    lines.push(`  counts:  ${JSON.stringify(report.counts)}`)
    lines.push(`  screenshots:  ${this.out}`)
    for (const path of report.screenshots) lines.push(`    ${basename(path)}`)
    console.error(lines.join("\n"))
  }
}

////////////////
// ## Types
////////////////

/** One page's result, as printed and in the JSON summary. */
export type PageReport = {
  /** path under `site/`, e.g. `components/ui-button.html` */
  page: string
  /** served URL, under `/ui/` */
  url: string
  /** no problems */
  ok: boolean
  /** each distinct problem once, `(xN)` when repeated */
  problems: string[]
  /** worth knowing, never fails */
  notes: string[]
  /** element counts, tab values, pane heights, contents entries, phone overflow ... */
  counts: Record<string, any>
  /** absolute PNG paths */
  screenshots: string[]
}

/** What the viewport steps share for one page. */
type CheckContext = {
  /** page file, absolute */
  file: string
  /** path under `site/`, `/`-separated */
  path: string
  /** file name without `.html`:  the screenshots' prefix */
  name: string
  /** filled in as the steps go */
  report: PageReport
  /** record a problem;  deduped by its first line */
  problem: (text: string) => void
  /** a load timed out waiting for definitions:  later loads wait less */
  unsettled: boolean
}

////////////////
// ## In-page probes
// Serialized into the page by `page.evaluate()`:  self-contained, no closures over this module.
////////////////

/**
 * Whether every `ui-*` / `spell-*` element in the light DOM is defined.
 * - any other undefined tag (a third party's) is none of our business:  it would never settle
 */
function allDefined() {
  return [...document.querySelectorAll(":not(:defined)")].every(
    (el) => !el.localName.startsWith("ui-") && !el.localName.startsWith("spell-")
  )
}

/**
 * Elements of ours across the light DOM and every open shadow root:  totals per tag, the undefined
 * (`ui-*` / `spell-*`), the defined `ui-*` with no shadow root.
 * - every `@spell-app/ui` element renders into an open shadow root (the docs' `check-spell.js` rule):  no light-DOM
 *   exceptions
 */
function inspectElements() {
  const tags: Record<string, number> = {}
  const undefinedTags: Record<string, number> = {}
  const unrendered: Record<string, number> = {}
  let total = 0
  walk(document)
  return { total, tags, undefined: undefinedTags, unrendered }

  /** Count every `ui-*` / `spell-*` element under `root`, then recurse into their shadow roots. */
  function walk(root: Document | ShadowRoot) {
    for (const el of root.querySelectorAll("*")) {
      const tag = el.localName
      if (el.shadowRoot) walk(el.shadowRoot)
      if (!tag.startsWith("ui-") && !tag.startsWith("spell-")) continue
      total++
      tags[tag] = (tags[tag] ?? 0) + 1
      if (!customElements.get(tag)) undefinedTags[tag] = (undefinedTags[tag] ?? 0) + 1
      else if (tag.startsWith("ui-") && !el.shadowRoot) unrendered[tag] = (unrendered[tag] ?? 0) + 1
    }
  }
}

/**
 * The page's `ui-tabs.site-tabs`:  how many, the first one's pane values, heights, and which is shown.
 * - shown:  `:state(selected)`;  a browser without custom states:  the panes with a height
 */
function tabsState() {
  const all = document.querySelectorAll("ui-tabs.site-tabs")
  const panes = all[0] ? [...all[0].querySelectorAll(":scope > ui-tab")] : []
  const values = panes.map((pane) => pane.getAttribute("value") ?? "")
  const heights = panes.map((pane) => Math.round(pane.getBoundingClientRect().height))
  let shown: string[]
  try {
    shown = values.filter((_, i) => panes[i]!.matches(":state(selected)"))
  } catch {
    shown = values.filter((_, i) => heights[i]! > 0)
  }
  return { count: all.length, values, heights, shown }
}

/** The `ui-docs-toc`, or null:  whether it has a box, and its entries (`ui-item` / `a` in its shadow root). */
function tocState() {
  const toc = document.querySelector("ui-docs-toc")
  if (!toc) return null
  const rect = toc.getBoundingClientRect()
  const style = getComputedStyle(toc)
  return {
    visible: rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden",
    entries: toc.shadowRoot?.querySelectorAll("ui-item, a").length ?? 0
  }
}

/**
 * Horizontal scroll, and the elements past the right edge:  the deepest (holding no other offender:  what to fix) and
 * the outermost (which region of the page), widest first, as `tag.class#id (right px)`.
 * - looks inside open shadow roots too (`host >> inner`);  an `<svg>`'s own shapes count as the `<svg>`
 * - NOTE:  measured against `documentElement.clientWidth`, NEVER `innerWidth`:  with `isMobile`, chromium widens the
 *   layout viewport to fit wide content, so `innerWidth` grows to `scrollWidth` and the overflow reads 0
 */
function overflowState() {
  const width = document.documentElement.clientWidth
  const overflow = document.documentElement.scrollWidth - width
  const offenders: { el: Element; right: number; label: string }[] = []
  const parents = new Set<Element>()
  walk(document, "")
  const found = new Set(offenders.map((offender) => offender.el))
  const deepest = offenders.filter((offender) => !parents.has(offender.el)).sort(widest)
  const outermost = offenders.filter((offender) => !hasOffendingAncestor(offender.el)).sort(widest)
  return {
    overflow,
    offenders: deepest.slice(0, 8).map((offender) => `${offender.label} (${offender.right}px)`),
    outermost: outermost.slice(0, 5).map((offender) => `${offender.label} (${offender.right}px)`)
  }

  /** Sort order:  furthest right first. */
  function widest(a: { right: number }, b: { right: number }) {
    return b.right - a.right
  }

  /** Collect the offenders under `root`;  `prefix` names the shadow host it's in. */
  function walk(root: Document | ShadowRoot, prefix: string) {
    for (const el of root.querySelectorAll("*")) {
      if (el instanceof SVGElement && el.localName !== "svg") continue
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.right > width + 1) {
        offenders.push({ el, right: Math.round(rect.right), label: prefix + describe(el) })
        markParents(el)
      }
      if (el.shadowRoot) walk(el.shadowRoot, `${prefix}${describe(el)} >> `)
    }
  }

  /** Whether an ancestor of `el`, across shadow boundaries, is an offender too. */
  function hasOffendingAncestor(el: Element) {
    let node: Node | null = el.parentNode
    while (node) {
      if (node instanceof ShadowRoot) node = node.host
      if (node instanceof Element && found.has(node)) return true
      node = node.parentNode
    }
    return false
  }

  /** Mark every ancestor of `el`, across shadow boundaries, as holding an offender. */
  function markParents(el: Element) {
    let node: Node | null = el.parentNode
    while (node) {
      if (node instanceof ShadowRoot) node = node.host
      if (node instanceof Element) parents.add(node)
      node = node.parentNode
    }
  }

  /** `tag.class.class#id`, at most two classes. */
  function describe(el: Element) {
    const classes = [...el.classList].slice(0, 2).map((name) => `.${name}`)
    return `${el.localName}${classes.join("")}${el.id ? `#${el.id}` : ""}`
  }
}

/**
 * Whether a `ui-flyout` / `ui-sidebar` is open:  `:state(open)`, an `open` / `visible` attribute, or its shadow
 * `<dialog>` open.
 */
function navState() {
  return [...document.querySelectorAll("ui-flyout, ui-sidebar")].some((el) => {
    try {
      if (el.matches(":state(open)")) return true
    } catch {
      // a browser without custom states:  the attributes
    }
    return el.hasAttribute("open") || el.hasAttribute("visible") || !!el.shadowRoot?.querySelector("dialog[open]")
  })
}

////////////////
// ## Command line
////////////////

/** Printed on bad arguments and `--help`. */
const USAGE = `usage:  yarn site:check <page...> | --all  [--out <dir>]
  page:  a path (absolute, from here, or from site/), a tag (ui-button), or a name (index)
  --all:  site/*.html + site/components/*.html, minus _-prefixed files
  --out:  screenshot folder (default ${SiteCheck.OUT})`

/** Whether `url` is the browser's own favicon request. */
function isFavicon(url: string): boolean {
  return url.endsWith("/favicon.ico")
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await SiteCheck.main()
