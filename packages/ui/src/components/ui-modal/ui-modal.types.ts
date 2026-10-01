/**
 * Shared constants, types and helpers of the `ui-modal` family:  what its element classes, vocabularies and native fallback share.
 * - Runtime-light:  no element code, so every file of the family may import it.
 */

import type { ComponentVocabulary, AttributeValues, CamelCase, AttributeName, EventName } from "$/ui/core"
import type { modalVocabulary } from "./ui-modal.vocabulary.en"

/** The dialog attributes `DialogElement` reads, as converted values. */
export type DialogAttributes = {
  closable?: boolean
  closedby?: "any" | "closerequest" | "none"
  header?: string
  content?: string
}

/** Events every dialog vocabulary names. */
export type DialogEventName = "ui-open" | "ui-show" | "ui-close" | "ui-hide" | "ui-approve" | "ui-deny"

/** The converted type of `V`'s `open`. */
export type OpenValue<V extends ComponentVocabulary> = AttributeValues<V>[CamelCase<AttributeName<V>> &
  keyof AttributeValues<V>]

/** The controlled attribute. */
export const OPEN = "open"

/** `closedby` values the element reads. */
export const ANY = "any"

/** Close reasons it names itself. */
export const ESCAPE = "escape"
export const OUTSIDE = "outside"
export const APPROVE = "approve"
export const DENY = "deny"

/** Attributes set on the dialog. */
export const ARIA_LABELLEDBY = "aria-labelledby"
export const CLOSEDBY = "closedby"
export const CLOSABLE = "closable"

/** `<ui-modal>` attributes it sets (canonical names). */
export const SIZE = "size"
export const TINY = "tiny"
export const CLOSEREQUEST = "closerequest"
export const ACTIONS = "actions"

/** `<ui-button>` attribute of the approve button. */
export const PRIMARY = "primary"
export const CANCEL = "cancel"
export const OK = "ok"

/** Events it waits for. */
export const APPROVE_EVENT = "ui-approve"
export const HIDE_EVENT = "ui-hide"

/** `native.css`'s opt-in class, for the prompt's input. */
export const NATIVE_LOOK = "ui-native"

/** The prompt's label:  message above a full-width input. */
export const LABEL_LAYOUT = "display: grid; gap: 0.5em"

/** Events the fallback still fires, checked against the vocabulary. */
export const APPROVE_EVENT_NAME: EventName<typeof modalVocabulary> = "ui-approve"
export const DENY_EVENT_NAME: EventName<typeof modalVocabulary> = "ui-deny"
export const HIDE_EVENT_NAME: EventName<typeof modalVocabulary> = "ui-hide"
