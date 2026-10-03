import { defineConfig } from "vite-plus"

import { standardDecorators } from "../../vite.decorators.ts"
import { packageVersion } from "../../vite.packageVersion.ts"

/**
 * DOCME: vitest config for `@spell-app/core`.
 * - Aliases (`$/util` ...) come from the repo root's `tsconfig.base.json`, through `resolve.tsconfigPaths`.
 * - `standardDecorators()` lowers standard decorators:  vite 8's own transform (oxc) doesn't.
 */
export default defineConfig({
  plugins: [standardDecorators(), packageVersion()],
  resolve: { tsconfigPaths: true }
})
