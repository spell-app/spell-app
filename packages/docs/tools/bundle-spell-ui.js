/**
 * Builds @spell-app/ui from its CURRENT working tree (`../ui`),
 * then bundles `_assets/spell-ui.entry.js` into `_assets/spell-ui.js`:  ONE minified classic script (IIFE),
 * because docs open from `file://`, where browsers refuse ES modules.
 *
 *   node scripts/bundle-spell-ui.js [--skip-ui-build]
 *
 * - `--skip-ui-build`:  reuse `../ui/dist` as is.
 * - `SPELL_UI_DIR` overrides where UI lives.
 * - UI build:  `yarn build` (`tsc && vite build`).
 *   If `tsc` fails on in-progress work, falls back to `vite build` alone, and says so.
 * - Exactly ONE Solid:  every `solid-js` / `@solidjs/*` import resolves from UI's root,
 *   so a linked package can't pick up its own `node_modules` copy.
 *   Checked against the metafile.
 * - No `import()` / `import.meta` may survive:
 *   - string-literal `import()`s (the runtime chunk, emoji data, Temporal polyfill) are inlined
 *   - `supported: { "dynamic-import": false }` turns any computed `import()` (an icon pack's `pack.js`)
 *     into a rejected promise
 * - Icons:  a classic script on `file://` can't load UI's icon packs.
 *   - So the SVGs in `ICONS` are read from UI's `fa7-free` pack at build time,
 *     and `UI.icons.register()`ed by the virtual `spell-ui:icons` module.
 *   - That module also `reset()`s the packs, so the default one is never requested.
 *   - Any other icon name draws nothing.
 * - Emoji names stay LAZY:
 *   UI's emoji data chunks (`dist/emoji/<set>/<letter>-<hash>.js`, both name sets) are NOT inlined.
 *   - Each is written as a classic script, `_assets/emoji/<set>/<letter>.js`,
 *     which a `<script>` tag loads on first use of a name in that chunk
 *     (`spell-ui:emoji` sets `EmojiData.chunkLoader`).
 *   - A page with no `<ui-emoji>` loads none.
 * - The source elements' ENGINES stay lazy the same way (`LAZY`):
 *   - `<ui-code>`'s highlight.js (with all its languages)
 *   - `<ui-markdown>`'s marked (and DOMPurify, only for `sanitized`)
 *   - spell's pre-compiled highlighter
 *
 *   - Each is built from UI's SOURCE into a classic script, `_assets/lazy/<name>.js`.
 *   - Their `dist/` chunks are stubbed out of the bundle,
 *     and `spell-ui:lazy` points UI's loader hooks (`CodeHighlighter.engineLoader` ...) at the scripts.
 *   - A page that shows no code loads none.
 *
 * The DESIGN target (epic `claude-design`, P8):  a claude.ai Design System's `components/bundle.js`.
 *
 *   node tools/bundle-spell-ui.js --design [--out <dir>] [--skip-ui-build]     (yarn design:bundle)
 *
 * - Entry `_assets/spell-ui.design.entry.js`, written to `<dir>/bundle.js`.
 *   - `--out` is relative to the working folder.
 *   - Default `DESIGN_OUT`:  `project/components/` in what `spell dev design build` writes
 *     (UI's `build/design-system/`, ignored by git), which that command leaves in place.
 * - Same esbuild config and resolver as the docs bundle (`bundle()`), but:
 *   - the engines are INLINED, not lazy (Claude Design refuses a relative `<script src>`):
 *     their `dist/` chunks aren't stubbed, so esbuild inlines them like every other string-literal `import()`
 *   - no `_assets/lazy/` or `_assets/emoji/` is written,
 *     and emoji chunks stay empty stand-ins (emoji names draw nothing)
 *   - `spell-ui:icons` registers EVERY Font Awesome Free icon (`designIconsModule()`)
 * - Readers INLINE the file, so `escapeForInlining()` rewrites each `<!--` / `</script` as `\x3C...`.
 *   The build FAILS if one survives, if any `import()` / `import.meta` does, or if it's over `DESIGN_MAX_BYTES`.
 * - No `bundle.css`:  every element adopts its own sheets and the theme its page sheet;
 *   page typography is UI's opt-in `class="ui-typography"` on `<body>`.
 * - The brand's `<ui-brand-*>` elements too (P11):
 *   `@spell-app/brand/design` is the brand's own build of them, `packages/brand/dist/brand-design.js`.
 *   - Built by `vite.design.config.ts`, run first unless `--skip-ui-build`
 *     (Solid JSX needs the Solid compiler, which esbuild isn't).
 *   - Its `$/ui/core` / `$/ui/forms` imports resolve to UI's `dist/`, the modules UI's own elements use,
 *     so there's one `UIComponent` and one `ValueSets`.
 */

