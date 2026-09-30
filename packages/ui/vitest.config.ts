import { configDefaults, defineConfig } from "vitest/config"
import { playwright } from "@vitest/browser-playwright"

import { baseConfig } from "./vite.config.ts"

/**
 * Browsers the `browser` project runs in:  chromium only by default, so `yarn review` stays quick.
 * - `UI_TEST_ALL=1` (`yarn test:all`) adds firefox and webkit -- run `yarn test:browsers` once first.
 */
const BROWSERS = process.env.UI_TEST_ALL ? (["chromium", "firefox", "webkit"] as const) : (["chromium"] as const)

/** Server-render tests:  `*.ssr.test.ts(x)`, anywhere. */
const SSR_TESTS = ["src/**/*.ssr.test.{ts,tsx}", "test/**/*.ssr.test.{ts,tsx}"]

/** Node tooling tests (the pack builder) under `tools/`, run with the `ssr` project, in node. */
const TOOL_TESTS = ["tools/**/*.test.ts"]

/**
 * Two projects:
 * - `browser` -- every test but SSR, in a REAL browser (Vitest browser mode + Playwright):  custom elements, shadow
 *   DOM, `adoptedStyleSheets`, anchor positioning and axe all need one, and jsdom fakes too much of it.
 * - `ssr` -- `*.ssr.test.tsx` in node, under `@solidjs/web`'s server build (`renderToString`);  also the node
 *   tooling's own tests (`TOOL_TESTS`).
 * - Each project gets its OWN Solid plugin instance (`baseConfig()`):  the plugin picks its posture (client, or
 *   the server build of `@solidjs/web`) from `test.environment` of the config it's created in, and never sees a
 *   project's `environment` through `extends: true`.
 * - NOTE: run `ssr` FIRST (`yarn test` does):  it writes `.cache/ssr-button.html`, which `test/dsd.test.ts`
 *   imports.
 */
export default defineConfig({
  test: {
    projects: [
      {
        ...baseConfig(),
        test: {
          name: "browser",
          include: ["src/**/*.test.{ts,tsx}", "test/**/*.test.{ts,tsx}"],
          exclude: [...configDefaults.exclude, ...SSR_TESTS],
          setupFiles: ["./test/setup.ts"],
          // a guard:  an element bug that halts rendering must fail its test, not hang the run
          testTimeout: 10_000,
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: BROWSERS.map((browser) => ({ browser }))
          }
        }
      },
      {
        ...baseConfig(),
        test: {
          name: "ssr",
          environment: "node",
          // vitest stubs CSS imports by default;  the DSD string needs the real `?inline` sheets
          css: { include: [/.+/] },
          include: [...SSR_TESTS, ...TOOL_TESTS]
        }
      }
    ]
  }
})
