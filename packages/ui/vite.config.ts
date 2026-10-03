import solid from "@solidjs/vite-plugin"
import { defineConfig, type Plugin, type UserConfig } from "vite"
import dts, { type PluginOptions } from "vite-plugin-dts"
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { standardDecorators } from "../../vite.decorators.ts"
// the fork's HMR plugin from SOURCE, not `@spell-app/solid-element/vite`:  Vite bundles this config with every BARE
// import external, so Node would load the package's `dist/vite.js`, which a fresh checkout doesn't have yet
// (Node 22.17 can't load the `.ts`).  A relative import is bundled into the config instead.  See `AGENTS.md`.
import { solidElementHot } from "../solid-element/src/vite.ts"

/** Absolute path of `src/`. */
const SRC = fileURLToPath(new URL("./src", import.meta.url))

/**
 * Browsers the CSS is compiled FOR:  the platform floor the plan commits to (anchor positioning everywhere).
 * - MUST stay modern:  with Vite's default (`baseline-widely-available`) Lightning CSS lowers `light-dark()`
 *   into `--lightningcss-light` variables resolved where a token is DECLARED, which freezes `:root`'s colour
 *   scheme into `.ui-dark` subtrees, and adds hex fallbacks for every `oklch()`.  `styles.test.ts` checks.
 * - Lightning CSS encodes versions as `major << 16 | minor << 8`.
 */
export const CSS_TARGETS = { chrome: 125 << 16, safari: 26 << 16, firefox: 147 << 16 }

/** Component families, one lib entry each (`src/components/ui-<name>/index.ts`), so each can be loaded and sized alone. */
export const COMPONENTS = [
  "ui-button",
  "ui-dropdown",
  "ui-icon",
  "ui-label",
  "ui-parts",
  "ui-divider",
  "ui-segment",
  "ui-container",
  "ui-grid",
  "ui-image",
  "ui-text",
  "ui-flag",
  "ui-loader",
  "ui-placeholder",
  "ui-message",
  "ui-breadcrumb",
  "ui-input",
  "ui-checkbox",
  "ui-form",
  "ui-item",
  "ui-list",
  "ui-menu",
  "ui-table",
  "ui-popup",
  "ui-modal",
  "ui-transition",
  "ui-dimmer",
  "ui-flyout",
  "ui-sidebar",
  "ui-shape",
  "ui-card",
  "ui-items",
  "ui-feed",
  "ui-comment",
  "ui-statistic",
  "ui-step",
  "ui-rail",
  "ui-reveal",
  "ui-ad",
  "ui-emoji",
  "ui-select",
  "ui-search",
  "ui-progress",
  "ui-rating",
  "ui-slider",
  "ui-accordion",
  "ui-tab",
  "ui-toast",
  "ui-nag",
  "ui-sticky",
  "ui-visibility",
  "ui-embed",
  "ui-calendar",
  "ui-root",
  "ui-section",
  "ui-include"
] as const

/**
 * Shared entries, in load order:  every family imports `core`;  only families with a form VALUE import `forms`.
 * - `name` => source file;  `yarn measure` attributes each module to one of them (`tools/package.config.ts`).
 */
export const SHARED_ENTRIES = { core: `${SRC}/core.ts`, forms: `${SRC}/forms.ts` } as const

/**
 * Library entries, by output name:
 * - `core`, `forms` -- the shared entries (`SHARED_ENTRIES`);  no family inlines them
 * - one per family
 * - `index` -- every family, for pages that want them all
 * - `api` -- the `E` / `V` namespaces, for apps only (`src/api.ts`)
 */
export const ENTRIES: Record<string, string> = {
  ...SHARED_ENTRIES,
  ...Object.fromEntries(COMPONENTS.map((name) => [name, `${SRC}/components/${name}/index.ts`])),
  styles: `${SRC}/styles/index.ts`,
  index: `${SRC}/index.ts`,
  api: `${SRC}/api.ts`
}

/**
 * Solid's packages, subpaths included (`solid-js/web`, `@solidjs/web`, `@solidjs/signals`), and our element
 * layer fork:  PEER dependencies, never bundled.  The app (or an import map, see `yarn vendor`) supplies ONE copy,
 * so the app's owners, context and signals reach the components.
 */
export const SOLID_EXTERNAL = /^solid-js(\/|$)|^@solidjs\/|^@spell-app\/solid-element(\/|$)/

