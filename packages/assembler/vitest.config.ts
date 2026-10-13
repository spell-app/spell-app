import { resolve } from "node:path"

import { defineConfig } from "vite-plus"

/**
 * vitest config for `@spell-app/assembler`:  every test in node, since this package IS node (`node:fs`, `git`).
 * - Aliases (`$/assembler` ...) come from the repo root's `tsconfig.base.json`, through `resolve.tsconfigPaths`.
 * - The root `vitest.config.ts` picks this up as the `assembler` project.
 */
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    // the tests live in the repo's tests/ folder, at the same paths as the code
    dir: resolve(import.meta.dirname, "../../tests/assembler"),
    environment: "node",
    include: ["src/**/*.test.ts"]
  }
})
