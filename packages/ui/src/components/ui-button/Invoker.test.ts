import { describe, expect, onTestFinished, test } from "vite-plus/test"

import { Invoker } from "./Invoker"

describe("Invoker.resolve()", () => {
  test("finds the id in the element's own root:  the document, or the shadow root it lives in", () => {
    const page = attached(`<span id="source"></span><dialog id="target"></dialog>`)
    expect(Invoker.resolve(page.querySelector("#source")!, "target")).toBe(page.querySelector("#target"))
    const shadow = page.querySelector("#source")!.attachShadow({ mode: "open" })
    shadow.innerHTML = `<b id="inner"></b><i id="target"></i>`
    expect(Invoker.resolve(shadow.querySelector("#inner")!, "target")).toBe(shadow.querySelector("#target"))
  })

  test("is undefined for no id, an unknown id, or a detached element", () => {
    const page = attached(`<span id="source"></span>`)
    const source = page.querySelector("#source")!
    expect(Invoker.resolve(source, undefined)).toBeUndefined()
    expect(Invoker.resolve(source, "missing")).toBeUndefined()
    expect(Invoker.resolve(document.createElement("span"), "source")).toBeUndefined()
  })
})

describe("Invoker.run()", () => {
  test("fires a cancelable `command` event carrying `command` and `source` first", () => {
    const page = attached(`<span id="source"></span><div id="target"></div>`)
    const seen: object[] = []
    page.querySelector("#target")!.addEventListener("command", (event) => {
      const { cancelable, command, source } = event as Event & { command: string; source: Element }
      seen.push({ cancelable, command, source })
    })
    Invoker.run(page.querySelector("#target")!, "--go", page.querySelector("#source")!)
    expect(seen).toEqual([{ cancelable: true, command: "--go", source: page.querySelector("#source") }])
  })

  test("runs dialog commands:  show-modal, then close", () => {
    const page = attached(`<span id="source"></span><dialog id="target"></dialog>`)
    const dialog = page.querySelector<HTMLDialogElement>("#target")!
    Invoker.run(dialog, "show-modal", page.querySelector("#source")!)
    expect(dialog.open).toBe(true)
    Invoker.run(dialog, "close", page.querySelector("#source")!)
    expect(dialog.open).toBe(false)
  })

  test("runs popover commands ONLY on an element with `popover`", () => {
    const page = attached(`<span id="source"></span><div id="target" popover></div><div id="plain"></div>`)
    const source = page.querySelector("#source")!
    const popover = page.querySelector<HTMLElement>("#target")!
    Invoker.run(popover, "toggle-popover", source)
    expect(popover.matches(":popover-open")).toBe(true)
    Invoker.run(popover, "hide-popover", source)
    expect(popover.matches(":popover-open")).toBe(false)
    expect(() => Invoker.run(page.querySelector("#plain")!, "show-popover", source)).not.toThrow()
  })

  test("skips the built-in action when the `command` event is prevented, and for a custom (`--`) command", () => {
    const page = attached(`<span id="source"></span><dialog id="target"></dialog>`)
    const dialog = page.querySelector<HTMLDialogElement>("#target")!
    dialog.addEventListener("command", (event) => event.preventDefault(), { once: true })
    Invoker.run(dialog, "show-modal", page.querySelector("#source")!)
    expect(dialog.open).toBe(false)
    Invoker.run(dialog, "--show-modal", page.querySelector("#source")!)
    expect(dialog.open).toBe(false)
  })
})

/** A `<div>` holding `html`, in the document until the test ends;  closes any dialog left open. */
function attached(html: string): HTMLElement {
  const page = document.createElement("div")
  page.innerHTML = html
  document.body.append(page)
  onTestFinished(() => {
    for (const dialog of page.querySelectorAll("dialog")) dialog.close()
    page.remove()
  })
  return page
}
