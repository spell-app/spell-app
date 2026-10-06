/**
 * Loose constants of the `ui-accordion` family:  the words its element class and its native fallback share.
 * - Pure data, at the bottom of the folder's imports:  imports nothing, so node can load it (`yarn site:data`).
 * - A word only ONE class uses sits below that class instead (epic `wwod-spell-ui`, Q18).
 */

////////////////
// ## Panels
////////////////

/**
 * The shared `name` of an exclusive accordion's `<details>`, so the browser closes the others.
 * - Scoped to the accordion's own shadow root, so one constant serves every accordion;  a server render, with no
 *   shadow root, makes it page-unique (`UIAccordion.group`).
 */
export const DETAILS_GROUP = "panels"

////////////////
// ## Class words (Fomantic's grammar)
////////////////

/** An open panel's `<summary>`. */
export const ACTIVE_TITLE = "active title"

/** An open panel's content box. */
export const ACTIVE_CONTENT = "active content"

/** The arrow in a title. */
export const DROPDOWN_ICON = "dropdown icon"

////////////////
// ## Parts
////////////////

/** Part of a panel's `<summary>`;  also the prefix of its slot's name in a server render. */
export const TITLE_PART = "title"

/** Part of a panel's content box;  also the prefix of its slot's name in a server render. */
export const CONTENT_PART = "content"
