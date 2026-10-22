import { configDefaults, defineConfig, type TestProjectConfiguration } from "vite-plus"
import { playwright } from "vite-plus/test/browser-playwright"

import { standardDecorators } from "spell-kit/toolchain/decorators"
import { packageVersion } from "spell-kit/toolchain/packageVersion"
import { appConfig } from "./app/vite.shared.ts"

/**
 * The app's tests that need a real browser, and Solid's CLIENT build:
 * `*.browser.test.ts(x)`, anywhere in its tests (`<spell-app>`, `<spell-editor>` too).
 */
const BROWSER_TESTS = ["**/*.browser.test.{ts,tsx}"]

/** The app's tests, at the same paths as its code (`src/app/`). */
const APP_TESTS = "tests/app"

/**
 * spell-app's Vitest config:  one project per folder of `src/`,
 * each over its tests in `tests/<folder>/`, at the same paths as the code.
 * - `yarn vp test run --project spaces` runs one;  the app's are `app:node` and `app:browser`.
 * - `standardDecorators()` lowers standard decorators (spell's, which most of them load):
 *   vite 8's own transform (oxc) doesn't.
 * - The app's two each have their OWN `appConfig()` (decorator lowering, the Solid plugin, Lightning CSS),
 *   not this file's plugins (`extends: false`):
 *   - `app:node`:  every app test but `BROWSER_TESTS`.
 *     - `solid-js` is its SERVER build there:  `renderToString`, writes NOT staged (`solid.test.tsx` pins it).
 *     - It SAYS `environment: "node"`:
 *       the Solid plugin reads it from the config it's created in to pick the server build
 *       (without it, the client build).
 *   - `app:browser`:  `BROWSER_TESTS`, in chromium (Vitest browser mode + Playwright):
 *     Solid's client build, so staged writes, effects and `flush()` behave as in the app.
 * - `spell`:  spell-lang's language on the frozen test projects (`spaces/@spell/test/`), in `tests/spell/`, at the
 *   same paths their tests had in spell-lang (epic `spanish` P18):  the projects' snapshots, `tsc` and pyright on them,
 *   whole-project parsing.
 *   - No folder of `src/` of its own:  it tests spell-lang's `spell`, by package, on this repo's projects.
 * - The VS Code extension's tests (`vscode/tests/`) are a project of their own, `vscode`, by ITS config:
 *   `vscode/vitest.config.ts`.
 * - Python's tests (spaces' web server, `tests/spaces/server/py/`) are pytest's:  `yarn test` runs them after.
 */
export default defineConfig({
  plugins: [standardDecorators(), packageVersion(import.meta.dirname)],
  test: {
    projects: [
      { extends: true, test: { name: "spaces", dir: "tests/spaces", environment: "node" } },
      { extends: true, test: { name: "lsp", dir: "tests/lsp" } },
      ...appProjects(),
      { extends: true, test: { name: "cli", dir: "tests/cli" } },
      { extends: true, test: { name: "spell", dir: "tests/spell" } },
      // the VS Code extension's:  its own yarn project, so its own config (a stand-in `vscode`)
      "vscode/vitest.config.ts"
    ]
  }
})

/** The app's two projects, `app:node` and `app:browser` (above). */
function appProjects(): TestProjectConfiguration[] {
  return [
    {
      ...appConfig(),
      extends: false,
      test: {
        name: "app:node",
        dir: APP_TESTS,
        environment: "node",
        exclude: [...configDefaults.exclude, ...BROWSER_TESTS]
      }
    },
    {
      ...browserConfig(),
      extends: false,
      test: {
        name: "app:browser",
        dir: APP_TESTS,
        include: BROWSER_TESTS,
        // Spell UI's core first, as a page has it:  its settings for `spell-kit/element`
        setupFiles: ["spell-ui/test-helpers/setup.ts"],
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

/**
 * `appConfig()` for the `app:browser` project, with Solid pre-bundled up front.
 * - Without it, the first run on a fresh cache finds them mid-run, re-optimizes and RELOADS:
 *   a test file then imports a second Solid.
 */
function browserConfig() {
  return {
    ...appConfig(),
    optimizeDeps: {
      // crawl the tests' imports up front:  `spell-app/app/editor` pulls in more (`marked`, lodash ...)
      // - `spellRuntime.ts` too:  tests import it by URL (`editor.loadRuntime()`), which the crawl can't follow, so
      //   ITS deps (`lodash/cloneDeep` ...) were found mid-run on a fresh cache (C6)
      entries: [...BROWSER_TESTS.map((glob) => `${APP_TESTS}/${glob}`), "src/app/runner/spellRuntime.ts"],
      include: ["solid-js", "@solidjs/web", "@solidjs/h"]
    }
  }
}
