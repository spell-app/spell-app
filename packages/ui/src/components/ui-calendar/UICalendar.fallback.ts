import { E, UIT } from "$/ui/core"
import { calendarVocabulary } from "./UICalendar.en"
import { DEFAULT_TYPE, type Vocabulary } from "./UICalendar.types"

/****************
 * ### `CalendarFallback`
 * The native fallback of `<ui-calendar>`:  what it shows when its component breaks,
 * so the date or time is still picked, validated and submitted with the form.
 *
 * - Its shadow DOM is the browser's own picker:
 *   `<div class="ui … calendar" part="calendar">` around `<div class="ui input" part="input">` and a native
 *   `<input part="control">` of the type that holds the same ISO value:
 *   `date`, `time`, `datetime-local` (for `datetime`), `month`, or a `number` for a `year`.
 * - Still a form control:
 *   - every `input` / `change` copies the value and the native validity (`required`, `min`, `max`)
 *     onto the DOM element (`setValidity(..., control)`)
 *   - `change` sets `domElement.value` and sends a composed `ui-change`
 *     (not cancelable:  the native control has already changed).
 * - Its starting value is the DOM element's `value` PROPERTY, else its attribute.
 * - Its accessible name is the DOM element's `aria-label`, else `placeholder`.
 ****************/
export class CalendarFallback extends E.NativeFallback<Vocabulary> {
  @E.proto static vocabulary = calendarVocabulary
  @E.proto static degraded = [
    "the grid, its views and keyboard pattern:  the native picker's instead (a `year` is a number field)",
    "`inline` (always a field), `position`, `today`, `first-day-of-week`, `locale` (the page's instead)",
    "`disabled-dates`, `disabled-days-of-week`, `select-adjacent-days`, ranges (`start-calendar` / `end-calendar`)",
    "`disable-minute` / `-month` / `-year`, typed text in the locale's words",
    "vetoing `ui-change`, `ui-open` / `ui-close`, `:state(invalid)`, form reset of the value"
  ]

  /** The native control, once built, for `attached()`. */
  private control: HTMLInputElement | undefined

  protected override build() {
    const domElement = this.domElement as CalendarDOMElement
    const type = (this.attr("type") ?? DEFAULT_TYPE) as UIT.CalendarType
    const isYear = type === "year"
    const control = this.create("input", {
      type: NATIVE_TYPES[type] ?? NATIVE_TYPES[DEFAULT_TYPE],
      name: this.attr("name"),
      min: this.attr("min"),
      max: this.attr("max"),
      step: isYear ? "1" : undefined,
      inputmode: isYear ? "numeric" : undefined,
      required: this.flag("required"),
      disabled: this.flag("disabled"),
      readonly: this.flag("readonly")
    })
    this.decorate(control, "control")
    const placeholder = this.attr("placeholder")
    if (!control.hasAttribute("aria-label") && placeholder) control.setAttribute("aria-label", placeholder)
    const value = domElement.value ?? this.attr("value")
    if (value) control.value = String(value)
    const box = this.create("div", { class: INPUT_CLASS, part: INPUT_PART }, control)
    const root = this.create("div", { class: this.classes(), part: CALENDAR_PART }, box)

    this.listen(control, "input", () => this.sync())
    this.listen(control, "change", (event) => {
      this.sync()
      domElement.value = control.value
      const detail: UIT.CalendarChangeDetail = { value: control.value, originalEvent: event }
      domElement.dispatchEvent(new CustomEvent(CHANGE_EVENT, { bubbles: true, composed: true, detail }))
    })
    this.control = control
    return [root]
  }

  /** The first form value and validity, which need the control attached. */
  protected override attached() {
    this.sync()
  }

  /** Copy the control's value and validity onto the DOM element. */
  private sync() {
    const { control, formInternals } = this
    if (!control || !formInternals) return
    // `null`:  `setFormValue()`'s "no value"
    formInternals.setFormValue(this.attr("name") && control.value ? control.value : null)
    if (control.validity.valid) formInternals.setValidity({})
    else formInternals.setValidity(control.validity, control.validationMessage, control)
  }
}

/** What the fallback reads and writes of the DOM element:  `value` is optional, the element may not have upgraded. */
type CalendarDOMElement = HTMLElement & { value?: string }

/** The native input type holding each calendar type's ISO value. */
const NATIVE_TYPES: Readonly<Record<UIT.CalendarType, string>> = {
  date: "date",
  time: "time",
  datetime: "datetime-local",
  month: "month",
  year: "number"
}

/** The class words of the field's box (`UIInput.css`'s grammar). */
const INPUT_CLASS = "ui input"

/** The part of the field's box, from the vocabulary (`decorate()` is for the control, which takes the ARIA). */
const INPUT_PART: E.PartNameOf<Vocabulary> = "input"

/** The part of the root box, as `INPUT_PART`. */
const CALENDAR_PART: E.PartNameOf<Vocabulary> = "calendar"

/** The event a change dispatches, from the vocabulary. */
const CHANGE_EVENT: E.EventName<Vocabulary> = "ui-change"
