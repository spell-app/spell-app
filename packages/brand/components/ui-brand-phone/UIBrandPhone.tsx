import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { brandPhoneVocabulary } from "./UIBrandPhone.en"

import phoneCSS from "./UIBrandPhone.css?inline"

/****************
 * ### `UIBrandPhone`
 * The component behind `<ui-brand-phone>`:  a phone frame around live app content,
 * as the Spell App's Build screen previews the app it builds.
 *
 * - Its shadow DOM is `<section part="phone">`,
 *   holding the status bar (`.status`:  clock, signal / wifi / battery) and the default slot.
 * - The app is the element's LIGHT children:  the page's own markup and elements, styled and wired by the page.
 * - A region named `label` (default `App preview`);  `label=""`:  a plain frame.
 *   The status bar is decoration:  `aria-hidden`.
 * - `dimmed` fades it while the app is being built, and marks the region `aria-busy`.
 * - Nothing in the frame takes focus:  Tab goes straight to the app's controls.
 ****************/
export class UIBrandPhone extends E.UIComponent<typeof brandPhoneVocabulary> {
  @E.proto static vocabulary = brandPhoneVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { phone: phoneCSS },
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  /** The status bar's icons. */
  readonly signal = new E.IconGlyph({ owner: this, name: () => STATUS_ICONS.signal })
  readonly wifi = new E.IconGlyph({ owner: this, name: () => STATUS_ICONS.wifi })
  readonly battery = new E.IconGlyph({ owner: this, name: () => STATUS_ICONS.battery })

  /** The region's accessible name:  `label`, else `App preview`;  `""`:  none (no region). */
  get name(): string {
    return this.label ?? this.translationForKey("appPreview")
  }

  render(): JSX.Element {
    return (
      <section
        class={this.rootClass}
        part={this.partForName("phone")}
        aria-label={this.name || undefined}
        aria-busy={this.dimmed ? "true" : undefined}
      >
        <div class={CLASSES.status} part={this.partForName("status")} aria-hidden="true">
          <span class={CLASSES.time} part={this.partForName("time")}>
            {this.time ?? DEFAULT_TIME}
          </span>
          <span class={CLASSES.icons} part={this.partForName("icons")}>
            {this.signal.svg}
            {this.wifi.svg}
            {this.battery.svg}
          </span>
        </div>
        <slot />
      </section>
    )
  }
}

export interface UIBrandPhone extends E.AttributeValues<typeof brandPhoneVocabulary> {}

/** The status bar's clock when `time` is absent:  Apple's keynote time. */
const DEFAULT_TIME = "9:41"

/** The status bar's icons, left to right (Font Awesome 7's names, in Spell UI's default pack). */
const STATUS_ICONS = {
  signal: "signal",
  wifi: "wifi",
  battery: "battery full"
} as const

/** Shadow classes, one per part (the vocabulary's part names). */
const CLASSES = {
  status: "status",
  time: "time",
  icons: "icons"
} as const
