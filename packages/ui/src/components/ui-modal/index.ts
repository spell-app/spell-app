/**
 * The modal family:  defines `<ui-modal>` and exports its component, `UIModal`.
 * - SIDE EFFECTS:
 *   - defines `<ui-modal>`, the owner of the `header`, `content`, `description` and `actions` parts,
 *     and those parts and `<ui-button>` too (`UI.modals.*` builds its dialogs from them)
 *   - registers `ModalDialogs` as `UI.modals`' provider once the runtime has loaded,
 *     so `UI.modals.confirm()` / `alert()` / `prompt()` work
 * - Also exports `DialogComponent`, the base `<ui-flyout>` (`$/ui/components/ui-flyout`) builds on.
 * - Also the library's `@spell-app/ui/ui-modal` entry (its size is in `docs/report.md`).
 */

import { E, UI } from "$/ui/core"
import { DialogComponent } from "./DialogComponent"
import { UIModal } from "./UIModal"
import { ModalDialogs } from "./ModalDialogs"

import "$/ui/components/ui-parts"
import "$/ui/components/ui-button"

UIModal.define()
if (E.isBrowser()) void UI.load().then(() => UI.modals.register(new ModalDialogs()))

export { DialogComponent, UIModal, ModalDialogs }
export type { DialogAttributes } from "./UIModal.types"
