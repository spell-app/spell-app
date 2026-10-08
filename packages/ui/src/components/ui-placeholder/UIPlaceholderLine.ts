import { E } from "$/ui/core"
import { PlaceholderShape } from "./PlaceholderShape"
import { placeholderLineVocabulary } from "./UIPlaceholderLine.vocabulary.en"

/****************
 * ### `UIPlaceholderLine`
 * The component behind `<ui-placeholder-line>`:  one bar, `<div class="[length] line" part="line"></div>`.
 * - `length` writes its value alone (`very long`, `medium` …);  without one, the bar's length follows its position
 *   in the block.
 ****************/
export class UIPlaceholderLine extends PlaceholderShape<typeof placeholderLineVocabulary> {
  @E.proto static vocabulary = placeholderLineVocabulary

  /** Solid:  nothing inside. */
  protected get canHoldShapes(): boolean {
    return false
  }
}
/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIPlaceholderLine extends E.AttributeValues<typeof placeholderLineVocabulary> {}
