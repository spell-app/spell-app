/**
 * The EAGER half of the runtime:  `load()` and the `UI` accessor.
 * - In `core` (every page's `core.js`), so keep it small:  it imports only `./runtime.types`.
 * - Everything else in `$/ui/runtime` is reached through a dynamic `import("./UIRuntime")`, so Vite splits the
 *   runtime into its own chunk and a component's static imports stay tiny.  NEVER statically import a
 *   service class here -- `import type` only.
 */

import { RUNTIME_KEY, type RuntimeGlobal } from "./runtime.types"
import type { UIRuntime } from "./UIRuntime"

/** In-flight or finished runtime import, so concurrent first callers share one. */
let pending: Promise<UIRuntime> | undefined

/**
 * Load the runtime chunk (once) and resolve with the page's `UIRuntime` once it's `ready`.
 * - Components call this from `connectedCallback`:  `await UI.load()`.
 * - If another bundle already created the runtime, resolves with THAT instance without importing anything.
 * - A failed import (network) isn't cached, so the next call retries.
 */
export function load(): Promise<UIRuntime> {
  const existing = pageRuntime()
  if (existing) return existing.load()
  pending ??= import("./UIRuntime").then(
    ({ UIRuntime }) => UIRuntime.instance.load(),
    (error: unknown) => {
      pending = undefined
      throw error
    }
  )
  return pending
}

/**
 * The page runtime, typed as `UIRuntime`, usable BEFORE the chunk has loaded.
 * - A `Proxy` onto `globalThis[RUNTIME_KEY]`, so it's the same object for every bundle on the page:
 *   - `UI.load()` works any time -- it's how the runtime gets loaded
 *   - anything else (`UI.keyboard`, `UI.toast()`) throws until `await UI.load()` has resolved,
 *     rather than returning `undefined` and failing somewhere less obvious
 * - Why not `export const UI = UIRuntime.instance`:  that's a STATIC import of every service,
 *   which would put the whole runtime in each component's chunk.
 * - NOTE: `await UI` is safe -- `then` reads as `undefined`, so it doesn't look like a promise.
 */
export const UI: UIRuntime = new Proxy({} as UIRuntime, {
  get(_target, key) {
    // always the module function, so `await UI.load()` resolves with the real instance, not this proxy
    if (key === "load") return load
    const runtime = pageRuntime()
    if (runtime) return Reflect.get(runtime, key, runtime)
    if (key === "then" || typeof key === "symbol") return undefined
    throw notLoaded(key)
  },
  set(_target, key, value) {
    const runtime = pageRuntime()
    if (!runtime) throw notLoaded(key)
    return Reflect.set(runtime, key, value, runtime)
  },
  has(_target, key) {
    const runtime = pageRuntime()
    return runtime ? key in runtime : key === "load"
  }
})

/** The runtime any bundle on this page created, if one has. */
function pageRuntime(): UIRuntime | undefined {
  return (globalThis as RuntimeGlobal)[RUNTIME_KEY]
}

/** What reading or writing `UI.<key>` throws before the runtime has loaded. */
function notLoaded(key: string | symbol): Error {
  return new Error(`UI.${String(key)}:  the UI runtime isn't loaded yet;  \`await UI.load()\` first`)
}
