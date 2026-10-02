/**
 * Native fallback of `<ui-root>` (`docs/fallback.md`).
 */
import { NativeFallback, proto } from "$/ui/core"

import type { RootVocabulary } from "./ui-root.types"
import { rootVocabulary } from "./ui-root.vocabulary.en"

/****************
 * ### `RootFallback`
 * A bare `<slot>`:  a root that failed still shows its content (whatever loaded).
 ****************/
export class RootFallback extends NativeFallback<RootVocabulary> {
  @proto static vocabulary = rootVocabulary
  @proto static degraded = []

  protected override build() {
    return [this.slot()]
  }
}