import { build } from "esbuild"
import { spawnSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { Script } from "node:vm"
import { gzipSync } from "node:zlib"

/** `packages/docs`. */
const DOCS = resolve(dirname(fileURLToPath(import.meta.url)), "..")
/** `packages/ui`, unless `SPELL_UI_DIR` says otherwise. */
const UI_DIR = resolve(process.env.SPELL_UI_DIR ?? join(DOCS, "../ui"))
/** `packages/brand`:  its elements join the design bundle (P11). */
const BRAND_DIR = join(DOCS, "../brand")
/** The brand's build of its elements for the design bundle (`vite.design.config.ts` there). */
const BRAND_DESIGN = join(BRAND_DIR, "dist/brand-design.js")
const ASSETS = join(DOCS, "tools/_assets")

const args = process.argv.slice(2)
/** Building the design bundle (`--design`), not the docs one. */
const DESIGN = args.includes("--design")
/** Where the design bundle goes by default:  in the design-system folder `spell dev design build` writes. */
const DESIGN_OUT = join(UI_DIR, "build/design-system/project/components")
/** Claude Design's cap on a design system's `bundle.js` (6 MB, counted in decimal to be safe). */
const DESIGN_MAX_BYTES = 6_000_000

const ENTRY = join(ASSETS, DESIGN ? "spell-ui.design.entry.js" : "spell-ui.entry.js")
const OUTFILE = DESIGN ? join(resolve(argValue("--out") ?? DESIGN_OUT), "bundle.js") : join(ASSETS, "spell-ui.js")
/** Page behaviour, the RUNTIME's file;  bundled as an empty module while it doesn't exist yet. */
const PAGE_RUNTIME = join(ASSETS, "spell-doc-runtime.js")

/** UI's Font Awesome pack, where `ICONS`' files are read from. */
const ICON_PACK = join(UI_DIR, "src/icons/icon-packs/fa7-free")

/**
 * Packs the design bundle inlines WHOLE, in order:  the first to give a name keeps it (`designIconsModule()`).
 * - `fa7-free`:  solid + regular (`… outline`) + its few brand extras, UI's default pack
 * - `fa7-brands`:  every brand;  only fills names `fa7-free` doesn't give, so a name means what it means on any page
 */
const DESIGN_PACKS = ["fa7-free", "fa7-brands"].map((id) => join(UI_DIR, "src/icons/icon-packs", id))

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
  "solid/chevron-up": ["chevron up"], // a plan item's fold button (`spell-doc-runtime.js` `wireItemFolds()`)
  "solid/link": ["link"],
  "solid/copy": ["copy"],
  "solid/bars": ["bars"],
  // spell-ui-site.html sections
  "solid/table-columns": ["table columns"],
  "solid/sun": ["sun"],
  "solid/moon": ["moon"], // dark mode
  // a plan doc's bedtime label (`<epic-page bedtime>`):  a /bedtime run is on
  "solid/bed": ["bed"],
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
  // the pony (`brand/pony.html`, epic `claude-design`)
  "solid/horse": ["horse"],
  "solid/comment": ["comment"],
  // a guide comment (`spell-doc-runtime.js`, "Guide comments"):  beside each block, on each comment
  "solid/bullhorn": ["bullhorn"],
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
  // a plan doc's "Durable doc:" line (and a durable doc's "Plan doc:" line is `map`)
  "solid/book": ["book"],
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
  // review notes:  an item Owen wrote in (outline:  a draft;  solid `comment`:  sent), and Edit on a sent note
  "regular/comment": ["comment outline"],
  // review note box (epic `windows-and-review` P2):  Later (revisit soon), and the note's Saved mark
  "regular/clock": ["clock outline"],
  "regular/floppy-disk": ["floppy disk outline"],
  "solid/arrows-rotate": ["arrows rotate", "refresh"],
  "solid/up-right-from-square": ["up right from square", "external alternate"],
  "solid/right-to-bracket": ["right to bracket", "sign in"],
  "solid/download": ["download"],
  "solid/paper-plane": ["paper plane"], // the header's Send;  a todo's "do it in the next phase" (epics)
  // new items from a plan doc's page (epics `<epic-new-item>`):  the `+`;  a waiting card's Edit and Remove
  "solid/plus": ["plus"],
  "solid/pen": ["pen"],
  "solid/trash-can": ["trash can"],
  "solid/rotate-left": ["rotate left", "undo alternate"], // Undo, in the toast after a comment's deleted
  "solid/plug": ["plug"],
  "solid/circle-play": ["circle play"],
  "solid/circle-pause": ["circle pause"], // an epic's state:  paused (`$/server/site/EpicState`)
  // an Epics card's star (`$/server/site/EpicCards`):  a favourite, or not;  the Favorites group's heading
  "solid/star": ["star"],
  "regular/star": ["star outline"],
  // plan docs' review (epic `review-review`):
  // section icons, the item action menu and filter, the page header's send / files / git buttons
  "solid/file-circle-question": ["file circle question"],
  "solid/filter": ["filter"],
  "solid/ellipsis": ["ellipsis", "ellipsis horizontal"],
  "regular/circle-check": ["circle check outline", "check circle outline"],
  "regular/paper-plane": ["paper plane outline"],
  "regular/circle-right": ["circle right"],
  "regular/folder": ["folder outline"],
  "../fa7-brands/brands/git-alt": ["git", "git alt"] // the brands pack, beside `ICON_PACK`
}

