import { defineConfig } from "vite-plus"

import { fmtConfig, packageLint } from "@spell-app/toolchain/lint"

/**
 * `spell`'s Vite+ config:  only the `lint` / `fmt` blocks (`vp lint`, `vp fmt`), from the toolchain's settings (`@spell-app/toolchain/lint`).
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
      "vscode-extension/out"
    ]
  })
})
