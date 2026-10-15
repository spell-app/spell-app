import { resolve } from "node:path"

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
  // the tests live in the repo's tests/ folder, at the same paths as the code
  // (absolute:  Vitest reads a relative `dir` from wherever the run starts, e.g. the repo root)
  test: { dir: resolve(import.meta.dirname, "../../tests/core") },
  ssr: { noExternal: SOLID, resolve: { conditions: ["browser", "development"] } }
})
