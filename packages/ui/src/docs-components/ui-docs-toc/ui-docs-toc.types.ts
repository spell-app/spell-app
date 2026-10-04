/**
 * Loose constants and types of the `ui-docs-toc` family:  what the element, its heading scan (`TocIndex`) and the
 * native fallback share.
 * - Data only:  nothing here runs.
 */

import type { docsTocVocabulary } from "./ui-docs-toc.vocabulary.en"

/** `docsTocVocabulary`'s type. */
export type DocsTocVocabulary = typeof docsTocVocabulary

////////////////
// ## Entries
////////////////

/** One link of the list:  a section (level 2 heading, top-level `<ui-section>`) or an entry under it. */
export type TocEntry = {
  /** id of its target, set by `TocIndex` when the target had none */
  readonly id: string
  /** link text */
  readonly text: string
  /** the heading, section or example it links to */
  readonly target: Element
  /**
   * entries under it, in page order:  a section's examples and level 3 headings (up to the next level 2 heading),
   * a `<ui-section>`'s nested sections, examples and headings;  `[]` for none
   */
  readonly entries: readonly TocEntry[]
}

/** A top-level entry:  a level 2 heading or a `<ui-section>` inside no other, with the entries under it. */
export type TocSection = TocEntry

/**
 * What becomes a SECTION:  a level 2 page header, or a `<ui-section>` inside no other (inside one:  an entry of
 * it, at any depth).
 * - Light DOM only:  headers a widget renders in its shadow root (`<ui-docs-api>`'s) can't be listed or linked to.
 */
export const SECTION_SELECTOR = 'ui-header[level="2"], h2, ui-section'

/**
 * What becomes an ENTRY under the current section:  an example with a header, or a level 3 page header.  Inside a
 * `<ui-section>`, under that section.
 */
export const ENTRY_SELECTOR = 'ui-docs-example[header], ui-header[level="3"], h3'

/** Both, for one ordered query. */
export const HEADING_SELECTOR = `${SECTION_SELECTOR}, ${ENTRY_SELECTOR}`

/** A tag whose shadow root a heading must not be inside:  an example's own header is its `header` attribute. */
export const EXAMPLE_TAG = "ui-docs-example"

/** A section that nests:  its title is its `header` attribute or its `slot="header"` child. */
export const SECTION_TAG = "ui-section"

/** A `<ui-section>`'s rich title, a direct child. */
export const SECTION_HEADER_SELECTOR = ':scope > [slot="header"]'

/** The tab set a `for` may name:  then the toc follows its shown pane. */
export const TABS_TAG = "ui-tabs"

/** Share of the viewport, below the scroll padding, a heading must pass to be the one in view. */
export const READING_LINE = 0.2

/** Default `size`. */
export const DEFAULT_SIZE = "small"
