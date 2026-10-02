import { afterEach, describe, expect, test, vi } from "vitest"
import { flush } from "solid-js"
import { render } from "@solidjs/web"

import { reactiveObject } from "$/util"
import type { SP } from "$/spell"
import { ElementFixture } from "$/ui/test/ElementFixture"
import { editor, type EditorStore } from "$/app/editor"
import type * as UIT from "$/app/ui/ui.types"
import { uiReady } from "$/app/solid"
import { FileDropdown } from "./FileDropdown"
import { InputEditor, InputRoot } from "./InputEditor"
import { LazyMonaco } from "./LazyMonaco"
import { OutputEditor } from "./OutputEditor"

/**
 * The Solid source editors on real Monaco, in the browser:  `<InputEditor>` (lazy `<FileEditor>`, its error
 * fallback), `<OutputEditor>`, `<FileDropdown>`.
 * - Files are FAKES, as spell cells (`reactiveObject()`):  a `.js` file (no parse) with just what `SpellModels` and `editor`
 *   read -- a real `SpellProject` loads from the API server, which tests don't have.
 */

/** Undo for each test:  unmount, restore `editor` fields. */
const cleanups: (() => void)[] = []

afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup()
})

describe("<InputEditor>", () => {
  test("loads Monaco lazily, shows `editor.file`'s text, and an edit reaches the file", async () => {
    const onFileEdited = spyOnEditor("onFileEdited")
    const file = fakeFile("test-project/one.js", "let one = 1\n")
    setEditor("file", file)
    const host = await mount(() => <InputEditor />)
    const inputEditor = await waitForInputEditor(host)
    expect(host.querySelector(".InputEditor .MonacoEditor .monaco-editor")).not.toBeNull()
    expect(inputEditor.getValue()).toBe("let one = 1\n")
    expect(inputEditor.getModel()!.getLanguageId()).toBe("javascript")

    // a user edit:  into the file, through `SpellModels`, and on to `editor` (connected by `LazyMonaco`)
    inputEditor.setPosition({ lineNumber: 2, column: 1 })
    inputEditor.trigger("keyboard", "type", { text: "two" })
    expect(file.contents).toBe("let one = 1\ntwo")
    expect(file.isDirty).toBe(true)
    expect(onFileEdited).toHaveBeenLastCalledWith(expect.objectContaining({ path: "test-project/one.js" }))
  })

  test("a new file remakes the editor;  `initialSelection` is selected once it's made", async () => {
    setEditor("file", fakeFile("test-project/one.js", "one\n"))
    const host = await mount(() => <InputEditor />)
    const first = await waitForInputEditor(host)

    const two = fakeFile("test-project/two.js", "abc def\n")
    two.initialSelection = { anchor: { line: 0, ch: 4, offset: 4 }, head: { line: 0, ch: 7, offset: 7 } }
    editor.file = two
    flush()
    await expect.poll(() => editor.getInputEditor() !== first && editor.getInputEditor()?.getValue()).toBe("abc def\n")
    const second = editor.getInputEditor()!
    expect(host.querySelectorAll(".monaco-editor")).toHaveLength(1)
    expect(second.getModel()!.getValueInRange(second.getSelection()!)).toBe("def")
    expect(two.initialSelection).toBeUndefined()
  })

  test("unmounting disposes of the editor;  `editor` forgets it", async () => {
    setEditor("file", fakeFile("test-project/one.js", "one\n"))
    const dispose = await mountKept(() => <InputEditor />)
    const inputEditor = await waitForInputEditor(dispose.host)
    const { monaco } = await import("$/app/solid/monaco")
    expect(monaco.editor.getEditors()).toContain(inputEditor)
    dispose()
    expect(monaco.editor.getEditors()).not.toContain(inputEditor)
    expect(editor.getInputEditor()).toBeUndefined()
  })

  test("an error shows the plain-text fallback editor, and tells `showError`", async () => {
    const showError = vi.fn()
    const onInputChanged = spyOnEditor("onInputChanged")
    const file = fakeFile("test-project/broken.js", "broken text")
    // `SpellModels.modelFor()` reads it:  the normal editor throws while rendering
    Object.defineProperty(file.project, "spellFiles", {
      get() {
        throw new Error("Broken on purpose")
      }
    })
    setEditor("file", file)
    const host = await mount(() => <InputEditor showError={showError} />)
    const fallback = await waitForInputEditor(host)
    expect(showError).toHaveBeenCalledWith(expect.objectContaining({ message: "Broken on purpose" }))
    expect(fallback.getValue()).toBe("broken text")
    expect(fallback.getModel()!.getLanguageId()).toBe("plaintext")

    fallback.setPosition({ lineNumber: 1, column: 12 })
    fallback.trigger("keyboard", "type", { text: "!" })
    expect(onInputChanged).toHaveBeenCalledWith("broken text!")
  })
})

describe("<OutputEditor>", () => {
  test("shows the compiled javascript, read-only;  its own model goes with it", async () => {
    const { monaco } = await import("$/app/solid/monaco")
    const modelsBefore = monaco.editor.getModels().length
    const file = fakeFile("test-project/one.js", "")
    Object.assign(file, { compiled: "export const one = 1" })
    setEditor("file", file)
    const dispose = await mountKept(() => <OutputEditor />)
    await expect.poll(() => monaco.editor.getEditors().length).toBe(1)
    const output = monaco.editor.getEditors()[0]
    expect(output.getValue()).toBe("export const one = 1")
    expect(output.getOption(monaco.editor.EditorOption.readOnly)).toBe(true)
    expect(monaco.editor.getModels().length).toBe(modelsBefore + 1)
    dispose()
    expect(monaco.editor.getEditors()).toHaveLength(0)
    expect(monaco.editor.getModels().length).toBe(modelsBefore)
  })
})

