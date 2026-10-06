import { E, UIT } from "$/ui/core"
import { calendarVocabulary } from "./ui-calendar.vocabulary.en"
import { DEFAULT_TYPE, type CalendarHost, type Vocabulary } from "./ui-calendar.types"

/****************
 * ### `CalendarFallback`
 * The browser's own picker:  `<div class="ui ... calendar" part="calendar">` around `<div class="ui input"
 * part="input">` and a native `<input part="control">` of the type that holds the same ISO value --
 * `date`, `time`, `datetime-local` (`datetime`), `month`, or a `number` for a `year`.
 * - Still a form control:  every `input` / `change` pushes the value and the native validity (`required`, `min`,
 *   `max`) into the host's (`setValidity(..., control)`);  `change` sets `host.value` and dispatches a composed
 *   `ui-change` (not cancelable:  the native control has already changed).
 * - Starting value:  the host's `value` PROPERTY, else its attribute.
 * - Accessible name:  the host's `aria-label`, else `placeholder`.
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

  /** Built control, for `attached()`. */
  private control: HTMLInputElement | undefined

  protected override build() {
    const host = this.host as CalendarHost
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
    if (!control.hasAttribute(UIT.ARIA_LABEL) && placeholder) control.setAttribute(UIT.ARIA_LABEL, placeholder)
    const value = host.value ?? this.attr("value")
    if (value) control.value = String(value)
    const box = this.create("div", { class: INPUT_CLASS, part: INPUT_PART }, control)
    const root = this.create("div", { class: this.classes(), part: CALENDAR_PART }, box)

    this.listen(control, "input", () => this.sync())
    this.listen(control, "change", (event) => {
      this.sync()
      host.value = control.value
      const detail: UIT.CalendarChangeDetail = { value: control.value, originalEvent: event }
      host.dispatchEvent(new CustomEvent(CHANGE_EVENT, { bubbles: true, composed: true, detail }))
    })
    this.control = control
    return [root]
  }

  /** First form value + validity, which need the control attached. */
  protected override attached() {
    this.sync()
  }

  /** Push the control's value and validity into the host's. */
  private sync() {
    const { control, formInternals } = this
    if (!control || !formInternals) return
    // `null`:  `setFormValue()`'s "no value"
    formInternals.setFormValue(this.attr("name") && control.value ? control.value : null)
    if (control.validity.valid) formInternals.setValidity({})
    else formInternals.setValidity(control.validity, control.validationMessage, control)
  }
}

/** Native input type holding each calendar type's ISO value. */
const NATIVE_TYPES: Readonly<Record<UIT.CalendarType, string>> = {
  date: "date",
  time: "time",
  datetime: "datetime-local",
  month: "month",
  year: "number"
}

/** Class words of the field's box (`ui-input.css`'s grammar). */
const INPUT_CLASS = "ui input"

/** Part of the field's box, from the vocabulary (`decorate()` is for the control, which takes the host's ARIA). */
const INPUT_PART: E.PartNameOf<Vocabulary> = "input"

/** Part of the root box, as `INPUT_PART`. */
const CALENDAR_PART: E.PartNameOf<Vocabulary> = "calendar"

/** The event a change dispatches, from the vocabulary. */
const CHANGE_EVENT: E.EventName<Vocabulary> = "ui-change"
