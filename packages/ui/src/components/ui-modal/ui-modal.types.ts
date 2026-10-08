/**
 * Constants and types of the `ui-modal` family:  what `DialogElement` (so `<ui-modal>` and `<ui-flyout>`),
 * `ModalDialogs` and the native fallbacks (`ModalFallback`, `FlyoutFallback`) share.
 * - Pure data, at the bottom of the folder's imports:  `import type` only, plus `UIT`, so node can load it
 *   (`yarn site:data`).  A constant only one class reads sits below that class (epic `wwod-spell-ui`, Q18).
 */

import * as UIT from "$/ui/components/components.types"
import type { E } from "$/ui/core"
import type { modalVocabulary } from "./ui-modal.vocabulary.en"

////////////////
// ## The dialog vocabulary
////////////////

/** The modal's vocabulary type, for brevity. */
export type Vocabulary = typeof modalVocabulary

/**
 * The dialog attributes `DialogElement` and `ModalFallback` read, whatever the vocabulary, as converted values.
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

/** Name of an attribute in `DialogAttributes`, or the controlled `open`. */
export type DialogAttributeName = keyof DialogAttributes | typeof OPEN

/** Events every dialog vocabulary names. */
export type DialogEventName = "ui-open" | "ui-show" | "ui-close" | "ui-hide" | "ui-approve" | "ui-deny"

/** The controlled attribute:  shown. */
export const OPEN = "open"

/** Attribute of the close icon (and of Fomantic's `closable: false`). */
export const CLOSABLE = "closable"

/** Attribute (and `<dialog>` attribute) saying what dismisses it. */
export const CLOSEDBY = "closedby"

/** Attribute naming the dialog by its header's id. */
export const ARIA_LABELLEDBY = "aria-labelledby"

////////////////
// ## Events
////////////////

/** An approve element was activated:  `ModalDialogs` answers yes;  the fallback fires it. */
export const APPROVE_EVENT: E.EventName<Vocabulary> = "ui-approve"

/** A deny element was activated:  the fallback fires it. */
export const DENY_EVENT: E.EventName<Vocabulary> = "ui-deny"

/** Hidden:  `ModalDialogs` settles on it;  the fallback fires it. */
export const HIDE_EVENT: E.EventName<Vocabulary> = "ui-hide"

////////////////
// ## Actions
////////////////

/** What an activated element inside a dialog does:  `approve` or `deny` it (`UIT.ModalActionSelectors`). */
export type DialogAction = keyof typeof UIT.ModalActionSelectors

/**
 * ### `DialogActions`
 * Which approve / deny element a click activated:  shared by `DialogElement` and `ModalFallback`, which react
 * differently (a vetoable close, or a plain `<dialog>` close).
 * - Static, and plain DOM:  it reads only the event and the host it's given.
 */
export class DialogActions {
  /**
   * The approve / deny element `event` activated:  the innermost light-DOM element (in `host`'s tree) on its path
   * matching `UIT.ModalActionSelectors`, up to `host`;  `undefined` for none.
   */
  static actionFor(event: Event, host: Element): [DialogAction, Element] | undefined {
    const scope = host.getRootNode()
    for (const target of event.composedPath()) {
      if (target === host) return undefined
      if (!(target instanceof Element) || target.getRootNode() !== scope) continue
      if (target.matches(UIT.ModalActionSelectors.approve)) return ["approve", target]
      if (target.matches(UIT.ModalActionSelectors.deny)) return ["deny", target]
    }
    return undefined
  }
}
