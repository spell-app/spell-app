import solid from "@solidjs/vite-plugin"
import { playwright } from "vite-plus/test/browser-playwright"
import { defineConfig } from "vite-plus"

/**
 * Tests run in a REAL browser (chromium, Vitest browser mode), as in the rest of the repo.
 * - `dedupe`:  `@solidjs/element` (the original, for "old fails" tests) must share our copy of Solid.
 * - `optimizeDeps.include`:  pre-bundled up front, so the first run doesn't reload mid-run.
 */
export default defineConfig({
  plugins: [solid()],
  resolve: {
    dedupe: ["solid-js", "@solidjs/web"]
  },
  optimizeDeps: {
    include: ["component-register", "@solidjs/element", "solid-js", "@solidjs/web"]
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    testTimeout: 10_000,
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: "chromium" }]
    }
  }
})
