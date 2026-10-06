/**
 * Barrel for the toast -- also the `toast` lib entry (`@spell-app/ui/ui-toast`), measured in `docs/report.md`.
 * - SIDE EFFECTS:
 *   - defines `<ui-button>` / `<ui-buttons>` (through `$/ui/components/ui-button`:  `UI.toast()` builds its actions from
 *     them) and `<ui-toast>`
 *   - registers `ToastStack` as `UI.toasts`' provider once the runtime has loaded, so `UI.toast({...})` works
 */

import { E, UI } from "$/ui/core"
import { UIToast } from "./UIToast"
import { UIToastHost } from "./UIToastHost"
import { ToastStack } from "./ToastStack"

import "$/ui/components/ui-button"

UIToast.define()
if (E.isBrowser()) void UI.load().then(() => UI.toasts.register(new ToastStack()))

export { UIToast, UIToastHost, ToastStack }
