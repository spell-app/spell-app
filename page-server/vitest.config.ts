import { resolve } from "node:path"

import { defineConfig } from "vite-plus"

/**
 * vitest config for `spell-app/page-server`:  every test in node, since this package IS node (`node:child_process`, `fs`).
 * - Aliases (`$/page-server`, `$/server` ...) come from the repo root's `tsconfig.base.json`, through `resolve.tsconfigPaths`.
 * - No decorators here, so no `standardDecorators()`.
 */
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    // the tests live in the repo's tests/ folder, at the same paths as the code
    dir: resolve(import.meta.dirname, "../tests/page-server"),
    environment: "node",
    include: ["src/**/*.test.ts"]
  }
})
