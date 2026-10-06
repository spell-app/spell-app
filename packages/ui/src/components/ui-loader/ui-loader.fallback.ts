import { E, UIT } from "$/ui/core"
import { loaderVocabulary } from "./ui-loader.vocabulary.en"
import { POLITE } from "./ui-loader.types"

/****************
 * ### `LoaderFallback`
 * `<div part="loader" class="ui ... loader" role="status" aria-live="polite"><slot></slot></div>`.
 * - The live region moves from the host (internals) to the root:  plain DOM, so it doesn't lean on the
 *   element's effects.  Named by the vocabulary's ENGLISH `loading` text while nothing is slotted.
 ****************/
export class LoaderFallback extends E.NativeFallback<typeof loaderVocabulary> {
  @E.proto static vocabulary = loaderVocabulary
  @E.proto static degraded = ["translated `loading` name (English only);  the name ignores later slot changes"]

  protected override build() {
    const isEmpty = !this.host.textContent?.trim()
    const loading = this.vocabulary.texts.find(({ key }) => key === "loading")!.text
    const loader = this.create(
      "div",
      { class: this.classes(), role: UIT.STATUS, "aria-live": POLITE, "aria-label": isEmpty ? loading : undefined },
      this.slot()
    )
    return [this.decorate(loader, "loader")]
  }
}
