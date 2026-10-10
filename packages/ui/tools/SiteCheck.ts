/// <reference types="node" />

import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync, readdirSync, realpathSync, statSync } from "node:fs"
import { basename, isAbsolute, join, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"

import { chromium, type Browser, type BrowserContextOptions, type Page } from "playwright"

import { FOLDS_KEY } from "../site/_src/site.types.ts"
import { TocIndex } from "../src/docs-components/ui-docs-toc/TocIndex.ts"
import { SITE_PAGES, SiteCheckError } from "./tools.types.ts"
import { environment } from "./environment.ts"
import { Terminal } from "./Terminal.ts"

/****************
 * ### `SiteCheck`
 * Checks the plain-HTML Spell UI docs pages in headless chromium, served by this checkout's page server at `/ui/`.
 * - The pages:  `ui/*.html`, `ui/components/ui-<name>.html` (the shared pages, `SITE_PAGES`).
 * - Run:  `yarn site:check <page...>` (in `packages/ui`), or `yarn site:check --all`.
 *   - `--out <dir>` for the screenshots (default `tools/results/site-check/`, git-ignored).
 *   - `scripts/site-check.ts` is the command, which hands its arguments to `SiteCheck.main()`:
 *     a class file runs nothing when imported.
 * - A page is one of (`resolvePage()`):
 *   - a path:  absolute, from the cwd, or from `ui/`
 *   - a tag:  `ui-button` => `ui/components/ui-button.html`
 *   - a name:  `index` => `ui/index.html`
 * - Problems (`PageReport.problems`;  exit 1):
 *   - console errors, page errors, failed requests and responses >= 400 (the favicon too:  the page server has one)
 *   - `ui-*` / `spell-*` elements still undefined once settled;  defined `ui-*` with no shadow root
 *   - component pages (`components/ui-*.html`, not the index):
 *     - not exactly one `ui-tabs.site-tabs` with panes `examples`, `usage`, `api`, `theming` (`theming` optional)
 *     - a pane that isn't the shown one when loaded with its `#hash`, or shows under 50px
 *   - `ui-docs-toc`:  hidden or empty on desktop, visible on phone
 *   - sections (`yarn site:sections`):
 *     - an id that doesn't follow its nesting
 *     - a flat level 2 header left
 *     - a deep link to the first nested section that doesn't land
 *       (pane shown, unfolded, its title on its line below the stuck ones)
 *   - horizontal scroll at phone width, listing the elements past the edge, outermost and deepest:
 *     what a fixer needs
 *   - a nav button (`ui-button.site-menu-button`) whose flyout doesn't open
 * - Every page is checked, whatever failed before it.
 * - Problems go to stderr, with each page's URL, counts and screenshots;  a JSON summary is the last thing on stdout.
 * - Look at the screenshots too:  the checks can't see overlap, clipping or ugly wrapping.
 * - Throws `SiteCheckError` when it can't start:  no such page, or no page server serving the site (exit 2).
 * - Replaces the Astro site's `check` script.
 *   Model:  the docs' checker, `packages/docs/tools/check-spell.js`.
 * - Node only;  reads the site's `FOLDS_KEY` (`site/_src/site.types.ts`, pure data) and `TocIndex.slug()`.
 ****************/
export class SiteCheck {
  /** Page files to check, absolute. */
  readonly files: string[]

  /** Screenshot folder, absolute. */
  readonly out: string

  /** Page server origin, e.g. `http://127.0.0.1:54769`;  set by `run()`. */
  base = ""

  /** The one browser every page shares;  set by `run()`. */
  private browser?: Browser

  constructor({ files, out = DEFAULT_OUT }: SiteCheckProps) {
    this.files = files
    this.out = out
  }

  /**
   * `yarn site:check`:  parse the command line, check every page, print, and exit.
   * - SIDE EFFECT:  `process.exit()`:  0 all clean, 1 any problem, 2 bad arguments, no such page or no server
   */
  static async main(argv: string[] = process.argv.slice(2)): Promise<never> {
    // `yarn site:check` runs in `packages/ui`;  paths the person typed are relative to where they typed them
    const cwd = environment.invocationDir
    let parsed: ReturnType<typeof parseCommandLine>
    try {
      parsed = parseCommandLine(argv)
    } catch (error) {
      return exit(`${(error as Error).message}\n${USAGE}`, 2)
    }
    const { values, positionals } = parsed
    if (values.help) return exit(USAGE, 0)
    try {
      const names = values.all ? SiteCheck.allPages() : positionals.map((name) => SiteCheck.resolvePage(name, cwd))
      if (!names.length) return exit(USAGE, 2)
      const check = new SiteCheck({
        files: [...new Set(names)],
        out: values.out === undefined ? undefined : resolve(cwd, values.out)
      })
      const reports = await check.run()
      const ok = reports.every((report) => report.ok)
      Terminal.out(JSON.stringify({ ok, base: check.base, out: check.out, pages: reports }, null, 2))
      return exit("", ok ? 0 : 1)
    } catch (error) {
      if (!(error instanceof SiteCheckError)) throw error
      return exit(error.message, 2)
    }

    /** Print `message` (stdout for `--help`, else stderr) and exit with `code`. */
    function exit(message: string, code: number): never {
      if (message) (code ? Terminal.err : Terminal.out)(message)
      process.exit(code)
    }
  }

  /**
   * Find a page file from what was typed, first match wins:
   * - absolute path
   * - relative to `cwd`
   * - relative to `ui/`
   * - a tag, `ui-button` => `ui/components/ui-button.html`
   * - a name, `index` => `ui/index.html`
   * - a file under the shared repo's `ui/` (`../spell-app-dev/ui/...`) is the same page:  returned under `ui/`
   * - throws `SiteCheckError` when nothing matches, or the page isn't under `ui/` (the server wouldn't serve it)
   */
  static resolvePage(name: string, cwd: string): string {
    const html = name.endsWith(".html") ? name : `${name}.html`
    const candidates = isAbsolute(name)
      ? [name]
      : [
          resolve(cwd, name),
          join(SITE, name),
          ...(TAG_NAME.test(name) ? [join(SITE, "components", html)] : []),
          join(SITE, html)
        ]
    const file = candidates.find((path) => existsSync(path) && statSync(path).isFile())
    if (!file) {
      throw new SiteCheckError(`SiteCheck.resolvePage():  no page "${name}";  tried:\n  ${candidates.join("\n  ")}`)
    }
    const inside = relative(realpathSync(SITE), realpathSync(file))
    if (inside.startsWith("..") || isAbsolute(inside)) {
      throw new SiteCheckError(
        `SiteCheck.resolvePage():  ${file} is not under ${SITE};  the page server serves only that`
      )
    }
    return join(SITE, inside)
  }

  /** Every page:  `ui/*.html` and `ui/components/*.html`, minus `_`-prefixed ones (smoke pages, partials). */
  static allPages(): string[] {
    return [SITE, join(SITE, "components")].flatMap((folder) =>
      existsSync(folder)
        ? readdirSync(folder)
            .filter((file) => file.endsWith(".html") && !file.startsWith("_"))
            .sort()
            .map((file) => join(folder, file))
        : []
    )
  }

  /**
   * A page's screenshot prefix:  its file name (`ui-button`, `grammar`), or its path for a folder's `index.html`
   * (`components/index.html` => `components-index`), which would else overwrite the home page's shots.
   */
  static shotNameFor(path: string): string {
    const name = basename(path, ".html")
    return name === "index" && path.includes("/") ? path.replace(/\.html$/, "").replaceAll("/", "-") : name
  }

  /**
   * Find the page server, then check every page in one browser.
   * - SIDE EFFECT:  `spell dev server ensure` starts the server if it isn't running;  writes screenshots to `out`;
   *   prints each page's result to stderr
   * - throws `SiteCheckError` when there's no page server serving the site
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
   * - `spell dev server ensure` prints `{ base, port, ... }` as JSON, maybe after other lines:
   *   parsed from the first `{`
   * - throws `SiteCheckError` when there's no server, or it doesn't serve `/ui/_assets/site.js`
   */
  async ensureServer(): Promise<string> {
    let base: string
    try {
      const text = execFileSync(process.execPath, [SPELL, "dev", "server", "ensure"], {
        cwd: REPO,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        timeout: SERVER_START_MS
      })
      base = (JSON.parse(text.slice(text.indexOf("{"))) as { base: string }).base.replace(/\/$/, "")
    } catch (error) {
      throw new SiteCheckError(
        `SiteCheck.ensureServer():  can't start or find the page server (\`spell dev server ensure\` in ${REPO}):  ` +
          `${error};  start it by hand and read its output`
      )
    }
    const probe = `${base}/ui/_assets/site.js`
    const status = await fetch(probe, { signal: AbortSignal.timeout(PROBE_MS) }).then(
      (response) => response.status,
      (error: unknown) => String(error)
    )
    if (status !== 200) {
      throw new SiteCheckError(
        `SiteCheck.ensureServer():  the page server doesn't serve the site bundle (${probe} => ${status});  ` +
          "run `yarn site:build`"
      )
    }
    return base
  }

  /** Check one page at desktop, phone and dark;  NEVER throws:  a crash is one more problem. */
  async checkPage(file: string): Promise<PageReport> {
    const path = relative(SITE, file).split(sep).join("/")
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
    const context: CheckContext = {
      file,
      path,
      name: SiteCheck.shotNameFor(path),
      report,
      problem,
      isUnsettled: false
    }
    for (const step of [this.checkDesktop, this.checkSections, this.checkPhone, this.checkDark]) {
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
    const page = await this.open(check, DESKTOP, "desktop")
    try {
      await this.load(page, report.url, check)
      const elements = await page.evaluate(inspectElements)
      report.counts.elements = elements.total
      report.counts.tags = Object.keys(elements.tags).length
      for (const [tag, count] of Object.entries(elements.undefined)) problem(`${count} <${tag}> never defined`)
      for (const [tag, count] of Object.entries(elements.unrendered)) problem(`${count} <${tag}> without a shadow root`)

      const tabs = await page.evaluate(tabsState)
      // a component page (`components/ui-<tag>.html`:  a family's or a sub-tag's), NOT `components/index.html`
      const isComponent = check.path.startsWith("components/ui-")
      report.counts.tabs = tabs.values
      let values: string[] = []
      if (isComponent) {
        if (tabs.count !== 1) problem(`${tabs.count} ui-tabs.site-tabs (a component page needs exactly one)`)
        const required = TABS.filter((value) => !OPTIONAL_TABS.includes(value))
        if (tabs.values.join() !== TABS.join() && tabs.values.join() !== required.join())
          problem(`tab panes [${tabs.values.join(", ")}], expected [${TABS.join(", ")}]`)
        values = tabs.values.filter((value) => TABS.includes(value))
      } else if (tabs.count) values = tabs.values.filter(Boolean)

      if (!values.length) {
        await this.tocCheck(page, check, { where: "the page", isRequired: true })
        await this.shoot(page, check, `${name}-desk-top.png`)
        await this.shoot(page, check, `${name}-desk-full.png`, { fullPage: true })
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
        if (height <= MIN_PANE_HEIGHT) problem(`pane "${value}" is ${height}px tall:  no visible content`)
        await this.tocCheck(page, check, { where: `#${value}`, isRequired: value === values[0] })
        await this.shoot(page, check, `${name}-desk-${value}.png`)
        if (value === values[0]) await this.shoot(page, check, `${name}-desk-full.png`, { fullPage: true })
      }
    } finally {
      await page.context().close()
    }
  }

  /**
   * Sections (`yarn site:sections`):
   * ids that follow their nesting, no flat level 2 header left, and a deep link that lands.
   * - every page section's id is its parent section's id + `-` + the slug of its header (`TocIndex.slug()`),
   *   maybe + `-<n>` (made unique)
   *   - the parent at the top:  its pane's value;  a page without tabs:  nothing
   * - no `<ui-header level="2">` in a tab pane (outside examples), nor straight inside a page's article
   * - a deep link to the first NESTED section (else the first), with its top-level section saved folded, lands with:
   *   - that pane shown
   *   - every section around it unfolded
   *   - its title on its line below the stuck ones
   *     (or below it, on a page too short to scroll it that far:  scrolled to the bottom)
   * - screenshot `<page>-desk-deep.png`
   */
  private async checkSections(check: CheckContext): Promise<void> {
    const { report, problem, name } = check
    const page = await this.open(check, DESKTOP, "sections")
    try {
      await this.load(page, report.url, check)
      const state = await page.evaluate(sectionsState)
      report.counts.sections = state.sections.length
      for (const text of state.flat) problem(`flat <ui-header level="2"> (${text}):  \`yarn site:sections\` nests it`)
      for (const section of state.sections) {
        const prefix = section.parent ?? section.pane
        const base = prefix ? `${prefix}-${TocIndex.slug(section.text)}` : TocIndex.slug(section.text)
        const follows = section.id === base || new RegExp(`^${base}-\\d+$`).test(section.id)
        if (!follows)
          problem(`section #${section.id || "(no id)"} should be #${base}:  \`yarn site:sections\` fixes the ids`)
      }
      const target = state.sections.find((section) => section.parent) ?? state.sections[0]
      if (!target?.id) return
      // fold its top-level section first:  the landing must unfold it (and not save that)
      const outer = SiteCheck.outermostFor(state.sections, target)
      const key = `${FOLDS_KEY}${new URL(report.url).pathname}`
      await page.evaluate(([key, id]) => localStorage.setItem(key!, JSON.stringify({ [id!]: true })), [key, outer.id])
      await page.goto("about:blank")
      await this.load(page, `${report.url}#${target.id}`, check)
      await page.waitForTimeout(LAND_MS)
      const landed = await page.evaluate(landedState, target.id)
      report.counts.deepLink = { id: target.id, ...landed }
      if (!landed) problem(`deep link #${target.id}:  no such element once loaded`)
      else {
        if (!landed.isShown) problem(`deep link #${target.id}:  its pane isn't the shown one`)
        if (landed.isFolded) problem(`deep link #${target.id}:  still folded (it or a section around it)`)
        // a short page can't scroll its last sections up to the line:  below it, at the bottom, is as far as it goes
        const isClamped = landed.isAtBottom && landed.top > landed.line
        if (Math.abs(landed.top - landed.line) > 3 && !isClamped)
          problem(`deep link #${target.id}:  its title at ${landed.top}px, not on its line ${landed.line}px`)
      }
      await this.shoot(page, check, `${name}-desk-deep.png`)
      await page.evaluate((key) => localStorage.removeItem(key), key)
    } finally {
      await page.context().close()
    }
  }

  /**
   * Phone:  horizontal scroll (with its widest leaf offenders), the contents list hidden, the nav flyout opening.
   * Screenshots top, middle, full page and nav.
   */
  private async checkPhone(check: CheckContext): Promise<void> {
    const { report, problem, name } = check
    const page = await this.open(check, PHONE, "phone")
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
      if (toc?.isVisible) problem("ui-docs-toc visible at phone width (should be hidden)")
      await this.shoot(page, check, `${name}-phone-top.png`)
      await page.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - window.innerHeight) / 2))
      await page.waitForTimeout(SCROLL_SETTLE_MS)
      await this.shoot(page, check, `${name}-phone-mid.png`)
      await this.shoot(page, check, `${name}-phone-full.png`, { fullPage: true })

      await page.evaluate(() => window.scrollTo(0, 0))
      const menu = page.locator("ui-button.site-menu-button").first()
      if (!(await menu.count())) {
        report.notes.push("no ui-button.site-menu-button:  nav flyout not checked")
        return
      }
      let error = ""
      try {
        await menu.click({ timeout: CLICK_MS })
      } catch (thrown) {
        error = `:  ${String(thrown).split("\n")[0]}`
      }
      const isOpen = await page.waitForFunction(navState, undefined, { timeout: NAV_OPEN_MS }).then(
        () => true,
        () => false
      )
      if (isOpen) await page.waitForTimeout(NAV_SLIDE_MS)
      report.counts.navOpen = isOpen
      if (!isOpen) problem(`nav flyout didn't open from ui-button.site-menu-button${error}`)
      await this.shoot(page, check, `${name}-phone-nav.png`)
    } finally {
      await page.context().close()
    }
  }

  /** Dark scheme:  one desktop screenshot (errors still count). */
  private async checkDark(check: CheckContext): Promise<void> {
    const page = await this.open(check, { ...DESKTOP, colorScheme: "dark" }, "dark")
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
   * - ignores console "Failed to load resource" lines
   *   (the response / request listeners report those, with their URL)
   * - NOTE:  a favicon 404 is a problem too, since 2026-10-04:
   *   the page server answers `/favicon.ico` and injects its own icon links (`$/server`'s `WebServer`)
   * - `net::ERR_ABORTED` is a note:  a navigation (the next tab's fresh load) cancels what's still in flight
   */
  private async open(check: CheckContext, options: BrowserContextOptions, label: string): Promise<Page> {
    const context = await this.browser!.newContext(options)
    // HACK:  tsx compiles this file with esbuild `keepNames`,
    // which wraps the in-page probes' inner functions in `__name(...)`,
    // a helper the page doesn't have (as `hmr.e2e.ts`)
    await context.addInitScript("globalThis.__name = (fn) => fn")
    const page = await context.newPage()
    page.setDefaultTimeout(STEP_MS)
    const { problem, report } = check
    page.on("pageerror", (error) => problem(`page error (${label}):  ${error}`))
    page.on("console", (message) => {
      if (message.type() !== "error" || message.text().startsWith("Failed to load resource")) return
      problem(`console (${label}):  ${message.text()}`)
    })
    page.on("response", (response) => {
      if (response.status() >= 400) problem(`HTTP ${response.status()} (${label}):  ${response.url()}`)
    })
    page.on("requestfailed", (request) => {
      const text = `request failed (${label}):  ${request.url()}  ${request.failure()?.errorText ?? ""}`
      if (request.failure()?.errorText.includes("ERR_ABORTED")) report.notes.push(text)
      else problem(text)
    })
    return page
  }

  /**
   * Go to `url` and let it settle:
   * every `ui-*` / `spell-*` element defined (at most `SETTLE_MS`), the network idle, then `RUNTIME_SETTLE_MS` for
   * the runtime.
   * - a page that doesn't settle is NOT a problem here:  `inspectElements` reports what stayed undefined
   * - SIDE EFFECT:  sets `check.isUnsettled` when it doesn't, so later loads wait only `RESETTLE_MS`
   */
  private async load(page: Page, url: string, check: CheckContext): Promise<void> {
    await page.goto(url, { timeout: LOAD_MS })
    const timeout = check.isUnsettled ? RESETTLE_MS : SETTLE_MS
    const isSettled = await page.waitForFunction(allDefined, undefined, { timeout }).then(
      () => true,
      () => false
    )
    if (!isSettled) {
      check.isUnsettled = true
      check.report.notes.push(`${url}:  not every element defined after ${timeout / 1000}s`)
    }
    await page.waitForLoadState("networkidle", { timeout: NETWORK_IDLE_MS }).catch(() => {})
    await page.waitForTimeout(RUNTIME_SETTLE_MS)
  }

  /**
   * The contents list (`ui-docs-toc`), if the page has one:  visible on desktop while it has entries.
   * - `where` labels the problem;  `isRequired` makes zero entries a problem (the first pane), else a note.
   */
  private async tocCheck(page: Page, check: CheckContext, { where, isRequired }: TocCheckParams): Promise<void> {
    const toc = await page.evaluate(tocState)
    if (!toc) return
    const counts = (check.report.counts.toc ??= {})
    counts[where] = toc.entries
    // an EMPTY toc's rail is hidden on purpose (site.css:  the content takes its room, e.g. the API tab)
    if (!toc.isVisible && toc.entries) check.problem(`ui-docs-toc hidden on desktop (${where})`)
    if (!toc.entries) {
      if (isRequired) check.problem(`ui-docs-toc has no entries (${where})`)
      else check.report.notes.push(`ui-docs-toc has no entries (${where})`)
    }
  }

  /** Screenshot `page` to `out/<file>`:  the viewport, or the whole page;  listed in the report. */
  private async shoot(
    page: Page,
    check: CheckContext,
    file: string,
    { fullPage = false }: { fullPage?: boolean } = {}
  ): Promise<void> {
    const path = join(this.out, file)
    await page.screenshot({ path, fullPage, timeout: SCREENSHOT_MS })
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
    Terminal.err(lines.join("\n"))
  }

  /** The top-level section holding `section` (or `section` itself), from `sectionsState()`'s list. */
  private static outermostFor(sections: readonly SectionState[], section: SectionState): SectionState {
    let outer = section
    while (outer.parent) {
      const parent = sections.find((other) => other.id === outer.parent)
      if (!parent) break
      outer = parent
    }
    return outer
  }
}

/** Constructor props of `SiteCheck`. */
export type SiteCheckProps = {
  /** page files to check, absolute (`SiteCheck.resolvePage()`, `allPages()`) */
  files: string[]
  /** screenshot folder, absolute;  default `tools/results/site-check/` */
  out?: string
}

/**
 * One page's result, as printed and in the JSON summary.
 * - `ok` is the page's VERDICT, reported data, not an error union (WWOD §5):
 *   a check that can't START throws `SiteCheckError` instead.
 */
export type PageReport = {
  /** path under `ui/`, e.g. `components/ui-button.html` */
  page: string
  /** served URL, under `/ui/` */
  url: string
  /** no problems */
  ok: boolean
  /** each distinct problem once, `(xN)` when repeated */
  problems: string[]
  /** worth knowing, never fails */
  notes: string[]
  /** what the steps measured */
  counts: PageCounts
  /** absolute PNG paths */
  screenshots: string[]
}

/** What `SiteCheck`'s steps measured on one page (`PageReport.counts`);  each only once its step got that far. */
export type PageCounts = {
  /** `ui-*` / `spell-*` elements, light DOM and shadow roots */
  elements?: number
  /** distinct tags among them */
  tags?: number
  /** the site tabs' pane values */
  tabs?: string[]
  /** contents list entries, by where they were counted (`the page`, `#usage` ...) */
  toc?: Record<string, number>
  /** each pane's height when shown, px */
  paneHeights?: Record<string, number>
  /** page sections */
  sections?: number
  /** where the deep link landed (`landedState()`) */
  deepLink?: { id: string } & Partial<LandedState>
  /** horizontal scroll at phone width, px */
  phoneOverflow?: number
  /** the deepest elements past the edge */
  phoneOffenders?: string[]
  /** the outermost elements past the edge */
  phoneOutermost?: string[]
  /** the nav flyout opened */
  navOpen?: boolean
}

/** One page section, as `sectionsState()` reads it. */
type SectionState = {
  /** its id, `""` for none */
  id: string
  /** its title:  `header`, else its `slot="header"` child's text */
  text: string
  /** the id of the section it's in;  `undefined` at the top */
  parent?: string
  /** the value of the site tab pane it's in;  `undefined` on a page without tabs */
  pane?: string
}

/** Where a deep link landed, as `landedState()` reads it. */
type LandedState = {
  /** its title's top, px from the viewport's */
  top: number
  /** where its title should be:  below the stuck titles of the sections around it */
  line: number
  /** it, or a section around it, is still folded */
  isFolded: boolean
  /** its tab pane is the shown one (or it's in none) */
  isShown: boolean
  /** the page is scrolled to its bottom */
  isAtBottom: boolean
}

/** What the viewport steps share for one page. */
type CheckContext = {
  /** page file, absolute */
  file: string
  /** path under `ui/`, `/`-separated */
  path: string
  /** file name without `.html`:  the screenshots' prefix */
  name: string
  /** filled in as the steps go */
  report: PageReport
  /** record a problem;  deduped by its first line */
  problem: (text: string) => void
  /** a load timed out waiting for definitions:  later loads wait less */
  isUnsettled: boolean
}

/** `SiteCheck.tocCheck()`'s inputs. */
type TocCheckParams = {
  /** labels the problem:  `the page`, `#usage` */
  where: string
  /** zero entries is a problem (the first pane), else a note */
  isRequired: boolean
}

////////////////
// ## Command line
////////////////

/** `yarn site:check`'s flags (`SiteCheck.main()`);  throws a `TypeError` on an unknown one. */
function parseCommandLine(argv: string[]) {
  return parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      all: { type: "boolean" },
      out: { type: "string" },
      help: { type: "boolean", short: "h" }
    }
  })
}

