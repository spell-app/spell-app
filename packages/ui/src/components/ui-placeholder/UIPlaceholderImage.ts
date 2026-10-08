import { E } from "$/ui/core"
import { PlaceholderShape } from "./PlaceholderShape"
import { placeholderImageVocabulary } from "./UIPlaceholderImage.vocabulary.en"

/****************
 * ### `UIPlaceholderImage`
 * The component behind `<ui-placeholder-image>`:  an image's skeleton, a solid block:
 * `<div class="[square] [rectangular] image" part="image"></div>`.
 ****************/
export class UIPlaceholderImage extends PlaceholderShape<typeof placeholderImageVocabulary> {
  @E.proto static vocabulary = placeholderImageVocabulary

  /** Solid:  nothing inside. */
  protected get canHoldShapes(): boolean {
    return false
  }
}
/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIPlaceholderImage extends E.AttributeValues<typeof placeholderImageVocabulary> {}
