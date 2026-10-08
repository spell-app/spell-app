import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { buttonsVocabulary } from "./ui-buttons.vocabulary.en"

import buttonCSS from "./ui-button.css?inline"

/****************
 * ### `<ui-buttons>`
 * A group of buttons (and `<ui-or>`s):  `<div class="ui … buttons" role="group">` around a slot.
 * - Needs almost no code:  `ui-button.css` hands the group's look to slotted buttons through inherited tokens.
 * - Host states only for layout the host itself must do:  fluid (also `width` / top / bottom attached) and floats.
 ****************/
export class UIButtons extends E.UIElement<typeof buttonsVocabulary> {
  @E.proto static vocabulary = buttonsVocabulary
  @E.proto static styleSheets = { button: buttonCSS }

  /** Full width:  `fluid`, a `width` (equal-width buttons), or attached as a whole row. */
  @E.cssState("fluid")
  get isFluid(): boolean {
    const { attached } = this
    return this.fluid || !!this.width || attached === true || attached === "top" || attached === "bottom"
  }

  /** `floated="left"`:  the host floats. */
  @E.cssState("left-floated")
  get floatsLeft(): boolean {
    return this.floated === "left"
  }

  /** `floated="right"`:  the host floats. */
  @E.cssState("right-floated")
  get floatsRight(): boolean {
    return this.floated === "right"
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClasses} role={UIT.GROUP} part={this.partForName("group")}>
        <slot />
      </div>
    )
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UIButtons extends E.AttributeValues<typeof buttonsVocabulary> {}
