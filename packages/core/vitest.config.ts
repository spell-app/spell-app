import { defineConfig } from "vite-plus"

import { standardDecorators } from "../../vite.decorators.ts"
import { packageVersion } from "../../vite.packageVersion.ts"

/** Solid's packages:  core draws with them. */
const SOLID = [/^solid-js/, /^@solidjs\//]

/**
 * Vitest config for `@spell-app/core`.
 * - Aliases (`$/util` ...) come from the repo root's `tsconfig.base.json`, through `resolve.tsconfigPaths`.
 * - `standardDecorators()` lowers standard decorators:  vite 8's own transform (oxc) doesn't.
 * - Solid's CLIENT build (`browser`, `development`), as programs draw in a page:  node would pick its server build,
 *   which can't draw.  So Solid is compiled in (`noExternal`), with those conditions.
 *   `drawing.test.ts` draws into a fake page (linkedom).
 */
export default defineConfig({
  plugins: [standardDecorators(), packageVersion()],
  resolve: { tsconfigPaths: true },
  ssr: { noExternal: SOLID, resolve: { conditions: ["browser", "development"] } }
})
