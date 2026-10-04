import { defineConfig } from "vite-plus"

/**
 * vitest config for `@spell-app/docs`:  only the doc scripts' own tests (`tools/*.test.{js,ts}`), in node.
 * - The root `vitest.config.ts` picks this up as the `docs` project.
 * - Aliases (`$/server`, which `plan-doc.js` imports) come from the repo root's `tsconfig.base.json`, through
 *   `resolve.tsconfigPaths`.
 */
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    include: ["tools/**/*.test.{js,ts}"],
    // the goals tools test with `node --test` (`yarn goals:test`), not vitest
    exclude: ["tools/goals/**"],
    environment: "node"
  }
})
