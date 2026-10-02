/// <reference types="node" />

import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { isAbsolute, join } from "node:path"
import { gzipSync } from "node:zlib"
import { transform } from "esbuild"
import * as vite from "vite"
import type { InlineConfig, Plugin, PluginOption, Rolldown, UserConfig } from "vite"

import type {
  Bucket,
  ChunkSize,
  FamilyNeeds,
  MeasureChecks,
  MeasureResults,
  OwnKind,
  OwnSize,
  Scenario,
  ScenarioName,
  PackageConfig,
  SharedEntry,
  SharedSize,
  Size
} from "./tools.types.ts"
import { NodePackage } from "./NodePackage.ts"

/**
 * Bundle measurer of the package:  what each tier, family and page scenario costs, min and min+gz.
 * - Builds the library IN MEMORY (`write: false`) with the repo's Vite config, entries overridden to the shared
 *   entries (`core`, `forms`) + one per family + the `extra` ones (`api`), and attributes every emitted module to a
 *   bucket (`PackageConfig.groups`).
 * - Sizes:  esbuild `transform({ minify: true })`, then gzip level 9;  kB = 1000 bytes.  Each tier is minified
 *   and gzipped ON ITS OWN, as a page fetches them as separate files, so a scenario is a sum of tiers.
 * - Tiers:
 *   - `library` -- the peer set AS USED:  exactly the bindings `dist/` imports from each peer specifier, bundled
 *     ONCE and tree-shaken (it's external in the build);  what the scenarios add
 *   - `libraryFull` -- every export of the peer set (`peerEntry` bundled as is), for comparison
 *   - `shared[name]` -- each shared entry:  `core` (element core + foundation JS), e.g. `forms`
 *   - `own[family]` -- that family's classes + `ui-<name>.css` + vocabulary + native fallback
 *   - lazy chunks (`UIRuntime`, icon data) listed apart
 *   - `standalone` -- each family built ALONE with the library bundled, for comparison
 * - Scenarios add, per family, only the shared entries its chunk actually imports (`families`):  a page with a
 *   button pays for `core`, a page with a dropdown for `core` + `forms`.
 * - Also checks `dist/`'s structure (`MeasureChecks`):  every family imports core, no Rolldown runtime chunk, no
 *   shared-entry / library code elsewhere, nothing unattributed.
 * - `yarn measure`:  `await new BundleMeasure(PACKAGE).write()`, into `tools/results/measure-results.json`.
 * - Plugins that only matter for a real build (`vite:dts`, `spell-emit-icon-packs`) are dropped from the measured
 *   builds:  they'd write declaration files or copy 2,000 icon files per build.
 */
export class BundleMeasure {
  /** what the report says the numbers mean */
  static readonly UNITS = "bytes;  min = esbuild minify, gzip = gzip level 9 of min;  kB = 1000 bytes"

  /** plugins left out of the measured builds, by name */
  static readonly SKIPPED_PLUGINS = new Set(["vite:dts", "spell-emit-icon-packs"])

  /** id of Rolldown's runtime module (`__name`, `__exportAll` ...);  `RUNTIME_MODULE_ID` in its types */
  static readonly RUNTIME_MODULE = "\0rolldown/runtime.js"

  /** What Lightning CSS writes when it lowers `light-dark()` for an old target (`MeasureChecks.lightDarkLowered`). */
  static readonly LOWERED_LIGHT_DARK = "--lightningcss-light"

  readonly config: PackageConfig
  /** the Vite config file, loaded once */
  private fileConfig: Promise<UserConfig> | undefined

  constructor(config: PackageConfig) {
    this.config = config
  }

  ////////////////
  // ## Run
  ////////////////

