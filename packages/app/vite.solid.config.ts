import { fileURLToPath } from "node:url"
import { defineConfig, type Plugin } from "vite"

import { SHARED_SOLID, appConfig } from "./vite.shared.ts"

/** Virtual module re-exporting what `SHARED_SOLID.solid` holds -- see `solidEntry()`. */
const SOLID_ENTRY = "\0spell-solid-entry"

/** `@spell-app/ui`'s barrel, `$/ui`:  `SHARED_SOLID.ui`. */
const UI_BARREL = fileURLToPath(new URL("../ui/src/index.ts", import.meta.url))

/** An emoji data module of `ui`'s:  its set and chunk letter (as `ui`'s own `emojiChunkNames()`). */
const EMOJI_DATA = /\/components\/ui-emoji\/data\/([\w-]+)\/(\w+)\.json$/

/**
 * The ONE Solid and `@spell-app/ui` every other bundle of ours imports, so a page with `<spell-app>`s and a
 * `<spell-editor>` loads one copy of each (two Solids on a page fail silently -- `solid-2.md`):
 * `yarn build:element` (FIRST, it empties `dist-element/`) and `yarn build:runner` (`--outDir dist-runner`).
 * - `spell-solid.js`:  `solid-js`, `@solidjs/web` (and `@solidjs/signals` under them), `@spell-app/solid-element` and
 *   `@solidjs/h` (as `h`), re-exported WHOLE -- the other builds can't tell this one which names they use.
 * - `spell-ui.js`:  `ui`'s barrel, which defines every `<ui-*>`;  the app imports it lazily (`loadUI.ts`).  Its lazy
 *   chunks (the `UI` runtime, emoji data, `<ui-root>`'s families) go in `ui/`.
 * - The other builds mark those packages external and import these files instead -- `sharedSolid()` in
 *   `vite.shared.ts`, which also lists what they may import.
 * - Icon packs (`appConfig({ iconPacks })`):  beside the chunk holding `BuiltInPacks`, wherever it lands.
 * - Fixed entry names, no hashes:  the other bundles name them.  `keepNames` MUST stay on:  `ui` reads custom element
 *   class names (`packages/ui/vite.config.ts`).
 * - Plugins, aliases, dedupe and CSS:  `appConfig()`, as `vite.config.ts`.
 */
const shared = appConfig({ iconPacks: true })
export default defineConfig({
  ...shared,
  plugins: [...shared.plugins, solidEntry()],
  publicDir: false,
  // relative:  Vite's module preloading (`ui`'s lazy chunks) finds them beside the bundle, wherever that's served
  // from -- NOT `/` of the page, which 404s every preload
  base: "./",
  build: {
    chunkSizeWarningLimit: 2000,
    outDir: "dist-element",
    emptyOutDir: true,
    sourcemap: true,
    rolldownOptions: {
      // ONE entry:  `spell-ui.js` is its dynamic import (see `solidEntry()`)
      input: { "spell-solid": SOLID_ENTRY },
      // keep every export:  other builds import them by name.  `allow-extension`:  what `spell-ui.js` and its lazy
      // chunks use of Solid comes from `spell-solid.js` too
      preserveEntrySignatures: "allow-extension",
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: uiChunkNames,
        assetFileNames: "ui/[name][extname]",
        keepNames: true
      }
    }
  },
  define: {
    global: {},
    "process.env": {}
  }
})

/** `SOLID_ENTRY`, the virtual module `spell-solid.js` is built from. */
function solidEntry(): Plugin {
  return {
    name: "spell-solid-entry",
    resolveId: (id) => (id === SOLID_ENTRY ? id : null),
    load: (id) =>
      id === SOLID_ENTRY
        ? [
            `export * from "solid-js"`,
            `export * from "@solidjs/web"`,
            `export * from "@spell-app/solid-element"`,
            // what `core` draws compiled spell with:  `sharedSolid()` hands it to `spell-runtime.js`
            `export { default as h } from "@solidjs/h"`,
            `export const loadSpellUI = () => import(${JSON.stringify(UI_BARREL)})`
          ].join("\n")
        : null
  }
}

/**
 * Lazy chunks' names:  `ui`'s barrel is `SHARED_SOLID.ui`, at the top;  the rest go in `ui/`, an emoji data chunk as
 * `ui/emoji/<set>/<letter>.js` (both sets have an `a`).
 */
function uiChunkNames(chunk: { facadeModuleId: string | null; moduleIds: readonly string[] }): string {
  if (chunk.facadeModuleId === UI_BARREL) return SHARED_SOLID.ui
  const data = EMOJI_DATA.exec(chunk.facadeModuleId ?? chunk.moduleIds[0] ?? "")
  return data ? `ui/emoji/${data[1]}/${data[2]}.js` : "ui/[name].js"
}
