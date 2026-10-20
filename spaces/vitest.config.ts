import { resolve } from "node:path"

import { defineConfig } from "vite-plus"

import { standardDecorators } from "@spell-app/toolchain/decorators"
import { packageVersion } from "@spell-app/toolchain/packageVersion"

/**
 * vitest config for `@spell-app/spaces`:  every test in node, since what it tests today is its node servers.
 * - Aliases (`$/spell` ...) come from the repo root's `tsconfig.base.json`, through `resolve.tsconfigPaths`.
 * - `standardDecorators()` lowers standard decorators (spell's, which the routes load):
 *   vite 8's own transform (oxc) doesn't.
 * - Python's web server has its own tests, pytest's:  `yarn test` runs them after these.
 */
export default defineConfig({
  plugins: [standardDecorators(), packageVersion(import.meta.dirname)],
  resolve: { tsconfigPaths: true },
  test: {
    // the tests live in the repo's tests/ folder, at the same paths as the code
    // (absolute:  Vitest reads a relative `dir` from wherever the run starts, e.g. the repo root)
    dir: resolve(import.meta.dirname, "../tests/spaces"),
    environment: "node"
  }
})
