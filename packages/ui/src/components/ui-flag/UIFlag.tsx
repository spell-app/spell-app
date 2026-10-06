import { createMemo } from "solid-js"
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
 *   `fr flag` grammar, the hook a sprite theme selects on (`themes/famfamfam.css`).
 * - Name:  `UI.i18n.displayName("region", …)` for a country, which follows `UI.i18n.locale`;  the vocabulary's
 *   texts for the rainbow, pirate, England ... flags.
 * - Unknown country:  an EMPTY root with no role (an unnamed `role=img` fails axe), which keeps its line box.
 * - Host is `display: contents`:  the span IS the inline box, where Fomantic's `<i class="fr flag">` sat.
 ****************/
export class UIFlag extends E.UIElement<typeof flagVocabulary> {
  @E.proto static vocabulary = flagVocabulary
  @E.proto static styles = { flag: flagCSS }
  @E.proto static Fallback = FlagFallback
  @E.proto static delegatesFocus = false

  /** `country` resolved. */
  readonly country = createMemo(() => new FlagCountry(this.attrs.country))

  /**
   * Accessible name, `undefined` when unknown.
   * - `lazy`:  reads `UI.i18n`, which exists only once the runtime has loaded -- i.e. by first render.
   */
  readonly label = createMemo(
    () => {
      const { textKey, region } = this.country()
      if (textKey) return this.text(textKey as E.TextKey<typeof flagVocabulary>)
      return region ? UI.i18n.displayName(REGION, region) : undefined
    },
    { lazy: true }
  )

  /** The resolved code as a class word, for themes that draw flags from a sprite. */
  protected override extraClasses(): string | undefined {
    return this.country().code || undefined
  }

  render(): JSX.Element {
    return (
      <span
        class={this.classes()}
        part={this.part("flag")}
        role={this.label() ? UIT.IMG : undefined}
        aria-label={this.label()}
      >
        {this.country().emoji}
      </span>
    )
  }
}
