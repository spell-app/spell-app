import { NativeFallback, proto, type CalendarType } from "$/core"

import { calendarVocabulary } from "./calendar.vocabulary.en"

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
export class CalendarFallback extends NativeFallback<typeof calendarVocabulary> {
  @proto static vocabulary = calendarVocabulary
  @proto static degraded = [
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
    const type = (this.attr("type") ?? "datetime") as CalendarType
    const year = type === "year"
    const control = this.create("input", {
      type: NATIVE_TYPES[type] ?? NATIVE_TYPES.datetime,
      name: this.attr("name"),
      min: this.attr("min"),
      max: this.attr("max"),
      step: year ? "1" : null,
      inputmode: year ? "numeric" : null,
      required: this.flag("required"),
      disabled: this.flag("disabled"),
      readonly: this.flag("readonly")
    })
    this.decorate(control, "control")
    const placeholder = this.attr("placeholder")
    if (!control.hasAttribute("aria-label") && placeholder) control.setAttribute("aria-label", placeholder)
    const value = host.value ?? this.attr("value")
    if (value) control.value = String(value)
    const box = this.create("div", { class: "ui input", part: "input" }, control)
    const root = this.create("div", { class: this.classes(), part: "calendar" }, box)

    this.listen(control, "input", () => this.sync())
    this.listen(control, "change", (event) => {
      this.sync()
      host.value = control.value
      const detail = { value: control.value, originalEvent: event }
      host.dispatchEvent(new CustomEvent(this.vocabulary.events[0].name, { bubbles: true, composed: true, detail }))
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
    formInternals.setFormValue(this.attr("name") && control.value ? control.value : null)
    if (control.validity.valid) formInternals.setValidity({})
    else formInternals.setValidity(control.validity, control.validationMessage, control)
  }
}

/** The part of a `<ui-calendar>` the fallback touches;  optional, the element may not have upgraded. */
type CalendarHost = HTMLElement & { value?: string | null }

/** Native input type holding each calendar type's ISO value. */
const NATIVE_TYPES: Readonly<Record<CalendarType, string>> = {
  date: "date",
  time: "time",
  datetime: "datetime-local",
  month: "month",
  year: "number"
}