/** Bare specifiers that MUST resolve from UI's root:  Solid, all subpaths. */
const SOLID = /^(solid-js|@solidjs\/[\w-]+)(\/.*)?$/

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
    name: "markdown-sanitizer",
    global: "__spellMarkdownSanitizer",
    source: join(UI_DIR, "src/components/ui-markdown/MarkdownSanitizer.ts"),
    chunk: /(?:^|\/)MarkdownSanitizer-[\w-]+\.js$/,
    hook: `MarkdownRenderer.sanitizerLoader = () => lazy("markdown-sanitizer", "__spellMarkdownSanitizer")`
  },
  {
    name: "spell-en",
    global: "__spellHighlightEn",
    source: join(UI_DIR, "src/languages/spell.en.bundle.js"),
    chunk: /(?:^|\/)spell\.en-[\w-]+\.js$/,
    hook: `SpellLanguage.bundleLoader = (variant) => variant === "en" ? lazy("spell-en", "__spellHighlightEn") : undefined`
  }
]

if (!args.includes("--skip-ui-build")) {
  buildUI()
  if (DESIGN) buildBrand()
}
if (!DESIGN) {
  writeEmojiChunks()
  await writeLazyScripts()
}
const warnings = await bundle()
report(warnings)

////////////////
// ## UI build
////////////////

/**
 * Builds UI from its working tree -- "latest UI" is whatever is checked out there.
 * - `yarn build` type-checks first;  in-progress UI work may not, so fall back to `vite build` rather than fail.
 */
function buildUI() {
  if (!existsSync(join(UI_DIR, "package.json"))) fail(`no UI checkout at ${UI_DIR} (set SPELL_UI_DIR)`)
  if (run("yarn", ["build"], "build @spell-app/ui (tsc + vite)", { allowFailure: true })) return
  console.warn("!! UI's tsc failed:  building with `vite build` alone (the bundle may carry type errors)")
  run("yarn", ["vite", "build"], "build @spell-app/ui (vite only)")
}

/** Builds the brand's elements for the design bundle, `BRAND_DESIGN`, from its working tree (P11). */
function buildBrand() {
  run("yarn", ["vp", "build", "--config", "vite.design.config.ts"], "build the brand elements (@spell-app/brand)", {
    cwd: BRAND_DIR
  })
}

/**
 * Runs `command` in UI's folder (or `cwd`), quietly;  prints its output only if it fails.
 * - Returns whether it succeeded;  exits unless `allowFailure`.
 */
function run(command, commandArgs, label, { allowFailure = false, cwd = UI_DIR } = {}) {
  console.log(`-- ${label}`)
  const result = spawnSync(command, commandArgs, { cwd, encoding: "utf8", shell: false })
  if (result.status === 0) return true
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}${result.error ?? ""}`.trim()
  console.error(output.split("\n").slice(-40).join("\n"))
  if (!allowFailure) fail(`${command} ${commandArgs.join(" ")} failed in ${cwd}`)
  return false
}

////////////////
// ## Bundle
////////////////

/**
 * Bundles the entry into `OUTFILE`, then checks the output is safe for a classic script on `file://`.
 * - Design target:  also escaped for inlining, and checked for that and for size (`checkDesignBundle()`).
 * - Returns esbuild's warnings, as text.
 */
