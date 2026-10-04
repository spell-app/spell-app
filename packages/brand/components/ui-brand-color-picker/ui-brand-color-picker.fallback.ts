import { NativeFallback, proto } from "$/ui/core"
import { Palette } from "$/brand"

import { brandColorPickerVocabulary } from "./ui-brand-color-picker.vocabulary.en"
import { BRAND_COLOR, DEFAULT_VALUE } from "./ui-brand-color-picker.types"

/****************
 * ### `BrandColorPickerFallback`
 * The browser's own colour input, `<input type="color" part="rgb">`, in the element's root
 * (`<div class="picker brand color" part="picker">`).
 * - Still a form control:  `input` / `change` set `host.value` (`#RRGGBB`), push it into the host's form value, and
 *   dispatch composed `ui-input` / `ui-change`.
 * - Starting value:  the host's `value` PROPERTY, else the attribute (read as the element reads it), else `#8E96B5`.
 * - Named by `label` (else "Colour"), and the host's `aria-*`.
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
    const host = this.host as HTMLElement & { value?: unknown }
    const start = typeof host.value === "string" ? host.value : (this.attr("value") ?? "")
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

  /** First form value, which needs the input built. */
  protected override attached() {
    this.sync()
  }

  /** The input changed:  update the host, its form value, dispatch `name`. */
  private changed(originalEvent: Event, name: string) {
    const value = this.input!.value.toUpperCase()
    ;(this.host as HTMLElement & { value?: string }).value = value
    this.sync()
    this.host.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true, detail: { value, originalEvent } }))
  }

  /** Push the colour into the host's form value. */
  private sync() {
    this.formInternals?.setFormValue(this.input!.value.toUpperCase())
  }
}
