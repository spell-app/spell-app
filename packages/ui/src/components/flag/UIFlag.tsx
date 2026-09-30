import { createMemo } from "solid-js"
import type { JSX } from "@solidjs/web"

import { proto, UI, UIElement, type TextKey } from "$/core"

import { flagVocabulary } from "./flag.vocabulary.en"
import { FlagCountry } from "./FlagCountry"
import { FlagFallback } from "./flag.fallback"

import flagCSS from "./flag.css?inline"

/****************
 * ### `<ui-flag>`
 * A country flag:  `<span class="ui [size] flag" part="flag" role="img" aria-label="France">🇫🇷</span>`.
 * - The glyph is the Unicode flag emoji of `country` (`FlagCountry`);  no sprite, no per-country CSS.
 * - Name:  `UI.i18n.displayName("region", …)` for a country, which follows `UI.i18n.locale`;  the vocabulary's
 *   texts for the rainbow, pirate, England ... flags.
 * - Unknown country:  an EMPTY root with no role (an unnamed `role=img` fails axe), which keeps its line box.
 * - Host is `display: contents`:  the span IS the inline box, where Fomantic's `<i class="fr flag">` sat.
 ****************/
export class UIFlag extends UIElement<typeof flagVocabulary> {
  @proto static vocabulary = flagVocabulary
  @proto static styles = { flag: flagCSS }
  @proto static Fallback = FlagFallback
  @proto static delegatesFocus = false

  /** `country` resolved. */
  readonly country = createMemo(() => new FlagCountry(this.attrs.country))

  /**
   * Accessible name, `undefined` when unknown.
   * - `lazy`:  reads `UI.i18n`, which exists only once the runtime has loaded -- i.e. by first render.
   */
  readonly label = createMemo(
    () => {
      const { textKey, region } = this.country()
      if (textKey) return this.text(textKey as TextKey<typeof flagVocabulary>)
      return region ? UI.i18n.displayName(REGION, region) : undefined
    },
    { lazy: true }
  )

  render(): JSX.Element {
    return (
      <span
        class={this.classes()}
        part={this.part("flag")}
        role={this.label() ? IMG : undefined}
        aria-label={this.label()}
      >
        {this.country().emoji}
      </span>
    )
  }
}

/** `Intl.DisplayNames` type of a country code. */
const REGION = "region"

/** Role of a named flag:  a picture of its country. */
const IMG = "img"
