import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { containerVocabulary } from "./UIContainer.en"

import containerCSS from "./UIContainer.css?inline"

/****************
 * ### `UIContainer`
 * The component behind `<ui-container>`:  a centred column of page width that holds a page's content.
 *
 * - Its shadow DOM is one box, `<div class="ui … container" part="container">`, around a slot for the content.
 * - `scrolling`:  the box is a keyboard stop (`tabindex=0`), as every scrollable region must be.
 ****************/
export class UIContainer extends E.UIComponent<typeof containerVocabulary> {
  @E.proto static vocabulary = containerVocabulary
  @E.protoMerged static elementSetup = { styleSheets: { container: containerCSS } } satisfies Partial<E.ElementSetup>

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("container")} tabindex={this.scrolling ? 0 : undefined}>
        <slot />
      </div>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIContainer extends E.AttributeValues<typeof containerVocabulary> {}
