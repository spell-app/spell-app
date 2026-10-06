/**
 * Constants and types of the `ui-toast` family:  what its element (`UIToast`), host, `ToastStack` and native fallback
 * share.
 * - Pure data, at the bottom of the folder's imports:  `import type` only, so node can load it (`yarn site:data`).
 *   A constant only one class reads sits below that class (epic `wwod-spell-ui`, Q18).
 */

import type { E } from "$/ui/core"
import type { toastVocabulary } from "./ui-toast.vocabulary.en"

////////////////
// ## Element
////////////////

/** Vocabulary type, for brevity. */
export type Vocabulary = typeof toastVocabulary

/** What the host asks of its controller (`UIToast`). */
export type ToastController = {
  /** close now, reason `dismiss` (the cancelable `ui-close` first);  true when it closes */
  close(): boolean
}

/** Event that ends a toast:  `ToastStack` removes its toasts on it;  the fallback fires it. */
export const HIDE_EVENT: E.EventName<Vocabulary> = "ui-hide"

/** `type` value announced as an alert (`role=alert`), not a status. */
export const ERROR = "error"

////////////////
// ## Markup contract
////////////////

/** Class word of the box around the toast:  it floats (`ui-toast.css`). */
export const FLOATING = "floating"

/** Class word of the box around the toast, its progress bar and attached actions. */
export const TOAST_BOX = "toast-box"

/** Class word of a fixed-width toast (`compact`, on by default). */
export const COMPACT = "compact"

/** Class word of a box a click doesn't close. */
export const UNCLICKABLE = "unclickable"

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
