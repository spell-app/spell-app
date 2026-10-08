import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { PlaceholderFallback } from "./ui-placeholder.fallback"
import { placeholderVocabulary } from "./ui-placeholder.vocabulary.en"

import placeholderCSS from "./ui-placeholder.css?inline"

/****************
 * ### `<ui-placeholder>`
 * A skeleton of content still loading:  `<div class="ui … placeholder" part="placeholder"><slot></slot></div>`
 * around the shapes (`<ui-placeholder-header>`, `-paragraph`, `-line`, `-image`).
 * - `:state(placeholder)`, ALWAYS (`UIT.PLACEHOLDER_HOST_STATE`):  `ui-placeholder.css` finds placeholder siblings by
 *   it, for the gap between consecutive placeholders.
 * - Decorative:  the host is `aria-hidden` (internals);  whatever is loading announces itself, once.
 ****************/
export class UIPlaceholder extends E.UIElement<typeof placeholderVocabulary> {
  @E.proto static vocabulary = placeholderVocabulary
  @E.proto static styleSheets = { placeholder: placeholderCSS }
  @E.proto static elementSetup = { Fallback: PlaceholderFallback, delegatesFocus: false }

  constructor(...args: ConstructorParameters<typeof E.UIElement>) {
    super(...args)
    this.host.internals.ariaHidden = UIT.TRUE
  }

  /** A placeholder:  always (`:state(placeholder)`). */
  @E.cssState(UIT.PLACEHOLDER_HOST_STATE)
  get isPlaceholder(): boolean {
    return true
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClasses} part={this.partForName("placeholder")}>
        <slot />
      </div>
    )
  }
}
export interface UIPlaceholder extends E.AttributeValues<typeof placeholderVocabulary> {}
