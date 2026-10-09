import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { railVocabulary } from "./UIRail.en"

import railCSS from "./UIRail.css?inline"

/****************
 * ### `UIRail`
 * The component behind `<ui-rail>`:  content set beside a box, outside its edge,
 * `<div class="ui … rail" part="rail"><slot></slot></div>`,
 * absolutely positioned against the nearest positioned box around it (a `<ui-segment>`'s root).
 *
 * - No role:  a `<div>`, not an `<aside>` (see `UIRail.css`).  The content decides the semantics.
 * - `delegatesFocus` off:  the rail itself takes no focus;  its content keeps its own tab stops.
 ****************/
export class UIRail extends E.UIComponent<typeof railVocabulary> {
  @E.proto static vocabulary = railVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { rail: railCSS },
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("rail")}>
        <slot />
      </div>
    )
  }
}
