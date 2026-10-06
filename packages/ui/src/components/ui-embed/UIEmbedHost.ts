import { E } from "$/ui/core"
import type { EmbedController } from "./ui-embed.types"

/****************
 * ### `UIEmbedHost`
 * Host base of `<ui-embed>`:  its script API, delegated to the controller (`UIEmbed`).
 * - NOTE: the fork checks host prototype members against prop names;  neither `activate` nor `reset` is one.
 ****************/
export class UIEmbedHost extends E.UIHost {
  /** The controller, typed. */
  private get embed(): EmbedController | undefined {
    return this.controller as unknown as EmbedController | undefined
  }

  /**
   * Load the frame as the play button would (the cancelable `ui-activate` first);  true when it loads (Fomantic's
   * `show`).
   */
  activate(): boolean {
    return this.embed?.activate() ?? false
  }

  /** Back to the placeholder, with `ui-reset` (Fomantic's `reset`). */
  reset() {
    this.embed?.reset()
  }
}
