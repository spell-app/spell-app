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
 * - Emoji names stay LAZY:  UI's emoji data chunks (`dist/emoji/<set>/<letter>-<hash>.js`, both name sets) are NOT
 *   inlined;  each is written as a classic script, `_assets/emoji/<set>/<letter>.js`, which a `<script>` tag loads on
 *   first use of a name in that chunk (`spell-ui:emoji` sets `EmojiData.chunkLoader`).  A page with no `<ui-emoji>`
 *   loads none.
 * - The source elements' ENGINES stay lazy the same way (`LAZY`):  `<ui-code>`'s highlight.js (with all its
 *   languages), `<ui-markdown>`'s marked + DOMPurify, and spell's pre-compiled highlighter are each built from UI's
 *   SOURCE into a classic script, `_assets/lazy/<name>.js`;  their `dist/` chunks are stubbed out of the bundle, and
 *   `spell-ui:lazy` points UI's loader hooks (`CodeHighlighter.engineLoader` ...) at the scripts.  A page that shows
 *   no code loads none.
 */

import { build } from "esbuild"
import { spawnSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
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
  // spell-ui-site.html sections
  "solid/table-columns": ["table columns"],
  "solid/sun": ["sun"],
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
  "solid/lightbulb": ["lightbulb"],
  "solid/map": ["map"],
  "solid/layer-group": ["layer group"],
  "solid/clock-rotate-left": ["clock rotate left", "history"],
  // page meta lists (durable / plan templates)
  "solid/user": ["user"],
  "solid/flag": ["flag"],
  "solid/flask": ["flask"],
  "solid/code-branch": ["code branch"],
  "solid/folder": ["folder"],
  "solid/calendar": ["calendar"],
  // trade-offs (durable template)
  "solid/thumbs-up": ["thumbs up"],
  "solid/thumbs-down": ["thumbs down"],
  // master plan (`goals/` at the repo root):  one per topic
  "solid/heart": ["heart"],
  "solid/bullseye": ["bullseye"],
  "solid/users": ["users"],
  "solid/palette": ["palette"],
  "solid/feather": ["feather"],
  "solid/window-maximize": ["window maximize"],
  "solid/wand-magic-sparkles": ["wand magic sparkles", "magic"],
  "solid/desktop": ["desktop"],
  "solid/puzzle-piece": ["puzzle piece", "puzzle"],
  "solid/book-open": ["book open"],
  "solid/cubes": ["cubes"],
  "solid/globe": ["globe"],
  "solid/language": ["language"],
  "solid/laptop-code": ["laptop code"],
  "solid/terminal": ["terminal"],
  // master plan:  page furniture -- horizons, dialog, notes for agents
  "solid/seedling": ["seedling"],
  "solid/tree": ["tree"],
  "solid/mountain-sun": ["mountain sun"],
  "solid/compass": ["compass"],
  "solid/route": ["route"],
  "solid/comments": ["comments"],
  "solid/rocket": ["rocket"],
  "solid/robot": ["robot"],
  "solid/hat-wizard": ["hat wizard"],
  "solid/scroll": ["scroll"],
  "solid/arrow-right": ["arrow right"],
  "solid/flag-checkered": ["flag checkered"],
  "solid/eye": ["eye"],
  // contents buttons (every page):  expand / collapse every section, fold / unfold code
  "solid/angles-down": ["angles down"],
  "solid/angles-up": ["angles up"],
  "solid/code": ["code"],
  // master plan:  live pages (thoughts, Claude sessions, setup)
  "regular/comment-dots": ["comment dots"],
  "solid/arrows-rotate": ["arrows rotate", "refresh"],
  "solid/up-right-from-square": ["up right from square", "external alternate"],
  "solid/right-to-bracket": ["right to bracket", "sign in"],
  "solid/download": ["download"],
  "solid/paper-plane": ["paper plane"],
  "solid/plug": ["plug"],
  "solid/circle-play": ["circle play"],
  "solid/circle-pause": ["circle pause"], // the docs index:  a stalled epic
  // plan docs' review (epic `review-review`):  section icons, the item action menu and filter, the page header's
  // send / files / git buttons
  "solid/file-circle-question": ["file circle question"],
  "solid/filter": ["filter"],
  "solid/ellipsis": ["ellipsis", "ellipsis horizontal"],
  "regular/circle-check": ["circle check outline", "check circle outline"],
  "regular/paper-plane": ["paper plane outline"],
  "regular/folder": ["folder outline"],
  "../fa7-brands/brands/git-alt": ["git", "git alt"] // the brands pack, beside `ICON_PACK`
}

/** Bare specifiers that MUST resolve from UI's root:  Solid (all subpaths) and the element-layer fork. */
const SOLID = /^(solid-js|@solidjs\/[\w-]+|@spell-app\/solid-element)(\/.*)?$/

