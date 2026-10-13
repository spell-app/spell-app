import { resolve } from "node:path"
import { defineConfig } from "vite-plus"
import { playwright } from "vite-plus/test/browser-playwright"

import { baseConfig } from "../ui/vite.config.ts"

/**
 * vitest config for `@spell-app/brand`:  the `<ui-brand-*>` elements' tests, in a REAL browser (Vitest browser mode
 * + Playwright, chromium), as Spell UI's are (`packages/ui/vitest.config.ts`, its `browser` project).
 * - `baseConfig()`:  Spell UI's plugins (decorators BEFORE Solid), Solid dedupe, Lightning CSS.
 * - Spell UI's test helpers come from `$/ui/test/...` (`ElementFixture`, `Fixture`, `a11y`).
 * - The repo root's `vitest.config.ts` picks this up as project `brand`.
 */
export default defineConfig({
  ...baseConfig(),
  test: {
    // the tests live in the repo's tests/ folder, at the same paths as the code
    dir: resolve(import.meta.dirname, "../../tests/brand"),
    include: ["components/**/*.test.{ts,tsx}", "src/**/*.test.{ts,tsx}"],
    // Spell UI's core first, as a page has it:  its settings for `$/spell-solid` (`packages/ui/test/setup.ts`)
    setupFiles: [resolve(import.meta.dirname, "../ui/test/setup.ts")],
    testTimeout: 10_000,
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: "chromium" }]
    }
  }
})