  /** Measure, print a summary, write `measure-results.json` in the results folder;  resolves with the results. */
  async write(file = "measure-results.json"): Promise<MeasureResults> {
    const results = await this.measure()
    const folder = this.path(this.config.results)
    mkdirSync(folder, { recursive: true })
    writeFileSync(join(folder, file), `${JSON.stringify(results, null, 2)}\n`)
    const kB = (bytes: number) => (bytes / 1000).toFixed(2)
    const shared = Object.entries(results.shared ?? {}).map(([name, size]) => `${name} ${kB(size.gzip)}`)
    const full = results.libraryFull ? ` (full ${kB(results.libraryFull.gzip)})` : ""
    console.log(`${this.config.name}:  library ${kB(results.library.gzip)}${full}  ${shared.join("  ")} kB`)
    for (const [family, own] of Object.entries(results.own)) {
      console.log(`  own ${family} ${kB(own.gzip)} kB  (+ ${results.families?.[family]?.shared.join(" + ")})`)
    }
    for (const [name, scenario] of Object.entries(results.scenarios)) console.log(`  ${name}:  ${kB(scenario.gzip)} kB`)
    const failed = Object.entries(results.checks).filter(([, value]) => (value as string[]).length)
    for (const [check, ids] of failed) console.warn(`  CHECK ${check}:`, ids)
    return results
  }

  /** Build, bucket and size everything. */
  async measure(): Promise<MeasureResults> {
    const { config } = this
    const families = Object.keys(config.entries)
    const sharedEntries = this.sharedEntries()
    const output = await this.build(this.entries())
    const chunks = output.filter((item): item is Rolldown.OutputChunk => item.type === "chunk")
    const lazyFiles = BundleMeasure.lazyFiles(chunks)
    const sharedChunks = new Map<string, Rolldown.OutputChunk>()
    for (const { name } of sharedEntries) {
      const chunk = chunks.find((item) => item.isEntry && item.name === name)
      if (!chunk) throw new Error(`BundleMeasure:  the build emitted no \`${name}\` entry chunk`)
      sharedChunks.set(name, chunk)
    }
    const core = sharedChunks.get(sharedEntries[0]!.name)!

    const byBucket = new Map<Bucket, string[]>()
    const checks: MeasureChecks = {
      entriesMissingCore: [],
      runtimeChunks: [],
      coreOutsideCore: [],
      libraryBundled: [],
      lazyInEager: [],
      unattributed: [],
      peersMissing: [],
      lightDarkLowered: []
    }
    for (const chunk of chunks) {
      const lazy = lazyFiles.has(chunk.fileName)
      if (chunk !== core && BundleMeasure.RUNTIME_MODULE in chunk.modules) checks.runtimeChunks.push(chunk.fileName)
      if (chunk.code.includes(BundleMeasure.LOWERED_LIGHT_DARK)) checks.lightDarkLowered.push(chunk.fileName)
      for (const [id, module] of Object.entries(chunk.modules)) {
        const code = module.code ?? ""
        if (!code.trim()) continue
        const bucket = this.bucket(id)
        byBucket.set(bucket, [...(byBucket.get(bucket) ?? []), code])
        const shared = bucket.startsWith("shared:") ? sharedChunks.get(bucket.slice("shared:".length)) : undefined
        if (bucket.startsWith("shared:") && chunk !== shared) checks.coreOutsideCore.push(id)
        if (bucket === "library") checks.libraryBundled.push(id)
        if ((bucket === "runtime" || bucket === "icons" || bucket === "data") && !lazy) checks.lazyInEager.push(id)
        if (bucket === "other") checks.unattributed.push(id)
      }
    }
    for (const family of families) {
      const entry = chunks.find((chunk) => chunk.isEntry && chunk.name === family)
      if (!entry?.imports.includes(core.fileName)) checks.entriesMissingCore.push(family)
    }

    const size = (bucket: Bucket) => this.size(byBucket.get(bucket) ?? [])
    const own: Record<string, OwnSize> = {}
    for (const family of families) {
      const kinds = {} as Record<OwnKind, Size>
      const all: string[] = []
      for (const kind of ["classes", "css", "vocabulary", "fallback"] as const) {
        const code = byBucket.get(`own:${family}:${kind}`) ?? []
        all.push(...code)
        kinds[kind] = await this.size(code)
      }
      own[family] = { ...(await this.size(all)), ...kinds, modules: [] }
    }
    for (const chunk of chunks) {
      for (const id of Object.keys(chunk.modules)) {
        const match = /^own:([^:]+):/.exec(this.bucket(id))
        if (match && own[match[1]!]) own[match[1]!]!.modules.push(BundleMeasure.shortId(id))
      }
    }

    const peers = await this.library(BundleMeasure.importedBindings(chunks.map((chunk) => chunk.code)))
    const library = peers.used
    const files = new Set(chunks.map((chunk) => chunk.fileName))
    const external = new Set(chunks.flatMap((chunk) => chunk.imports).filter((specifier) => !files.has(specifier)))
    checks.peersMissing = [...external].filter((specifier) => !library.specifiers.includes(specifier)).sort()
    const shared: Record<string, SharedSize> = {}
    for (const { name, entry, description } of sharedEntries) {
      shared[name] = { ...(await size(`shared:${name}`)), entry, ...(description ? { description } : {}) }
    }
    const needs = this.families(chunks, sharedChunks, library, shared, own)
    const results: MeasureResults = {
      package: config.name,
      date: new Date().toISOString().slice(0, 10),
      units: BundleMeasure.UNITS,
      versions: this.versions(library.specifiers),
      library,
      libraryFull: peers.full,
      shared,
      own,
      families: needs,
      scenarios: this.scenarios(library, shared, own, needs),
      standalone: await this.standalone(),
      lazy: { runtime: await size("runtime"), icons: await size("icons"), data: await size("data") },
      extra: Object.fromEntries(
        await Promise.all(Object.keys(config.extra ?? {}).map(async (name) => [name, await size(`extra:${name}`)]))
      ),
      chunks: await Promise.all(
        chunks.map(async (chunk): Promise<ChunkSize> => ({
          file: chunk.fileName,
          lazy: lazyFiles.has(chunk.fileName),
          imports: chunk.imports,
          ...(await this.size([chunk.code]))
        }))
      ),
      checks
    }
    return results
  }

