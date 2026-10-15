/**
 * Types and constants of `$/epics/links`:  pointing at a saga, an epic, a phase or an item, the same way everywhere
 * (epic `epic-workflow` P15, J32).
 * - Pure data and types:  nothing here runs.
 */

////////////////
// ## Addresses
////////////////

/**
 * A SHORT ADDRESS, as Owen types it and pages link with it:  `SAGA:/<saga>[/<epic>][#<id>]`.
 * - `SAGA:/drawable-spell` -- the saga page;  `#T3` -- item T3 on it
 * - `SAGA:/drawable-spell/python-target` -- the epic page;  `#T1` -- item T1 on it
 * - the colon form, `SAGA:/drawable-spell:python-target#T1`, is read too (J32);  the tools write the slash form
 * - `SAGA:` in any case;  the id in any case, `#T1` ~== `#t1`
 * - groups:  saga, epic, id
 */
export const SAGA_ADDRESS = /^saga:\/([a-z0-9]+(?:-[a-z0-9]+)*)(?:[/:]([a-z0-9]+(?:-[a-z0-9]+)*))?\/?(?:#([\w-]+))?$/i

/** What every short address starts with:  how a link's `href` is told for one. */
export const SAGA_SCHEME = /^saga:\//i

/** How the tools write the scheme. */
export const SAGA_PREFIX = "SAGA:/"

/** A saga's or an epic's id:  lower-kebab-case, as their folders are named. */
export const LINK_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** An id on a page:  an item's (`T1`, `j32`), a phase's (`p7`, `p-epic-migrate`), a section's. */
export const LINK_ID = /^[A-Za-z][\w-]*$/

/**
 * The page server's typed address:  `/saga/<saga>[/<epic>]`, redirected to the page (the `#id` stays in the browser);
 * the same under `/worktrees/<w>/`.
 */
export const SAGA_PATH = "/saga"

////////////////
// ## Targets
////////////////

/**
 * What a link points at, as `<epic-link>`'s attributes say it.
 * - none of `saga` / `epic`:  the page the link is in
 * - `saga` alone:  the saga page;  `epic` (with or without `saga`):  the epic page
 * - `item`:  any id on that page (`T3`, `o1`);  `phase`:  a phase by its number (`7`, `P7`) or its name
 *   (`epic-migrate`, `Epic Migrate`)
 */
export type LinkTarget = {
  /** the saga's id:  `drawable-spell` */
  saga?: string
  /** the epic's id:  `python-target` */
  epic?: string
  /** an id on the page, any case:  `T1` */
  item?: string
  /** a phase:  `7`, `P7`, `epic-migrate` */
  phase?: string
}

/** Where a link lands on its page, once the page has been read. */
export type Landing = {
  /** the element's id, as the page has it:  `t1`, `p7` */
  id: string
  /** its title, as text */
  title?: string
  /** a phase's number, its place among the page's phases (from 1) */
  number?: number
}

/** One phase of a page, in page order:  what `EpicAddress.findPhase()` looks through. */
export type PagePhase = { id: string; title: string }

/**
 * What the page server answers about a link (`GET /api/epics/target`, `linkRoutes.ts`):  read by `<epic-link>`.
 * - `href`:  the page and its `#id`, from the checkout's root (`epics/seo/seo.plan.html#j3`)
 * - `title`:  what it points at, for the link's tooltip:  the item's or phase's title, else the page's
 * - `label`:  the short form the link draws when it has no text (`seo J3`, `seo P7 · Epic Migrate`)
 * - `found`:  `false` when the page, or the id on it, isn't there:  a broken link
 */
export type TargetAnswer = {
  href: string
  title?: string
  label: string
  found: boolean
}

/** The page server's route `<epic-link>` asks (`linkRoutes.ts`):  `?saga=&epic=&item=&phase=`. */
export const TARGET_API = "/api/epics/target"

/**
 * Files every page that can hold a link loads, from the checkout's root:  a page's own URL minus one of these is the
 * root, where no server address says it (`file://`).
 * - the epics pack (`<ui-components source>`), and the docs bundle (`<script src>`)
 */
export const ROOT_ASSETS = ["packages/epics/pack/epics.pack.js", "packages/docs/tools/_assets/spell-ui.js"] as const

/** A page served from a worktree:  `/worktrees/<w>/...`, its checkout's root `/worktrees/<w>/`. */
export const WORKTREE_PREFIX = /^\/worktrees\/[^/]+/
