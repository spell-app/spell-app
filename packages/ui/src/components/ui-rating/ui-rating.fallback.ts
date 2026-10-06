import { E, UIT } from "$/ui/core"
import { ratingVocabulary } from "./ui-rating.vocabulary.en"
import { DEFAULT_MAX, RADIO, RADIOGROUP } from "./ui-rating.types"

/****************
 * ### `RatingFallback`
 * The element's radio group, plain DOM:  `<fieldset class="ui … rating" part="rating" role="radiogroup">` with one
 * VISIBLE native radio per point, labelled by its number (`<label part="icon">`, no `icon` class:  no glyphs).
 * - Still a form control:  `change` pushes the chosen number into the host's form value and validity (`required`),
 *   sets `host.value`, and dispatches a composed `ui-change`.
 * - Starting value:  the host's `value` PROPERTY, else its attribute;  a fraction chooses nothing.
 * - Named by the host's `aria-*` (copied onto the group).
 ****************/
export class RatingFallback extends E.NativeFallback<typeof ratingVocabulary> {
  @E.proto static vocabulary = ratingVocabulary
  @E.proto static degraded = [
    "icon glyphs (numbered radios instead), colours, sizes, hover preview, partial icons",
    "`clearable`, Home / End, `ui-change` cannot be vetoed by re-setting `value`",
    "`:state(invalid)`, form reset of the value, labels from `<label for>`"
  ]

  /** Built radios, for `attached()`. */
  private radios: HTMLInputElement[] = []

  protected override build() {
    const host = this.host as ValueHost
    const max = Math.max(1, Math.floor(Number(this.attr("max-rating")) || DEFAULT_MAX))
    const value = host.value ?? Number(this.attr("value"))
    const name = `${host.localName}-fallback-${++RatingFallback.groups}`
    const isReadonly = this.flag("readonly")
    const labels = Array.from({ length: max }, (_, index) => {
      const point = index + 1
      const radio = this.create("input", {
        type: RADIO,
        name,
        value: String(point),
        part: CONTROL,
        required: this.flag("required")
      })
      radio.checked = point === value
      this.radios.push(radio)
      this.listen(radio, "click", (event) => {
        if (isReadonly) event.preventDefault()
      })
      this.listen(radio, "change", (event) => this.chose(point, event))
      return this.create("label", { part: UIT.ICON }, radio, ` ${point}`)
    })
    const group = this.create(
      "fieldset",
      {
        class: this.classes(),
        role: RADIOGROUP,
        disabled: this.flag("disabled"),
        "aria-readonly": isReadonly ? UIT.TRUE : undefined
      },
      ...labels
    )
    return [this.decorate(group, "rating")]
  }

  /** First form value + validity, which need the radios attached. */
  protected override attached() {
    this.sync()
  }

  /** The radio of `point` was chosen. */
  private chose(point: number, originalEvent: Event) {
    ;(this.host as ValueHost).value = point
    this.sync()
    const detail = { value: point, originalEvent }
    this.host.dispatchEvent(new CustomEvent(this.vocabulary.events[0].name, { bubbles: true, composed: true, detail }))
  }

  /** Push the chosen radio and the group's validity into the host's. */
  private sync() {
    const { formInternals, radios } = this
    if (!formInternals || !radios.length) return
    const chosen = radios.find((radio) => radio.checked)
    // `setFormValue()` takes `null` for "no value":  a platform boundary
    formInternals.setFormValue(this.attr("name") && chosen ? chosen.value : null)
    const [first] = radios
    if (first!.validity.valid) formInternals.setValidity({})
    else formInternals.setValidity(first!.validity, first!.validationMessage, first)
  }

  /**
   * Radio groups named so far, so each fallback's radios get a name of their own.
   * - Static:  page-wide, as radio names are (two fallbacks with one name would be one group).
   */
  private static groups = 0
}

/** The part of a rating host the fallback touches;  optional, the element may not have upgraded. */
type ValueHost = HTMLElement & {
  /** the rating, once set as a property */
  value?: number
}

/** Part of each native radio. */
const CONTROL = "control"
