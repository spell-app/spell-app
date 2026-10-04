/**
 * Loose constants and types of the `ui-docs-api` family:  what the element, its table model (`ApiModel`), the inline
 * code splitter (`InlineCode`) and the native fallback share.
 * - Data only:  nothing here runs.
 */

import type { SiteTag } from "$/ui/docs-components/docs-components.types"

import type { docsApiVocabulary } from "./ui-docs-api.vocabulary.en"

/** `docsApiVocabulary`'s type. */
export type DocsApiVocabulary = typeof docsApiVocabulary

/** A text key of `<ui-docs-api>` (`docsApiVocabulary.texts`). */
export type DocsApiTextKey = DocsApiVocabulary["texts"][number]["key"]

////////////////
// ## Element
////////////////

/** `level` bounds:  a heading level, leaving room for the section titles one level deeper. */
export const MIN_LEVEL = 1
export const MAX_LEVEL = 5

/** `level` when unset:  under the page's `h2` "API" section. */
export const DEFAULT_LEVEL = 3

/** One tag to draw:  its entry, whether it gets its own header (`family`), and its tables. */
export type ApiItem = {
  readonly tag: SiteTag
  readonly grouped: boolean
  readonly sections: readonly ApiSection[]
}

/** The message shown instead of tables:  `<ui-message state>` and its text. */
export type ApiMessage = {
  readonly state: "negative" | "warning"
  readonly key: DocsApiTextKey
  readonly params?: Record<string, string>
}

////////////////
// ## Table model
////////////////

/**
 * The tables, in the order they show;  a tag's empty ones are left out.
 * - `properties`:  the `json` attributes (rich data), split out of `attributes` as the old Astro table did.
 */
export const API_SECTIONS = ["attributes", "properties", "events", "slots", "parts", "states", "texts"] as const

/** One of `API_SECTIONS`. */
export type ApiSectionId = (typeof API_SECTIONS)[number]

/** One table of a tag's API:  its columns' header texts and its rows. */
export type ApiSection = {
  /** which table, also its title's text key */
  readonly id: ApiSectionId
  /** the title's one-line note under it (inline code allowed), if it has one */
  readonly note?: DocsApiTextKey
  /** column header text keys, left to right */
  readonly columns: readonly DocsApiTextKey[]
  readonly rows: readonly ApiRow[]
}

/** One row:  a key unique in its table (the name), and one cell per column. */
export type ApiRow = {
  readonly key: string
  /** the first is always a `name` cell (the definition column) */
  readonly cells: readonly ApiCell[]
}

/**
 * One table cell.
 * - `name`:  the definition column:  `code` as code (`label` instead for the default slot), plus small notes under
 *   it (`alias`, `property` ...)
 * - `text`:  prose with `` `code` `` spans (`InlineCode`);  defaults and detail types are written as code spans
 * - `values`:  allowed values as compact labels;  `swatch` paints each in its own hue;  `range` is a numeric run
 *   shown as one `first … last` label;  `set` the shared value set they come from
 */
export type ApiCell =
  | {
      readonly type: "name"
      readonly code?: string
      readonly label?: DocsApiTextKey
      readonly notes: readonly ApiNote[]
    }
  | { readonly type: "text"; readonly text: string }
  | {
      readonly type: "values"
      readonly values: readonly string[]
      readonly set?: string
      readonly swatch: boolean
      readonly range: boolean
    }

/** A note under a name:  a text key, then optional code, e.g. `alias` + `checked`. */
export type ApiNote = {
  readonly key: DocsApiTextKey
  readonly code?: string
}

/**
 * How each `AttributeKind` reads to an author, in the Kind column.
 * - NOTE: English only, like every description in `components.json`:  the site's data isn't translated.
 */
export const KIND_LABELS: Readonly<Record<string, string>> = {
  keyOnly: "boolean",
  boolean: "boolean",
  valueAndKey: "value",
  keyOrValueAndKey: "boolean or value",
  valueOnly: "value",
  enum: "enum",
  width: "width",
  multiple: "list",
  textAlign: "alignment",
  verticalAlign: "alignment",
  size: "size",
  color: "colour",
  icon: "icon name",
  string: "text",
  number: "number",
  json: "property"
}

/** Kinds whose absent default is `false`. */
export const BOOLEAN_KINDS: ReadonlySet<string> = new Set(["keyOnly", "boolean"])

/** The value set whose values are colour names:  each label is painted in its hue. */
export const HUES_SET = "hues"

/** Fewest values a numeric run needs before it collapses to one `first … last` label. */
export const MIN_RANGE = 4

/** Between a range's ends. */
export const RANGE_SEPARATOR = " … "

////////////////
// ## Inline code
////////////////

/** A piece of a description:  plain text, or a code span's content. */
export type InlinePiece = {
  readonly text: string
  readonly code: boolean
}

/** A run of backticks (a code span's fence). */
export const BACKTICKS = /`+/g
