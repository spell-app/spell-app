import { defineConfig } from "vite-plus"

import { fmtConfig, packageLint } from "../../vite.lint.ts"

/**
 * `spaces`' Vite+ config:  only the `lint` / `fmt` blocks (`vp lint`, `vp fmt`), from the repo root's `vite.lint.ts`.
 * - No React rules:  no JSX here.
 * - Python's web server (`src/server/py/`) is ruff's, not oxlint's:  its `.venv` is left out.
 * - Tests:  `vitest.config.ts` beside this.
 */
export default defineConfig({
  fmt: fmtConfig,
  lint: packageLint({ ignorePatterns: ["build", "dist", ".cache", "**/.venv"] })
})
