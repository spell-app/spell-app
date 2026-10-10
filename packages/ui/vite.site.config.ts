import { defineConfig, type UserConfig } from "vite"
import { fileURLToPath } from "node:url"

import { baseConfig } from "./vite.config.ts"

/** `packages/ui/`. */
const ROOT = fileURLToPath(new URL("./", import.meta.url))

/** Where the bundle goes:  `site/_assets/`, git-ignored, built by the page server when stale (`spell dev bundles`). */
export const SITE_ASSETS = `${ROOT}site/_assets`

/** The entry:  `site/_src/site.ts`. */
export const SITE_ENTRY = `${ROOT}site/_src/site.ts`

/**
 * The Spell UI site's bundle (`yarn site:bundle`, run by `scripts/site-bundle.ts`):
 * `site/_src/site.ts` => `site/_assets/site.js` + `site.css` + lazy chunks.  See the entry for what's in it.
 * - `baseConfig()`:  the library's own plugins (decorators BEFORE Solid), Solid dedupe, Lightning CSS targets.
 * - An APP build of one JS entry (not lib mode):  code-split, with Vite's preload helper for the lazy chunks.
 * - `base: "./"`:  chunk URLs relative to the chunk that imports them, so `_assets/` works under `/ui/` at any page
 *   depth.  The default `/` asks the server ROOT for `/<chunk>.js` (`agents/PAPERCUTS.md`, app, 2026-10-02).
 * - Stable names where the tree is stable, so a rebuild's diff is small:  `site.js`, `site.css`,
 *   one `<family>.js` per family barrel (`ui-button.js`, `ui-docs-example.js`), emoji data under `emoji/<set>/`;
 *   every other chunk (shared code, the runtime, engines) `<name>-<hash>.js`.
 * - Minified, no sourcemaps:  as a deploy would ship it.  `emptyOutDir: false`:
 *   `scripts/site-bundle.ts` clears the folder itself, keeping the `icon-packs` link.
 * - Aliases set here as well:  `site/` is outside `tsconfig.json`'s files, where `tsconfigPaths` may not apply.
 */
export default defineConfig(() => {
  const base = baseConfig()
  return {
    ...base,
    root: ROOT,
    base: "./",
    publicDir: false,
    logLevel: "warn",
    resolve: {
      ...base.resolve,
      alias: [
        { find: /^\$\/ui$/, replacement: `${ROOT}src/index.ts` },
        { find: /^\$\/ui\//, replacement: `${ROOT}src/` },
        { find: /^\$\/util$/, replacement: `${ROOT}../util/src/index.ts` },
        { find: /^\$\/util\//, replacement: `${ROOT}../util/src/` },
        { find: /^\$\/server$/, replacement: `${ROOT}../server/src/index.ts` },
        { find: /^\$\/server\//, replacement: `${ROOT}../server/src/` }
      ]
    },
    build: {
      outDir: SITE_ASSETS,
      emptyOutDir: false,
      sourcemap: false,
      minify: true,
      target: "esnext",
      // the CSS minify reads `cssTarget`, not `css.lightningcss.targets`:  same browsers (see `vite.config.ts`)
      cssTarget: ["chrome125", "safari26", "firefox147"],
      modulePreload: { polyfill: false },
      reportCompressedSize: false,
      // `brands.json`-sized icon data and highlight.js's languages are lazy chunks, loaded only when used
      chunkSizeWarningLimit: 700,
      rolldownOptions: {
        input: { site: SITE_ENTRY },
        preserveEntrySignatures: "allow-extension",
        output: {
          // custom element class names are read by dev-time warnings and the manifest (see `vite.config.ts`)
          keepNames: true,
          entryFileNames: "[name].js",
          chunkFileNames: siteChunkName,
          assetFileNames: "[name][extname]"
        }
      }
    }
  } satisfies UserConfig
})

/**
 * A chunk's file name:  a family barrel's chunk is `<family>.js`, an emoji data chunk `emoji/<set>/<letter>.js`, any
 * other `<name>-<hash>.js`.
 */
function siteChunkName(chunk: { facadeModuleId: string | null; moduleIds: readonly string[] }): string {
  const id = chunk.facadeModuleId ?? ""
  const family = FAMILY_BARREL.exec(id)
  if (family) return `${family[1]}.js`
  const emoji = EMOJI_DATA.exec(id || (chunk.moduleIds[0] ?? ""))
  if (emoji) return `emoji/${emoji[1]}/${emoji[2]}.js`
  return "[name]-[hash].js"
}

/** A family barrel:  `src/components/ui-button/index.ts`, `src/docs-components/ui-docs-example/index.ts`. */
const FAMILY_BARREL = /\/src\/(?:docs-)?components\/(ui-[\w-]+)\/index\.ts$/

/** An emoji name-data module:  its set and chunk letter. */
const EMOJI_DATA = /\/components\/ui-emoji\/data\/([\w-]+)\/(\w+)\.json$/
