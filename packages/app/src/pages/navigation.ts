//
//  ## Navigation from outside the pages:  `editor.showEditor()` and friends change the URL through here.
//  NOTE: imports nothing, Solid included:  `editor.ts` uses it, and the editor never loads Solid up front.
//

/**
 * Show `url`, as a link to it would:  the router (`routes.tsx`) draws the page its route names.
 * - Through the router's own `navigate()` once `<AppShell>` has handed it over (`setNavigator()`), so the router
 *   sees the change.  A bare `history.pushState()` would change the address bar and nothing else.
 * - Before that, and with no router at all (tests, a runner):  plain `history`, so the URL is still right when a
 *   router starts later and reads it.
 * - `replace`:  replace the current history entry instead of adding one, e.g. a redirect.
 */
export function navigate(url: string, { replace = false }: NavigateOptions = {}): void {
  if (routerNavigate) return routerNavigate(url, { replace })
  if (typeof history === "undefined") return
  if (replace) history.replaceState(null, "", url)
  else history.pushState(null, "", url)
}

/** Options for `navigate()`. */
export type NavigateOptions = {
  /** Replace the current history entry instead of adding one. */
  replace?: boolean
}

/**
 * Hand over the router's `navigate()` (`useNavigate()`), or `undefined` when the router goes.
 * - Called by `<AppShell>` (`routes.tsx`), the router's root layout, which stays mounted while the app runs.
 */
export function setNavigator(next: Navigator | undefined): void {
  routerNavigate = next
}

/** What `setNavigator()` takes:  the router's `navigate()`, narrowed to what `navigate()` uses. */
export type Navigator = (url: string, options: { replace: boolean }) => void

/** The router's `navigate()`, once `<AppShell>` is up. */
let routerNavigate: Navigator | undefined
