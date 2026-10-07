import { describe, expect, test } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/components/fallback.stub"

import { TreeDiagramFallback } from "./ui-tree-diagram.fallback"

FallbackStub.define("x-fb-tree-diagram", (host, root, internals) =>
  TreeDiagramFallback.render(host, root, new Error("boom"), internals)
)

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

/** A small tree with a slot, a detail and a title. */
const TREE = {
  label: "If",
  children: [
    { label: "IsA · integer", slot: "condition", detail: "boolean", title: "number / 15 is an integer" },
    { label: "Print", slot: "body" }
  ]
}

/** A stub host holding `json` in a script child. */
function stub(json: string) {
  return Fixture.render<StubHost & { tree?: unknown }>(
    `<x-fb-tree-diagram><script type="application/json">${json}</script></x-fb-tree-diagram>`
  )
}

/** The fallback's root:  its `<figure>`. */
function figureOf(host: Element): Element {
  return FallbackStub.shadow(host).firstElementChild!
}

describe("TreeDiagramFallback", () => {
  test("shows the script child's tree as nested lists, in a named figure", async () => {
    const host = stub(JSON.stringify(TREE))
    const figure = figureOf(host)
    expect(figure.localName).toBe("figure")
    expect(figure.className).toBe("ui tree diagram")
    expect(figure.getAttribute("part")).toBe("diagram")
    expect(figure.getAttribute("aria-label")).toBe("Tree:  If, with 2 children")
    const children = [...figure.querySelectorAll(":scope > ul > li > ul > li")].map((item) => item.textContent)
    expect(children).toEqual(["condition: IsA · integer boolean", "body: Print"])
    expect(figure.querySelector(":scope > ul > li > .label")!.textContent).toBe("If")
    expect(figure.querySelector(".label[title]")!.getAttribute("title")).toBe("number / 15 is an integer")
    await expectAccessible(host, AXE)
  })

  test("prefers the host's `tree` property", () => {
    const host = stub('{"label": "Script"}')
    host.tree = { label: "Property" }
    host.render()
    expect(figureOf(host).querySelector(".label")!.textContent).toBe("Property")
  })

  test("with invalid JSON and no property:  an empty, unnamed figure", () => {
    const figure = figureOf(stub("{oops"))
    expect(figure.children).toHaveLength(0)
    expect(figure.hasAttribute("aria-label")).toBe(false)
  })
})
