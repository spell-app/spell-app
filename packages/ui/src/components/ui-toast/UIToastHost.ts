import { E } from "$/ui/core"
import type { ToastController } from "./ui-toast.types"

/****************
 * ### `UIToastHost`
 * Host base of `<ui-toast>`:  its script API, delegated to the controller (`UIToast`).
 * - NOTE: the fork checks host prototype members against prop names;  `close` isn't one.
 ****************/
export class UIToastHost extends E.UIHost {
  /** The controller, typed. */
  private get toast(): ToastController | undefined {
    return this.controller as unknown as ToastController | undefined
  }

  /** Close it now, reason `dismiss` (the cancelable `ui-close` first);  true when it closes. */
  close(): boolean {
    return this.toast?.close() ?? false
  }
}
