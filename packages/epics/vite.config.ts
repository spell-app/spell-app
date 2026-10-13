import { defineConfig } from "vite-plus"

import { fmtConfig, packageLint } from "../../vite.lint.ts"

/**
 * `epics`'s Vite+ config:  only the `lint` / `fmt` blocks (`vp lint`, `vp fmt`), from the repo root's `vite.lint.ts`.
 * - The pack's BUILD is the CLI's, the same for every pack:
 *   `spell dev pack build epics` (`packages/cli/src/dev/packBuild.ts`), on Spell UI's `baseConfig()`.
 * - Tests:  `vitest.config.ts` beside this.
 * - Not ours to lint:  `components/__pack/` (generated:  `packageLint()` leaves it out), and in the docs tools' `_assets/` the bundle `spell dev docs update`
 *   writes (`spell-ui.js`, `lazy/`, `emoji/`) and the vendored highlight.js;  `tools/vendor/` (Claude Design's runtime)
 */
export default defineConfig({
  fmt: fmtConfig,
  lint: packageLint({
    name: "epics",
    ignorePatterns: [
      "dist",
      ".vitest",
      "tools/_assets/spell-ui.js",
      "tools/_assets/lazy",
      "tools/_assets/emoji",
      "tools/_assets/highlight.min.js",
      "tools/vendor"
    ]
  })
})
