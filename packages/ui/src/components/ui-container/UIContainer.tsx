import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { containerVocabulary } from "./ui-container.vocabulary.en"
import { ContainerFallback } from "./ui-container.fallback"

import containerCSS from "./ui-container.css?inline"

/****************
 * ### `<ui-container>`
 * A container:  `<div class="ui … container" part="container"><slot></slot></div>`, centred page width.
 * - `scrolling`:  the root is a keyboard stop (`tabindex=0`), as every scrollable region must be.
 ****************/
export class UIContainer extends E.UIElement<typeof containerVocabulary> {
  @E.proto static vocabulary = containerVocabulary
  @E.proto static styleSheets = { container: containerCSS }
  @E.proto static elementSetup = { Fallback: ContainerFallback }

  render(): JSX.Element {
    return (
      <div class={this.rootClasses} part={this.partForName("container")} tabindex={this.scrolling ? 0 : undefined}>
        <slot />
      </div>
    )
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UIContainer extends E.AttributeValues<typeof containerVocabulary> {}
