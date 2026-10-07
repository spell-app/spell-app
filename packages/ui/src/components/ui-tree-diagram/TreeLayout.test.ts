import { describe, expect, test } from "vite-plus/test"

import { TreeLayout } from "./TreeLayout"
import {
  TREE_DIAGRAM_METRICS,
  type TreeDiagramBox,
  type TreeDiagramLayout,
  type TreeDiagramNode
} from "./ui-tree-diagram.types"

////////////////
// ## Fixtures
////////////////

/** The FizzBuzz line of the epic's sketch (`guides/compile-targets/compile-targets.html`, `#fizzbuzz-tree`). */
const FIZZBUZZ: TreeDiagramNode = {
  label: "If",
  children: [
    {
      label: "IsA · integer",
      detail: "boolean",
      slot: "condition",
      children: [
        {
          label: "Divide",
          detail: "number",
          slot: "value",
          children: [
            { label: "Variable number", detail: "number" },
            { label: "Number 15", detail: "number" }
          ]
        }
      ]
    },
    {
      label: "Print",
      slot: "body",
      children: [{ label: "Variable number", detail: "number" }, { label: 'Text "fizzbuzz"' }]
    },
    { label: "If …", slot: "otherwise" }
  ]
}

/** Slot names long enough to be wider than their boxes. */
const LONG_SLOTS: TreeDiagramNode = {
  label: "Call",
  children: [
    { label: "a", slot: "the first argument" },
    { label: "b", slot: "the second argument" },
    { label: "c", slot: "rest" }
  ]
}

const { fontSize, detailFontSize, charWidth, lineHeight, paddingX, paddingY, minBoxWidth, siblingGap, margin } =
  TREE_DIAGRAM_METRICS

/** A box's width for `chars` characters of label. */
function widthFor(chars: number): number {
  return Math.max(minBoxWidth, chars * charWidth * fontSize + 2 * paddingX)
}

/**
 * A tree of `count` nodes, shaped by a seeded random walk:  bushy, lopsided, deep in places, with long and short
 * labels and some slots.  The same `seed`, the same tree.
 */
function randomTree(seed: number, count: number): TreeDiagramNode {
  let state = seed
  const random = () => (state = (state * 16807) % 2147483647) / 2147483647
  const root: TreeDiagramNode = { label: "root", children: [] }
  const nodes = [root]
  for (let index = 1; index < count; index++) {
    const parent = nodes[Math.floor(random() * nodes.length)]!
    const child: TreeDiagramNode = { label: "x".repeat(1 + Math.floor(random() * 14)) }
    if (random() < 0.4) child.slot = "s".repeat(1 + Math.floor(random() * 16))
    if (random() < 0.3) child.detail = "number"
    ;(parent.children ??= []).push(child)
    nodes.push(child)
  }
  return root
}

/** Every box's parent box, by the box. */
function parents(layout: TreeDiagramLayout): Map<TreeDiagramBox, TreeDiagramBox> {
  const byNode = new Map(layout.boxes.map((box) => [box.node, box]))
  const result = new Map<TreeDiagramBox, TreeDiagramBox>()
  for (const box of layout.boxes) for (const child of box.node.children ?? []) result.set(byNode.get(child)!, box)
  return result
}

/** Horizontal spans of `layout`'s slot labels, with their row. */
function slotSpans(layout: TreeDiagramLayout) {
  return layout.edges.flatMap((edge) => {
    const { slot } = edge
    return slot
      ? [{ edge, y: slot.y, left: slot.x - slot.width / 2, right: slot.x + slot.width / 2, text: slot.text }]
      : []
  })
}

/** The invariants every layout keeps. */
function expectTidy(layout: TreeDiagramLayout) {
  // boxes of a row never overlap, and keep `siblingGap` apart
  const rows = new Map<number, TreeDiagramBox[]>()
  for (const box of layout.boxes) rows.set(box.y, [...(rows.get(box.y) ?? []), box])
  for (const row of rows.values()) {
    const sorted = [...row].sort((a, b) => a.x - b.x)
    for (let index = 1; index < sorted.length; index++)
      expect(sorted[index]!.x - (sorted[index - 1]!.x + sorted[index - 1]!.width)).toBeGreaterThanOrEqual(
        siblingGap - 0.02
      )
    // a row's boxes are all as tall as each other
    expect(new Set(row.map((box) => box.height)).size).toBe(1)
  }
  // a parent is centred over its first and last child
  for (const box of layout.boxes) {
    const children = layout.boxes.filter((each) => box.node.children?.includes(each.node))
    if (!children.length) continue
    const first = children[0]!
    const last = children[children.length - 1]!
    expect(box.x + box.width / 2).toBeCloseTo((first.x + first.width / 2 + last.x + last.width / 2) / 2, 1)
  }
  // slot labels never overlap, nor sit on another edge
  const spans = slotSpans(layout)
  for (const span of spans) {
    for (const other of spans) {
      if (other === span || other.y !== span.y) continue
      expect(other.left >= span.right - 0.02 || other.right <= span.left + 0.02, `${span.text} / ${other.text}`).toBe(
        true
      )
    }
    for (const edge of layout.edges) {
      if (edge === span.edge) continue
      if (edge.from.y >= span.y || edge.to.y <= span.y) continue
      const x = edge.from.x + ((edge.to.x - edge.from.x) * (span.y - edge.from.y)) / (edge.to.y - edge.from.y)
      expect(x <= span.left + 0.02 || x >= span.right - 0.02, `an edge under ${span.text}`).toBe(true)
    }
  }
  // everything inside the viewBox, `margin` clear
  for (const box of layout.boxes) {
    expect(box.x).toBeGreaterThanOrEqual(margin - 0.01)
    expect(box.x + box.width).toBeLessThanOrEqual(layout.width - margin + 0.01)
    expect(box.y + box.height).toBeLessThanOrEqual(layout.height - margin + 0.01)
  }
  for (const span of spans) {
    expect(span.left).toBeGreaterThanOrEqual(margin - 0.01)
    expect(span.right).toBeLessThanOrEqual(layout.width - margin + 0.01)
  }
}

