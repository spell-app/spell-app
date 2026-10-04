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
}

/** Top links, above the components:  Fomantic's bold "Getting Started" items. */
export const TOP_PAGES: readonly NavPage[] = [
  { id: "index", file: "index.html", text: "overview" },
  { id: "getting-started", file: "getting-started.html", text: "gettingStarted" },
  { id: "grammar", file: "grammar.html", text: "grammar" },
  { id: "components", file: "components/index.html", text: "allComponents" }
]

/** Foundation links, below the components. */
export const FOUNDATION_PAGES: readonly NavPage[] = [
  { id: "theming", file: "theming.html", text: "theming" },
  { id: "utilities", file: "utilities.html", text: "utilities" },
  { id: "icons", file: "icons.html", text: "icons" },
  { id: "kitchen-sink", file: "kitchen-sink.html", text: "kitchenSink" }
]

/** `current` when the page's own file name says nothing (`/ui/`):  the overview. */
export const INDEX_PAGE = "index"

/** Extension stripped from the page's file name to get `current`. */
export const PAGE_EXTENSION = ".html"

////////////////
// ## Index
////////////////

/** `view`:  every component A-Z, or grouped by topic. */
export type NavView = "az" | "topics"

/** `view` when neither the page nor the viewer chose one. */
export const DEFAULT_VIEW: NavView = "topics"

/** One component tag in the lists. */
export type NavRow = {
  /** e.g. `ui-or` */
  readonly tag: string
  /** display name, e.g. `Or` */
  readonly name: string
  /** docs page, relative to the site root:  `components/ui-button.html`, plus `#ui-or` for a sub-tag */
  readonly href: string
  /** its family's main tag, whose page IS the family page (the one that can be current) */
  readonly main: boolean
  /** topic ids it's filed under */
  readonly topics: readonly string[]
  /** its family's status, when not `done`:  shown as a badge */
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
 */
export const STORAGE_KEYS = {
  favorites: "spell-ui-site:favorites",
  view: "spell-ui-site:components-view",
  openTopics: "spell-ui-site:open-topics"
} as const

////////////////
// ## Element
////////////////

/** Icons of the view switch, the star and the topic toggles (the default `fa7-free` pack). */
export const ICONS = {
  az: "arrow down a z",
  topics: "layer group",
  star: "star",
  starOutline: "star outline",
  open: "angle down",
  closed: "angle right",
  search: "search"
} as const

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
  /** a topic toggle:  its topic id */
  topic: "data-nav-topic",
  /** a view switch button:  its `NavView` */
  view: "data-nav-view",
  /** the current page's item */
  current: "data-nav-current"
} as const

/** Event the inner `<ui-menu>` fires for every activated item:  stopped at the nav (it fires `ui-navigate`). */
export const MENU_SELECT_EVENT = "ui-select"

/** Key that focuses the search box, as on the old site (and GitHub, MDN ...). */
export const SEARCH_KEY = "/"

/**
 * Where `/` is a character, not a shortcut:  text-like inputs, text areas, selects.
 * - Checked against the event's REAL origin (`composedPath()[0]`), so a field inside a shadow root counts.
 */
export const TYPING_SELECTOR =
  "textarea, select, input:not([type=checkbox], [type=radio], [type=button], [type=submit], [type=reset], " +
  "[type=range], [type=color], [type=file], [type=image])"

/** Of the scroll container's height, how far down `revealCurrent()` puts the current item:  a third. */
export const REVEAL_FRACTION = 1 / 3

/** What `DocsNavHost` delegates to:  the controller's script API. */
export type DocsNavController = {
  focusSearch(): void
  revealCurrent(): void
  favoriteTags(): string[]
  readonly listed: Promise<void>
}
