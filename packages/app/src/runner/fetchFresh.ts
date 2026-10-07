/**
 * Fetching what a runner shows, afresh every time (`cache: "no-cache"`):  a project's compiled code, scope pack and
 * declarations change whenever it's recompiled, and a runner must never run a stale copy.
 */

/** Text at `url` -- throwing if it's not there. */
export async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, { cache: "no-cache" })
  if (!response.ok) throw new Error(`Couldn't load ${url}:  ${response.status} ${response.statusText}`)
  return response.text()
}

/**
 * JSON at `url` -- `undefined` if there's no `url`, or nothing there.
 * - NEVER throws:  for what's optional, e.g. a project's declarations.
 */
export async function fetchJSON<T>(url: string | undefined): Promise<T | undefined> {
  if (!url) return undefined
  try {
    const response = await fetch(url, { cache: "no-cache" })
    return response.ok ? ((await response.json()) as T) : undefined
  } catch {
    return undefined
  }
}
