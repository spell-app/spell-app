import { resolve } from "node:path"

import { defineConfig } from "vite-plus"

import { standardDecorators } from "../../vite.decorators.ts"
import { packageVersion } from "../../vite.packageVersion.ts"

export default defineConfig({
  plugins: [standardDecorators(), packageVersion(import.meta.dirname)],
  // the tests live in the repo's tests/ folder, at the same paths as the code
  // (absolute:  Vitest reads a relative `dir` from wherever the run starts, e.g. the repo root)
  test: { dir: resolve(import.meta.dirname, "../../tests/spell") },
  resolve: {
    tsconfigPaths: true
  }
})
