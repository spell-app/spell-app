/**
 * Barrel for the modal -- also the `modal` lib entry (`@spell-app/ui/ui-modal`), measured in `docs/report.md`.
 * - SIDE EFFECTS:
 *   - defines the content parts and `<ui-button>` (through `$/ui/components/ui-parts` and `$/ui/components/ui-button`:
 *     `UI.modals.*` builds its dialogs from them) and `<ui-modal>`, which registers as the owner of the `header`,
 *     `content`, `description` and `actions` parts
 *   - registers `ModalDialogs` as `UI.modals`' provider once the runtime has loaded, so `UI.modals.confirm()` /
 *     `alert()` / `prompt()` work
 * - Also exports what `<ui-flyout>` (`$/ui/components/ui-flyout`) builds on:  `DialogElement`, the shared controller base,
 *   and `ModalFallback`, which `FlyoutFallback` extends.
 */

import { E, UI } from "$/ui/core"
import { DialogElement } from "./DialogElement"
import { UIModal } from "./UIModal"
import { ModalDialogs } from "./ModalDialogs"
import { ModalFallback } from "./ui-modal.fallback"

import "$/ui/components/ui-parts"
import "$/ui/components/ui-button"

UIModal.define()
if (E.isBrowser()) void UI.load().then(() => UI.modals.register(new ModalDialogs()))

export { DialogElement, UIModal, ModalDialogs, ModalFallback }
export type { DialogAttributes } from "./ui-modal.types"
