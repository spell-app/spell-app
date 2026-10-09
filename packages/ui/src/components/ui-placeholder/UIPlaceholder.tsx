import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { placeholderVocabulary } from "./UIPlaceholder.en"

import placeholderCSS from "./UIPlaceholder.css?inline"

/****************
 * ### `UIPlaceholder`
 * The component behind `<ui-placeholder>`:  a grey skeleton of content that is still loading.
 *
 * - Its shadow DOM is one box, `<div class="ui … placeholder" part="placeholder">`, around a slot for the shapes
 *   (`<ui-placeholder-header>`, `-paragraph`, `-line`, `-image`).
 * - `:state(placeholder)`, ALWAYS (`UIT.PLACEHOLDER_HOST_STATE`):
 *   `UIPlaceholder.css` finds placeholder siblings by it, for the gap between consecutive placeholders.
 * - Decorative:  the element is `aria-hidden` (through `internals`);  whatever is loading announces itself, once.
 ****************/
export class UIPlaceholder extends E.UIComponent<typeof placeholderVocabulary> {
  @E.proto static vocabulary = placeholderVocabulary
  @E.proto static styleSheets = { placeholder: placeholderCSS }
  @E.proto static elementSetup = { delegatesFocus: false } satisfies Partial<E.ElementSetup>

  constructor(...args: ConstructorParameters<typeof E.UIComponent>) {
    super(...args)
    this.domElement.internals.ariaHidden = "true"
  }

  /** A placeholder:  always (`:state(placeholder)`). */
  @E.cssState(UIT.PLACEHOLDER_HOST_STATE)
  get isPlaceholder(): boolean {
    return true
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("placeholder")}>
        <slot />
      </div>
    )
  }
}
/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIPlaceholder extends E.AttributeValues<typeof placeholderVocabulary> {}
