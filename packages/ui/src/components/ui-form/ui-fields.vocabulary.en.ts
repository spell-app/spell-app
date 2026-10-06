/**
 * Every name `<ui-fields>` uses:  tag, attributes (kind + allowed values), slots, parts, states.
 * Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Pure data:  node imports it (`yarn site:data`, `yarn gen:root`), so `$/ui/core` for types only, `UIT` by value
 *   straight from `components.types`.
 * - The family's grammar notes are in `ui-form.vocabulary.en.ts`.
 */

import type { E } from "$/ui/core"
import * as UIT from "$/ui/components/components.types"
import { STATE_STATES } from "./ui-form.types"

/****************
 * ### `<ui-fields>`
 * A row (or group) of fields:  `<div class="… fields" part="fields"><slot></slot></div>`.
 ****************/
export const fieldsVocabulary = {
  tag: "ui-fields",
  topics: ["forms", "layout", "collections"],
  aka: ["field group", "form row", "inline fields"],
  noun: "fields",
  ui: false,
  description: "A set of fields can appear grouped together, side by side or stacked.",
  attributes: [
    {
      name: "state",
      kind: "valueOnly",
      values: UIT.FormStates,
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
} as const satisfies E.ComponentVocabulary
