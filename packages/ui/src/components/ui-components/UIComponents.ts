import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { componentsVocabulary } from "./UIComponents.en"
import type { ComponentsVocabulary } from "./UIComponents.types"

import componentsCSS from "./UIComponents.css?inline"

/****************
 * ### `UIComponents`
 * The component behind `<ui-components>`:  it names a component pack for the `<ui-root>` around it,
 * `<ui-components source="epics.pack.js">`.  Draws nothing.
 * - The ROOT does the work, reading `source` from the markup (defined or not):  it loads each distinct pack once per
 *   page (`ComponentPacks.load()`), waits for it before it's ready, and draws skeletons from its catalog.
 * - Outside a root it does nothing:  a page without one loads its pack with a plain `<script src>`.
 * - Defined with the root (its barrel imports this family), so it's never one of the tags a root waits for.
 ****************/
export class UIComponents extends E.UIComponent<ComponentsVocabulary> {
  @E.proto static vocabulary = componentsVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { components: componentsCSS },
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  render(): JSX.Element {
    return undefined
  }
}
/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIComponents extends E.AttributeValues<ComponentsVocabulary> {}
