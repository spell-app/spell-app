import { NativeFallback, proto } from "$/ui/core"

import { ratingVocabulary } from "./ui-rating.vocabulary.en"

/****************
 * ### `RatingFallback`
 * The element's radio group, plain DOM:  `<fieldset class="ui … rating" part="rating" role="radiogroup">` with one
 * VISIBLE native radio per point, labelled by its number (`<label part="icon">`, no `icon` class:  no glyphs).
 * - Still a form control:  `change` pushes the chosen number into the host's form value and validity (`required`),
 *   sets `host.value`, and dispatches a composed `ui-change`.
 * - Starting value:  the host's `value` PROPERTY, else its attribute;  a fraction chooses nothing.
 * - Named by the host's `aria-*` (copied onto the group).
 ****************/
export class RatingFallback extends NativeFallback<typeof ratingVocabulary> {
  @proto static vocabulary = ratingVocabulary
  @proto static degraded = [
    "icon glyphs (numbered radios instead), colours, sizes, hover preview, partial icons",
    "`clearable`, Home / End, `ui-change` cannot be vetoed by re-setting `value`",
    "`:state(invalid)`, form reset of the value, labels from `<label for>`"
  ]

  /** Built radios, for `attached()`. */
  private radios: HTMLInputElement[] = []

  protected override build() {
    const host = this.host as RatingHost
    const max = Math.max(1, Math.floor(Number(this.attr("max-rating")) || DEFAULT_MAX))
    const value = host.value ?? Number(this.attr("value"))
    const name = `${host.localName}-fallback-${++counter}`
    const disabled = this.flag("disabled")
    const readonly = this.flag("readonly")
    const labels = Array.from({ length: max }, (_, index) => {
      const n = index + 1
      const radio = this.create("input", {
        type: "radio",
        name,
        value: String(n),
        part: "control",
        required: this.flag("required")
      })
      radio.checked = n === value
      this.radios.push(radio)
      this.listen(radio, "click", (event) => {
        if (readonly) event.preventDefault()
      })
      this.listen(radio, "change", (event) => this.chose(n, event))
      return this.create("label", { part: "icon" }, radio, ` ${n}`)
    })
    const group = this.create(
      "fieldset",
      { class: this.classes(), role: "radiogroup", disabled, "aria-readonly": readonly ? "true" : null },
      ...labels
    )
    this.decorate(group, "rating")
    return [group]
  }

  /** First form value + validity, which need the radios attached. */
  protected override attached() {
    this.sync()
  }

  /** Radio `n` was chosen. */
  private chose(n: number, originalEvent: Event) {
    ;(this.host as RatingHost).value = n
    this.sync()
    const detail = { value: n, originalEvent }
    this.host.dispatchEvent(new CustomEvent(this.vocabulary.events[0].name, { bubbles: true, composed: true, detail }))
  }

  /** Push the chosen radio and the group's validity into the host's. */
  private sync() {
    const { formInternals, radios } = this
    if (!formInternals || !radios.length) return
    const chosen = radios.find((radio) => radio.checked)
    formInternals.setFormValue(this.attr("name") && chosen ? chosen.value : null)
    const [first] = radios
    if (first!.validity.valid) formInternals.setValidity({})
    else formInternals.setValidity(first!.validity, first!.validationMessage, first)
  }
}

/** Fomantic's default `maxRating`. */
const DEFAULT_MAX = 4

/** Names of fallback radio groups. */
let counter = 0

/** The part of a rating host the fallback touches;  optional, the element may not have upgraded. */
type RatingHost = HTMLElement & { value?: number }
