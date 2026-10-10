import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { dividerVocabulary } from "./UIDivider.en"

import dividerCSS from "./UIDivider.css?inline"

/****************
 * ### `UIDivider`
 * The component behind `<ui-divider>`:  a line that splits content into groups,
 * optionally with text or an icon on it.
 *
 * - Its shadow DOM is one box, `<div class="ui … divider" role="separator" part="divider">`,
 *   holding the `icon` shorthand's box, then the default slot for the text.
 *
 * - A `role="separator"` box, not an `<hr>`:
 *   a horizontal or vertical divider carries text, which an `<hr>` can't hold.
 *   - `aria-orientation="vertical"` for a `vertical` divider.
 *   - A `spacer` divider is `role="none"`:  it keeps the spacing, without the line.
 *
 * - `spacer` is Fomantic's `hidden` divider:  its class word is still `hidden`.
 *   - Renamed because `hidden` hides every element, as the platform's does (epic `spell-element`, P12).
 ****************/
export class UIDivider extends E.UIComponent<typeof dividerVocabulary> {
  @E.proto static vocabulary = dividerVocabulary
  @E.protoMerged static elementSetup = { styleSheets: { divider: dividerCSS } } satisfies Partial<E.ElementSetup>

  /** The glyph of the `icon` shorthand. */
  readonly iconGlyph = new E.IconGlyph({ owner: this, name: () => this.icon })

  render(): JSX.Element {
    return (
      <div
        class={this.rootClass}
        role={this.spacer ? "none" : "separator"}
        aria-orientation={this.vertical && !this.spacer ? "vertical" : undefined}
        part={this.partForName("divider")}
      >
        <Show when={this.icon}>
          <span class={UIT.ICON} part={this.partForName("icon")}>
            {this.iconGlyph.svg}
          </span>
        </Show>
        <slot />
      </div>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIDivider extends E.AttributeValues<typeof dividerVocabulary> {}
