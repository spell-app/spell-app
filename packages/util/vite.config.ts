import { defineConfig } from "vite-plus"

import { fmtConfig, packageLint } from "../../vite.lint.ts"

/**
 * `util`'s Vite+ config:  only the `lint` / `fmt` blocks (`vp lint`, `vp fmt`), from the repo root's `vite.lint.ts`.
 * - Tests:  `vitest.config.ts` beside this.
 */
export default defineConfig({
  fmt: fmtConfig,
  lint: packageLint({ react: true })
})
