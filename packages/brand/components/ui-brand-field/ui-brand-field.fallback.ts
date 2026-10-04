import { NativeFallback, proto } from "$/ui/core"

import { brandFieldVocabulary } from "./ui-brand-field.vocabulary.en"
import { BRAND, CLASSES } from "./ui-brand-field.types"

/****************
 * ### `BrandFieldFallback`
 * The element's markup without Solid:  the label row (label, actions, value), the control, help and error text, as
 * plain DOM, so `ui-brand-field.css` lays it out unchanged.
 ****************/
export class BrandFieldFallback extends NativeFallback<typeof brandFieldVocabulary> {
  @proto static vocabulary = brandFieldVocabulary

  @proto static degraded = ["the info tip", "`<ui-form>`'s messages (`showErrors()`)", "naming the control"]

  protected override build() {
    const label = this.create(
      "span",
      { class: CLASSES.label, part: "label" },
      this.namedSlot("label", this.attr("label"))
    )
    const actions = this.create("span", { class: CLASSES.actions, part: "actions" }, this.namedSlot("actions"))
    const value = this.create(
      "span",
      { class: CLASSES.value, part: "value" },
      this.namedSlot("value", this.attr("value"))
    )
    const row = this.create("div", { class: CLASSES.row, part: "row" }, label, actions, value)
    const control = this.create("div", { class: CLASSES.control, part: "control" }, this.slot())
    const help = this.create("div", { class: CLASSES.help, part: "help" }, this.namedSlot("help", this.attr("help")))
    const children: Node[] = [row, control, help]
    const error = this.attr("error")
    if (error) children.push(this.create("div", { class: CLASSES.error, part: "error", role: "alert" }, error))
    const root = this.create("div", { class: this.classes(BRAND), inert: this.flag("disabled") }, ...children)
    return [this.decorate(root, "field")]
  }

  /** A `<slot name>`, with `fallback` text shown while nothing is slotted. */
  private namedSlot(name: string, fallback?: string | null): HTMLSlotElement {
    const slot = this.slot(fallback)
    slot.name = name
    return slot
  }
}
