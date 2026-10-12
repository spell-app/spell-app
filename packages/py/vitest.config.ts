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
  resolve: { tsconfigPaths: true }
})
