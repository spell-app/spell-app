import { transform } from "esbuild"
import type { Plugin } from "vite"

/**
 * Lower standard (TC39 "stage 3", 2023-11) decorators with esbuild BEFORE vite's own transform sees them.
 * - Vite 8 transforms TS with oxc, which only lowers LEGACY decorators (oxc-project/oxc#9170), and neither
 *   node nor browsers run decorators natively -- without this, decorated files die with a bare `SyntaxError`.
 * - Only touches files which actually contain a decorator;  everything else stays on vite's normal path.
 * - esbuild rather than SWC / babel:  `tsx` already runs the server through esbuild, so client, server
 *   and tests all lower decorators identically.  One small, fast dependency, so `@proto` behaves
 *   identically across `spell/parser`, `@spell-app/ui`, and runners built with this plugin.
 * - `keepNames` MUST stay on:  rule classes register under their class name (see `packages/spell/src/parser/build.test.ts`),
 *   and custom element classes keep their class names (`UIButton`), which the custom-elements manifest and
 *   dev-time warnings read -- the build keeps them too.
 * - JSX is preserved (loader `tsx`) for vite's react / Solid plugin to deal with;  the Solid plugin runs next.
 * - MUST be used by BOTH `vite.config.ts` and `vitest.config.ts` in every package (`@spell-app/ui`'s site bundle,
 *   `vite.site.config.ts`, gets it through `baseConfig()`).
 * - TODO: delete this file when oxc lowers standard decorators.
 */
export function standardDecorators(): Plugin {
  return {
    name: "standard-decorators-via-esbuild",
    enforce: "pre",
    async transform(code, id) {
      const [file] = id.split("?", 1)
      if (!file || !SCRIPT_FILE.test(file) || file.includes("/node_modules/") || !DECORATOR.test(code)) return
      const result = await transform(code, {
        loader: file.endsWith("x") ? "tsx" : "ts",
        jsx: "preserve",
        target: "es2022",
        format: "esm",
        keepNames: true,
        sourcefile: file,
        sourcemap: true
      })
      return { code: result.code, map: result.map }
    }
  }
}

/** Files we'll consider. */
const SCRIPT_FILE = /\.[cm]?tsx?$/

/**
 * Cheap test for "line starts with a decorator" -- false positives just cost one extra transform.
 * - NOTE: decorators MUST start their line (after indentation), so `@foo class ...` or `@foo static x`
 *   mid-line won't be noticed.  oxfmt lays them out this way anyway.
 */
const DECORATOR = /^\s*@[A-Za-z_$][\w$.]*/m
