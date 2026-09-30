import type { JSX } from "@solidjs/web"

import { proto, UIElement } from "$/core"

import { railVocabulary } from "./rail.vocabulary.en"
import { RailFallback } from "./rail.fallback"

import railCSS from "./rail.css?inline"

/****************
 * ### `<ui-rail>`
 * A rail:  `<div class="ui … rail" part="rail"><slot></slot></div>`, absolutely positioned against the nearest
 * positioned box around it (a `<ui-segment>`'s root).
 * - No role:  a `<div>`, not an `<aside>` -- see `rail.css`.  The content decides the semantics.
 * - `delegatesFocus` off:  the rail itself takes no focus;  its content keeps its own tab stops.
 ****************/
export class UIRail extends UIElement<typeof railVocabulary> {
  @proto static vocabulary = railVocabulary
  @proto static styles = { rail: railCSS }
  @proto static Fallback = RailFallback
  @proto static delegatesFocus = false

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("rail")}>
        <slot />
      </div>
    )
  }
}
