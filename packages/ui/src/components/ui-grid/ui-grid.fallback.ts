import { NativeFallback, proto, type NativeFallbackRoot } from "$/ui/core"

import { columnVocabulary, gridVocabulary, rowVocabulary } from "./ui-grid.vocabulary.en"

/****************
 * ### `GridFallback`
 * `<div part="<noun>" class="ui ... <noun>"><slot></slot></div>` for a grid, row or column -- keyed by the host's
 * tag.  The same markup as the elements, so `ui-grid.css` lays it out unchanged.
 ****************/
export class GridFallback extends NativeFallback {
  @proto static degraded = []

  constructor(host: HTMLElement, root: NativeFallbackRoot, error?: unknown, internals?: ElementInternals) {
    super(host, root, error, internals)
    // Shadows the prototype's placeholder vocabulary, see `@proto`.
    this.vocabulary = VOCABULARIES.find((vocabulary) => vocabulary.tag === host.localName) ?? gridVocabulary
  }

  protected override build() {
    return [this.decorate(this.create("div", { class: this.classes() }, this.slot()), this.vocabulary.noun)]
  }
}

/** Every vocabulary of the family. */
const VOCABULARIES = [gridVocabulary, rowVocabulary, columnVocabulary] as const
