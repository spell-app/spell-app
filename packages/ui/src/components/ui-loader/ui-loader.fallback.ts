import { NativeFallback, proto } from "$/ui/core"

import { loaderVocabulary } from "./ui-loader.vocabulary.en"

/****************
 * ### `LoaderFallback`
 * `<div part="loader" class="ui ... loader" role="status" aria-live="polite"><slot></slot></div>`.
 * - The live region moves from the host (internals) to the root:  plain DOM, so it doesn't lean on the
 *   element's effects.  Named by the vocabulary's ENGLISH `loading` text while nothing is slotted.
 ****************/
export class LoaderFallback extends NativeFallback<typeof loaderVocabulary> {
  @proto static vocabulary = loaderVocabulary
  @proto static degraded = ["translated `loading` name (English only);  the name ignores later slot changes"]

  protected override build() {
    const empty = !this.host.textContent?.trim()
    const loading = this.vocabulary.texts.find(({ key }) => key === "loading")!.text
    const loader = this.create(
      "div",
      { class: this.classes(), role: "status", "aria-live": "polite", "aria-label": empty ? loading : null },
      this.slot()
    )
    return [this.decorate(loader, "loader")]
  }
}
