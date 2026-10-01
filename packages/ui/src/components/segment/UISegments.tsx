import type { JSX } from "@solidjs/web"

import { proto, UIElement } from "$/ui/core"

import { segmentsVocabulary } from "./segment.vocabulary.en"

import segmentCSS from "./segment.css?inline"

/****************
 * ### `<ui-segments>`
 * A group of segments in one box:  `<div class="ui … segments" part="group"><slot></slot></div>`.
 * - `segment.css` hands the group look to slotted segments through `--_ui-segments-*` tokens.
 ****************/
export class UISegments extends UIElement<typeof segmentsVocabulary> {
  @proto static vocabulary = segmentsVocabulary
  @proto static styles = { segment: segmentCSS }

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
