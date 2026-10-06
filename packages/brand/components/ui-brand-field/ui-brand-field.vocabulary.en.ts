/**
 * Every name `<ui-brand-field>` uses:  tag, attributes, slots, parts, states, texts.  Schema:  `ComponentVocabulary`.
 * - Pure data:  `import type` only.
 * - Class words:  `state` emits its value alone (`error`), as `<ui-field>`'s;  `inline`, `required` and `disabled`
 *   their names.  The element adds `brand` after the noun (`field brand`).
 */

import type { ComponentVocabulary } from "$/ui/core"

/****************
 * ### `<ui-brand-field>`
 * One property of an inspector, or one field of a form:  a LABEL ROW (label, then at its far end the actions, a value
 * readout and an info tip), the CONTROL, then help and error text.
 ****************/
export const brandFieldVocabulary = {
  tag: "ui-brand-field",
  topics: ["forms", "inputs"],
  aka: ["property", "inspector row", "form field", "labelled control", "fieldset row"],
  skeleton: "3.5 tall",
  noun: "field",
  ui: false,
  description:
    "A brand field wraps one control with its label, a value readout, action buttons, an info tip, help and errors.",
  attributes: [
    {
      name: "label",
      kind: "string",
      description: 'Label text;  `slot="label"` is the rich version.  Names the control for screen readers.'
    },
    {
      name: "value",
      kind: "string",
      description: 'Readout at the end of the label row (`100%`, `+8°`);  or `slot="value"`.'
    },
    {
      name: "info",
      kind: "string",
      description: 'Tip shown from an info icon at the end of the label row;  `slot="info"` is the rich version.'
    },
    { name: "help", kind: "string", description: 'Help text under the control;  or `slot="help"`.' },
    {
      name: "error",
      kind: "string",
      description:
        "Error text under the control (and the `error` state);  `<ui-form>` sets its own through `showErrors()`."
    },
    {
      name: "state",
      kind: "valueOnly",
      values: ["error", "info", "success", "warning"],
      description: "Field state:  tints its label, help and error text.  An error shows `error` on top."
    },
    { name: "inline", kind: "keyOnly", description: "Label row beside the control, not above it." },
    { name: "required", kind: "keyOnly", description: "Marks the label with an asterisk." },
    { name: "disabled", kind: "keyOnly", description: "Dimmed and not usable (`inert`)." }
  ],
  events: [],
  slots: [
    { name: "", description: "The control:  `<ui-input>`, `<ui-slider>`, `<ui-select>`, a native input ..." },
    { name: "label", description: "Rich label (instead of `label`)." },
    {
      name: "actions",
      description: "Small buttons at the end of the label row (`Reset`, `Auto`);  a taller one never grows the row."
    },
    { name: "value", description: "Rich value readout (instead of `value`)." },
    { name: "info", description: "Rich info tip (instead of `info`):  bold words, line breaks." },
    { name: "help", description: "Rich help text (instead of `help`)." }
  ],
  parts: [
    { name: "field", description: "The field box." },
    { name: "row", description: "The label row." },
    { name: "label", description: "The label." },
    { name: "actions", description: "The actions, at the end of the label row." },
    { name: "value", description: "The value readout." },
    { name: "info", description: "The info icon." },
    { name: "tip", description: "The info tip, shown on hover and focus." },
    { name: "control", description: "The box around the control." },
    { name: "help", description: "The help text." },
    { name: "error", description: "The error text." }
  ],
  states: [
    { name: "field", description: "Always:  how `<ui-form>` finds a control's field (`closest(':state(field)')`)." },
    { name: "error", description: "Shows an error." },
    { name: "disabled", description: "Can't be used." }
  ],
  texts: [{ key: "info", text: "More about {label}", description: "The info icon's name;  `{label}` is the label." }]
} as const satisfies ComponentVocabulary