/**
 * Packages that MUST resolve to one copy:  the linked fork (`packages/solid-element`) resolves its imports from its
 * OWN `node_modules` otherwise, and two Solids can't share owners (`PAPERCUTS.md`).
 */
export const SOLID_DEDUPE = ["solid-js", "@solidjs/web"]

/**
 * Config shared by the library build / dev server (below), `vitest.config.ts` and the docs site:  plugins, aliases,
 * dedupe, Lightning CSS.
 * - Aliases (`$/ui`, `$/ui/test`, `$/util` ...) come from the repo root's `tsconfig.base.json`, through
 *   `resolve.tsconfigPaths`.  A FUNCTION, so every caller gets its own plugin instances.
 * - `standardDecorators()` MUST come first:  both it and the Solid plugin are `enforce: "pre"`, and the Solid
 *   compiler must see decorator-free code.
 * - `UI_SOLID_PROD=1`:  Solid's PRODUCTION runtime under `vite dev` (no dev diagnostics, no performance tracks),
 *   for timing `tools/demo/perf.html`.
 * - `optimizeDeps`:  `axe-core` and `temporal-polyfill` (only a Temporal-less page imports it) pre-bundled up
 *   front, so the first test run doesn't reload mid-run;  NOT
 *   `@spell-app/solid-element`:  it's linked TypeScript source (its `development` export), compiled by the Solid
 *   plugin like our own files.
 */
export function baseConfig() {
  const production = process.env.UI_SOLID_PROD ? { dev: false, performanceTracks: false } : {}
  return {
    plugins: [standardDecorators(), solid(production)],
    resolve: {
      tsconfigPaths: true,
      dedupe: SOLID_DEDUPE
    },
    optimizeDeps: {
      include: ["axe-core", "temporal-polyfill"],
      exclude: ["@spell-app/solid-element"]
    },
    css: {
      transformer: "lightningcss",
      lightningcss: {
        targets: CSS_TARGETS,
        drafts: { customMedia: true }
      }
    }
  } satisfies UserConfig
}

/**
 * Library build of `@spell-app/ui`, and the dev server (`yarn dev`:  `tools/demo/`).
 * - ESM only:  every consumer we target (bundlers, `<script type="module">`, frameworks) speaks it.
 * - `solid-js`, `@solidjs/web` and `@spell-app/solid-element` are external (`SOLID_EXTERNAL`);  the `UIRuntime` and
 *   icon packs are separate files (`emitIconPacks()`).
 * - `preserveEntrySignatures: "allow-extension"`:  lets `core.js` / `button.js` ... hold their own code and export
 *   what siblings need, instead of Vite's lib-mode default (`strict`), which turns every entry into a facade over
 *   a hashed chunk.
 * - `css.transformer: "lightningcss"` so component CSS gets nesting / `@custom-media` lowering with the same engine
 *   that minifies it.  NOTE: postcss is never used.
 * - `vite-plugin-dts` emits `.d.ts` for consumers, laid out like `exports` says (`declarations()`).
 */
export default defineConfig(() => {
  const base = baseConfig()
  return {
    ...base,
    plugins: [...base.plugins, hotElements(), emitIconPacks(), dts(declarations())],
    build: {
      outDir: "dist",
      emptyOutDir: true,
      sourcemap: true,
      lib: { entry: ENTRIES, formats: ["es"] },
      // the build's CSS MINIFY reads `cssTarget`, not `css.lightningcss.targets`:  left at Vite's default (older
      // Safari) it lowered `light-dark()` into `--lightningcss-light` variables fixed at `:root`, so `.ui-dark` /
      // `<ui-root theme="dark">` changed nothing in `dist/` (dev and tests were fine).  Same browsers as `CSS_TARGETS`.
      cssTarget: ["chrome125", "safari26", "firefox147"],
      rolldownOptions: {
        external: (id: string) => SOLID_EXTERNAL.test(id),
        preserveEntrySignatures: "allow-extension",
        output: {
          // MUST stay on:  custom element class names are read by the manifest and dev-time warnings --
          // see `vite.decorators.ts`.
          keepNames: true,
          chunkFileNames: emojiChunkNames
        }
      }
    }
  } satisfies UserConfig
})

/**
 * Chunk file names:  an emoji data chunk (`src/components/ui-emoji/data/<set>/<letter>.json`) goes to
 * `emoji/<set>/<letter>-[hash].js`, so the two name sets' chunks are told apart -- by a reader of `dist/`, and by the
 * docs' single-file bundler, which loads them lazily instead of inlining them (`packages/docs/scripts/bundle-spell-ui.js`).
 */
