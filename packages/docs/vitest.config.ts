import { resolve } from "node:path"
import { defineConfig } from "vite-plus"

/**
 * vitest config for `@spell-app/docs`:  only the doc scripts' own tests (`tools/*.test.{js,ts}`), in node.
 * - The root `vitest.config.ts` picks this up as the `docs` project.
 * - Aliases (`$/epics/tool/...`, which `plan-doc.js` forwards to;  `$/server`) come from the repo root's
 *   `tsconfig.base.json`, through `resolve.tsconfigPaths`.
 */
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    // the tests live in the repo's tests/ folder, at the same paths as the code
    dir: resolve(import.meta.dirname, "../../tests/docs"),
    include: ["tools/**/*.test.{js,ts}"],
    environment: "node"
  }
})
