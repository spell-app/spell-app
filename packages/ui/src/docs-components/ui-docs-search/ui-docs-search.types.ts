/**
 * Loose constants and types of the `ui-docs-search` family:  what the element, its index (`SearchIndex`), the page
 * reader (`PageOutline`), the search file's loader (`SearchData`), its host API (`DocsSearchHost`) and the native
 * fallback share.
 * - Data only:  nothing here runs.
 */

import type { docsSearchVocabulary } from "./ui-docs-search.vocabulary.en"

/** `docsSearchVocabulary`'s type. */
export type DocsSearchVocabulary = typeof docsSearchVocabulary

/** A `docsSearchVocabulary` text key. */
export type DocsSearchText = DocsSearchVocabulary["texts"][number]["key"]

////////////////
// ## Entries
////////////////

/**
 * What a result is, which is also its group:
 * - `here`:  a section of the page shown, read live from its DOM
 * - `component`:  a `<ui-*>` tag (its family's page, or its heading there)
 * - `page`:  a hand-written page (Overview, Theming ...)
 * - `section`:  a section of ANOTHER page, from the search file
 * - `attribute`:  a tag's attribute (its tag's API tables)
 */
export type SearchKind = "here" | "component" | "page" | "section" | "attribute"

/** The groups' order when their best results tie. */
export const KIND_ORDER: readonly SearchKind[] = ["here", "component", "page", "section", "attribute"]

/**
 * Weight of each kind's score:  the page shown first, then what a reader most likely means;  an attribute never
 * outranks a section of the same name (dozens of tags share `vertical`, `size` ...).
 */
export const KIND_WEIGHT: Readonly<Record<SearchKind, number>> = {
  here: 1.25,
  component: 1,
  page: 1,
  section: 0.9,
  attribute: 0.8
}

/** The vocabulary text of each group's label. */
export const KIND_TEXT: Readonly<Record<SearchKind, DocsSearchText>> = {
  here: "onThisPage",
  component: "components",
  page: "pages",
  section: "sections",
  attribute: "attributes"
}

/** Each kind's icon (the default `fa7-free` pack). */
export const KIND_ICON: Readonly<Record<SearchKind, string>> = {
  here: "hashtag",
  component: "cube",
  page: "file lines",
  section: "hashtag",
  attribute: "sliders"
}

/** Most results a group shows:  the best ones. */
export const GROUP_LIMIT: Readonly<Record<SearchKind, number>> = {
  here: 6,
  component: 5,
  page: 4,
  section: 5,
  attribute: 5
}

/** One thing a search can find:  a link, what it shows, what it's found by. */
export type SearchEntry = {
  readonly kind: SearchKind
  /** shown, matched first and highlighted, e.g. `Vertical Divider`, `Or`, `circular` */
  readonly title: string
  /** shown under the title:  where it is, e.g. `Examples › Types`, `Divider › Usage` */
  readonly context?: string
  /** shown beside the title in mono:  a tag, e.g. `<ui-or>` */
  readonly code?: string
  /** relative to the site root (`components/ui-button.html#ui-or`), or `#id` for the page shown */
  readonly href: string
  /** other words it's found by, matched but never shown:  its tag, other names, topics, the page it's on ... */
  readonly terms: readonly string[]
  /** added to its score:  a main tag over a sub-tag, the page shown's own attributes */
  readonly boost?: number
}

/** A matched entry:  its score and where its title matched. */
export type SearchHit = {
  readonly entry: SearchEntry
  readonly score: number
  /** `[start, end)` ranges of the title to highlight, sorted, never overlapping */
  readonly marks: readonly (readonly [number, number])[]
}

/** One group of hits, best first. */
export type SearchGroup = {
  readonly kind: SearchKind
  readonly hits: readonly SearchHit[]
}

////////////////
// ## Scores
////////////////

/**
 * Score of each way a query can match, before `KIND_WEIGHT` and the tie-breaks:  the whole query against the title,
 * then against a term, then every word of the query found somewhere.
 */
export const SCORES = {
  titleExact: 1000,
  titleStart: 800,
  titleWord: 600,
  titleInside: 400,
  termExact: 700,
  termStart: 500,
  termWord: 350,
  termInside: 200,
  words: 300,
  /** per word of the query found in the title, on top of `words` */
  wordInTitle: 100
} as const

/** A query shorter than this matches only at word starts:  `or` mustn't find every `color`. */
export const INSIDE_MIN = 3

/** Separator of a result's context:  `Divider › Examples › Types`. */
export const TRAIL = " › "

////////////////
// ## Element
////////////////

/** The search box's icon (the default `fa7-free` pack). */
export const SEARCH_ICON = "magnifying glass"

/** The clear button's icon. */
export const CLEAR_ICON = "xmark"

/** Keys that focus the field from anywhere:  `/` (unless typing), and `K` with Cmd (Apple) or Ctrl. */
export const SHORTCUT_KEYS = { slash: "/", palette: "k" } as const

/**
 * Where `/` is a character, not a shortcut:  text-like inputs, text areas, selects.
 * - Checked against the event's REAL origin (`composedPath()[0]`), so a field inside a shadow root counts.
 */
export const TYPING_SELECTOR =
  "textarea, select, input:not([type=checkbox], [type=radio], [type=button], [type=submit], [type=reset], " +
  "[type=range], [type=color], [type=file], [type=image])"

/**
 * What the field reads "On this page" from when `page` isn't set:  the site's page `main`, else any `main`.
 * - A page's sections:  `PageOutline.SECTIONS`.
 */
export const DEFAULT_PAGE = "main#main, main"

/** What a hidden field opens to show itself (`summon()`):  the drawer it's in. */
export const DRAWERS = "ui-flyout, ui-sidebar"

/** Frames `summon()` waits at most for an opening drawer to show the field. */
export const SUMMON_FRAMES = 30

/** What `DocsSearchHost` delegates to:  the controller's script API. */
export type DocsSearchController = {
  summon(): Promise<void>
  readonly query: string
}
