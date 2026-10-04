import { NativeFallback, proto } from "$/ui/core"
import { STEPS } from "$/brand"

import { brandColorRangeVocabulary } from "./ui-brand-color-range.vocabulary.en"
import { ColorLadder } from "./ColorLadder"
import { BRAND_COLOR, CLASSES } from "./ui-brand-color-range.types"

/****************
 * ### `BrandColorRangeFallback`
 * The ladder without Solid:  the same `<ol>` of steps, each a plain coloured square (named, `role="img"`) and its
 * number, made from the host's attributes, so `ui-brand-color-range.css` lays it out unchanged.
 * - Colours come from `ColorLadder` (`#RRGGBB` only reaches `style`).
 ****************/
export class BrandColorRangeFallback extends NativeFallback<typeof brandColorRangeVocabulary> {
  @proto static vocabulary = brandColorRangeVocabulary

  @proto static degraded = ["the chips' labels, AA marks, copying and tips", "the `strip` look", "`ui-change`"]

  protected override build() {
    const ladder = ColorLadder.from({
      value: this.attr("value") ?? undefined,
      anchor: this.attr("anchor") ?? undefined,
      vibrancy: Number(this.attr("vibrancy") ?? 100),
      hueShift: Number(this.attr("hue-shift") ?? 0),
      name: this.attr("name") ?? undefined
    })
    if (!ladder) return []
    const steps = STEPS.map((step) => {
      const swatch = this.create("span", {
        role: "img",
        "aria-label": `${ladder.name(step)} ${ladder.scale[step]}`,
        style: `display: block; aspect-ratio: 1; border-radius: 8px; background-color: ${ladder.scale[step]}`
      })
      const number = this.create("span", { class: CLASSES.number, part: "number", "aria-hidden": "true" }, String(step))
      return this.create("li", { class: CLASSES.step, part: "step" }, swatch, number)
    })
    const list = this.create("ol", { class: this.classes(BRAND_COLOR) }, ...steps)
    return [this.decorate(list, "range")]
  }
}
