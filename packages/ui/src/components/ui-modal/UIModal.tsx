import { E } from "$/ui/core"
import { modalVocabulary } from "./ui-modal.vocabulary.en"
import { DialogElement } from "./DialogElement"
import { ModalFallback } from "./ui-modal.fallback"
import type { Vocabulary } from "./ui-modal.types"

import modalCSS from "./ui-modal.css?inline"

/****************
 * ### `<ui-modal>`
 * A modal dialog:  a shadow `<dialog class="ui ... modal" part="modal">` shown with `showModal()` -- the browser's
 * focus trap, `inert` page, top layer and `::backdrop` (the dimmer, themed by the shared `--ui-dimmer-*` tokens).
 * No `ui-dimmer` element.
 * - All of its behaviour -- `open`, `closedby`, approve / deny, the close icon, invoker commands, naming -- is
 *   `DialogElement`'s, which `<ui-flyout>` shares;  this class only names and styles it.
 * - `UI.modals.confirm()` / `alert()` / `prompt()` render one of these (`ModalDialogs`, registered by the barrel).
 ****************/
export class UIModal extends DialogElement<Vocabulary> {
  @E.proto static vocabulary = modalVocabulary
  @E.proto static styleSheets = { modal: modalCSS }
  @E.proto static elementSetup = { Fallback: ModalFallback }
  @E.proto static rootPart = "modal"
  @E.proto static overlayKind = "modal" as const
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UIModal extends E.AttributeValues<typeof modalVocabulary> {}
