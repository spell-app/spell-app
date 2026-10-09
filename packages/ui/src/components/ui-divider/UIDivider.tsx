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
 *   - A `hidden` divider is `role="none"`:  it keeps the spacing, without the line.
 *
 * - `hidden` is Fomantic's word for "the spacing without the line",
 *   so the attribute keeps its name, but its DOM property is `dividerHidden`:
 *   `hidden` is already every element's own boolean.
 *   `UIDivider.css` turns the browser's `[hidden] { display: none }` back into `display: contents`,
 *   so a hidden divider still takes up its space.
 ****************/
export class UIDivider extends E.UIComponent<typeof dividerVocabulary> {
  @E.proto static vocabulary = dividerVocabulary
  @E.proto static styleSheets = { divider: dividerCSS }

  /** The glyph of the `icon` shorthand. */
  readonly iconGlyph = new E.IconGlyph({ owner: this, name: () => this.icon })

  render(): JSX.Element {
    return (
      <div
        class={this.rootClass}
        role={this.hidden ? "none" : "separator"}
        aria-orientation={this.vertical && !this.hidden ? "vertical" : undefined}
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
