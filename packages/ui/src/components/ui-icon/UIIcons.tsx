import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { iconsVocabulary } from "./ui-icons.vocabulary.en"
import { IconLabels } from "./ui-icon.types"

import iconCSS from "./ui-icon.css?inline"

/****************
 * ### `<ui-icons>`
 * Several icons stacked into one glyph:  `<span class="ui … icons" part="icons"><slot></slot></span>`.
 * - Owns `icon` (`ownsParts`):  each child `<ui-icon>` sets `:state(in-icons)` and positions its own root.
 * - Accessible name as for `<ui-icon>` (`IconLabels`):  `label` => one `role=img` for the combined glyph, else
 *   hidden.
 * - NOTE: no native fallback of its own (`@proto static Fallback`):  a render that throws shows nothing.
 ****************/
export class UIIcons extends E.UIElement<typeof iconsVocabulary> {
  @E.proto static vocabulary = iconsVocabulary
  @E.proto static styles = { icon: iconCSS }

  constructor(...args: ConstructorParameters<typeof E.UIElement>) {
    super(...args)
    const { internals } = this.host
    // SIDE EFFECT:  the host's accessible name follows `label`
    this.hostEffect(
      () => this.attrs.label,
      (label) => IconLabels.applyTo(internals, label)
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
