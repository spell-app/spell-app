/**
 * The English vocabulary of `<ui-form>`:  every name the tag uses.
 * - Its tag, attributes (each with its kind and allowed values), events, slots, parts, states and texts.
 *   The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Pure data:  node imports it (`yarn site:data`, `yarn gen:root`), so `$/ui/core` for types only,
 *   `UIT` by value straight from `components.types`.
 * - The notes below are the whole family's:  `<ui-field>`, `<ui-fields>` and `<ui-repeat>` too.
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   - `<ui-form size="large" state="error">` => `ui large error form`
 *   - `<ui-field width="4" required>` => `required four wide field`
 *   - `<ui-fields widths="2" inline>` => `inline two fields`, `widths="equal"` => `equal width fields`
 *   - Fields have no `ui` (Fomantic styles them inside `.ui.form`).
 * - `state` is `kind: "valueOnly"`:  it emits its value alone (`error field`), a remap in `colors.css`.
 * - Validation lives on `<ui-form>`:  `rules` is a PROPERTY (`json`) in Fomantic's `fields` shape.
 * - Binding too:  `value` is a PROPERTY (`json`), the object its named controls show and edit.
 *   `<ui-repeat name>` repeats its fields per item of one of its lists.
 */

import type { E } from "$/ui/core"
import * as UIT from "$/ui/components/components.types"
import { FormApplyModes, STATE_STATES, ValidationTriggers } from "./UIForm.types"

/****************
 * ### `formVocabulary`
 * The names of `<ui-form>`:  a form's look and its validation,
 * around a NATIVE `<form>` (slotted inside it, or around it).
 * - Its shadow DOM:  `<div class="ui … form" part="form"><slot></slot></div>`.
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
      name: "validate",
      kind: "enum",
      // not `validate`:  that's the DOM element's `validate()`
      property: "validateOn",
      values: ValidationTriggers,
      default: "on save",
      description:
        "When fields validate:  `immediately`, as each changes;  `on leave`, as the cursor leaves each;  or only " +
        "`on save` (a submit, or `save()`).  A field showing an error always validates again as it changes."
    },
    {
      name: "apply",
      kind: "enum",
      values: FormApplyModes,
      default: "immediately",
      description:
        "When edits land in the bound `value`:  `immediately`;  or `on save`, all together on `save()`, while " +
        "`cancel()` drops them (`:state(changed)` while any are held).  Each field's own `apply` says when it takes an edit."
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
    },
    {
      name: "value",
      kind: "json",
      reflect: false,
      description:
        "The object the form is BOUND to:  each control with a `name` shows that property and writes it back as " +
        "it changes, live both ways (Solid signals, reactive members, spell objects);  a control in a " +
        "`<ui-repeat>` row binds to the row's item.  Unset:  nothing is bound."
    },
    {
      name: "debug",
      kind: "boolean",
      description: "Show the bound `value` (else `values`) as JSON below the form, live."
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
    },
    {
      name: "ui-saving",
      detail: "{ changes: FormChange[], value: unknown }",
      cancelable: true,
      description:
        '`save()`, with `apply="on save"`:  the held edits are about to land;  `preventDefault()` keeps them held.'
    },
    {
      name: "ui-saved",
      detail: "{ changes: FormChange[], value: unknown }",
      description: "The held edits landed in the bound `value`."
    },
    {
      name: "ui-cancelling",
      detail: "{ changes: FormChange[] }",
      cancelable: true,
      description: "`cancel()`:  the held edits are about to be dropped;  `preventDefault()` keeps them."
    },
    {
      name: "ui-cancelled",
      detail: "{ changes: FormChange[] }",
      description: "The held edits were dropped:  every control shows the bound `value` again."
    }
  ],
  slots: [{ name: "", description: "The native `<form>` (or its content, when the `<ui-form>` sits inside one)." }],
  parts: [
    { name: "form", description: "The form box." },
    { name: "debug", description: "The JSON `debug` shows, a `<pre>` in a captioned box below the content." }
  ],
  states: [
    ...STATE_STATES,
    { name: "loading", description: "Busy." },
    { name: "changed", description: '`apply="on save"`:  edits are held, not saved yet.' },
    { name: "disabled", description: "Can't be used." },
    {
      name: "root",
      description:
        "Always on:  the form's own host (its sheet also styles `<ui-fields>` / `<ui-field>` hosts), a block and the size container its rows stack by."
    }
  ],
  texts: [
    { key: "formDebugBound", text: "Bound object", description: "Caption of `debug`'s JSON while the form is bound." },
    {
      key: "formDebugValues",
      text: "Values",
      description: "Caption of `debug`'s JSON while it isn't:  the form's `values`."
    }
  ]
} as const satisfies E.ComponentVocabulary
