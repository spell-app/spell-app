/**
 * Every name `<ui-form>`, `<ui-field>` and `<ui-fields>` use:  tags, attributes (kind + allowed values), events,
 * slots, parts, states, texts.  Schema:  `ComponentVocabulary` (`$/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-form size="large" state="error">` => `ui large error form`;  `<ui-field width="4" required>` =>
 *   `required four wide field`;  `<ui-fields widths="2" inline>` => `inline two fields`,
 *   `widths="equal"` => `equal width fields`.  Fields have no `ui` (Fomantic styles them inside `.ui.form`).
 * - `state` is `kind: "valueOnly"`:  it emits its value alone (`error field`), a remap in `colors.css`.
 * - Validation lives on `<ui-form>`:  `rules` is a PROPERTY (`json`) in Fomantic's `fields` shape.
 */

import type { ComponentVocabulary } from "$/vocabulary"

/** Form states:  tint fields, show the matching `<ui-message>`s. */
const FORM_STATES = ["error", "info", "success", "warning"] as const

/** Host states for the form states, so page CSS (`native.css`) can show messages by them. */
const STATE_STATES = [
  { name: "error", description: "In the error state (attribute, or failed validation)." },
  { name: "info", description: "In the info state." },
  { name: "success", description: "In the success state." },
  { name: "warning", description: "In the warning state." }
] as const

/****************
 * ### `<ui-form>`
 * A form's look and its validation, around a NATIVE `<form>` (slotted inside it, or around it):
 * `<div class="ui … form" part="form"><slot></slot></div>`.
 ****************/
export const formVocabulary = {
  tag: "ui-form",
  noun: "form",
  description: "A form displays a set of related user input fields in a structured way.",
  attributes: [
    { name: "size", kind: "size", description: "Size of everything inside, `mini` ... `massive`." },
    {
      name: "state",
      kind: "valueOnly",
      values: FORM_STATES,
      description:
        "Form state:  shows the `<ui-message>`s of that state inside.  Failed validation sets `error` on top."
    },
    {
      name: "equal-width",
      kind: "keyOnly",
      key: "equal width",
      description: "Every row of fields shares its width equally."
    },
    { name: "inverted", kind: "keyOnly", description: "For dark backgrounds:  light labels." },
    { name: "loading", kind: "keyOnly", description: "Busy:  dimmed behind a spinner, not usable." },
    { name: "disabled", kind: "keyOnly", description: "Nothing inside can be used (`inert`)." },
    { name: "unstackable", kind: "keyOnly", description: "Rows of fields never stack on narrow forms." },
    {
      name: "on",
      kind: "enum",
      values: ["submit", "blur", "change"],
      default: "submit",
      description:
        "When fields validate:  on `submit` only, or also when one loses focus (`blur`) or changes (`change`).  A " +
        "field showing an error always re-validates as it changes."
    },
    {
      name: "rules",
      kind: "json",
      reflect: false,
      description:
        'Validation rules by field name (or id), Fomantic\'s `fields` shape:  `{ email: "email", password: ' +
        '["notEmpty", "minLength[6]"], name: { rules: [{ type: "notEmpty", prompt: "..." }], optional: true } }`.'
    },
    {
      name: "error-focus",
      kind: "boolean",
      default: true,
      description: 'Focus the first invalid field when a submit fails;  `error-focus="no"` to keep focus.'
    },
    {
      name: "prevent-leaving",
      kind: "boolean",
      description: "Ask before leaving the page while fields differ from their starting values."
    }
  ],
  events: [
    {
      name: "ui-valid",
      detail: "{ field: string, value: FieldValue, values: Record<string, FieldValue> }",
      description: "A field passed validation."
    },
    {
      name: "ui-invalid",
      detail: "{ field: string, value: FieldValue, errors: string[], values: Record<string, FieldValue> }",
      description: "A field failed validation;  `errors` are its prompts."
    },
    {
      name: "ui-success",
      detail: "{ values: Record<string, FieldValue>, originalEvent?: Event }",
      cancelable: true,
      description:
        "A submit passed validation;  `preventDefault()` stops the native submission (e.g. to send it by fetch)."
    },
    {
      name: "ui-failure",
      detail: "{ values: Record<string, FieldValue>, errors: Record<string, string[]>, originalEvent?: Event }",
      description: "A submit failed validation (the native submission is stopped);  `errors` by field."
    }
  ],
  slots: [{ name: "", description: "The native `<form>` (or its content, when the `<ui-form>` sits inside one)." }],
  parts: [{ name: "form", description: "The form box." }],
  states: [
    ...STATE_STATES,
    { name: "loading", description: "Busy." },
    { name: "disabled", description: "Can't be used." }
  ],
  texts: []
} as const satisfies ComponentVocabulary

