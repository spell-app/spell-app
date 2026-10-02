import { afterEach, describe, expect, test, vi } from "vitest"
import { flush } from "solid-js"
import { render } from "@solidjs/web"

import { getPref, reactiveObject, resetPref, setPref } from "$/util"
import { ElementFixture } from "$/ui/test/ElementFixture"
import type { SP } from "$/spell"
import { editor, type EditorStore } from "$/app/editor"
import { ProjectDropdown, ProjectMenu, SpellPage, SplitPane, SplitPanel, normalizeSizes, uiReady } from "$/app/solid"

/**
 * The pages' shell in the browser (P8):  `<SplitPanel>` (sizes, dragging a sizer), `<SpellPage>`,
 * `<ProjectMenu>` / `<ProjectDropdown>` on a fake project root.
 */

/** Undo for each test:  unmount, restore `editor` fields, forget prefs. */
const cleanups: (() => void)[] = []

afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup()
})

describe("<SplitPanel>", () => {
  test("sizes:  `%` shares, fixed sizes, `*` for the rest", () => {
    expect(normalizeSizes("30%", 2)).toEqual([
      { value: 30, units: "%" },
      { value: 70, units: "%" }
    ])
    expect(normalizeSizes(["*", "*", 200], 3)).toEqual([
      { value: 50, units: "%" },
      { value: 50, units: "%" },
      { value: 200, units: "px" }
    ])
    expect(normalizeSizes(true, 4).map((size) => size.value)).toEqual([25, 25, 25, 25])
    expect(normalizeSizes("10%,2em,90%", 2)).toEqual([
      { value: 10, units: "%" },
      { value: 2, units: "em" }
    ])
  })

  test("wraps each child in a pane, sized, with a sizer between;  a `<SplitPane>` or panel stays as it is", async () => {
    const host = await mount(() => (
      <SplitPanel columns="25%,*,100px" resizable rounded style={{ width: "800px", height: "200px" }}>
        <div class="one">one</div>
        <SplitPane class="two" bordered>
          two
        </SplitPane>
        <SplitPanel rows>
          <div>a</div>
          <div>b</div>
        </SplitPanel>
      </SplitPanel>
    ))
    const panel = host.querySelector<HTMLElement>(".SplitPanel")!
    expect(panel.classList.contains("horizontal")).toBe(true)
    const children = [...panel.children] as HTMLElement[]
    expect(children.map((child) => child.className)).toEqual([
      "SplitPanelPane rounded",
      "SplitPanelSizer",
      "SplitPanelPane bordered two",
      "SplitPanelSizer",
      "SplitPanel vertical"
    ])
    expect(children[0].firstElementChild!.className).toBe("one")
    expect([children[0], children[2], children[4]].map((pane) => pane.style.flex)).toEqual([
      "25 25 0px",
      "75 75 0px",
      "0 0 100px"
    ])
    // nested:  its own two panes, half each, and no sizer (not `resizable`)
    const nested = [...children[4].children] as HTMLElement[]
    expect(nested.map((pane) => pane.style.flex)).toEqual(["50 50 0px", "50 50 0px"])
  })

  test("dragging a sizer resizes the panes beside it, and remembers the sizes under `id`", async () => {
    const id = "SplitPanel.browser.test"
    resetPref(id)
    cleanups.push(() => resetPref(id))
    const host = await mount(() => (
      <SplitPanel id={id} columns resizable style={{ width: "600px", height: "100px" }}>
        <div>left</div>
        <div>right</div>
      </SplitPanel>
    ))
    const [left, sizer, right] = [...host.querySelector(".SplitPanel")!.children] as HTMLElement[]
    expect([left.style.flex, right.style.flex]).toEqual(["50 50 0px", "50 50 0px"])

    const start = sizer.getBoundingClientRect()
    const x = start.left + start.width / 2
    const y = start.top + start.height / 2
    sizer.dispatchEvent(mouse("mousedown", x, y))
    document.dispatchEvent(mouse("mousemove", x - 150, y))
    document.dispatchEvent(mouse("mouseup", x - 150, y))
    const leftShare = parseFloat(left.style.flex)
    expect(leftShare).toBeGreaterThan(20)
    expect(leftShare).toBeLessThan(30)
    expect(parseFloat(right.style.flex)).toBeCloseTo(100 - leftShare, 1)
    expect(getPref(id, undefined)).toBe(`${leftShare}%,${100 - leftShare}%`)
    // let go:  moving on does nothing
    document.dispatchEvent(mouse("mousemove", x + 100, y))
    expect(parseFloat(left.style.flex)).toBe(leftShare)

    // never smaller than `minSize`
    sizer.dispatchEvent(mouse("mousedown", x, y))
    document.dispatchEvent(mouse("mousemove", 0, y))
    document.dispatchEvent(mouse("mouseup", 0, y))
    expect(parseFloat(left.style.flex)).toBe(5)
  })

  test("a remembered size wins over `columns` / `rows`", async () => {
    const id = "SplitPanel.browser.test.remembered"
    setPref(id, "70%,30%")
    cleanups.push(() => resetPref(id))
    const host = await mount(() => (
      <SplitPanel id={id} rows="20%" resizable>
        <div>top</div>
        <div>bottom</div>
      </SplitPanel>
    ))
    const panes = host.querySelectorAll<HTMLElement>(".SplitPanelPane")
    expect([...panes].map((pane) => pane.style.flex)).toEqual(["70 70 0px", "30 30 0px"])
  })

  test("`spaced`, not `resizable`:  a spacer between the panes", async () => {
    const host = await mount(() => (
      <SplitPanel rows spaced="tightly">
        <div>top</div>
        <div>bottom</div>
      </SplitPanel>
    ))
    const panel = host.querySelector(".SplitPanel")!
    expect(panel.classList.contains("spaced")).toBe(true)
    expect(panel.classList.contains("tightly")).toBe(true)
    expect([...panel.children].map((child) => child.className)).toEqual(["SplitPanelPane", "Spacer", "SplitPanelPane"])
  })
})

