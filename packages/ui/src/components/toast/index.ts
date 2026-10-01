/**
 * Barrel for the toast -- also the `toast` lib entry (`@spell-app/ui/toast`), measured in `docs/report.md`.
 * - SIDE EFFECTS:
 *   - defines `<ui-button>` / `<ui-buttons>` (through `$/ui/components/button`:  `UI.toast()` builds its actions from
 *     them) and `<ui-toast>`
 *   - registers `ToastStack` as `UI.toasts`' provider once the runtime has loaded, so `UI.toast({...})` works
 */

import { isBrowser, UI } from "$/ui/core"

import { UIToast } from "./UIToast"
import { UIToastHost } from "./UIToastHost"
import { ToastStack } from "./ToastStack"

import "$/ui/components/button"

UIToast.define()
if (isBrowser()) void UI.load().then(() => UI.toasts.register(new ToastStack()))

export { UIToast, UIToastHost, ToastStack }
