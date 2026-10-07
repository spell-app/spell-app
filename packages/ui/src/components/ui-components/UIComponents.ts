import type { JSX } from "@solidjs/web"

import { proto, UIElement } from "$/ui/core"

import { ComponentsFallback } from "./ui-components.fallback"
import type { ComponentsVocabulary } from "./ui-components.types"
import { componentsVocabulary } from "./ui-components.vocabulary.en"

import componentsCSS from "./ui-components.css?inline"

/****************
 * ### `<ui-components>`
 * Names a component pack for the `<ui-root>` around it:  `<ui-components source="epics.pack.js">`.  Draws nothing.
 * - The ROOT does the work, reading `source` from the markup (defined or not):  it loads each distinct pack once per
 *   page (`ComponentPacks.load()`), waits for it before it's ready, and draws skeletons from its catalog.
 * - Outside a root it does nothing:  a page without one loads its pack with a plain `<script src>`.
 * - Defined with the root (its barrel imports this family), so it's never one of the tags a root waits for.
 ****************/
export class UIComponents extends UIElement<ComponentsVocabulary> {
  @proto static vocabulary = componentsVocabulary
  @proto static styles = { components: componentsCSS }
  @proto static Fallback = ComponentsFallback
  @proto static delegatesFocus = false

  render(): JSX.Element {
    return null
  }
}
