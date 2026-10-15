/**
 * Loose types and constants of the `epic-cards` family:  the page server's answer it draws, and its groups.
 * - Data only:  nothing here runs.  The route that answers (`$/epics/tool/SagaEpics`) imports these types too.
 */

import type { EpicFacts } from "$/server/site/EpicState"

/** Where the cards come from:  `GET /api/epics/saga?saga=<id>` (`$/epics/tool/epicRoutes.ts`). */
export const SAGA_EPICS_API = "/api/epics/saga"

/** One epic serving a saga, as the page server answers it. */
export type SagaEpic = {
  /** the epic's id, its folder in `epics/`:  `python-target` */
  name: string
  /** its epic page's title:  `Python Target` */
  title: string
  /** its epic page, from the saga page's folder:  `../../epics/python-target/python-target.plan.html` */
  href: string
  /** its `<epic-summary>`, as text;  `""` with none */
  summary: string
  /** what its state is read from (`$/server/site/EpicState`) */
  facts: EpicFacts
}

/** `GET /api/epics/saga`'s answer:  the saga's id, and every epic naming it, by title. */
export type SagaEpicsAnswer = { saga: string; epics: SagaEpic[] }

/** Why no cards show:  opened from disk, the page server wouldn't answer, or no epic names the saga. */
export type CardsProblem = "file" | "server" | "none"

/**
 * The groups the cards fall in, in the Epics page's order (`$/server/site/EpicCards` `EPIC_GROUPS`, less Favorites,
 * which is Owen's own list there):  each one's icon, and its title's text key.
 */
export const CARD_GROUPS = [
  { group: "active", icon: "circle half stroke", title: "activeTitle" },
  { group: "planning", icon: "seedling", title: "planningTitle" },
  { group: "urgent", icon: "circle exclamation", title: "urgentTitle" },
  { group: "done", icon: "circle check", title: "doneTitle" }
] as const

/** An epic page's file, as the page server announces a change (`spell-server:file`):  the cards ask again. */
export const EPIC_FILE = /\/epics\/[^/]+\/(?:parts\/[^/]+|[^/]+\.plan)\.html$/
