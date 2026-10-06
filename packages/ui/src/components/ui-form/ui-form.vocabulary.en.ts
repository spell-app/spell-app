/**
 * Every name `<ui-form>` uses:  tag, attributes (kind + allowed values), events, slots, parts, states, texts.
 * Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Pure data:  node imports it (`yarn site:data`, `yarn gen:root`), so `$/ui/core` for types only, `UIT` by value
 *   straight from `components.types`.
 * - The notes below are the whole family's:  `<ui-field>` and `<ui-fields>` too.
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-form size="large" state="error">` => `ui large error form`;  `<ui-field width="4" required>` =>
 *   `required four wide field`;  `<ui-fields widths="2" inline>` => `inline two fields`,
 *   `widths="equal"` => `equal width fields`.  Fields have no `ui` (Fomantic styles them inside `.ui.form`).
 * - `state` is `kind: "valueOnly"`:  it emits its value alone (`error field`), a remap in `colors.css`.
 * - Validation lives on `<ui-form>`:  `rules` is a PROPERTY (`json`) in Fomantic's `fields` shape.
 */

import type { E } from "$/ui/core"
import * as UIT from "$/ui/components/components.types"
import { STATE_STATES, ValidationTriggers } from "./ui-form.types"

/****************
 * ### `<ui-form>`
 * A form's look and its validation, around a NATIVE `<form>` (slotted inside it, or around it):
 * `<div class="ui … form" part="form"><slot></slot></div>`.
 ****************/
export const formVocabulary = {
  tag: "ui-form",
  topics: ["forms", "inputs", "basic", "collections"],
  aka: ["form layout", "fieldset", "validation"],
  noun: "form",
  description: "A form displays a set of related input fields in a structured way.",
  attributes: [
    { name: "size", kind: "size", description: "Size of everything inside, `mini` ... `massive`." },
    {
      name: "state",
      kind: "valueOnly",
      values: UIT.FormStates,
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
      name: "stack-with",
      kind: "enum",
      values: UIT.StackWithValues,
      description:
        "What its rows of fields stack by:  `container` (the default) -- the form's own width;  `page` -- " +
        "the screen's, as in Fomantic.  Its `<ui-fields>` follow it.  Unset:  the page-wide " +
        "`--ui-stack-with` token decides (`<ui-root stack-with>`)."
    },
    {
      name: "on",
      kind: "enum",
      values: ValidationTriggers,
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
    { name: "disabled", description: "Can't be used." },
    {
      name: "root",
      description:
        "Always on:  the form's own host (its sheet also styles `<ui-fields>` / `<ui-field>` hosts), a block and the size container its rows stack by."
    }
  ],
  texts: []
} as const satisfies E.ComponentVocabulary
