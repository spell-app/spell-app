import { E } from "$/ui/core"
import type { RootVocabulary } from "./ui-root.types"
import { rootVocabulary } from "./ui-root.vocabulary.en"

/****************
 * ### `RootFallback`
 * Native fallback of `<ui-root>` (`docs/fallback.md`):  a bare `<slot>`, so a root that failed still shows its
 * content (whatever loaded).
 ****************/
export class RootFallback extends E.NativeFallback<RootVocabulary> {
  @E.proto static vocabulary = rootVocabulary
  @E.proto static degraded = []

  protected override build() {
    return [this.slot()]
  }
}
