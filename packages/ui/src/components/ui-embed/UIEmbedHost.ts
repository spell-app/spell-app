import { UIHost } from "$/ui/core"
import type { EmbedController } from "./ui-embed.types"

/****************
 * ### `UIEmbedHost`
 * Host base of `<ui-embed>`:  its script API, delegated to the controller (`UIEmbed`).
 * - `activate()` -- load the frame as the play button would (the cancelable `ui-activate` first);  true when it
 *   loads (Fomantic's `show`)
 * - `reset()` -- back to the placeholder, with `ui-reset` (Fomantic's `reset`)
 * - NOTE: the fork checks host prototype members against prop names;  neither is one.
 ****************/
export class UIEmbedHost extends UIHost {
  /** The controller, typed. */
  private get embed(): EmbedController | undefined {
    return this.controller as unknown as EmbedController | undefined
  }

  activate(): boolean {
    return this.embed?.activate() ?? false
  }

  reset() {
    this.embed?.reset()
  }
}
