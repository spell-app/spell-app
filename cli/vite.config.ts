import { defineConfig } from "vite-plus"

import { fmtConfig, packageLint } from "spell-kit/toolchain/lint"

/**
 * `cli`'s Vite+ config:  only the `lint` / `fmt` blocks (`vp lint`, `vp fmt`), from the toolchain's settings (`spell-kit/toolchain/lint`).
 * - Tests:  `vitest.config.ts` beside this.
 */
export default defineConfig({
  fmt: fmtConfig,
  lint: packageLint({ react: true })
})
