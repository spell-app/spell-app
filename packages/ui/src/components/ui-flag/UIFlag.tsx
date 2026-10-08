import type { JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { flagVocabulary } from "./ui-flag.vocabulary.en"
import { FlagCountry } from "./FlagCountry"
import { FlagFallback } from "./ui-flag.fallback"
import { REGION } from "./ui-flag.types"

import flagCSS from "./ui-flag.css?inline"

/****************
 * ### `<ui-flag>`
 * A country flag:  `<span class="ui [size] flag fr" part="flag" role="img" aria-label="France">🇫🇷</span>`.
 * - The glyph is the Unicode flag emoji of `country` (`FlagCountry`);  no sprite, no per-country CSS.
 * - The resolved code is also a class word after the noun (`fr`, `gb-eng`;  none when unknown):  Fomantic's own
 *   `fr flag` grammar, which a page's own CSS may select on.
 * - Name:  `UI.i18n.displayName("region", …)` for a country, which follows `UI.i18n.locale`;  the vocabulary's
 *   texts for the rainbow, pirate, England ... flags.
 * - Unknown country:  an EMPTY root with no role (an unnamed `role=img` fails axe), which keeps its line box.
 * - Host is `display: contents`:  the span IS the inline box, where Fomantic's `<i class="fr flag">` sat.
 ****************/
export class UIFlag extends E.UIElement<typeof flagVocabulary> {
  @E.proto static vocabulary = flagVocabulary
  @E.proto static styleSheets = { flag: flagCSS }
  @E.proto static elementSetup = { Fallback: FlagFallback, delegatesFocus: false }

  /** `country` resolved. */
  @E.derived
  get resolvedCountry(): FlagCountry {
    return new FlagCountry(this.country)
  }

  /**
   * Accessible name, `undefined` when unknown.
   * - Computed on first read:  reads `UI.i18n`, which exists only once the runtime has loaded -- i.e. by first
   *   render.
   */
  @E.derived
  get accessibleName(): string | undefined {
    const { textKey, region } = this.resolvedCountry
    if (textKey) return this.translationForKey(textKey as E.TextKey<typeof flagVocabulary>)
    return region ? UI.i18n.displayName(REGION, region) : undefined
  }

  /** The resolved code as a class word (Fomantic's `fr flag`), for a page's own CSS. */
  protected override get extraClasses(): string | undefined {
    return this.resolvedCountry.code || undefined
  }

  render(): JSX.Element {
    return (
      <span
        class={this.rootClasses}
        part={this.partForName("flag")}
        role={this.accessibleName ? UIT.IMG : undefined}
        aria-label={this.accessibleName}
      >
        {this.resolvedCountry.emoji}
      </span>
    )
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UIFlag extends E.AttributeValues<typeof flagVocabulary> {}
