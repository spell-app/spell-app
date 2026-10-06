/// <reference types="node" />

import { execFileSync } from "node:child_process"
import { existsSync, readdirSync, statSync } from "node:fs"
import { fileURLToPath } from "node:url"

import { Terminal } from "./Terminal.ts"

/****************
 * ### `ForkBuild`
 * Makes sure the fork's BUILT output (`packages/solid-element/dist/index.js`) is current before a tool reads it.
 * - Who needs it:  only production-condition consumers -- `yarn vendor` / `yarn measure` bundle
 *   `@spell-app/solid-element` through its `default` export, i.e. `dist/index.js`.  Dev, tests, the site and the
 *   library build never do:  Vite resolves the fork's `development` export (`src/index.ts`), the build leaves it
 *   external, and `vite.config.ts` imports the HMR plugin from source.
 * - `ensure()` runs the fork's `yarn build` when `dist/` is missing or older than any `src/` file.  The fork is a
 *   workspace of the same yarn project, so the root `yarn install` has already installed it.
 * - STATIC and instance-free:  there is one fork per checkout.
 ****************/
export class ForkBuild {
  /** Build as needed;  synchronous (the tools run it before anything else). */
  static ensure(): void {
    if (ForkBuild.isStale()) ForkBuild.yarn("build")
  }

  /** `dist/index.js` missing, or older than the newest non-test source file. */
  static isStale(): boolean {
    const output = `${FORK_ROOT}dist/index.js`
    if (!existsSync(output)) return true
    const built = statSync(output).mtimeMs
    const sources = readdirSync(`${FORK_ROOT}src`).filter((file) => !file.includes(".test."))
    return sources.some((file) => statSync(`${FORK_ROOT}src/${file}`).mtimeMs > built)
  }

  /** `yarn <command>` in the fork, its output shown. */
  private static yarn(command: string) {
    Terminal.err(`packages/solid-element:  yarn ${command}`)
    execFileSync("yarn", [command], { cwd: FORK_ROOT, stdio: "inherit" })
  }
}

/** `packages/solid-element/`, absolute, with a trailing slash. */
const FORK_ROOT = fileURLToPath(new URL("../../solid-element/", import.meta.url))
