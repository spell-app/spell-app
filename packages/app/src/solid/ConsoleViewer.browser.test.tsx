import { afterEach, beforeAll, describe, expect, test, vi } from "vitest"
import { flush } from "solid-js"
import { render, type JSX } from "@solidjs/web"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { P } from "$/parser"
import { editor, type EditorStore } from "$/app/editor"
import { uiReady } from "$/app/solid"
import type { SpellRuntime } from "$/app/runner"
import { ConsoleInspectorContext, ConsoleLines, type ConsoleInspector } from "./ConsoleLines"
import { ConsoleRoot, ConsoleViewer, EDITOR_INSPECTOR } from "./ConsoleViewer"

/**
 * The console (`ConsoleLines.tsx`, `ConsoleViewer.tsx`) in the browser:  Solid's client build, so `flush()` after
 * an `easy-state` write before asserting.
 * - Lines come from the editor's REAL runtime console (`editor.loadRuntime()`), as in the app.
 */

/** The runtime's console, cleared before each test. */
let output: SpellRuntime["spellCore"]["console"]

/** Undo for each test:  unmount, restore `editor` fields. */
const cleanups: (() => void)[] = []

beforeAll(async () => {
  output = (await editor.loadRuntime()).spellCore.console
})

afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup()
  output.clear()
})

describe("<ConsoleViewer>", () => {
  test("draws the runtime console's lines, by level, each value styled by type", async () => {
    quietly(() => {
      output.log("hello", 42)
      output.warn("careful")
      output.error("broken")
    })
    const host = await mount(() => <ConsoleViewer scrolling />)
    expect(host.querySelector(".ConsoleViewer")!.classList.contains("scrolling")).toBe(true)
    const rows = lineRows(host)
    expect(rows.map((row) => row.className)).toEqual(["debug ConsoleLine", "warn ConsoleLine", "error ConsoleLine"])
    expect(rows.map(text)).toEqual(["hello42", "careful", "broken"])
    const [hello, number] = rows[0].querySelectorAll(".ConsoleValue")
    expect(hello.className).toBe("ConsoleValue string")
    expect(number.className).toBe("ConsoleValue number")
    expect(rows[0].style.paddingLeft).toBe("20px")
  })

  test("a line logged shows after `flush()`, and the rows already there stay", async () => {
    quietly(() => output.log("first"))
    const host = await mount(() => <ConsoleViewer />)
    const [first] = lineRows(host)
    expect(text(first)).toBe("first")

    quietly(() => output.log("second"))
    flush()
    const rows = lineRows(host)
    expect(rows.map(text)).toEqual(["first", "second"])
    // same node:  the first row wasn't drawn again
    expect(rows[0]).toBe(first)
  })

  test("a group collapses and expands;  a line logged into an open group shows", async () => {
    quietly(() => {
      output.group("Compiling")
      output.log("inside")
    })
    const host = await mount(() => <ConsoleViewer />)
    const group = host.querySelector<HTMLElement>(".ConsoleLine.group")!
    expect(text(group)).toBe("▼Compiling")
    // the group's line has no left padding:  its icon fills it
    expect(group.style.paddingLeft).toBe("0px")
    const inside = host.querySelector<HTMLElement>(".ConsoleLines .ConsoleLines .ConsoleLine")!
    expect(text(inside)).toBe("inside")
    expect(inside.style.paddingLeft).toBe("32px")

    quietly(() => {
      output.log("later")
      output.groupEnd()
    })
    flush()
    expect(lineRows(host).map(text)).toEqual(["▼Compiling", "inside", "later"])

    toggleOf(group).click()
    flush()
    expect(text(group)).toBe("▶Compiling")
    expect(lineRows(host).map(text)).toEqual(["▶Compiling"])

    toggleOf(group).click()
    flush()
    expect(lineRows(host).map(text)).toEqual(["▼Compiling", "inside", "later"])
  })

  test("`groupCollapsed()` starts collapsed", async () => {
    quietly(() => {
      output.groupCollapsed("Quiet")
      output.log("hidden")
      output.groupEnd()
    })
    const host = await mount(() => <ConsoleViewer />)
    expect(lineRows(host).map(text)).toEqual(["▶Quiet"])
  })

  test("clearing the console empties it", async () => {
    quietly(() => output.log("gone soon"))
    const host = await mount(() => <ConsoleViewer />)
    expect(lineRows(host)).toHaveLength(1)
    output.clear()
    flush()
    expect(lineRows(host)).toHaveLength(0)
  })

  test("an error drawing a line shows in place of the lines, and goes to `showError`", async () => {
    const showError = vi.fn()
    // a value whose `constructor` throws when `<ConsoleObject>` asks for its type
    const poison = new Proxy(
      {},
      {
        get() {
          throw new Error("Poisoned")
        }
      }
    )
    output.lines = [...output.lines, { level: "debug", message: [poison] }]
    const host = await mount(() => <ConsoleViewer showError={showError} />)
    const message = host.querySelector(".ConsoleViewer ui-message")!
    expect(message.getAttribute("state")).toBe("error")
    expect(text(message)).toBe("Poisoned")
    expect(showError).toHaveBeenCalledWith(expect.objectContaining({ message: "Poisoned" }))
  })
})

