/**
 * Fetching what a runner shows, afresh every time (`cache: "no-cache"`):  a project's compiled code, scope pack and
 * declarations change whenever it's recompiled, and a runner must never run a stale copy.
 * - Through the kit's `$fetch()`, so a failure is its typed error (`MissingResourceError` ...).
 */
import { $fetch } from "spell/util"

/** Text at `url` -- throws `$fetch()`'s error if it's not there. */
export async function fetchText(url: string): Promise<string> {
  return $fetch<string>({ url, cache: "no-cache" })
}

/**
 * JSON at `url` -- `undefined` if there's no `url`, or nothing there.
 * - NEVER throws:  for what's optional, e.g. a project's declarations.
 */
export async function fetchJSON<T>(url: string | undefined): Promise<T | undefined> {
  if (!url) return undefined
  try {
    return await $fetch<T>({ url, cache: "no-cache", format: "json" })
  } catch {
    return undefined
  }
}
