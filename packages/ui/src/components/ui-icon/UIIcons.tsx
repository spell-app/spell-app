import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { iconsVocabulary } from "./UIIcons.en"
import { IconLabels } from "./UIIcon.types"

import iconCSS from "./UIIcon.css?inline"

/****************
 * ### `UIIcons`
 * The component behind `<ui-icons>`:  several icons stacked into one glyph.
 *
 * - Its shadow DOM is one box, `<span class="ui … icons" part="icons">`, around a slot for the icons.
 * - It owns `icon` (`ownsParts`):  each child `<ui-icon>` sets `:state(in-icons)` and positions its own box.
 * - The accessible name, as for `<ui-icon>` (`IconLabels`):
 *   `label` => one `role=img` for the combined glyph;  else hidden.
 ****************/
export class UIIcons extends E.UIComponent<typeof iconsVocabulary> {
  @E.proto static vocabulary = iconsVocabulary
  @E.proto static styleSheets = { icon: iconCSS }

  /** SIDE EFFECT:  the element's accessible name follows `label`. */
  @E.onChange("label", { writesDOMElement: true })
  protected onLabelChanged(label: string | undefined) {
    IconLabels.applyTo(this.domElement.internals, label)
  }

  render(): JSX.Element {
    return (
      <span class={this.rootClass} part={this.partForName("icons")}>
        <slot />
      </span>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIIcons extends E.AttributeValues<typeof iconsVocabulary> {}