function emojiChunkNames(chunk: { facadeModuleId: string | null; moduleIds: readonly string[] }): string {
  const data = EMOJI_DATA.exec(chunk.facadeModuleId ?? chunk.moduleIds[0] ?? "")
  return data ? `emoji/${data[1]}/${data[2]}-[hash].js` : "[name]-[hash].js"
}

/** An emoji data module's id:  its set and chunk letter. */
const EMOJI_DATA = /\/components\/ui-emoji\/data\/([\w-]+)\/(\w+)\.json$/

/**
 * `vite-plugin-dts` options for the published declarations:  `dist/index.d.ts`, `dist/core.d.ts`,
 * `dist/components/ui-<name>/index.d.ts` ... -- the paths `package.json` `exports` names.
 * - `src/` imports `$/util` (`../util/src`, OUTSIDE this package), so the program's root is `packages/`
 *   (`compilerOptions.rootDir`, else TS6059) and both `src/` trees are included.
 * - Then `beforeWriteFile` moves what the plugin wrote to `dist/ui/src/**` up to `dist/**`, and
 *   `dist/util/src/**` to `dist/_util/**` (not `dist/util/`:  that's `src/util/`'s), and rewrites `$/util` and `$/ui`
 *   specifiers to relative ones.  `pathsToAliases: false`:  the plugin's own rewrite measures from the layout
 *   BEFORE the move, and gets `../packages/ui/src/...`.
 * - `?inline` CSS imports (`styles/index.ts`) become `declare const x: string`:  only `vite/client` types them.
 * - Why not `bundleTypes`:  it rolls each entry up on its own, so a class like `UIElement` is copied into every
 *   entry that reaches it, and a class with private members is a DIFFERENT type in each copy.  Per-file
 *   declarations keep one `UIElement` for `@spell-app/ui/core` and `@spell-app/ui/ui-button` alike.
 * - `util` is not published on its own, so its GENERIC declarations ship inside `@spell-app/ui`.  NOT `util/src/spell/` or
 *   `util`'s barrel (which flattens it in):  `exclude` lists them, and `src/util/index.ts` imports file by file.
 * - MUST end with NO `$/` alias in `dist/**.d.ts` and no path outside `dist/`;  `yarn smoke` checks.
 */
export function declarations(): PluginOptions {
  return {
    include: ["src", "../util/src"],
    exclude: [
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
      // visual-test hooks:  they import `test/test.types.ts`, whose `vitest` augmentations this program can't resolve
      "src/**/*.visual.ts",
      "../util/src/**/*.test.ts",
      "../util/src/spell/**",
      "../util/src/index.ts"
    ],
    entryRoot: "..",
    compilerOptions: { rootDir: ".." },
    pathsToAliases: false,
    beforeWriteFile: rewriteDeclaration
  }
}

/**
 * `declarations()`'s `beforeWriteFile`:  where a `.d.ts` goes in `dist/`, and its imports made to match.
 * - Returns `false` (skip) for anything outside `ui/src` and `util/src`.
 * - Only import / export STATEMENTS are rewritten (`from "..."`, `import("...")`):  doc comments may mention aliases.
 * - A specifier is resolved against the SOURCE tree, then expressed in `dist/` terms.  A folder becomes
 *   `<folder>/index`:  `dist/styles.js` (a lib entry) sits beside `dist/styles/`, and TypeScript would pick the `.js`.
 * - `import sheet from "./x.css?inline"` (`styles/index.ts`) is typed by `vite/client`, which a consumer may not
 *   have:  the sheets are plain strings.
 */
