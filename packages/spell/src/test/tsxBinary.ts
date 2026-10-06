import { existsSync } from "fs"
import { dirname, resolve } from "path"

import environment from "$/spell/node/environment"

/**
 * Absolute path of the `tsx` executable that tests spawn.
 * - Why a search:  yarn hoists to the monorepo root, so `packages/spell/node_modules/.bin/tsx` usually doesn't
 *   exist -- the first `node_modules/.bin/tsx` at or above `packages/spell/` is `spell`'s own `tsx` (pinned to
 *   4.20.3:  4.23 can't import `$/spell/node/packageVersion.node`, see `agents/PAPERCUTS.md`).
 * - Throws when none exists, i.e. `yarn install` hasn't run.
 */
export function tsxBinary(): string {
  return binary("tsx")
}

/**
 * Absolute path of the `tsc` executable that tests spawn:  the workspace's TypeScript 7, found as `tsxBinary()`
 * finds `tsx` -- see `typescript.test.ts`.
 */
export function tscBinary(): string {
  return binary("tsc")
}

/** The first `node_modules/.bin/<name>` at or above `packages/spell/`;  throws if none, i.e. no `yarn install`. */
function binary(name: string): string {
  const start = resolve(environment.srcDir, "..")
  for (let folder = start; ; folder = dirname(folder)) {
    const candidate = resolve(folder, `node_modules/.bin/${name}`)
    if (existsSync(candidate)) return candidate
    if (dirname(folder) === folder)
      throw new Error(`no node_modules/.bin/${name} at or above ${start}:  run \`yarn install\``)
  }
}
