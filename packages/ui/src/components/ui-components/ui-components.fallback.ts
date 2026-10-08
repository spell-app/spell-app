/**
 * Native fallback of `<ui-components>` (`docs/fallback.md`).
 */
import { NativeFallback, proto } from "$/ui/core"

import type { ComponentsVocabulary } from "./ui-components.types"
import { componentsVocabulary } from "./ui-components.vocabulary.en"

/****************
 * ### `ComponentsFallback`
 * Nothing, as the element:  its pack is the root's to load, which a failed render doesn't change.
 ****************/
export class ComponentsFallback extends NativeFallback<ComponentsVocabulary> {
  @proto static vocabulary = componentsVocabulary
  @proto static degraded = []

  protected override build() {
    return []
  }
}
