/**
 * Every name `<ui-form>`, `<ui-field>` and `<ui-fields>` use:  tags, attributes (kind + allowed values), events,
 * slots, parts, states, texts.  Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-form size="large" state="error">` => `ui large error form`;  `<ui-field width="4" required>` =>
 *   `required four wide field`;  `<ui-fields widths="2" inline>` => `inline two fields`,
 *   `widths="equal"` => `equal width fields`.  Fields have no `ui` (Fomantic styles them inside `.ui.form`).
 * - `state` is `kind: "valueOnly"`:  it emits its value alone (`error field`), a remap in `colors.css`.
 * - Validation lives on `<ui-form>`:  `rules` is a PROPERTY (`json`) in Fomantic's `fields` shape.
 */

// pure data (vocabularies / types) never import `$/ui/core` by value:  it loads the element layer, which the
// docs site evaluates on the server (`astro dev`), where Solid's client APIs throw
import * as UIT from "$/ui/components/components.types"
import type { ComponentVocabulary } from "$/ui/vocabulary"
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
      values: UIT.FORM_STATES,
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
