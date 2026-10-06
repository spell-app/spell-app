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

// pure data (vocabularies / types) never import `$/ui/core` by value:  it loads the element layer, which node
// can't (`yarn site:data` / `yarn gen:root` import every vocabulary through tsx:  no `?inline` css, no JSX)
import * as UIT from "$/ui/components/components.types"
import type { ComponentVocabulary } from "$/ui/vocabulary"
import { STATE_STATES } from "./ui-form.types"

/****************
 * ### `<ui-fields>`
 * A row (or group) of fields:  `<div class="… fields" part="fields"><slot></slot></div>`.
 ****************/
export const fieldsVocabulary = {
  tag: "ui-fields",
  topics: ["forms", "layout", "collections"],
  aka: ["field group", "form row", "inline fields"],
  skeleton: false,
  noun: "fields",
  ui: false,
  description: "A set of fields can appear grouped together, side by side or stacked.",
  attributes: [
    {
      name: "state",
      kind: "valueOnly",
      values: UIT.FORM_STATES,
      description: "State of every field inside."
    },
    { name: "inline", kind: "keyOnly", description: "Fields and their labels on one line." },
    { name: "grouped", kind: "keyOnly", description: "Fields stacked under one label (radio / checkbox groups)." },
    { name: "unstackable", kind: "keyOnly", description: "Never stacks on a narrow form." },
    {
      name: "required",
      kind: "keyOnly",
      description: "Marks every field label (or the group label) with an asterisk."
    },
    { name: "disabled", kind: "keyOnly", description: "Every field dimmed and not usable." },
    {
      name: "equal",
      kind: "keyOnly",
      key: "equal width",
      description:
        "Every field the same width, from the fields themselves (no count):  an equal share of the row each " +
        '(Fomantic\'s `equal width fields`;  ~== `widths="equal"`).'
    },
    {
      name: "widths",
      kind: "width",
      widthClass: "",
      canEqual: true,
      values: ["2", "3", "4", "5", "6", "7", "8", "9", "10"],
      description:
        'Older, count-based alias of `equal`:  fields per row, sharing it equally (`widths="2"` => `two fields`);  ' +
        '`"equal"` => any number (`equal width`).'
    }
  ],
  events: [],
  slots: [{ name: "", description: "`<ui-field>`s, and a `<label>` for a grouped / inline set." }],
  parts: [{ name: "fields", description: "The row box." }],
  states: [...STATE_STATES, { name: "disabled", description: "Can't be used." }],
  texts: []
} as const satisfies ComponentVocabulary
