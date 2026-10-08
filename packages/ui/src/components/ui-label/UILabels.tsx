import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { labelsVocabulary } from "./UILabels.vocabulary.en"

import labelCSS from "./UILabel.css?inline"

/****************
 * ### `UILabels`
 * The component behind `<ui-labels>`:  a group of labels sharing one look.
 *
 * - Its shadow DOM is one box, `<div class="ui … labels" part="group">`, around a slot for the labels.
 * - It needs no code beyond that:  `UILabel.css` hands the look to the slotted labels, through inherited tokens.
 ****************/
export class UILabels extends E.UIComponent<typeof labelsVocabulary> {
  @E.proto static vocabulary = labelsVocabulary
  @E.proto static styleSheets = { label: labelCSS }

  render(): JSX.Element {
    return (
      <div class={this.rootClasses} part={this.partForName("group")}>
        <slot />
      </div>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UILabels extends E.AttributeValues<typeof labelsVocabulary> {}
