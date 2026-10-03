import { proto } from "$/ui/core"
import { ModalFallback } from "$/ui/components/ui-modal/ui-modal.fallback"

import { flyoutVocabulary } from "./ui-flyout.vocabulary.en"
import { FLYOUT_WORD_WIDTHS, WIDTH } from "./ui-flyout.types"

/****************
 * ### `FlyoutFallback`
 * `ModalFallback` with a flyout's names:  the same native `<dialog>` shown with `showModal()` while the host has
 * `open` (focus trap, dimmer, Escape, approve / deny), in the flyout's class grammar (`ui left visible flyout`),
 * `part="flyout"`.
 ****************/
export class FlyoutFallback extends ModalFallback {
  // same dialog vocabulary shape as the modal's (see `DialogElement`);  TypeScript only knows the modal's literals
  @proto static vocabulary = flyoutVocabulary as unknown as typeof ModalFallback.prototype.vocabulary
  @proto static rootPart = "flyout"
  @proto static degraded = [
    ...ModalFallback.prototype.degraded,
    "the slide-in:  it appears at once;  a word `width` (`thin`) warns in dev, as the class grammar only knows columns"
  ]

  /** The class grammar, plus a word width after the noun, as the element adds it. */
  protected override classes(extra?: string): string {
    const width = this.host
      .getAttribute(WIDTH)
      ?.trim()
      .replace(/[\s-]+/g, " ")
    const word = FLYOUT_WORD_WIDTHS.find((each) => each === width)
    return super.classes([word, extra].filter(Boolean).join(" ") || undefined)
  }
}
