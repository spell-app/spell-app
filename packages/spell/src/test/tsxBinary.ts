import { nodeBinary } from "$/spell/node/typecheck"

/**
 * Absolute path of the `tsx` executable that tests spawn.
 * - The first `node_modules/.bin/tsx` at or above `packages/spell/` is `spell`'s own `tsx` (pinned to 4.20.3:  4.23
 *   can't import `$/spell/node/packageVersion.node`, see `agents/PAPERCUTS.md`) -- see `nodeBinary()`.
 * - Throws when none exists, i.e. `yarn install` hasn't run.
 */
export function tsxBinary(): string {
  return nodeBinary("tsx")
}
