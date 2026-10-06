import { NativeFallback, proto, UIT } from "$/ui/core"

import { placeholderVocabulary } from "./ui-placeholder.vocabulary.en"
import { VOCABULARIES, SOLID } from "./ui-placeholder.types"

/****************
 * ### `PlaceholderFallback`
 * The placeholder or any of its shapes:  `<div class="<classes>" part="<noun>">`, with a `<slot>` unless the
 * shape is solid (line, image) -- one class for all five, keyed by the host's tag.
 * - `<ui-placeholder>` also keeps its host contract:  `aria-hidden` and `:state(placeholder)` (internals).
 ****************/
export class PlaceholderFallback extends NativeFallback {
  @proto static vocabularies = VOCABULARIES
  @proto static degraded = []

  protected override build() {
    const { noun } = this.vocabulary
    const solid = SOLID.has(this.vocabulary)
    if (this.vocabulary === placeholderVocabulary && this.internals) {
      this.internals.ariaHidden = "true"
      try {
        this.internals.states.add(UIT.PLACEHOLDER_HOST_STATE)
      } catch {
        // Safari before 17.4 wants `--placeholder`;  only the gap between placeholders is lost.
      }
    }
    return [this.decorate(this.create("div", { class: this.classes() }, ...(solid ? [] : [this.slot()])), noun)]
  }
}
