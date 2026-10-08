/**
 * Types of the `ui-menu` family:  what its element class (`UIMenu`) and its native fallback (`MenuFallback`) share,
 * and what the menu reads from its items.
 * - Pure data, at the bottom of the folder's imports:  types only (the vocabulary), so node can load it
 *   (`yarn site:data`).
 * - Its roles, states and class words are module constants below `UIMenu`, the one class that uses them (epic
 *   `wwod-spell-ui`, Q18);  shared words are `UIT`'s (`UIT.ITEM`, `UIT.HORIZONTAL`).
 */

import type { menuVocabulary } from "./ui-menu.vocabulary.en"

////////////////
// ## Element
////////////////

/** Vocabulary type, for brevity. */
export type Vocabulary = typeof menuVocabulary

/** What the menu reads from an item's controller (`UIItem`, not imported:  another family). */
export type ItemController = {
  /** `type` (its vocabulary getter):  `item`, `header` or `divider`;  only `item`s join the roving set */
  readonly type?: string
  /** `value` (its vocabulary getter):  what `ui-select` reports for the item (default its text) */
  readonly value?: string
  /** the item's box that takes focus (its link or button), once rendered */
  focusTarget?: HTMLElement
}

/** What the menu writes on an item host it chooses (`UIItem`'s reflected `selected`). */
export type ChoosableItem = Element & {
  /** the item's `selected` property */
  selected?: boolean
}
