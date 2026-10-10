import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { epicQuestionVocabulary } from "./EpicQuestion.en"

import questionCSS from "./EpicQuestion.css?inline"

/****************
 * ### `EpicQuestion`
 * The component behind `<epic-question>`:  a question's text as first asked, under a small `Question` label.
 * - The label looks like `<epic-item>`'s `Original question` eyebrow (small, grey, upper case):
 *   an item whose text starts with an `<epic-question>` draws no label of its own over it
 *   (`EpicItem.scanChildren()` counts it as one of its parts, not prose).
 * - The text is its light children, through the default slot:  find-in-page, `#id` links and the live update see
 *   them (Q12).  The tool finds a question's text by this tag, not by its place.
 ****************/
export class EpicQuestion extends E.UIComponent<typeof epicQuestionVocabulary> {
  @E.proto static vocabulary = epicQuestionVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { "epic-question": questionCSS }
  } satisfies Partial<E.ElementSetup>

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("base")}>
        <div class={LABEL} part={this.partForName("label")}>
          {this.translationForKey("label")}
        </div>
        <slot />
      </div>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicQuestion extends E.AttributeValues<typeof epicQuestionVocabulary> {}

/** Class of the label. */
const LABEL = "label"
