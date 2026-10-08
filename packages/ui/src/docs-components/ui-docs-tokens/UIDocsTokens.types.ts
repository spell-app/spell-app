/**
 * The types and constants of the docs token tables family:  what the component (`UIDocsTokens`),
 * its row model (`TokenRows`) and the colour probe (`ColorProbe`) share.
 * - Pure data:  `import type` only, so node can load it (`yarn site:data`).
 *   A constant only one class reads sits below that class.
 */

import type { SiteToken } from "$/ui/docs-components/docs-components.types"
import type { docsTokensVocabulary } from "./UIDocsTokens.vocabulary.en"

////////////////
// ## Element
////////////////

/** `docsTokensVocabulary`'s type. */
export type DocsTokensVocabulary = typeof docsTokensVocabulary

/**
 * What a colour input shows when the probe can't read a colour (no canvas, an unresolvable value):
 * the element's colour inputs and `ColorProbe` both fall back to it.
 */
export const FALLBACK_HEX = "#000000"

////////////////
// ## Rows
////////////////

/** One table to show:  a family's, or one foundation group's. */
export type TokenTable = {
  /** group id (`palette` ...), or the family folder */
  id: string
  /** group title;  `undefined` for a family's one table */
  title?: string
  /** group description;  `` `x` `` is code */
  description?: string
  /** its rows, after the `tokens` attribute and the filter */
  rows: readonly SiteToken[]
}

/** What the element shows, once the data is in. */
export type TokenView =
  | {
      kind: "tables"
      /** the tables left after narrowing */
      tables: readonly TokenTable[]
      /** rows before the filter text:  how big the family is */
      total: number
    }
  | {
      kind: "message"
      /** the message, translated */
      text: string
      /** a problem (`negative`), not news (`info`) */
      isError: boolean
    }

/** The attributes `TokenRows.viewFor()` reads, plus the filter text. */
export type TokenViewParams = {
  /** a family folder (or any tag of it):  its one table */
  family?: string
  /** a tag:  its family's table */
  tag?: string
  /** the foundation's tables instead */
  isGlobal?: boolean
  /** `global`:  the group ids to show, space-separated */
  groups?: string
  /** names and `prefix*`es to keep, space-separated */
  tokens?: string
  /** the filter text */
  query?: string
}

/** The element's message texts, by key. */
export type TokenRowsText = (key: "missing" | "unknownFamily" | "noTokens", params?: Record<string, string>) => string

/** One word of `tokens`:  an exact name, or a prefix. */
export type TokenPattern = { name: string } | { prefix: string }
