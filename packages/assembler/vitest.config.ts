import { defineConfig } from "vite-plus"

/**
 * vitest config for `@spell-app/assembler`:  every test in node, since this package IS node (`node:fs`, `git`).
 * - Aliases (`$/assembler` ...) come from the repo root's `tsconfig.base.json`, through `resolve.tsconfigPaths`.
 * - The root `vitest.config.ts` picks this up as the `assembler` project.
 */
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"]
  }
})
