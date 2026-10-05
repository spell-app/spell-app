import { existsSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { defineConfig, type TestProjectConfiguration } from "vite-plus"

import { appProjects } from "./packages/app/vitest.config.ts"
import { uiProjects } from "./packages/ui/vitest.config.ts"
import { utilProjects } from "./packages/util/vitest.config.ts"

/**
 * ONE vitest run for every package:  `yarn test`, `yarn vitest` and the VS Code vitest extension all read this.
 * - Each package keeps its own `vitest.config.ts` (so `yarn test` in a package folder is unchanged);  this file
 *   only lists them as `projects`, each named for its folder, so `--project spell` / `--project ui:ssr` read
 *   clearly.
 * - NEW PACKAGE:  one with a `vitest.config.ts` at `packages/<folder>/` is picked up automatically.  Only a package
 *   whose config holds several projects of its own needs an entry in `SPECIAL` below, since vitest doesn't nest
 *   `projects`.
 * - Every project gets its own `root`, so its relative globs, `setupFiles` and aliases resolve per package.
 */
const PACKAGES_DIR = resolve(import.meta.dirname, "packages")

/**
 * Packages whose config holds several projects:  folder -> projects, built from the package's own exported
 * factory so the two stay in step.
 * - `app`:  `node` (most tests) and `browser` (`*.browser.test.ts(x)`:  Solid's client build).
 * - `util`:  `browser` (generic helpers) and `spell` (node, `src/spell/`).
 * - `ui`:  `ssr` MUST run before `browser` (it writes `.cache/ssr-button.html`, which `test/dsd.test.ts` imports),
 *   so `uiProjects` sets `sequence.groupOrder`.  See there.
 */
const SPECIAL: Record<string, TestProjectConfiguration[]> = {
  app: appProjects({ prefix: "app:", root: resolve(PACKAGES_DIR, "app") }),
  ui: uiProjects({ prefix: "ui:", root: resolve(PACKAGES_DIR, "ui") }),
  util: utilProjects({ prefix: "util:", root: resolve(PACKAGES_DIR, "util") })
}

/** Projects of every package folder, in folder order. */
function packageProjects(): TestProjectConfiguration[] {
  const projects: TestProjectConfiguration[] = []
  for (const folder of readdirSync(PACKAGES_DIR).sort()) {
    const root = resolve(PACKAGES_DIR, folder)
    const config = resolve(root, "vitest.config.ts")
    if (SPECIAL[folder]) projects.push(...SPECIAL[folder])
    else if (existsSync(config)) projects.push({ extends: config, root, test: { name: folder } })
  }
  return projects
}

export default defineConfig({
  test: {
    projects: packageProjects()
  }
})
