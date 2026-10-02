import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { flush } from "solid-js"
import { render } from "@solidjs/web"
import { memoryHistory, type MemoryHistoryAdapter } from "@solidjs/router"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { SP } from "$/spell"
import { editor, type EditorStore } from "$/app/editor"
import { uiReady } from "$/app/solid"
import { navigate } from "$/app/pages/navigation"
import { Routes, createAppRouter } from "$/app/pages/routes"
import { EDITOR_HOTKEYS, editorHotkeys } from "$/app/pages/editorHotkeys"

/**
 * The pages, in the browser:  the router (`routes.tsx`) draws the page each URL names and hands its params to
 * `editor.selectPath()`;  `editor` navigates through it (`navigation.ts`);  the editor page's hotkeys.
 * - `editor.selectPath()` is a spy:  a real one loads projects from the API server, which tests don't have.  So
 *   `editor.file` stays unset and the panes draw empty.
 * - Each router runs on `memoryHistory()`, never the browser's:  the test page's own URL stays put.
 */

/** Undo for each test:  unmount, restore `editor` fields and spies. */
const cleanups: (() => void)[] = []

beforeEach(() => {
  // project roots load from the API server, which tests don't have
  const load = vi.spyOn(SP.SpellProjectRoot.prototype, "load").mockResolvedValue(undefined as never)
  cleanups.push(() => load.mockRestore())
})

afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup()
})

describe("routes", () => {
  test.each([
    ["/", "ProjectChooser", undefined],
    ["/anything/else", "ProjectChooser", undefined],
    ["/edit/examples", "SpellEditor", "@system:examples"],
    ["/edit/examples/Todos", "SpellEditor", "@system:examples:Todos"],
    ["/edit/examples/Todos/Todo.spell", "SpellEditor", "@system:examples:Todos/Todo.spell"],
    ["/run/examples", "SpellRunner", "@system:examples"],
    ["/run/examples/Todos", "SpellRunner", "@system:examples:Todos"],
    ["/run/examples/Todos/sub/Todo.spell", "SpellRunner", "@system:examples:Todos/sub/Todo.spell"]
  ])("%s draws #%s and selects %s", async (url, pageId, path) => {
    const selectPath = spyOnEditor("selectPath", () => Promise.resolve())
    setEditor("projectPage", pageId === "SpellRunner" ? "editor" : "runner")
    const { host } = await mountAt(url)
    expect(host.querySelector(".SpellPage")?.id).toBe(pageId)
    if (path === undefined) {
      expect(selectPath).not.toHaveBeenCalled()
      return
    }
    expect(selectPath).toHaveBeenCalledWith(path)
    expect(editor.projectPage).toBe(pageId === "SpellEditor" ? "editor" : "runner")
  })

  test("`navigate()` (what `editor` calls) moves the router;  another URL of the same page keeps it", async () => {
    const selectPath = spyOnEditor("selectPath", () => Promise.resolve())
    const { host, history } = await mountAt("/edit/examples/Todos")
    const page = host.querySelector("#SpellEditor")

    navigate("/edit/examples/Todos/Other.spell")
    await settle(host)
    expect(history.get()).toBe("/edit/examples/Todos/Other.spell")
    expect(selectPath).toHaveBeenLastCalledWith("@system:examples:Todos/Other.spell")
    // another of the route's paths:  the page stays as it is
    expect(host.querySelector("#SpellEditor")).toBe(page)

    navigate("/run/examples/Todos", { replace: true })
    await settle(host)
    expect(host.querySelector("#SpellEditor")).toBeNull()
    expect(host.querySelector("#SpellRunner")).not.toBeNull()
    expect(selectPath).toHaveBeenLastCalledWith("@system:examples:Todos")

    // `replace` took the editor's entry's place:  back is the first page
    history.back()
    await settle(host)
    expect(history.get()).toBe("/edit/examples/Todos")
  })

  test("a page's `<AppRoot>` is where programs draw, until another takes over", async () => {
    spyOnEditor("selectPath", () => Promise.resolve())
    const setAppRoot = vi.spyOn(editor, "setAppRoot")
    const releaseAppRoot = vi.spyOn(editor, "releaseAppRoot")
    cleanups.push(() => {
      setAppRoot.mockRestore()
      releaseAppRoot.mockRestore()
    })
    const { host } = await mountAt("/edit/examples/Todos")
    // by identity:  `toHaveBeenCalledWith()` compares elements by their markup, and both pages' look alike
    const editorRoot = host.querySelector("#SpellEditor #spell-app-root")!
    expect(setAppRoot.mock.lastCall?.[0]).toBe(editorRoot)

    navigate("/run/examples/Todos")
    await settle(host)
    const runnerRoot = host.querySelector("#SpellRunner #spell-app-root")!
    expect(runnerRoot).not.toBe(editorRoot)
    expect(setAppRoot.mock.lastCall?.[0]).toBe(runnerRoot)
    expect(releaseAppRoot.mock.calls.map(([element]) => element)).toEqual([editorRoot])
    expect(releaseAppRoot.mock.calls[0][0]).toBe(editorRoot)
  })
})

