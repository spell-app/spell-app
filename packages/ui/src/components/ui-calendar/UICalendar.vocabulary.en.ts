/**
 * Every name `<ui-calendar>` uses:  tag, attributes (kind + allowed values), events, parts, states, texts.
 * Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-calendar size="small" inverted>` => `ui small inverted calendar`.  `UICalendar.css` keys on those words.
 * - Values are ISO strings by `type` (`2026-09-30`, `14:30`, `2026-09-30T14:30`, `2026-09`, `2026`),
 *   as the native `<input type=date|time|datetime-local|month>` uses them;  `min` / `max` / `initial-date` take the
 *   same shape.
 * - Rich data is a PROPERTY (`disabledDates`, `disabledDaysOfWeek`, `kind: "json"`);  first paint never needs it.
 * - NOTE: text keys are prefixed (`calendarToday`):  every family's texts share one `UI.i18n` key space.
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-calendar>`
 * A date / time picker:  a text field and a popover grid (or the grid inline), form-associated.
 ****************/
export const calendarVocabulary = {
  tag: "ui-calendar",
  topics: ["date & time", "forms", "inputs", "controls", "modules"],
  aka: ["date picker", "datepicker", "time picker", "datetime", "date range"],
  skeleton: "inline 14 x 2.5",
  noun: "calendar",
  description: "A calendar lets a person pick a date, a time, or both.",
  attributes: [
    { name: "size", kind: "size", description: "Size, `mini` ... `massive`;  `medium` is the default." },
    {
      name: "color",
      kind: "color",
      description: "Hue of the chosen cell, the range and the focus ring (a remap of `--ui-color`)."
    },
    { name: "inverted", kind: "keyOnly", description: "For dark backgrounds:  the dark scheme's colours." },
    { name: "compact", kind: "keyOnly", description: "Tighter cells." },
    { name: "fluid", kind: "keyOnly", description: "The field takes the full width of its container." },
    { name: "disabled", kind: "keyOnly", description: "Can't be used;  dimmed and inert, left out of the form." },
    {
      name: "open",
      kind: "keyOnly",
      key: "active",
      description: "The popup is open.  Controlled:  set it to open / close;  `ui-open` / `ui-close` can veto."
    },
    {
      name: "type",
      kind: "enum",
      values: ["date", "time", "datetime", "month", "year"],
      default: "datetime",
      description: "What it picks, and the ISO shape of `value`;  Fomantic's default `datetime`."
    },
    {
      name: "inline",
      kind: "boolean",
      description: "The grid sits in the page (no field, no popup);  still a form control."
    },
    {
      name: "position",
      kind: "enum",
      values: ["bottom left", "bottom right", "top left", "top right"],
      default: "bottom left",
      description: "Where the popup opens against the field;  it flips when there's no room."
    },
    {
      name: "value",
      kind: "string",
      reflect: false,
      description:
        "Chosen value, ISO by `type`.  The ATTRIBUTE is the starting value (form reset restores it);  the " +
        "property is current."
    },
    { name: "name", kind: "string", description: "Form field name;  submits the ISO value." },
    { name: "required", kind: "boolean", description: "Form validation:  a value must be chosen." },
    {
      name: "readonly",
      kind: "boolean",
      property: "readOnly",
      description: "Shows its value but can't be changed;  submitted with the form (unlike `disabled`)."
    },
    { name: "placeholder", kind: "string", description: "Text shown in the empty field;  its accessible name too." },
    { name: "min", kind: "string", description: "Earliest value that can be chosen, ISO by `type`." },
    { name: "max", kind: "string", description: "Latest value that can be chosen, ISO by `type`." },
    {
      name: "initial-date",
      kind: "string",
      description: "Where the grid starts while there's no value (ISO);  default today."
    },
    {
      name: "first-day-of-week",
      kind: "number",
      description: "First column of the day grid, `0` = Sunday ... `6`;  default from the locale's week info."
    },
    {
      name: "locale",
      kind: "string",
      description: "BCP 47 locale for names, formats and the 12 / 24 hour clock;  default `UI.i18n.locale`."
    },
    { name: "today", kind: "boolean", description: "Shows a Today (or Now) button under the grid." },
    { name: "disable-minute", kind: "boolean", description: "Times stop at the hour:  no minute grid." },
    { name: "disable-month", kind: "boolean", description: "No month grid:  the day grid's title goes to years." },
    { name: "disable-year", kind: "boolean", description: "No year grid:  the month grid's title goes to days." },
    {
      name: "select-adjacent-days",
      kind: "boolean",
      description: "Days of the previous / next month in the day grid can be chosen (else they're disabled)."
    },
    {
      name: "start-calendar",
      kind: "string",
      description: "Id of the calendar holding the START of a range:  this one is the end (min = its value)."
    },
    {
      name: "end-calendar",
      kind: "string",
      description: "Id of the calendar holding the END of a range:  this one is the start (max = its value)."
    },
    {
      name: "icon",
      kind: "icon",
      description: "Icon of the popup button;  default (or bare `icon`) `calendar`, `clock` for `time`."
    },
    {
      name: "disabled-dates",
      kind: "json",
      reflect: false,
      description: 'PROPERTY:  days that can\'t be chosen, as ISO date strings (`["2026-12-25"]`).'
    },
    {
      name: "disabled-days-of-week",
      kind: "json",
      reflect: false,
      description: "PROPERTY:  weekdays that can't be chosen, `0` = Sunday ... `6` (`[0, 6]` for weekends)."
    }
  ],
  events: [
    {
      name: "ui-change",
      detail: "{ value: string, originalEvent?: Event }",
      cancelable: true,
      description: "The person chose, typed or cleared a value;  `preventDefault()` keeps the old one."
    },
    {
      name: "ui-open",
      detail: "{ open: true, originalEvent?: Event }",
      cancelable: true,
      description: "The popup is about to open;  `preventDefault()` keeps it closed."
    },
    {
      name: "ui-close",
      detail: "{ open: false, originalEvent?: Event }",
      cancelable: true,
      description: "The popup is about to close;  `preventDefault()` keeps it open."
    }
  ],
  slots: [],
  parts: [
    { name: "calendar", description: "The root box." },
    { name: "input", description: "The field's box (`ui input`), popup calendars only." },
    { name: "control", description: "The native text `<input>`." },
    { name: "trigger", description: "The icon `<button>` that opens the popup." },
    { name: "popup", description: "The popover dialog holding the picker." },
    { name: "header", description: "The row with previous / title / next." },
    { name: "previous", description: "The previous-page button." },
    { name: "title", description: "The title button:  goes up a level (days => months => years)." },
    { name: "next", description: "The next-page button." },
    { name: "grid", description: "The `<table role=grid>`." },
    { name: "cell", description: "Each choosable cell." },
    { name: "today", description: "The Today / Now button." }
  ],
  states: [
    { name: "open", description: "The popup is open." },
    { name: "disabled", description: "Can't be used." },
    { name: "invalid", description: "Fails validation (`required`)." },
    { name: "fluid", description: "The host is block-level (`fluid`)." },
    { name: "inline", description: "The grid sits in the page." }
  ],
  texts: [
    { key: "calendarToday", text: "Today", description: "The today button of a `date` / `month` / `year` calendar." },
    { key: "calendarNow", text: "Now", description: "The today button of a calendar with a time." },
    { key: "calendarChooseDate", text: "Choose date", description: "Name of the popup button and dialog." },
    { key: "calendarChooseTime", text: "Choose time", description: 'Same, for `type="time"`.' },
    { key: "calendarPreviousYears", text: "Previous years", description: "Previous page of the year grid." },
    { key: "calendarNextYears", text: "Next years", description: "Next page of the year grid." },
    { key: "calendarPreviousYear", text: "Previous year", description: "Previous page of the month grid." },
    { key: "calendarNextYear", text: "Next year", description: "Next page of the month grid." },
    { key: "calendarPreviousMonth", text: "Previous month", description: "Previous page of the day grid." },
    { key: "calendarNextMonth", text: "Next month", description: "Next page of the day grid." },
    { key: "calendarPreviousDay", text: "Previous day", description: "Previous page of the hour / minute grids." },
    { key: "calendarNextDay", text: "Next day", description: "Next page of the hour / minute grids." },
    { key: "calendarHours", text: "Hours", description: "Name of a `time` calendar's hour grid (no title)." },
    { key: "calendarMinutes", text: "Minutes", description: "Name of a `time` calendar's minute grid (no title)." }
  ]
} as const satisfies E.ComponentVocabulary
