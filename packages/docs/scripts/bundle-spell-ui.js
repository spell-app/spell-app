/**
 * Builds @spell-app/ui from its CURRENT working tree (`../ui`), then bundles `_assets/spell-ui.entry.js` into
 * `_assets/spell-ui.js`:  ONE minified classic script (IIFE), because docs open from `file://`, where
 * browsers refuse ES modules.
 *
 *   node scripts/bundle-spell-ui.js [--skip-ui-build]
 *
 * - `--skip-ui-build`:  reuse `../ui/dist` as is.  `SPELL_UI_DIR` overrides where UI lives.
 * - UI build:  the fork (`yarn fork:build`, its `dist/` is what UI's build links to), then `yarn build`
 *   (`tsc && vite build`).  If `tsc` fails on in-progress work, falls back to `vite build` alone, and says so.
 * - Exactly ONE Solid:  every `solid-js` / `@solidjs/*` / `@spell-app/solid-element` import resolves from UI's root,
 *   so the linked fork can't pick up its own `node_modules` copy.  Checked against the metafile.
 * - No `import()` / `import.meta` may survive:  string-literal `import()`s (the runtime chunk, emoji data,
 *   Temporal polyfill) are inlined, and `supported: { "dynamic-import": false }` turns any computed `import()`
 *   (an icon pack's `pack.js`) into a rejected promise.
 * - Icons:  a classic script on `file://` can't load UI's icon packs, so the SVGs in `ICONS` are read from UI's
 *   `fa7-free` pack at build time and `UI.icons.register()`ed by the virtual `spell-ui:icons` module, which also
 *   `reset()`s the packs so the default one is never requested.  Any other icon name draws nothing.
 */

