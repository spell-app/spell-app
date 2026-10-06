/**
 * Every name `<ui-brand-color-set>` uses:  tag, attributes, events, slots, parts.  Schema:  `ComponentVocabulary`.
 * - Pure data:  `import type` only.
 * - Class words:  `selectable` its name.  The element adds `color brand` after the noun (`set color brand`).
 */

import type { ComponentVocabulary } from "$/ui/core"

/****************
 * ### `<ui-brand-color-set>`
 * A row or grid of `<ui-brand-color>` chips:  to pick one from (`selectable`, a radio group), or just laid out.
 ****************/
export const brandColorSetVocabulary = {
  tag: "ui-brand-color-set",
  topics: ["selection", "controls"],
  aka: ["swatches", "swatch picker", "color picker", "palette", "color presets", "color choices"],
  skeleton: "3 tall",
  noun: "set",
  ui: false,
  description:
    "A brand color set lays out colour chips in a row or a grid;  `selectable` makes it a radio group to pick one.",
  attributes: [
    {
      name: "value",
      kind: "string",
      description:
        "The chosen chip:  its `name`, else its colour.  Setting it selects the matching chip;  choosing a chip sets it."
    },
    {
      name: "columns",
      kind: "number",
      description:
        "Chips per row:  a grid of equal cells, each chip filling its cell.  None:  one row, chips shrinking to fit."
    },
    {
      name: "selectable",
      kind: "keyOnly",
      description:
        "A radio group:  click, Enter or Space chooses a chip, the arrow keys move and choose, Home / End go to the ends."
    }
  ],
  events: [
    {
      name: "ui-change",
      detail: "{ value: string, originalEvent?: Event }",
      cancelable: false,
      description: "A chip was chosen (`selectable`):  `value` is its `name`, else its colour."
    }
  ],
  slots: [{ name: "", description: "The `<ui-brand-color>` chips." }],
  parts: [{ name: "set", description: "The box laying the chips out." }],
  states: [],
  texts: []
} as const satisfies ComponentVocabulary
