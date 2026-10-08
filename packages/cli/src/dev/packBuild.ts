import { createHash } from "crypto"
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs"
import { dirname, join, relative } from "path"
import { pathToFileURL } from "url"

// Import directly, not through `$/cli`:  the barrel loads spell, and `spell dev` must start fast (`devMain.ts`)
import { CliError, EXIT } from "$/cli/cli.types"
import type { PackBuildReport, PackCheckReport, PackInfo } from "$/cli/dev/dev.types"
import { RootCatalog } from "$/ui/tools/RootCatalog"

/**
 * `spell dev pack build <pack>`:  a component pack's generated files, in `packages/<pack>/pack/`, from its sources.
 * - `<pack>.catalog.ts`:  tag => family folder + skeleton, read from every vocabulary (`<Name>.en.ts`) in
 *   `components/` by Spell UI's own `RootCatalog` (as `yarn gen:root` builds `UIRoot.catalog.ts`);  its second line
 *   records the sources' hash (`packHash()`), which `checkPack()` compares
 * - `<pack>.entry.ts`:  `SpellUI.registerPack({ name, prefix, catalog, define })`, `define()` importing every family
 *   barrel (`import()`:  inlined in the script, but run only when called;  it returns that promise)
 * - `<pack>.pack.js`:  the entry built by Vite as ONE classic script (an IIFE), minified, on Spell UI's `baseConfig()`
 *   (decorators BEFORE Solid, Solid's JSX, Lightning CSS), with every `PACK_MODULES` specifier left external and read
 *   from `globalThis.SpellUI.packModules[<specifier>]`:  the page's one Solid and one Spell UI core.  Its banner
 *   records the same hash.
 * - Node built-ins, `RootCatalog` and (only while building) Vite:  no spell, so it runs on the lean `spell dev` entry.
 * - Throws `CliError` for a package that isn't a pack, a tag without the pack's prefix, or an import of Spell UI or
 *   Solid the page can't share.
 */
export async function buildPack(root: string, name: string): Promise<PackBuildReport> {
  const pack = readPack(root, name)
  const hash = packHash(pack)
  const catalog = await catalogFor(pack)
  const files = packFiles(pack)
  mkdirSync(join(pack.dir, PACK_FOLDER), { recursive: true })
  writeFileSync(files.catalog, catalogSource(pack, catalog, hash))
  writeFileSync(files.entry, entrySource(pack))
  const written = await bundle(root, pack, hash)
  return {
    pack: name,
    files: [files.catalog, files.entry, ...written].map((file) => relative(root, file)),
    tags: Object.keys(catalog).sort(),
    hash
  }
}

/**
 * `spell dev pack check [<pack>]`:  whether a pack's generated files are CURRENT -- built from its sources as they
 * are now.  `stale` names each one that isn't, and why;  none means current.
 * - The catalog:  its recorded hash is the sources' (`packHash()`), and its text is what a build writes now (so a
 *   hand edit shows too);  the entry:  its text;  the script:  its banner's hash
 * - Doesn't build:  fast enough for every `yarn test` (the pack's `src/pack.test.ts` runs it)
 */
export async function checkPack(root: string, name: string): Promise<PackCheckReport> {
  const pack = readPack(root, name)
  const hash = packHash(pack)
  const files = packFiles(pack)
  const stale: string[] = []
  const catalog = readText(files.catalog)
  if (catalog === undefined) stale.push(`${relative(root, files.catalog)}:  missing`)
  else if (recordedHash(catalog) !== hash) stale.push(`${relative(root, files.catalog)}:  built from older sources`)
  else if (catalog !== catalogSource(pack, await catalogFor(pack), hash)) {
    stale.push(`${relative(root, files.catalog)}:  not what a build writes (edited by hand?)`)
  }
  const entry = readText(files.entry)
  if (entry === undefined) stale.push(`${relative(root, files.entry)}:  missing`)
  else if (entry !== entrySource(pack)) stale.push(`${relative(root, files.entry)}:  not what a build writes`)
  const script = readText(files.script)
  if (script === undefined) stale.push(`${relative(root, files.script)}:  missing`)
  else if (recordedHash(script) !== hash) stale.push(`${relative(root, files.script)}:  built from older sources`)
  return { pack: name, hash, stale }
}

