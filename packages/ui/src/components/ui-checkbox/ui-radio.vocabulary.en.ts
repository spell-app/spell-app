/**
 * Every name `<ui-radio>` uses:  tag, attributes (kind + allowed values), events, slots, parts, states,
 * texts.  Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Pure data:  node imports it (`yarn site:data`, `yarn gen:root`), so `$/ui/core` for types only.
 * - The family's grammar notes are in `ui-checkbox.vocabulary.en.ts`.
 */

import type { E } from "$/ui/core"
import { LEADING_ATTRIBUTES, SHARED_ATTRIBUTES, SHARED_EVENTS, SHARED_PARTS } from "./ui-checkbox.types"

/****************
 * ### `<ui-radio>`
 * One radio button:  a native `<input type="radio">` and its `<label>`, grouped with every `<ui-radio>` of the same
 * `name` in its form (or document) -- one chosen, one tabbable, arrow keys move between them.
 ****************/
export const radioVocabulary = {
  tag: "ui-radio",
  topics: ["forms", "inputs", "controls", "selection", "modules"],
  aka: ["radio button", "option button", "radio group"],
  skeleton: "inline 6 x 1.25",
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
    {
      name: "invalid",
      description: "Fails validation, once someone has interacted with it (`:user-invalid` semantics)."
    }
  ],
  texts: []
} as const satisfies E.ComponentVocabulary
