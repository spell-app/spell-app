/**
 * The English vocabulary of `<ui-table>`:  every name the tag uses.
 * - Its tag, attributes (each with its kind and allowed values), events, slots, parts and texts.
 *   The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar, and are MIRRORED onto the slotted
 *   `<table>` (see `UITable`):  `<ui-table size="small" celled basic="very" stuck="head first">` =>
 *   `ui small celled very basic head stuck first stuck table`.
 * - Row / cell classes (`positive`, `red marked`, `collapsing`, `four wide` ...) are the author's,
 *   on native `tr` / `td` / `th`:  no attribute here.
 * - NOTE: `columns` is Fomantic's (and `<ui-grid>`'s) equal-width COUNT (`four column`);
 *   the data-mode column list is `column-defs` (`columnDefs`), so the two never collide.
 */

import type { E } from "$/ui/core"

/****************
 * ### `tableVocabulary`
 * The names of `<ui-table>`, a native `<table>` (slotted, or rendered from `rows`) in Fomantic's table look.
 ****************/
export const tableVocabulary = {
  tag: "ui-table",
  topics: ["tables", "data display", "basic", "collections"],
  aka: ["data table", "data grid", "grid", "spreadsheet"],
  skeleton: "long line, 4 line paragraph",
  noun: "table",
  description: "A table displays a collection of data grouped into rows.",
  attributes: [
    { name: "size", kind: "size", description: "Text size, `mini` ... `massive`;  `medium` is the default." },
    { name: "color", kind: "color", description: "Coloured top edge;  with `inverted`, a coloured fill." },
    { name: "celled", kind: "keyOnly", description: "Borders between cells." },
    { name: "collapsing", kind: "keyOnly", description: "As narrow as its content (`width: auto`)." },
    { name: "definition", kind: "keyOnly", description: "First column is a definition column;  blank corner." },
    { name: "fixed", kind: "keyOnly", description: "`table-layout: fixed`;  overflowing cell text is cut with `…`." },
    { name: "inverted", kind: "keyOnly", description: "For dark backgrounds:  the dark scheme." },
    { name: "resizable", kind: "keyOnly", description: "With `scrolling`:  people can drag the height." },
    { name: "selectable", kind: "keyOnly", description: "Body rows highlight on hover." },
    {
      name: "single-line",
      kind: "keyOnly",
      description: "No wrapping:  every cell's text stays on one line (`single line`)."
    },
    {
      name: "sortable",
      kind: "keyOnly",
      description:
        "Header cells sort the table:  click / Enter / Space dispatches `ui-sort`;  the sorted one gets " +
        '`aria-sort`.  Opt a header out with `data-sortable="false"` (or Fomantic\'s `class="disabled"`).'
    },
    { name: "striped", kind: "keyOnly", description: "Every other body row is tinted." },
    { name: "structured", kind: "keyOnly", description: "Collapsed borders, for `rowspan` / `colspan` headers." },
    {
      name: "unstackable",
      kind: "keyOnly",
      description: "Never stacks rows into blocks, even on a viewport below 768px."
    },
    {
      name: "basic",
      kind: "keyOrValueAndKey",
      values: ["very"],
      description: '`basic`:  no header fill;  `basic="very"`:  no outer border or edge padding either.'
    },
    {
      name: "compact",
      kind: "keyOrValueAndKey",
      values: ["very"],
      description: '`compact` / `compact="very"`:  less cell padding.'
    },
    {
      name: "padded",
      kind: "keyOrValueAndKey",
      values: ["very"],
      description: '`padded` / `padded="very"`:  more cell padding.'
    },
    {
      name: "attached",
      kind: "keyOrValueAndKey",
      values: ["top", "bottom"],
      description: "Joins a segment or another table:  `attached` (middle), `top` or `bottom`."
    },
    {
      name: "stackable",
      kind: "keyOrValueAndKey",
      values: ["tablet"],
      description:
        "Rows become blocks on a viewport below 768px (the default, `stackable`);  " +
        '`stackable="tablet"` also below 992px.  `stack-by="container"` follows the table\'s OWN width instead.'
    },
    {
      name: "stack-by",
      kind: "enum",
      values: ["viewport", "container"],
      description:
        "What `stackable` measures:  the `viewport` (Fomantic's way, the default) or the table's own width " +
        "(`container`:  a table in a narrow column of a wide screen).  Also a token for a whole region:  " +
        "`--ui-table-stack-by: container`;  the attribute wins.  Neither:  the page-wide `--ui-stack-with` " +
        "(`<ui-root stack-with>`;  `page` ~== `viewport`)."
    },
    {
      name: "scrolling",
      kind: "keyOrValueAndKey",
      values: ["short", "very short", "long", "very long"],
      description:
        "Caps the height and scrolls, head and foot stuck;  `short` / `very short` / `long` / `very long` " +
        "change the cap.  The scroller becomes a focusable, named region."
    },
    {
      name: "overflowing",
      kind: "keyOrValueAndKey",
      values: ["short", "very short", "long", "very long"],
      description: "Like `scrolling`, both ways, with nothing stuck;  same height steps."
    },
    {
      name: "stuck",
      kind: "multiple",
      values: ["head", "foot", "first", "last"],
      description:
        'Sticky parts:  `stuck="head"` (the `thead`), `foot`, `first` / `last` column;  several at once, ' +
        'e.g. `stuck="head first"`.'
    },
    {
      name: "columns",
      kind: "width",
      values: "widths",
      widthClass: "column",
      description: "Equal-width column count, `1` ... `16` (or `1/4`, `25%`):  `four column`."
    },
    { name: "text-align", kind: "textAlign", description: "Text alignment of every cell." },
    { name: "vertical-align", kind: "verticalAlign", description: "Vertical alignment of every cell." },
    {
      name: "sort-column",
      kind: "number",
      description:
        "Index of the sorted column (0-based, counting `colspan`s);  set by people's clicks unless the app " +
        "controls it."
    },
    {
      name: "sort-direction",
      kind: "enum",
      values: ["ascending", "descending"],
      description: "Direction of `sort-column`;  a newly sorted column starts `ascending`."
    },
    {
      name: "client-sort",
      kind: "boolean",
      description:
        "Slotted tables:  reorder the `tbody` rows by the sorted column's cell text on `ui-sort` (numeric-aware).  " +
        "Off, the app sorts its own rows."
    },
    {
      name: "column-defs",
      kind: "json",
      reflect: false,
      description:
        "Data mode:  `TableColumn[]` (`key`, `header`, `textAlign`, `sortable`, `width`);  default the first " +
        "row's keys."
    },
    {
      name: "rows",
      kind: "json",
      reflect: false,
      description:
        "Data mode:  `Record<string, unknown>[]`;  with no slotted `<table>`, the element renders one (text " +
        "only) into its light DOM."
    }
  ],
  events: [
    {
      name: "ui-sort",
      detail: '{ column: number, key?: string, direction: "ascending" | "descending", originalEvent?: Event }',
      cancelable: true,
      description:
        "A header was activated;  `preventDefault()` keeps the current sort (and skips data / `client-sort` " +
        "reordering)."
    }
  ],
  slots: [{ name: "", description: "One native `<table>`." }],
  parts: [
    {
      name: "scroller",
      description:
        "Box around the slotted table;  scrolls (a focusable, named region) with `scrolling` / `overflowing`."
    }
  ],
  states: [
    { name: "attached", description: "Set while `attached` (any edge):  the host drops the outer margin it carries." },
    { name: "attached-top", description: "Set while `attached` is `top`:  the host keeps only its top margin." },
    {
      name: "attached-bottom",
      description: "Set while `attached` is `bottom`:  the host keeps only its bottom margin."
    }
  ],
  texts: [
    {
      key: "label",
      text: "Table",
      description: "Name of the scrolling region when the host has no `aria-label` and the table no `<caption>`."
    }
  ]
} as const satisfies E.ComponentVocabulary
