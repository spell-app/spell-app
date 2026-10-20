import { defineConfig } from "vite-plus"

import { fmtConfig, packageLint } from "./src/lint.ts"

/**
 * `toolchain`'s Vite+ config:  only the `lint` / `fmt` blocks (`vp lint`, `vp fmt`), from its own `src/lint.ts`.
 * - No React rules:  node only.
 * - Tests:  `vitest.config.ts` beside this.
 */
export default defineConfig({
  fmt: fmtConfig,
  lint: packageLint()
})
