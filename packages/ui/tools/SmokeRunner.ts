/// <reference types="node" />

import { mkdirSync, writeFileSync } from "node:fs"
import { isAbsolute, join, relative } from "node:path"
import { chromium, type Browser } from "playwright"

import type { ImportMap, PageResult, SmokePage, SmokePageKind, SmokeResults } from "./tools.types.ts"
import { HostApp } from "./HostApp.ts"
import { StaticServer } from "./StaticServer.ts"

/**
 * Runs the import-map smoke pages in headless chromium, against the BUILT `dist/` and the vendored peers, and
 * writes `smoke-results.json`.
 * - ONE static server (`StaticServer`), no Vite dev server, mounting repo folders at their own names:
 *   - `/dist/`, `/vendor/` -- the library build and the vendored peers (`yarn vendor`)
 *   - `/tools/` -- host pages (`frameworks/*.html`), the compiled Solid host app, the extra pages
 *   - `/test/` -- `PerfRun.ts` and the translation dictionary, transpiled on the fly
 * - Every page gets ONE import map (`importMap`):  the vendored peers, `@spell-app/ui/...` => `/dist/...`;  the Solid
 *   host app resolves `solid-js` / `@solidjs/web` through it too, so it shares one copy with the components.
 * - Pages:  the four hosts (`vanilla`, `react`, `vue`, `solid`), the perf page when a `perfAdapter` is given, then
 *   `pages`.  Each page publishes `window.smokeResult` (`PageResult`).
 * - Offline except the framework CDNs:  requests to any other host are aborted and reported as errors.
 */
export class SmokeRunner {
  /** Framework host pages (`frameworks/<name>.html`), in run order. */
  static readonly HOSTS = ["vanilla", "react", "vue", "solid"] as const
  /** Hosts a page may reach besides the local server:  React from esm.sh, Vue from unpkg. */
  static readonly CDN_HOSTS = ["esm.sh", "unpkg.com"]
  /** Repo folders the server mounts, each at `/<folder>/`. */
  static readonly MOUNTS = ["dist", "vendor", "tools", "test"]

  readonly options: SmokeRunnerOptions

  constructor(options: SmokeRunnerOptions) {
    this.options = options
  }

  ////////////////
  // ## Run
  ////////////////

  /** Run every page, write `smoke-results.json`, print one line per page;  resolves with the results. */
  async run(): Promise<SmokeResults> {
    const server = await this.server()
    const origin = await server.listen(this.options.port ?? 0)
    const browser = await chromium.launch()
    const version = browser.version()
    const pages: SmokePage[] = []
    try {
      for (const [path, kind] of this.pagePaths()) {
        const page = await this.visit(browser, origin, path, kind)
        pages.push(page)
        const failed = Object.entries(page.checks).filter(([, value]) => value === false)
        console.log(
          `${page.ok ? "PASS" : "FAIL"} ${path} (${page.label})`,
          failed.length ? failed.map(([key]) => key) : "",
          page.errors.length ? page.errors : ""
        )
      }
    } finally {
      await browser.close()
      await server.close()
    }
    const results: SmokeResults = {
      package: this.options.name,
      date: new Date().toISOString().slice(0, 10),
      browser: `chromium ${version}`,
      pages
    }
    const folder = join(this.options.root, this.options.results)
    mkdirSync(folder, { recursive: true })
    writeFileSync(join(folder, "smoke-results.json"), `${JSON.stringify(results, null, 2)}\n`)
    return results
  }

  /** Serve the pages for a person:  prints each URL, runs until `Ctrl-C`, then stops cleanly. */
  async serve(port = 5199): Promise<void> {
    const server = await this.server()
    const origin = await server.listen(port)
    for (const [path] of this.pagePaths()) console.log(`${origin}${path}`)
    await server.untilInterrupted()
  }

  ////////////////
  // ## Pages
  ////////////////

  /** Served path and kind of every page, in run order. */
  private pagePaths(): [string, SmokePageKind][] {
    const paths: [string, SmokePageKind][] = SmokeRunner.HOSTS.map((host) => [`/tools/frameworks/${host}.html`, "host"])
    if (this.options.perfAdapter) paths.push(["/tools/frameworks/perf.html", "perf"])
    for (const page of this.options.pages ?? []) paths.push([`/${this.relative(page.path)}`, page.kind])
    return paths
  }

  /** Load one page and collect its `window.smokeResult`, console errors and warnings. */
  private async visit(browser: Browser, origin: string, path: string, kind: SmokePageKind): Promise<SmokePage> {
    const page = await browser.newPage()
    const errors: string[] = []
    const warnings: string[] = []
    page.on("pageerror", (error) => errors.push(`uncaught: ${error.message}`))
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text())
      if (message.type() === "warning") warnings.push(message.text())
    })
    await page.route("**/*", (route) => {
      const host = new URL(route.request().url()).hostname
      if (host === "127.0.0.1" || SmokeRunner.CDN_HOSTS.some((cdn) => host === cdn || host.endsWith(`.${cdn}`))) {
        return route.continue()
      }
      errors.push(`blocked (offline):  ${route.request().url()}`)
      return route.abort()
    })
    let result: PageResult
    try {
      await page.goto(`${origin}${path}`)
      await page.waitForFunction(() => "smokeResult" in window, null, { timeout: kind === "perf" ? 120_000 : 45_000 })
      result = await page.evaluate(() => (window as unknown as { smokeResult: PageResult }).smokeResult)
    } catch (error) {
      const text = await page.textContent("#result").catch(() => null)
      result = {
        ok: false,
        label: path,
        checks: { timeout: `${(error as Error).message.split("\n")[0]}`, result: text }
      }
    }
    const title = await page.title()
    await page.close()
    const ok = result.ok && !errors.some((error) => error.startsWith("uncaught") || error.startsWith("blocked"))
    return { ...result, ok, path, title, kind, errors, warnings }
  }

  ////////////////
  // ## Server
  ////////////////

  /** The static server with every mount and the import map. */
  private async server(): Promise<StaticServer> {
    await HostApp.ensure()
    const { root, importMap, perfAdapter } = this.options
    const imports: ImportMap["imports"] = { ...importMap.imports }
    if (perfAdapter) imports["@spell/ui-tools/perf-adapter"] = `/${this.relative(perfAdapter)}`
    return new StaticServer(
      Object.fromEntries(SmokeRunner.MOUNTS.map((folder) => [`/${folder}/`, join(root, folder)])),
      { imports }
    )
  }

  /** `path` relative to the root, forward slashes. */
  private relative(path: string): string {
    return (isAbsolute(path) ? relative(this.options.root, path) : path).split("\\").join("/")
  }
}

/** Constructor options of `SmokeRunner`. */
export type SmokeRunnerOptions = {
  /** display name, e.g. `@spell-app/ui` */
  name: string
  /** repo root, absolute */
  root: string
  /** where `smoke-results.json` goes, relative to `root` */
  results: string
  /**
   * Import map entries:  the vendored peers (`vendor/importmap.json`) and `@spell-app/ui`, `@spell-app/ui/ui-<family>` =>
   * `/dist/...`.
   */
  importMap: ImportMap
  /**
   * Module exporting `adapter: PerfAdapter` (e.g. `tools/smoke/perf-adapter.js`), relative to `root`;  mapped as
   * `@spell/ui-tools/perf-adapter` for the perf page.  Omit to skip the perf page.
   */
  perfAdapter?: string
  /** extra pages, relative to `root` (under a mounted folder), each publishing `window.smokeResult` */
  pages?: { path: string; kind: SmokePageKind }[]
  /** server port;  default any free one */
  port?: number
}