  ////////////////
  // ## Builds
  ////////////////

  /**
   * A build of the library, in memory, with exactly `entry` as its lib entries.
   * - The config file is loaded ONCE and passed with `configFile: false`:  passing the file plus inline overrides
   *   would `mergeConfig()` them, which UNIONS `lib.entry` objects instead of replacing them.
   * - `bundlePeers` drops `external`, for the standalone builds.
   */
  private async build(
    entry: Record<string, string>,
    bundlePeers = false
  ): Promise<(Rolldown.OutputChunk | Rolldown.OutputAsset)[]> {
    const { config } = this
    this.fileConfig ??= this.loadFileConfig()
    const file = await this.fileConfig
    const lib = typeof file.build?.lib === "object" ? file.build.lib : {}
    const inline = {
      ...file,
      plugins: BundleMeasure.measuredPlugins(file.plugins),
      root: config.root,
      configFile: false,
      logLevel: "silent",
      build: {
        ...file.build,
        write: false,
        lib: {
          ...lib,
          entry: Object.fromEntries(Object.entries(entry).map(([name, path]) => [name, this.path(path)])),
          formats: ["es"]
        },
        rolldownOptions: { ...file.build?.rolldownOptions, ...(bundlePeers ? { external: undefined } : {}) }
      }
    } satisfies InlineConfig
    const result = (await vite.build(inline)) as Rolldown.RolldownOutput | Rolldown.RolldownOutput[]
    return (Array.isArray(result) ? result[0]! : result).output
  }

  /** The Vite config file, as its default export resolves for `vite build`. */
  private async loadFileConfig(): Promise<UserConfig> {
    const { config } = this
    const file = this.path(config.configFile ?? "vite.config.ts")
    const loaded = await vite.loadConfigFromFile({ command: "build", mode: "production" }, file, config.root)
    if (!loaded) throw new Error(`BundleMeasure:  can't load ${file}`)
    return loaded.config
  }

  /** The measured build's entries:  the shared ones + one per family + the `extra` ones. */
  private entries(): Record<string, string> {
    const shared = this.sharedEntries().map(({ name, entry }) => [name, entry])
    return { ...Object.fromEntries(shared), ...this.config.entries, ...this.config.extra }
  }

  /** `config.shared`;  throws when empty. */
  sharedEntries(): SharedEntry[] {
    const { shared } = this.config
    if (!shared.length) throw new Error("BundleMeasure:  the package config needs `shared` entries")
    return shared
  }

  /** `config.groups(id)`, with `core` normalized to the first shared entry's bucket (`shared:core`). */
  private bucket(id: string): Bucket {
    const bucket = this.config.groups(id)
    return bucket === "core" ? `shared:${this.sharedEntries()[0]!.name}` : bucket
  }

