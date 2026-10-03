import { afterEach, beforeAll, describe, expect, test, vi } from "vite-plus/test"
import { flush } from "solid-js"
import { render } from "@solidjs/web"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { UI as SpellUI } from "$/ui"
import { editor, type EditorStore } from "$/app/editor"
import {
  Actions,
  ErrorBoundary,
  MoreMenu,
  Notice,
  PanelMenu,
  Submenu,
  addAppIconsPageWide,
  uiReady,
  type ActionProps
} from "$/app/solid"

/**
 * The shared Solid UI (`chrome.tsx`, `Actions.tsx`, `ErrorBoundary.tsx`, `Notice.tsx`) on real `<ui-*>` elements,
 * in the browser:  Solid's client build, so `flush()` before asserting.
 */

/** Undo for each test:  unmount, restore `editor` fields. */
const cleanups: (() => void)[] = []

// as the editor app's entry does:  its icon names are Fomantic's
beforeAll(() => addAppIconsPageWide())

afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup()
})

describe("loadUI", () => {
  test("with `addAppIconsPageWide()`, the app's Fomantic icon names draw", async () => {
    await uiReady
    await SpellUI.icons.ready
    for (const name of ["ellipsis horizontal", "app store ios", "trash alternate outline", "caret right"]) {
      expect(SpellUI.icons.resolve(name)?.pack, name).toBe("fomantic")
      expect(await SpellUI.icons.get(name), name).toBeInstanceOf(SVGSVGElement)
    }
  })
})

