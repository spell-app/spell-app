import { resolve } from "node:path"

import { defineConfig } from "vite-plus"

import { standardDecorators } from "@spell-app/toolchain/decorators"
import { packageVersion } from "@spell-app/toolchain/packageVersion"

export default defineConfig({
  plugins: [standardDecorators(), packageVersion(import.meta.dirname)],
  // the tests live in the repo's tests/ folder, at the same paths as the code
  // (absolute:  Vitest reads a relative `dir` from wherever the run starts, e.g. the repo root)
  test: { dir: resolve(import.meta.dirname, "../../tests/spell") },
  resolve: {
    tsconfigPaths: true
  }
})
