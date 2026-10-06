import { E } from "$/ui/core"
import type { NagController } from "./ui-nag.types"

/****************
 * ### `UINagHost`
 * Host base of `<ui-nag>`:  its script API, delegated to the controller (`UINag`).
 * - NOTE: the fork checks host prototype members against prop names;  none of these is one.
 ****************/
export class UINagHost extends E.UIHost {
  /** The controller, typed. */
  private get nag(): NagController | undefined {
    return this.controller as unknown as NagController | undefined
  }

  /** Dismiss it now, reason `dismiss` (the cancelable `ui-close` first), storing the dismissal;  true when it closes. */
  close(): boolean {
    return this.nag?.close() ?? false
  }

  /** Show it again, unless a dismissal is stored (and it doesn't `persist`);  true when it shows. */
  show(): boolean {
    return this.nag?.show() ?? false
  }

  /** Forget a stored dismissal (Fomantic's `clear`). */
  clear() {
    this.nag?.clear()
  }

  /** A dismissal is stored (and not expired);  `false` without a `key`. */
  get dismissed(): boolean {
    return this.nag?.isDismissed() ?? false
  }
}
