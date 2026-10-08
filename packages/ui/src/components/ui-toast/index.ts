/**
 * The toast family:  defines `<ui-toast>` and exports its component, `UIToast`, and its DOM element, `DOMToastElement`.
 * - SIDE EFFECTS:
 *   - defines `<ui-toast>`, and `<ui-button>` / `<ui-buttons>` too
 *     (through `$/ui/components/ui-button`:  `UI.toast()` builds its actions from them)
 *   - registers `ToastStack` as `UI.toasts`' provider once the runtime has loaded, so `UI.toast({…})` works
 * - Also the library's `@spell-app/ui/ui-toast` entry (its size is in `docs/report.md`).
 */

import { E, UI } from "$/ui/core"
import { DOMToastElement, UIToast } from "./UIToast"
import { ToastStack } from "./ToastStack"

import "$/ui/components/ui-button"

UIToast.define()
if (E.isBrowser()) void UI.load().then(() => UI.toasts.register(new ToastStack()))

export { UIToast, DOMToastElement, ToastStack }