/** UI's emoji name data:  `<set>/<letter>.json`, written out as lazy classic scripts (`writeEmojiChunks()`). */
const EMOJI_DATA = join(UI_DIR, "src/components/ui-emoji/data")

/** Where the emoji chunk scripts go, and their URL relative to the bundle. */
const EMOJI_OUT = join(ASSETS, "emoji")

/** An emoji data chunk of UI's `dist/` (`emoji/cldr/a-UMC54g9e.js`), as imported by the emoji family. */
const EMOJI_CHUNK = /(?:^|\/)emoji\/[\w-]+\/\w+-[\w-]+\.js$/

/** Where the lazy engine scripts go, and their URL relative to the bundle. */
const LAZY_OUT = join(ASSETS, "lazy")

/**
 * The source elements' engines, each a lazy classic script `lazy/<name>.js` defining `global`:
 * - `source`:  UI SOURCE file it's built from (it MUST import nothing of UI's by value)
 * - `chunk`:  its chunk in UI's `dist/`, stubbed out of the bundle
 * - `hook`:  how `spell-ui:lazy` installs it
 */
const LAZY = [
  {
    name: "code-engine",
    global: "__spellCodeEngine",
    source: join(UI_DIR, "src/components/ui-code/CodeEngine.ts"),
    chunk: /(?:^|\/)CodeEngine-[\w-]+\.js$/,
    hook: `CodeHighlighter.engineLoader = () => lazy("code-engine", "__spellCodeEngine")`
  },
  {
    name: "markdown-engine",
    global: "__spellMarkdownEngine",
    source: join(UI_DIR, "src/components/ui-markdown/MarkdownEngine.ts"),
    chunk: /(?:^|\/)MarkdownEngine-[\w-]+\.js$/,
    hook: `MarkdownRenderer.engineLoader = () => lazy("markdown-engine", "__spellMarkdownEngine")`
  },
  {
    name: "spell-en",
    global: "__spellHighlightEn",
    source: join(UI_DIR, "src/languages/spell.en.bundle.js"),
    chunk: /(?:^|\/)spell\.en-[\w-]+\.js$/,
    hook: `SpellLanguage.bundleLoader = (variant) => variant === "en" ? lazy("spell-en", "__spellHighlightEn") : undefined`
  }
]

const args = process.argv.slice(2)
if (!args.includes("--skip-ui-build")) buildUI()
writeEmojiChunks()
await writeLazyScripts()
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
      pluginBuild.onResolve({ filter: /^spell-ui:emoji$/ }, () => ({ path: "emoji", namespace: "spell-ui" }))
      pluginBuild.onResolve({ filter: /^spell-ui:lazy$/ }, () => ({ path: "lazy", namespace: "spell-ui" }))
      // the engines' `dist/` chunks:  never inlined (`spell-ui:lazy` loads them as scripts);  an empty stand-in
      for (const { chunk } of LAZY) {
        pluginBuild.onResolve({ filter: chunk }, () => ({ path: "lazy-chunk", namespace: "spell-ui" }))
      }
      // UI's emoji data chunks:  never inlined (`EmojiData.chunkLoader` loads them as scripts);  an empty stand-in
      pluginBuild.onResolve({ filter: EMOJI_CHUNK }, () => ({ path: "emoji-chunk", namespace: "spell-ui" }))
      pluginBuild.onLoad({ filter: /.*/, namespace: "spell-ui" }, (loaded) => {
        if (loaded.path === "icons") return { contents: iconsModule(), resolveDir: ASSETS, loader: "js" }
        if (loaded.path === "emoji") return { contents: emojiModule(), resolveDir: ASSETS, loader: "js" }
        if (loaded.path === "emoji-chunk") return { contents: "export default {}", loader: "js" }
        if (loaded.path === "lazy") return { contents: lazyModule(), resolveDir: ASSETS, loader: "js" }
        if (loaded.path === "lazy-chunk") return { contents: "export {}", loader: "js" }
        return { contents: "", loader: "js" }
      })
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

/**
 * Source of `spell-ui:emoji`:  `EmojiData.chunkLoader` loads a name chunk as the classic script
 * `emoji/<set>/<letter>.js` next to the bundle, which hands its names to `__spellEmojiChunk()`.
 * - The bundle's own URL (`document.currentScript`, read while it runs) locates the scripts, at any page depth.
 */
function emojiModule() {
  return [
    `import { EmojiData } from "@spell-app/ui/ui-emoji"`,
    `const base = new URL("emoji/", document.currentScript?.src ?? location.href)`,
    `const waiting = new Map()`,
    `globalThis.__spellEmojiChunk = (set, chunk, names) => waiting.get(set + "/" + chunk)?.(names)`,
    `EmojiData.chunkLoader = (set, chunk) =>`,
    `  new Promise((resolve, reject) => {`,
    `    const id = set + "/" + chunk`,
    `    const script = document.createElement("script")`,
    `    waiting.set(id, (names) => { waiting.delete(id); resolve(names) })`,
    `    script.src = new URL(id + ".js", base).href`,
    `    script.onload = () => script.remove()`,
    `    script.onerror = () => { waiting.delete(id); script.remove(); reject(new Error("no emoji chunk " + id)) }`,
    `    document.head.append(script)`,
    `  })`
  ].join("\n")
}

