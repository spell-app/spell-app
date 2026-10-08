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
 * - NOTE: no native fallback of its own (`elementSetup.Fallback`):  a render that throws shows nothing.
 ****************/
export class UIIcons extends E.UIElement<typeof iconsVocabulary> {
  @E.proto static vocabulary = iconsVocabulary
  @E.proto static styleSheets = { icon: iconCSS }

  /** SIDE EFFECT:  the host's accessible name follows `label`. */
  @E.onChange("label", { writesHost: true })
  protected onLabelChanged(label: string | undefined) {
    IconLabels.applyTo(this.host.internals, label)
  }

  render(): JSX.Element {
    return (
      <span class={this.rootClasses} part={this.partForName("icons")}>
        <slot />
      </span>
    )
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UIIcons extends E.AttributeValues<typeof iconsVocabulary> {}
