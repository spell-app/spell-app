import { E } from "$/ui/core"
import { PlaceholderShape } from "./PlaceholderShape"
import { placeholderLineVocabulary } from "./ui-placeholder-line.vocabulary.en"

/****************
 * ### `<ui-placeholder-line>`
 * One bar:  `<div class="[length] line" part="line"></div>`, `length` emitting its value alone (`very long`,
 * `medium` ...);  absent, the bar follows its position in the block.
 ****************/
export class UIPlaceholderLine extends PlaceholderShape<typeof placeholderLineVocabulary> {
  @E.proto static vocabulary = placeholderLineVocabulary

  /** Solid:  nothing inside. */
  protected holdsShapes(): boolean {
    return false
  }
}