/**
 * Pack `name` in checkout `root`, from its `package.json`'s `"spellPack": { "prefix" }`.
 * - Throws `CliError` when there's no such package, or it isn't a pack.
 */
export function readPack(root: string, name: string): PackInfo {
  const dir = join(root, "packages", name)
  const prefix = packPrefix(dir)
  if (prefix === undefined) {
    throw new CliError(
      `pack '${name}':  packages/${name}/package.json has no "spellPack": { "prefix" }, so it isn't a component pack;  ` +
        `make one with \`spell dev pack new ${name} --prefix <x->\``
    )
  }
  return { name, prefix, dir }
}

/** Every component pack in checkout `root`:  the `packages/*` whose `package.json` has a `spellPack`, sorted. */
export function packNames(root: string): string[] {
  const packages = join(root, "packages")
  if (!existsSync(packages)) return []
  return readdirSync(packages)
    .filter((name) => packPrefix(join(packages, name)) !== undefined)
    .sort()
}

/**
 * The prefix of the pack in folder `dir`, from its `package.json`'s `spellPack`;  `undefined` when it isn't a pack.
 * - NEVER throws:  no file, or bad JSON, is "not a pack".
 */
export function packPrefix(dir: string): string | undefined {
  try {
    const { spellPack } = JSON.parse(readFileSync(join(dir, "package.json"), "utf8")) as PackPackageJson
    return typeof spellPack?.prefix === "string" ? spellPack.prefix : undefined
  } catch {
    return undefined
  }
}

/**
 * The hash of everything a pack's generated files are built from:  `packSources()`, each with its path;  the pack's
 * name and prefix;  `PACK_FORMAT`.  16 hex digits of sha-256.
 */
export function packHash(pack: PackInfo): string {
  const hash = createHash("sha256").update(`${PACK_FORMAT}\n${pack.name}\n${pack.prefix}\n`)
  for (const file of packSources(pack)) hash.update(`${relative(pack.dir, file)}\n`).update(readFileSync(file))
  return hash.digest("hex").slice(0, 16)
}

/**
 * The files a pack's script is built from, absolute, sorted:  every file under `components/`, plus every file of the
 * pack's own `components/` or `src/` they import, transitively.
 * - Not the rest of `src/`:  node-only code there (a tool, its tests) never reaches the script, so editing it leaves
 *   the pack current.
 * - Imports are found by `IMPORT` (text, not a parse) and resolved as the build does:  relative, or the pack's own
 *   `$/<pack>` aliases (`packAliases()`);  `?inline` and other queries dropped, extensions and `index` tried.
 * - Tests and snapshots never count.
 */
export function packSources(pack: PackInfo): string[] {
  const sources = new Set<string>()
  const queue = filesUnder(join(pack.dir, COMPONENTS_FOLDER))
  while (queue.length) {
    const file = queue.pop()!
    if (sources.has(file) || NOT_SOURCE.test(file) || !isPackSource(pack, file)) continue
    sources.add(file)
    if (!SCRIPT.test(file)) continue
    for (const [, from, bare, dynamic] of readFileSync(file, "utf8").matchAll(IMPORT)) {
      const imported = resolveImport(pack, file, from ?? bare ?? dynamic)
      if (imported) queue.push(imported)
    }
  }
  return [...sources].sort()
}

/** The family folders of a pack:  each `components/<tag>/` with an `index.ts` barrel, sorted. */
export function packFamilies(pack: PackInfo): string[] {
  const components = join(pack.dir, COMPONENTS_FOLDER)
  if (!existsSync(components)) return []
  return readdirSync(components, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(components, entry.name, "index.ts")))
    .map((entry) => entry.name)
    .sort()
}

////////////////
// ## Generated files
////////////////

/**
 * The modules a pack SHARES with the page instead of bundling:  the exact import specifiers its build leaves
 * external, each read from `globalThis.SpellUI.packModules[<specifier>]` (the docs bundle's, `spell-ui.entry.js`).
 * - Any other `$/ui...`, Solid or `@spell-app/...` import fails the build:  a second copy of Spell UI's core or Solid
 *   on a page breaks both.  Another one:  add it here AND to Spell UI's `packModules`.
 */
export const PACK_MODULES = ["solid-js", "@solidjs/web", "$/ui/core", "$/ui/forms"]

/** Imports the page must share, never bundled:  Spell UI, Solid, our other packages. */
const SHARED_IMPORT = /^\$\/ui(\/|$)|^solid-js(\/|$)|^@solidjs\/|^@spell-app\//

