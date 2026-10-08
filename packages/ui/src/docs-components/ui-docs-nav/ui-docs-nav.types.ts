/**
 * Loose constants and types of the `ui-docs-nav` family:  what the element, its index (`NavIndex`), its stored
 * preferences (`NavPreferences`), its host API (`DocsNavHost`) and the native fallback share.
 * - Data only:  nothing here runs.
 */

import type { SiteStatus } from "$/ui/docs-components/docs-components.types"

import type { docsNavVocabulary } from "./ui-docs-nav.vocabulary.en"

/** `docsNavVocabulary`'s type. */
export type DocsNavVocabulary = typeof docsNavVocabulary

/** A `docsNavVocabulary` text key. */
export type DocsNavText = DocsNavVocabulary["texts"][number]["key"]

////////////////
// ## Pages
////////////////

/** One hand-written page of the site:  a top link or a Foundation link. */
export type NavPage = {
  /** what `current` names it by:  its file name without `.html`, e.g. `getting-started` */
  readonly id: string
  /** its file, relative to the site root */
  readonly file: string
  /** the vocabulary text of its label */
  readonly text: DocsNavText
  /** its row's icon (the default `fa7-free` pack), as the brand's nav rows have */
  readonly icon: string
}

/** The "Get started" group's links, above the components. */
export const TOP_PAGES: readonly NavPage[] = [
  { id: "index", file: "index.html", text: "overview", icon: "house" },
  { id: "getting-started", file: "getting-started.html", text: "gettingStarted", icon: "rocket" },
  { id: "grammar", file: "grammar.html", text: "grammar", icon: "spell check" },
  { id: "components", file: "components/index.html", text: "allComponents", icon: "cubes" }
]

/** Foundation links, below the components. */
export const FOUNDATION_PAGES: readonly NavPage[] = [
  { id: "theming", file: "theming.html", text: "theming", icon: "palette" },
  { id: "utilities", file: "utilities.html", text: "utilities", icon: "screwdriver wrench" },
  { id: "icons", file: "icons.html", text: "icons", icon: "icons" },
  { id: "kitchen-sink", file: "kitchen-sink.html", text: "kitchenSink", icon: "sink" }
]

////////////////
// ## Groups
////////////////

/**
 * The panel's groups, top to bottom:  each a band that folds its links away.
 * - `start`:  the intro pages
 * - `favorites`:  the starred components
 * - `components`:  every component, A-Z or a band per topic
 * - `foundation`:  the Foundation pages
 */
export const NavGroups = ["start", "favorites", "components", "foundation"] as const
/** One of `NavGroups`, e.g. `"components"`. */
export type NavGroup = (typeof NavGroups)[number]

/** `current` when the page's own file name says nothing (`/ui/`):  the overview. */
export const INDEX_PAGE = "index"

/** Extension stripped from the page's file name to get `current`. */
export const PAGE_EXTENSION = ".html"

////////////////
// ## Index
////////////////

/** `view`'s values:  every component A-Z, or grouped by topic. */
export const NavViews = ["az", "topics"] as const
/** One of `NavViews`, e.g. `"topics"`. */
export type NavView = (typeof NavViews)[number]

/** `view` when neither the page nor the viewer chose one. */
export const DEFAULT_VIEW: NavView = "topics"

/** One component tag in the lists. */
export type NavRow = {
  /** e.g. `ui-or` */
  readonly tag: string
  /** display name, e.g. `Or` */
  readonly name: string
  /**
   * docs page, relative to the site root:  `components/<tag>.html` for a tag with its own page, else its family
   * page plus `#<tag>` (`components/ui-button.html#ui-or`)
   */
  readonly href: string
  /**
   * `href` is a page of its own (a family's main tag, or a sub-tag split onto its own page:  `ui-radio`):  the row
   * that can be current
   */
  readonly page: boolean
  /** topic ids it's filed under */
  readonly topics: readonly string[]
  /** its page's status (its own page's, else its family's), when not `done`:  shown as a badge */
  readonly status?: Exclude<SiteStatus, "done">
  /** search key (`NavIndex.key()`):  name, tag, topics (ids and titles), other names */
  readonly search: string
}