  /**
   * STANDALONE cost:  each family built alone with the library BUNDLED (tree-shaken), eager chunks only -- what an
   * app bundling everything itself would ship -- for comparison.  Plus `all families` in one build.
   * - Each eager chunk is minified and gzipped on its own and summed, as a page fetches them.
   */
  private async standalone(): Promise<Record<string, Size>> {
    const sizes: Record<string, Size> = {}
    const builds: [string, Record<string, string>][] = [
      ...Object.entries(this.config.entries).map(([family, file]): [string, Record<string, string>] => [
        family,
        { [family]: file }
      ]),
      ["all families", this.config.entries]
    ]
    for (const [name, entry] of builds) {
      const chunks = (await this.build(entry, true)).filter(
        (item): item is Rolldown.OutputChunk => item.type === "chunk"
      )
      const lazy = BundleMeasure.lazyFiles(chunks)
      const eager = await Promise.all(
        chunks.filter((chunk) => !lazy.has(chunk.fileName)).map((chunk) => this.size([chunk.code]))
      )
      sizes[name] = eager.reduce((sum, size) => ({ min: sum.min + size.min, gzip: sum.gzip + size.gzip }), {
        min: 0,
        gzip: 0
      })
    }
    return sizes
  }

  /**
   * The peer set, twice:  `used` -- only `bindings` (what `dist/` imports), tree-shaken;  `full` -- `peerEntry`
   * as is, every export.  Both bundled once, nothing external, no config file (plain JS packages).
   * - `define` pins `process.env.NODE_ENV` to production, as an app bundler would.
   * - `dedupe` on every peer package, as `PeerVendor` does:  a linked peer would otherwise bring its own copy of
   *   the others.
   * - A specifier in `peerEntry` that `dist/` never imports costs nothing in `used`.
   */
  private async library(bindings: Record<string, string[]>): Promise<{
    used: Size & { specifiers: string[]; bindings: Record<string, string[]> }
    full: Size
  }> {
    const specifiers = BundleMeasure.specifiers(this.path(this.config.peerEntry))
    const used = Object.fromEntries(specifiers.filter((spec) => bindings[spec]).map((spec) => [spec, bindings[spec]!]))
    const { plugin, entry } = BundleMeasure.virtualEntries({ used: BundleMeasure.reexports(used) })
    return {
      used: { ...(await this.bundlePeers(specifiers, entry.used!, [plugin])), specifiers, bindings: used },
      full: await this.bundlePeers(specifiers, this.path(this.config.peerEntry))
    }
  }

  /** `entry` bundled with every peer package deduped, then sized (min + gzip). */
  private async bundlePeers(specifiers: string[], entry: string, plugins: Plugin[] = []): Promise<Size> {
    const { config } = this
    const result = (await vite.build({
      root: config.root,
      configFile: false,
      logLevel: "silent",
      plugins,
      resolve: { dedupe: [...new Set(specifiers.map((specifier) => BundleMeasure.packageOf(specifier)))] },
      define: { "process.env.NODE_ENV": JSON.stringify("production") },
      build: {
        write: false,
        minify: false,
        lib: { entry: { peers: entry }, formats: ["es"] },
        rolldownOptions: { preserveEntrySignatures: "allow-extension" }
      }
    } satisfies InlineConfig)) as Rolldown.RolldownOutput | Rolldown.RolldownOutput[]
    const code = (Array.isArray(result) ? result[0]! : result).output
      .filter((item): item is Rolldown.OutputChunk => item.type === "chunk")
      .map((chunk) => chunk.code)
    return this.size(code)
  }

  ////////////////
  // ## Sizes, scenarios
  ////////////////

  /** min + gzip of `code` joined into one file. */
  private async size(code: string[]): Promise<Size> {
    if (!code.length) return { min: 0, gzip: 0 }
    const minified = (await transform(code.join("\n"), { minify: true, format: "esm", loader: "js" })).code
    return { min: minified.length, gzip: gzipSync(minified, { level: 9 }).length }
  }

