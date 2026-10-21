import { resolve } from "node:path"

import { defineConfig } from "vite-plus"

import { standardDecorators } from "spell-kit/toolchain/decorators"
import { packageVersion } from "spell-kit/toolchain/packageVersion"

/**
 * DOCME: vitest config for `@spell-app/lsp`.
 * - Aliases (`$/util` ...) come from the repo root's `tsconfig.base.json`, through `resolve.tsconfigPaths`.
 * - `standardDecorators()` lowers standard decorators:  vite 8's own transform (oxc) doesn't.
 */
export default defineConfig({
  plugins: [standardDecorators(), packageVersion(import.meta.dirname)],
  resolve: { tsconfigPaths: true },
  // the tests live in the repo's tests/ folder, at the same paths as the code
  test: { dir: resolve(import.meta.dirname, "../tests/lsp") }
})
