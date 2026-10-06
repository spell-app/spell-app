import { createMemo } from "solid-js"
import type { JSX } from "@solidjs/web"

import { IconGlyph, proto, UIElement, UIT } from "$/ui/core"

import { brandPhoneVocabulary } from "./ui-brand-phone.vocabulary.en"
import { BrandPhoneFallback } from "./ui-brand-phone.fallback"
import { CLASSES, DEFAULT_TIME, STATUS_ICONS, type BrandPhoneVocabulary } from "./ui-brand-phone.types"

import phoneCSS from "./ui-brand-phone.css?inline"

/****************
 * ### `<ui-brand-phone>`
 * A phone frame around live app content, as the Spell App's Build screen previews the app it builds:
 * `<section part="phone">` > the status bar (`.status`:  clock, signal / wifi / battery) + the default slot.
 * - The app is the element's LIGHT children:  the page's own markup and elements, styled and wired by the page.
 * - A region named `label` (default `App preview`);  `label=""`:  a plain frame.  The status bar is decoration:
 *   `aria-hidden`.
 * - `dimmed` fades it while the app is being built, and marks the region `aria-busy`.
 * - Nothing in the frame takes focus:  Tab goes straight to the app's controls.
 ****************/
export class UIBrandPhone extends UIElement<BrandPhoneVocabulary> {
  @proto static vocabulary = brandPhoneVocabulary
  @proto static styles = { phone: phoneCSS }
  @proto static Fallback = BrandPhoneFallback
  @proto static delegatesFocus = false

  /** The status bar's icons. */
  readonly signal = new IconGlyph({ owner: this, name: () => STATUS_ICONS.signal })
  readonly wifi = new IconGlyph({ owner: this, name: () => STATUS_ICONS.wifi })
  readonly battery = new IconGlyph({ owner: this, name: () => STATUS_ICONS.battery })

  /** The region's accessible name:  `label`, else `App preview`;  `""`:  none (no region). */
  readonly name = createMemo(() => this.attrs.label ?? this.text("appPreview"))

  render(): JSX.Element {
    return (
      <section
        class={this.classes()}
        part={this.part("phone")}
        aria-label={this.name() || undefined}
        aria-busy={this.attrs.dimmed ? UIT.TRUE : undefined}
      >
        <div class={CLASSES.status} part={this.part("status")} aria-hidden={UIT.TRUE}>
          <span class={CLASSES.time} part={this.part("time")}>
            {this.attrs.time ?? DEFAULT_TIME}
          </span>
          <span class={CLASSES.icons} part={this.part("icons")}>
            {this.signal.svg()}
            {this.wifi.svg()}
            {this.battery.svg()}
          </span>
        </div>
        <slot />
      </section>
    )
  }
}
