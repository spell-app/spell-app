import { proto } from "$/ui/core"

import { placeholderLineVocabulary } from "./ui-placeholder-line.vocabulary.en"
import { PlaceholderShape } from "./PlaceholderShape"

/****************
 * ### `<ui-placeholder-line>`
 * One bar:  `<div class="[length] line" part="line"></div>`, `length` emitting its value alone (`very long`,
 * `medium` ...);  absent, the bar follows its position in the block.
 ****************/
export class UIPlaceholderLine extends PlaceholderShape<typeof placeholderLineVocabulary> {
  @proto static vocabulary = placeholderLineVocabulary

  /** Solid:  nothing inside. */
  protected holdsShapes(): boolean {
    return false
  }
}
