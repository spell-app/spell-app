import type { JSX } from "@solidjs/web"

import { proto, UIElement, type ComponentVocabulary, type PartName } from "$/ui/core"

import { PlaceholderFallback } from "./ui-placeholder.fallback"

import placeholderCSS from "./ui-placeholder.css?inline"

/****************
 * ### `PlaceholderShape`
 * Base of the placeholder's skeleton shapes:  `<div class="[keyOnly ...] <noun>" part="<noun>">`, with a
 * `<slot>` for the shapes that hold lines (header, paragraph) and none for the solid ones (line, image).
 * - `ui: false` vocabularies:  Fomantic styles the shapes only inside a placeholder, which they MUST sit in.
 * - No text, no focus:  the placeholder host is `aria-hidden`, and the shapes are its drawing.
 ****************/
export abstract class PlaceholderShape<V extends ComponentVocabulary = ComponentVocabulary> extends UIElement<V> {
  @proto static styles = { placeholder: placeholderCSS }
  @proto static Fallback = PlaceholderFallback
  @proto static delegatesFocus = false

  /** Does the shape hold other shapes (a `<slot>`)?  Default yes. */
  protected holdsShapes(): boolean {
    return true
  }

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part(this.vocabulary.noun as PartName<V>)}>
        {this.holdsShapes() ? <slot /> : undefined}
      </div>
    )
  }
}
