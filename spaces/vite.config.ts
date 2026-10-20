import { defineConfig } from "vite-plus"

import { fmtConfig, packageLint } from "@spell-app/toolchain/lint"

/**
 * `spaces`' Vite+ config:  only the `lint` / `fmt` blocks (`vp lint`, `vp fmt`), from the toolchain's settings (`@spell-app/toolchain/lint`).
 * - No React rules:  no JSX here.
 * - Python's web server (`src/server/py/`) is ruff's, not oxlint's:  its `.venv` is left out.
 * - The `@spell` space's projects (`@spell/`) are spell source and what compiling writes:  left out (and by `fmtConfig`).
 * - Tests:  `vitest.config.ts` beside this.
 */
export default defineConfig({
  // the `@spell` space's projects, as spell and its compiler write them:
  // the root's `**/spaces/@spell/**` is read from the repo root, not from this folder
  fmt: { ...fmtConfig, ignorePatterns: [...fmtConfig.ignorePatterns, "@spell/**"] },
  lint: packageLint({ ignorePatterns: ["build", "dist", ".cache", "**/.venv", "@spell"] })
})
