/**
 * The English vocabulary of `<ui-field>`:  every name the tag uses.
 * - Its tag, attributes (each with its kind and allowed values), slots, parts, states and texts.
 *   The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Pure data:  node imports it (`yarn site:data`, `yarn gen:root`), so `$/ui/core` for types only,
 *   `UIT` by value straight from `components.types`.
 * - The family's grammar notes are in `UIForm.en.ts`.
 */

import type { E } from "$/ui/core"
import * as UIT from "$/ui/components/components.types"
import { STATE_STATES } from "./UIForm.types"

/****************
 * ### `fieldVocabulary`
 * The names of `<ui-field>`, one field of a form:
 * a LABEL ROW (the label, then at its far end actions, an output and an info tip), the CONTROL,
 * then a hint and the error.
 * - The label row is drawn only when there's something in it:
 *   a field that slots its own `<label>` looks as it always did.
 ****************/
export const fieldVocabulary = {
  tag: "ui-field",
  topics: ["forms", "inputs", "collections"],
  aka: ["form field", "form group", "form control", "label and input", "property", "inspector row"],
  skeleton: "4.5 tall",
  noun: "field",
  ui: false,
  description: "A field is a form element containing a label and an input, with a hint, a tip and its errors.",
  attributes: [
    {
      name: "label",
      kind: "string",
      description:
        'The label, in the label row;  `slot="label"` is the rich version.  Names the control for screen readers.'
    },
    {
      name: "description",
      kind: "string",
      description:
        'A tip behind an info icon at the end of the label row, shown on hover and focus;  `slot="description"` is ' +
        "the rich version (bold words, line breaks)."
    },
    { name: "hint", kind: "string", description: 'Text under the control;  `slot="hint"` is the rich version.' },
    {
      name: "output",
      kind: "string",
      description: 'A value shown at the end of the label row (`100%`, `+8°`);  `slot="output"` is the rich version.'
    },
    {
      name: "error",
      kind: "string",
      description:
        "An error, as a line under the control, and the `error` state.  `<ui-form>`'s validation shows its own there."
    },
    {
      name: "state",
      kind: "valueOnly",
      values: UIT.FormStates,
      description: "Field state:  tints its label and controls.  An error shows `error` on top."
    },
    {
      name: "apply",
      kind: "string",
      default: "immediately",
      description:
        "When a change to the control is written to the bound value:  `immediately`;  `delayed`, after a pause in " +
        "typing (300ms;  `delayed 100` for 100ms);  or `on leave`, when the cursor leaves the field."
    },
    {
      name: "mixed",
      kind: "boolean",
      description:
        "The things being edited disagree on this value:  the control shows blank, with a `Mixed` placeholder.  " +
        "Set by the form;  writing a value clears it."
    },
    {
      name: "rules",
      kind: "json",
      reflect: false,
      description:
        'Validation rules for this field\'s control, in `<ui-form rules>`\'s shape (`"email"`, `["notEmpty", ' +
        '"minLength[6]"]`);  added to the form\'s own rules for it.'
    },
    { name: "inline", kind: "keyOnly", description: "Label beside the control, not above it." },
    {
      name: "required",
      kind: "keyOnly",
      description: "Marks the label with an asterisk (validation is `rules` / `required`)."
    },
    {
      name: "readonly",
      kind: "boolean",
      description:
        "Shows the value;  it can't be changed.  Nests like `disabled`:  set on a group, it reaches each field."
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
    {
      name: "",
      description: "The control(s):  `<ui-input>`, `<ui-dropdown>`, native inputs ...;  or a `<label for>`, then them."
    },
    { name: "label", description: "Rich label (instead of `label`)." },
    { name: "description", description: "Rich tip (instead of `description`):  bold words, line breaks." },
    { name: "hint", description: "Rich hint (instead of `hint`)." },
    { name: "output", description: "Rich output (instead of `output`)." },
    {
      name: "actions",
      description: "Small buttons at the end of the label row (`Reset`, `Auto`);  a taller one never grows the row."
    }
  ],
  parts: [
    { name: "field", description: "The field box." },
    { name: "row", description: "The label row." },
    { name: "label", description: "The label." },
    { name: "actions", description: "The actions, at the end of the label row." },
    { name: "output", description: "The output." },
    { name: "info", description: "The info icon." },
    { name: "tip", description: "The tip, shown from the info icon." },
    {
      name: "control",
      description: "Around the control(s) under a label row;  no box of its own (`display: contents`)."
    },
    { name: "hint", description: "The hint." },
    { name: "error", description: "The error lines." }
  ],
  states: [
    { name: "field", description: "Always:  how `<ui-form>` finds a control's field (`closest(':state(field)')`)." },
    ...STATE_STATES,
    { name: "mixed", description: "The things being edited disagree on this value (`mixed`)." },
    { name: "readonly", description: "Can't be changed (`readonly`, its own or a group's)." },
    { name: "disabled", description: "Can't be used." }
  ],
  texts: [
    { key: "info", text: "More about {label}", description: "The info icon's name;  `{label}` is the label." },
    { key: "mixed", text: "Mixed", description: "The placeholder of a control whose things disagree." }
  ]
} as const satisfies E.ComponentVocabulary
