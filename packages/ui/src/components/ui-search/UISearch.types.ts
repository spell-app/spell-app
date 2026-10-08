/**
 * Constants and types of the `ui-search` family:  what its component (`UISearch`) and its native fallback
 * (`SearchFallback`) share.
 * - Pure data:  types only (`$/ui/core`, the vocabulary), so node can load it (`yarn site:data`).
 * - Its other class words and ids are module constants below `UISearch`, the one class that uses them;
 *   `SearchMatcher`'s props live with it.
 */

import type { UIT } from "$/ui/core"
import type { searchVocabulary } from "./UISearch.en"

////////////////
// ## Types
////////////////

/** The vocabulary's type, for short. */
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
 * The kind of a message the results show instead of results.
 * - Also its class word (`empty message`, `error message`, `UISearch.css`).
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
// ## Class words:  shared by the component and its fallback
////////////////

/** The class words of the box around the text field (`UIInput.css`). */
export const INPUT = "ui icon input"

/** The class word of the text `<input>` (`UISearch.css`):  Fomantic's `prompt`. */
export const PROMPT = "prompt"
