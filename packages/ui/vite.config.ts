import solid from "@solidjs/vite-plugin"
import { defineConfig, type Plugin, type UserConfig } from "vite"
import dts from "vite-plugin-dts"
import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { standardDecorators } from "./vite.decorators.ts"
// the fork's HMR plugin from SOURCE, not `@spell/solid-element/vite`:  Vite bundles this config with every BARE
// import external, so Node would load the package's `dist/vite.js`, which a fresh checkout doesn't have yet
// (Node 22.17 can't load the `.ts`).  A relative import is bundled into the config instead.  See `AGENTS.md`.
import { solidElementHot } from "./packages/solid-element/src/vite.ts"

/** Absolute path of `src/`, target of the `$` import alias. */
const SRC = fileURLToPath(new URL("./src", import.meta.url))
/** Absolute path of `test/`, target of the `$test` import alias (test helpers only). */
const TEST = fileURLToPath(new URL("./test", import.meta.url))

/**
 * Browsers the CSS is compiled FOR:  the platform floor the plan commits to (anchor positioning everywhere).
 * - MUST stay modern:  with Vite's default (`baseline-widely-available`) Lightning CSS lowers `light-dark()`
 *   into `--lightningcss-light` variables resolved where a token is DECLARED, which freezes `:root`'s colour
 *   scheme into `.ui-dark` subtrees, and adds hex fallbacks for every `oklch()`.  `styles.test.ts` checks.
 * - Lightning CSS encodes versions as `major << 16 | minor << 8`.
 */
export const CSS_TARGETS = { chrome: 125 << 16, safari: 26 << 16, firefox: 147 << 16 }

