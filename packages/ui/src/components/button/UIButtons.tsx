import type { JSX } from "@solidjs/web"

import { proto, UIElement } from "$/core"

import { buttonsVocabulary } from "./button.vocabulary.en"

import buttonCSS from "./button.css?inline"

/****************
 * ### `<ui-buttons>`
 * A group of buttons (and `<ui-or>`s):  `<div class="ui … buttons" role="group">` around a slot.
 * - Needs almost no code:  `button.css` hands the group's look to slotted buttons through inherited tokens.
 * - Host states only for layout the host itself must do:  fluid (also `width` / top / bottom attached) and floats.
 ****************/
export class UIButtons extends UIElement<typeof buttonsVocabulary> {
  @proto static vocabulary = buttonsVocabulary
  @proto static styles = { button: buttonCSS }

  protected hostStates() {
    const { attached, floated } = this.attrs
    return {
      fluid: this.attrs.fluid || !!this.attrs.width || attached === true || attached === "top" || attached === "bottom",
      "left-floated": floated === "left",
      "right-floated": floated === "right"
    }
  }

  render(): JSX.Element {
    return (
      <div class={this.classes()} role="group" part={this.part("group")}>
        <slot />
      </div>
    )
  }
}
