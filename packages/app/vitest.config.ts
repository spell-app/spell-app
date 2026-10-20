import { resolve } from "node:path"
import { configDefaults, defineConfig, type TestProjectConfiguration } from "vite-plus"
import { playwright } from "vite-plus/test/browser-playwright"

import { appConfig } from "./vite.shared.ts"

/**
 * Tests that need a real browser, and Solid's CLIENT build:
 * `*.browser.test.ts(x)`, anywhere in `src/` or `components/` (`<spell-app>`, `<spell-editor>`), from `TESTS`.
 */
const BROWSER_TESTS = ["src/**/*.browser.test.{ts,tsx}", "components/**/*.browser.test.{ts,tsx}"]
/** The tests live in the repo's tests/ folder, at the same paths as the code. */
const TESTS = resolve(import.meta.dirname, "../../tests/app")

/**
 * Two projects, each with its OWN `appConfig()` (aliases from the repo root's `tsconfig.base.json`, decorator
 * lowering, the Solid plugin):
 * - `node` -- every test but `BROWSER_TESTS`.  `solid-js` is its SERVER build there:
 *   `renderToString`, writes NOT staged (`src/solid.test.tsx` pins it).
 * - `browser` -- `BROWSER_TESTS`, in chromium (Vitest browser mode + Playwright):  Solid's client build, so staged
 *   writes, effects and `flush()` behave as in the app.
 * - `node` SAYS `environment: "node"`:  the Solid plugin reads it from the config it's created in to pick the server
 *   build (without it, jsdom + the client build);  `browser` mode gets the client build.
 * - `prefix` / `root`:  the repo root's `vitest.config.ts` lists these with `app:` names and `root` set to this
 *   package, since vitest doesn't nest `projects`.  Own run:  no prefix, `root` is the config's folder.
 */
export function appProjects({
  prefix = "",
  root
}: { prefix?: string; root?: string } = {}): TestProjectConfiguration[] {
  return [
    {
      ...appConfig(),
      ...(root && { root }),
      test: {
        name: `${prefix}node`,
        dir: TESTS,
        environment: "node",
        exclude: [...configDefaults.exclude, ...BROWSER_TESTS]
      }
    },
    {
      ...browserConfig(),
      ...(root && { root }),
      test: {
        name: `${prefix}browser`,
        dir: TESTS,
        include: BROWSER_TESTS,
        // Spell UI's core first, as a page has it:  its settings for `$/spell-element` (`packages/ui/test/setup.ts`)
        setupFiles: ["@spell-app/ui/test/setup.ts"],
        browser: {
          enabled: true,
          provider: playwright(),
          headless: true,
          instances: [{ browser: "chromium" }]
        }
      }
    }
  ]
}

export default defineConfig({
  test: {
    projects: appProjects()
  }
})

/**
 * `appConfig()` for the `browser` project, with Solid pre-bundled up front.
 * - Without it, the first run on a fresh cache finds them mid-run, re-optimizes and RELOADS:
 *   a test file then imports a second Solid.
 */
function browserConfig() {
  const config = appConfig()
  return {
    ...config,
    optimizeDeps: {
      // crawl the tests' imports up front:  `$/app/editor` pulls in more (`marked`, lodash ...)
      // - `spellRuntime.ts` too:  tests import it by URL (`editor.loadRuntime()`), which the crawl can't follow, so
      //   ITS deps (`lodash/cloneDeep` ...) were found mid-run on a fresh cache (C6)
      entries: [...BROWSER_TESTS.map((glob) => `${TESTS}/${glob}`), "src/runner/spellRuntime.ts"],
      include: ["solid-js", "@solidjs/web", "@solidjs/h"]
    }
  }
}
