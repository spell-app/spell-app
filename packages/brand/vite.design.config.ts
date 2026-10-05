import { defineConfig, type UserConfig } from "vite-plus"
import { fileURLToPath } from "node:url"

import { baseConfig, SOLID_EXTERNAL } from "../ui/vite.config.ts"

/** `packages/brand/`. */
const ROOT = fileURLToPath(new URL("./", import.meta.url))

/** Where the build goes:  `dist/` (git-ignored), read by the docs' design bundle. */
export const DESIGN_OUT = `${ROOT}dist`

/**
 * The brand elements for the claude.ai design bundle (epic `claude-design`, P11):  `src/brand-design.ts` =>
 * `dist/brand-design.js`, ONE ES module, which `packages/docs/tools/bundle-spell-ui.js --design` bundles beside
 * Spell UI's `dist/` (it runs this build:  `vp build --config vite.design.config.ts`).
 * - Why a build of its own, not `src/` straight into that bundle:  the elements are Solid JSX, which only the Solid
 *   compiler (`baseConfig()`'s plugins) turns into code;  esbuild, which makes the bundle, can't.
 * - `$/ui/*` and Solid stay EXTERNAL, as written:  the design bundle resolves `$/ui/core` / `$/ui/forms` to Spell UI's
 *   `dist/core.js` / `dist/forms.js`, the same modules its own elements use, so there's ONE `UIElement`, one
 *   `ValueSets` (the `accent` hue reaches every element) and one Solid.
 * - Everything else (`$/brand`, the sheets, `<ui-brand-logo>`'s lazy paths) is inlined:  the bundle can't load a file.
 */
export default defineConfig(() => {
  const base = baseConfig()
  return {
    ...base,
    root: ROOT,
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
      outDir: DESIGN_OUT,
      emptyOutDir: true,
      sourcemap: false,
      minify: false,
      target: "esnext",
      cssTarget: ["chrome125", "safari26", "firefox147"],
      lib: { entry: { "brand-design": `${ROOT}src/brand-design.ts` }, formats: ["es"] },
      rolldownOptions: {
        external: (id: string) => SOLID_EXTERNAL.test(id) || /^\$\/ui(\/|$)/.test(id),
        output: {
          // custom element class names are read by dev-time warnings (see ui's `vite.config.ts`)
          keepNames: true,
          codeSplitting: false
        }
      }
    }
  } satisfies UserConfig
})
