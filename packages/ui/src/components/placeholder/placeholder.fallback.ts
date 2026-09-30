import { NativeFallback, PLACEHOLDER_HOST_STATE, proto, type NativeFallbackRoot } from "$/core"

import {
  placeholderHeaderVocabulary,
  placeholderImageVocabulary,
  placeholderLineVocabulary,
  placeholderParagraphVocabulary,
  placeholderVocabulary
} from "./placeholder.vocabulary.en"

/****************
 * ### `PlaceholderFallback`
 * The placeholder or any of its shapes:  `<div class="<classes>" part="<noun>">`, with a `<slot>` unless the
 * shape is solid (line, image) -- one class for all five, keyed by the host's tag.
 * - `<ui-placeholder>` also keeps its host contract:  `aria-hidden` and `:state(placeholder)` (internals).
 ****************/
export class PlaceholderFallback extends NativeFallback {
  @proto static degraded = []

  constructor(host: HTMLElement, root: NativeFallbackRoot, error?: unknown, internals?: ElementInternals) {
    super(host, root, error, internals)
    // Shadows the prototype's placeholder vocabulary, see `@proto`.
    this.vocabulary = VOCABULARIES.find((vocabulary) => vocabulary.tag === host.localName) ?? placeholderVocabulary
  }

  protected override build() {
    const { noun } = this.vocabulary
    const solid = SOLID.has(this.vocabulary)
    if (this.vocabulary === placeholderVocabulary && this.internals) {
      this.internals.ariaHidden = "true"
      try {
        this.internals.states.add(PLACEHOLDER_HOST_STATE)
      } catch {
        // Safari before 17.4 wants `--placeholder`;  only the gap between placeholders is lost.
      }
    }
    return [this.decorate(this.create("div", { class: this.classes() }, ...(solid ? [] : [this.slot()])), noun)]
  }
}

/** Every vocabulary of the family. */
const VOCABULARIES = [
  placeholderVocabulary,
  placeholderHeaderVocabulary,
  placeholderParagraphVocabulary,
  placeholderLineVocabulary,
  placeholderImageVocabulary
] as const

/** Solid shapes:  no slot. */
const SOLID = new Set<object>([placeholderLineVocabulary, placeholderImageVocabulary])
