import { defineConfig } from "vite-plus"

import { fmtConfig, packageLint } from "../../vite.lint.ts"

/**
 * `epics`'s Vite+ config:  only the `lint` / `fmt` blocks (`vp lint`, `vp fmt`), from the repo root's `vite.lint.ts`.
 * - The pack's BUILD is the CLI's, the same for every pack:
 *   `spell dev pack build epics` (`packages/cli/src/dev/packBuild.ts`), on Spell UI's `baseConfig()`.
 * - Tests:  `vitest.config.ts` beside this.
 * - `pack/` is generated:  not ours to lint.
 */
export default defineConfig({
  fmt: fmtConfig,
  lint: packageLint({ name: "epics", ignorePatterns: ["pack", "dist", ".vitest"] })
})
