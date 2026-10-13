import { resolve } from "node:path"
import { defineConfig, type TestProjectConfiguration } from "vite-plus"
import { playwright } from "vite-plus/test/browser-playwright"

import { baseConfig } from "../ui/vite.config.ts"

/**
 * vitest config for `@spell-app/brand`, a component pack (`spell dev pack`):  two projects.
 * - `node` -- `src/**`:  the pack's own checks, `pack.test.ts` among them (`spell dev pack check brand`:
 *   `components/__pack/` and `docs/__data/` are current), and the brand's colour math (`Palette.test.ts`)
 * - `browser` -- `components/**`:  the `<brand-*>` elements, in a REAL browser (Vitest browser mode + Playwright,
 *   chromium), as Spell UI's are.  `baseConfig()`:  Spell UI's plugins (decorators BEFORE Solid), Solid dedupe,
 *   Lightning CSS;  Spell UI's test helpers come from `$/ui/test/...`
 * - `prefix` / `root`:  the repo root's `vitest.config.ts` lists these as `brand:node` / `brand:browser`, `root`
 *   set to this package, since vitest doesn't nest `projects`.  Own run:  no prefix, `root` is this folder.
 */
/** The tests live in the repo's tests/ folder, at the same paths as the code. */
const TESTS = resolve(import.meta.dirname, "../../tests/brand")

export function brandProjects({
  prefix = "",
  root
}: { prefix?: string; root?: string } = {}): TestProjectConfiguration[] {
  return [
    {
      resolve: { tsconfigPaths: true },
      ...(root && { root }),
      test: {
        name: `${prefix}node`,
        dir: TESTS,
        environment: "node",
        include: ["src/**/*.test.ts"]
      }
    },
    {
      ...baseConfig(),
      ...(root && { root }),
      test: {
        name: `${prefix}browser`,
        dir: TESTS,
        include: ["components/**/*.test.{ts,tsx}"],
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
    }
  ]
}

export default defineConfig({
  test: {
    projects: brandProjects()
  }
})