describe("chrome + Actions", () => {
  test("a `<PanelMenu>` of `<Submenu>`s holds `<ui-item>` actions", async () => {
    const host = await mount(() => (
      <PanelMenu>
        <Submenu left>
          <Actions.aboutSpell />
          <Actions.saveFile />
        </Submenu>
        <Submenu right spring>
          <Actions.showHelp button />
        </Submenu>
      </PanelMenu>
    ))
    const menu = host.querySelector("ui-menu.PanelMenu")!
    expect(menu.getAttribute("color")).toBe("purple")
    expect(menu.getAttribute("attached")).toBe("top")
    const [left, right] = menu.querySelectorAll(":scope > ui-menu")
    expect(left.getAttribute("position")).toBe("left")
    expect(left.classList.contains("third")).toBe(true)
    expect(right.getAttribute("position")).toBe("right")
    expect([...left.querySelectorAll("ui-item")].map(text)).toEqual(["About Spell", "Save"])
    // in a menu, the icon is a slotted `<ui-icon>` (see `<Action>`), and it draws
    const icon = left.querySelector("ui-item > ui-icon")!
    expect(icon.getAttribute("name")).toBe("wizard")
    await expect
      .poll(() => icon.shadowRoot?.querySelector("svg")?.getBoundingClientRect().width ?? 0)
      .toBeGreaterThan(0)
    // `spring` on a right section:  a `<Spring>` before its items
    expect(right.firstElementChild!.matches("ui-item.spring")).toBe(true)
    expect(text(right.querySelector("ui-button")!)).toBe("Help")
  })

  test("clicking an item's box runs its action", async () => {
    const aboutSpell = spyOnEditor("aboutSpell")
    const host = await mount(() => (
      <PanelMenu>
        <Actions.aboutSpell />
      </PanelMenu>
    ))
    const box = host.querySelector("ui-item")!.shadowRoot!.querySelector<HTMLElement>("[part=item]")!
    expect(box.localName).toBe("button")
    box.click()
    expect(aboutSpell).toHaveBeenCalledTimes(1)
  })

  test("call-site props win over the entry's", async () => {
    const onClick = vi.fn()
    const host = await mount(() => <Actions.aboutSpell title="About" onClick={onClick} />)
    const item = host.querySelector<HTMLElement>("ui-item")!
    expect(text(item)).toBe("About")
    item.click()
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  test("entries follow `editor` through `tracked()`", async () => {
    setEditor("projectRoot", undefined)
    setEditor("file", undefined)
    const host = await mount(() => (
      <PanelMenu>
        <Actions.showEditor />
        <Actions.saveFile />
      </PanelMenu>
    ))
    const [showEditor, saveFile] = host.querySelectorAll("ui-item")
    expect(text(showEditor)).toBe("Edit Project")
    expect(saveFile.hasAttribute("selected")).toBe(false)

    editor.projectRoot = { Type: "Example" } as EditorStore["projectRoot"]
    editor.file = { isDirty: true } as EditorStore["file"]
    flush()
    expect(text(showEditor)).toBe("Edit Example")
    expect(saveFile.hasAttribute("selected")).toBe(true)
    expect((saveFile as HTMLElement & { selected?: boolean }).selected).toBe(true)
  })

  test("a dialog action shows its dialog with the other props, and hands on the value", async () => {
    const confirm = spyOnEditor("confirm", () => Promise.resolve(true))
    const callback = vi.fn()
    const host = await mount(() => <Actions.confirm message="Sure?" title="Ask" callback={callback} />)
    const item = host.querySelector<HTMLElement>("ui-item")!
    expect(text(item)).toBe("Ask")
    expect(item.querySelector("ui-icon")!.getAttribute("name")).toBe("question circle")
    item.click()
    expect(confirm).toHaveBeenCalledWith({ message: "Sure?" })
    await Promise.resolve()
    expect(callback).toHaveBeenCalledWith(true)
  })

  test("`<MoreMenu>`:  choosing an option clicks its item, and the dropdown keeps no value", async () => {
    const createFile = spyOnEditor("createFile")
    const host = await mount(() => (
      <MoreMenu>
        <Actions.FILE_DROPDOWN_ACTIONS />
      </MoreMenu>
    ))
    const dropdown = host.querySelector("ui-dropdown") as HTMLElement & { open: boolean; value: unknown }
    expect([...dropdown.querySelectorAll(":scope > ui-item")].map(text)).toEqual([
      "New File",
      "Duplicate File",
      "Rename File",
      "Delete File"
    ])
    expect(dropdown.querySelector(":scope > ui-icon")!.getAttribute("name")).toBe("ellipsis horizontal")
    // in a dropdown, items are data:  the icon is the item's attribute, no element children
    const first = dropdown.querySelector(":scope > ui-item")!
    expect(first.getAttribute("icon")).toBe("pencil")
    expect(first.children.length).toBe(0)

    dropdown.open = true
    await ElementFixture.tick()
    const option = [...dropdown.shadowRoot!.querySelectorAll<HTMLElement>("[role=option]")].find(
      (row) => row.textContent?.trim() === "New File"
    )!
    option.click()
    await ElementFixture.tick()
    expect(createFile).toHaveBeenCalledTimes(1)
    expect(dropdown.value).toBe("")
  })

  test("`<MoreMenu stub>` is a disabled item", async () => {
    const host = await mount(() => <MoreMenu stub />)
    const item = host.querySelector("ui-item")!
    expect(host.querySelector("ui-dropdown")).toBeNull()
    expect(item.hasAttribute("disabled")).toBe(true)
    expect(item.querySelector("ui-icon")!.getAttribute("name")).toBe("ellipsis horizontal")
  })
})

describe("<ErrorBoundary>", () => {
  test("a throwing child shows the fallback, and `onError` hears of it", async () => {
    const onError = vi.fn()
    const host = await mount(() => (
      <ErrorBoundary onError={onError}>
        <Thrower />
      </ErrorBoundary>
    ))
    const message = host.querySelector("ui-message")!
    expect(message.getAttribute("state")).toBe("error")
    expect(message.getAttribute("header")).toBe("Error")
    expect(text(message)).toBe("Broken on purpose")
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: "Broken on purpose" }))
  })

  test("a custom `fallback`", async () => {
    const host = await mount(() => (
      <ErrorBoundary fallback={(error) => <p class="oops">{error.message}</p>}>
        <Thrower />
      </ErrorBoundary>
    ))
    expect(host.querySelector(".oops")!.textContent).toBe("Broken on purpose")
  })

  test("children that don't throw render as is", async () => {
    const host = await mount(() => (
      <ErrorBoundary>
        <p class="fine">Fine</p>
      </ErrorBoundary>
    ))
    expect(host.querySelector(".fine")!.textContent).toBe("Fine")
    expect(host.querySelector("ui-message")).toBeNull()
  })
})

describe("<Notice>", () => {
  test("shows `editor.notice`;  its close button hides it", async () => {
    setEditor("notice", undefined)
    const host = await mount(() => <Notice autoHide={false} />)
    expect(host.querySelector("ui-message")).toBeNull()

    editor.notice = "Saved"
    flush()
    const message = host.querySelector("ui-message")!
    expect(message.getAttribute("header")).toBe("Saved")
    await ElementFixture.settle(host)
    message.shadowRoot!.querySelector<HTMLElement>("[part=close]")!.click()
    flush()
    expect(editor.notice).toBeUndefined()
    expect(host.querySelector("ui-message")).toBeNull()
  })
})

/****************
 * ### `<Thrower>`
 * Throws while rendering.
 ****************/
function Thrower(_props: ActionProps): never {
  throw new Error("Broken on purpose")
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