describe("<FileDropdown>", () => {
  test("lists the project's files, showing `editor.file`;  choosing one shows it", async () => {
    const showEditor = spyOnEditor("showEditor")
    const file = fakeFile("test-project/one.js", "")
    setEditor("project", file.project as unknown as EditorStore["project"])
    setEditor("file", file)
    const host = await mount(() => <FileDropdown showActions />)
    const dropdown = host.querySelector<HTMLElement & { value: string }>("ui-dropdown#FileDropdown")!
    expect(dropdown.hasAttribute("loading")).toBe(false)
    expect(dropdown.value).toBe("test-project/one.js")
    const items = [...dropdown.querySelectorAll(":scope > ui-item")]
    expect(items.map((item) => item.getAttribute("value") ?? item.getAttribute("type") ?? text(item))).toEqual([
      "test-project/one.js",
      "test-project/two.js",
      "divider",
      "New File",
      "Duplicate File",
      "Rename File",
      "Delete File"
    ])
    expect(text(host.querySelector("ui-item.dropdown-label")!)).toBe("File:")

    dropdown.dispatchEvent(new CustomEvent("ui-change", { detail: { value: "test-project/two.js" } }))
    expect(showEditor).toHaveBeenCalledWith("test-project/two.js")
    // still showing `editor.file` until it changes
    expect(dropdown.value).toBe("test-project/one.js")
  })

  test("loading, with no items, until the project's loaded", async () => {
    const file = fakeFile("test-project/one.js", "")
    file.project.isLoaded = false
    setEditor("project", file.project as unknown as EditorStore["project"])
    setEditor("file", file)
    const host = await mount(() => <FileDropdown showLabel={false} />)
    const dropdown = host.querySelector("ui-dropdown")!
    expect(dropdown.hasAttribute("loading")).toBe(true)
    expect(dropdown.querySelectorAll("ui-item")).toHaveLength(0)
    expect(host.querySelector(".dropdown-label")).toBeNull()

    file.project.isLoaded = true
    flush()
    expect(dropdown.hasAttribute("loading")).toBe(false)
    expect(dropdown.querySelectorAll("ui-item")).toHaveLength(2)
  })
})

describe("<InputRoot>", () => {
  test("a toolbar over the editor, unless `showToolbar={false}`", async () => {
    setEditor("file", fakeFile("test-project/one.js", "one\n"))
    const host = await mount(() => <InputRoot />)
    const root = host.querySelector(".InputRoot")!
    expect(root.querySelector(":scope > ui-menu.PanelMenu ui-dropdown#FileDropdown")).not.toBeNull()
    expect(root.querySelector(":scope > .InputEditor")).not.toBeNull()
    await waitForInputEditor(host)

    const bare = await mount(() => <InputRoot showToolbar={false} />)
    expect(bare.querySelector("ui-menu")).toBeNull()
  })

  test("`LazyMonaco.Loading` is what shows while Monaco loads", async () => {
    const host = await mount(() => <LazyMonaco.Loading />)
    expect(text(host.querySelector(".MonacoEditor")!)).toBe("Loading editor…")
  })
})

////////////////
// ## Helpers
////////////////

/** A fake file of a fake loaded project, as spell cells (`reactiveObject()`), with the other file `two.js`. */
function fakeFile(path: string, contents: string): FakeFile {
  const project = reactiveObject({
    path: "test-project",
    isLoaded: true,
    spellFiles: [] as SP.SpellFile[],
    imports: [
      { path: "test-project/one.js", location: { file: "one.js" } },
      { path: "test-project/two.js", location: { file: "two.js" } }
    ],
    updatedContentsFor: vi.fn()
  })
  return reactiveObject({
    path,
    file: path.split("/").pop()!,
    contents,
    isLoaded: true,
    isDirty: false,
    project,
    initialSelection: undefined as UIT.EditorSelection | undefined
  }) as unknown as FakeFile
}

/** What tests touch of a fake file;  `editor` takes it as a file. */
type FakeFile = SP.AnySpellFile & {
  contents: string
  isDirty: boolean
  project: { isLoaded: boolean; spellFiles: SP.SpellFile[] }
  initialSelection?: UIT.EditorSelection
}

/** Render `component` into a fresh `<div>` in the page, wait for its `<ui-*>` elements;  unmounted after the test. */
async function mount(component: () => unknown): Promise<HTMLElement> {
  const unmount = await mountKept(component)
  cleanups.push(unmount)
  return unmount.host
}

/**
 * `mount()`, but the test unmounts it:  returns `unmount()`, with `host` on it.
 * - The host leaves the page after the test either way.
 */
async function mountKept(component: () => unknown): Promise<(() => void) & { host: HTMLElement }> {
  await uiReady
  const host = document.createElement("div")
  host.style.height = "300px"
  document.body.append(host)
  const dispose = render(component as () => never, host)
  cleanups.push(() => host.remove())
  flush()
  await ElementFixture.settle(host)
  return Object.assign(dispose, { host })
}

/** The input editor in `host`, once Monaco has loaded and made it. */
async function waitForInputEditor(host: HTMLElement) {
  await expect
    .poll(() => host.querySelector(".monaco-editor") && editor.getInputEditor(), { timeout: 20_000 })
    .toBeTruthy()
  return editor.getInputEditor()!
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
