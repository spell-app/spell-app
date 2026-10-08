/**
 * The types and constants of the tree diagram family:  the data contract (`TreeDiagramNode`),
 * the layout's shapes and its metrics, shared by `TreeLayout`, `TreeData` and the component.
 * - Data only:  nothing here runs.
 * - GENERIC:  any tree from plain data.  Spell's parse trees are one caller (docs pages, the app's editor, VS Code);
 *   `ui` never imports spell or the parser.
 */

////////////////
// ## The data contract
////////////////

/** One node of a tree `<ui-tree-diagram>` draws. */
export type TreeDiagramNode = {
  /** The box's text, e.g. `If`, `Variable number`, `Number 15`. */
  label: string
  /** A second, smaller, muted line under the label, e.g. a datatype `number`;  none:  one line. */
  detail?: string
  /** Text on the line from its parent, e.g. `condition`, `body`, `otherwise`. */
  slot?: string
  /** Hover text (an SVG `<title>`), e.g. the source it came from. */
  title?: string
  /** Its children, left to right. */
  children?: TreeDiagramNode[]
}

////////////////
// ## Layout
////////////////

/** A point in the diagram's user units (its `viewBox`). */
export type TreeDiagramPoint = {
  readonly x: number
  readonly y: number
}

/** One node's box, placed:  user units, `x` / `y` its TOP LEFT corner. */
export type TreeDiagramBox = {
  /** The node it draws. */
  readonly node: TreeDiagramNode
  /** Its depth:  `0` for the root. */
  readonly depth: number
  readonly x: number
  readonly y: number
  readonly width: number
  /** The row's height:  every box in a row is as tall as its tallest, so edges leave a row at one height. */
  readonly height: number
  /** Where the label's line is centred (`dominant-baseline: central`). */
  readonly label: TreeDiagramPoint
  /** Where the detail's line is centred;  none without a `detail`. */
  readonly detail?: TreeDiagramPoint
}

/** A slot label, placed:  centred on its edge's midpoint, `width` x `height` the box the edge leaves clear. */
export type TreeDiagramSlot = {
  readonly text: string
  /** Centre. */
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

/** One parent => child line, from the parent's bottom centre to the child's top centre. */
export type TreeDiagramEdge = {
  readonly from: TreeDiagramPoint
  readonly to: TreeDiagramPoint
  /** The child's `slot`, at the line's midpoint. */
  readonly slot?: TreeDiagramSlot
  /**
   * The stretch of the line NOT drawn, under the slot label:  the line stops at `gap.from`, starts again at `gap.to`.
   */
  readonly gap?: { readonly from: TreeDiagramPoint; readonly to: TreeDiagramPoint }
}

/** A tree laid out:  what `<ui-tree-diagram>` draws, in user units. */
export type TreeDiagramLayout = {
  /** Natural size:  the `viewBox`. */
  readonly width: number
  readonly height: number
  /** Every node's box, depth first (the root first). */
  readonly boxes: readonly TreeDiagramBox[]
  /** Every parent => child line, in the same order as the children's boxes:  `edges[i]` leads to `boxes[i + 1]`. */
  readonly edges: readonly TreeDiagramEdge[]
}

/**
 * Sizes the layout works in, in USER UNITS (the `viewBox`'s):  the label font is `fontSize` units,
 * and the sheet sets the `<svg>`'s width to `width / fontSize` em, so one label `em` on the page is `fontSize` units
 * here.
 * - Text widths are ESTIMATED from character counts (`charWidth`, `slotCharWidth`), not measured:  the label font is
 *   monospace, so a count is near exact;  slot labels (sans, italic) are over-estimated on purpose.
 */
export const TREE_DIAGRAM_METRICS = {
  /** The label's font size;  1em on the page. */
  fontSize: 12,
  /** The detail line's font size. */
  detailFontSize: 10,
  /** The slot label's font size. */
  slotFontSize: 10,
  /** Advance of one monospace character, per font size:  0.6 for SF Mono, Menlo, Courier, DejaVu (Consolas 0.55). */
  charWidth: 0.6,
  /** Average advance of one sans italic character, per font size:  generous, so labels never collide. */
  slotCharWidth: 0.56,
  /** Line height, per font size. */
  lineHeight: 1.25,
  /** Space left and right of a box's text. */
  paddingX: 10,
  /** Space above and below a box's text. */
  paddingY: 6,
  /** The narrowest box. */
  minBoxWidth: 32,
  /** Space between one row's boxes and the next row's. */
  levelGap: 36,
  /** Least space between two boxes (or slot labels) side by side. */
  siblingGap: 14,
  /** Space kept clear left and right of a slot label's text. */
  slotPaddingX: 4,
  /** Space kept clear above and below a slot label's text. */
  slotPaddingY: 2,
  /** Space around the whole drawing:  room for the root's thicker border. */
  margin: 2
} as const

/** Sizes `TreeLayout` works in:  `TREE_DIAGRAM_METRICS`, or a test's own. */
export type TreeDiagramMetrics = { readonly [K in keyof typeof TREE_DIAGRAM_METRICS]: number }
