import { defineConfig } from "vitest/config"
import { playwright } from "@vitest/browser-playwright"

import { standardDecorators } from "../../vite.decorators.ts"

/**
 * Every test runs in a REAL browser (Vitest browser mode + Playwright, chromium):  `dom.test.ts` needs shadow roots
 * and a custom element registry, and `decorators.test.ts` proves `@proto` after esbuild lowers standard decorators.
 * - `standardDecorators()` is what lowers them:  Vite 8's own transform (oxc) doesn't.  See `AGENTS.md`.
 * - Aliases (`#util` ...) come from the repo root's `tsconfig.base.json`, through `resolve.tsconfigPaths`.
 */
export default defineConfig({
  plugins: [standardDecorators()],
  resolve: { tsconfigPaths: true },
  test: {
    include: ["src/**/*.test.ts"],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: "chromium" }]
    }
  }
})