////////////////
// ## Constants
////////////////

/** `packages/ui/`. */
const PACKAGE = fileURLToPath(new URL("..", import.meta.url))

/** The site's pages, the checkout's `ui/` (`SITE_PAGES`):  what the page server serves at `/ui/`. */
const SITE = join(PACKAGE, SITE_PAGES)

/** Repo root (of this worktree):  where `spell dev server ensure` runs. */
const REPO = resolve(PACKAGE, "..", "..")

/** This checkout's own `spell` CLI:  run with `node`, never the `spell` on `PATH` (maybe another checkout's). */
const SPELL = join(REPO, "packages", "cli", "bin", "spell.mjs")

/** Default screenshot folder;  `tools/results` is git-ignored. */
const DEFAULT_OUT = join(PACKAGE, "tools", "results", "site-check")

/** Printed on bad arguments and `--help`. */
const USAGE = `usage:  yarn site:check <page...> | --all  [--out <dir>]
  page:  a path (absolute, from here, or from ui/), a tag (ui-button), or a name (index)
  --all:  ui/*.html + ui/components/*.html, minus _-prefixed files
  --out:  screenshot folder (default ${DEFAULT_OUT})`

/** A name typed as a tag (`ui-button`):  its page is `components/<tag>.html`. */
const TAG_NAME = /^[a-z]+(-[a-z0-9]+)+$/