  /**
   * Per family:  the shared entries its chunk statically reaches (directly, or through a sibling family's chunk),
   * and the cost of a page with only that family.
   */
  private families(
    chunks: Rolldown.OutputChunk[],
    sharedChunks: Map<string, Rolldown.OutputChunk>,
    library: Size,
    shared: Record<string, SharedSize>,
    own: Record<string, OwnSize>
  ): Record<string, FamilyNeeds> {
    const needs: Record<string, FamilyNeeds> = {}
    for (const family of Object.keys(this.config.entries)) {
      const entry = chunks.find((chunk) => chunk.isEntry && chunk.name === family)
      const reached = entry ? BundleMeasure.staticClosure(chunks, [entry.fileName]) : new Set<string>()
      const names = [...sharedChunks].filter(([, chunk]) => reached.has(chunk.fileName)).map(([name]) => name)
      const page = library.gzip + names.reduce((sum, name) => sum + shared[name]!.gzip, 0) + (own[family]?.gzip ?? 0)
      needs[family] = { shared: names, page }
    }
    return needs
  }

  /**
   * The three scenarios, as sums of tiers;  shared entries only where a family in the scenario imports them.
   * - `page with one button` -- library + what `pageFamily` imports + its own
   * - `all families` -- library + every shared entry any family imports + every own
   * - `app already ships the library` -- the same without the library
   */
  private scenarios(
    library: Size,
    shared: Record<string, SharedSize>,
    own: Record<string, OwnSize>,
    needs: Record<string, FamilyNeeds>
  ): Record<ScenarioName, Scenario> {
    const page = this.config.pageFamily ?? "ui-button"
    const families = Object.keys(own)
    const sum = (parts: string[]) =>
      parts.reduce((total, part) => {
        if (part === "library") return total + library.gzip
        if (part.startsWith("own:")) return total + (own[part.slice("own:".length)]?.gzip ?? 0)
        return total + (shared[part]?.gzip ?? 0)
      }, 0)
    const scenario = (parts: string[]): Scenario => ({ parts, gzip: sum(parts) })
    const used = new Set(families.flatMap((family) => needs[family]?.shared ?? []))
    const allShared = Object.keys(shared).filter((name) => used.has(name))
    const allOwn = families.map((family) => `own:${family}`)
    return {
      "page with one button": scenario(["library", ...(needs[page]?.shared ?? []), `own:${page}`]),
      "all families": scenario(["library", ...allShared, ...allOwn]),
      "app already ships the library": scenario([...allShared, ...allOwn])
    }
  }

  /** Installed version of each peer package (from `node_modules` at or above the root), plus the measuring toolchain. */
  private versions(specifiers: string[]): Record<string, string> {
    const packages = new Set(specifiers.map((specifier) => BundleMeasure.packageOf(specifier)))
    const versions: Record<string, string> = {}
    for (const name of packages) {
      const version = NodePackage.version(name, this.config.root)
      if (version) versions[name] = version
    }
    versions.vite = vite.version
    return versions
  }

  /** `file` resolved against the root. */
  private path(file: string): string {
    return isAbsolute(file) ? file : join(this.config.root, file)
  }

  ////////////////
  // ## Static helpers
  ////////////////

  /** `plugins` flattened, without the ones a measured build skips (`SKIPPED_PLUGINS`). */
  static measuredPlugins(plugins: PluginOption[] | undefined): PluginOption[] {
    const flat = (plugins ?? []).flat(Infinity as 1) as PluginOption[]
    return flat.filter((plugin) => !(plugin && "name" in plugin && BundleMeasure.SKIPPED_PLUGINS.has(plugin.name)))
  }

  /** Peer specifiers `peerEntry` re-exports (`export * as x from "<spec>"`), in file order. */
  static specifiers(peerEntry: string): string[] {
    const text = readFileSync(peerEntry, "utf8")
    return [...text.matchAll(/^export \* as \w+ from "([^"]+)"/gm)].map((match) => match[1]!)
  }

