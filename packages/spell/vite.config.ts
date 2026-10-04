import { defineConfig } from "vite-plus"

import { fmtConfig, packageLint } from "../../vite.lint.ts"

/**
 * `spell`'s Vite+ config:  only the `lint` / `fmt` blocks (`vp lint`, `vp fmt`), from the repo root's `vite.lint.ts`.
 * - Tests:  `vitest.config.ts` beside this.
 */
export default defineConfig({
  fmt: fmtConfig,
  lint: packageLint({
    react: true,
    // Mirrors `fmtConfig.ignorePatterns`:  vendored, generated and scratch trees.
    ignorePatterns: [
      "build",
      "dist",
      ".cache",
      ".venv",
      ".yarn",
      "graphify-out",
      "thoughts",
      "static",
      "projects",
      "vscode-extension/out"
    ]
  })
})
