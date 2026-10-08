/**
 * The English vocabulary of `<ui-row>`:  every name the tag uses.
 * - Its tag, attributes (each with its kind and allowed values), slots and parts.
 *   The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-grid columns="3" divided="vertically" stackable>` => `ui stackable vertically divided three column grid`,
 *   `<ui-column width="4" width-mobile="16">` => `ui four wide sixteen wide mobile column`.
 * - Rows and columns keep the leading `ui` (unlike Fomantic's bare `.column`), so the generic colour remap reaches
 *   them;  see `UIGrid.css`.
 * - No `ownsParts`:  Fomantic's grid styles no content parts.  What a grid hands its rows and columns is
 *   inherited tokens (`--_grid-*`), see `UIGrid.css`.
 */

import type { E } from "$/ui/core"
import { OnlyDevices } from "./UIGrid.types"

/** `reversed` targets on a row:  its columns only. */
const ROW_REVERSALS = ["mobile", "tablet", "computer"] as const

/****************
 * ### `rowVocabulary`
 * The names of `<ui-row>`, a line of columns:  `<div class="ui ... row" part="row">` around a slot.
 ****************/
export const rowVocabulary = {
  tag: "ui-row",
  topics: ["layout", "collections"],
  aka: ["grid row"],
  noun: "row",
  description: "A row is a horizontal grouping of columns.",
  attributes: [
    {
      name: "color",
      kind: "color",
      description: "Fills the row with a hue, contrast text on top."
    },
    {
      name: "columns",
      kind: "width",
      values: "widths",
      widthClass: "column",
      canEqual: true,
      description: 'Columns in this row, overriding the grid\'s;  `"equal"` shares the line equally.'
    },
    {
      name: "equal-width",
      kind: "keyOnly",
      key: "equal width",
      description: 'Columns share the line equally;  same as `columns="equal"`.'
    },
    { name: "divided", kind: "keyOnly", description: "Hairlines between its columns." },
    {
      name: "relaxed",
      kind: "keyOrValueAndKey",
      values: ["very"],
      description: 'Wider gutters;  `relaxed="very"` wider still.'
    },
    { name: "centered", kind: "keyOnly", description: "Centres its columns." },
    { name: "stretched", kind: "keyOnly", description: "Columns fill the row's height." },
    { name: "stackable", kind: "keyOnly", description: "Stacks its columns when the grid is narrow." },
    { name: "doubling", kind: "keyOnly", description: "Halves its column count at tablet and mobile widths." },
    {
      name: "only",
      kind: "multiple",
      values: OnlyDevices,
      description: "Shown only on these devices (by the viewport)."
    },
    {
      name: "reversed",
      kind: "multiple",
      values: ROW_REVERSALS,
      description: "Reverses its columns at these grid widths."
    },
    {
      name: "text-align",
      kind: "textAlign",
      values: "alignments",
      description: "Aligns its columns' text."
    },
    {
      name: "vertical-align",
      kind: "verticalAlign",
      values: "verticalAlignments",
      description: "Aligns its columns to the `top`, `middle` or `bottom`."
    }
  ],
  events: [],
  slots: [{ name: "", description: "`<ui-column>`s." }],
  parts: [{ name: "row", description: "The row box (a flex line)." }],
  states: [],
  texts: []
} as const satisfies E.ComponentVocabulary