/**
 * Writes every emoji name chunk of UI's data (`<set>/<letter>.json`) as `_assets/emoji/<set>/<letter>.js`:  a classic
 * script handing its names to `__spellEmojiChunk()`.  The folder is emptied first, so a dropped chunk doesn't linger.
 */
function writeEmojiChunks() {
  rmSync(EMOJI_OUT, { recursive: true, force: true })
  let files = 0
  for (const set of readdirSync(EMOJI_DATA)) {
    mkdirSync(join(EMOJI_OUT, set), { recursive: true })
    for (const file of readdirSync(join(EMOJI_DATA, set)).filter((name) => name.endsWith(".json"))) {
      const chunk = file.slice(0, -".json".length)
      const names = JSON.parse(readFileSync(join(EMOJI_DATA, set, file), "utf8"))
      const body = `__spellEmojiChunk(${JSON.stringify(set)}, ${JSON.stringify(chunk)}, ${JSON.stringify(names, null, 2)})\n`
      writeFileSync(
        join(EMOJI_OUT, set, `${chunk}.js`),
        `// generated by scripts/bundle-spell-ui.js:  edit UI's data\n${body}`
      )
      files++
    }
  }
  console.log(`-- _assets/emoji/  ${files} lazy name chunks`)
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
function checkClassicScript(file = OUTFILE) {
  const code = readFileSync(file, "utf8")
  const problems = [
    // a call, not a METHOD called `import` (spell's parser has one:  `x.import(y)`, `import(...rules) {`)
    [/(?<![.\w$])import\s*\((?![^)]*\)\s*\{)/, "a runtime import()"],
    [/\bimport\.meta\b/, "import.meta"],
    [/^\s*(import|export)\s[\w{*"]/m, "a top-level import / export"]
  ].filter(([pattern]) => pattern.test(code))
  if (problems.length) fail(`${relative(DOCS, file)} still has ${problems.map(([, what]) => what).join(", ")}`)
}

////////////////
// ## Lazy engines
////////////////

/**
 * Builds each of `LAZY` from UI's source into `_assets/lazy/<name>.js`:  a classic script (IIFE) defining its
 * `global` as the module's exports, every `import()` inside it inlined.
 * - Sizes are printed;  each is checked like the bundle (no `import()` / `import.meta` may survive).
 */
async function writeLazyScripts() {
  rmSync(LAZY_OUT, { recursive: true, force: true })
  mkdirSync(LAZY_OUT, { recursive: true })
  for (const { name, global, source } of LAZY) {
    const outfile = join(LAZY_OUT, `${name}.js`)
    await build({
      entryPoints: [source],
      outfile,
      bundle: true,
      format: "iife",
      globalName: global,
      platform: "browser",
      target: "esnext",
      supported: { "dynamic-import": false },
      minify: true,
      keepNames: true,
      legalComments: "eof",
      // `$/ui/runtime/runtime.types` (each engine's `SourceError`)
      tsconfig: join(UI_DIR, "tsconfig.json"),
      logLevel: "silent"
    })
    checkClassicScript(outfile)
    const code = readFileSync(outfile)
    console.log(
      `-- ${relative(DOCS, outfile)}  ${(code.length / 1024).toFixed(1)} KB  (gzip ${(gzipSync(code).length / 1024).toFixed(1)} KB)`
    )
  }
}

/**
 * Source of `spell-ui:lazy`:  points UI's engine loaders at `lazy/<name>.js`, loaded once as a classic script next to
 * the bundle, resolving with the global it defines.
 * - The bundle's own URL (`document.currentScript`, read while it runs) locates the scripts, at any page depth.
 */
function lazyModule() {
  return [
    `import { CodeHighlighter, SpellLanguage } from "@spell-app/ui/ui-code"`,
    `import { MarkdownRenderer } from "@spell-app/ui/ui-markdown"`,
    `const base = new URL("lazy/", document.currentScript?.src ?? location.href)`,
    `const loading = new Map()`,
    `function lazy(name, global) {`,
    `  if (!loading.has(name)) {`,
    `    loading.set(name, new Promise((resolve, reject) => {`,
    `      const script = document.createElement("script")`,
    `      script.src = new URL(name + ".js", base).href`,
    `      script.onload = () => (globalThis[global] ? resolve(globalThis[global]) : reject(new Error(name + " defined nothing")))`,
    `      script.onerror = () => { loading.delete(name); script.remove(); reject(new Error("no lazy script " + name)) }`,
    `      document.head.append(script)`,
    `    }))`,
    `  }`,
    `  return loading.get(name)`,
    `}`,
    ...LAZY.map(({ hook }) => hook)
  ].join("\n")
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
