import { describe, expect, onTestFinished, test, vi } from "vite-plus/test"

import { expectAccessible } from "$/ui/test/A11y"
import { ElementFixture } from "$/ui/test/ElementFixture"
import type { DOMElement } from "$/ui/elements"
import { TreeLayout, type TreeDiagramNode } from "$/ui/components/ui-tree-diagram"

import "$/ui/components/ui-tree-diagram"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-tree-diagram/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** The FizzBuzz line of the epic's sketch, as the docs page gives it. */
const FIZZBUZZ: TreeDiagramNode = {
  label: "If",
  title: "if number / 15 is an integer",
  children: [
    {
      label: "IsA · integer",
      slot: "condition",
      children: [
        {
          label: "Divide",
          detail: "number",
          slot: "value",
          children: [{ label: "Variable number" }, { label: "Number 15" }]
        }
      ]
    },
    { label: "Print", slot: "body" },
    { label: "If …", slot: "otherwise" }
  ]
}

/** A `<ui-tree-diagram>` DOM element, with its `tree` property. */
type TreeDiagramElement = DOMElement & { tree?: unknown }

/** `<ui-tree-diagram>` holding `json` in a script child (none:  no child). */
function markup(json?: string, attributes = "") {
  const script = json === undefined ? "" : `<script type="application/json">${json}</script>`
  return `<ui-tree-diagram${attributes}>${script}</ui-tree-diagram>`
}

/** Render one diagram;  returns it with its `<svg>`. */
async function diagram(html: string) {
  const host = await ElementFixture.render<TreeDiagramElement>(html)
  return { host, svg: svgOf(host) }
}

/** `host`'s `<svg>`. */
function svgOf(host: Element): SVGSVGElement {
  return host.shadowRoot!.querySelector<SVGSVGElement>("svg[part~=diagram]")!
}

/** The labels drawn, in order. */
function labels(host: Element): string[] {
  return [...svgOf(host).querySelectorAll("text.label")].map((text) => text.textContent ?? "")
}

////////////////
// ## Data
////////////////

