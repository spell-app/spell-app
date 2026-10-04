import { NativeFallback, proto } from "$/ui/core"

import { flagVocabulary } from "./ui-flag.vocabulary.en"
import { FlagCountry } from "./FlagCountry"

/****************
 * ### `FlagFallback`
 * The same `<span part="flag" class="ui ... flag <code>" role="img" aria-label>` + emoji as the element.
 * - Names a country with `Intl.DisplayNames` in the page language (`<html lang>`, else the browser's), and the
 *   non-country flags with the vocabulary's ENGLISH texts:  the runtime's translations may not be there.
 ****************/
export class FlagFallback extends NativeFallback<typeof flagVocabulary> {
  @proto static vocabulary = flagVocabulary
  @proto static degraded = ["translated names of the non-country flags (English only)"]

  protected override build() {
    const country = new FlagCountry(this.attr("country"))
    const label = this.label(country)
    const flag = this.create(
      "span",
      { class: this.classes(country.code || undefined), role: label ? "img" : null, "aria-label": label },
      country.emoji
    )
    return [this.decorate(flag, "flag")]
  }

  /** Name of `country`, or `null` when unknown. */
  private label(country: FlagCountry): string | null {
    if (country.textKey) return this.vocabulary.texts.find(({ key }) => key === country.textKey)?.text ?? null
    if (!country.region) return null
    const lang = this.host.ownerDocument.documentElement.lang || navigator.language
    try {
      return new Intl.DisplayNames([lang, "en"], { type: "region" }).of(country.region) ?? country.region
    } catch {
      return country.region
    }
  }
}
