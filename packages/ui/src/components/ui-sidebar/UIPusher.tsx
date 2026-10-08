import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { pusherVocabulary } from "./UIPusher.en"

import sidebarCSS from "./UISidebar.css?inline"

/****************
 * ### `UIPusher`
 * The component behind `<ui-pusher>`:
 * the page content beside a sidebar (Fomantic's `.pusher`), `<div class="pusher" part="pusher"><slot>`.
 *
 * - Passive:  `UISidebar.css` moves and dims it from the tokens its `<ui-pushable>` sets (`UIT.PusherTokens`),
 *   and the pushable makes the DOM element `inert` beside a modal sidebar.
 * - Its `::after` is the dimmer.
 ****************/
export class UIPusher extends E.UIComponent<typeof pusherVocabulary> {
  @E.proto static vocabulary = pusherVocabulary
  @E.proto static styleSheets = { sidebar: sidebarCSS }
  @E.proto static elementSetup = { delegatesFocus: false } satisfies Partial<E.ElementSetup>

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

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIPusher extends E.AttributeValues<typeof pusherVocabulary> {}

/** Class word of the root (`UISidebar.css`). */
const PUSHER = "pusher"
