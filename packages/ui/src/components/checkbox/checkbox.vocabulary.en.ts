/**
 * Every name `<ui-checkbox>` and `<ui-radio>` use:  tags, attributes (kind + allowed values), events, slots, parts,
 * states, texts.  Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-checkbox type="toggle" size="large" fitted>` => `ui large toggle fitted checkbox`;  a `<ui-radio>` is
 *   `ui radio checkbox` (the element adds `radio` unless its `type` is `slider` / `toggle`).
 * - `type` is `kind: "valueOnly"`:  it emits its value alone, right after the colour, as Fomantic writes it.
 * - Chosen state:  `selected` is canonical (`AGENTS.md`);  `checked` is accepted as an alias -- the host's `checked`
 *   PROPERTY reads and writes `selected`, and a `checked` ATTRIBUTE in markup selects it (the host class,
 *   `CheckHost`, owns that alias:  it is not a vocabulary attribute).
 */

import type { ComponentVocabulary } from "$/ui/vocabulary"

/** Attributes both elements start with:  `type` comes after them, so its word follows the colour. */
const LEADING_ATTRIBUTES = [
  { name: "size", kind: "size", description: "Size, `mini` ... `massive`;  `medium` is the default." },
  {
    name: "color",
    kind: "color",
    description: "Hue of the chosen state:  the filled box, the radio bullet, the toggle lane, the slider line."
  }
] as const

/** Attributes both elements share, after their own `type`. */
const SHARED_ATTRIBUTES = [
  { name: "fitted", kind: "keyOnly", description: "No room for a label:  just the box." },
  {
    name: "invisible",
    kind: "keyOnly",
    description: "No box:  the LABEL is the control, bordered while unchosen and tinted when chosen."
  },
  {
    name: "right-aligned",
    kind: "keyOnly",
    key: "right aligned",
    description: "Box after the label, at the end of the line."
  },
  { name: "disabled", kind: "keyOnly", description: "Can't be used;  dimmed, left out of the form." },
  {
    name: "readonly",
    kind: "keyOnly",
    key: "read-only",
    description: "Shows its state but can't be changed;  still submitted."
  },
  { name: "inverted", kind: "keyOnly", description: "For dark backgrounds." },
  {
    name: "selected",
    kind: "boolean",
    description: "Chosen.  Controlled:  set it to choose;  a click dispatches `ui-change` first.  Alias:  `checked`."
  },
  {
    name: "value",
    kind: "string",
    description: "Value submitted while chosen;  default `on`, as a native checkbox."
  },
  { name: "name", kind: "string", description: "Form field name." },
  { name: "required", kind: "boolean", description: "Form validation:  must be chosen (a radio:  one of its group)." },
  { name: "label", kind: "string", description: "Label text;  slotted content is the rich version." }
] as const

/** Events both elements share. */
const SHARED_EVENTS = [
  {
    name: "ui-change",
    detail: "{ selected: boolean, value: string, originalEvent?: Event }",
    description: "The user chose or unchose it (a radio:  only the newly chosen one fires)."
  }
] as const

/** Parts both elements share. */
const SHARED_PARTS = [
  { name: "checkbox", description: "The root box." },
  { name: "control", description: "The native `<input>` (invisible, over the box)." },
  { name: "label", description: "The `<label>` drawing the box, the mark and the text." }
] as const

/****************
 * ### `<ui-checkbox>`
 * A checkbox, toggle or slider:  a native `<input type="checkbox">` and its `<label>` in Fomantic's markup.
 ****************/
export const checkboxVocabulary = {
  tag: "ui-checkbox",
  noun: "checkbox",
  description: "A checkbox allows a user to select a value from a small set of options, often binary.",
  attributes: [
    ...LEADING_ATTRIBUTES,
    {
      name: "type",
      kind: "valueOnly",
      values: ["slider", "toggle"],
      description: "Look:  a `toggle` switch or a `slider`;  default a box.  Toggles and sliders are `role=switch`."
    },
    {
      name: "indeterminate",
      kind: "keyOnly",
      description: "Neither on nor off (a dash);  a click clears it, as natively."
    },
    ...SHARED_ATTRIBUTES
  ],
  events: SHARED_EVENTS,
  slots: [{ name: "", description: "Label content." }],
  parts: SHARED_PARTS,
  states: [
    { name: "selected", description: "Chosen." },
    { name: "indeterminate", description: "Neither on nor off." },
    { name: "disabled", description: "Can't be used." },
    { name: "invalid", description: "Fails validation, once the user has interacted (`:user-invalid` semantics)." }
  ],
  texts: []
} as const satisfies ComponentVocabulary

/****************
 * ### `<ui-radio>`
 * One radio button:  a native `<input type="radio">` and its `<label>`, grouped with every `<ui-radio>` of the same
 * `name` in its form (or document) -- one chosen, one tabbable, arrow keys move between them.
 ****************/
export const radioVocabulary = {
  tag: "ui-radio",
  noun: "checkbox",
  description: "A radio button chooses exactly one value of a group.",
  attributes: [
    ...LEADING_ATTRIBUTES,
    {
      name: "type",
      kind: "valueOnly",
      values: ["slider", "toggle"],
      description: "Look:  a `toggle` or `slider` radio;  default the round radio box."
    },
    ...SHARED_ATTRIBUTES
  ],
  events: SHARED_EVENTS,
  slots: [{ name: "", description: "Label content." }],
  parts: SHARED_PARTS,
  states: [
    { name: "selected", description: "Chosen." },
    { name: "disabled", description: "Can't be used." },
    { name: "invalid", description: "Fails validation, once the user has interacted (`:user-invalid` semantics)." }
  ],
  texts: []
} as const satisfies ComponentVocabulary
