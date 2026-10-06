import { E, UIT } from "$/ui/core"
import { iconVocabulary } from "./ui-icon.vocabulary.en"

/****************
 * ### `IconFallback`
 * The icon box without a glyph:  `<span part="icon" class="ui ... icon">`.
 * - With `label`:  `role="img"` + `aria-label`, plus the label as visually hidden text.
 * - Without:  empty and `aria-hidden`, a decorative box that keeps its size so layout doesn't jump.
 ****************/
export class IconFallback extends E.NativeFallback<typeof iconVocabulary> {
  @E.proto static vocabulary = iconVocabulary
  @E.proto static degraded = ["the glyph itself (the SVG needs the icon data)"]

  protected override build() {
    const label = this.attr("label")
    const box = this.create("span", {
      class: this.classes(),
      role: label ? UIT.IMG : undefined,
      [UIT.ARIA_LABEL]: label,
      "aria-hidden": label ? undefined : UIT.TRUE
    })
    this.decorate(box, "icon")
    if (label) {
      const text = this.create("span", {}, label)
      // Visually hidden, still selectable / findable.
      Object.assign(text.style, {
        position: "absolute",
        width: "1px",
        height: "1px",
        overflow: "hidden",
        clip: "rect(0 0 0 0)",
        whiteSpace: "nowrap"
      })
      box.append(text)
    }
    return [box]
  }
}
