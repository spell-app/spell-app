/**
 * The constants and types the `ui-modal` family's files share:
 * `DialogComponent` (so `<ui-modal>` and `<ui-flyout>`) and `ModalDialogs`.
 * - Pure data:  `import type` only, so node can load it (`yarn site:data`).
 * - A constant only one class reads sits below that class (epic `wwod-spell-ui`, Q18).
 */

import type { modalVocabulary } from "./UIModal.vocabulary.en"

////////////////
// ## The dialog vocabulary
////////////////

/** The modal's vocabulary type, for brevity. */
export type Vocabulary = typeof modalVocabulary

/**
 * The dialog attributes `DialogComponent` reads, whatever the vocabulary, as converted values.
 * - Every dialog vocabulary (modal, flyout) MUST name them;  each family's tests check it.
 */
export type DialogAttributes = {
  /** the close icon;  `false` (written) is also Fomantic's `closable: false` */
  closable?: boolean
  /** what dismisses it, as `<dialog closedby>` */
  closedby?: "any" | "closerequest" | "none"
  /** the `header` shorthand */
  header?: string
  /** the `content` shorthand */
  content?: string
}

/** The events every dialog vocabulary names. */
export type DialogEventName = "ui-open" | "ui-show" | "ui-close" | "ui-hide" | "ui-approve" | "ui-deny"

/** The attribute (and `<dialog>` attribute) saying what dismisses it. */
export const CLOSEDBY = "closedby"
