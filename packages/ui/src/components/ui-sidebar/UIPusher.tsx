import type { JSX } from "@solidjs/web"

import { proto, UIElement } from "$/ui/core"

import { pusherVocabulary } from "./ui-pusher.vocabulary.en"
import { SidebarFallback } from "./ui-sidebar.fallback"

import sidebarCSS from "./ui-sidebar.css?inline"
import { PUSHER } from "./ui-sidebar.types"

/****************
 * ### `<ui-pusher>`
 * The page content beside a sidebar (Fomantic's `.pusher`):  `<div class="pusher" part="pusher"><slot>`.
 * - Passive:  `ui-sidebar.css` moves and dims it from the tokens its `<ui-pushable>` sets (`PUSHER_TOKENS`), and the
 *   pushable makes the HOST `inert` beside a modal sidebar.  Its `::after` is the dimmer.
 ****************/
export class UIPusher extends UIElement<typeof pusherVocabulary> {
  @proto static vocabulary = pusherVocabulary
  @proto static styles = { sidebar: sidebarCSS }
  @proto static Fallback = SidebarFallback
  @proto static delegatesFocus = false

  protected hostStates() {
    return { pusher: true }
  }

  render(): JSX.Element {
    return (
      <div class={PUSHER} part={this.part("pusher")}>
        <slot />
      </div>
    )
  }
}
