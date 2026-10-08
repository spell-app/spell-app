import { E, UIT } from "$/ui/core"
import { ratingVocabulary } from "./UIRating.en"

/****************
 * ### `RatingFallback`
 * The native fallback of `<ui-rating>`:  what it shows when its component breaks,
 * so the rating is still chosen, validated and submitted with the form.
 *
 * - Its shadow DOM:  the radio group as plain DOM, `<fieldset class="ui … rating" part="rating" role="radiogroup">`,
 *   with one VISIBLE native radio per point, labelled by its number
 *   (`<label part="icon">`, no `icon` class:  no glyphs).
 * - Still a form control.  `change`:
 *   - sets the DOM element's form value to the chosen number, and its validity (`required`)
 *   - sets `domElement.value`
 *   - sends a composed `ui-change`.
 * - Its starting value is the DOM element's `value` PROPERTY, else its attribute;  a fraction chooses nothing.
 * - Named by the DOM element's `aria-*` (copied onto the group).
 ****************/
export class RatingFallback extends E.NativeFallback<typeof ratingVocabulary> {
  @E.proto static vocabulary = ratingVocabulary
  @E.proto static degraded = [
    "icon glyphs (numbered radios instead), colours, sizes, hover preview, partial icons",
    "`clearable`, Home / End, `ui-change` cannot be vetoed by re-setting `value`",
    "`:state(invalid)`, form reset of the value, labels from `<label for>`"
  ]

  /** The native radios, once built, for `attached()`. */
  private radios: HTMLInputElement[] = []

  protected override build() {
    const domElement = this.domElement as RatingDOMElement
    const max = Math.max(1, Math.floor(Number(this.attr("max-rating")) || DEFAULT_MAX))
    const value = domElement.value ?? Number(this.attr("value"))
    const name = `${domElement.localName}-fallback-${++RatingFallback.groups}`
    const isReadonly = this.flag("readonly")
    const labels = Array.from({ length: max }, (_, index) => {
      const point = index + 1
      const radio = this.create("input", {
        type: "radio",
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
        role: "radiogroup",
        disabled: this.flag("disabled"),
        "aria-readonly": isReadonly ? "true" : undefined
      },
      ...labels
    )
    return [this.decorate(group, "rating")]
  }

  /** The first form value and validity, which need the radios attached. */
  protected override attached() {
    this.sync()
  }

  /** The radio of `point` was chosen. */
  private chose(point: number, originalEvent: Event) {
    ;(this.domElement as RatingDOMElement).value = point
    this.sync()
    const detail = { value: point, originalEvent }
    this.domElement.dispatchEvent(
      new CustomEvent(this.vocabulary.events[0].name, { bubbles: true, composed: true, detail })
    )
  }

  /** Copy the chosen radio and the group's validity onto the DOM element. */
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
   * The radio groups named so far, so each fallback's radios get a name of their own.
   * - Static:  page-wide, as radio names are (two fallbacks with one name would be one group).
   */
  private static groups = 0
}

/** What the fallback reads and writes of the DOM element:  `value` is optional, the element may not have upgraded. */
type RatingDOMElement = HTMLElement & {
  /** the rating, once set as a property */
  value?: number
}

/**
 * Fomantic's default `maxRating`:  how many icons when `max-rating` is unset.
 * - The component reads it too (`UIRating`):  a family constant of its own, not a one-line types file.
 */
export const DEFAULT_MAX = 4

/** The part of each native radio. */
const CONTROL = "control"
