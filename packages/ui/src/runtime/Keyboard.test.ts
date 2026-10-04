import { afterEach, describe, expect, it, vi } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { Keyboard } from "./Keyboard"

/** Dispatch a bubbling, composed `keydown` from `target`;  returns the event. */
function press(target: EventTarget, key: string, init: KeyboardEventInit = {}) {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, composed: true, cancelable: true, ...init })
  target.dispatchEvent(event)
  return event
}

describe("Keyboard", () => {
  let keyboard: Keyboard
  afterEach(() => keyboard.dispose())

  it("fires a page-scope shortcut and prevents default", () => {
    keyboard = new Keyboard({ apple: false })
    const handler = vi.fn()
    keyboard.register("page", "Mod+K", handler)
    const event = press(document.body, "k", { ctrlKey: true })
    expect(handler).toHaveBeenCalledOnce()
    expect(event.defaultPrevented).toBe(true)
  })

  it("only the topmost scope sees shortcuts, unless global", () => {
    keyboard = new Keyboard()
    const page = vi.fn()
    const modal = vi.fn()
    const global = vi.fn()
    keyboard.register("page", "Escape", page)
    keyboard.register("modal", "Escape", modal)
    keyboard.register("page", "/", global, { global: true })

    press(document.body, "Escape")
    expect(page).toHaveBeenCalledTimes(1)
    expect(modal).not.toHaveBeenCalled()

    keyboard.pushScope("modal")
    expect(keyboard.activeScope).toBe("modal")
    press(document.body, "Escape")
    press(document.body, "/")
    expect(page).toHaveBeenCalledTimes(1)
    expect(modal).toHaveBeenCalledTimes(1)
    expect(global).toHaveBeenCalledTimes(1)

    keyboard.popScope("modal")
    press(document.body, "Escape")
    expect(page).toHaveBeenCalledTimes(2)
  })

  it("pops scopes out of order and never pops the page scope", () => {
    keyboard = new Keyboard()
    keyboard.pushScope("a")
    keyboard.pushScope("b")
    keyboard.popScope("a")
    expect(keyboard.activeScope).toBe("b")
    keyboard.popScope("b")
    keyboard.popScope("page")
    expect(keyboard.activeScope).toBe("page")
  })

  it("newest registration wins;  returning false passes to the next", () => {
    keyboard = new Keyboard()
    keyboard.warnConflicts = false
    const older = vi.fn()
    const newer = vi.fn(() => false)
    keyboard.register("page", "Enter", older)
    keyboard.register("page", "Enter", newer)
    const event = press(document.body, "Enter")
    expect(newer).toHaveBeenCalledOnce()
    expect(older).toHaveBeenCalledOnce()
    expect(event.defaultPrevented).toBe(true)
  })

  it("disposer removes the registration", () => {
    keyboard = new Keyboard()
    const handler = vi.fn()
    const dispose = keyboard.register("page", "x", handler)
    dispose()
    press(document.body, "x")
    expect(handler).not.toHaveBeenCalled()
  })

  it("ignores editable targets unless the chord has a modifier or inEditable", () => {
    keyboard = new Keyboard({ apple: false })
    const plain = vi.fn()
    const modified = vi.fn()
    const allowed = vi.fn()
    keyboard.register("page", "/", plain)
    keyboard.register("page", "Mod+S", modified)
    keyboard.register("page", "Escape", allowed, { inEditable: true })
    const input = Fixture.render<HTMLInputElement>(`<input type="text">`)
    press(input, "/")
    press(input, "s", { ctrlKey: true })
    press(input, "Escape")
    expect(plain).not.toHaveBeenCalled()
    expect(modified).toHaveBeenCalledOnce()
    expect(allowed).toHaveBeenCalledOnce()
  })

  it("sees keys from inside shadow roots and honours target", () => {
    keyboard = new Keyboard()
    const host = Fixture.render(`<div></div>`)
    const shadow = host.attachShadow({ mode: "open" })
    shadow.innerHTML = `<button>in shadow</button>`
    const other = Fixture.render(`<button>elsewhere</button>`)
    const handler = vi.fn()
    keyboard.register("page", "ArrowDown", handler, { target: host })
    press(shadow.querySelector("button")!, "ArrowDown")
    press(other, "ArrowDown")
    expect(handler).toHaveBeenCalledOnce()
  })

  it("warns about conflicting registrations in one scope", () => {
    keyboard = new Keyboard()
    keyboard.warnConflicts = true
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    keyboard.register("page", "Mod+K", () => {})
    keyboard.register("other", "Mod+K", () => {})
    expect(warn).not.toHaveBeenCalled()
    keyboard.register("page", "Mod+K", () => {})
    expect(warn).toHaveBeenCalledOnce()
    warn.mockRestore()
  })
})
