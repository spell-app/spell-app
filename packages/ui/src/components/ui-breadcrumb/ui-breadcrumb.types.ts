/**
 * Loose constants and types of the `ui-breadcrumb` family:  the words, selectors and shapes its element
 * classes and its native fallback share, lifted out of their files.
 * - Data only:  nothing here runs;  the classes import what they need from `./ui-breadcrumb.types`.
 */

/** SVG namespace, for the data URL's root:  a standalone SVG image needs it. */
export const SVG_NS = "http://www.w3.org/2000/svg"

/** Attribute declaring it. */
export const XMLNS = "xmlns"

/** An `<svg>` start tag's name, and whether it declares `xmlns` already:  group 1 is the rest of the tag. */
export const SVG_START = /^\s*<svg\b([^>]*)>/

/** Line breaks, escaped in a CSS string. */
export const LINE_BREAK = /\r\n|\r|\n/g

/** `--_ui-breadcrumb-divider-layout` while an icon divider is set. */
export const ICON_LAYOUT = "icon"

/** Class of the section's own divider. */
export const DIVIDER = "divider"

/** `aria-current` of the active section. */
export const PAGE = "page"
