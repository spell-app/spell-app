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
    keyboard = new Keyboard({ isApple: false })
    const handler = vi.fn()
    keyboard.register({ chord: "Mod+K", handler })
    const event = press(document.body, "k", { ctrlKey: true })
    expect(handler).toHaveBeenCalledOnce()
    expect(event.defaultPrevented).toBe(true)
  })

  it("only the topmost scope sees shortcuts, unless global", () => {
    keyboard = new Keyboard()
    const page = vi.fn()
    const modal = vi.fn()
    const global = vi.fn()
    keyboard.register({ chord: "Escape", handler: page })
    keyboard.register({ scope: "modal", chord: "Escape", handler: modal })
    keyboard.register({ chord: "/", handler: global, global: true })

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
    keyboard.register({ chord: "Enter", handler: older })
    keyboard.register({ chord: "Enter", handler: newer })
    const event = press(document.body, "Enter")
    expect(newer).toHaveBeenCalledOnce()
    expect(older).toHaveBeenCalledOnce()
    expect(event.defaultPrevented).toBe(true)
  })

  it("disposer removes the registration", () => {
    keyboard = new Keyboard()
    const handler = vi.fn()
    const dispose = keyboard.register({ chord: "x", handler })
    dispose()
    press(document.body, "x")
    expect(handler).not.toHaveBeenCalled()
  })

  it("ignores editable targets unless the chord has a modifier or inEditable", () => {
    keyboard = new Keyboard({ isApple: false })
    const plain = vi.fn()
    const modified = vi.fn()
    const allowed = vi.fn()
    keyboard.register({ chord: "/", handler: plain })
    keyboard.register({ chord: "Mod+S", handler: modified })
    keyboard.register({ chord: "Escape", handler: allowed, inEditable: true })
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
    keyboard.register({ chord: "ArrowDown", handler, target: host })
    press(shadow.querySelector("button")!, "ArrowDown")
    press(other, "ArrowDown")
    expect(handler).toHaveBeenCalledOnce()
  })

  it("warns about conflicting registrations in one scope", () => {
    keyboard = new Keyboard()
    keyboard.warnConflicts = true
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    keyboard.register({ chord: "Mod+K", handler: () => {} })
    keyboard.register({ scope: "other", chord: "Mod+K", handler: () => {} })
    expect(warn).not.toHaveBeenCalled()
    keyboard.register({ chord: "Mod+K", handler: () => {} })
    expect(warn).toHaveBeenCalledOnce()
    warn.mockRestore()
  })
})