describe("<SpellPage>", () => {
  test("a class per variant;  other props go to the `<div>`", async () => {
    const host = await mount(() => (
      <SpellPage id="Page" fillWindow dark rows title="hello">
        content
      </SpellPage>
    ))
    const page = host.querySelector("#Page")!
    expect([...page.classList].sort()).toEqual(["SpellPage", "dark", "fill-window", "rows"])
    expect(page.getAttribute("title")).toBe("hello")
    expect(page.hasAttribute("fillWindow")).toBe(false)
    expect(page.textContent).toBe("content")
  })
})

describe("<ProjectMenu> / <ProjectDropdown>", () => {
  test("`<ProjectMenu>`:  loads its root, then lists its projects;  choosing one shows it", async () => {
    const showEditor = spyOnEditor("showEditor")
    const showRunner = spyOnEditor("showRunner")
    const root = fakeRoot(false)
    const host = await mount(() => (
      <>
        <ProjectMenu class="editing" vertical="" projectRoot={root} />
        <ProjectMenu class="running" projectRoot={root} useRunner />
      </>
    ))
    const editing = host.querySelector("ui-menu.ProjectMenu.editing")!
    expect(editing.hasAttribute("vertical")).toBe(true)
    expect(root.load).toHaveBeenCalled()
    expect(text(editing)).toBe("Loading...")

    Object.assign(root, { isLoaded: true })
    flush()
    await ElementFixture.settle(host)
    const items = [...editing.querySelectorAll<HTMLElement>(":scope > ui-item")]
    expect(items.map(text)).toEqual(["Todos", "Solitaire"])
    expect(items[0].querySelector("ui-icon")!.getAttribute("name")).toBe("app store ios")
    items[1].click()
    expect(showEditor).toHaveBeenCalledWith("@system:examples:Solitaire")
    host.querySelector<HTMLElement>("ui-menu.running > ui-item")!.click()
    expect(showRunner).toHaveBeenCalledWith("@system:examples:Todos")
  })

  test("`<ProjectMenu>`:  a root that fails to load says so", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    cleanups.push(() => warn.mockRestore())
    const root = fakeRoot(false)
    root.load = vi.fn(() => Promise.reject(new Error("no such folder")))
    const host = await mount(() => <ProjectMenu projectRoot={root} />)
    await expect.poll(() => (flush(), text(host.querySelector("ui-menu")!))).toBe("Couldn't load Examples")
    expect(warn).toHaveBeenCalled()
  })

  test("`<ProjectDropdown>`:  `editor.projectRoot`'s projects, showing `editor.project`;  choosing one shows it", async () => {
    const showRunner = spyOnEditor("showRunner")
    const root = fakeRoot(true)
    setEditor("projectRoot", root)
    setEditor("project", undefined)
    const host = await mount(() => <ProjectDropdown useRunner />)
    const dropdown = host.querySelector<HTMLElement & { value: string }>("ui-dropdown.ProjectDropdown")!
    expect(text(host.querySelector("ui-item.dropdown-label")!)).toBe("Example:")
    // no project yet:  loading
    expect(dropdown.hasAttribute("loading")).toBe(true)
    expect(dropdown.querySelectorAll("ui-item")).toHaveLength(0)

    editor.project = { path: "@system:examples:Todos" } as EditorStore["project"]
    flush()
    await ElementFixture.settle(host)
    expect(dropdown.hasAttribute("loading")).toBe(false)
    expect(dropdown.value).toBe("@system:examples:Todos")
    const items = [...dropdown.querySelectorAll(":scope > ui-item")]
    expect(items.map((item) => [item.getAttribute("value"), text(item), item.getAttribute("icon")])).toEqual([
      ["@system:examples:Todos", "Todos", "app store ios"],
      ["@system:examples:Solitaire", "Solitaire", "app store ios"]
    ])

    dropdown.dispatchEvent(new CustomEvent("ui-change", { detail: { value: "@system:examples:Solitaire" } }))
    expect(showRunner).toHaveBeenCalledWith("@system:examples:Solitaire")
    // still showing `editor.project` until it changes
    expect(dropdown.value).toBe("@system:examples:Todos")
  })

  test("`<ProjectDropdown showLabel={false}>`:  no label", async () => {
    setEditor("projectRoot", fakeRoot(true))
    const host = await mount(() => <ProjectDropdown showLabel={false} />)
    expect(host.querySelector(".dropdown-label")).toBeNull()
    expect(host.querySelector("ui-item.ProjectDropdown > ui-dropdown")).not.toBeNull()
  })
})

////////////////
// ## Helpers
////////////////

/** A project root of two examples, as spell cells (as real ones are), `isLoaded` or not. */
function fakeRoot(isLoaded: boolean): SP.SpellProjectRoot & { load: ReturnType<typeof vi.fn> } {
  return reactiveObject({
    path: "@system:examples",
    isLoaded,
    projectPaths: ["@system:examples:Todos", "@system:examples:Solitaire"],
    icon: "app store ios",
    title: "Examples",
    Type: "Example",
    load: vi.fn(() => Promise.resolve())
  }) as unknown as SP.SpellProjectRoot & { load: ReturnType<typeof vi.fn> }
}

/** Draw `component` in a fresh `<div>`, once `<ui-*>` are defined.  Unmounted after the test. */
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

/** A left-button mouse event at `x`, `y`, bubbling. */
function mouse(type: string, x: number, y: number): MouseEvent {
  return new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0 })
}

/** Text of `element`, trimmed. */
function text(element: Element): string {
  return element.textContent?.trim() ?? ""
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
