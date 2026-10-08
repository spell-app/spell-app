import { describe, expect, test } from "vite-plus/test"

import { Fixture } from "$/ui/test/Fixture"

import { TreeData } from "./TreeData"

describe("TreeData.node()", () => {
  test("keeps a node's own fields, as a NEW tree", () => {
    const tree = {
      label: "If",
      detail: "number",
      slot: "body",
      title: "if x",
      children: [{ label: "Print" }]
    }
    const node = TreeData.node(tree)
    expect(node).toEqual(tree)
    expect(node).not.toBe(tree)
    expect(node!.children![0]).not.toBe(tree.children[0])
  })

  test.each([undefined, null, "If", 42, ["If"]])("%j is no node", (value) => {
    expect(TreeData.node(value)).toBeUndefined()
  })

  test("is lenient:  a missing label is empty, numbers are text, wrong types and non-node children drop out", () => {
    expect(
      TreeData.node({ detail: 15, slot: { no: 1 }, title: true, children: [{ label: "a" }, "b", null, 3], extra: 1 })
    ).toEqual({ label: "", detail: "15", title: "true", children: [{ label: "a" }] })
    expect(TreeData.node({ label: "x", children: "nope" })).toEqual({ label: "x" })
    expect(TreeData.node({ label: "x", children: [] })).toEqual({ label: "x" })
  })

  test("draws a node met twice once:  a cycle ends, and NEVER throws", () => {
    const root: Record<string, unknown> = { label: "root" }
    const shared = { label: "shared" }
    root.children = [shared, shared, root]
    expect(TreeData.node(root)).toEqual({ label: "root", children: [{ label: "shared" }] })
  })
})

describe("TreeData.parse()", () => {
  test("parses a tree;  no text, blank text or a non-node is no tree", () => {
    expect(TreeData.parse('{"label": "If", "children": [{"label": "Print"}]}')).toEqual({
      label: "If",
      children: [{ label: "Print" }]
    })
    expect(TreeData.parse(undefined)).toBeUndefined()
    expect(TreeData.parse("  \n ")).toBeUndefined()
    expect(TreeData.parse("[1, 2]")).toBeUndefined()
  })

  test("throws SyntaxError on invalid JSON", () => {
    expect(() => TreeData.parse("{label: If}")).toThrow(SyntaxError)
  })
})

describe("TreeData.scriptText()", () => {
  test("reads the first application/json script child, and nothing else", () => {
    const host = Fixture.render(
      `<div><script type="text/plain">no</script><script type=" application/json ">{"label": "a"}</script>` +
        `<script type="application/json">{"label": "b"}</script></div>`
    )
    expect(TreeData.scriptText(host)).toBe('{"label": "a"}')
    expect(TreeData.scriptText(Fixture.render(`<div><p>{"label": "a"}</p></div>`))).toBeUndefined()
  })
})

describe("TreeData.summary()", () => {
  /** The vocabulary's English texts, filled in. */
  function english(key: string, params: Record<string, string | number>) {
    return `${key}:${params.label}:${params.count}`
  }

  test("picks the text by how many children the root has", () => {
    expect(TreeData.summary({ label: "If", children: [{ label: "a" }, { label: "b" }] }, english)).toBe("summary:If:2")
    expect(TreeData.summary({ label: "If", children: [{ label: "a" }] }, english)).toBe("summaryOne:If:1")
    expect(TreeData.summary({ label: "If" }, english)).toBe("summaryLeaf:If:0")
  })
})
