import { defineConfig } from "vite-plus"

import { fmtConfig, packageLint } from "@spell-app/toolchain/lint"

/**
 * `parser`'s Vite+ config:  only the `lint` / `fmt` blocks (`vp lint`, `vp fmt`), from the toolchain's settings (`@spell-app/toolchain/lint`).
 * - Tests:  `vitest.config.ts` beside this.
 */
export default defineConfig({
  fmt: fmtConfig,
  lint: packageLint({ react: true })
})
