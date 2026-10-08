import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import placeholderCSS from "./UIPlaceholder.css?inline"

/****************
 * ### `PlaceholderShape`
 * The base of the placeholder's skeleton shapes:  `<div class="[keyOnly ...] <noun>" part="<noun>">`,
 * with a `<slot>` for the shapes that hold lines (header, paragraph), and none for the solid ones (line, image).
 * - `ui: false` vocabularies:  Fomantic styles the shapes only inside a placeholder, which they MUST sit in.
 * - No text, no focus:  the `<ui-placeholder>` is `aria-hidden`, and the shapes are its drawing.
 ****************/
export abstract class PlaceholderShape<
  V extends E.ComponentVocabulary = E.ComponentVocabulary
> extends E.UIComponent<V> {
  @E.proto static styleSheets = { placeholder: placeholderCSS }
  @E.proto static elementSetup = { delegatesFocus: false } satisfies Partial<E.ElementSetup>

  render(): JSX.Element {
    return (
      <div class={this.rootClasses} part={this.partForName(this.vocabulary.noun as E.PartName<V>)}>
        {this.canHoldShapes ? <slot /> : undefined}
      </div>
    )
  }

  /** Can the shape hold other shapes (a `<slot>`)?  Default yes. */
  protected get canHoldShapes(): boolean {
    return true
  }
}
