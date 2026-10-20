import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { defineConfig, type TestProjectConfiguration } from "vite-plus"

import { appProjects } from "./app/vitest.config.ts"

/**
 * ONE vitest run for every package of spell-app:  `yarn vitest` and the VS Code vitest extension read this
 * (`yarn test` runs each package's own `test` script instead, as every repo's root does).
 * - Each package keeps its own `vitest.config.ts` (so `yarn test` in a package folder is unchanged);  this file
 *   only lists them as `projects`, each named for its folder, so `--project spaces` / `--project app:node` read
 *   clearly.
 * - The packages:  the root `package.json`'s `workspaces`, each a folder at the repo's root (epic `repo-split` P8).
 *   Only a package whose config holds several projects of its own needs an entry in `SPECIAL` below, since vitest
 *   doesn't nest `projects`.
 * - Every project gets its own `root`, so its relative globs, `setupFiles` and aliases resolve per package.
 */
const ROOT = import.meta.dirname

/**
 * Packages whose config holds several projects:  folder -> projects, built from the package's own exported
 * factory so the two stay in step.
 * - `app`:  `node` (most tests) and `browser` (`*.browser.test.ts(x)`:  Solid's client build).
 */
const SPECIAL: Record<string, TestProjectConfiguration[]> = {
  app: appProjects({ prefix: "app:", root: resolve(ROOT, "app") })
}

/** Projects of every package folder, in the `workspaces` order. */
function packageProjects(): TestProjectConfiguration[] {
  const { workspaces } = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8")) as { workspaces: string[] }
  const projects: TestProjectConfiguration[] = []
  for (const folder of workspaces) {
    const root = resolve(ROOT, folder)
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
