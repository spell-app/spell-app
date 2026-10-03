import { afterEach, describe, expect, test, vi } from "vitest"
import { createSignal, flush } from "solid-js"
import { render } from "@solidjs/web"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { P } from "$/parser"
import { spellParser } from "$/spell"
import { editor, type EditorStore } from "$/app/editor"
import type { UI } from "$/app/ui"
import { uiReady } from "$/app/solid"
import { ASTRoot, ASTViewer } from "./ASTViewer"

/**
 * `<ASTRoot>` / `<ASTViewer>` on a real spell compile, in the browser.
 * - The tree is `ast.markup` (`$/parser`'s `renderAST.ts`) drawn as DOM in render:  there by the time `flush()`
 *   returns, no polling.
 */

/** Spell source:  a declaration, an `if` with an indented block, and a `print`. */
const SOURCE = "a card is a thing\nif 1 is 2\n  print 1\nprint 2"

/** Undo for each test:  unmount, restore `editor` fields. */
const cleanups: (() => void)[] = []

afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup()
})

describe("<ASTViewer>", () => {
  test("draws an `ASTNode` as syntax-colored Javascript", async () => {
    const ast = compile(SOURCE)
    const host = await mount(() => <ASTViewer ast={ast} scrolling />)
    const viewer = host.querySelector<HTMLElement>(".ASTViewer")!
    expect(viewer.classList.contains("scrolling")).toBe(true)
    expect(viewer.textContent).toContain("export class Card extends Thing {}")
    expect(viewer.textContent).toContain("spellCore.console.log(2)")
    expect(viewer.querySelector('.ASTNode[data-match="number"][data-start="44"]')!.textContent).toBe("2")
  })

  test("a `selection` highlights the code under the cursor", async () => {
    const ast = compile(SOURCE)
    // the `2` of `print 2`, scrolled to the top
    const selection = {
      head: { line: 3, ch: 6, offset: 44 },
      scroll: { event: "scroll", percent: 0, max: 0, current: 0, total: 0, visible: 0 }
    } satisfies UI.EditorSelection
    const host = await mount(() => <ASTViewer ast={ast} selection={selection} />)
    expect(host.querySelector(".ASTNode.highlight")?.getAttribute("data-start")).toBe("44")
    expect(host.querySelectorAll(".ASTNode.highlight").length).toBe(1)
  })

  test("a throwing `ast.markup` shows the error and tells `showError`;  a good `ast` heals it", async () => {
    const showError = vi.fn()
    const broken = {
      get markup(): never {
        throw new Error("Broken AST")
      }
    } as unknown as P.ASTNode
    const [ast, setAST] = createSignal<P.ASTNode>(broken)
    const host = await mount(() => <ASTViewer ast={ast()} showError={showError} />)
    const viewer = host.querySelector<HTMLElement>(".ASTViewer")!
    expect(viewer.querySelector("ui-message")!.textContent).toContain("Broken AST")
    expect(showError).toHaveBeenCalledWith(expect.objectContaining({ message: "Broken AST" }))

    setAST(compile("print 1"))
    flush()
    expect(viewer.querySelector("ui-message")).toBeNull()
    expect(viewer.textContent).toBe("spellCore.console.log(1)")
  })

  test("one `ast` draws in two viewers at once:  fresh nodes for each, the Javascript it compiles to", async () => {
    // NOTE: no declaration -- its `/*! SPELL: DECLARES` comment draws as `/* ...` (SUSPECTED-BUGS.md)
    const ast = compile("if 1 is 2\n  print 1\nprint 2")
    const host = await mount(() => (
      <>
        <ASTViewer ast={ast} />
        <ASTViewer ast={ast} />
      </>
    ))
    const [first, second] = host.querySelectorAll<HTMLElement>(".ASTViewer")
    expect(first.textContent).toBe(ast.compile())
    expect(second.textContent).toBe(ast.compile())
    expect(first.querySelectorAll(".ASTNode").length).toBe(second.querySelectorAll(".ASTNode").length)
  })
})

describe("<ASTRoot>", () => {
  test("follows `editor.file`'s AST", async () => {
    setEditor("file", { AST: compile("print 1") } as unknown as EditorStore["file"])
    const host = await mount(() => <ASTRoot />)
    expect(host.querySelector("ui-menu.PanelMenu ui-item[type=header]")!.textContent).toBe("Javascript Output")
    expect(host.querySelector(".ASTViewer")!.textContent).toBe("spellCore.console.log(1)")

    editor.file = { AST: compile("print 2") } as unknown as EditorStore["file"]
    flush()
    expect(host.querySelector(".ASTViewer")!.textContent).toBe("spellCore.console.log(2)")

    editor.file = undefined
    flush()
    expect(host.querySelector(".ASTViewer")!.textContent).toBe("")
  })
})

/** `source` parsed as a spell block, as an AST. */
function compile(source: string): P.ASTNode {
  return spellParser.getScope("ASTViewer.browser.test").parse(source, "block")!.AST!
}

/**
 * Render `component` into a fresh `<div>` in the page, wait for its `<ui-*>` elements;  unmounted after the test,
 * by the LAST entry of `cleanups`.
 */
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

/** Set `editor[key]`, restored after the test. */
function setEditor<K extends keyof EditorStore>(key: K, value: EditorStore[K]) {
  const before = editor[key]
  editor[key] = value
  cleanups.push(() => (editor[key] = before))
}