/** Component families, one lib entry each (`src/components/<name>/index.ts`), so each can be loaded and sized alone. */
export const COMPONENTS = [
  "button",
  "dropdown",
  "icon",
  "label",
  "parts",
  "divider",
  "segment",
  "container",
  "grid",
  "image",
  "text",
  "flag",
  "loader",
  "placeholder",
  "message",
  "breadcrumb",
  "input",
  "checkbox",
  "form",
  "item",
  "list",
  "menu",
  "table",
  "popup",
  "modal",
  "transition",
  "dimmer",
  "flyout",
  "sidebar",
  "shape",
  "card",
  "items",
  "feed",
  "comment",
  "statistic",
  "step",
  "rail",
  "reveal",
  "ad",
  "emoji",
  "select",
  "search",
  "progress",
  "rating",
  "slider",
  "accordion",
  "tab",
  "toast",
  "nag",
  "sticky",
  "visibility",
  "embed",
  "calendar"
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
export const SOLID_EXTERNAL = /^solid-js(\/|$)|^@solidjs\/|^@spell\/solid-element(\/|$)/

/**
 * Packages that MUST resolve to one copy:  the linked fork (`packages/solid-element`) resolves its imports from its
 * OWN `node_modules` otherwise, and two Solids can't share owners (`PAPERCUTS.md`).
 */
export const SOLID_DEDUPE = ["solid-js", "@solidjs/web"]

/**
 * Config shared by the library build / dev server (below), `vitest.config.ts` and the docs site:  plugins, aliases,
 * dedupe, Lightning CSS.  A FUNCTION, so every caller gets its own plugin instances.
 * - `standardDecorators()` MUST come first:  both it and the Solid plugin are `enforce: "pre"`, and the Solid
 *   compiler must see decorator-free code.
 * - `UI_SOLID_PROD=1`:  Solid's PRODUCTION runtime under `vite dev` (no dev diagnostics, no performance tracks),
 *   for timing `tools/demo/perf.html`.
 * - `optimizeDeps`:  `axe-core` and `temporal-polyfill` (only a Temporal-less page imports it) pre-bundled up
 *   front, so the first test run doesn't reload mid-run;  NOT
 *   `@spell/solid-element`:  it's linked TypeScript source (its `development` export), compiled by the Solid
 *   plugin like our own files.
 */
export function baseConfig() {
  const production = process.env.UI_SOLID_PROD ? { dev: false, performanceTracks: false } : {}
  return {
    plugins: [standardDecorators(), solid(production)],
    resolve: {
      alias: {
        $test: TEST,
        $: SRC
      },
      dedupe: SOLID_DEDUPE
    },
    optimizeDeps: {
      include: ["axe-core", "temporal-polyfill"],
      exclude: ["@spell/solid-element"]
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
 * Library build of `@spell/ui`, and the dev server (`yarn dev`:  `tools/demo/`).
 * - ESM only:  every consumer we target (bundlers, `<script type="module">`, frameworks) speaks it.
 * - `solid-js`, `@solidjs/web` and `@spell/solid-element` are external (`SOLID_EXTERNAL`);  the `UIRuntime` and
 *   icon packs are separate files (`emitIconPacks()`).
 * - `preserveEntrySignatures: "allow-extension"`:  lets `core.js` / `button.js` ... hold their own code and export
 *   what siblings need, instead of Vite's lib-mode default (`strict`), which turns every entry into a facade over
 *   a hashed chunk.
 * - `css.transformer: "lightningcss"` so component CSS gets nesting / `@custom-media` lowering with the same engine
 *   that minifies it.  NOTE: postcss is never used.
 * - `vite-plugin-dts` emits `.d.ts` next to each entry for consumers.
 */
export default defineConfig(() => {
  const base = baseConfig()
  return {
    ...base,
    plugins: [
      ...base.plugins,
      hotElements(),
      emitIconPacks(),
      dts({ include: ["src"], exclude: ["src/**/*.test.ts", "src/**/*.test.tsx"] })
    ],
    build: {
      outDir: "dist",
      emptyOutDir: true,
      sourcemap: true,
      lib: { entry: ENTRIES, formats: ["es"] },
      rolldownOptions: {
        external: (id: string) => SOLID_EXTERNAL.test(id),
        preserveEntrySignatures: "allow-extension",
        output: {
          // MUST stay on:  custom element class names are read by the manifest and dev-time warnings --
          // see `vite.decorators.ts`.
          keepNames: true
        }
      }
    }
  } satisfies UserConfig
})

/**
 * Hot module replacement for the components in `yarn dev` (the fork's `solidElementHot()`;  `apply: "serve"`, so
 * builds are untouched, and NOT in `vitest.config.ts`).
 * - Boundaries:  the component barrels (`src/components/<name>/index.ts`), the modules that call `define()`.
 *   An edit to a component class, vocabulary or fallback re-runs its barrel;  `HotDefinitions` turns the barrel's
 *   `define()` of a new version of a class into a re-definition of every tag it had.
 * - `?inline` component CSS (`src/components/<name>/<name>.css`) re-registers its sheet:  no re-render.
 * - Shared code (`core`, `forms`, the runtime) reaches several barrels:  full reload.
 */
function hotElements(): Plugin {
  // HACK: the fork is its own yarn project, so its `Plugin` type comes from ITS `vite` install:  the same version,
  // but a second declaration TypeScript won't unify (a `tsconfig` `paths` pin would also redirect `tsx`'s runtime
  // resolution of `vite` to a `.d.ts`)
  const plugin: unknown = solidElementHot({
    include: /\/src\/components\/[\w-]+\/index\.ts$/,
    detect: /\.define\(/,
    setup: "$/elements/HotDefinitions",
    styles: {
      include: /\/src\/components\/[\w-]+\/[\w-]+\.css\?inline$/,
      handler: "$/elements/HotDefinitions",
      call: "HotDefinitions.updateStyle"
    }
  })
  return plugin as Plugin
}

/**
 * Copies the built-in icon packs, `src/icons/icon-packs/**` (SVGs + each `pack.js`), to `<dir>/**` in the build output,
 * next to the chunks, where `BuiltInPacks` looks via `import.meta.url` (`docs/icons.md`, "Shipping icons").
 * - Library build:  `BuiltInPacks` lives in `dist/core.js` (the `core` entry re-exports `$/icons`), so `dist/icon-packs/`.
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
