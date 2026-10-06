import { E, UIT } from "$/ui/core"
import { sliderVocabulary } from "./ui-slider.vocabulary.en"
import { DEFAULT_MAX, DEFAULT_MIN, DEFAULT_STEP } from "./ui-slider.types"

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
export class SliderFallback extends E.NativeFallback<typeof sliderVocabulary> {
  @E.proto static vocabulary = sliderVocabulary
  @E.proto static degraded = [
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
    const isRange = this.flag("range")
    const starts = [host.value ?? this.number("value", min), host.end ?? this.number("end", max)]
    for (let index = 0; index < (isRange ? 2 : 1); index++) {
      const input = this.create("input", {
        type: RANGE,
        min: String(min),
        max: String(max),
        step: String(this.number("step", DEFAULT_STEP) || ANY),
        disabled: this.flag("disabled"),
        "aria-readonly": this.flag("readonly") ? UIT.TRUE : undefined
      })
      this.decorate(input, "thumb")
      if (isRange) input.setAttribute(UIT.ARIA_LABEL, THUMB_NAMES[index]!)
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
    // the root takes no `aria-*`:  the inputs carry the host's name
    return [this.create("div", { class: this.classes(), part: ROOT_PART }, ...this.inputs)]
  }

  /** First form value, which needs the inputs built. */
  protected override attached() {
    this.sync()
  }

  /** An input moved:  keep a range ordered, update the host, dispatch `name`. */
  private changed(originalEvent: Event, name: E.EventName<typeof sliderVocabulary>) {
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
    // `setFormValue()` takes `null` for "no value":  a platform boundary
    if (!name) return this.formInternals.setFormValue(null)
    if (this.inputs.length < 2) return this.formInternals.setFormValue(this.inputs[0]!.value)
    const data = new FormData()
    for (const input of this.inputs) data.append(name, input.value)
    this.formInternals.setFormValue(data)
  }

  /** Host attribute `name` as a number, else `fallback`. */
  private number(name: E.AttributeNameOf<typeof sliderVocabulary>, fallback: number): number {
    const value = Number(this.attr(name) ?? Number.NaN)
    return Number.isFinite(value) ? value : fallback
  }
}

/** The part of a slider host the fallback touches;  optional, the element may not have upgraded. */
type SliderHost = HTMLElement & {
  /** the (first) thumb's value, once set as a property */
  value?: number
  /** a range's second thumb's value, once set as a property */
  end?: number
}

/** The root's part. */
const ROOT_PART = "slider"

/** `type` of each native thumb. */
const RANGE = "range"

/** `step` of a slider whose step is `0`:  any value. */
const ANY = "any"

/** A range's thumb names, in English:  a failed render can't count on the runtime's translations. */
const THUMB_NAMES = (["sliderMinimum", "sliderMaximum"] as const).map(
  (key) => sliderVocabulary.texts.find((text) => text.key === key)!.text
)
