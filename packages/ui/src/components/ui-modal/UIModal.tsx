import { E } from "$/ui/core"
import { modalVocabulary } from "./UIModal.en"
import { DialogComponent } from "./DialogComponent"
import type { Vocabulary } from "./UIModal.types"

import modalCSS from "./UIModal.css?inline"

/****************
 * ### `UIModal`
 * The component behind `<ui-modal>`:
 * a modal dialog, a shadow `<dialog class="ui … modal" part="modal">` shown with `showModal()`.
 *
 * - The browser gives it the focus trap, the `inert` page, the top layer and the `::backdrop`:
 *   the dimmer, themed by the shared `--ui-dimmer-*` tokens.  No `<ui-dimmer>` element.
 * - All of its behaviour is `DialogComponent`'s,
 *   which `<ui-flyout>` shares (`visible` / `hidden`, `closedby`, approve / deny, the close icon, invoker commands, its name):
 *   this class only names and styles it.
 * - `UI.modals.confirm()` / `alert()` / `prompt()` draw one of these (`ModalDialogs`, registered by the barrel).
 ****************/
export class UIModal extends DialogComponent<Vocabulary> {
  @E.proto static vocabulary = modalVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { modal: modalCSS },
    // the sheet's own transition is Fomantic's `scale`:  faded in from 80%
    animation: "scale"
  } satisfies Partial<E.ElementSetup>
  @E.proto static rootPart = "modal"
  @E.proto static overlayKind = "modal" as const
  @E.proto static shownClass = "active"
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIModal extends E.AttributeValues<typeof modalVocabulary> {}
