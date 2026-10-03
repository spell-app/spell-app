/**
 * Loose constants, types and helpers of `<ui-popup>`:  its element classes and native fallback import them from here.
 */

import type { popupVocabulary } from "./ui-popup.vocabulary.en"
import type { UIT } from "$/ui/core"

////////////////
// ## UIPopup
////////////////

/** PopupVocabulary type, for brevity. */
export type PopupVocabulary = typeof popupVocabulary

/** An idref ARIA relation:  its attribute and its element-reflection property. */
export type AriaRelation = { attribute: string; property: string }

/** `showPopover()` options with `source` (not in every DOM lib yet). */
export type ShowPopoverOptions = { source?: HTMLElement }

/** Tooltips describe their target. */
export const DESCRIBED_BY: AriaRelation = { attribute: "aria-describedby", property: "ariaDescribedByElements" }

/** Click popups are controlled by their target. */
export const CONTROLS: AriaRelation = { attribute: "aria-controls", property: "ariaControlsElements" }

/**
 * `position` => `position-area`:  the popup on that side, its edge lined up with the target's (`span-*` grows
 * away from the named corner), or centred on it.
 */
export const POSITION_AREAS: Readonly<Record<string, string>> = {
  "top left": "top span-right",
  "top center": "top center",
  "top right": "top span-left",
  "bottom left": "bottom span-right",
  "bottom center": "bottom center",
  "bottom right": "bottom span-left",
  "left center": "left center",
  "right center": "right center",
  "left top": "left span-bottom",
  "left bottom": "left span-top",
  "right top": "right span-bottom",
  "right bottom": "right span-top"
}

/** Fomantic's default position. */
export const DEFAULT_POSITION = "top left"

/** Fomantic's default trigger. */
export const DEFAULT_TRIGGER: UIT.PopupTrigger = "hover"

/** `UI.ids` prefix. */
export const ID_PREFIX = "ui-popup"

/** Host roles. */
export const TOOLTIP = "tooltip"
export const DIALOG = "dialog"

/** Popover modes. */
export const HINT = "hint"

/** `Node.ELEMENT_NODE`, without the `Node` global (a server render has none). */
export const ELEMENT_NODE = 1

/** CSS properties and keywords set inline. */
export const ANCHOR_NAME = "anchor-name"
export const POSITION_ANCHOR = "position-anchor"
export const POSITION_AREA = "position-area"
export const CONTENTS = "contents"

/** ARIA attributes set on the target. */
export const ARIA_EXPANDED = "aria-expanded"
export const ARIA_HASPOPUP = "aria-haspopup"
export const CLOSED = "closed"
