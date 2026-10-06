import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test"

import type { OverlayEntry } from "$/ui/runtime"

import { Fixture } from "$/ui/test/fixture"
import { Browser } from "./Browser"
import { Focus } from "./Focus"
import { Keyboard } from "./Keyboard"
import { Overlays } from "./Overlays"
import { Styles } from "./Styles"

/** Dispatch a composed `pointerdown` on `target`. */
function pointerDown(target: EventTarget, init: PointerEventInit = {}) {
  target.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, composed: true, detail: 1, ...init }))
}

/** Dispatch a composed mouse `click` (`detail: 1`, as a real pointer click) on `target`. */
function click(target: EventTarget, init: MouseEventInit = {}) {
  target.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true, detail: 1, ...init }))
}

/** Press + click on the same element. */
function pressAndClick(target: EventTarget) {
  pointerDown(target)
  click(target)
}

/** Dispatch Escape from `target`. */
function escape(target: EventTarget = document.body) {
  target.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, composed: true, cancelable: true }))
}

describe("Overlays", () => {
  let keyboard: Keyboard
  let styles: Styles
  let overlays: Overlays

  beforeEach(() => {
    keyboard = new Keyboard()
    styles = new Styles()
    overlays = new Overlays({ keyboard, focus: new Focus(), browser: new Browser(), styles })
    // drive Escape with synthetic keydowns, which never reach a CloseWatcher
    overlays.useCloseWatcher = false
  })
  afterEach(() => {
    overlays.dispose()
    keyboard.dispose()
    styles.dispose()
  })

  /** An entry for a fresh fixture element, with a spy `onDismiss`. */
  function entry(kind: OverlayEntry["kind"], extra: Partial<OverlayEntry> = {}) {
    const element = Fixture.render(`<section><button>inside</button><input></section>`)
    return { element, kind, onDismiss: vi.fn(), ...extra } satisfies OverlayEntry
  }

  it("keeps a stack and reports the topmost", () => {
    const modal = entry("modal")
    const popover = entry("popover")
    overlays.open(modal)
    overlays.open(popover)
    overlays.open(popover)
    expect(overlays.entries).toEqual([modal, popover])
    expect(overlays.topmost()).toBe(popover)
    expect(overlays.topmost("modal")).toBe(modal)
    overlays.close(popover)
    expect(overlays.topmost()).toBe(modal)
    expect(overlays.isOpen(popover)).toBe(false)
  })

  it("sends Escape only to the topmost entry, and shadows page shortcuts", () => {
    const pageShortcut = vi.fn()
    keyboard.register({ chord: "Escape", handler: pageShortcut })
    const modal = entry("modal")
    const popover = entry("popover")
    overlays.open(modal)
    overlays.open(popover)
    escape()
    expect(popover.onDismiss).toHaveBeenCalledWith("escape")
    expect(modal.onDismiss).not.toHaveBeenCalled()
    overlays.close(popover)
    escape()
    expect(modal.onDismiss).toHaveBeenCalledWith("escape")
    overlays.close(modal)
    escape()
    expect(pageShortcut).toHaveBeenCalledOnce()
  })

  it("Escape from an input inside the overlay still dismisses", () => {
    const modal = entry("modal")
    overlays.open(modal)
    escape(modal.element.querySelector("input")!)
    expect(modal.onDismiss).toHaveBeenCalledWith("escape")
  })

  it("dismisses on a click outside, not inside", () => {
    const popover = entry("popover")
    const outside = Fixture.render(`<p>outside</p>`)
    overlays.open(popover)
    pressAndClick(popover.element.querySelector("button")!)
    expect(popover.onDismiss).not.toHaveBeenCalled()
    pressAndClick(outside)
    expect(popover.onDismiss).toHaveBeenCalledWith("outside")
  })

  it("never dismisses when the press started inside (drag out)", () => {
    const popover = entry("popover")
    const outside = Fixture.render(`<p>outside</p>`)
    overlays.open(popover)
    pointerDown(popover.element.querySelector("input")!)
    click(outside)
    expect(popover.onDismiss).not.toHaveBeenCalled()
  })

  it("counts clicks inside a shadow root in the overlay as inside, and the anchor too", () => {
    const anchor = Fixture.render(`<button>toggle</button>`)
    const popover = entry("popover", { anchor })
    const shadow = popover.element.attachShadow({ mode: "open" })
    shadow.innerHTML = `<button>deep</button><slot></slot>`
    overlays.open(popover)
    pressAndClick(shadow.querySelector("button")!)
    pressAndClick(anchor)
    expect(popover.onDismiss).not.toHaveBeenCalled()
  })

  it("only checks the topmost entry of each pool", () => {
    const modal = entry("modal")
    const popover = entry("popover")
    const toast = entry("toast", { closeOnOutsideClick: true })
    overlays.open(modal)
    overlays.open(popover)
    overlays.open(toast)
    pressAndClick(modal.element)
    expect(popover.onDismiss).toHaveBeenCalledWith("outside")
    expect(toast.onDismiss).toHaveBeenCalledWith("outside")
    expect(modal.onDismiss).not.toHaveBeenCalled()
  })

  it("reference-counts the scroll lock", () => {
    const html = document.documentElement
    const first = entry("modal")
    const second = entry("flyout")
    const popover = entry("popover")
    overlays.open(popover)
    expect(html.classList.contains("ui-scroll-locked")).toBe(false)
    overlays.open(first)
    overlays.open(second)
    expect(html.classList.contains("ui-scroll-locked")).toBe(true)
    expect(html.style.getPropertyValue("--ui-scrollbar-width")).toMatch(/^\d+px$/)
    expect(getComputedStyle(html).overflow).toBe("hidden")
    overlays.close(first)
    expect(html.classList.contains("ui-scroll-locked")).toBe(true)
    overlays.close(second)
    expect(html.classList.contains("ui-scroll-locked")).toBe(false)
    expect(html.style.getPropertyValue("--ui-scrollbar-width")).toBe("")
  })

  it("restores focus on close when focus was inside", () => {
    const trigger = Fixture.render<HTMLButtonElement>(`<button>open</button>`)
    trigger.focus()
    const modal = entry("modal")
    overlays.open(modal)
    modal.element.querySelector("input")!.focus()
    overlays.close(modal)
    expect(document.activeElement).toBe(trigger)
  })

  it("leaves focus alone when it already moved elsewhere", () => {
    const trigger = Fixture.render<HTMLButtonElement>(`<button>open</button>`)
    const elsewhere = Fixture.render<HTMLButtonElement>(`<button>elsewhere</button>`)
    trigger.focus()
    const popover = entry("popover")
    overlays.open(popover)
    elsewhere.focus()
    overlays.close(popover)
    expect(document.activeElement).toBe(elsewhere)
  })

  it("closeAll asks every entry in a pool, topmost first", () => {
    const calls: string[] = []
    const a = entry("modal", { onDismiss: vi.fn(() => void calls.push("a")) })
    const b = entry("popover", { onDismiss: vi.fn(() => void calls.push("b")) })
    const toast = entry("toast")
    overlays.open(a)
    overlays.open(b)
    overlays.open(toast)
    overlays.closeAll("default")
    expect(calls).toEqual(["b", "a"])
    expect(toast.onDismiss).not.toHaveBeenCalled()
    overlays.closeAll()
    expect(toast.onDismiss).toHaveBeenCalledWith("close-all")
  })
})