  /**
   * Bindings each module in `code` imports (or re-exports) from a BARE specifier, merged and sorted:
   * `import { a as x, b } from "solid-js"` => `{ "solid-js": ["a", "b"] }`.
   * - A namespace (`import * as x`, `export *`) => `"*"`;  a default import => `"default"`.
   * - Reads the emitted ES module statements (Rolldown prints plain `import ... from "..."`);  relative and
   *   absolute URLs (sibling chunks) are skipped, as are bare side-effect imports (`import "x"`:  no bindings).
   */
  static importedBindings(code: string[]): Record<string, string[]> {
    const found = new Map<string, Set<string>>()
    const pattern = /(?:^|[;\n}])\s*(import|export)\s*([^"';]*?)\s*from\s*["']([^"']+)["']/g
    for (const text of code) {
      for (const [, , clause, specifier] of text.matchAll(pattern)) {
        if (/^[./]|^[a-z]+:/.test(specifier!)) continue
        const names = found.get(specifier!) ?? new Set<string>()
        found.set(specifier!, names)
        if (clause!.includes("*")) names.add("*")
        const braces = /\{([^}]*)\}/.exec(clause!)?.[1]
        for (const item of braces?.split(",") ?? []) if (item.trim()) names.add(item.trim().split(/\s+/)[0]!)
        if (/^[\w$]+\s*(,|$)/.test(clause!.trim())) names.add("default")
      }
    }
    return Object.fromEntries(
      [...found].sort(([a], [b]) => a.localeCompare(b)).map(([spec, names]) => [spec, [...names].sort()])
    )
  }

  /**
   * One module re-exporting `bindings` of every specifier under unique names (`p0_0` ...), so a bundle keeps
   * exactly those;  a `"*"` specifier is re-exported whole (`export * as p0`).
   */
  static reexports(bindings: Record<string, string[]>): string {
    return Object.entries(bindings)
      .map(([specifier, names], index) => {
        const from = JSON.stringify(specifier)
        if (names.includes("*")) return `export * as p${index} from ${from}`
        return `export { ${names.map((name, i) => `${name} as p${index}_${i}`).join(", ")} } from ${from}`
      })
      .join("\n")
  }

  /**
   * Lib entries whose SOURCE is inline, since a lib entry must be a module id:  a plugin serving `sources[name]`,
   * and the matching `lib.entry` map (`name` => virtual id).
   * - NOTE: lib mode resolves entries against `root` first, so the marker is searched, not matched as a prefix.
   */
  static virtualEntries(sources: Record<string, string>): { plugin: Plugin; entry: Record<string, string> } {
    const plugin: Plugin = {
      name: "spell-virtual-entries",
      resolveId: (id) => (id.includes(VIRTUAL) ? `\0${id.slice(id.indexOf(VIRTUAL))}` : undefined),
      load: (id) => (id.startsWith(`\0${VIRTUAL}`) ? sources[id.slice(VIRTUAL.length + 1)] : undefined)
    }
    return { plugin, entry: Object.fromEntries(Object.keys(sources).map((name) => [name, `${VIRTUAL}${name}`])) }
  }

  /** npm package of a specifier:  `solid-js/web` => `solid-js`, `@solidjs/web` => `@solidjs/web`. */
  static packageOf(specifier: string): string {
    const parts = specifier.split("/")
    return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]!
  }

  /** Chunks only reachable through dynamic `import()`:  everything outside the entries' static closure. */
  static lazyFiles(chunks: Rolldown.OutputChunk[]): Set<string> {
    const entries = chunks.filter((chunk) => chunk.isEntry).map((chunk) => chunk.fileName)
    const eager = BundleMeasure.staticClosure(chunks, entries)
    return new Set(chunks.map((chunk) => chunk.fileName).filter((file) => !eager.has(file)))
  }

  /** Files of `start` and every chunk they statically import, transitively (external specifiers left out). */
  static staticClosure(chunks: Rolldown.OutputChunk[], start: string[]): Set<string> {
    const byName = new Map(chunks.map((chunk) => [chunk.fileName, chunk]))
    const reached = new Set<string>()
    for (const file of start) visit(file)
    return reached

    /** Mark `file` and its static imports reached. */
    function visit(file: string) {
      if (reached.has(file) || !byName.has(file)) return
      reached.add(file)
      for (const imported of byName.get(file)!.imports) visit(imported)
    }
  }

  /** Module id without the repo prefix, for the JSON. */
  static shortId(id: string): string {
    return id.replace(/^.*?\/(src|packages)\//, "$1/").split("?")[0]!
  }
}

/** Prefix of `BundleMeasure.virtualEntries()` module ids. */
const VIRTUAL = "spell-virtual:"