async function bundle() {
  const dist = join(UI_DIR, "dist/index.js")
  if (!existsSync(dist)) fail(`${relative(DOCS, dist)} is missing:  run without --skip-ui-build`)
  mkdirSync(dirname(OUTFILE), { recursive: true })
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
  if (DESIGN) escapeForInlining()
  checkClassicScript()
  if (DESIGN) checkDesignBundle()
  return result.warnings.map((warning) => `${warning.location?.file ?? ""}: ${warning.text}`)
}

/**
 * esbuild plugin wiring the entry to UI:
 * - `@spell-app/ui` ~== `dist/index.js`, `@spell-app/ui/<entry>` ~== `dist/<entry>.js`
 *   (mirrors UI's `package.json` `exports`)
 * - Solid imports resolve from UI's root (`SOLID`), whoever imports them
 * - `spell-ui:icons`:  the generated icon registrations (`iconsModule()`)
 * - the page runtime:  an empty module until its file exists
 * - design target:
 *   `@spell-app/brand/design` ~== `BRAND_DESIGN`, and the `$/ui/<entry>` it imports ~== UI's `dist/<entry>.js`
 */
function spellUiResolver() {
  return {
    name: "spell-ui-resolver",
    setup(pluginBuild) {
      pluginBuild.onResolve({ filter: /^spell-ui:icons$/ }, () => ({ path: "icons", namespace: "spell-ui" }))
      pluginBuild.onResolve({ filter: /^spell-ui:emoji$/ }, () => ({ path: "emoji", namespace: "spell-ui" }))
      pluginBuild.onResolve({ filter: /^spell-ui:lazy$/ }, () => ({ path: "lazy", namespace: "spell-ui" }))
      // the engines' `dist/` chunks:  never inlined (`spell-ui:lazy` loads them as scripts);  an empty stand-in.
      // The design bundle inlines them instead:  it can't load a script of its own.
      for (const { chunk } of DESIGN ? [] : LAZY) {
        pluginBuild.onResolve({ filter: chunk }, () => ({ path: "lazy-chunk", namespace: "spell-ui" }))
      }
      // UI's emoji data chunks:  never inlined (`EmojiData.chunkLoader` loads them as scripts);  an empty stand-in
      pluginBuild.onResolve({ filter: EMOJI_CHUNK }, () => ({ path: "emoji-chunk", namespace: "spell-ui" }))
      pluginBuild.onLoad({ filter: /.*/, namespace: "spell-ui" }, async (loaded) => {
        if (loaded.path === "icons") {
          return { contents: DESIGN ? await designIconsModule() : iconsModule(), resolveDir: ASSETS, loader: "js" }
        }
        if (loaded.path === "emoji") return { contents: emojiModule(), resolveDir: ASSETS, loader: "js" }
        if (loaded.path === "emoji-chunk") return { contents: "export default {}", loader: "js" }
        if (loaded.path === "lazy") return { contents: lazyModule(), resolveDir: ASSETS, loader: "js" }
        if (loaded.path === "lazy-chunk") return { contents: "export {}", loader: "js" }
        return { contents: "", loader: "js" }
      })
      pluginBuild.onResolve({ filter: /^@spell-app\/ui(\/.*)?$/ }, ({ path }) => ({ path: uiDistPath(path) }))
      pluginBuild.onResolve({ filter: /^@spell-app\/brand\/design$/ }, () => {
        if (!existsSync(BRAND_DESIGN)) fail(`${relative(DOCS, BRAND_DESIGN)} is missing:  run without --skip-ui-build`)
        return { path: BRAND_DESIGN }
      })
      pluginBuild.onResolve({ filter: /^\$\/ui(\/.*)?$/ }, ({ path }) => {
        const file = uiDistPath(`@spell-app/ui${path.slice("$/ui".length)}`)
        if (!existsSync(file)) fail(`${path} (a brand element's import) has no ${relative(DOCS, file)}`)
        return { path: file }
      })
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
 * - Imports `UI` from `@spell-app/ui/core` -- the same module `index.js` uses --
 *   so this runs BEFORE any family defines (and so upgrades) its elements.
 * - Registers in the FIRST `UI.load()` callback:
 *   every element `await`s that same promise before drawing an icon, so the names are in place first.
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
 * Source of `spell-ui:icons` for the DESIGN bundle:
 * every icon of `DESIGN_PACKS`, so any Font Awesome Free name draws, with no pack to load.
 * - Names as UI's packs give them (`IconName.claim()` on each index:  file name, `… outline`, FA's aliases);
 *   across packs the FIRST to give a name keeps it;
 *   then `ICONS`' names on top, so widgets' own names (`close`, `search`) mean what they mean in the docs bundle.
 * - The SVGs travel as ONE string, an `<svg>` holding each icon's `<svg>` in order,
 *   parsed once (one `DOMParser` call, not ~2,200).
 *   - `NAMES[i]` are the names of its `i`th child.
 *   - Each is `register()`ed under each name in the first `UI.load()` callback, after `reset()`, like `iconsModule()`.
 * - Each file's licence comment is stripped (they're all one text, and `<!--` can't be in the bundle anyway):
 *   the text goes ONCE into a `/*!` legal comment, which esbuild keeps at the end.
 * - Their `xmlns` too:  the outer `<svg>` gives it.
 * - NOTE:  `register()`ed icons answer plain names only:  `fa7-free:bell` (a `prefix:` name) draws nothing here.
 */
async function designIconsModule() {
  const { IconName } = await import(pathToFileURL(join(UI_DIR, "src/icons/IconName.ts")).href)
  /** normalized name -> SVG file */
  const files = new Map()
  for (const folder of DESIGN_PACKS) {
    const index = (await import(pathToFileURL(join(folder, "pack.js")).href)).default
    const claimed = IconName.claim(Object.entries(index.icons).map(([key, entry]) => [key, entry.alias]))
    for (const [name, key] of claimed) if (!files.has(name)) files.set(name, join(folder, `${key}.svg`))
  }
  for (const [file, names] of Object.entries(ICONS)) {
    for (const name of names) files.set(IconName.normalize(name), join(ICON_PACK, `${file}.svg`))
  }
  /** SVG file -> its names, in first-claimed order */
  const namesOf = new Map()
  for (const [name, file] of files) namesOf.set(file, [...(namesOf.get(file) ?? []), name])
  const licenses = new Set()
  const svgs = [...namesOf.keys()].map((file) => {
    if (!existsSync(file)) fail(`no icon ${relative(DOCS, file)}`)
    const svg = readFileSync(file, "utf8")
      .trim()
      .replace(/<!--!?\s*([\s\S]*?)\s*-->/g, (_comment, text) => (licenses.add(text), ""))
      .replace(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/, "<svg")
    if (!svg.startsWith("<svg") || svg.includes("<!--")) fail(`${relative(DOCS, file)}:  not one plain <svg>`)
    return svg
  })
  console.log(`-- icons:  ${svgs.length} SVGs, ${files.size} names`)
  return [
    ...[...licenses].map((text) => `/*! ${text.replaceAll("*/", "* /")} */`),
    `import { UI } from "@spell-app/ui/core"`,
    `const SHEET = ${JSON.stringify(`<svg xmlns="http://www.w3.org/2000/svg">${svgs.join("")}</svg>`)}`,
    `const NAMES = ${JSON.stringify([...namesOf.values()])}`,
    `UI.load().then((ui) => {`,
    `  ui.icons.reset()`,
    `  const icons = new DOMParser().parseFromString(SHEET, "image/svg+xml").documentElement.children`,
    `  NAMES.forEach((names, at) => { for (const name of names) ui.icons.register(name, icons[at]) })`,
    `})`
  ].join("\n")
}

/**
 * Source of `bundleUrl(dir)`, shared by `spell-ui:emoji` and `spell-ui:lazy`:
 * the folder `dir` next to the bundle, or `null` where there's no URL to resolve against.
 * - NEVER throws while the bundle loads (epic `claude-design`, P1).
 *   An INLINED copy (a claude.ai design system's preview inlines it):
 *   - has `document.currentScript.src === ""`, so `??` wouldn't fall back
 *   - and its frame's `location.href` is `about:srcdoc`, which no relative URL resolves against
 * - `null`:  `new URL(x, null)` throws inside the loaders' promise executors, so a lazy script rejects instead
 * - a function, not a `const`:  the build runs from the top of this file, before a `const` down here is set
 */
function baseUrlSource() {
  return [
    `function bundleUrl(dir) {`,
    `  try {`,
    `    return new URL(dir, document.currentScript?.src || location.href)`,
    `  } catch {`,
    `    return null`,
    `  }`,
    `}`
  ].join("\n")
}

/**
 * Source of `spell-ui:emoji`:
 * `EmojiData.chunkLoader` loads a name chunk as the classic script `emoji/<set>/<letter>.js` next to the bundle,
 * which hands its names to `__spellEmojiChunk()`.
 * - The bundle's own URL (`document.currentScript`, read while it runs) locates the scripts, at any page depth.
 */
function emojiModule() {
  return [
    `import { EmojiData } from "@spell-app/ui/ui-emoji"`,
    baseUrlSource(),
    `const base = bundleUrl("emoji/")`,
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
 * Writes every emoji name chunk of UI's data (`<set>/<letter>.json`) as `_assets/emoji/<set>/<letter>.js`:
 * a classic script handing its names to `__spellEmojiChunk()`.
 * The folder is emptied first, so a dropped chunk doesn't linger.
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
        `// generated by tools/bundle-spell-ui.js:  edit UI's data\n${body}`
      )
      files++
    }
  }
  console.log(`-- _assets/emoji/  ${files} lazy name chunks`)
}