describe("editor hotkeys", () => {
  test.each([
    ["Mod+S", { key: "s", metaKey: true }, "saveFile"],
    ["Ctrl+S", { key: "s", ctrlKey: true }, "saveFile"],
    ["Mod+Shift+R", { key: "R", metaKey: true, shiftKey: true }, "reloadFile"],
    ["Mod+Enter", { key: "Enter", metaKey: true }, "compileApp"],
    ["Mod+N", { key: "n", metaKey: true }, "createFile"]
  ] as const)("%s calls `editor.%s()`, instead of the browser's own", async (_name, init, method) => {
    const spies = spyOnHotkeys()
    await mountHotkeys()
    const event = keydown(document.body, init)
    expect(spies[method]).toHaveBeenCalledTimes(1)
    expect(event.defaultPrevented).toBe(true)
    for (const [other, spy] of Object.entries(spies)) if (other !== method) expect(spy, other).not.toHaveBeenCalled()
  })

  test("no Mod, a key typed into a field, or a key handled already:  nothing", async () => {
    const spies = spyOnHotkeys()
    const host = await mountHotkeys()
    const input = document.createElement("input")
    host.append(input)
    keydown(document.body, { key: "s" })
    keydown(document.body, { key: "r", metaKey: true }) // no Shift:  the browser's reload
    keydown(input, { key: "s", metaKey: true })
    const handled = new KeyboardEvent("keydown", { key: "s", metaKey: true, bubbles: true, cancelable: true })
    handled.preventDefault()
    document.body.dispatchEvent(handled)
    for (const [name, spy] of Object.entries(spies)) expect(spy, name).not.toHaveBeenCalled()
  })

  test("the listener goes with the page", async () => {
    const spies = spyOnHotkeys()
    await mountHotkeys()
    cleanups.pop()!() // unmount
    keydown(document.body, { key: "s", metaKey: true })
    expect(spies.saveFile).not.toHaveBeenCalled()
  })
})

////////////////
// ## Helpers
////////////////

/** Draw the app's `<Routes>` at `url`, on a memory history.  Resolves once its `<ui-*>` are ready. */
async function mountAt(url: string): Promise<{ host: HTMLElement; history: MemoryHistoryAdapter }> {
  await uiReady
  const history = memoryHistory(url)
  const router = createAppRouter(history)
  const host = document.createElement("div")
  document.body.append(host)
  const dispose = render(() => <Routes router={router} />, host)
  cleanups.push(() => {
    dispose()
    host.remove()
  })
  await settle(host)
  return { host, history }
}

/** Draw a component that turns the editor page's hotkeys on. */
async function mountHotkeys(): Promise<HTMLElement> {
  const host = document.createElement("div")
  document.body.append(host)
  const dispose = render(() => {
    editorHotkeys()
    return <span>page</span>
  }, host)
  cleanups.push(() => {
    dispose()
    host.remove()
  })
  flush()
  await Promise.resolve()
  flush()
  return host
}

/** Flush Solid, let a microtask or two pass (the router's, `ui-*`'s), flush again. */
async function settle(host: HTMLElement) {
  flush()
  await new Promise((resolve) => setTimeout(resolve, 0))
  flush()
  await ElementFixture.settle(host)
}

/** Fire a `keydown` at `target` like a user's, and return it. */
function keydown(target: EventTarget, init: KeyboardEventInit): KeyboardEvent {
  const event = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, composed: true, ...init })
  target.dispatchEvent(event)
  return event
}

/** Spy on every `editor` method `EDITOR_HOTKEYS` runs. */
function spyOnHotkeys() {
  expect(EDITOR_HOTKEYS).toHaveLength(4)
  return {
    saveFile: spyOnEditor("saveFile", () => Promise.resolve()),
    reloadFile: spyOnEditor("reloadFile", () => Promise.resolve()),
    compileApp: spyOnEditor("compileApp", () => Promise.resolve()),
    createFile: spyOnEditor("createFile", () => Promise.resolve())
  }
}

/** Set `editor[key]`, restored after the test. */
function setEditor<K extends keyof EditorStore>(key: K, value: EditorStore[K]) {
  const before = editor[key]
  editor[key] = value
  cleanups.push(() => (editor[key] = before))
}

/** Replace `editor[key]` with a spy (calling `implementation`), restored after the test. */
function spyOnEditor<K extends keyof EditorStore>(key: K, implementation?: (...args: never[]) => unknown) {
  const spy = vi.fn(implementation)
  setEditor(key, spy as unknown as EditorStore[K])
  return spy
}
