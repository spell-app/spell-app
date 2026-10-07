import {
  TREE_DIAGRAM_METRICS,
  type TreeDiagramBox,
  type TreeDiagramEdge,
  type TreeDiagramLayout,
  type TreeDiagramMetrics,
  type TreeDiagramNode,
  type TreeDiagramPoint,
  type TreeDiagramSlot
} from "./ui-tree-diagram.types"

/****************
 * ### `TreeLayout`
 * A tree laid out top-down, as `<ui-tree-diagram>` draws it:  `TreeLayout.of(tree)`.
 * - PURE:  numbers in, numbers out, no DOM, no Solid;  so the maths is tested alone, and the same tree always gets
 *   the same layout.
 * - Rows:  each depth is a row;  every box in a row is as tall as its tallest, so edges leave a row at one height
 *   and every slot label between two rows sits at one height.
 * - Tidy:  a parent is centred over its first and last child;  sibling subtrees are pushed apart, depth by depth,
 *   until no two boxes of the same row are closer than `siblingGap` (contours, after Reingold-Tilford).
 *   - NOTE: subtrees pack from the left:  a small subtree between two big ones sits next to the left one, not
 *     spread evenly (Reingold-Tilford's "apportion" step, left out).
 * - Slot labels sit at their edge's midpoint, and the edge stops under them (`gap`).  A node's FOOTPRINT, what its
 *   row keeps clear, is its box or twice its slot label, whichever is wider:  so no slot label ever overlaps another,
 *   nor another edge (sibling's or cousin's), and no line runs under text.
 * - Text widths are estimated from character counts (`TreeDiagramMetrics`).
 ****************/
export class TreeLayout {
  /** Sizes it works in. */
  readonly metrics: TreeDiagramMetrics

  constructor(metrics: TreeDiagramMetrics = TREE_DIAGRAM_METRICS) {
    this.metrics = metrics
  }

  /** `tree` laid out, in user units (`TREE_DIAGRAM_METRICS`, unless `metrics` says otherwise).  NEVER throws. */
  static of(tree: TreeDiagramNode, metrics?: TreeDiagramMetrics): TreeDiagramLayout {
    return new TreeLayout(metrics).layout(tree)
  }

  /** `tree` laid out. */
  layout(tree: TreeDiagramNode): TreeDiagramLayout {
    const { margin, levelGap } = this.metrics
    const root = this.measure(tree, 0)
    const rowHeights: number[] = []
    TreeLayout.visit(root, (node) => {
      rowHeights[node.depth] = Math.max(rowHeights[node.depth] ?? 0, node.contentHeight)
    })
    const rowTops = [margin]
    for (let depth = 1; depth < rowHeights.length; depth++)
      rowTops[depth] = rowTops[depth - 1]! + rowHeights[depth - 1]! + levelGap
    this.place(root)
    // centres, from the root at 0, then shifted so the leftmost thing drawn starts at the margin
    const centres = new Map<Measured, number>([[root, 0]])
    TreeLayout.visit(root, (node) => {
      for (const child of node.children) centres.set(child, centres.get(node)! + child.offset)
    })
    let left = Infinity
    let right = -Infinity
    TreeLayout.visit(root, (node) => {
      const centre = centres.get(node)!
      left = Math.min(left, centre - node.width / 2)
      right = Math.max(right, centre + node.width / 2)
      for (const child of node.children) {
        if (!child.slot) continue
        const middle = (centre + centres.get(child)!) / 2
        left = Math.min(left, middle - child.slotWidth / 2)
        right = Math.max(right, middle + child.slotWidth / 2)
      }
    })
    const shift = margin - left
    const boxes: TreeDiagramBox[] = []
    const edges: TreeDiagramEdge[] = []
    TreeLayout.visit(root, (node, parent) => {
      const x = centres.get(node)! + shift
      const top = rowTops[node.depth]!
      boxes.push(this.box(node, x, top, rowHeights[node.depth]!))
      if (!parent) return
      const from = { x: centres.get(parent)! + shift, y: rowTops[parent.depth]! + rowHeights[parent.depth]! }
      edges.push(this.edge(node, from, { x, y: top }))
    })
    const last = rowHeights.length - 1
    return {
      width: TreeLayout.round(right - left + 2 * margin),
      height: TreeLayout.round(rowTops[last]! + rowHeights[last]! + margin),
      boxes,
      edges
    }
  }

  ////////////////
  // ## Measuring
  ////////////////

  /** `node` and its subtree, sized:  box, slot label, footprint. */
  private measure(node: TreeDiagramNode, depth: number): Measured {
    const { fontSize, detailFontSize, slotFontSize, charWidth, slotCharWidth, lineHeight } = this.metrics
    const { paddingX, paddingY, minBoxWidth, slotPaddingX } = this.metrics
    const textWidth = Math.max(
      TreeLayout.chars(node.label) * charWidth * fontSize,
      node.detail ? TreeLayout.chars(node.detail) * charWidth * detailFontSize : 0
    )
    const width = Math.max(minBoxWidth, textWidth + 2 * paddingX)
    const contentHeight = 2 * paddingY + fontSize * lineHeight + (node.detail ? detailFontSize * lineHeight : 0)
    const slot = node.slot || undefined
    const slotWidth = slot ? TreeLayout.chars(slot) * slotCharWidth * slotFontSize + 2 * slotPaddingX : 0
    return {
      node,
      depth,
      width,
      contentHeight,
      slot,
      slotWidth,
      footprint: Math.max(width, 2 * slotWidth),
      children: (node.children ?? []).map((child) => this.measure(child, depth + 1)),
      offset: 0
    }
  }

