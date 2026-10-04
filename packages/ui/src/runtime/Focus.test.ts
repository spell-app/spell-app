import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { Focus } from "./Focus"

const focus = new Focus()

/** Labels (text or `aria-label`) of `elements`, for readable assertions. */
function labels(elements: HTMLElement[]) {
  return elements.map((element) => element.getAttribute("aria-label") ?? element.textContent?.trim())
}

describe("Focus.focusables()", () => {
  it("walks shadow roots and slots in flat-tree order", () => {
    const root = Fixture.render(`
      <div>
        <button>one</button>
        <span id="host"><button>slotted</button></span>
        <button>four</button>
      </div>`)
    const host = root.querySelector("#host")!
    host.attachShadow({ mode: "open" }).innerHTML = `
      <button>two</button>
      <slot></slot>
      <input aria-label="three">`
    expect(labels(focus.focusables(root))).toEqual(["one", "two", "slotted", "three", "four"])
  })

  it("skips inert, hidden, disabled, tabindex=-1 and unrendered content", () => {
    const root = Fixture.render(`
      <div>
        <button>yes</button>
        <button disabled>disabled</button>
        <button tabindex="-1">negative</button>
        <div inert><button>inert</button></div>
        <div hidden><button>hidden</button></div>
        <div style="display: none"><button>none</button></div>
        <div style="visibility: hidden"><button>invisible</button></div>
        <a>no href</a>
        <a href="#x">link</a>
        <span tabindex="0">span</span>
        <input type="hidden">
        <div style="display: contents"><button>contents</button></div>
      </div>`)
    expect(labels(focus.focusables(root))).toEqual(["yes", "link", "span", "contents"])
  })

  it("uses slot fallback content when nothing is assigned", () => {
    const host = Fixture.render(`<div></div>`)
    host.attachShadow({ mode: "open" }).innerHTML = `<slot><button>fallback</button></slot>`
    expect(labels(focus.focusables(host))).toEqual(["fallback"])
  })

  it("treats a delegatesFocus host as its contents", () => {
    const host = Fixture.render(`<div tabindex="0"></div>`)
    host.attachShadow({ mode: "open", delegatesFocus: true }).innerHTML = `<button>inner</button>`
    expect(labels(focus.focusables(host.parentElement!))).toEqual(["inner"])
  })

  it("first / last", () => {
    const root = Fixture.render(`<div><button>a</button><button>b</button><button>c</button></div>`)
    expect(focus.first(root)?.textContent).toBe("a")
    expect(focus.last(root)?.textContent).toBe("c")
    expect(focus.first(Fixture.render(`<p>none</p>`))).toBeNull()
  })
})

describe("Focus", () => {
  it("activeElementDeep() descends into shadow roots", () => {
    const host = Fixture.render(`<div></div>`)
    host.attachShadow({ mode: "open" }).innerHTML = `<input>`
    const input = host.shadowRoot!.querySelector("input")!
    input.focus()
    expect(document.activeElement).toBe(host)
    expect(focus.activeElementDeep()).toBe(input)
  })

  it("containsDeep() follows slots and shadow hosts", () => {
    const outer = Fixture.render(`<div><span>slotted</span></div>`)
    outer.attachShadow({ mode: "open" }).innerHTML = `<p><slot></slot></p>`
    const paragraph = outer.shadowRoot!.querySelector("p")!
    expect(focus.containsDeep(paragraph, outer.querySelector("span"))).toBe(true)
    expect(focus.containsDeep(outer, paragraph)).toBe(true)
    expect(focus.containsDeep(paragraph, outer)).toBe(false)
  })

  it("trap() wraps Tab and pulls escaped focus back", () => {
    const outside = Fixture.render<HTMLButtonElement>(`<button>outside</button>`)
    const root = Fixture.render(`<div><button>a</button><button>b</button></div>`)
    const [a, b] = Array.from(root.querySelectorAll("button"))
    const release = focus.trap(root)
    try {
      b!.focus()
      const tab = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true })
      b!.dispatchEvent(tab)
      expect(tab.defaultPrevented).toBe(true)
      expect(document.activeElement).toBe(a)
      const back = new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true, cancelable: true })
      a!.dispatchEvent(back)
      expect(document.activeElement).toBe(b)
      outside.focus()
      expect(document.activeElement).toBe(a)
    } finally {
      release()
    }
    outside.focus()
    expect(document.activeElement).toBe(outside)
  })
})