////////////////
// ## Checks
////////////////

/** Fails if two copies of a Solid package made it into the bundle, e.g. from a linked package's own `node_modules`. */
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

/**
 * Rewrites every `<!--` and `</script` in the design bundle as `\x3C!--` / `\x3C/script` (caveat C5):
 * readers INLINE a design system's `bundle.js` into a `<script>`, where either would end it or change how it parses.
 * - Same meaning wherever minified code has them:
 *   in a string, a template or a regex `\x3C` IS `<`;  in a comment it's just text.
 * - An odd run of backslashes before the `<` already escaped it (`\<`):  one is dropped.
 * - SIDE EFFECT:  rewrites `OUTFILE`;  `checkDesignBundle()` then proves none survive and it still parses.
 */
function escapeForInlining() {
  let count = 0
  const code = readFileSync(OUTFILE, "utf8").replace(/(\\*)<(?=!--|\/script)/gi, (_match, slashes) => {
    count++
    return `${slashes.length % 2 ? slashes.slice(1) : slashes}\\x3C`
  })
  writeFileSync(OUTFILE, code)
  console.log(`-- escaped ${count} <!-- / </script for inlining`)
}

/**
 * Fails unless the design bundle is fit for a claude.ai design system:
 * no `<!--` or `</script` left, still a script that parses, at most `DESIGN_MAX_BYTES`.
 */