/**
 * Component pages' tab panes, in order.
 * - `theming` may be left out:  a page whose tag has no tokens of its own (`ui-meta`, styled by its owners)
 */
const TABS = ["examples", "usage", "api", "theming"]

/** Panes a component page may leave out (the last of `TABS`). */
const OPTIONAL_TABS = ["theming"]

/** Desktop viewport. */
const DESKTOP: BrowserContextOptions = { viewport: { width: 1440, height: 900 } }

/** Phone viewport:  an iPhone 14-ish, touch, retina. */
const PHONE: BrowserContextOptions = {
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2
}

/** Pane shorter than this counts as empty, px. */
const MIN_PANE_HEIGHT = 50

/** How long a page may take to define its elements;  past it, the undefined ones are reported, not waited on. */
const SETTLE_MS = 15000

/** The same page's later loads, once one didn't settle:  it won't settle now either, so don't wait it out again. */
const RESETTLE_MS = 3000

/**
 * How long a deep link may take to land after the page settles.
 * - A SLEEP, deliberately:  the landing scrolls after its own 400ms settle timer (`SiteSections`),
 *   and nothing on the page says it's done.
 *   900ms covers that and the scroll.
 */
const LAND_MS = 900

/**
 * After a load settles, for the runtime:
 * late work after the elements are defined (a reveal, a lazy family, the section folds restored).
 * - A SLEEP:  no one event says the page is done.
 *   `document.getAnimations()` doesn't see the shadow roots' motion
 *   (tried, 2026-10-06:  the nav flyout's slide went unseen).
 */
