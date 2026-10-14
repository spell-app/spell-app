import { browserHistory, type LocationChange, type RouterHistory } from "@solidjs/router"

/**
 * `history` (the browser's by default), as the app's router reads and writes it:  the two slashes of an address,
 * `/edit/@spell/examples/solitaire//Card.spell`, as `/%2F` (decision Q40, epic `people-and-orgs` P4).
 * - Why:  the router matches NO route for a URL with an empty part (`/foo//bar`, its issue #567), so it must never
 *   see one.  `/%2F` is one part, which `SP.SpellLocation.addressForUrl()` decodes back to the `//`.
 * - The browser's address bar keeps the address as it is:  what the router writes goes back to `//` (`toBrowser()`).
 * - The app navigates in the router's form:  `toRouter()` it first (`<AppShell>`'s navigator does).
 */
export function addressHistory(history: RouterHistory = browserHistory()): RouterHistory {
  return {
    ...history,
    get: () => routerChange(history.get()),
    set: (next) => history.set({ ...next, value: toBrowser(next.value) }),
    init:
      history.init && ((notify) => history.init!((value) => notify(value === undefined ? value : routerChange(value))))
  }
}

/** `url` with each `//` in its path as `/%2F`, the form the router can match:  `/edit/a//b` => `/edit/a/%2Fb`. */
export function toRouter(url: string): string {
  const at = url.search(/[?#]/)
  const path = at < 0 ? url : url.slice(0, at)
  return path.replace(/(?<=.)\/\//g, "/%2F") + (at < 0 ? "" : url.slice(at))
}

/** `url` with each `/%2F` in its path back to `//`:  what the browser shows. */
export function toBrowser(url: string): string {
  const at = url.search(/[?#]/)
  const path = at < 0 ? url : url.slice(0, at)
  return path.replace(/\/%2F/gi, "//") + (at < 0 ? "" : url.slice(at))
}

/** `change` (a URL, or a URL with its options) with its URL `toRouter()`. */
function routerChange(change: string | LocationChange): string | LocationChange {
  return typeof change === "string" ? toRouter(change) : { ...change, value: toRouter(change.value) }
}
