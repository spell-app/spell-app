import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { IconGlyph, proto, UIElement, UIT } from "$/ui/core"

import { dividerVocabulary } from "./ui-divider.vocabulary.en"
import { DividerFallback } from "./ui-divider.fallback"
import { SEPARATOR, VERTICAL } from "./ui-divider.types"

import dividerCSS from "./ui-divider.css?inline"

/****************
 * ### `<ui-divider>`
 * A divider:  `<div class="ui … divider" role="separator" part="divider">` holding the `icon` shorthand's box,
 * then the default slot for text.
 * - `role="separator"`, not `<hr>`:  a horizontal / vertical divider carries text, which `<hr>` can't hold;
 *   `aria-orientation="vertical"` for `vertical`;  a `hidden` divider is `role="none"` (spacing only).
 * - `hidden` is property `dividerHidden` (the vocabulary's `property`):  `hidden` is the host's own boolean.  The
 *   ATTRIBUTE keeps its name;  `ui-divider.css`'s `:host([hidden]) { display: contents }` overrides the UA's
 *   `display: none`, so a hidden divider keeps its spacing.
 ****************/
export class UIDivider extends UIElement<typeof dividerVocabulary> {
  @proto static vocabulary = dividerVocabulary
  @proto static styles = { divider: dividerCSS }
  @proto static Fallback = DividerFallback

  /** Glyph of the `icon` shorthand. */
  readonly glyph = new IconGlyph(this, () => this.attrs.icon)

  render(): JSX.Element {
    return (
      <div
        class={this.classes()}
        role={this.attrs.hidden ? UIT.NONE : SEPARATOR}
        aria-orientation={this.attrs.vertical && !this.attrs.hidden ? VERTICAL : undefined}
        part={this.part("divider")}
      >
        <Show when={this.attrs.icon}>
          <span class={UIT.ICON} part={this.part("icon")}>
            {this.glyph.svg()}
          </span>
        </Show>
        <slot />
      </div>
    )
  }
}