  /**
   * Characters in `text` as a monospace font sets them:  code points, so an emoji or accented letter counts once.
   * - NOTE: wide (CJK) characters take two cells in most monospace fonts, and count one here.
   */
  private static chars(text: string): number {
    return Array.from(text).length
  }

  ////////////////
  // ## Placing
  ////////////////

  /**
   * Place `node`'s children (each child's `offset` from `node`'s centre), and return `node`'s subtree's contour:  per
   * depth below it (`0` = its own row), the leftmost and rightmost edge of any footprint, from its centre.
   * - Children are placed left to right, each as close to the ones before it as their contours allow, then `node`
   *   is centred over its first and last child.
   */
  private place(node: Measured): Contour {
    const half = node.footprint / 2
    if (!node.children.length) return { left: [-half], right: [half] }
    const contours = node.children.map((child) => this.place(child))
    const offsets = [0]
    const merged: Contour = { left: [...contours[0]!.left], right: [...contours[0]!.right] }
    for (let index = 1; index < contours.length; index++) {
      const contour = contours[index]!
      let offset = -Infinity
      const shared = Math.min(merged.right.length, contour.left.length)
      for (let depth = 0; depth < shared; depth++)
        offset = Math.max(offset, merged.right[depth]! - contour.left[depth]! + this.metrics.siblingGap)
      offsets.push(offset)
      for (let depth = 0; depth < contour.left.length; depth++) {
        if (depth >= merged.left.length) merged.left[depth] = contour.left[depth]! + offset
        merged.right[depth] = contour.right[depth]! + offset
      }
    }
    const centre = (offsets[0]! + offsets[offsets.length - 1]!) / 2
    for (const [index, child] of node.children.entries()) child.offset = offsets[index]! - centre
    return {
      left: [-half, ...merged.left.map((edge) => edge - centre)],
      right: [half, ...merged.right.map((edge) => edge - centre)]
    }
  }

  ////////////////
  // ## Output
  ////////////////

  /** `node`'s box, centred on `x`, in the row from `top`, `height` tall:  its texts centred in it. */
  private box(node: Measured, x: number, top: number, height: number): TreeDiagramBox {
    const { fontSize, detailFontSize, lineHeight } = this.metrics
    const labelLine = fontSize * lineHeight
    const detailLine = node.node.detail ? detailFontSize * lineHeight : 0
    const textTop = top + (height - labelLine - detailLine) / 2
    const round = TreeLayout.round
    return {
      node: node.node,
      depth: node.depth,
      x: round(x - node.width / 2),
      y: round(top),
      width: round(node.width),
      height: round(height),
      label: TreeLayout.point({ x, y: textTop + labelLine / 2 }),
      ...(node.node.detail && { detail: TreeLayout.point({ x, y: textTop + labelLine + detailLine / 2 }) })
    }
  }

  /**
   * The line from `from` (the parent's bottom centre) to `to` (`child`'s top centre), with `child`'s slot label at
   * its midpoint and the stretch under the label left out.
   */
  private edge(child: Measured, from: TreeDiagramPoint, to: TreeDiagramPoint): TreeDiagramEdge {
    const point = TreeLayout.point
    if (!child.slot) return { from: point(from), to: point(to) }
    const { slotFontSize, lineHeight, slotPaddingY } = this.metrics
    const dx = to.x - from.x
    const dy = to.y - from.y
    const middle = { x: from.x + dx / 2, y: from.y + dy / 2 }
    const width = child.slotWidth
    const height = slotFontSize * lineHeight + 2 * slotPaddingY
    // the line meets the label's box at its side or its top / bottom, whichever comes first
    const reach = Math.min(dx ? width / 2 / Math.abs(dx) : Infinity, dy ? height / 2 / Math.abs(dy) : Infinity, 0.5)
    const slot: TreeDiagramSlot = {
      text: child.slot,
      ...point(middle),
      width: TreeLayout.round(width),
      height: TreeLayout.round(height)
    }
    const gap = {
      from: point({ x: middle.x - reach * dx, y: middle.y - reach * dy }),
      to: point({ x: middle.x + reach * dx, y: middle.y + reach * dy })
    }
    return { from: point(from), to: point(to), slot, gap }
  }

  /** `value` to 2 decimals:  short, stable markup. */
  private static round(value: number): number {
    return Math.round(value * 100) / 100
  }

  /** `point`, rounded. */
  private static point(point: TreeDiagramPoint): TreeDiagramPoint {
    return { x: TreeLayout.round(point.x), y: TreeLayout.round(point.y) }
  }

  /** Call `visit` on `node`, then on each node below it, depth first;  with each one's parent. */
  private static visit(node: Measured, visit: (node: Measured, parent?: Measured) => void, parent?: Measured) {
    visit(node, parent)
    for (const child of node.children) TreeLayout.visit(child, visit, node)
  }
}

/** A node, sized, while it's laid out. */
type Measured = {
  readonly node: TreeDiagramNode
  readonly depth: number
  /** The box's width. */
  readonly width: number
  /** The box's own height;  drawn as tall as its row. */
  readonly contentHeight: number
  /** Its slot label's text, when it has one. */
  readonly slot: string | undefined
  /** Its slot label's width, padding included;  `0` without one. */
  readonly slotWidth: number
  /** What its row keeps clear:  the box, or twice the slot label, whichever is wider. */
  readonly footprint: number
  readonly children: Measured[]
  /** Its centre, from its parent's;  set by `place()`. */
  offset: number
}

/** A subtree's outline:  per depth below its root, its leftmost and rightmost footprint edge, from the root's centre. */
type Contour = {
  left: number[]
  right: number[]
}