/** One topic and its tags, A-Z. */
export type NavTopic = {
  /** topic id, e.g. `date & time` */
  readonly id: string
  /** display title, e.g. `Date & time` */
  readonly title: string
  /** its tags' rows, A-Z */
  readonly rows: readonly NavRow[]
}

/** Joins the terms of a search key:  `NavIndex.normalize()` never leaves it in a query, so no match spans two. */
export const SEARCH_SEPARATOR = "|"

////////////////
// ## Preferences
////////////////

/**
 * `localStorage` keys, the SAME as the old Astro site's (`ComponentBrowser`), so a viewer keeps their favourites.
 * - `favorites`:  starred tags, a JSON list
 * - `view`:  `topics`, or absent for A-Z
 * - `openTopics`:  topic ids the viewer opened, a JSON list
 * - `closedGroups`:  `NavGroup`s the viewer folded away, a JSON list (new with the panel:  every group starts open)
 */
export const STORAGE_KEYS = {
  favorites: "spell-ui-site:favorites",
  view: "spell-ui-site:components-view",
  openTopics: "spell-ui-site:open-topics",
  closedGroups: "spell-ui-site:closed-groups"
} as const

////////////////
// ## Shadow markup:  class words the element and its fallback share
////////////////

/** Class word of a list of rows (`<ul>`). */
export const ROWS = "rows"

/** Class word of one row (`<li>`):  a link, and a component's star. */
export const ROW = "row"

/** Class word of a group's heading (`<h2>`;  a topic's `<h3>`). */
export const HEADING = "heading"

/** Class word of a heading band:  the element's fold button, the fallback's plain heading. */
export const BAND = "band"

////////////////
// ## Element
////////////////

/** Icons of the view switch, the star and the bands' chevron (the default `fa7-free` pack). */
export const ICONS = {
  az: "arrow down a z",
  topics: "layer group",
  star: "star",
  starOutline: "star outline",
  chevron: "chevron down"
} as const

/**
 * Media query under which folding animates:  a fold eases open / shut, its chevron turns.
 * - NOTE: the sheet says the same in its `@media`;  this copy decides whether a closing topic stays rendered until
 *   its fold has shut (`UIDocsNav.closing`).
 */
export const MOTION_QUERY = "(prefers-reduced-motion: no-preference)"

/**
 * `data-*` names the one click handler finds its targets by (in the shadow root).
 * - NOTE: the JSX writes them literally (`data-nav-star={...}`):  a spread to use these keys there would make every
 *   row's attributes one untracked-looking object.  Keep the two in step.
 */
export const DATA = {
  /** a page or component link item:  its tag or page id */
  link: "data-nav-link",
  /** a favourite star:  its tag */
  star: "data-nav-star",
  /** a topic band's toggle:  its topic id */
  topic: "data-nav-topic",
  /** a group band's toggle:  its `NavGroup` */
  group: "data-nav-group",
  /** a topic's fold (the box around its rows):  its topic id;  its `transitionend` ends `UIDocsNav.closing` */
  fold: "data-nav-fold",
  /** a view switch button:  its `NavView` */
  view: "data-nav-view",
  /** the current page's link */
  current: "data-nav-current"
} as const

/** Of the scroll container's height, how far down `revealCurrent()` puts the current item:  a third. */
export const REVEAL_FRACTION = 1 / 3

/** What `DocsNavHost` delegates to:  the controller's script API. */
export type DocsNavController = {
  /** focus the search field, opening the drawer the nav is in first */
  focusSearch(): void
  /** scroll the current page's item into view inside the panel */
  revealCurrent(): void
  /** the starred tags, A-Z */
  readonly favoriteTags: string[]
  /** resolves once the component list (or its error) has rendered */
  readonly listed: Promise<void>
}
