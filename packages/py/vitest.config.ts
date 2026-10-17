import { resolve } from "node:path"

import { defineConfig } from "vite-plus"

import { standardDecorators } from "../../vite.decorators.ts"
import { packageVersion } from "../../vite.packageVersion.ts"

/**
 * vitest config for `@spell-app/py`:  its TypeScript, in `ts/`.
 * - Aliases (`$/util` ...) come from the repo root's `tsconfig.base.json`, through `resolve.tsconfigPaths`.
 * - `standardDecorators()` lowers standard decorators:  vite 8's own transform (oxc) doesn't.
 */
export default defineConfig({
  plugins: [standardDecorators(), packageVersion()],
  resolve: { tsconfigPaths: true },
  // the tests live in the repo's tests/ folder, at the same paths as the code
  // (absolute:  Vitest reads a relative `dir` from wherever the run starts, e.g. the repo root)
  test: { dir: resolve(import.meta.dirname, "../../tests/py") }
})
