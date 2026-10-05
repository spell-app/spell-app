/**
 * Loose constants and types of the `ui-accordion` family:  the words, selectors and shapes its element
 * classes and its native fallback share, lifted out of their files.
 * - Data only:  nothing here runs;  the classes import what they need from `./ui-accordion.types`.
 */

/** Between the indexes of `open`. */
export const LIST_SEPARATOR = /[\s,]+/

/** One index. */
export const INDEX = /^\d+$/

/** Noun a title child is defined with (`ui-parts.vocabulary.en.ts`:  another family, not imported). */
export const TITLE_NOUN = "title"

/** The shared `name` of an exclusive accordion's `<details>`:  scoped to this shadow root, so a constant. */
export const GROUP = "panels"

/** Class words (Fomantic's grammar). */
export const TITLE = "title"
export const ACTIVE_TITLE = "active title"

export const ACTIVE_CONTENT = "active content"
export const DROPDOWN_ICON = "dropdown icon"

/** Leading `ui` of the class string, dropped when nested. */
export const UI_WORD = /^ui /

/** The title elements, for arrow-key moves. */
export const SUMMARY = "summary"
export const TITLE_SELECTOR = ":scope > details > summary"

/** What counts as a control inside a title. */
export const CONTROLS = "a[href], button, input, select, textarea, label, [contenteditable], [tabindex]"

export const ARROW_UP = "ArrowUp"
export const HOME = "Home"
export const END = "End"

/** Slot assignment by name, in a server render (`UIAccordion.panelSlot()`). */
export const SLOT_ATTRIBUTE = "slot"

/** Canonical tag of a title child (`parts`:  another family, not imported). */
export const TITLE_TAG = "ui-title"

/** Canonical tag of the content child a `source` accordion makes when its title has none (`parts`, not imported). */
export const CONTENT_TAG = "ui-content"

/** Index of the panel a `source` body fills:  the first. */
export const SOURCE_PANEL = 0

/** Class words of the line saying a `source` body failed (`part="error"`, in the panel's content box). */
export const SOURCE_ERROR = "source error"

/** Behaviour attribute read here, not in `classes()`. */
export const EXCLUSIVE = "exclusive"

export const PANEL_PART = "panel"
export const TITLE_PART = "title"
export const ICON_PART = "icon"
export const CONTENT_PART = "content"
