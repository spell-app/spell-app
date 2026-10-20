import { getPath, setPath, splitPath, type PathStep } from "@spell-app/util"

import { core } from "./core"
import { defineCoreModule } from "./core.types"

export type { PathStep }

/**
 * Getting and setting values by path, e.g. `"a.b[0].c"` -- spell's own names for `$/util`'s, which the app's forms
 * use too, WITHOUT importing `core`.  See `$/util/spell/paths.ts`.
 */
export const pathMethods = defineCoreModule({
  /** Given an `object` and a string `path`, walk it to get the leaf value -- see `getPath()` in `$/util`. */
  getPath(object: unknown, path: string): unknown {
    return getPath(object, path)
  },

  /** Given an `object`, walk `path` and set leaf step to `value` -- see `setPath()` in `$/util`. */
  setPath(object: unknown, path: string, value: unknown): unknown {
    return setPath(object, path, value)
  },

  /** Split `path` into an array of steps, e.g. `["a", "b", 0, "c"]` -- see `splitPath()` in `$/util`. */
  splitPath(path: unknown): PathStep[] | undefined {
    return splitPath(path)
  }
})
Object.assign(core, pathMethods)
