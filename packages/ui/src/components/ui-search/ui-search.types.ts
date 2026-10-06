/**
 * Types of the `ui-search` family:  what its element class (`UISearch`) and its native fallback (`SearchFallback`)
 * share.
 * - Pure data, at the bottom of the folder's imports:  types only (`$/ui/core`, the vocabulary), so node can load it
 *   (`yarn site:data`).
 * - Its other class words and ids are module constants below `UISearch`, the one class that uses them (epic
 *   `wwod-spell-ui`, Q18);  `SearchMatcher`'s props live with it.
 */

import type { UIT } from "$/ui/core"
import type { searchVocabulary } from "./ui-search.vocabulary.en"

////////////////
// ## Element
////////////////

/** Vocabulary type, for brevity. */
export type Vocabulary = typeof searchVocabulary

/**
 * How the last remote query went:  a const object (the `UIT.Key` shape), compared as `RemoteStatus.error`.
 * - `idle` -- nothing asked yet
 * - `done` -- answered (maybe with no results)
 * - `error` -- the request failed
 */
export const RemoteStatus = { idle: "idle", done: "done", error: "error" } as const
/** One of `RemoteStatus`'s values, e.g. `"done"`. */
export type RemoteStatus = (typeof RemoteStatus)[keyof typeof RemoteStatus]

/** The last remote answer:  for which query, and how it went. */
export type RemoteAnswer = {
  /** the query it answers, trimmed */
  query: string
  /** its results, grouped (`SearchMatcher.groupsFor()`) */
  groups: readonly UIT.SearchCategory[]
  /** how it went */
  status: RemoteStatus
}

/**
 * Kind of a message the results show instead of results:  also its class word (`empty message`, `error message`,
 * `ui-search.css`).
 */
export const SearchMessageKind = { empty: "empty", error: "error" } as const
/** One of `SearchMessageKind`'s values, e.g. `"empty"`. */
export type SearchMessageKind = (typeof SearchMessageKind)[keyof typeof SearchMessageKind]

/** A message the results show instead of results. */
export type SearchMessage = {
  /** no results, or a failed request */
  kind: SearchMessageKind
  /** its header line, if any */
  header?: string
  /** its text, also what the live region says */
  text: string
}

////////////////
// ## Markup:  shared by the element and its fallback
////////////////

/** Class words of the box around the text field (`ui-input.css`). */
export const INPUT = "ui icon input"

/** Class word of the text `<input>` (`ui-search.css`):  Fomantic's `prompt`. */
export const PROMPT = "prompt"

////////////////
// ## Fallback
////////////////

/** The parts of a `<ui-search>` the fallback touches;  all optional, the element may not have upgraded. */
export type SearchHost = HTMLElement & {
  /** the text, once set as a property */
  value?: string
  /** the `source` property, once set */
  source?: readonly UIT.SearchResult[]
}