function rewriteDeclaration(filePath: string, content: string) {
  const dist = path.resolve("dist")
  const uiSrc = path.resolve("src")
  const utilSrc = path.resolve("../util/src")
  const written = path.relative(dist, filePath).split(path.sep).join("/")
  const moved = written.startsWith("ui/src/")
    ? written.slice("ui/src/".length)
    : written.startsWith("util/src/")
      ? `_util/${written.slice("util/src/".length)}`
      : undefined
  if (!moved) return false
  const fromDir = path.posix.dirname(moved)
  const sourceDir = moved.startsWith("_util/")
    ? path.join(utilSrc, path.dirname(moved.slice("_util/".length)))
    : path.join(uiSrc, path.dirname(moved))

  const code = content
    .replace(/(from |import\()(["'])(\$\/[^"']+|\.\.?\/[^"']*)\2/g, (_, start, quote, specifier: string) => {
      const source = specifier.startsWith(".")
        ? path.resolve(sourceDir, specifier)
        : specifier === "$/util" || specifier.startsWith("$/util/")
          ? path.join(utilSrc, specifier.slice("$/util".length) || "index")
          : specifier === "$/ui"
            ? path.join(uiSrc, "index")
            : path.join(uiSrc, specifier.slice("$/ui/".length))
      const file = existsSync(source) && statSync(source).isDirectory() ? path.join(source, "index") : source
      const target = file.startsWith(`${utilSrc}${path.sep}`)
        ? `_util/${path.relative(utilSrc, file)}`
        : path.relative(uiSrc, file)
      const relativeTarget = path.posix.relative(fromDir, target.split(path.sep).join("/"))
      return `${start}${quote}${relativeTarget.startsWith(".") ? relativeTarget : `./${relativeTarget}`}${quote}`
    })
    .replace(/^import \{ default as (\w+) \} from ["'][^"']+\?inline["'];?$/gm, "declare const $1: string;")
  return { filePath: path.join(dist, moved), content: code }
}

/**
 * Hot module replacement for the components in `yarn dev` (the fork's `solidElementHot()`;  `apply: "serve"`, so
 * builds are untouched, and NOT in `vitest.config.ts`).
 * - Boundaries:  the component barrels (`src/components/ui-<name>/index.ts`), the modules that call `define()`.
 *   An edit to a component class, vocabulary or fallback re-runs its barrel;  `HotDefinitions` turns the barrel's
 *   `define()` of a new version of a class into a re-definition of every tag it had.
 * - `?inline` component CSS (`src/components/ui-<name>/ui-<name>.css`) re-registers its sheet:  no re-render.
 * - Shared code (`core`, `forms`, the runtime) reaches several barrels:  full reload.
 * - `HotDefinitions` is injected by FILE PATH, not `$/ui/elements/HotDefinitions`:  `resolve.tsconfigPaths` only
 *   resolves aliases for TS / JS importers, and the sheets' handler import lives in a `.css?inline` module.
 */
function hotElements(): Plugin {
  const hotDefinitions = `${SRC}/elements/HotDefinitions.ts`
  // HACK: the fork is its own yarn project, so its `Plugin` type comes from ITS `vite` install:  the same version,
  // but a second declaration TypeScript won't unify (a `tsconfig` `paths` pin would also redirect `tsx`'s runtime
  // resolution of `vite` to a `.d.ts`)
  const plugin: unknown = solidElementHot({
    include: /\/src\/components\/[\w-]+\/index\.ts$/,
    detect: /\.define\(/,
    setup: hotDefinitions,
    styles: {
      include: /\/src\/components\/[\w-]+\/[\w-]+\.css\?inline$/,
      handler: hotDefinitions,
      call: "HotDefinitions.updateStyle"
    }
  })
  return plugin as Plugin
}

/**
 * Copies the built-in icon packs, `src/icons/icon-packs/**` (SVGs + each `pack.js`), to `<dir>/**` in the build output,
 * next to the chunks, where `BuiltInPacks` looks via `import.meta.url` (`docs/icons.md`, "Shipping icons").
 * - Library build:  `BuiltInPacks` lives in `dist/core.js` (the `core` entry re-exports `$/ui/icons`), so `dist/icon-packs/`.
 * - Docs site:  Astro puts client chunks in `_astro/`, so `emitIconPacks("_astro/icon-packs")` (`site/astro.config.mjs`).
 * - Copied as ASSETS, never bundled:  the runtime imports each `pack.js` by URL, on demand.
 * - Client builds only:  a server / prerender build (Astro's) needs no icon files.
 */
export function emitIconPacks(dir = "icon-packs"): Plugin {
  const root = fileURLToPath(new URL("./src/icons/icon-packs", import.meta.url))
  return {
    name: "spell-emit-icon-packs",
    apply: "build",
    generateBundle() {
      if (this.environment.name !== "client") return
      for (const entry of readdirSync(root, { recursive: true, withFileTypes: true })) {
        if (!entry.isFile() || !ICON_PACK_FILE.test(entry.name)) continue
        const file = path.join(entry.parentPath, entry.name)
        this.emitFile({ type: "asset", fileName: `${dir}/${path.relative(root, file)}`, source: readFileSync(file) })
      }
    }
  }
}

/** Files of an icon pack:  its SVGs and its `pack.js` index. */
const ICON_PACK_FILE = /\.(svg|js)$/
