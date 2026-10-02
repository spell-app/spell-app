/**
 * Every name `<ui-grid>`, `<ui-row>` and `<ui-column>` use:  tags, attributes (kind + allowed values), slots,
 * parts.  Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-grid columns="3" divided="vertically" stackable>` => `ui stackable vertically divided three column grid`,
 *   `<ui-column width="4" width-mobile="16">` => `ui four wide sixteen wide mobile column`.
 * - Rows and columns keep the leading `ui` (unlike Fomantic's bare `.column`), so the generic colour remap reaches
 *   them;  see `ui-grid.css`.
 * - No `ownsParts`:  Fomantic's grid styles no content parts.  What a grid hands its rows and columns is
 *   inherited tokens (`--_grid-*`), see `ui-grid.css`.
 */

import type { ComponentVocabulary } from "$/ui/vocabulary"
import { ONLY_DEVICES } from "./ui-grid.types"

/****************
 * ### `<ui-column>`
 * A cell of the grid:  `<div class="ui ... column" part="column">` around a slot.
 ****************/
export const columnVocabulary = {
  tag: "ui-column",
  topics: ["layout", "collections"],
  aka: ["grid column", "col", "cell"],
  skeleton: null,
  noun: "column",
  description: "A column is a vertical cell of a grid, N of 16 wide.",
  attributes: [
    {
      name: "color",
      kind: "color",
      description: "Fills the column with a hue, contrast text on top."
    },
    {
      name: "width",
      kind: "width",
      values: "widths",
      description: "Width in columns of 16:  `4`, `1/4` or `25%`."
    },
    {
      name: "width-mobile",
      kind: "width",
      values: "widths",
      widthClass: "wide mobile",
      description: "Width while the grid is narrower than 768px."
    },
    {
      name: "width-tablet",
      kind: "width",
      values: "widths",
      widthClass: "wide tablet",
      description: "Width while the grid is 768px ... 991px wide."
    },
    {
      name: "width-computer",
      kind: "width",
      values: "widths",
      widthClass: "wide computer",
      description: "Width while the grid is 992px wide or more."
    },
    {
      name: "width-large",
      kind: "width",
      values: "widths",
      widthClass: "wide large screen",
      description: "Width while the grid is 1200px ... 1919px wide."
    },
    {
      name: "width-widescreen",
      kind: "width",
      values: "widths",
      widthClass: "wide widescreen",
      description: "Width while the grid is 1920px wide or more."
    },
    { name: "floated", kind: "valueAndKey", values: "floats", description: "Pushed to the `left` or `right` end." },
    {
      name: "attached",
      kind: "valueAndKey",
      values: ["left", "right"],
      description: "No gutter on the `left` / `right` side."
    },
    { name: "centered", kind: "keyOnly", description: "Centred in its line." },
    { name: "stretched", kind: "keyOnly", description: "Fills the line's height;  its content grows." },
    {
      name: "only",
      kind: "multiple",
      values: ONLY_DEVICES,
      description: "Shown only on these devices (by the viewport)."
    },
    {
      name: "text-align",
      kind: "textAlign",
      values: "alignments",
      description: "Aligns its text `left`, `center`, `right` or `justified`."
    },
    {
      name: "vertical-align",
      kind: "verticalAlign",
      values: "verticalAlignments",
      description: "Sits at the `top`, `middle` or `bottom` of its line."
    }
  ],
  events: [],
  slots: [{ name: "", description: "Content." }],
  parts: [{ name: "column", description: "The column box (a flex item)." }],
  states: [],
  texts: []
} as const satisfies ComponentVocabulary
