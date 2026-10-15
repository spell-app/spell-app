import { resolve } from "node:path"
import { defineConfig } from "vite-plus"
import { playwright } from "vite-plus/test/browser-playwright"

import { baseConfig } from "../ui/vite.config.ts"

/**
 * Vitest config for `@spell-app/spell-solid`:  its tests run in a REAL browser, as Spell UI's do.
 * - Vitest browser mode + Playwright, chromium:
 *   as Spell UI's `browser` project (`packages/ui/vitest.config.ts`).
 * - `baseConfig()`:  Spell UI's plugins (decorators BEFORE Solid), Solid dedupe, Lightning CSS.
 * - The tests draw their elements on a page with Spell UI's runtime, as every page has:
 *   - Spell UI's setup file loads `$/ui/core`, which installs Spell UI's settings
 *   - they use Spell UI's test helpers (`$/ui/test/...`)
 *   - The package itself never imports Spell UI.
 * - The repo root's `vitest.config.ts` picks this up as project `spell-solid`.
 */
export default defineConfig({
  ...baseConfig(),
  test: {
    // the tests live in the repo's tests/ folder, at the same paths as the code
    dir: resolve(import.meta.dirname, "../../tests/spell-solid"),
    include: ["src/**/*.test.{ts,tsx}"],
    // Spell UI's core first, as a page has it:  its settings for `$/spell-solid` (`packages/ui/test/setup.ts`)
    setupFiles: [resolve(import.meta.dirname, "../ui/test/setup.ts")],
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
