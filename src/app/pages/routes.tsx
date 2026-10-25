import { onCleanup } from "solid-js"
import type { JSX } from "@solidjs/web"
import { createRouter, defineRoutes, useNavigate, type RouterHistory, type RouterInstance } from "@solidjs/router"

import { setNavigator } from "./navigation"
import { ProjectChooser } from "./ProjectChooser"
import { ProjectPageRoute } from "./SpellEditor"
import { ThemeEditorPage } from "./ThemeEditorPage"
import { THEME_PAGE } from "./pages.types"

/**
 * The app's routes (`@solidjs/router`):  `/edit/` or `/run/`, then an address (decision Q40, epic `people-and-orgs` P4).
 * - `/edit/<address>`:  `<SpellEditor>` in Edit or Debug, e.g. `/edit/@spell/examples/Solitaire/Solitaire.spell`
 * - `/run/<address>`:  the same page in Run, e.g. `/run/owen@spell/errors`
 * - `/theme`:  the theme editor (`<ThemeEditorPage>`)
 * - ONE route for both (`ProjectPageRoute`), so switching between them keeps the page.
 * - anything else:  `<ProjectChooser>`
 * - Each page is ONE route:  it stays mounted while only its address changes, e.g.
 *   moving between files, and follows them (`followRoute()`).
 */
export const ROUTES = defineRoutes([
  {
    path: "/:page/*address",
    matchFilters: { page: ["edit", "run"] },
    component: ProjectPageRoute
  },
  { path: THEME_PAGE, component: ThemeEditorPage },
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
