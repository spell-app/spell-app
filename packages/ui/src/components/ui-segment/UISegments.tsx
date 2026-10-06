import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { segmentsVocabulary } from "./ui-segments.vocabulary.en"

import segmentCSS from "./ui-segment.css?inline"

/****************
 * ### `<ui-segments>`
 * A group of segments in one box:  `<div class="ui ... segments" part="group"><slot></slot></div>`.
 * - `ui-segment.css` hands the group look to slotted segments through `--_ui-segments-*` tokens.
 ****************/
export class UISegments extends E.UIElement<typeof segmentsVocabulary> {
  @E.proto static vocabulary = segmentsVocabulary
  @E.proto static styles = { segment: segmentCSS }

  protected hostStates() {
    return { piled: this.attrs.piled }
  }

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("group")}>
        <slot />
      </div>
    )
  }
}
