import { NativeFallback, proto } from "$/ui/core"
import { Palette } from "$/brand"

import { brandColorPickerVocabulary } from "./UIBrandColorPicker.vocabulary.en"
import { BRAND_COLOR, DEFAULT_VALUE } from "./UIBrandColorPicker.types"

/****************
 * ### `BrandColorPickerFallback`
 * The native fallback of `<ui-brand-color-picker>`:  what it shows when its component breaks,
 * so a colour is still picked and submitted with the form.
 *
 * - Its shadow DOM:  the browser's own colour input, `<input type="color" part="rgb">`,
 *   in the root (`<div class="picker brand color" part="picker">`).
 * - Still a form control.  `input` / `change`:
 *   - set `domElement.value` (`#RRGGBB`), and the DOM element's form value
 *   - send a composed `ui-input` / `ui-change`.
 * - Its starting value is the DOM element's `value` PROPERTY, else the attribute (read as the component reads it),
 *   else `#8E96B5`.
 * - Named by `label` (else "Colour"), and the DOM element's `aria-*`.
 ****************/
export class BrandColorPickerFallback extends NativeFallback<typeof brandColorPickerVocabulary> {
  @proto static vocabulary = brandColorPickerVocabulary

  @proto static degraded = [
    "the HSL square and the hue slider (the browser's colour input instead)",
    "the HSL, RGB and OKLCH rows and their copy buttons, the head row, the slots",
    "vetoing by re-setting `value`, form reset"
  ]

  /** The colour input, for `attached()`. */
  private input?: HTMLInputElement

  protected override build() {
    const domElement = this.domElement as HTMLElement & { value?: unknown }
    const start = typeof domElement.value === "string" ? domElement.value : (this.attr("value") ?? "")
    const input = this.create("input", {
      type: "color",
      disabled: this.flag("disabled"),
      "aria-label": this.attr("label") ?? "Colour"
    })
    this.decorate(input, "rgb")
    // a colour input takes lower-case `#rrggbb` only
    input.value = (Palette.parse(start) ?? DEFAULT_VALUE).toLowerCase()
    this.listen(input, "input", (event) => this.changed(event, "ui-input"))
    this.listen(input, "change", (event) => this.changed(event, "ui-change"))
    this.input = input
    return [this.create("div", { class: this.classes(BRAND_COLOR), part: "picker" }, input)]
  }

  /** The first form value, which needs the input built. */
  protected override attached() {
    this.sync()
  }

  /** The input changed:  update the DOM element and its form value, and send event `name`. */
  private changed(originalEvent: Event, name: string) {
    const value = this.input!.value.toUpperCase()
    ;(this.domElement as HTMLElement & { value?: string }).value = value
    this.sync()
    this.domElement.dispatchEvent(
      new CustomEvent(name, { bubbles: true, composed: true, detail: { value, originalEvent } })
    )
  }

  /** Set the DOM element's form value to the colour. */
  private sync() {
    this.formInternals?.setFormValue(this.input!.value.toUpperCase())
  }
}
