import type { JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { flagVocabulary } from "./UIFlag.vocabulary.en"
import { FlagCountry } from "./FlagCountry"

import flagCSS from "./UIFlag.css?inline"

/****************
 * ### `UIFlag`
 * The component behind `<ui-flag>`:  a country's flag, drawn as its Unicode emoji.
 *
 * - Its shadow DOM is one span:
 *   `<span class="ui [size] flag fr" part="flag" role="img" aria-label="France">🇫🇷</span>`.
 *   The element is `display: contents`:  the span IS the inline box, where Fomantic's `<i class="fr flag">` sat.
 *
 * - The glyph is the Unicode flag emoji of `country` (`FlagCountry`):  no sprite, no per-country CSS.
 * - The resolved code is also a class word after the noun (`fr`, `gb-eng`;  none when unknown):
 *   Fomantic's own `fr flag` grammar, which a page's own CSS may select on.
 * - The name:  `UI.i18n.displayName("region", …)` for a country, which follows `UI.i18n.locale`;
 *   the vocabulary's texts for the rainbow, pirate, England … flags.
 * - An unknown country:  an EMPTY box with no role (an unnamed `role=img` fails axe), which keeps its line box.
 ****************/
export class UIFlag extends E.UIComponent<typeof flagVocabulary> {
  @E.proto static vocabulary = flagVocabulary
  @E.proto static styleSheets = { flag: flagCSS }
  @E.proto static elementSetup = { delegatesFocus: false } satisfies Partial<E.ElementSetup>

  /** `country`, resolved. */
  @E.derived
  get resolvedCountry(): FlagCountry {
    return new FlagCountry(this.country)
  }

  /**
   * Accessible name, `undefined` when unknown.
   * - Computed on first read:  reads `UI.i18n`, which exists only once the runtime has loaded -- i.e.
   *   by first render.
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

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIFlag extends E.AttributeValues<typeof flagVocabulary> {}

/** The `Intl.DisplayNames` type of a country code. */
const REGION = "region"
