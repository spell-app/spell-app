import { UIHost } from "$/core"

/** What the host asks of its controller (`UINag`). */
type NagController = {
  close(): boolean
  show(): boolean
  clear(): void
  isDismissed(): boolean
}

/****************
 * ### `UINagHost`
 * Host base of `<ui-nag>`:  its script API, delegated to the controller (`UINag`).
 * - `close()` -- dismiss it now, reason `dismiss` (the cancelable `ui-close` first), storing the dismissal;  true
 *   when it closes
 * - `show()` -- show it again, unless a dismissal is stored (and it doesn't `persist`);  true when it shows
 * - `clear()` -- forget a stored dismissal (Fomantic's `clear`)
 * - `dismissed` -- a dismissal is stored
 * - NOTE: the fork checks host prototype members against prop names;  none of these is one.
 ****************/
export class UINagHost extends UIHost {
  /** The controller, typed. */
  private get nag(): NagController | undefined {
    return this.controller as unknown as NagController | undefined
  }

  close(): boolean {
    return this.nag?.close() ?? false
  }

  show(): boolean {
    return this.nag?.show() ?? false
  }

  clear() {
    this.nag?.clear()
  }

  get dismissed(): boolean {
    return this.nag?.isDismissed() ?? false
  }
}
