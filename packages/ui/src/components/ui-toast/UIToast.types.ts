/**
 * The constants and types the `ui-toast` family's files share:  `UIToast` and `ToastStack`.
 * - Pure data, at the bottom of the folder's imports:  `import type` only, so node can load it (`yarn site:data`).
 * - A constant only one class reads sits below that class (epic `wwod-spell-ui`, Q18).
 */

import type { toastVocabulary } from "./UIToast.vocabulary.en"

/** The vocabulary type, for brevity. */
export type Vocabulary = typeof toastVocabulary

////////////////
// ## Markup contract
////////////////

/** The `actions` word:  the actions box's class and part, and the slot of the buttons. */
export const ACTIONS = "actions"

/** The `attached` word:  an `actions` layout word, and its class. */
export const ATTACHED = "attached"

/** The `inverted` word:  an attribute, a class, a `class` word `UI.toast()` sorts. */
export const INVERTED = "inverted"

/** The `ui` word of Fomantic's grammar, which the toast's extra boxes (bar, containers) spell out themselves. */
export const UI_WORD = "ui"

/** Focus is inside:  the countdown pauses, a container isn't re-shown. */
export const FOCUS_WITHIN = ":focus-within"
