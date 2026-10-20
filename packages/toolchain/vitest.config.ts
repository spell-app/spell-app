import { resolve } from "node:path"

import { defineConfig } from "vite-plus"

/**
 * vitest config for `@spell-app/toolchain`:  every test in node (the lint rules, through oxlint's `RuleTester`).
 * - No aliases, no decorators:  its files import each other relatively.
 */
export default defineConfig({
  test: {
    // the tests live in the repo's tests/ folder, at the same paths as the code
    dir: resolve(import.meta.dirname, "../../tests/toolchain"),
    environment: "node",
    include: ["src/**/*.test.ts"]
  }
})