function checkDesignBundle() {
  const code = readFileSync(OUTFILE, "utf8")
  if (/<!--|<\/script/i.test(code)) fail(`${OUTFILE} still has a <!-- or </script`)
  try {
    new Script(code, { filename: OUTFILE })
  } catch (error) {
    fail(`${OUTFILE} no longer parses after escaping:  ${error}`)
  }
  const bytes = Buffer.byteLength(code)
  if (bytes > DESIGN_MAX_BYTES) fail(`${OUTFILE} is ${bytes} bytes:  over Claude Design's ${DESIGN_MAX_BYTES}`)
}

////////////////
// ## Lazy engines
////////////////

/**
 * Builds each of `LAZY` from UI's source into `_assets/lazy/<name>.js`:
 * a classic script (IIFE) defining its `global` as the module's exports, every `import()` inside it inlined.
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
 * Source of `spell-ui:lazy`:  points UI's engine loaders at `lazy/<name>.js`,
 * loaded once as a classic script next to the bundle, resolving with the global it defines.
 * - The bundle's own URL (`document.currentScript`, read while it runs) locates the scripts, at any page depth.
 */
function lazyModule() {
  return [
    `import { CodeHighlighter, SpellLanguage } from "@spell-app/ui/ui-code"`,
    `import { MarkdownRenderer } from "@spell-app/ui/ui-markdown"`,
    baseUrlSource(),
    `const base = bundleUrl("lazy/")`,
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
  // relative inside the checkout, else (an `--out` elsewhere) absolute
  const shown = relative(resolve(DOCS, "../.."), OUTFILE).startsWith("..") ? OUTFILE : relative(DOCS, OUTFILE)
  console.log(`-- ${shown}  ${kb(code.length)}  (gzip ${kb(gzipSync(code).length)})`)
  for (const warning of warnings) console.warn(`!! ${warning}`)
}

/** Value after flag `name` (`--out <dir>`), or `undefined`;  exits if the flag has none. */
function argValue(name) {
  const at = args.indexOf(name)
  if (at < 0) return undefined
  const value = args[at + 1]
  if (!value || value.startsWith("--")) fail(`${name} needs a value`)
  return value
}

/** Prints `message` and exits with an error. */
function fail(message) {
  console.error(`!! ${message}`)
  process.exit(1)
}
