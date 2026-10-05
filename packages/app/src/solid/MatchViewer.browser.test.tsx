import { afterEach, describe, expect, test, vi } from "vite-plus/test"
import { createSignal, flush } from "solid-js"
import { render } from "@solidjs/web"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { P } from "$/parser"
import { spellParser } from "$/spell"
import { editor, type EditorStore } from "$/app/editor"
import type { UI } from "$/app/ui"
import { uiReady } from "$/app/solid"
import { MatchRoot, MatchViewer } from "./MatchViewer"

/**
 * `<MatchRoot>` / `<MatchViewer>` / `<MatchView>` on a real spell parse, in the browser:  Solid's client build,
 * so `flush()` before asserting.
 */

/** Spell source:  a declaration, an `if` with an indented block, and a `print`. */
const SOURCE = "a card is a thing\nif 1 is 2\n  print 1\nprint 2"

/** Undo for each test:  unmount, restore `editor` fields. */
const cleanups: (() => void)[] = []

afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup()
})

describe("<MatchViewer>", () => {
  test("draws a `Match` as a tree of rules and tokens", async () => {
    const match = parse(SOURCE)
    const host = await mount(() => <MatchViewer match={match} scrolling />)
    const viewer = host.querySelector(".MatchViewer")!
    expect(viewer.classList.contains("scrolling")).toBe(true)
    expect(viewer.classList.contains("compact")).toBe(false)

    const root = viewer.querySelector(":scope > .Match")!
    expect(root.classList.contains("block")).toBe(true)
    expect(root.querySelector(":scope > .name")!.textContent).toBe("block")
    // three lines, one per statement, in its `.contents`
    const lines = root.querySelectorAll(":scope > .contents > .Match.line")
    expect([...lines].map((line) => line.getAttribute("data-start"))).toEqual(["0", "18", "38"])
    expect(lines[0].querySelector(".Match.create_type")!.getAttribute("title")).toBe("create_type")

    // the `if`'s block is a SIBLING of its contents, not inside them
    const ifMatch = lines[1].querySelector(".Match.if")!
    expect(ifMatch.classList.contains("hasBlocks")).toBe(true)
    expect(ifMatch.querySelector(":scope > .Match.block")).not.toBeNull()
    expect(ifMatch.querySelector(":scope > .contents > .Match.block")).toBeNull()

    // tokens are leaves, with their text
    const tokens = [...lines[2].querySelectorAll(".Token")]
    expect(tokens.map((token) => token.querySelector(".value")!.textContent)).toEqual(["print", "2"])
    expect(tokens[1].classList.contains("NumberToken")).toBe(true)
    expect(tokens[1].getAttribute("data-start")).toBe("44")
  })

  test("`compact` hides the rule names", async () => {
    const match = parse(SOURCE)
    const [compact, setCompact] = createSignal(false)
    const host = await mount(() => <MatchViewer match={match} compact={compact()} />)
    const viewer = host.querySelector<HTMLElement>(".MatchViewer")!
    const name = viewer.querySelector<HTMLElement>(".Match.line > .name")!
    expect(getComputedStyle(name).display).toBe("block")

    setCompact(true)
    flush()
    expect(viewer.classList.contains("compact")).toBe(true)
    expect(getComputedStyle(name).display).toBe("none")
  })

  test("a `selection` highlights the line under the cursor, and the rules down to the cursor", async () => {
    const match = parse(SOURCE)
    // the `1` of `print 1`, scrolled to the top
    const selection = {
      head: { line: 2, ch: 8, offset: 36 },
      scroll: { event: "scroll", percent: 0, max: 0, current: 0, total: 0, visible: 0 }
    } satisfies UI.EditorSelection
    const host = await mount(() => <MatchViewer match={match} selection={selection} />)
    const highlighted = [...host.querySelectorAll(".highlight")]
    expect(highlighted[0].matches('.Match.line[data-start="28"]')).toBe(true)
    expect(highlighted.some((element) => element.matches('.Match.number[data-start="36"] > .name'))).toBe(true)
    // nothing on other lines
    expect(host.querySelector('.Match.line[data-start="38"] .highlight')).toBeNull()
  })

  test("a throwing match shows the error and tells `showError`;  a good one heals it", async () => {
    const showError = vi.fn()
    const broken = {
      get rule(): never {
        throw new Error("Broken match")
      }
    } as unknown as P.Match
    const [match, setMatch] = createSignal<P.Match>(broken)
    const host = await mount(() => <MatchViewer match={match()} showError={showError} />)
    const viewer = host.querySelector(".MatchViewer")!
    // the error shows INSIDE the viewer's box
    expect(viewer.querySelector("ui-message")!.textContent).toContain("Broken match")
    expect(showError).toHaveBeenCalledWith(expect.objectContaining({ message: "Broken match" }))

    setMatch(parse(SOURCE))
    flush()
    expect(viewer.querySelector("ui-message")).toBeNull()
    expect(viewer.querySelectorAll(":scope > .Match > .contents > .Match.line").length).toBe(3)
  })
})

describe("<MatchRoot>", () => {
  test("follows `editor.file`'s match", async () => {
    setEditor("file", { match: parse("print 1") } as unknown as EditorStore["file"])
    const host = await mount(() => <MatchRoot showToolbar={false} />)
    expect(host.querySelector("ui-menu")).toBeNull()
    expect(values(host)).toEqual(["print", "1"])

    editor.file = { match: parse("print 2\nprint 3") } as unknown as EditorStore["file"]
    flush()
    expect(values(host)).toEqual(["print", "2", "print", "3"])

    editor.file = undefined
    flush()
    expect(host.querySelector(".Match")).toBeNull()
    expect(host.querySelector(".MatchViewer.scrolling")).not.toBeNull()
  })

  test("its toolbar's action toggles the rule names", async () => {
    setEditor("file", { match: parse(SOURCE) } as unknown as EditorStore["file"])
    setEditor("showingMatchRuleNames", true)
    const host = await mount(() => <MatchRoot />)
    const viewer = host.querySelector(".MatchViewer")!
    // NOTE: `showingMatchRuleNames` true => `compact`, which HIDES the names (as React's did)
    expect(viewer.classList.contains("compact")).toBe(true)
    const toggle = host.querySelector<HTMLElement>("ui-menu.PanelMenu ui-item[link]")!
    expect(toggle.textContent?.trim()).toBe("Show Rule Names")

    toggle.click()
    flush()
    expect(editor.showingMatchRuleNames).toBe(false)
    expect(viewer.classList.contains("compact")).toBe(false)
    expect(toggle.textContent?.trim()).toBe("Hide Rule Names")
  })
})

/** `source` parsed as a spell block. */
function parse(source: string): P.Match {
  return spellParser.getScope("MatchViewer.browser.test").parse(source, "block")! as P.Match
}

/** Text of each token under `host`. */
function values(host: HTMLElement): string[] {
  return [...host.querySelectorAll(".Token > .value")].map((value) => value.textContent ?? "")
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

/** Set `editor[key]`, restored after the test. */
function setEditor<K extends keyof EditorStore>(key: K, value: EditorStore[K]) {
  const before = editor[key]
  editor[key] = value
  cleanups.push(() => (editor[key] = before))
}