import { build } from "esbuild"
import { spawnSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { gzipSync } from "node:zlib"

/** `packages/docs`. */
const DOCS = resolve(dirname(fileURLToPath(import.meta.url)), "..")
/** `packages/ui`, unless `SPELL_UI_DIR` says otherwise. */
const UI_DIR = resolve(process.env.SPELL_UI_DIR ?? join(DOCS, "../ui"))
const ASSETS = join(DOCS, "_assets")
const ENTRY = join(ASSETS, "spell-ui.entry.js")
const OUTFILE = join(ASSETS, "spell-ui.js")
/** Page behaviour, the RUNTIME's file;  bundled as an empty module while it doesn't exist yet. */
const PAGE_RUNTIME = join(ASSETS, "spell-doc-runtime.js")

/** UI's Font Awesome pack, where `ICONS`' files are read from. */
const ICON_PACK = join(UI_DIR, "src/icons/icon-packs/fa7-free")

/**
 * Icons bundled into the script, as `<style>/<file name>` => the names to register it under.
 * - Names are what `<ui-icon name>` / an `icon` attribute say:  widgets' own (`search`, `close` ...) and the docs'.
 * - ~0.3-0.6 KB each:  add what a widget or doc needs, don't bundle the pack.
 */
const ICONS = {
  // widgets
  "solid/magnifying-glass": ["magnifying glass", "search"], // `<ui-input icon="search">`, `<ui-search>`
  "solid/xmark": ["xmark", "close", "remove"], // `<ui-message dismissible>`, `<ui-label removable>`, modal / toast
  "solid/circle-info": ["circle info", "info circle", "info"],
  "solid/triangle-exclamation": ["triangle exclamation", "warning sign", "warning"],
  "solid/circle-exclamation": ["circle exclamation", "warning circle"],
  "solid/circle-xmark": ["circle xmark", "times circle"],
  "solid/check": ["check", "checkmark"],
  "solid/chevron-down": ["chevron down"],
  "solid/chevron-right": ["chevron right"],
  "solid/link": ["link"],
  "solid/copy": ["copy"],
  "solid/bars": ["bars"],
  // status:  not done / in progress / done (plan docs)
  "regular/circle": ["circle outline"],
  "solid/circle-half-stroke": ["circle half stroke", "adjust"],
  "solid/circle-check": ["circle check", "check circle"],
  // plan-doc sections and markers
  "solid/pen-to-square": ["pen to square", "edit"],
  "solid/circle-question": ["circle question", "question circle"],
  "solid/bug": ["bug"],
  "solid/list-check": ["list check"],
  "solid/gavel": ["gavel"],
  "solid/lightbulb": ["lightbulb"]
}

/** Bare specifiers that MUST resolve from UI's root:  Solid (all subpaths) and the element-layer fork. */
const SOLID = /^(solid-js|@solidjs\/[\w-]+|@spell-app\/solid-element)(\/.*)?$/

const args = process.argv.slice(2)
if (!args.includes("--skip-ui-build")) buildUI()
const warnings = await bundle()
report(warnings)

////////////////
// ## UI build
////////////////

/**
 * Builds the fork, then UI, from their working trees -- "latest UI" is whatever is checked out there.
 * - `yarn build` type-checks first;  in-progress UI work may not, so fall back to `vite build` rather than fail.
 */
function buildUI() {
  if (!existsSync(join(UI_DIR, "package.json"))) fail(`no UI checkout at ${UI_DIR} (set SPELL_UI_DIR)`)
  run("yarn", ["fork:build"], "build @spell-app/solid-element (UI's fork)")
  if (run("yarn", ["build"], "build @spell-app/ui (tsc + vite)", { allowFailure: true })) return
  console.warn("!! UI's tsc failed:  building with `vite build` alone (the bundle may carry type errors)")
  run("yarn", ["vite", "build"], "build @spell-app/ui (vite only)")
}

/**
 * Runs `command` in UI's folder, quietly;  prints its output only if it fails.
 * - Returns whether it succeeded;  exits unless `allowFailure`.
 */
function run(command, commandArgs, label, { allowFailure = false } = {}) {
  console.log(`-- ${label}`)
  const result = spawnSync(command, commandArgs, { cwd: UI_DIR, encoding: "utf8", shell: false })
  if (result.status === 0) return true
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}${result.error ?? ""}`.trim()
  console.error(output.split("\n").slice(-40).join("\n"))
  if (!allowFailure) fail(`${command} ${commandArgs.join(" ")} failed in ${UI_DIR}`)
  return false
}

////////////////
// ## Bundle
////////////////

/**
 * Bundles the entry into `OUTFILE`, then checks the output is safe for a classic script on `file://`.
 * - Returns esbuild's warnings, as text.
 */
async function bundle() {
  const dist = join(UI_DIR, "dist/index.js")
  if (!existsSync(dist)) fail(`${relative(DOCS, dist)} is missing:  run without --skip-ui-build`)
  const result = await build({
    entryPoints: [ENTRY],
    outfile: OUTFILE,
    bundle: true,
    format: "iife",
    globalName: "SpellUI",
    platform: "browser",
    // UI targets current browsers only (anchor positioning, `light-dark()`):  lower nothing but `import()`
    target: "esnext",
    supported: { "dynamic-import": false },
    // `BuiltInPacks.base` is only read to load a pack, and `spell-ui:icons` drops them all first
    define: { "import.meta.url": "undefined" },
    minify: true,
    legalComments: "eof",
    metafile: true,
    logLevel: "silent",
    plugins: [spellUiResolver()]
  })
  checkOneSolid(result.metafile)
  checkClassicScript()
  return result.warnings.map((warning) => `${warning.location?.file ?? ""}: ${warning.text}`)
}

/**
 * esbuild plugin wiring the entry to UI:
 * - `@spell-app/ui` ~== `dist/index.js`, `@spell-app/ui/<entry>` ~== `dist/<entry>.js` (mirrors UI's `package.json`
 *   `exports`)
 * - Solid / fork imports resolve from UI's root (`SOLID`), whoever imports them
 * - `spell-ui:icons`:  the generated icon registrations (`iconsModule()`)
 * - the page runtime:  an empty module until its file exists
 */
function spellUiResolver() {
  return {
    name: "spell-ui-resolver",
    setup(pluginBuild) {
      pluginBuild.onResolve({ filter: /^spell-ui:icons$/ }, () => ({ path: "icons", namespace: "spell-ui" }))
      pluginBuild.onLoad({ filter: /.*/, namespace: "spell-ui" }, (loaded) =>
        loaded.path === "icons"
          ? { contents: iconsModule(), resolveDir: ASSETS, loader: "js" }
          : { contents: "", loader: "js" }
      )
      pluginBuild.onResolve({ filter: /^@spell-app\/ui(\/.*)?$/ }, ({ path }) => ({ path: uiDistPath(path) }))
      pluginBuild.onResolve({ filter: SOLID }, async ({ path, kind, pluginData }) => {
        if (pluginData?.fromUiRoot) return undefined
        const resolved = await pluginBuild.resolve(path, { kind, resolveDir: UI_DIR, pluginData: { fromUiRoot: true } })
        return resolved.errors.length ? { errors: resolved.errors } : { path: resolved.path }
      })
      pluginBuild.onResolve({ filter: /spell-doc-runtime\.js$/ }, ({ path, resolveDir }) => {
        const file = resolve(resolveDir, path)
        if (file === PAGE_RUNTIME && !existsSync(file)) {
          console.warn(`!! ${relative(DOCS, file)} doesn't exist yet:  bundled as an empty module`)
          return { path: "page-runtime", namespace: "spell-ui" }
        }
        return undefined
      })
    }
  }
}

/** File in UI's `dist/` for an `@spell-app/ui[/...]` specifier. */
function uiDistPath(specifier) {
  const sub = specifier.slice("@spell-app/ui".length).replace(/^\//, "")
  if (!sub) return join(UI_DIR, "dist/index.js")
  return join(UI_DIR, "dist", `${sub}.js`)
}

/**
 * Source of `spell-ui:icons`:  each of `ICONS`' SVG text, `UI.icons.register()`ed under each of its names.
 * - Imports `UI` from `@spell-app/ui/core` -- the same module `index.js` uses -- so this runs BEFORE any family
 *   defines (and so upgrades) its elements.
 * - Registers in the FIRST `UI.load()` callback:  every element `await`s that same promise before drawing an icon,
 *   so the names are in place first.
 * - `reset()`:  drop every pack, so the default pack's index is never requested (it can't load from `file://`).
 */
function iconsModule() {
  const icons = Object.entries(ICONS).map(([file, names]) => {
    const path = join(ICON_PACK, `${file}.svg`)
    if (!existsSync(path)) fail(`no icon ${relative(DOCS, path)}:  check ICONS against UI's fa7-free pack`)
    return [names, readFileSync(path, "utf8")]
  })
  return [
    `import { UI } from "@spell-app/ui/core"`,
    `const ICONS = ${JSON.stringify(icons)}`,
    `UI.load().then((ui) => {`,
    `  ui.icons.reset()`,
    `  for (const [names, svg] of ICONS) for (const name of names) ui.icons.register(name, svg)`,
    `})`
  ].join("\n")
}

////////////////
// ## Checks
////////////////

/** Fails if two copies of a Solid package made it into the bundle, e.g. the fork's own `node_modules`. */
function checkOneSolid(metafile) {
  const copies = new Map()
  for (const input of Object.keys(metafile.inputs)) {
    const match = input.match(/node_modules\/((?:@[\w-]+\/)?[\w-]+)\//)
    if (!match || !SOLID.test(match[1])) continue
    const root = input.slice(0, match.index + match[0].length)
    copies.set(match[1], new Set([...(copies.get(match[1]) ?? []), root]))
  }
  for (const [name, roots] of copies) {
    if (roots.size > 1) fail(`${name} bundled ${roots.size} times:\n  ${[...roots].join("\n  ")}`)
  }
  if (!copies.has("solid-js")) fail("solid-js isn't in the bundle:  check the resolver")
}

/** Fails if the output still needs ES module machinery a classic script on `file://` doesn't have. */
function checkClassicScript() {
  const code = readFileSync(OUTFILE, "utf8")
  const problems = [
    [/\bimport\s*\(/, "a runtime import()"],
    [/\bimport\.meta\b/, "import.meta"],
    [/^\s*(import|export)\s[\w{*"]/m, "a top-level import / export"]
  ].filter(([pattern]) => pattern.test(code))
  if (problems.length) fail(`${relative(DOCS, OUTFILE)} still has ${problems.map(([, what]) => what).join(", ")}`)
}

////////////////
// ## Output
////////////////

/** Prints the bundle's size (raw, gzip) and any esbuild warnings. */
function report(warnings) {
  const code = readFileSync(OUTFILE)
  const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`
  console.log(`-- ${relative(DOCS, OUTFILE)}  ${kb(code.length)}  (gzip ${kb(gzipSync(code).length)})`)
  for (const warning of warnings) console.warn(`!! ${warning}`)
}

/** Prints `message` and exits with an error. */
function fail(message) {
  console.error(`!! ${message}`)
  process.exit(1)
}