////////////////
// ## Tests
////////////////

describe("TreeLayout.of()", () => {
  test("one node:  a box sized to its label, the margin around it", () => {
    const layout = TreeLayout.of({ label: "Number 15" })
    const height = 2 * paddingY + fontSize * lineHeight
    expect(layout).toEqual({
      width: widthFor(9) + 2 * margin,
      height: height + 2 * margin,
      boxes: [
        {
          node: { label: "Number 15" },
          depth: 0,
          x: margin,
          y: margin,
          width: widthFor(9),
          height,
          label: { x: margin + widthFor(9) / 2, y: margin + height / 2 }
        }
      ],
      edges: []
    })
  })

  test("sizes boxes by character count:  the label or the detail, whichever is wider;  never under the minimum", () => {
    const [root, short, detailed] = TreeLayout.of({
      label: "Variable number",
      children: [{ label: "a" }, { label: "b", detail: "a very long datatype" }]
    }).boxes
    expect(root!.width).toBe(widthFor(15))
    expect(short!.width).toBe(minBoxWidth)
    expect(detailed!.width).toBeCloseTo(20 * charWidth * detailFontSize + 2 * paddingX, 5)
  })

  test("counts code points, so `·` and `…` are one character each", () => {
    expect(TreeLayout.of({ label: "IsA · integer" }).boxes[0]!.width).toBeCloseTo(widthFor(13), 5)
  })

  test("a detail adds a second line;  every box in its row grows to match, its text centred in it", () => {
    const layout = TreeLayout.of({ label: "Add", children: [{ label: "a" }, { label: "b", detail: "number" }] })
    const [, plain, detailed] = layout.boxes
    expect(detailed!.height).toBe(2 * paddingY + (fontSize + detailFontSize) * lineHeight)
    expect(plain!.height).toBe(detailed!.height)
    expect(plain!.label.y).toBeCloseTo(plain!.y + plain!.height / 2, 5)
    expect(plain!.detail).toBeUndefined()
    expect(detailed!.detail!.y).toBeGreaterThan(detailed!.label.y)
  })

  test("is the SAME for the same tree:  deterministic", () => {
    expect(TreeLayout.of(FIZZBUZZ)).toEqual(TreeLayout.of(structuredClone(FIZZBUZZ)))
  })

  test("lays FizzBuzz out tidy:  rows, parents centred, no overlaps", () => {
    const layout = TreeLayout.of(FIZZBUZZ)
    expectTidy(layout)
    expect(new Set(layout.boxes.map((box) => box.y)).size).toBe(4)
    expect(layout.boxes.map((box) => box.node.label)).toEqual([
      "If",
      "IsA · integer",
      "Divide",
      "Variable number",
      "Number 15",
      "Print",
      "Variable number",
      'Text "fizzbuzz"',
      "If …"
    ])
  })

  test("an edge runs from the parent's bottom centre to the child's top centre", () => {
    const layout = TreeLayout.of(FIZZBUZZ)
    const parentOf = parents(layout)
    const byNode = new Map(layout.boxes.map((box) => [box.node, box]))
    const children = layout.boxes.filter((box) => parentOf.has(box))
    expect(layout.edges).toHaveLength(children.length)
    layout.edges.forEach((edge, index) => {
      const child = children[index]!
      const parent = parentOf.get(child)!
      expect(edge.from).toEqual({ x: parent.label.x, y: parent.y + parent.height })
      expect(edge.to).toEqual({ x: child.label.x, y: child.y })
      expect(edge.slot?.text).toBe(byNode.get(child.node)!.node.slot)
    })
  })

  test("a slot label sits at its edge's midpoint, and the edge stops under it", () => {
    const { edges } = TreeLayout.of(FIZZBUZZ)
    const condition = edges.find((edge) => edge.slot?.text === "condition")!
    const { from, to, slot, gap } = condition
    expect(slot!.x).toBeCloseTo((from.x + to.x) / 2, 1)
    expect(slot!.y).toBeCloseTo((from.y + to.y) / 2, 1)
    // the gap is centred on the label, and reaches its box's side or top / bottom
    expect((gap!.from.x + gap!.to.x) / 2).toBeCloseTo(slot!.x, 1)
    const reachesSide = Math.abs(Math.abs(gap!.to.x - gap!.from.x) - slot!.width) < 0.05
    const reachesTop = Math.abs(Math.abs(gap!.to.y - gap!.from.y) - slot!.height) < 0.05
    expect(reachesSide || reachesTop).toBe(true)
    expect(edges.find((edge) => !edge.slot)!.gap).toBeUndefined()
  })

  test("keeps long slot labels apart, wider than their boxes", () => {
    expectTidy(TreeLayout.of(LONG_SLOTS))
  })

  test.each([1, 7, 42, 1234, 99991])("keeps every invariant on a random tree (seed %i)", (seed) => {
    expectTidy(TreeLayout.of(randomTree(seed, 60)))
  })

  test("takes its sizes from `metrics`", () => {
    const layout = TreeLayout.of({ label: "ab" }, { ...TREE_DIAGRAM_METRICS, paddingX: 50, minBoxWidth: 0 })
    expect(layout.boxes[0]!.width).toBeCloseTo(2 * charWidth * fontSize + 100, 5)
  })
})
