import { onCleanup } from "solid-js"
import type { JSX } from "@solidjs/web"
import { createRouter, defineRoutes, useNavigate, type RouterHistory, type RouterInstance } from "@solidjs/router"

import { setNavigator } from "./navigation"
import { ProjectChooser } from "./ProjectChooser"
import { SpellEditorRoute } from "./SpellEditor"
import { SpellRunnerRoute } from "./SpellRunner"

/**
 * The app's routes (`@solidjs/router`):  `/edit/` or `/run/`, then an address (decision Q40, epic `people-and-orgs` P4).
 * - `/edit/<address>`:  `<SpellEditor>`, e.g. `/edit/@spell/examples/Solitaire/Solitaire.spell`
 * - `/run/<address>`:  `<SpellRunner>`, e.g. `/run/owen@spell/errors`
 * - anything else:  `<ProjectChooser>`
 * - Each page is ONE route:  it stays mounted while only its address changes, e.g.
 *   moving between files, and follows them (`followRoute()`).
 */
export const ROUTES = defineRoutes([
  {
    path: "/edit/*address",
    component: SpellEditorRoute
  },
  {
    path: "/run/*address",
    component: SpellRunnerRoute
  },
  { path: "*", component: ProjectChooser }
])

/**
 * A router over `ROUTES`;  `history` defaults to the browser's (tests pass `memoryHistory()`).
 * - `explicitLinks`:  the router takes only `<a link>` clicks.  The app navigates through `editor` (`navigate()`),
 *   never links, and a running PROGRAM's own `<a>`s are the program's:  without it, the router would take every
 *   same-origin link on the page.
 */
export function createAppRouter(history?: RouterHistory): RouterInstance<typeof ROUTES> {
  return createRouter({ routes: ROUTES, explicitLinks: true, ...(history && { history }) })
}

/** The app's router:  ONE per app (`@solidjs/router`'s rule), on the browser's history. */
export const AppRouter = createAppRouter()

/****************
 * ### `<Routes>`
 * The page the URL names, through `router` (default:  `AppRouter`).
 * - Its root layout, `<AppShell>`, stays mounted while the app runs, and hands the router's `navigate()` to
 *   `navigation.ts`, so `editor` can change the page.
 ****************/
export function Routes(props: { router?: RouterInstance<typeof ROUTES> }) {
  const Router = props.router ?? AppRouter
  return <Router>{(route) => <AppShell>{route.children}</AppShell>}</Router>
}

/****************
 * ### `<AppShell>`
 * The router's root layout:  the page, as is.
 * - SIDE EFFECT:  `setNavigator()` while it's mounted:  `editor.showEditor()` etc. navigate through the router.
 ****************/
function AppShell(props: { children?: JSX.Element }) {
  const navigate = useNavigate()
  setNavigator((url, options) => navigate(url, options))
  onCleanup(() => setNavigator(undefined))
  return <>{props.children}</>
}
