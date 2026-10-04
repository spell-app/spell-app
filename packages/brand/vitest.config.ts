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
    include: ["components/**/*.test.{ts,tsx}", "src/**/*.test.{ts,tsx}"],
    testTimeout: 10_000,
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: "chromium" }]
    }
  }
})
