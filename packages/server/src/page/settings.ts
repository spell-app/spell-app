import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

import type { ComponentSet, EngineRoute, PageServerSettings } from "$/server/page"

/**
 * The `"pageServer"` field of the `package.json` at `root`;  `{}` without one.
 * - route modules, watched folders, the writable folders, the bundles, page scripts, component sets, engine routes
 * - read fresh on each call:  a server reads it once as it starts, the tools as they need it
 * - NOTE: plain `node` loads this file by path (spell-epic's tools, through `page.types.ts`):
 *   node built-ins and type imports only
 */
export function pageServerSettings(root: string): PageServerSettings {
  const file = join(root, "package.json")
  if (!existsSync(file)) return {}
  return (JSON.parse(readFileSync(file, "utf8")) as { pageServer?: PageServerSettings }).pageServer ?? {}
}

/**
 * Where the component sets are served:  `/components/<set>/` (epic `people-and-orgs` P18, Q25).
 * - One home for every set, so the top bar lists them all from one place.
 * - A repo set's name never has an `@`;  a space's always will, so they can't clash.
 * - Here, not in `page.types.ts` (which re-exports it):  this file loads under plain `node`, without the `$/` aliases.
 */
export const COMPONENTS_PREFIX = "/components"

/**
 * The component sets `settings` name (`"componentSets"`), in their order, each with its address:
 * `/components/<id>` (`COMPONENTS_PREFIX`).
 */
export function componentSets(settings: PageServerSettings): ComponentSet[] {
  return Object.entries(settings.componentSets ?? {}).map(([id, set]) => ({
    name: set.name,
    prefix: `${COMPONENTS_PREFIX}/${id}`,
    dir: set.dir,
    assets: set.assets
  }))
}

/**
 * The engine routes `settings` name (`"engineRoutes"`), each as a URL prefix and a URL path from the checkout,
 * both ending `/`:  `"/_epic/pack/": "x/__pack"` => `["/_epic/pack/", "/x/__pack/"]`.
 */
export function engineRoutes(settings: PageServerSettings): EngineRoute[] {
  return Object.entries(settings.engineRoutes ?? {}).map(([route, folder]) => [
    withSlash(route),
    withSlash(`/${folder.replace(/^\/+/, "")}`)
  ])
}

/** `path`, ending `/`. */
function withSlash(path: string): string {
  return path.endsWith("/") ? path : `${path}/`
}

/**
 * REFACTOR (epic `repo-split` P4):  everything below is kept only for spell-epic, which reads spell-app's MAIN
 * checkout through its link, until it switches;  `page.types.ts` re-exports it.
 * - the checkout THIS package is in:  its settings are spell-epic's view of spell-app's
 * - delete it all when spell-epic reads `componentSets()` of a checkout's settings
 */
const OWN_CHECKOUT = fileURLToPath(new URL("../../../..", import.meta.url))

/**
 * The component sets of the checkout this package is in (`componentSets()` of its settings), as the page server
 * used to list them.
 * - also what a `PageServer` serves when its root's settings name none (a test's scratch checkout):
 *   spell-epic's route-module tests serve their sets that way
 */
export const COMPONENT_SETS: readonly ComponentSet[] = componentSets(pageServerSettings(OWN_CHECKOUT))

/** The first set's site bundle (Spell UI's own site), relative to the checkout. */
export const SITE_BUNDLE = COMPONENT_SETS[0]?.assets ?? ""

/** The site bundle the OTHER sets share (Spell UI's site built for them), relative to the checkout. */
export const SETS_BUNDLE = COMPONENT_SETS.find((set) => set.assets !== SITE_BUNDLE)?.assets ?? SITE_BUNDLE