/** Version of what `buildPack()` writes:  bump it when the generated files change shape, so every pack goes stale. */
const PACK_FORMAT = "spell-pack 1"

/** The pack's generated folder, in its package. */
const PACK_FOLDER = "pack"

/** Its element families' folder. */
const COMPONENTS_FOLDER = "components"

/** Folders whose files a pack's script may be built from:  its elements, and code they share with node. */
const SOURCE_FOLDERS = [COMPONENTS_FOLDER, "src"]

/** Files under them that never reach the pack:  tests and their snapshots. */
const NOT_SOURCE = /\.test\.[cm]?[jt]sx?$|[\\/]__snapshots__[\\/]/

/** A file whose imports `packSources()` follows. */
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

/** Spell UI's Vite config, for `baseConfig()`:  relative to a checkout's root. */
const UI_VITE_CONFIG = "packages/ui/vite.config.ts"

/** A pack's generated files, absolute. */
function packFiles(pack: PackInfo) {
  const folder = join(pack.dir, PACK_FOLDER)
  return {
    catalog: join(folder, `${pack.name}.catalog.ts`),
    entry: join(folder, `${pack.name}.entry.ts`),
    script: join(folder, `${pack.name}.pack.js`)
  }
}

/**
 * The pack's catalog, read from its vocabularies by Spell UI's `RootCatalog`.
 * - Throws `CliError` for a tag without the pack's prefix:  `<ui-root>` knows a pack's tags by it.
 */
async function catalogFor(pack: PackInfo) {
  const components = join(pack.dir, COMPONENTS_FOLDER)
  const catalog = existsSync(components) ? await RootCatalog.read([components]) : {}
  const strays = Object.keys(catalog).filter((tag) => !tag.startsWith(pack.prefix))
  if (strays.length) {
    throw new CliError(
      `pack '${pack.name}':  every tag must start '${pack.prefix}', but these don't:  ${strays.join(", ")}`,
      EXIT.ERRORS
    )
  }
  return catalog
}

/** The text of `<pack>.catalog.ts`. */
function catalogSource(pack: PackInfo, catalog: Awaited<ReturnType<typeof catalogFor>>, hash: string): string {
  const lines = RootCatalog.lines(catalog)
  return `/* GENERATED -- do not edit:  \`spell dev pack build ${pack.name}\`, from every vocabulary, \`<Name>.en.ts\` */
// sources:  ${hash}

import type { RootCatalogEntry } from "$/ui"

/** Every tag of the \`${pack.name}\` pack => what \`<ui-root>\` needs before its family loads. */
export const CATALOG: Readonly<Record<string, RootCatalogEntry>> = {
${lines.join(",\n")}${lines.length ? "\n" : ""}}
`
}

/** The text of `<pack>.entry.ts`. */
function entrySource(pack: PackInfo): string {
  const imports = packFamilies(pack).map((family) => `import("../${COMPONENTS_FOLDER}/${family}")`)
  const define = imports.length
    ? `() =>\n    Promise.all([\n      ${imports.join(",\n      ")}\n    ]).then(() => undefined)`
    : "() => Promise.resolve()"
  return `/* GENERATED -- do not edit:  \`spell dev pack build ${pack.name}\` */
/**
 * The \`${pack.name}\` pack's script:  registers with the page's Spell UI, which adds the catalog and calls \`define()\`.
 * - \`define()\` imports every family barrel, which defines its tags:  inlined in the script, run only when called.
 */
import { CATALOG } from "./${pack.name}.catalog"

/** The docs bundle's global (\`spell-ui.entry.js\`). */
const { SpellUI } = globalThis as unknown as { SpellUI: { registerPack(pack: object): void } }

SpellUI.registerPack({
  name: ${JSON.stringify(pack.name)},
  prefix: ${JSON.stringify(pack.prefix)},
  catalog: CATALOG,
  define: ${define}
})
`
}

/**
 * Build the entry into `<pack>.pack.js`;  returns the files written.
 * - In this process, through Vite's API, on checkout `root`'s Spell UI `baseConfig()`;  `configFile: false`:  the
 *   pack's own `vite.config.ts` holds only lint / format settings.
 */
