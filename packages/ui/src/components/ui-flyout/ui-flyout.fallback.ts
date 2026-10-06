import { E, UIT } from "$/ui/core"
// Import the modal's FILE, not its barrel:  a server render loads this class without `customElements` (`index.ts`)
import { ModalFallback } from "$/ui/components/ui-modal/ui-modal.fallback"
import { WIDTH, type Vocabulary } from "./ui-flyout.types"
import { flyoutVocabulary } from "./ui-flyout.vocabulary.en"

/****************
 * ### `FlyoutFallback`
 * `ModalFallback` with a flyout's names:  the same native `<dialog>` shown with `showModal()` while the host has
 * `open` (focus trap, dimmer, Escape, approve / deny), in the flyout's class grammar (`ui left visible flyout`),
 * `part="flyout"`.
 ****************/
export class FlyoutFallback extends ModalFallback<Vocabulary> {
  @E.proto static vocabulary = flyoutVocabulary
  @E.proto static rootPart = "flyout"
  @E.proto static degraded = [
    ...ModalFallback.prototype.degraded,
    "the slide-in:  it appears at once;  a word `width` (`thin`) warns in dev, as the class grammar only knows columns"
  ]

  /** The class grammar, plus a word width after the noun, as the element adds it. */
  protected override classes(extra?: string): string {
    const word = UIT.WordWidthClasses.classFor(this.attr(WIDTH))
    return super.classes([word, extra].filter(Boolean).join(" ") || undefined)
  }
}
