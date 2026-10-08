/**
 * Every name `<ui-checkbox>` and `<ui-radio>` use:  tags, attributes (kind + allowed values), events, slots, parts,
 * states, texts.  Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Pure data:  node imports it (`yarn site:data`, `yarn gen:root`), so `$/ui/core` for types only.
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-checkbox type="toggle" size="large" fitted>` => `ui large toggle fitted checkbox`;
 *   a `<ui-radio>` is `ui radio checkbox` (the element adds `radio` unless its `type` is `slider` / `toggle`).
 * - `type` is `kind: "valueOnly"`:  it emits its value alone, right after the colour, as Fomantic writes it.
 * - Chosen state:  `selected` is canonical (`AGENTS.md`);  `checked` is accepted as another name for it:
 *   the DOM element's `checked` PROPERTY reads and writes `selected`, and a `checked` ATTRIBUTE in markup selects it.
 *   The DOM element's class, `DOMCheckElement`, owns that name:  it is not a vocabulary attribute.
 */

import type { E } from "$/ui/core"
import { LEADING_ATTRIBUTES, SHARED_ATTRIBUTES, SHARED_EVENTS, SHARED_PARTS } from "./UICheckbox.types"

/****************
 * ### `<ui-checkbox>`
 * A checkbox, toggle or slider:  a native `<input type="checkbox">` and its `<label>` in Fomantic's markup.
 ****************/
export const checkboxVocabulary = {
  tag: "ui-checkbox",
  topics: ["forms", "inputs", "controls", "selection", "basic", "modules"],
  aka: ["check box", "toggle", "switch", "tick box"],
  skeleton: "inline 6 x 1.25",
  noun: "checkbox",
  description: "A checkbox lets people choose a value from a small set of options, often on or off.",
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
    ...SHARED_ATTRIBUTES,
    {
      name: "off-value",
      kind: "string",
      description:
        'Value submitted while unchosen:  `value="open" off-value="closed"`;  default its class\'s `defaultUnchosenValue`, else nothing, as a native checkbox.  Needs JavaScript:  a static server render submits nothing while unchosen.'
    }
  ],
  events: SHARED_EVENTS,
  slots: [{ name: "", description: "Label content." }],
  parts: SHARED_PARTS,
  states: [
    { name: "selected", description: "Chosen." },
    { name: "indeterminate", description: "Neither on nor off." },
    { name: "disabled", description: "Can't be used." },
    {
      name: "invalid",
      description: "Fails validation, once someone has interacted with it (`:user-invalid` semantics)."
    }
  ],
  texts: []
} as const satisfies E.ComponentVocabulary
