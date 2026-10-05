import { afterEach, describe, expect, test, vi } from "vite-plus/test"
import { flush } from "solid-js"
import { render } from "@solidjs/web"

import { Markdown } from "./Markdown"

/**
 * `<Markdown>` in the browser:  `$/markdown` loads lazily, then the text draws as HTML;  links go to `onOpen`.
 */

/** Undo for each test:  unmount. */
const cleanups: (() => void)[] = []

afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup()
})

describe("<Markdown>", () => {
  test("draws markdown as HTML once $/markdown has loaded;  the plain text until then", async () => {
    const host = mount(() => <Markdown text={"**bold** and [a link](file:///x.spell#L2)"} onOpen={() => {}} />)
    expect(host.textContent).toContain("**bold**")
    await vi.waitFor(() => {
      flush()
      expect(host.querySelector(".Markdown strong")?.textContent).toBe("bold")
    })
  })

  test("a clicked link goes to onOpen, not the page", async () => {
    const onOpen = vi.fn()
    const host = mount(() => <Markdown text="[go](file:///x.spell#L2)" onOpen={onOpen} />)
    await vi.waitFor(() => {
      flush()
      expect(host.querySelector(".Markdown a")).not.toBeNull()
    })
    host.querySelector<HTMLElement>(".Markdown a")!.click()
    expect(onOpen).toHaveBeenCalledWith("file:///x.spell#L2")
  })
})

/** Render `component` into a fresh element on the page;  unmounted after the test. */
function mount(component: () => unknown): HTMLElement {
  const host = document.createElement("div")
  document.body.append(host)
  const dispose = render(component as () => never, host)
  cleanups.push(() => {
    dispose()
    host.remove()
  })
  flush()
  return host
}
