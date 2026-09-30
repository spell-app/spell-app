import type { JSX } from "@solidjs/web"

import { proto, UIElement } from "$/core"

import { labelsVocabulary } from "./label.vocabulary.en"

import labelCSS from "./label.css?inline"

/****************
 * ### `<ui-labels>`
 * A group of labels sharing one look:  `<div class="ui … labels" part="group"><slot></slot></div>`.
 * - Needs no code beyond that:  `label.css` hands the look to slotted labels through inherited tokens.
 ****************/
export class UILabels extends UIElement<typeof labelsVocabulary> {
  @proto static vocabulary = labelsVocabulary
  @proto static styles = { label: labelCSS }

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("group")}>
        <slot />
      </div>
    )
  }
}
