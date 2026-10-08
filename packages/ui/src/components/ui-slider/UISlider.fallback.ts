import { E, UIT } from "$/ui/core"
import { sliderVocabulary } from "./UISlider.vocabulary.en"
import { DEFAULT_MAX, DEFAULT_MIN, DEFAULT_STEP } from "./UISlider.types"

/****************
 * ### `SliderFallback`
 * The native fallback of `<ui-slider>`:  what it shows when its component breaks,
 * so the value(s) are still chosen and submitted with the form.
 *
 * - Its shadow DOM:  native `<input type="range" part="thumb">`s in the root
 *   (`<div class="ui … slider" part="slider">`):  one, or two for a `range` (named "Minimum" / "Maximum",
 *   each bounding the other only on change).
 * - Still a form control.  `input` / `change`:
 *   - set the DOM element's form value (a range:  two entries under `name`)
 *   - set `domElement.value` / `domElement.end`
 *   - send a composed `ui-input` / `ui-change`.
 * - Its starting values are the DOM element's `value` / `end` PROPERTIES, else the attributes;
 *   `min` / `max` / `step` default to Fomantic's 0 / 20 / 1.
 * - Named by the DOM element's `aria-*` (copied onto each input).
 ****************/
export class SliderFallback extends E.NativeFallback<typeof sliderVocabulary> {
  @E.proto static vocabulary = sliderVocabulary
  @E.proto static degraded = [
    "Fomantic's track, fill and thumbs (the browser's range inputs instead), `labeled` / `ticked` labels",
    "a range's thumbs don't block each other while dragging, `vertical` / `reversed` layout, `smooth`",
    "`step-labels` (numbers are spoken), vetoing by re-setting `value`, form reset, translated thumb names"
  ]

  /** The native inputs, once built, for `attached()`. */
  private inputs: HTMLInputElement[] = []

  protected override build() {
    const domElement = this.domElement as SliderDOMElement
    const min = this.number("min", DEFAULT_MIN)
    const max = Math.max(min, this.number("max", DEFAULT_MAX))
    const isRange = this.flag("range")
    const starts = [domElement.value ?? this.number("value", min), domElement.end ?? this.number("end", max)]
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
    // the root takes no `aria-*`:  the inputs carry the DOM element's name
    return [this.create("div", { class: this.classes(), part: ROOT_PART }, ...this.inputs)]
  }

  /** The first form value, which needs the inputs built. */
  protected override attached() {
    this.sync()
  }

  /** An input moved:  keep a range in order, update the DOM element, send event `name`. */
  private changed(originalEvent: Event, name: E.EventName<typeof sliderVocabulary>) {
    const [first, second] = this.inputs
    if (second && Number(first!.value) > Number(second.value)) {
      if (originalEvent.target === first) first!.value = second.value
      else second.value = first!.value
    }
    const domElement = this.domElement as SliderDOMElement
    domElement.value = Number(first!.value)
    if (second) domElement.end = Number(second.value)
    this.sync()
    const detail = second
      ? { value: domElement.value, end: domElement.end, originalEvent }
      : { value: domElement.value, originalEvent }
    domElement.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true, detail }))
  }

  /** Set the DOM element's form value to the value(s). */
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

  /** The DOM element's attribute `name` as a number, else `fallback`. */
  private number(name: E.AttributeNameOf<typeof sliderVocabulary>, fallback: number): number {
    const value = Number(this.attr(name) ?? Number.NaN)
    return Number.isFinite(value) ? value : fallback
  }
}

/** What the fallback reads and writes of the DOM element:  all optional, the element may not have upgraded. */
type SliderDOMElement = HTMLElement & {
  /** the (first) thumb's value, once set as a property */
  value?: number
  /** a range's second thumb's value, once set as a property */
  end?: number
}

/** The root's part. */
const ROOT_PART = "slider"

/** The `type` of each native thumb. */
const RANGE = "range"

/** The `step` of a slider whose step is `0`:  any value. */
const ANY = "any"

/** A range's thumb names, in English:  a failed render can't count on the runtime's translations. */
const THUMB_NAMES = (["sliderMinimum", "sliderMaximum"] as const).map(
  (key) => sliderVocabulary.texts.find((text) => text.key === key)!.text
)
