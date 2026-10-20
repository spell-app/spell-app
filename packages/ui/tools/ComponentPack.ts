import { spawnSync } from "node:child_process"
import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { basename, dirname, join, relative, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

import { RootCatalog, type RootCatalogEntry } from "./RootCatalog.ts"
import { Terminal } from "./Terminal.ts"
import {
  ComponentPackError,
  type ComponentPackBuild,
  type ComponentPackCheck,
  type ComponentPackStale
} from "./tools.types.ts"

/****************
 * ### `ComponentPack`
 * A COMPONENT PACK:  another package's custom elements, which a page loads on demand through `<ui-root>`
 * ("Component packs" in `packages/ui/AGENTS.md`);  and its build, from its sources, into its generated folder,
 * `components/__pack/`:
 * - `<pack>.catalog.ts`:  tag => family folder + skeleton, read from every vocabulary (`<Name>.en.ts`) in
 *   `components/` by `RootCatalog` (as `yarn gen:root` builds `UIRoot.catalog.ts`);
 *   its second line records the sources' hash (`hash()`), which `check()` compares
 * - `<pack>.entry.ts`:  `SpellUI.registerPack({ name, prefix, catalog, define })`, `define()` importing every family
 *   barrel (`import()`:  inlined in the script, but run only when called;  it returns that promise)
 * - `<pack>.pack.js`:  the entry built by Vite as ONE classic script (an IIFE), minified,
 *   on Spell UI's `baseConfig()` (decorators BEFORE Solid, Solid's JSX, Lightning CSS),
 *   with every `PACK_MODULES` specifier left external and read from `globalThis.SpellUI.packModules[<specifier>]`:
 *   the page's one Solid, one spell-element and one Spell UI core
 *   - its banner records the same hash
 * - then its set's docs data, `docs/__data/` (`buildSiteData()`)
 * - A pack is a package whose `package.json` has `"spellPack": { "prefix" }` (`read()`).
 * - Run by `spell-ui-pack build | check` (`bin/spell-ui-pack.mjs`), from any repo that links Spell UI in:
 *   spell-epic and the brand build theirs with it.  spell-app's `spell dev pack` calls it too.
 * - Node built-ins, `RootCatalog` and (only while building) Vite.
 * - Its generated files still name `spell dev pack build <pack>`, the command that made them first:
 *   the packs come out byte for byte as before this tool moved here (epic `repo-split` P5).
 ****************/
export class ComponentPack {
  /** its name, e.g. `epics`:  its files' (`epics.pack.js`) and `$/<name>`'s */
  readonly name: string
  /** every tag's, e.g. `epic-` */
  readonly prefix: string
  /** the folder of its `package.json`, absolute:  its yarn scripts run there */
  readonly folder: string
  /** the folder of its `components/` and `docs/`, absolute */
  readonly dir: string
  /** the folder `$/<name>` names, absolute */
  readonly src: string

  constructor({ name, prefix, folder, dir = folder, src = join(dir, "src") }: ComponentPackProps) {
    this.name = name
    this.prefix = prefix
    this.folder = folder
    this.dir = dir
    this.src = src
  }

  /**
   * The pack whose `package.json` is in `folder`, from its `"spellPack"`:
   * - `prefix`, required;  `name`, by default the folder's name
   * - `dir`:  the folder holding its `components/` and `docs/`, relative to `folder`, and what `$/<name>` names
   *   (no `src/` inside it):  a repo that IS one pack (spell-epic:
   *   `"spellPack": { "name": "epics", "prefix": "epic-", "dir": "src" }`, epic `epic-eject` J14)
   * - without `dir`:  `components/` and `docs/` in `folder`, `$/<name>` its `src/` (the brand)
   * - Throws `ComponentPackError` when `folder` has no `package.json` naming a pack.
   */
  static read(_folder: string): ComponentPack {
    const folder = resolve(_folder)
    const { spellPack } = ComponentPack.packageJson(folder)
    if (typeof spellPack?.prefix !== "string") {
      throw new ComponentPackError(
        `ComponentPack.read():  ${join(folder, "package.json")} has no "spellPack": { "prefix" }, so it isn't a ` +
          'component pack;  add one, e.g. `"spellPack": { "prefix": "my-" }`'
      )
    }
    const name = typeof spellPack.name === "string" ? spellPack.name : basename(folder)
    if (typeof spellPack.dir !== "string") return new ComponentPack({ name, prefix: spellPack.prefix, folder })
    const dir = join(folder, spellPack.dir)
    return new ComponentPack({ name, prefix: spellPack.prefix, folder, dir, src: dir })
  }

  /**
   * The prefix of the pack in folder `folder`, from its `package.json`'s `spellPack`;  `undefined` when it isn't one.
   * - NEVER throws:  no file, or bad JSON, is "not a pack".
   */
  static prefixOf(folder: string): string | undefined {
    const { spellPack } = ComponentPack.packageJson(folder)
    return typeof spellPack?.prefix === "string" ? spellPack.prefix : undefined
  }

  /**
   * `spell-ui-pack build | check [<folder>]`:  build pack `<folder>` (default the current folder), or say whether
   * it's current.  Returns the exit code:  0 built or current, 1 stale or failed, 2 bad arguments.
   * - Prints through `Terminal`:  what it wrote, or each stale file and the command that fixes it.
   * - Paths are printed relative to the current folder.
   */
  static async main(argv: string[]): Promise<number> {
    const [verb, folder = ".", ...extra] = argv
    if ((verb !== "build" && verb !== "check") || extra.length) {
      Terminal.err(USAGE)
      return 2
    }
    try {
      const pack = ComponentPack.read(folder)
      const shown = (file: string) => relative(process.cwd(), file) || "."
      if (verb === "build") {
        const report = await pack.build()
        Terminal.out(
          [
            `built ${report.pack}:  ${report.tags.length} tags, sources ${report.hash}`,
            ...report.files.map(shown)
          ].join("\n  ")
        )
        return 0
      }
      const { stale } = await pack.check()
      Terminal.out(
        [
          `${pack.name}:  ${stale.length ? "STALE" : "current"}`,
          ...stale.map((it) => `${shown(it.file)}:  ${it.reason}`)
        ].join("\n  ")
      )
      if (stale.length) Terminal.out(`fix:  spell-ui-pack build ${shown(pack.folder)}`)
      return stale.length ? 1 : 0
    } catch (error) {
      if (!(error instanceof ComponentPackError)) throw error
      Terminal.err(error.message)
      return 1
    }
  }

  /**
   * Build the pack:  its generated files (`files`), then its set's docs data (`buildSiteData()`).
   * - Throws `ComponentPackError` for a tag without the pack's prefix, an import of Spell UI or Solid the page can't
   *   share, or a docs data builder that fails.
   */
  async build(): Promise<ComponentPackBuild> {
    const hash = this.hash()
    const catalog = await this.catalog()
    const { files } = this
    mkdirSync(join(this.dir, PACK_FOLDER), { recursive: true })
    writeFileSync(files.catalog, this.catalogSource(catalog, hash))
    writeFileSync(files.entry, this.entrySource())
    const written = await this.bundle(hash)
    const data = this.buildSiteData() ? [join(this.dir, DOCS_DATA_FOLDER)] : []
    return {
      pack: this.name,
      files: [files.catalog, files.entry, ...written, ...data],
      tags: Object.keys(catalog).sort(),
      hash
    }
  }

  /**
   * Whether the pack's generated files are CURRENT, built from its sources as they are now.
   * - `stale` names each one that isn't, and why;  none means current.
   * - The catalog:  its recorded hash is the sources' (`hash()`),
   *   and its text is what a build writes now (so a hand edit shows too)
   * - The entry:  its text;  the script:  its banner's hash
   * - And the set's docs data:  its builder's `--check` (`buildSiteData()`)
   * - Doesn't build:  fast enough for every `yarn test` (a pack's own test runs it)
   */
  async check(): Promise<ComponentPackCheck> {
    const hash = this.hash()
    const { files } = this
    const stale: ComponentPackStale[] = []
    const add = (file: string, reason: string) => stale.push({ file, reason })
    const catalog = ComponentPack.readText(files.catalog)
    if (catalog === undefined) add(files.catalog, "missing")
    else if (ComponentPack.recordedHash(catalog) !== hash) add(files.catalog, "built from older sources")
    else if (catalog !== this.catalogSource(await this.catalog(), hash)) {
      add(files.catalog, "not what a build writes (edited by hand?)")
    }
    const entry = ComponentPack.readText(files.entry)
    if (entry === undefined) add(files.entry, "missing")
    else if (entry !== this.entrySource()) add(files.entry, "not what a build writes")
    const script = ComponentPack.readText(files.script)
    if (script === undefined) add(files.script, "missing")
    else if (ComponentPack.recordedHash(script) !== hash) add(files.script, "built from older sources")
    if (this.hasSiteData && !this.buildSiteData({ check: true })) {
      add(join(this.dir, DOCS_DATA_FOLDER), `not what \`yarn ${SITE_DATA_SCRIPT}\` writes now`)
    }
    return { pack: this.name, hash, stale }
  }

  /**
   * Write the set's docs data, `docs/__data/` (`components.json5`, `search.json5` ...), with the pack's OWN data
   * builder:  its `package.json`'s `site:data` script, run in its folder (epic `people-and-orgs` P18).
   * - One builder per set, since each reads its elements its own way:
   *   - Epic UI's from the pack's definitions
   *   - the brand's through Spell UI's `SiteDataBuilder`
   * - `check`:  runs it with `--check`, writing nothing;  `false` when the data is stale.
   * - `false` when there's no builder (`hasSiteData`):  nothing written, and nothing to check.
   * - Throws `ComponentPackError` when the builder fails (not just stale).
   */
  buildSiteData({ check = false } = {}): boolean {
    if (!this.hasSiteData) return false
    const run = spawnSync("yarn", [SITE_DATA_SCRIPT, ...(check ? ["--check"] : [])], {
      cwd: this.folder,
      encoding: "utf8"
    })
    if (run.status === 0) return true
    if (check && run.status === 1) return false
    throw new ComponentPackError(
      `pack '${this.name}':  \`yarn ${SITE_DATA_SCRIPT}\` failed (in ${this.folder}):\n${run.stdout}${run.stderr}`
    )
  }

  /** Whether the pack has a docs set to build data for:  a `site:data` script (`buildSiteData()`). */
  get hasSiteData(): boolean {
    return Boolean(ComponentPack.packageJson(this.folder).scripts?.[SITE_DATA_SCRIPT])
  }

  /**
   * The hash of everything the pack's generated files are built from:  `sources()`, each with its path;
   * the pack's name and prefix;  `PACK_FORMAT`.  16 hex digits of sha-256.
   */
  hash(): string {
    const hash = createHash("sha256").update(`${PACK_FORMAT}\n${this.name}\n${this.prefix}\n`)
    for (const file of this.sources()) hash.update(`${relative(this.dir, file)}\n`).update(readFileSync(file))
    return hash.digest("hex").slice(0, 16)
  }

  /**
   * The files the pack's script is built from, absolute, sorted:  every file under `components/`, plus every file of
   * the pack's own `components/` or `src` they import, transitively.
   * - Not the rest of `src`:  node-only code there (a tool, its tests) never reaches the script,
   *   so editing it leaves the pack current.
   * - Imports are found by `IMPORT` (text, not a parse) and resolved as the build does:  relative, or the pack's own
   *   `$/<pack>` aliases (`aliases()`);  `?inline` and other queries dropped, extensions and `index` tried.
   * - Tests and snapshots never count.
   */
  sources(): string[] {
    const sources = new Set<string>()
    const queue = ComponentPack.filesUnder(join(this.dir, COMPONENTS_FOLDER))
    while (queue.length) {
      const file = queue.pop()!
      if (sources.has(file) || NOT_SOURCE.test(file) || !this.isSource(file)) continue
      sources.add(file)
      if (!SCRIPT.test(file)) continue
      for (const [, from, bare, dynamic] of readFileSync(file, "utf8").matchAll(IMPORT)) {
        const imported = this.resolveImport(file, from ?? bare ?? dynamic!)
        if (imported) queue.push(imported)
      }
    }
    return [...sources].sort()
  }

  /** The pack's family folders:  each `components/<tag>/` with an `index.ts` barrel, sorted. */
  families(): string[] {
    const components = join(this.dir, COMPONENTS_FOLDER)
    if (!existsSync(components)) return []
    return readdirSync(components, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && existsSync(join(components, entry.name, "index.ts")))
      .map((entry) => entry.name)
      .sort()
  }

  /** The pack's generated files, absolute. */
  get files() {
    const folder = join(this.dir, PACK_FOLDER)
    return {
      catalog: join(folder, `${this.name}.catalog.ts`),
      entry: join(folder, `${this.name}.entry.ts`),
      script: join(folder, `${this.name}.pack.js`)
    }
  }

  ////////////////
  // ## Generated files
  ////////////////

  /**
   * The pack's catalog, read from its vocabularies by `RootCatalog`.
   * - Throws `ComponentPackError` for a tag without the pack's prefix:  `<ui-root>` knows a pack's tags by it.
   */
  private async catalog(): Promise<Record<string, RootCatalogEntry>> {
    const components = join(this.dir, COMPONENTS_FOLDER)
    const catalog = existsSync(components) ? await RootCatalog.read([components]) : {}
    const strays = Object.keys(catalog).filter((tag) => !tag.startsWith(this.prefix))
    if (strays.length) {
      throw new ComponentPackError(
        `pack '${this.name}':  every tag must start '${this.prefix}', but these don't:  ${strays.join(", ")}`
      )
    }
    return catalog
  }

  /** The text of `<pack>.catalog.ts`. */
  private catalogSource(catalog: Record<string, RootCatalogEntry>, hash: string): string {
    const lines = RootCatalog.lines(catalog)
    return `/* GENERATED -- do not edit:  \`spell dev pack build ${this.name}\`, from every vocabulary, \`<Name>.en.ts\` */
// sources:  ${hash}

import type { RootCatalogEntry } from "$/ui"

/** Every tag of the \`${this.name}\` pack => what \`<ui-root>\` needs before its family loads. */
export const CATALOG: Readonly<Record<string, RootCatalogEntry>> = {
${lines.join(",\n")}${lines.length ? "\n" : ""}}
`
  }

  /** The text of `<pack>.entry.ts`. */
  private entrySource(): string {
    // the entry sits in `components/__pack/`, beside the families
    const imports = this.families().map((family) => `import("../${family}")`)
    const define = imports.length
      ? `() =>\n    Promise.all([\n      ${imports.join(",\n      ")}\n    ]).then(() => undefined)`
      : "() => Promise.resolve()"
    return `/* GENERATED -- do not edit:  \`spell dev pack build ${this.name}\` */
/**
 * The \`${this.name}\` pack's script:  registers with the page's Spell UI, which adds the catalog and calls \`define()\`.
 * - \`define()\` imports every family barrel, which defines its tags:  inlined in the script, run only when called.
 */
import { CATALOG } from "./${this.name}.catalog"

/** The docs bundle's global (\`spell-ui.entry.js\`). */
const { SpellUI } = globalThis as unknown as { SpellUI: { registerPack(pack: object): void } }

SpellUI.registerPack({
  name: ${JSON.stringify(this.name)},
  prefix: ${JSON.stringify(this.prefix)},
  catalog: CATALOG,
  define: ${define}
})
`
  }

  /**
   * Build the entry into `<pack>.pack.js`;  returns the files written.
   * - In this process, through Vite's API, on THIS Spell UI's `baseConfig()` (its `vite.config.ts`);
   *   `configFile: false`:  the pack's own `vite.config.ts` holds only lint / format settings.
   */
  private async bundle(hash: string): Promise<string[]> {
    const { build } = await import("vite-plus")
    // by URL, not a static import:  a type check of a caller (the `spell` CLI's) never follows it into the config
    const { baseConfig } = (await import(pathToFileURL(UI_VITE_CONFIG).href)) as {
      baseConfig: () => Record<string, any>
    }
    const base = baseConfig()
    const folder = join(this.dir, PACK_FOLDER)
    const { files } = this
    const result = await build({
      ...base,
      configFile: false,
      root: this.dir,
      logLevel: "warn",
      publicDir: false,
      resolve: { ...base.resolve, alias: this.aliases() },
      build: {
        outDir: folder,
        emptyOutDir: false,
        sourcemap: false,
        minify: true,
        target: "esnext",
        reportCompressedSize: false,
        lib: {
          entry: files.entry,
          formats: ["iife"],
          name: "SpellPack",
          fileName: () => `${this.name}.pack.js`
        },
        rolldownOptions: {
          external: (id: string) => {
            if (PACK_MODULES.includes(id)) return true
            if (SHARED_IMPORT.test(id)) {
              throw new ComponentPackError(
                `pack '${this.name}':  imports '${id}', which the page can't share;  import from ` +
                  `${PACK_MODULES.map((it) => `'${it}'`).join(", ")} only, or add it to PACK_MODULES ` +
                  "(Spell UI's tools/ComponentPack.ts) and Spell UI's packModules"
              )
            }
            return false
          },
          output: {
            // custom element class names are read by dev-time warnings and the manifest (see ui's `vite.config.ts`)
            keepNames: true,
            globals: (id: string) => `globalThis.SpellUI.packModules[${JSON.stringify(id)}]`
          }
        }
      }
    })
    // The banner goes on AFTER the build:  the minifier drops `output.banner`'s comment
    const banner = `/* GENERATED -- do not edit:  \`spell dev pack build ${this.name}\`.  sources:  ${hash} */`
    writeFileSync(files.script, `${banner}\n${readFileSync(files.script, "utf8")}`)
    const outputs = (Array.isArray(result) ? result : [result]).flatMap((it) => ("output" in it ? it.output : []))
    return outputs.map((chunk) => join(folder, chunk.fileName))
  }

  /** `$/<pack>` and `$/<pack>/components`, as the brand's Vite configs set its own:  any repo, any tsconfig. */
  private aliases() {
    const name = this.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    return [
      { find: new RegExp(`^\\$/${name}/components$`), replacement: join(this.dir, COMPONENTS_FOLDER, "index.ts") },
      { find: new RegExp(`^\\$/${name}/components/`), replacement: `${join(this.dir, COMPONENTS_FOLDER)}/` },
      { find: new RegExp(`^\\$/${name}$`), replacement: join(this.src, "index.ts") },
      { find: new RegExp(`^\\$/${name}/`), replacement: `${this.src}/` }
    ]
  }

  /**
   * The file import `specifier` in file `from` names, when it's the pack's own:  relative, or a `$/<pack>` alias.
   * - `undefined` for anything else (Spell UI, Solid, npm), or a path that isn't a file.
   */
  private resolveImport(from: string, specifier: string): string | undefined {
    const path = specifier.replace(/\?.*$/, "")
    const alias = this.aliases().find((it) => it.find.test(path))
    const base = path.startsWith(".") ? join(dirname(from), path) : alias && path.replace(alias.find, alias.replacement)
    if (base === undefined) return undefined
    const candidates = [base, ...RESOLVE_SUFFIXES.map((suffix) => base + suffix)]
    // TS's ESM style:  `./x.js` for `./x.ts`
    if (/\.[cm]?js$/.test(base)) candidates.push(base.replace(/js$/, "ts"), base.replace(/js$/, "tsx"))
    return candidates.find((it) => existsSync(it) && statSync(it).isFile())
  }

  /**
   * Whether `file` is under one of the folders the pack's script may be built from:
   * its elements (`components/`), and the code they share with node (`src`).
   */
  private isSource(file: string): boolean {
    return [join(this.dir, COMPONENTS_FOLDER), this.src].some((folder) => !relative(folder, file).startsWith(".."))
  }

  ////////////////
  // ## Files
  ////////////////

  /** The `package.json` in `folder`, as far as it's read here;  `{}` when there's none, or bad JSON.  NEVER throws. */
  private static packageJson(folder: string): PackPackageJson {
    try {
      return JSON.parse(readFileSync(join(folder, "package.json"), "utf8")) as PackPackageJson
    } catch {
      return {}
    }
  }

  /** The hash a generated file records, if any. */
  private static recordedHash(text: string): string | undefined {
    return HASH_RECORD.exec(text)?.[1]
  }

  /** `file`'s text, or `undefined` when there's none. */
  private static readText(file: string): string | undefined {
    return existsSync(file) ? readFileSync(file, "utf8") : undefined
  }

  /** Every file under `dir`, recursively, sorted by path;  none when it doesn't exist. */
  private static filesUnder(dir: string): string[] {
    if (!existsSync(dir)) return []
    const files: string[] = []
    for (const name of readdirSync(dir).sort()) {
      const path = join(dir, name)
      if (statSync(path).isDirectory()) files.push(...ComponentPack.filesUnder(path))
      else files.push(path)
    }
    return files
  }
}

/** Constructor props of `ComponentPack`;  `read()` makes them from a `package.json`. */
export type ComponentPackProps = {
  name: string
  prefix: string
  /** the folder of its `package.json`, absolute */
  folder: string
  /** the folder of its `components/` and `docs/`;  default `folder` */
  dir?: string
  /** the folder `$/<name>` names;  default `dir`'s `src/` */
  src?: string
}

/**
 * The modules a pack SHARES with the page instead of bundling:  the exact import specifiers its build leaves external.
 * - Each is read from `globalThis.SpellUI.packModules[<specifier>]`:  spell-epic's docs bundle's
 *   (`spell-ui.entry.js`), and the component sets' site build's (`site/_src/SitePacks.ts`).
 * - `$/spell-element`:  what the pack's elements are written on (`E.UIComponent` ...).
 *   The page's is Spell UI's core module, which carries all of it, so a page has one (`packModules`).
 * - Any other `$/ui...`, `$/spell-element/...`, Solid or `@spell-app/...` import fails the build:
 *   a second copy of spell-element, Spell UI's core or Solid on a page breaks them.
 * - Another one:  add it here AND to both `packModules`, AND to the guides' copy
 *   (spell-epic's `src/tools/bundle-experiment.ts`, which builds a guide's live elements the same way).
 * - REFACTOR: `$/spell-solid`, spell-element's name until epic `repo-split` P3, is still shared:  spell-epic's
 *   elements import it until spell-epic follows the rename (that epic's T6).  Delete it then, here and in both
 *   `packModules`.
 */
export const PACK_MODULES = ["solid-js", "@solidjs/web", "$/spell-element", "$/spell-solid", "$/ui/core", "$/ui/forms"]

/** A pack's element families' folder. */
const COMPONENTS_FOLDER = "components"

/**
 * A pack's generated folder, inside its families' folder (epic `people-and-orgs` P18, Q27 / Q33):
 * it's built from that folder and nothing else, so it sits with it;
 * `__` marks it as built, never a family (no tag starts with `_`).
 */
export const PACK_FOLDER = `${COMPONENTS_FOLDER}/__pack`

/** `spell-ui-pack`'s usage line. */
const USAGE = "usage:  spell-ui-pack build | check [<folder>]   (the pack's package;  default the current folder)"

/** Imports the page must share, never bundled:  spell-element, Spell UI, Solid, our other packages. */
// REFACTOR: `spell-solid` too, spell-element's old name, until spell-epic follows the rename (`PACK_MODULES`)
const SHARED_IMPORT = /^\$\/(ui|spell-element|spell-solid)(\/|$)|^solid-js(\/|$)|^@solidjs\/|^@spell-app\//

/** Version of what `build()` writes:  bump it when the generated files change shape, so every pack goes stale. */
const PACK_FORMAT = "spell-pack 1"

/** The set's docs data, in the pack's `dir`:  what its pages' side column, search and API tables read. */
const DOCS_DATA_FOLDER = "docs/__data"

/** The yarn script of a pack's package that writes `DOCS_DATA_FOLDER` (`buildSiteData()`);  takes `--check`. */
const SITE_DATA_SCRIPT = "site:data"

/** Files under them that never reach the pack:  tests, their snapshots, and the pack's own generated folder. */
const NOT_SOURCE = /\.test\.[cm]?[jt]sx?$|[\\/]__snapshots__[\\/]|[\\/]components[\\/]__pack[\\/]/

/** A file whose imports `sources()` follows. */
const SCRIPT = /\.[cm]?[jt]sx?$/

/**
 * An import's specifier:  `import ... from "x"` / `export ... from "x"` (1), `import "x"` (2), `import("x")` (3).
 * - Text, not a parse:  an import in a comment counts too, which only hashes one more file.
 */
const IMPORT =
  /\b(?:import|export)\s[^"'`;]*?\bfrom\s*["']([^"']+)["']|\bimport\s*["']([^"']+)["']|\bimport\s*\(\s*["']([^"']+)["']\s*\)/g

/** What an import's path may leave off, tried in order after the path itself. */
const RESOLVE_SUFFIXES = [".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.tsx", "/index.js"]

/** Where a generated file records the sources' hash:  `sources:  <hash>`. */
const HASH_RECORD = /\bsources: {2}([0-9a-f]{16})\b/

/** Spell UI's Vite config, absolute:  `baseConfig()`, what every pack's script is built on. */
const UI_VITE_CONFIG = fileURLToPath(new URL("../vite.config.ts", import.meta.url))

/** The part of a pack's `package.json` read here. */
type PackPackageJson = {
  spellPack?: { prefix?: unknown; name?: unknown; dir?: unknown }
  scripts?: Record<string, string>
}
