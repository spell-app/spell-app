import { defineConfig, type TestProjectConfiguration } from "vite-plus"
import { playwright } from "vite-plus/test/browser-playwright"

import { standardDecorators } from "../../vite.decorators.ts"
import { packageVersion } from "../../vite.packageVersion.ts"

/**
 * Two projects:
 * - `browser` -- the generic helpers' tests, in a REAL browser (Vitest browser mode + Playwright, chromium):
 *   `dom.test.ts` needs shadow roots and a custom element registry, and `decorators.test.ts` proves `@proto` after
 *   esbuild lowers standard decorators.
 * - `spell` -- the tests of `src/spell/` (spell's utilities) and `src/reactive/` (spell cells), in node:  fetch,
 *   tasks, constants, cells.
 * - `standardDecorators()` is what lowers decorators:  Vite 8's own transform (oxc) doesn't.  See `AGENTS.md`.
 * - Aliases (`$/util` ...) come from the repo root's `tsconfig.base.json`, through `resolve.tsconfigPaths`.
 * - `prefix` / `root`:  the repo root's `vitest.config.ts` lists these with `util:` names and `root` set to this
 *   package, since vitest doesn't nest `projects`.  Own run:  no prefix, `root` is the config's folder.
 */
export function utilProjects({
  prefix = "",
  root
}: { prefix?: string; root?: string } = {}): TestProjectConfiguration[] {
  return [
    {
      plugins: [standardDecorators()],
      resolve: { tsconfigPaths: true },
      ...(root && { root }),
      test: {
        name: `${prefix}browser`,
        include: ["src/**/*.test.ts"],
        exclude: ["**/node_modules/**", "src/spell/**", "src/reactive/**"],
        browser: {
          enabled: true,
          provider: playwright(),
          headless: true,
          instances: [{ browser: "chromium" }]
        }
      }
    },
    {
      plugins: [standardDecorators(), packageVersion()],
      resolve: { tsconfigPaths: true },
      ...(root && { root }),
      test: {
        name: `${prefix}spell`,
        environment: "node",
        include: ["src/spell/**/*.test.ts", "src/reactive/**/*.test.ts"]
      }
    }
  ]
}

export default defineConfig({
  test: {
    projects: utilProjects()
  }
})
