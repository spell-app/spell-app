import solid from "@solidjs/vite-plugin"
import { resolve } from "node:path"
import { defineConfig } from "vite-plus"
import { playwright } from "vite-plus/test/browser-playwright"

import { standardDecorators } from "../../vite.decorators.ts"

/** Packages that MUST resolve to one copy:  two Solids can't share owners. */
const SOLID_DEDUPE = ["solid-js", "@solidjs/web"]

/**
 * Vitest config for `@spell-app/spell-element`:  its tests run in a REAL browser, with no Spell UI on the page.
 * - Vitest browser mode + Playwright, chromium.
 * - Its own plugins:
 *   - the repo root's decorator pre-pass FIRST:  it and the Solid plugin are both `enforce: "pre"`,
 *     and the Solid compiler must see decorator-free code
 *   - then Solid's
 *   - aliases from the repo root's `tsconfig.base.json` (`resolve.tsconfigPaths`), and ONE Solid (`dedupe`)
 * - The tests draw their elements on the package's own stand-in settings (`test/TestSettings.ts`), installed before
 *   every test file, and use its own helpers (`$/spell-element/test/...`).
 *   - What needs Spell UI's real runtime is tested in Spell UI's own tests.
 * - The repo root's `vitest.config.ts` picks this up as project `spell-element`.
 */
export default defineConfig({
  plugins: [standardDecorators(), solid()],
  resolve: {
    tsconfigPaths: true,
    dedupe: SOLID_DEDUPE
  },
  optimizeDeps: {
    // pre-bundled up front:  found mid-run on a fresh cache, they'd reload the page, and a test file get a second Solid
    include: SOLID_DEDUPE
  },
  test: {
    // the tests live in the repo's tests/ folder, at the same paths as the code
    dir: resolve(import.meta.dirname, "../../tests/spell-element"),
    include: ["src/**/*.test.{ts,tsx}"],
    // the stand-in settings, installed before every test file
    setupFiles: [resolve(import.meta.dirname, "test/TestSettings.ts")],
    // a guard:  an element bug that halts rendering must fail its test, not hang the run
    testTimeout: 10_000,
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: "chromium" }]
    }
  }
})
