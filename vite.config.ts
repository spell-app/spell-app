import { defineConfig } from "vite-plus"

import { fmtConfig, rootLint } from "./vite.lint.ts"

/**
 * Repo root's Vite+ config:  only the `lint` / `fmt` blocks (what `vp check`, `vp lint`, `vp fmt` and the Oxc
 * editor extension read here).
 * - The settings live in `vite.lint.ts`, which every package's `vite.config.ts` spreads too.
 * - NOTE: `vp check` and the editor (`oxc.disableNestedConfig`) read THIS block only, even in a package.
 * - Tests:  `vitest.config.ts` beside this (one run for every package).
 */
export default defineConfig({
  fmt: fmtConfig,
  lint: rootLint()
})
