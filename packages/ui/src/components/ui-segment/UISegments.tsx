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
  @E.proto static styleSheets = { segment: segmentCSS }

  /** Piled sheets (`piled`).  `:state(piled)`. */
  @E.cssState("piled")
  get isPiled(): boolean {
    return !!this.piled
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClasses} part={this.partForName("group")}>
        <slot />
      </div>
    )
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UISegments extends E.AttributeValues<typeof segmentsVocabulary> {}
