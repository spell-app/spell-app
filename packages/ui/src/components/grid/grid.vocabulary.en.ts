/**
 * Every name `<ui-grid>`, `<ui-row>` and `<ui-column>` use:  tags, attributes (kind + allowed values), slots,
 * parts.  Schema:  `ComponentVocabulary` (`$/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-grid columns="3" divided="vertically" stackable>` => `ui stackable vertically divided three column grid`,
 *   `<ui-column width="4" width-mobile="16">` => `ui four wide sixteen wide mobile column`.
 * - Rows and columns keep the leading `ui` (unlike Fomantic's bare `.column`), so the generic colour remap reaches
 *   them;  see `grid.css`.
 * - No `ownsParts`:  Fomantic's grid styles no content parts.  What a grid hands its rows and columns is
 *   inherited tokens (`--_grid-*`), see `grid.css`.
 */

import type { ComponentVocabulary } from "$/vocabulary"

/** `only` targets:  device visibility, by the viewport. */
const ONLY_DEVICES = ["mobile", "tablet", "computer", "large screen", "widescreen"] as const

/** `reversed` targets on a grid:  a device, optionally `vertically` (the lines, not the columns). */
const GRID_REVERSALS = [
  "mobile",
  "tablet",
  "computer",
  "mobile vertically",
  "tablet vertically",
  "computer vertically"
] as const

/** `reversed` targets on a row:  its columns only. */
const ROW_REVERSALS = ["mobile", "tablet", "computer"] as const

/****************
 * ### `<ui-grid>`
 * A 16-column flex grid:  `<div class="ui ... grid" part="grid">` around a slot of rows and columns.
 ****************/
export const gridVocabulary = {
  tag: "ui-grid",
  noun: "grid",
  description: "A grid is used to harmonize negative space in a layout.",
  attributes: [
    {
      name: "columns",
      kind: "width",
      values: "widths",
      widthClass: "column",
      canEqual: true,
      description: 'Columns per line, `1` ... `16` (or `1/4`, `25%`);  `"equal"` shares each line equally.'
    },
    {
      name: "equal-width",
      kind: "keyOnly",
      key: "equal width",
      description: 'Columns share each line equally;  same as `columns="equal"`.'
    },
    {
      name: "divided",
      kind: "keyOrValueAndKey",
      values: ["vertically"],
      description: 'Hairlines between columns;  `divided="vertically"` between rows instead.'
    },
    {
      name: "celled",
      kind: "keyOrValueAndKey",
      values: ["internally"],
      description: 'A table-like box with hairlines between every cell;  `"internally"` drops the outer box.'
    },
    {
      name: "padded",
      kind: "keyOrValueAndKey",
      values: ["horizontally", "vertically"],
      description: "Keeps its outer gutters inside its box;  `horizontally` / `vertically` for one axis."
    },
    {
      name: "relaxed",
      kind: "keyOrValueAndKey",
      values: ["very"],
      description: 'Wider gutters;  `relaxed="very"` wider still.'
    },
    {
      name: "compact",
      kind: "keyOrValueAndKey",
      values: ["very"],
      description: 'Narrower gutters and row spacing;  `compact="very"` narrower still.'
    },
    { name: "centered", kind: "keyOnly", description: "Centres its columns in each line." },
    { name: "stretched", kind: "keyOnly", description: "Columns fill the line's height;  their content grows." },
    { name: "stackable", kind: "keyOnly", description: "One full-width column per line when the grid is narrow." },
    { name: "doubling", kind: "keyOnly", description: "Halves the column count at tablet and mobile widths." },
    { name: "inverted", kind: "keyOnly", description: "On a dark surface:  dividers in their on-dark tone." },
    {
      name: "only",
      kind: "multiple",
      values: ONLY_DEVICES,
      description: 'Shown only on these devices (by the viewport), e.g. `only="mobile tablet"`.'
    },
    {
      name: "reversed",
      kind: "multiple",
      values: GRID_REVERSALS,
      description: 'Reverses the column order at these grid widths, e.g. `reversed="mobile tablet vertically"`.'
    },
    {
      name: "text-align",
      kind: "textAlign",
      values: "alignments",
      description: "Aligns every column's text `left`, `center`, `right` or `justified`."
    },
    {
      name: "vertical-align",
      kind: "verticalAlign",
      values: "verticalAlignments",
      description: "Aligns every column to the `top`, `middle` or `bottom` of its line."
    }
  ],
  events: [],
  slots: [{ name: "", description: "`<ui-row>`s and `<ui-column>`s." }],
  parts: [{ name: "grid", description: "The grid box (the flex container)." }],
  states: [],
  texts: []
} as const satisfies ComponentVocabulary

/****************
 * ### `<ui-row>`
 * A line of columns:  `<div class="ui ... row" part="row">` around a slot.
 ****************/
export const rowVocabulary = {
  tag: "ui-row",
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
      values: ONLY_DEVICES,
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
} as const satisfies ComponentVocabulary

/****************
 * ### `<ui-column>`
 * A cell of the grid:  `<div class="ui ... column" part="column">` around a slot.
 ****************/
export const columnVocabulary = {
  tag: "ui-column",
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
