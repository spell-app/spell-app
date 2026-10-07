import { afterEach, describe, expect, test } from "vite-plus/test"
import { createSignal, flush } from "solid-js"
import { render } from "@solidjs/web"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { P } from "$/parser"
import { spellParser } from "$/spell"
import { uiReady } from "$/app/solid"
import { TreeViewer } from "./TreeViewer"

/**
 * `<TreeViewer>` on a real spell parse, in the browser:  Solid's client build, so `flush()` before asserting.
 */

/** Spell source:  a declaration, then a `print`.  `print 1 + 2` starts at offset 18. */
const SOURCE = "a card is a thing\nprint 1 + 2"

/** Undo for each test:  unmount. */
const cleanups: (() => void)[] = []

afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup()
})

describe("<TreeViewer>", () => {
  test("draws the spell tree of the line at `offset`, and follows it", async () => {
    const match = parse(SOURCE)
    const [offset, setOffset] = createSignal<number | undefined>(20)
    const host = await mount(() => <TreeViewer match={match} offset={offset()} />)
    const diagram = host.querySelector("ui-tree-diagram") as (HTMLElement & { tree?: P.TreeNode }) | null
    expect(diagram?.tree?.label).toBe("Print")
    expect(diagram?.tree?.children?.[0]?.label).toBe("plus")

    setOffset(2)
    flush()
    expect((host.querySelector("ui-tree-diagram") as HTMLElement & { tree?: P.TreeNode }).tree?.label).not.toBe("Print")
  })

  test("no line there:  a hint, no diagram", async () => {
    const host = await mount(() => <TreeViewer match={parse(SOURCE)} offset={undefined} />)
    expect(host.querySelector("ui-tree-diagram")).toBeNull()
    expect(host.querySelector(".TreeViewer-hint")?.textContent).toContain("Put the cursor on a line")
  })
})

/** `source` parsed as a spell block. */
function parse(source: string): P.Match {
  return spellParser.getScope("TreeViewer.browser.test").parse(source, "block")! as P.Match
}

/** Render `component` into a fresh `<div>` in the page, wait for its `<ui-*>` elements;  unmounted after the test. */
async function mount(component: () => unknown): Promise<HTMLElement> {
  await uiReady
  const host = document.createElement("div")
  document.body.append(host)
  const dispose = render(component as () => never, host)
  cleanups.push(() => {
    dispose()
    host.remove()
  })
  flush()
  await ElementFixture.settle(host)
  return host
}
