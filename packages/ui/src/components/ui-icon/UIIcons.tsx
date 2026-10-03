import type { JSX } from "@solidjs/web"

import { proto, UIElement } from "$/ui/core"

import { iconsVocabulary } from "./ui-icons.vocabulary.en"

import iconCSS from "./ui-icon.css?inline"

/****************
 * ### `<ui-icons>`
 * Several icons stacked into one glyph:  `<span class="ui … icons" part="icons"><slot></slot></span>`.
 * - Owns `icon` (`ownsParts`):  each child `<ui-icon>` sets `:state(in-icons)` and positions its own root.
 * - Accessible name as for `<ui-icon>`:  `label` => one `role=img` for the combined glyph, else hidden.
 ****************/
export class UIIcons extends UIElement<typeof iconsVocabulary> {
  @proto static vocabulary = iconsVocabulary
  @proto static styles = { icon: iconCSS }

  constructor(...args: ConstructorParameters<typeof UIElement>) {
    super(...args)
    const { internals } = this.host
    this.hostEffect(
      () => this.attrs.label,
      (label) => {
        internals.role = label ? "img" : null
        internals.ariaLabel = label ?? null
        internals.ariaHidden = label ? null : "true"
      }
    )
  }

  render(): JSX.Element {
    return (
      <span class={this.classes()} part={this.part("icons")}>
        <slot />
      </span>
    )
  }
}
