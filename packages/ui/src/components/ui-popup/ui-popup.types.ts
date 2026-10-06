/**
 * Types of the `ui-popup` family:  what its element class (`UIPopup`) and its native fallback (`PopupFallback`)
 * share.
 * - Pure data, at the bottom of the folder's imports:  types only (the vocabulary), so node can load it
 *   (`yarn site:data`).
 * - Its roles, ids, inline properties and ARIA relations are module constants below `UIPopup`, the one class that
 *   uses them (epic `wwod-spell-ui`, Q18).
 */

import type { popupVocabulary } from "./ui-popup.vocabulary.en"

////////////////
// ## Element
////////////////

/** Vocabulary type, for brevity. */
export type Vocabulary = typeof popupVocabulary

/** An idref ARIA relation:  its attribute and its element-reflection property. */
export type AriaRelation = {
  /** the idref attribute, e.g. `aria-describedby` */
  attribute: string
  /** its element-reflection property, e.g. `ariaDescribedByElements` (an idref can't cross a shadow boundary) */
  property: string
}

/** `showPopover()` options with `source` (not in every DOM lib yet). */
export type ShowPopoverOptions = {
  /** the invoker:  the implicit anchor, and where Tab continues from */
  source?: HTMLElement
}

/**
 * A `popover` value the element sets on its host (or, in a server render, its root):
 * - `auto` -- light dismiss;  only a server render's click popup
 * - `manual` -- the page (or the element) decides;  click and manual popups
 * - `hint` -- hover / focus popups where the browser has it (`UI.browser.supports.popoverHint`)
 */
export type PopoverMode = "auto" | "manual" | "hint"

////////////////
// ## Markup:  shared by the element and its fallback
////////////////

/** Fomantic's default position:  the popup's class words after its noun, `ui popup top left`. */
export const DEFAULT_POSITION = "top left"
