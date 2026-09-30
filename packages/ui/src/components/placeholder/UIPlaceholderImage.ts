import { proto } from "$/core"

import { placeholderImageVocabulary } from "./placeholder.vocabulary.en"
import { PlaceholderShape } from "./PlaceholderShape"

/****************
 * ### `<ui-placeholder-image>`
 * An image's skeleton, a solid block:  `<div class="[square] [rectangular] image" part="image"></div>`.
 ****************/
export class UIPlaceholderImage extends PlaceholderShape<typeof placeholderImageVocabulary> {
  @proto static vocabulary = placeholderImageVocabulary

  /** Solid:  nothing inside. */
  protected holdsShapes(): boolean {
    return false
  }
}
