import { configDefaults, defineConfig, type TestProjectConfiguration } from "vite-plus"
import { playwright } from "vite-plus/test/browser-playwright"

import { environment } from "./tools/environment.ts"
import { baseConfig } from "./vite.config.ts"

/**
 * Browsers the `browser` project runs in:  chromium only by default, so `yarn review` stays quick.
 * - `SPELL_UI_TEST_ALL=1` (`yarn test:all`;  `environment.isAllBrowsers`) adds firefox and webkit -- run
 *   `yarn test:browsers` once first.
 */
const BROWSERS = environment.isAllBrowsers ? (["chromium", "firefox", "webkit"] as const) : (["chromium"] as const)

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
 * - NOTE: `ssr` runs FIRST:  it writes `.cache/ssr-button.html`, which `test/dsd.test.ts` imports.
 *   - `yarn test` here runs the projects one after the other.
 *   - In the root's single run, `sequence.groupOrder` does it:  vitest runs project groups in ascending order, and
 *     a group finishes before the next starts.
 * - `prefix` / `root`:  the repo root's `vitest.config.ts` lists these with `ui:` names and `root` set to this
 *   package, since vitest doesn't nest `projects`.  Own run:  no prefix, `root` is the config's folder.
 */
export function uiProjects({ prefix = "", root }: { prefix?: string; root?: string } = {}): TestProjectConfiguration[] {
  return [
    {
      ...baseConfig(),
      ...(root && { root }),
      test: {
        name: `${prefix}ssr`,
        sequence: { groupOrder: 0 },
        environment: "node",
        // vitest stubs CSS imports by default;  the DSD string needs the real `?inline` sheets
        css: { include: [/.+/] },
        include: [...SSR_TESTS, ...TOOL_TESTS]
      }
    },
    {
      ...baseConfig(),
      ...(root && { root }),
      test: {
        name: `${prefix}browser`,
        sequence: { groupOrder: 1 },
        include: ["src/**/*.test.{ts,tsx}", "test/**/*.test.{ts,tsx}"],
        exclude: [...configDefaults.exclude, ...SSR_TESTS],
        setupFiles: ["./test/setup.ts"],
        // a guard:  an element bug that halts rendering must fail its test, not hang the run
        testTimeout: 10_000,
        // Test files of one browser run in parallel iframes of ONE page, which has ONE focus:  firefox and webkit hand it
        // to whichever iframe asked last, so `focus()` / Tab / Escape tests of another file fail.  Chromium fakes focus
        // for every frame, so the quick single-browser run keeps its parallelism.
        fileParallelism: !environment.isAllBrowsers,
        // `inject("ci")` in a test:  timing budgets are skipped on a shared CI runner (`test/test.types.ts`);
        // `CI=false` / `CI=0` count as not CI
        provide: { ci: environment.isCI },
        browser: {
          enabled: true,
          provider: playwright(),
          headless: true,
          // `commands.emulateReducedMotion(true)` in a test:  Playwright's media emulation, in every browser (the
          // `cdp()` session is Chromium-only)
          commands: {
            emulateReducedMotion: async ({ page }, reduce: boolean) => {
              await page.emulateMedia({ reducedMotion: reduce ? "reduce" : null })
            }
          },
          instances: BROWSERS.map((browser) => ({ browser }))
        }
      }
    }
  ]
}

export default defineConfig({
  test: {
    projects: uiProjects()
  }
})