describe("<ui-tree-diagram> data", () => {
  test("draws the tree in its JSON script child:  a node per box, an edge per child, slot labels on edges", async () => {
    const { host, svg } = await diagram(markup(JSON.stringify(FIZZBUZZ)))
    expect(svg.getAttribute("class")).toBe("ui tree diagram")
    expect(labels(host)).toEqual(["If", "IsA · integer", "Divide", "Variable number", "Number 15", "Print", "If …"])
    const nodes = svg.querySelectorAll("g[part~=node]")
    expect(nodes).toHaveLength(7)
    expect(svg.querySelectorAll("path[part~=edge]")).toHaveLength(6)
    expect([...svg.querySelectorAll("text[part~=slot-label]")].map((text) => text.textContent)).toEqual([
      "condition",
      "value",
      "body",
      "otherwise"
    ])
    expect(svg.querySelectorAll("text.detail")).toHaveLength(1)
  })

  test("draws the layout's numbers:  `viewBox` at natural size, each box where `TreeLayout` put it", async () => {
    const { svg } = await diagram(markup(JSON.stringify(FIZZBUZZ)))
    const layout = TreeLayout.of(FIZZBUZZ)
    expect(svg.getAttribute("viewBox")).toBe(`0 0 ${layout.width} ${layout.height}`)
    const rects = [...svg.querySelectorAll("rect.box")]
    expect(rects.map((rect) => Number(rect.getAttribute("x")))).toEqual(layout.boxes.map((box) => box.x))
    expect(rects.map((rect) => Number(rect.getAttribute("width")))).toEqual(layout.boxes.map((box) => box.width))
  })

  test("the `tree` property wins over the script child, and redraws when set again", async () => {
    const { host } = await diagram(markup(JSON.stringify(FIZZBUZZ)))
    host.tree = { label: "Add", children: [{ label: "Number 1" }, { label: "Number 2" }] }
    await ElementFixture.tick()
    expect(labels(host)).toEqual(["Add", "Number 1", "Number 2"])
    host.tree = { label: "Number 15" }
    await ElementFixture.tick()
    expect(labels(host)).toEqual(["Number 15"])
    expect(svgOf(host).querySelectorAll("path")).toHaveLength(0)
    host.tree = undefined
    await ElementFixture.tick()
    expect(labels(host)[0]).toBe("If")
  })

  test("takes the tree as JSON in the attribute too", async () => {
    const { host } = await diagram(`<ui-tree-diagram tree='{"label": "Root"}'></ui-tree-diagram>`)
    expect(labels(host)).toEqual(["Root"])
  })

  test("follows its script child as the page changes it", async () => {
    const { host } = await diagram(markup('{"label": "Before"}'))
    host.querySelector("script")!.textContent = '{"label": "After", "children": [{"label": "Child"}]}'
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(labels(host)).toEqual(["After", "Child"])
  })

  test("with no tree, draws nothing:  a hidden, unnamed `<svg>`, an element with no height", async () => {
    const { host, svg } = await diagram(markup())
    expect(svg.getAttribute("class")).toBe("ui tree diagram empty")
    expect(svg.hasAttribute("role")).toBe(false)
    expect(svg.hasAttribute("aria-label")).toBe(false)
    expect(getComputedStyle(svg).display).toBe("none")
    expect(host.getBoundingClientRect().height).toBe(0)
  })

  test("invalid JSON draws nothing and warns ONCE;  fixing it draws", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    onTestFinished(() => warn.mockRestore())
    const { host, svg } = await diagram(markup("{label: If}"))
    expect(svg.getAttribute("class")).toBe("ui tree diagram empty")
    host.tree = { label: "Other" }
    await ElementFixture.tick()
    host.tree = undefined
    await ElementFixture.tick()
    expect(warn).toHaveBeenCalledTimes(1)
    expect(String(warn.mock.calls[0]![0])).toContain("<ui-tree-diagram>")
    host.querySelector("script")!.textContent = '{"label": "If"}'
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(labels(host)).toEqual(["If"])
  })
})

////////////////
// ## Accessibility
////////////////

describe("<ui-tree-diagram> accessibility", () => {
  test("is an image named by its root and how many children it has", async () => {
    const { host, svg } = await diagram(markup(JSON.stringify(FIZZBUZZ)))
    expect(svg.getAttribute("role")).toBe("img")
    expect(svg.getAttribute("aria-label")).toBe("Tree:  If, with 3 children")
    host.tree = { label: "Print", children: [{ label: "x" }] }
    await ElementFixture.tick()
    expect(svg.getAttribute("aria-label")).toBe("Tree:  Print, with 1 child")
    host.tree = { label: "x" }
    await ElementFixture.tick()
    expect(svg.getAttribute("aria-label")).toBe("Tree:  x")
  })

  test("gives a node's `title` to its box as hover text;  the root is also part `root-node`", async () => {
    const { svg } = await diagram(markup(JSON.stringify(FIZZBUZZ)))
    const root = svg.querySelector("g[part~=node]")!
    expect(root.getAttribute("part")).toBe("node root-node")
    expect(root.querySelector("title")!.textContent).toBe("if number / 15 is an integer")
    expect(svg.querySelectorAll("title")).toHaveLength(1)
  })

  test.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await expectAccessible(root)
  })
})

////////////////
// ## Look and size
////////////////

