import { NativeFallback, proto } from "$/ui/core"
import { Palette } from "$/brand"

import { brandColorVocabulary } from "./ui-brand-color.vocabulary.en"
import { BRAND } from "./ui-brand-color.types"

/****************
 * ### `BrandColorFallback`
 * The chip without Solid:  a `<span role="img">` in the colour, named after `name` and the colour, so
 * `ui-brand-color.css` still draws the square.
 * - The colour is `Palette.parse()`d first:  only a `#RRGGBB` reaches the `style` attribute.
 ****************/
export class BrandColorFallback extends NativeFallback<typeof brandColorVocabulary> {
  @proto static vocabulary = brandColorVocabulary

  @proto static degraded = ["the label, AA mark and details tip", "copying", "being a choice of a set"]

  protected override build() {
    const hex = Palette.parse(this.attr("value") ?? "")
    const name = [this.attr("name"), hex ?? this.attr("value")].filter(Boolean).join(" ")
    const chip = this.create("span", {
      class: this.classes(BRAND),
      role: "img",
      "aria-label": name || null,
      style: hex ? `background-color: ${hex}` : null
    })
    return [this.decorate(chip, "chip")]
  }
}