describe("<ConsoleRoot>", () => {
  test("a toolbar over the viewer, unless `showToolbar={false}`", async () => {
    const host = await mount(() => <ConsoleRoot />)
    const root = host.querySelector(".ConsoleRoot")!
    expect(text(root.querySelector("ui-menu.PanelMenu ui-item[type=header]")!)).toBe("Program Output")
    expect(root.querySelector(".ConsoleViewer")!.classList.contains("scrolling")).toBe(true)

    const bare = await mount(() => <ConsoleRoot showToolbar={false} scrolling={false} />)
    expect(bare.querySelector("ui-menu")).toBeNull()
    expect(bare.querySelector(".ConsoleViewer")!.classList.contains("scrolling")).toBe(false)
  })

  test("the toolbar's Clear Console clears it", async () => {
    quietly(() => output.log("clear me"))
    const host = await mount(() => <ConsoleRoot />)
    const clear = [...host.querySelectorAll<HTMLElement>("ui-item")].find((item) => text(item) === "Clear Console")!
    expect(clear.hasAttribute("disabled")).toBe(false)
    clear.click()
    flush()
    expect(lineRows(host)).toHaveLength(0)
    expect(clear.hasAttribute("disabled")).toBe(true)
  })
})

describe("ConsoleInspector", () => {
  /** A class an inspector knows. */
  class Special {}

  test("`describe()` names the objects it knows;  clicking one logs it as `it`, then `inspect()`s it", async () => {
    const special = new Special()
    const plain = { a: 1 }
    const inspector = {
      describe: (thing: object) => (thing instanceof Special ? "Special!" : undefined),
      inspect: vi.fn()
    } satisfies ConsoleInspector
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    cleanups.push(() => log.mockRestore())
    const host = await mount(() => (
      <div class="ConsoleViewer">
        <ConsoleInspectorContext value={inspector}>
          <ConsoleLines lines={[{ level: "info", message: [special, plain, "text"] }]} />
        </ConsoleInspectorContext>
      </div>
    ))
    const [first, second, third] = host.querySelectorAll<HTMLElement>(".ConsoleValue")
    expect(text(first)).toBe("Special!")
    expect(first.className).toBe("ConsoleValue Special observable")
    expect(text(second)).toBe("Object {...}")
    expect(third.classList.contains("observable")).toBe(false)

    first.click()
    expect((globalThis as { it?: unknown }).it).toBe(special)
    expect(inspector.inspect).toHaveBeenCalledWith(special)
    third.click()
    expect(inspector.inspect).toHaveBeenCalledTimes(1)
  })

  test("without one, objects show by class;  functions, dates and arrays have their own look", async () => {
    const host = await mount(() => (
      <ConsoleLines lines={[{ level: "debug", message: [new Special(), {}, () => 1, [1, 2], null, new Date(0)] }]} />
    ))
    const shown = [...host.querySelectorAll(".ConsoleValue")].map(text)
    expect(shown.slice(0, -1)).toEqual(["Special {}", "Object {}", "ƒ {...}", "Array(2)", "null"])
    expect(shown.at(-1)).toMatch(/^Date \(.+\)$/)
  })

  test("the editor's knows parser `Match`es:  clicking one shows it in the editor", () => {
    const showMatch = vi.fn(() => Promise.resolve())
    setEditor("showMatch", showMatch)
    const match = Object.assign(Object.create(P.Match.prototype) as P.Match, { rule: {} })
    expect(EDITOR_INSPECTOR.describe!(match)).toBe("Match {...}")
    expect(EDITOR_INSPECTOR.describe!({})).toBeUndefined()
    EDITOR_INSPECTOR.inspect!({})
    expect(showMatch).not.toHaveBeenCalled()
    EDITOR_INSPECTOR.inspect!(match)
    expect(showMatch).toHaveBeenCalledWith(match)
  })
})

/** Render `component` into a fresh `<div>` in the page, wait for its `<ui-*>` elements;  unmounted after the test. */
async function mount(component: () => JSX.Element): Promise<HTMLElement> {
  await uiReady
  const host = document.createElement("div")
  document.body.append(host)
  const dispose = render(component, host)
  cleanups.push(() => {
    dispose()
    host.remove()
  })
  flush()
  await ElementFixture.settle(host)
  return host
}

/** Every console line drawn in `host`, nested ones included, in order. */
function lineRows(host: Element): HTMLElement[] {
  return [...host.querySelectorAll<HTMLElement>(".ConsoleLine")]
}

/** The disclosure triangle of group line `group`. */
function toggleOf(group: Element): HTMLElement {
  return group.querySelector<HTMLElement>(".ConsoleGroupIcon > span")!
}

/** Text of `element`, trimmed. */
function text(element: Element): string {
  return element.textContent?.trim() ?? ""
}

/** Run `log`, keeping the native `console` calls `spellCore.console` forwards to out of the test output. */
function quietly(log: () => void) {
  const spies = (["log", "info", "warn", "error", "group", "groupCollapsed", "groupEnd"] as const).map((method) =>
    vi.spyOn(console, method).mockImplementation(() => {})
  )
  try {
    log()
  } finally {
    for (const spy of spies) spy.mockRestore()
  }
}

/** Set `editor[key]`, restored after the test. */
function setEditor<K extends keyof EditorStore>(key: K, value: EditorStore[K]) {
  const before = editor[key]
  editor[key] = value
  cleanups.push(() => (editor[key] = before))
}
