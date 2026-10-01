import { defineConfig } from "vitest/config"

/**
 * vitest config for `@spell/docs`:  only the doc scripts' own tests (`scripts/*.test.js`), in node.
 * - The root `vitest.config.ts` picks this up as the `docs` project.
 */
export default defineConfig({
  test: {
    include: ["scripts/**/*.test.js"],
    environment: "node"
  }
})
