import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { labelsVocabulary } from "./ui-labels.vocabulary.en"

import labelCSS from "./ui-label.css?inline"

/****************
 * ### `<ui-labels>`
 * A group of labels sharing one look:  `<div class="ui … labels" part="group"><slot></slot></div>`.
 * - Needs no code beyond that:  `ui-label.css` hands the look to slotted labels through inherited tokens.
 ****************/
export class UILabels extends E.UIElement<typeof labelsVocabulary> {
  @E.proto static vocabulary = labelsVocabulary
  @E.proto static styles = { label: labelCSS }

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("group")}>
        <slot />
      </div>
    )
  }
}
