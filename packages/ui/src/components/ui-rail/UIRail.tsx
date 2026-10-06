import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { railVocabulary } from "./ui-rail.vocabulary.en"
import { RailFallback } from "./ui-rail.fallback"

import railCSS from "./ui-rail.css?inline"

/****************
 * ### `<ui-rail>`
 * A rail:  `<div class="ui ... rail" part="rail"><slot></slot></div>`, absolutely positioned against the nearest
 * positioned box around it (a `<ui-segment>`'s root).
 * - No role:  a `<div>`, not an `<aside>` -- see `ui-rail.css`.  The content decides the semantics.
 * - `delegatesFocus` off:  the rail itself takes no focus;  its content keeps its own tab stops.
 ****************/
export class UIRail extends E.UIElement<typeof railVocabulary> {
  @E.proto static vocabulary = railVocabulary
  @E.proto static styles = { rail: railCSS }
  @E.proto static Fallback = RailFallback
  @E.proto static delegatesFocus = false

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("rail")}>
        <slot />
      </div>
    )
  }
}
