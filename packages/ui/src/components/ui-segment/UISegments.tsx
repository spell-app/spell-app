import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { segmentsVocabulary } from "./UISegments.en"

import segmentCSS from "./UISegment.css?inline"

/****************
 * ### `UISegments`
 * The component behind `<ui-segments>`:  a group of segments in one box.
 *
 * - Its shadow DOM is one box, `<div class="ui … segments" part="group">`, around a slot for the segments.
 * - `UISegment.css` hands the group's look to the slotted segments, through `--_ui-segments-*` tokens.
 ****************/
@E.cssStates("piled")
export class UISegments extends E.UIComponent<typeof segmentsVocabulary> {
  @E.proto static vocabulary = segmentsVocabulary
  @E.protoMerged static elementSetup = { styleSheets: { segment: segmentCSS } } satisfies Partial<E.ElementSetup>

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("group")}>
        <slot />
      </div>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UISegments extends E.AttributeValues<typeof segmentsVocabulary> {}
