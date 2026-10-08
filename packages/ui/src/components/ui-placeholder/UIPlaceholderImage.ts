import { E } from "$/ui/core"
import { PlaceholderShape } from "./PlaceholderShape"
import { placeholderImageVocabulary } from "./ui-placeholder-image.vocabulary.en"

/****************
 * ### `<ui-placeholder-image>`
 * An image's skeleton, a solid block:  `<div class="[square] [rectangular] image" part="image"></div>`.
 ****************/
export class UIPlaceholderImage extends PlaceholderShape<typeof placeholderImageVocabulary> {
  @E.proto static vocabulary = placeholderImageVocabulary

  /** Solid:  nothing inside. */
  protected get canHoldShapes(): boolean {
    return false
  }
}
export interface UIPlaceholderImage extends E.AttributeValues<typeof placeholderImageVocabulary> {}
