import { UIHost } from "$/core"

/** What the host asks of its controller (`UIToast`). */
type ToastController = {
  close(): boolean
}

/****************
 * ### `UIToastHost`
 * Host base of `<ui-toast>`:  its script API, delegated to the controller (`UIToast`).
 * - `close()` -- close it now, reason `dismiss` (the cancelable `ui-close` first);  true when it closes
 * - NOTE: the fork checks host prototype members against prop names;  `close` isn't one.
 ****************/
export class UIToastHost extends UIHost {
  /** The controller, typed. */
  private get toast(): ToastController | undefined {
    return this.controller as unknown as ToastController | undefined
  }

  close(): boolean {
    return this.toast?.close() ?? false
  }
}