describe("<ui-tree-diagram> look", () => {
  test("sets labels in the mono font, slot labels in italics", async () => {
    const { svg } = await diagram(markup(JSON.stringify(FIZZBUZZ)))
    expect(getComputedStyle(svg.querySelector("text.label")!).fontFamily).toMatch(/mono/i)
    expect(getComputedStyle(svg.querySelector("text.slot")!).fontStyle).toBe("italic")
  })

  test("draws at its natural size in a wide container:  its width in label em", async () => {
    const wrapper = await ElementFixture.render(
      `<div style="width: 2000px; font-size: 16px">${markup(JSON.stringify(FIZZBUZZ))}</div>`
    )
    const svg = svgOf(wrapper.querySelector("ui-tree-diagram")!)
    const fontSize = Number.parseFloat(getComputedStyle(svg).fontSize)
    expect(fontSize).toBe(13)
    expect(svg.getBoundingClientRect().width).toBeCloseTo((TreeLayout.of(FIZZBUZZ).width / 12) * fontSize, 0)
  })

  test("shrinks to fit a narrower container, keeping its shape", async () => {
    const tree = JSON.stringify(FIZZBUZZ)
    const wrapper = await ElementFixture.render(`<div style="width: 350px">${markup(tree)}</div>`)
    const svg = svgOf(wrapper.querySelector("ui-tree-diagram")!)
    const layout = TreeLayout.of(FIZZBUZZ)
    const box = svg.getBoundingClientRect()
    expect(box.width).toBeCloseTo(350, 0)
    expect(box.height).toBeCloseTo((350 * layout.height) / layout.width, 0)
  })

  test("stops shrinking at the minimum scale, and scrolls sideways inside the element", async () => {
    const wrapper = await ElementFixture.render(
      `<div style="width: 120px; font-size: 16px">${markup(JSON.stringify(FIZZBUZZ))}</div>`
    )
    const host = wrapper.querySelector("ui-tree-diagram")!
    const svg = svgOf(host)
    const natural = (TreeLayout.of(FIZZBUZZ).width / 12) * Number.parseFloat(getComputedStyle(svg).fontSize)
    expect(svg.getBoundingClientRect().width).toBeCloseTo(natural * 0.75, 0)
    expect(host.getBoundingClientRect().width).toBeCloseTo(120, 0)
    expect(host.scrollWidth).toBeGreaterThan(host.clientWidth)
  })

  test("colours follow the colour scheme:  light and dark differ", async () => {
    const tree = JSON.stringify(FIZZBUZZ)
    const light = await ElementFixture.render(`<div style="color-scheme: light">${markup(tree)}</div>`)
    const dark = await ElementFixture.render(`<div style="color-scheme: dark">${markup(tree)}</div>`)
    const fill = (wrapper: Element, selector: string) =>
      getComputedStyle(svgOf(wrapper.querySelector("ui-tree-diagram")!).querySelector(selector)!).fill
    expect(fill(light, "g:not(.root) rect.box")).not.toBe(fill(dark, "g:not(.root) rect.box"))
    expect(fill(light, "text.label")).not.toBe(fill(dark, "text.label"))
  })

  test("takes its tokens from outside:  the element, an ancestor, `::part()`", async () => {
    const red = "rgb(255, 0, 0)"
    const tree = JSON.stringify(FIZZBUZZ)
    const onHost = await ElementFixture.render(markup(tree, ` style="--ui-tree-diagram-edge-color: ${red}"`))
    expect(getComputedStyle(svgOf(onHost).querySelector("path.edge")!).stroke).toBe(red)
    const ancestor = await ElementFixture.render(
      `<section style="--ui-tree-diagram-node-background: ${red}">${markup(tree)}</section>`
    )
    const box = svgOf(ancestor.querySelector("ui-tree-diagram")!).querySelector("g:not(.root) rect.box")!
    expect(getComputedStyle(box).fill).toBe(red)
    const parted = await ElementFixture.render(
      `<div><style>.themed::part(root-node) { --ui-tree-diagram-root-background: ${red} }</style>${markup(tree, ' class="themed"')}</div>`
    )
    const root = svgOf(parted.querySelector("ui-tree-diagram")!).querySelector("g.root rect.box")!
    expect(getComputedStyle(root).fill).toBe(red)
  })
})
