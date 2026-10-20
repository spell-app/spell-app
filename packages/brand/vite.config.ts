import { defineConfig, type UserConfig } from "vite-plus"
import { fileURLToPath } from "node:url"

import { fmtConfig, packageLint } from "@spell-app/toolchain/lint"
import { baseConfig } from "@spell-app/ui/vite.config.ts"

/** `packages/brand/`. */
const ROOT = fileURLToPath(new URL("./", import.meta.url))

/** Where the bundle goes:  `_assets/ui/`, git-ignored, built by the page server when stale (`spell dev bundles`). */
export const BRAND_ASSETS = `${ROOT}_assets/ui`

/** The pages' entry:  `src/brand-ui.ts`. */
export const BRAND_ENTRY = `${ROOT}src/brand-ui.ts`

/**
 * The brand pages' bundle (`yarn build`, run by `scripts/build.ts`):
 * `src/brand-ui.ts` => `_assets/ui/brand-ui.js`, with `brand-ui.css` and lazy chunks.
 * - What's in it:  see the entry.
 * - Only the Brand tab's own pages load it.
 *   The docs set's pages (`docs/`) load Spell UI's site bundle and the brand pack instead (`docs/__parts/layout.html`).
 * - Modelled on Spell UI's site bundle (`packages/ui/vite.site.config.ts`):
 *   `baseConfig()` (decorators BEFORE Solid, Solid dedupe, Lightning CSS targets),
 *   an APP build of one entry, code-split, `base: "./"` so chunk URLs are relative to the chunk that imports them.
 * - An ES module, so a page loads it from the page server, not `file://`
 *   (judgement J4:  a classic script would inline every theme, engine and emoji chunk).
 * - The brand's own aliases set here as well, as the site's config does:
 *   files outside a `tsconfig.json`'s `include` may not get `tsconfigPaths`.  Other repos' packages (Spell UI ...)
 *   by their npm names, through their `exports` (epic `repo-split` P6).
 * - Also `vp lint` / `vp fmt`:  the repo root's `vite.lint.ts`;
 *   the built bundles (this one, the pack, the design build) are not ours to lint.
 */
export default defineConfig(() => {
  const base = baseConfig()
  return {
    fmt: fmtConfig,
    lint: packageLint({
      name: "brand",
      ignorePatterns: ["_assets/ui", "components/__pack", "dist", ".compare", ".vitest"]
    }),
    ...base,
    root: ROOT,
    base: "./",
    publicDir: false,
    logLevel: "warn",
    resolve: {
      ...base.resolve,
      alias: [
        { find: /^\$\/brand\/components$/, replacement: `${ROOT}components/index.ts` },
        { find: /^\$\/brand\/components\//, replacement: `${ROOT}components/` },
        { find: /^\$\/brand$/, replacement: `${ROOT}src/index.ts` },
        { find: /^\$\/brand\//, replacement: `${ROOT}src/` }
      ]
    },
    build: {
      outDir: BRAND_ASSETS,
      emptyOutDir: false,
      sourcemap: false,
      minify: true,
      target: "esnext",
      cssTarget: ["chrome125", "safari26", "firefox147"],
      modulePreload: { polyfill: false },
      reportCompressedSize: false,
      chunkSizeWarningLimit: 1500,
      rolldownOptions: {
        input: { "brand-ui": BRAND_ENTRY },
        preserveEntrySignatures: "allow-extension",
        output: {
          // custom element class names are read by dev-time warnings and the manifest (see ui's `vite.config.ts`)
          keepNames: true,
          entryFileNames: "[name].js",
          chunkFileNames: "[name]-[hash].js",
          assetFileNames: "[name][extname]"
        }
      }
    }
  } satisfies UserConfig
})
