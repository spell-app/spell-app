import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { pusherVocabulary } from "./ui-pusher.vocabulary.en"
import { SidebarFallback } from "./ui-sidebar.fallback"

import sidebarCSS from "./ui-sidebar.css?inline"

/****************
 * ### `<ui-pusher>`
 * The page content beside a sidebar (Fomantic's `.pusher`):  `<div class="pusher" part="pusher"><slot>`.
 * - Passive:  `ui-sidebar.css` moves and dims it from the tokens its `<ui-pushable>` sets (`PusherTokens`), and the
 *   pushable makes the HOST `inert` beside a modal sidebar.  Its `::after` is the dimmer.
 ****************/
export class UIPusher extends E.UIElement<typeof pusherVocabulary> {
  @E.proto static vocabulary = pusherVocabulary
  @E.proto static styleSheets = { sidebar: sidebarCSS }
  @E.proto static elementSetup = { Fallback: SidebarFallback, delegatesFocus: false }

  /** Always:  `:state(pusher)`. */
  @E.cssState("pusher")
  get isPusher(): boolean {
    return true
  }

  render(): JSX.Element {
    return (
      <div class={PUSHER} part={this.partForName("pusher")}>
        <slot />
      </div>
    )
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UIPusher extends E.AttributeValues<typeof pusherVocabulary> {}

/** Class word of the root (`ui-sidebar.css`). */
const PUSHER = "pusher"
