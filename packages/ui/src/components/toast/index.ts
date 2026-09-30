/**
 * Barrel for the toast -- also the `toast` lib entry (`@spell/ui/toast`), measured in `docs/report.md`.
 * - SIDE EFFECTS:
 *   - defines `<ui-button>` / `<ui-buttons>` (through `$/components/button`:  `UI.toast()` builds its actions from
 *     them) and `<ui-toast>`
 *   - registers `ToastStack` as `UI.toasts`' provider once the runtime has loaded, so `UI.toast({...})` works
 */

import { isBrowser, UI } from "$/core"

import { UIToast } from "./UIToast"
import { UIToastHost } from "./UIToastHost"
import { ToastStack } from "./ToastStack"

import "$/components/button"

UIToast.define()
if (isBrowser()) void UI.load().then(() => UI.toasts.register(new ToastStack()))

export { UIToast, UIToastHost, ToastStack }
