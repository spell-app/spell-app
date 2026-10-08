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
  @E.proto static styleSheets = { label: labelCSS }

  render(): JSX.Element {
    return (
      <div class={this.rootClasses} part={this.partForName("group")}>
        <slot />
      </div>
    )
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UILabels extends E.AttributeValues<typeof labelsVocabulary> {}
