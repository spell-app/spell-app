import { configDefaults, defineConfig, type TestProjectConfiguration } from "vitest/config"
import { playwright } from "@vitest/browser-playwright"

import { appConfig } from "./vite.shared.ts"

/** Tests that need a real browser, and Solid's CLIENT build:  `*.browser.test.ts(x)`, anywhere in `src/`. */
const BROWSER_TESTS = ["src/**/*.browser.test.{ts,tsx}"]

/**
 * Two projects, each with its OWN `appConfig()` (aliases from the repo root's `tsconfig.base.json`, decorator
 * lowering, React / Solid plugins side by side):
 * - `node` -- every test but `BROWSER_TESTS`.  `solid-js` is its SERVER build there:  `renderToString`, writes NOT
 *   staged (`src/solid.test.tsx` pins it).
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
        environment: "node",
        exclude: [...configDefaults.exclude, ...BROWSER_TESTS]
      }
    },
    {
      ...appConfig(),
      ...(root && { root }),
      test: {
        name: `${prefix}browser`,
        include: BROWSER_TESTS,
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
