import { NativeFallback, proto } from "$/core"

import { sliderVocabulary } from "./slider.vocabulary.en"

/****************
 * ### `SliderFallback`
 * Native `<input type="range" part="thumb">`s in the element's root (`<div class="ui … slider" part="slider">`):
 * one, or two for a `range` (named "Minimum" / "Maximum", each bounding the other only on change).
 * - Still a form control:  `input` / `change` push the value(s) into the host's form value (a range:  two entries
 *   under `name`), set `host.value` / `host.end`, and dispatch composed `ui-input` / `ui-change`.
 * - Starting values:  the host's `value` / `end` PROPERTIES, else the attributes;  `min` / `max` / `step` default to
 *   Fomantic's 0 / 20 / 1.
 * - Named by the host's `aria-*` (copied onto each input).
 ****************/
export class SliderFallback extends NativeFallback<typeof sliderVocabulary> {
  @proto static vocabulary = sliderVocabulary
  @proto static degraded = [
    "Fomantic's track, fill and thumbs (the browser's range inputs instead), `labeled` / `ticked` labels",
    "a range's thumbs don't block each other while dragging, `vertical` / `reversed` layout, `smooth`",
    "`step-labels` (numbers are spoken), vetoing by re-setting `value`, form reset, translated thumb names"
  ]

  /** Built inputs, for `attached()`. */
  private inputs: HTMLInputElement[] = []

  protected override build() {
    const host = this.host as SliderHost
    const min = this.number("min", DEFAULT_MIN)
    const max = Math.max(min, this.number("max", DEFAULT_MAX))
    const range = this.flag("range")
    const disabled = this.flag("disabled")
    const starts = [host.value ?? this.number("value", min), host.end ?? this.number("end", max)]
    const names = ["Minimum", "Maximum"]
    for (let index = 0; index < (range ? 2 : 1); index++) {
      const input = this.create("input", {
        type: "range",
        min: String(min),
        max: String(max),
        step: String(this.number("step", DEFAULT_STEP) || "any"),
        disabled,
        "aria-readonly": this.flag("readonly") ? "true" : null
      })
      this.decorate(input, "thumb")
      if (range) input.setAttribute("aria-label", names[index]!)
      input.value = String(starts[index])
      this.listen(input, "input", (event) => this.changed(event, "ui-input"))
      this.listen(input, "change", (event) => this.changed(event, "ui-change"))
      this.listen(input, "keydown", (event: KeyboardEvent) => {
        if (this.flag("readonly")) event.preventDefault()
      })
      this.listen(input, "pointerdown", (event) => {
        if (this.flag("readonly")) event.preventDefault()
      })
      this.inputs.push(input)
    }
    return [this.create("div", { class: this.classes(), part: "slider" }, ...this.inputs)]
  }

  /** First form value, which needs the inputs built. */
  protected override attached() {
    this.sync()
  }

  /** An input moved:  keep a range ordered, update the host, dispatch `name`. */
  private changed(originalEvent: Event, name: string) {
    const [first, second] = this.inputs
    if (second && Number(first!.value) > Number(second.value)) {
      if (originalEvent.target === first) first!.value = second.value
      else second.value = first!.value
    }
    const host = this.host as SliderHost
    host.value = Number(first!.value)
    if (second) host.end = Number(second.value)
    this.sync()
    const detail = second ? { value: host.value, end: host.end, originalEvent } : { value: host.value, originalEvent }
    this.host.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true, detail }))
  }

  /** Push the value(s) into the host's form value. */
  private sync() {
    const name = this.attr("name")
    if (!this.formInternals) return
    if (!name) return this.formInternals.setFormValue(null)
    if (this.inputs.length < 2) return this.formInternals.setFormValue(this.inputs[0]!.value)
    const data = new FormData()
    for (const input of this.inputs) data.append(name, input.value)
    this.formInternals.setFormValue(data)
  }

  /** Host attribute `name` as a number, else `fallback`. */
  private number(name: "min" | "max" | "step" | "value" | "end", fallback: number): number {
    const value = Number(this.attr(name) ?? Number.NaN)
    return Number.isFinite(value) ? value : fallback
  }
}

/** Fomantic's defaults. */
const DEFAULT_MIN = 0
const DEFAULT_MAX = 20
const DEFAULT_STEP = 1

/** The part of a slider host the fallback touches;  optional, the element may not have upgraded. */
type SliderHost = HTMLElement & { value?: number; end?: number }
