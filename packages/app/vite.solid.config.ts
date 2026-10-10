import { fileURLToPath } from "node:url"
import { defineConfig, type Plugin } from "vite"

import { SHARED_SOLID, appConfig } from "./vite.shared.ts"

/** Virtual module re-exporting what `SHARED_SOLID.solid` holds:  see `sharedEntries()`. */
const SOLID_ENTRY = "\0spell-solid-entry"

/** Virtual module of `SHARED_SOLID.ui`:  `ui`'s barrel, and `SpellUI.registerPack` for the page (`sharedEntries()`). */
const UI_ENTRY = "\0spell-ui-entry"

/** `@spell-app/ui`'s element core, `$/ui/core`:  in `SHARED_SOLID.solid`. */
const UI_CORE = fileURLToPath(new URL("../ui/src/core.ts", import.meta.url))

/** `@spell-app/ui`'s barrel, `$/ui`:  in `SHARED_SOLID.ui`. */
const UI_BARREL = fileURLToPath(new URL("../ui/src/index.ts", import.meta.url))

/** An emoji data module of `ui`'s:  its set and chunk letter (as `ui`'s own `emojiChunkNames()`). */
const EMOJI_DATA = /\/components\/ui-emoji\/data\/([\w-]+)\/(\w+)\.json$/

/**
 * The ONE Solid and `@spell-app/ui` every other bundle of ours imports, so a page with `<spell-app>`s and a
 * `<spell-editor>` loads one copy of each (two Solids on a page fail silently -- `solid-2.md`):
 * `yarn build:element` (FIRST, it empties `dist-element/`) and `yarn build:runner` (`--outDir dist-runner`).
 * - `spell-solid.js`:  `solid-js` and `@solidjs/web` (and `@solidjs/signals` under them),
 *   `ui`'s element core, `$/ui/core` (`UIComponent`, `DOMElement` ...),
 *   which `<spell-app>` and `<spell-editor>` are defined on,
 *   and `@solidjs/h` (as `h`), which compiled spell draws with:  each re-exported WHOLE --
 *   the other builds can't tell this one which names they use.  None of their names clash.
 *   - Rolldown keeps the modules `spell-ui.js` shares with them in a chunk of `ui/` (`ui/UIComponent.js`), which
 *     `spell-solid.js` imports:  still ONE copy, loaded with it.
 *   - The core in a file of its own (a second entry, or a lazy chunk) moved Solid, or the core, into a shared chunk
 *     all the same.
 * - `spell-ui.js`:  `ui`'s barrel, which defines every `<ui-*>`;
 *   the app imports it lazily (`loadUI.ts`), and a page may load it itself, to have `<ui-root>`.
 *   - It also puts `registerPack` on `globalThis.SpellUI`, as the docs bundle does,
 *     so a `<ui-components source>` can load a component pack:
 *     `spell.pack.js`, `<spell-app>` and `<spell-editor>`'s (`vite.element.config.ts`).
 *   - Its lazy chunks (the `UI` runtime, emoji data, `<ui-root>`'s families) go in `ui/`.
 * - The other builds mark those packages external and import these files instead --
 *   `sharedSolid()` in `vite.shared.ts`, which also lists what they may import.
 * - Icon packs (`appConfig({ iconPacks })`):  beside the chunk holding `BuiltInPacks`, wherever it lands.
 * - Fixed entry names, no hashes:  the other bundles name them.  `keepNames` MUST stay on:  `ui` reads custom element
 *   class names (`packages/ui/vite.config.ts`).
 * - Plugins, aliases, dedupe and CSS:  `appConfig()`, as `vite.config.ts`.
 */
const shared = appConfig({ iconPacks: true })
export default defineConfig({
  ...shared,
  plugins: [...shared.plugins, sharedEntries()],
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
      // ONE entry:  `spell-ui.js` is its dynamic import (see `sharedEntries()`)
      input: { "spell-solid": SOLID_ENTRY },
      // keep every export:  other builds import them by name.  `allow-extension`:  what `spell-ui.js` and its lazy
      // chunks use of Solid and the core comes from `spell-solid.js` too
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

/**
 * The virtual modules `SHARED_SOLID`'s files are built from:
 * `SOLID_ENTRY` (`spell-solid.js`) and `UI_ENTRY` (`spell-ui.js`, its dynamic import).
 */
function sharedEntries(): Plugin {
  const sources: Record<string, string> = {
    [SOLID_ENTRY]: [
      `export * from "solid-js"`,
      `export * from "@solidjs/web"`,
      `export * from ${JSON.stringify(UI_CORE)}`,
      // what `core` draws compiled spell with:  `sharedSolid()` hands it to `spell-runtime.js`
      `export { default as h } from "@solidjs/h"`,
      `export const loadSpellUI = () => import(${JSON.stringify(UI_ENTRY)})`
    ].join("\n"),
    [UI_ENTRY]: [
      `export * from ${JSON.stringify(UI_BARREL)}`,
      `import { registerPack } from ${JSON.stringify(UI_BARREL)}`,
      // a component pack's script calls `SpellUI.registerPack()` as it runs:  the docs bundle's, else ours
      `globalThis.SpellUI ??= {}`,
      `globalThis.SpellUI.registerPack ??= registerPack`
    ].join("\n")
  }
  return {
    name: "spell-shared-entries",
    resolveId: (id) => (id in sources ? id : null),
    load: (id) => sources[id] ?? null
  }
}

/**
 * Lazy chunks' names:  `ui`'s barrel is `SHARED_SOLID.ui`, at the top;  the rest go in `ui/`, an emoji data chunk as
 * `ui/emoji/<set>/<letter>.js` (both sets have an `a`).
 */
function uiChunkNames(chunk: { facadeModuleId: string | null; moduleIds: readonly string[] }): string {
  if (chunk.facadeModuleId === UI_ENTRY) return SHARED_SOLID.ui
  const data = EMOJI_DATA.exec(chunk.facadeModuleId ?? chunk.moduleIds[0] ?? "")
  return data ? `ui/emoji/${data[1]}/${data[2]}.js` : "ui/[name].js"
}
