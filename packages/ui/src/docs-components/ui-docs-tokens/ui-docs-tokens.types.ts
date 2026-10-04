/**
 * Loose constants and types of the `ui-docs-tokens` family:  what the element, its row model (`TokenRows`), the colour
 * probe (`ColorProbe`) and the native fallback share.
 * - Data only:  nothing here runs.
 */

import type { SiteToken } from "$/ui/docs-components/docs-components.types"
import type { docsTokensVocabulary } from "./ui-docs-tokens.vocabulary.en"

/** `docsTokensVocabulary`'s type. */
export type DocsTokensVocabulary = typeof docsTokensVocabulary

/** A text key of the vocabulary, e.g. `noTokens`. */
export type DocsTokensTextKey = DocsTokensVocabulary["texts"][number]["key"]

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
  | { kind: "tables"; tables: readonly TokenTable[]; total: number }
  | { kind: "message"; text: string; error: boolean }

/** The attributes `TokenRows.view()` reads, plus the filter text. */
export type TokenRowsOptions = {
  family?: string
  tag?: string
  global?: boolean
  groups?: string
  tokens?: string
  query?: string
}

/** The element's message texts, by key. */
export type TokenRowsText = (key: "missing" | "unknownFamily" | "noTokens", params?: Record<string, string>) => string

/** One word of `tokens`:  an exact name, or a prefix. */
export type TokenPattern = { name: string } | { prefix: string }

////////////////
// ## Constants
////////////////

/** `level` bounds:  a heading level. */
export const MIN_LEVEL = 1
export const MAX_LEVEL = 6

/** `level` when unset:  group headers sit under the page's `h2` sections. */
export const DEFAULT_LEVEL = 3

/** `target` that writes on `:root` instead of the preview. */
export const PAGE_TARGET = "page"

/** The filter shows for `global`, and for a family with at least this many rows. */
export const SEARCH_MIN_ROWS = 16

/** Icon of the filter input. */
export const SEARCH_ICON = "search"

/** Icon of the reset button. */
export const RESET_ICON = "undo"

/** A trailing `*` in the `tokens` attribute:  a prefix. */
export const PREFIX_MARK = "*"

/** Native input type of a colour token's `<ui-input>`. */
export const COLOR_INPUT = "color"

/** What a colour input shows when the probe can't read a colour (no canvas, an unresolvable value). */
export const FALLBACK_HEX = "#000000"

/** What `ColorProbe` paints a translucent colour over:  the page background, where the token is used. */
export const BACKDROP = "var(--ui-background, white)"

/** `ColorProbe`'s key for the backdrop's own probe;  never a token name. */
export const BACKDROP_KEY = " backdrop"

/** A backticked span in a description, shown as `<code>`. */
export const CODE_SPAN = /`([^`]+)`/g
