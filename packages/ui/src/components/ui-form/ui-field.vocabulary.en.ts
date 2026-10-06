/**
 * Every name `<ui-field>` uses:  tag, attributes (kind + allowed values), slots, parts, states.
 * Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Pure data:  node imports it (`yarn site:data`, `yarn gen:root`), so `$/ui/core` for types only, `UIT` by value
 *   straight from `components.types`.
 * - The family's grammar notes are in `ui-form.vocabulary.en.ts`.
 */

import type { E } from "$/ui/core"
import * as UIT from "$/ui/components/components.types"
import { STATE_STATES } from "./ui-form.types"

/****************
 * ### `<ui-field>`
 * One field:  a `<label>` and its control(s), plus the inline validation prompt `<ui-form>` asks it to show:
 * `<div class="… field" part="field"><slot></slot><span class="ui … prompt label" part="prompt"></span></div>`.
 ****************/
export const fieldVocabulary = {
  tag: "ui-field",
  topics: ["forms", "inputs", "collections"],
  aka: ["form field", "form group", "form control", "label and input"],
  skeleton: { height: "4.5em" },
  noun: "field",
  ui: false,
  description: "A field is a form element containing a label and an input.",
  attributes: [
    {
      name: "state",
      kind: "valueOnly",
      values: UIT.FormStates,
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
} as const satisfies E.ComponentVocabulary
