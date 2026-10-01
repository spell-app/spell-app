import type { JSX } from "@solidjs/web"

import { PLACEHOLDER_HOST_STATE, proto, UIElement } from "$/ui/core"

import { placeholderVocabulary } from "./ui-placeholder.vocabulary.en"
import { PlaceholderFallback } from "./ui-placeholder.fallback"

import placeholderCSS from "./ui-placeholder.css?inline"

/****************
 * ### `<ui-placeholder>`
 * A skeleton of content still loading:  `<div class="ui … placeholder" part="placeholder"><slot></slot></div>`
 * around the shapes (`<ui-placeholder-header>`, `-paragraph`, `-line`, `-image`).
 * - `:state(placeholder)`, ALWAYS (`PLACEHOLDER_HOST_STATE`):  `ui-placeholder.css` finds placeholder siblings by it,
 *   for the gap between consecutive placeholders.
 * - Decorative:  the host is `aria-hidden` (internals);  whatever is loading announces itself, once.
 ****************/
export class UIPlaceholder extends UIElement<typeof placeholderVocabulary> {
  @proto static vocabulary = placeholderVocabulary
  @proto static styles = { placeholder: placeholderCSS }
  @proto static Fallback = PlaceholderFallback
  @proto static delegatesFocus = false

  constructor(...args: ConstructorParameters<typeof UIElement>) {
    super(...args)
    this.host.internals.ariaHidden = TRUE
  }

  protected hostStates() {
    return { [PLACEHOLDER_HOST_STATE]: true }
  }

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("placeholder")}>
        <slot />
      </div>
    )
  }
}

/** ARIA boolean. */
const TRUE = "true"
