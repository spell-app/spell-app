import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { buttonsVocabulary } from "./UIButtons.en"

import buttonCSS from "./UIButton.css?inline"

/****************
 * ### `UIButtons`
 * The component behind `<ui-buttons>`:  a group of buttons (and `<ui-or>`s) that share one look.
 *
 * - Its shadow DOM is one box, `<div class="ui … buttons" role="group">`, around a slot.
 * - Almost no code:  `UIButton.css` hands the group's look to the slotted buttons through inherited tokens.
 * - Its `:state()`s are only for layout the DOM element itself must do:
 *   `fluid` (also for a `width`, or attached top / bottom) and the floats.
 ****************/
export class UIButtons extends E.UIComponent<typeof buttonsVocabulary> {
  @E.proto static vocabulary = buttonsVocabulary
  @E.proto static styleSheets = { button: buttonCSS }

  /** Full width:  `fluid`, a `width` (equal-width buttons), or attached as a whole row. */
  @E.cssState("fluid")
  get isFluid(): boolean {
    const { attached } = this
    return this.fluid || !!this.width || attached === true || attached === "top" || attached === "bottom"
  }

  /** `floated="left"`:  the whole element floats left. */
  @E.cssState("left-floated")
  get floatsLeft(): boolean {
    return this.floated === "left"
  }

  /** `floated="right"`:  the whole element floats right. */
  @E.cssState("right-floated")
  get floatsRight(): boolean {
    return this.floated === "right"
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClasses} role="group" part={this.partForName("group")}>
        <slot />
      </div>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIButtons extends E.AttributeValues<typeof buttonsVocabulary> {}
