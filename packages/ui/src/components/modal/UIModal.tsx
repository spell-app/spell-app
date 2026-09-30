import { proto } from "$/core"

import { modalVocabulary } from "./modal.vocabulary.en"
import { DialogElement } from "./DialogElement"
import { ModalFallback } from "./modal.fallback"

import modalCSS from "./modal.css?inline"

/****************
 * ### `<ui-modal>`
 * A modal dialog:  a shadow `<dialog class="ui ... modal" part="modal">` shown with `showModal()` -- the browser's
 * focus trap, `inert` page, top layer and `::backdrop` (the dimmer, themed by the shared `--ui-dimmer-*` tokens).
 * No `ui-dimmer` element.
 * - All of its behaviour -- `open`, `closedby`, approve / deny, the close icon, invoker commands, naming -- is
 *   `DialogElement`'s, which `<ui-flyout>` shares;  this class only names and styles it.
 * - `UI.modals.confirm()` / `alert()` / `prompt()` render one of these (`ModalDialogs`, registered by the barrel).
 ****************/
export class UIModal extends DialogElement<typeof modalVocabulary> {
  @proto static vocabulary = modalVocabulary
  @proto static styles = { modal: modalCSS }
  @proto static Fallback = ModalFallback
  @proto static rootPart = "modal"
  @proto static overlayKind = "modal" as const
}
