import { E } from "$/ui/core"
import { componentsVocabulary } from "./ui-components.vocabulary.en"
import type { ComponentsVocabulary } from "./ui-root.types"

/****************
 * ### `ComponentsFallback`
 * Native fallback of `<ui-components>` (`docs/fallback.md`):  nothing, as the element draws nothing.  A pack the
 * element already asked for still joins the roots (`ComponentPack`).
 ****************/
export class ComponentsFallback extends E.NativeFallback<ComponentsVocabulary> {
  @E.proto static vocabulary = componentsVocabulary
  @E.proto static degraded = []

  protected override build() {
    return []
  }
}