async function bundle(root: string, pack: PackInfo, hash: string): Promise<string[]> {
  const { build } = await import("vite-plus")
  const config = join(root, UI_VITE_CONFIG)
  if (!existsSync(config)) throw new CliError(`pack build:  no ${UI_VITE_CONFIG} in ${root}`, EXIT.ERRORS)
  const { baseConfig } = (await import(pathToFileURL(config).href)) as { baseConfig: () => Record<string, any> }
  const base = baseConfig()
  const folder = join(pack.dir, PACK_FOLDER)
  const files = packFiles(pack)
  const result = await build({
    ...base,
    configFile: false,
    root: pack.dir,
    logLevel: "warn",
    publicDir: false,
    resolve: { ...base.resolve, alias: packAliases(pack) },
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
        fileName: () => `${pack.name}.pack.js`
      },
      rolldownOptions: {
        external: (id: string) => {
          if (PACK_MODULES.includes(id)) return true
          if (SHARED_IMPORT.test(id)) {
            throw new CliError(
              `pack '${pack.name}':  imports '${id}', which the page can't share;  import from ` +
                `${PACK_MODULES.map((it) => `'${it}'`).join(", ")} only, or add it to PACK_MODULES (packBuild.ts) ` +
                "and Spell UI's packModules",
              EXIT.ERRORS
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
  const banner = `/* GENERATED -- do not edit:  \`spell dev pack build ${pack.name}\`.  sources:  ${hash} */`
  writeFileSync(files.script, `${banner}\n${readFileSync(files.script, "utf8")}`)
  const outputs = (Array.isArray(result) ? result : [result]).flatMap((it) => ("output" in it ? it.output : []))
  return outputs.map((chunk) => join(folder, chunk.fileName))
}

/** `$/<pack>` and `$/<pack>/components`, as `packages/brand`'s Vite configs set its own:  any checkout, any tsconfig. */
function packAliases(pack: PackInfo) {
  const name = pack.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return [
    { find: new RegExp(`^\\$/${name}/components$`), replacement: join(pack.dir, COMPONENTS_FOLDER, "index.ts") },
    { find: new RegExp(`^\\$/${name}/components/`), replacement: `${join(pack.dir, COMPONENTS_FOLDER)}/` },
    { find: new RegExp(`^\\$/${name}$`), replacement: join(pack.dir, "src", "index.ts") },
    { find: new RegExp(`^\\$/${name}/`), replacement: `${join(pack.dir, "src")}/` }
  ]
}

/**
 * The file import `specifier` in file `from` names, when it's the pack's own:  relative, or a `$/<pack>` alias.
 * - `undefined` for anything else (Spell UI, Solid, npm), or a path that isn't a file.
 */
function resolveImport(pack: PackInfo, from: string, specifier: string): string | undefined {
  const path = specifier.replace(/\?.*$/, "")
  const alias = packAliases(pack).find((it) => it.find.test(path))
  const base = path.startsWith(".") ? join(dirname(from), path) : alias && path.replace(alias.find, alias.replacement)
  if (base === undefined) return undefined
  const candidates = [base, ...RESOLVE_SUFFIXES.map((suffix) => base + suffix)]
  // TS's ESM style:  `./x.js` for `./x.ts`
  if (/\.[cm]?js$/.test(base)) candidates.push(base.replace(/js$/, "ts"), base.replace(/js$/, "tsx"))
  return candidates.find((it) => existsSync(it) && statSync(it).isFile())
}

/** Whether `file` is under one of the pack's `SOURCE_FOLDERS`. */
function isPackSource(pack: PackInfo, file: string): boolean {
  return SOURCE_FOLDERS.some((folder) => !relative(join(pack.dir, folder), file).startsWith(".."))
}

/** The hash a generated file records, if any. */
function recordedHash(text: string): string | undefined {
  return HASH_RECORD.exec(text)?.[1]
}

/** `file`'s text, or `undefined` when there's none. */
function readText(file: string): string | undefined {
  return existsSync(file) ? readFileSync(file, "utf8") : undefined
}

/** Every file under `dir`, recursively, sorted by path;  none when it doesn't exist. */
function filesUnder(dir: string): string[] {
  if (!existsSync(dir)) return []
  const files: string[] = []
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) files.push(...filesUnder(path))
    else files.push(path)
  }
  return files
}

/** The part of a pack's `package.json` read here. */
type PackPackageJson = { spellPack?: { prefix?: unknown } }
