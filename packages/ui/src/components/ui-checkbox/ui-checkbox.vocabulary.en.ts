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

import { LEADING_ATTRIBUTES, SHARED_ATTRIBUTES, SHARED_EVENTS, SHARED_PARTS } from "./ui-checkbox.types"

/****************
 * ### `<ui-checkbox>`
 * A checkbox, toggle or slider:  a native `<input type="checkbox">` and its `<label>` in Fomantic's markup.
 ****************/
export const checkboxVocabulary = {
  tag: "ui-checkbox",
  topics: ["forms", "inputs", "controls", "selection", "basic", "modules"],
  aka: ["check box", "toggle", "switch", "tick box"],
  skeleton: { display: "inline", width: "6em", height: "1.25em" },
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
