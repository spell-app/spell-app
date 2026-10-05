import { afterEach, describe, expect, test, vi } from "vite-plus/test"
import { createSignal, flush } from "solid-js"
import { render } from "@solidjs/web"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { SP } from "$/spell"
import { SpellEditorPane, type SpellEditorStatus } from "./SpellEditorPane"
import { defineSpellEditor, type SpellEditorElement } from "./SpellEditorElement"

/**
 * `<spell-editor>` on Solid, in the browser:  its pane as the element draws it, and the element's own contract --
 * attributes, size, status line.
 * - No spell server here, so no project ever loads:  the pane is driven directly, with stand-in files.
 * - `shadowStyles()` is stubbed:  the test server doesn't serve the editor's CSS.
 */
vi.mock("$/app/runner/shadowStyles", async (importOriginal) => {
  const original = await importOriginal<typeof import("$/app/runner/shadowStyles")>()
  return { ...original, shadowStyles: async () => [] }
})

/** Undo for each test:  unmount, remove. */
const cleanups: (() => void)[] = []

afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup()
})

describe("<SpellEditorPane>", () => {
  test("a tab per file, if more than one;  the one showing is selected;  a click says which", async () => {
    const files = [file("Card.spell"), file("Deck.spell")]
    const onSelect = vi.fn()
    const { host, setFile } = mountPane({ files, file: files[0], onSelect })
    const tabs = host.querySelectorAll<HTMLButtonElement>(".SpellEditorTabs button")
    expect([...tabs].map((tab) => tab.textContent)).toEqual(["Card.spell", "Deck.spell"])
    expect(tabs[0]!.getAttribute("aria-selected")).toBe("true")
    expect(tabs[0]!.classList.contains("active")).toBe(true)

    tabs[1]!.click()
    expect(onSelect).toHaveBeenCalledWith(files[1])
    setFile(files[1])
    flush()
    expect(tabs[1]!.classList.contains("active")).toBe(true)
    expect(tabs[0]!.classList.contains("active")).toBe(false)
  })

  test("one file:  no tabs;  no Monaco yet:  a placeholder", () => {
    const files = [file("Only.spell")]
    const { host } = mountPane({ files, file: files[0] })
    expect(host.querySelector(".SpellEditorTabs")).toBeNull()
    expect(host.querySelector(".SpellEditorLoading")!.textContent).toBe("Loading editor…")
  })

  test("a file edited since saved is marked, as `isDirty` says", () => {
    const files = [file("Card.spell"), file("Deck.spell")]
    const [version, setVersion] = createSignal(0)
    const { host } = mountPane({
      files,
      file: files[0],
      isDirty: (it) => {
        version()
        return it.isDirty
      }
    })
    expect(host.querySelectorAll(".dirty")).toHaveLength(0)
    ;(files[1] as { isDirty: boolean }).isDirty = true
    setVersion(1)
    flush()
    expect(host.querySelectorAll(".SpellEditorTabs button")[1]!.querySelector(".dirty")).not.toBeNull()
  })

  test("the status line says what it's doing", () => {
    const { host, setStatus } = mountPane({ files: [], file: undefined })
    const status = host.querySelector(".SpellEditorStatus")!
    expect(status.querySelector(".message")!.textContent).toBe("Loading…")
    setStatus({ state: "errors", errors: 2 })
    flush()
    expect(status.querySelector(".message")!.textContent).toBe("2 parse errors -- not run")
    expect(status.classList.contains("errors")).toBe(true)
    setStatus({ state: "failed", message: "nope" })
    flush()
    expect(status.querySelector(".message")!.textContent).toBe("nope")
  })
})

describe("<spell-editor>", () => {
  test("no project:  its status line says to give it one;  `width` / `height` set its inline size", async () => {
    const editor = await mountEditor(`<spell-editor width="400px" height="300px"></spell-editor>`)
    const root = editor.shadowRoot!
    await waitFor(() => root.querySelector(".SpellEditorStatus .message")?.textContent?.startsWith("Give"))
    expect(root.querySelector(".SpellEditorStatus .message")!.textContent).toBe(
      "Give <spell-editor> a project to edit."
    )
    expect(editor.style.width).toBe("400px")
    expect(editor.style.height).toBe("300px")
    expect(editor.compiled).toBeUndefined()
    expect(await editor.compile()).toBeUndefined()
  })

  test("a project that won't load:  says why;  `compile()` has nothing to compile", async () => {
    const editor = await mountEditor(`<spell-editor project="@nowhere:at:All"></spell-editor>`)
    const root = editor.shadowRoot!
    await waitFor(() => root.querySelector(".SpellEditorStatus.failed"))
    expect(await editor.compile()).toBeUndefined()
  })

  test("`COMPILE_DELAY` is on the class", () => {
    if (!customElements.get("spell-editor")) defineSpellEditor()
    const Class = customElements.get("spell-editor") as unknown as { COMPILE_DELAY: number }
    expect(Class.COMPILE_DELAY).toBe(2000)
  })
})

////////////////
// ## Helpers
////////////////

/** A stand-in spell file:  just what the pane reads. */
function file(name: string): SP.SpellFile {
  return { file: name, path: `/${name}`, isDirty: false } as unknown as SP.SpellFile
}

/** Render a `<SpellEditorPane>`, its `file` and `status` settable;  unmounted after the test. */
function mountPane({
  files,
  file: first,
  onSelect = () => {},
  isDirty = (it: SP.SpellFile) => it.isDirty
}: {
  files: SP.SpellFile[]
  file: SP.SpellFile | undefined
  onSelect?: (file: SP.SpellFile) => void
  isDirty?: (file: SP.SpellFile) => boolean
}) {
  const host = document.createElement("div")
  document.body.append(host)
  let setFile!: (file: SP.SpellFile | undefined) => void
  let setStatus!: (status: SpellEditorStatus) => void
  const dispose = render(() => {
    const [current, set] = createSignal(first)
    const [status, setTo] = createSignal<SpellEditorStatus>({ state: "loading" })
    setFile = (it) => set(() => it)
    setStatus = setTo
    return (
      <SpellEditorPane
        files={files}
        file={current()}
        status={status()}
        monaco={undefined}
        isDirty={isDirty}
        onSelect={onSelect}
        onMount={() => {}}
        onUnmount={() => {}}
      />
    )
  }, host)
  cleanups.push(() => {
    dispose()
    host.remove()
  })
  flush()
  return { host, setFile, setStatus }
}

/** Add `<spell-editor>` markup `html` to the page;  removed after the test. */
async function mountEditor(html: string): Promise<SpellEditorElement> {
  if (!customElements.get("spell-editor")) defineSpellEditor()
  const holder = document.createElement("div")
  holder.innerHTML = html
  const editor = holder.firstElementChild as SpellEditorElement
  document.body.append(editor)
  cleanups.push(() => editor.remove())
  flush()
  await ElementFixture.tick()
  return editor
}

/**
 * `check()`'s answer once it's truthy -- flushing Solid and letting tasks run between tries.
 * - Fails after `timeout` msec.
 */
async function waitFor<T>(check: () => T, timeout = 5000): Promise<NonNullable<T>> {
  const until = Date.now() + timeout
  for (;;) {
    flush()
    const value = check()
    if (value) return value as NonNullable<T>
    if (Date.now() > until) throw new Error(`timed out waiting for ${check}`)
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
}
