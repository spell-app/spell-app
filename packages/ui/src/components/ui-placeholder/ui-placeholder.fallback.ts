import { E, UIT } from "$/ui/core"
import { placeholderHeaderVocabulary } from "./ui-placeholder-header.vocabulary.en"
import { placeholderImageVocabulary } from "./ui-placeholder-image.vocabulary.en"
import { placeholderLineVocabulary } from "./ui-placeholder-line.vocabulary.en"
import { placeholderParagraphVocabulary } from "./ui-placeholder-paragraph.vocabulary.en"
import { placeholderVocabulary } from "./ui-placeholder.vocabulary.en"

/****************
 * ### `PlaceholderFallback`
 * The placeholder or any of its shapes:  `<div class="<classes>" part="<noun>">`, with a `<slot>` unless the
 * shape is solid (line, image) -- one class for all five, keyed by the host's tag.
 * - `<ui-placeholder>` also keeps its host contract:  `aria-hidden` and `:state(placeholder)` (internals).
 ****************/
export class PlaceholderFallback extends E.NativeFallback {
  @E.proto static vocabularies = [
    placeholderVocabulary,
    placeholderHeaderVocabulary,
    placeholderParagraphVocabulary,
    placeholderLineVocabulary,
    placeholderImageVocabulary
  ]
  @E.proto static degraded = []

  protected override build() {
    const { noun } = this.vocabulary
    const isSolid = SOLID.has(this.vocabulary)
    if (this.vocabulary === placeholderVocabulary && this.internals) {
      this.internals.ariaHidden = UIT.TRUE
      this.internals.states.add(UIT.PLACEHOLDER_HOST_STATE)
    }
    return [this.decorate(this.create("div", { class: this.classes() }, ...(isSolid ? [] : [this.slot()])), noun)]
  }
}

/** Solid shapes:  no slot. */
const SOLID = new Set<object>([placeholderLineVocabulary, placeholderImageVocabulary])