/****************
 * ### `<ui-field>`
 * One field:  a `<label>` and its control(s), plus the inline validation prompt `<ui-form>` asks it to show:
 * `<div class="… field" part="field"><slot></slot><span class="ui … prompt label" part="prompt"></span></div>`.
 ****************/
export const fieldVocabulary = {
  tag: "ui-field",
  noun: "field",
  ui: false,
  description: "A field is a form element containing a label and an input.",
  attributes: [
    {
      name: "state",
      kind: "valueOnly",
      values: FORM_STATES,
      description: "Field state:  tints its label and controls.  Failed validation shows `error` on top."
    },
    { name: "inline", kind: "keyOnly", description: "Label beside the control, not above it." },
    {
      name: "required",
      kind: "keyOnly",
      description: "Marks the label with an asterisk (validation is `rules` / `required`)."
    },
    { name: "disabled", kind: "keyOnly", description: "Dimmed and not usable (`inert`)." },
    {
      name: "width",
      kind: "width",
      description: "Width in a row of fields:  columns (`4` of 16), fractions (`1/4`) or percentages (`25%`)."
    }
  ],
  events: [],
  slots: [
    { name: "", description: "A `<label for>`, then the control(s):  `<ui-input>`, `<ui-dropdown>`, native inputs ..." }
  ],
  parts: [
    { name: "field", description: "The field box." },
    { name: "prompt", description: "The inline validation prompt, a pointing label." }
  ],
  states: [
    { name: "field", description: "Always:  how `<ui-form>` finds a control's field (`closest(':state(field)')`)." },
    ...STATE_STATES,
    { name: "disabled", description: "Can't be used." }
  ],
  texts: []
} as const satisfies ComponentVocabulary

/****************
 * ### `<ui-fields>`
 * A row (or group) of fields:  `<div class="… fields" part="fields"><slot></slot></div>`.
 ****************/
export const fieldsVocabulary = {
  tag: "ui-fields",
  noun: "fields",
  ui: false,
  description: "A set of fields can appear grouped together, side by side or stacked.",
  attributes: [
    {
      name: "state",
      kind: "valueOnly",
      values: FORM_STATES,
      description: "State of every field inside."
    },
    { name: "inline", kind: "keyOnly", description: "Fields and their labels on one line." },
    { name: "grouped", kind: "keyOnly", description: "Fields stacked under one label (radio / checkbox groups)." },
    { name: "unstackable", kind: "keyOnly", description: "Never stacks on a narrow form." },
    {
      name: "required",
      kind: "keyOnly",
      description: "Marks every field label (or the group label) with an asterisk."
    },
    { name: "disabled", kind: "keyOnly", description: "Every field dimmed and not usable." },
    {
      name: "widths",
      kind: "width",
      widthClass: "",
      canEqual: true,
      values: ["2", "3", "4", "5", "6", "7", "8", "9", "10"],
      description: 'Fields per row, sharing it equally:  `widths="2"` => `two fields`;  `"equal"` => any number.'
    }
  ],
  events: [],
  slots: [{ name: "", description: "`<ui-field>`s, and a `<label>` for a grouped / inline set." }],
  parts: [{ name: "fields", description: "The row box." }],
  states: [...STATE_STATES, { name: "disabled", description: "Can't be used." }],
  texts: []
} as const satisfies ComponentVocabulary
