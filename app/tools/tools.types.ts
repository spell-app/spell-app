/**
 * Types and constants of the app's node tools (`tools/`):  the App UI docs set's data, what `yarn site:data` builds.
 * - Pure data, at the bottom of the folder's imports:  types only, apart from the constants below.
 * - The data file's own shape is Spell UI's (`SiteDataFile`, `spell-ui`'s docs components), so the set's pages
 *   draw it with Spell UI's docs elements (`<ui-docs-nav>`, `<ui-docs-api>`).
 */

import type { SiteDataBuilder } from "spell-ui/tools/SiteDataBuilder"

////////////////
// ## The data file
////////////////

/** `__data/components.json5`:  Spell UI's `SiteDataFile`, as its builder makes it. */
export type AppUIData = Awaited<ReturnType<SiteDataBuilder["build"]>>["data"]

/** One entry of the data file:  a web component's tag, or a Solid component. */
export type AppUITag = AppUIData["components"][number]

/** One family:  a page of the set, and the tags it documents. */
export type AppUIFamily = AppUIData["families"][string]

/** A Solid component's prop, as the data file holds it. */
export type AppUIProp = NonNullable<AppUITag["props"]>[number]

/** A place a Solid component is drawn, as the data file holds it. */
export type AppUIUse = NonNullable<AppUITag["usedIn"]>[number]

////////////////
// ## pages.json5
////////////////

/**
 * `__data/pages.json5`:  the set's hand-kept facts, which `yarn site:data` reads and never writes.
 * - Its `families` are Spell UI's page seeds too (`SitePagesFile`):  Spell UI's builder reads the two web
 *   components' entries from it.
 */
export type AppUIPagesFile = {
  /** what the file is, and who reads it */
  readonly $comment: string
  /** the side column's own links, around the component list:  the set's home above, any others below */
  readonly nav: NonNullable<AppUIData["nav"]>
  /** the side column's groups, in its order */
  readonly groups: readonly AppUIGroup[]
  /** one entry per page:  family id => its facts, in the side column's order within each group */
  readonly families: Readonly<Record<string, AppUIFamilySeed>>
}

/** One group of the side column:  a topic, in Spell UI's words. */
export type AppUIGroup = {
  /** id, as a family's `group` names it, e.g. `menus and dialogs` */
  readonly id: string
  /** what the side column shows, e.g. `Menus and dialogs` */
  readonly title: string
}

/**
 * One page of the set.
 * - A web component (`spell-app`) or a vocabulary's element (`spell-element`):  its id is its tag;  its tags come
 *   from its vocabulary, by Spell UI's builder.
 * - A Solid component file (`SplitPanel`):  its id names the page;  its tags are the file's exported components
 *   with a banner (`### `<Name>``), in file order.
 */
export type AppUIFamilySeed = {
  /** page title, e.g. `SplitPanel` */
  readonly title: string
  /** one-line tagline under the title */
  readonly summary: string
  /** how far along the page is;  anything but `done` gets a badge */
  readonly status: "planned" | "in-progress" | "done"
  /** its group's id */
  readonly group: string
  /** a Solid component file, from `packages/app/`, e.g. `src/solid/SplitPanel.tsx` */
  readonly file?: string
  /** the tag its page is about first;  default:  the tag named like the id, else the first */
  readonly mainTag?: string
}

////////////////
// ## Reading source
////////////////

/** An exported component of a source file with a banner:  what its page's API shows. */
export type SourceComponent = {
  /** e.g. `SplitPane` */
  readonly name: string
  /** the banner's first paragraph, on one line */
  readonly description: string
  /** its props, in declaration order;  `[]` for none (or a class) */
  readonly props: readonly AppUIProp[]
}

/** One JSX use of a capitalized tag:  `<SplitPane>` drawn by `SplitPanel`. */
export type SourceUse = {
  /** the tag drawn, e.g. `SplitPane` */
  readonly tag: string
  /** the top-level declaration it's drawn in, e.g. `SplitPanel`, `routes` */
  readonly by: string
}

/**
 * Finds the file a props type's import names, for `ComponentSource`:
 * the app file `specifier` stands for, imported into `from` (both from `packages/app/`);  else `undefined`.
 */
export type TypeSourceFinder = (from: string, specifier: string) => string | undefined

////////////////
// ## Paths
////////////////

/** The set's folder, from `packages/app/`:  its docs pages, served at `/components/app/`. */
export const APP_UI_FOLDER = "docs"

/** The data folder, in the set's folder. */
export const APP_UI_DATA = "__data"

/** The web components' code, from `packages/app/`:  `components/<tag>/`. */
export const APP_COMPONENTS = "components"
