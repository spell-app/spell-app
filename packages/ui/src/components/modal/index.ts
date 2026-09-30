/**
 * Barrel for the modal -- also the `modal` lib entry (`@spell/ui/modal`), measured in `docs/report.md`.
 * - SIDE EFFECTS:
 *   - defines the content parts and `<ui-button>` (through `$/components/parts` and `$/components/button`:
 *     `UI.modals.*` builds its dialogs from them) and `<ui-modal>`, which registers as the owner of the `header`,
 *     `content`, `description` and `actions` parts
 *   - registers `ModalDialogs` as `UI.modals`' provider once the runtime has loaded, so `UI.modals.confirm()` /
 *     `alert()` / `prompt()` work
 * - Also exports what `<ui-flyout>` (`$/components/flyout`) builds on:  `DialogElement`, the shared controller base,
 *   and `ModalFallback`, which `FlyoutFallback` extends.
 */

import { isBrowser, UI } from "$/core"

import { DialogElement } from "./DialogElement"
import { UIModal } from "./UIModal"
import { ModalDialogs } from "./ModalDialogs"
import { ModalFallback } from "./modal.fallback"

import "$/components/parts"
import "$/components/button"

UIModal.define()
if (isBrowser()) void UI.load().then(() => UI.modals.register(new ModalDialogs()))

export { DialogElement, UIModal, ModalDialogs, ModalFallback }
export type { DialogAttributes } from "./DialogElement"
