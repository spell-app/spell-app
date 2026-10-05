import { NativeFallback, proto } from "$/ui/core"

import { brandLogoVocabulary } from "./ui-brand-logo.vocabulary.en"

/****************
 * ### `BrandLogoFallback`
 * The word "Spell" (or "Spell App") in the heading font:  the outlines need the element's script.
 ****************/
export class BrandLogoFallback extends NativeFallback<typeof brandLogoVocabulary> {
  @proto static vocabulary = brandLogoVocabulary

  @proto static degraded = ["the outlined hat mark and wordmark (the name shows as text)"]

  protected override build() {
    const name = this.attr("label") ?? (this.attr("variant") === "app" ? "Spell App" : "Spell")
    const text = this.create("span", { style: "font-family: var(--ui-font-family-heading); font-weight: 700" }, name)
    return [this.decorate(text, "logo")]
  }
}
