/**
 * Constants and types of the `ui-docs-api` family:  what the element (`UIDocsApi`), its table model (`ApiModel`), the
 * inline code splitter (`InlineCode`) and the native fallback share.
 * - Pure data, at the bottom of the folder's imports:  `import type` only, so node can load it (`yarn site:data`).
 *   A constant only one class reads sits below that class (epic `wwod-spell-ui`, Q18).
 */

import type { HeadingBounds, SiteTag } from "$/ui/docs-components/docs-components.types"
import type { docsApiVocabulary } from "./ui-docs-api.vocabulary.en"

////////////////
// ## Element
////////////////

/** `docsApiVocabulary`'s type. */
export type DocsApiVocabulary = typeof docsApiVocabulary

/** A text key of `<ui-docs-api>` (`docsApiVocabulary.texts`). */
export type DocsApiTextKey = DocsApiVocabulary["texts"][number]["key"]

/**
 * `level`:  a heading level, leaving room for the table titles one level deeper;  unset, `3`, under the page's
 * `h2` "API" section.
 */
export const LEVELS: HeadingBounds = { min: 1, max: 5, fallback: 3 }

/** One tag to draw:  its entry, whether it gets its own header (`family`), and its tables. */
export type ApiItem = {
  /** its entry in the site's data */
  readonly tag: SiteTag
  /** drawn under its own header, as one tag of a `family` */
  readonly isGrouped: boolean
  /** its non-empty tables */
  readonly sections: readonly ApiSection[]
}

/** The message shown instead of tables:  `<ui-message state>` and its text. */
export type ApiMessage = {
  /** `<ui-message>`'s `state` */
  readonly state: "negative" | "warning"
  /** its text */
  readonly key: DocsApiTextKey
  /** the text's `{name}`s */
  readonly params?: Record<string, string>
}

////////////////
// ## Table model
////////////////

/**
 * The tables, in the order they show;  a tag's empty ones are left out.
 * - `properties`:  the `json` attributes (rich data), split out of `attributes` as the old Astro table did.
 */
export const ApiSectionIds = ["attributes", "properties", "events", "slots", "parts", "states", "texts"] as const

/** One of `ApiSectionIds`. */
export type ApiSectionId = (typeof ApiSectionIds)[number]

/** One table of a tag's API:  its columns' header texts and its rows. */
export type ApiSection = {
  /** which table, also its title's text key */
  readonly id: ApiSectionId
  /** the title's one-line note under it (inline code allowed), if it has one */
  readonly note?: DocsApiTextKey
  /** column header text keys, left to right */
  readonly columns: readonly DocsApiTextKey[]
  /** its rows, in the data's order */
  readonly rows: readonly ApiRow[]
}

/** One row:  a key unique in its table (the name), and one cell per column. */
export type ApiRow = {
  /** unique in its table:  the name */
  readonly key: string
  /** the first is always a `name` cell (the definition column) */
  readonly cells: readonly ApiCell[]
}

/**
 * One table cell.
 * - `name`:  the definition column:  `code` as code (`label` instead for the default slot), plus small notes under
 *   it (`alias`, `property` ...)
 * - `text`:  prose with `` `code` `` spans (`InlineCode`);  defaults and detail types are written as code spans
 * - `values`:  allowed values as compact labels (`ApiModel.labelsFor()`);  `isSwatch` paints each in its own hue;
 *   `isRange` is a numeric run shown as one `first … last` label;  `set` the shared value set they come from
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
      readonly isSwatch: boolean
      readonly isRange: boolean
    }

/** A note under a name:  a text key, then optional code, e.g. `alias` + `checked`. */
export type ApiNote = {
  /** the note's word, e.g. `alias` */
  readonly key: DocsApiTextKey
  /** code after it, e.g. `checked` */
  readonly code?: string
}

////////////////
// ## Inline code
////////////////

/** A piece of a description:  plain text, or a code span's content. */
export type InlinePiece = {
  /** the text, without its fence */
  readonly text: string
  /** a code span's content */
  readonly isCode: boolean
}
