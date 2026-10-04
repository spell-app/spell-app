import { defineConfig } from "vite-plus"

/**
 * vitest config for `@spell-app/server`:  every test in node, since this package IS node (`node:http`, `fs`).
 * - Aliases (`$/server` ...) come from the repo root's `tsconfig.base.json`, through `resolve.tsconfigPaths`.
 * - No decorators here, so no `standardDecorators()`.
 */
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "test/**/*.test.ts"]
  }
})
