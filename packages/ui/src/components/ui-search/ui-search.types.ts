/**
 * Loose constants, types and helpers of `<ui-search>`:  its element classes and native fallback import them from here.
 */

import type { PartName, UIT } from "$/ui/core"
import { searchVocabulary } from "./ui-search.vocabulary.en"

////////////////
// ## SearchMatcher
////////////////

/** Constructor props for `SearchMatcher`, named as Fomantic's search settings. */
export type SearchMatcherOptions = {
  /** Fields tried, in order (Fomantic's `searchFields`);  default `title`, `description`. */
  fields?: readonly string[]
  /** Fomantic's `fullTextSearch`;  default `exact`. */
  match?: UIT.SearchMatch
  /** Fomantic's `ignoreSearchCase`;  default true. */
  ignoreCase?: boolean
  /** Fomantic's `ignoreDiacritics`;  default false. */
  ignoreDiacritics?: boolean
}

/** Fields searched by default. */
export const DEFAULT_FIELDS = ["title", "description"]

/** Characters to escape in a `RegExp` source. */
export const REGEXP_SPECIALS = /[$()*+./?[\\\]^{|}-]/g

/** Unicode combining diacritical marks. */
export const COMBINING_MARKS = /[̀-ͯ]/g

////////////////
// ## UISearch
////////////////

/** SearchVocabulary type, for brevity. */
export type SearchVocabulary = typeof searchVocabulary

/** The last remote answer:  for which query, and how it went. */
export type RemoteAnswer = {
  query: string
  groups: readonly UIT.SearchCategory[]
  status: "idle" | "done" | "error"
}

/** A message the results show instead of results. */
export type SearchMessage = {
  kind: "empty" | "error"
  header?: string
  text: string
}

/** `UI.ids` prefix. */
export const ID_PREFIX = "ui-search"

/** The input's icon:  FA's magnifying glass. */
export const SEARCH_ICON = "magnifying-glass"

/** Fields searched when `search-fields` is absent. */
export const DEFAULT_FIELDS_TEXT = "title description"
export const ABORT_ERROR = "AbortError"

/**
 * Class words of the markup contract (`ui-search.css`, `ui-input.css`) -- grammar, not attributes, so not in the
 * vocabulary.
 * - NOTE: `active` === the HIGHLIGHTED result (and its category):  Fomantic's meaning.
 */
export const INPUT = "ui icon input"
export const LOADING = "loading"
export const PROMPT = "prompt"
export const SEARCH_ICON_CLASS = "search icon"
export const RESULTS = "results"
export const RESULT = "result"
export const CATEGORY = "category"
export const NAME = "name"
export const PRICE = "price"
////////////////
// ## ui-search.fallback
////////////////

/** The parts of a `<ui-search>` the fallback touches;  all optional, the element may not have upgraded. */
export type SearchHost = HTMLElement & {
  value?: string | null
  source?: readonly UIT.SearchResult[]
}

/** Part names the fallback writes. */
export const PARTS = { prompt: "prompt", input: "input" } as const satisfies Record<
  string,
  PartName<typeof searchVocabulary>
>

/** `ui-change`;  typed, so a reordered vocabulary fails to compile. */
export const CHANGE_EVENT: "ui-change" = searchVocabulary.events[2].name