const RUNTIME_SETTLE_MS = 500

/** After scrolling the phone page halfway, for what scrolling starts (lazy images, sticky headers) to draw;  a SLEEP. */
const SCROLL_SETTLE_MS = 400

/** How long the nav flyout may take to report itself open after its button's click (`navState()`). */
const NAV_OPEN_MS = 3000

/** The nav flyout's slide-in, once it's open, so its screenshot shows it whole;  a SLEEP (no event ends it). */
const NAV_SLIDE_MS = 600

/** A page load (`goto()`). */
const LOAD_MS = 30000

/** The network going idle after a load:  past it, the checks go on (a long poll would never let it). */
const NETWORK_IDLE_MS = 10000

/** Every other Playwright step (a locator, an `evaluate()`). */
const STEP_MS = 20000

/** Clicking the nav button. */
const CLICK_MS = 3000

/** One screenshot (a full page can be tall). */
const SCREENSHOT_MS = 30000

/** `spell dev server ensure`, which may start the server. */
const SERVER_START_MS = 60000

/** Fetching the site bundle from the server, to see it's served. */
const PROBE_MS = 10000

////////////////
// ## In-page probes
// Serialized into the page by `page.evaluate()` / `waitForFunction()`:  self-contained, no closures over this module.
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
 * Elements of ours across the light DOM and every open shadow root:
 * totals per tag, the undefined (`ui-*` / `spell-*`), the defined `ui-*` with no shadow root.
 * - every `@spell-app/ui` element renders into an open shadow root (the docs' `check-spell.js` rule):
 *   no light-DOM exceptions
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

/**
 * The page's sections (every `ui-section` in `main` but the demos inside examples),
 * and the level 2 headers left flat:  any in a site tab pane outside an example, or straight inside a page's article.
 */
function sectionsState(): { sections: SectionState[]; flat: string[] } {
  const main = document.querySelector("main#main")
  const tabs = main?.querySelector("ui-tabs.site-tabs")
  const page = (element: Element) => !element.parentElement?.closest("ui-docs-example, template")
  const sections = [...(main?.querySelectorAll("ui-section") ?? [])].filter(page).map((section) => {
    const pane = section.closest("ui-tab")
    const slotted = section.querySelector(':scope > [slot="header"]')
    // `getAttribute()` is the platform's:  `null` when absent
    const paneValue = tabs && pane?.parentElement === tabs ? pane.getAttribute("value") : undefined
    return {
      id: section.id,
      text: (section.getAttribute("header") || slotted?.textContent || "").replace(/\s+/g, " ").trim(),
      parent: section.parentElement?.closest("ui-section")?.id,
      pane: paneValue ?? undefined
    }
  })
  const flat: string[] = []
  const roots = tabs
    ? [...tabs.querySelectorAll(":scope > ui-tab")]
    : [...(main?.querySelectorAll(".site-article") ?? [])]
  for (const root of roots) {
    const headers = root.querySelectorAll(tabs ? 'ui-header[level="2"]' : ':scope > ui-header[level="2"]')
    for (const header of [...headers].filter(page))
      flat.push(`${root.getAttribute("value") ?? "article"}:  ${header.textContent?.replace(/\s+/g, " ").trim()}`)
  }
  return { sections, flat }
}

/**
 * Where the section `id` landed;  `undefined` if there's no such element.
 * - its title's top (its sentinel's:  where it is unstuck)
 * - the line it should be on (its top-level section's `offset` + the titles of the sections around it)
 * - folded (it or one around it)
 * - its pane shown
 */
function landedState(id: string): LandedState | undefined {
  const target = document.getElementById(id)
  if (!target) return undefined
  const around: Element[] = []
  let section = target.parentElement?.closest("ui-section")
  while (section) {
    around.push(section)
    section = section.parentElement?.closest("ui-section")
  }
  let line = Number((around.at(-1) ?? target).getAttribute("offset") || 0)
  for (const section of around)
    line += section.shadowRoot?.querySelector('[part~="title"]')?.getBoundingClientRect().height ?? 0
  const pane = target.closest("ui-tab")
  let isShown = true
  try {
    isShown = !pane || pane.matches(":state(selected)")
  } catch {
    // a browser without custom states:  not checked
  }
  const box = target.shadowRoot?.querySelector(".sentinel") ?? target
  return {
    top: Math.round(box.getBoundingClientRect().top),
    line: Math.round(line),
    isFolded: [target, ...around].some((section) => section.hasAttribute("collapsed")),
    isShown,
    isAtBottom: scrollY >= document.documentElement.scrollHeight - innerHeight - 2
  }
}

/** The `ui-docs-toc`, or `undefined`:  whether it has a box, and its entries (`ui-item` / `a` in its shadow root). */
function tocState() {
  const toc = document.querySelector("ui-docs-toc")
  if (!toc) return undefined
  const rect = toc.getBoundingClientRect()
  const style = getComputedStyle(toc)
  return {
    isVisible: rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden",
    entries: toc.shadowRoot?.querySelectorAll("ui-item, a").length ?? 0
  }
}

/**
 * Horizontal scroll, and the elements past the right edge, widest first, as `tag.class#id (right px)`:
 * - the deepest (holding no other offender):  what to fix
 * - the outermost:  which region of the page
 *
 * - looks inside open shadow roots too (`host >> inner`);  an `<svg>`'s own shapes count as the `<svg>`
 * - NOTE:  measured against `documentElement.clientWidth`, NEVER `innerWidth`:
 *   with `isMobile`, chromium widens the layout viewport to fit wide content,
 *   so `innerWidth` grows to `scrollWidth` and the overflow reads 0
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
 * Whether a `ui-flyout` / `ui-sidebar` is shown, by its `hidden`:
 * the shared `visible` / `hidden`, one fact, kept in the `hidden` attribute.
 */
function navState() {
  return [...document.querySelectorAll<HTMLElement>("ui-flyout, ui-sidebar")].some((el) => !el.hidden)
}
