import { describe, expect, it, vi } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { RovingTabindex } from "./RovingTabindex"

/** Dispatch a `keydown` from `target`. */
function press(target: EventTarget, key: string) {
  target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, composed: true, cancelable: true }))
}

/** A four-item list;  item `c` is disabled. */
function list() {
  return Fixture.render(`
    <ul role="listbox">
      <li role="option">a</li>
      <li role="option">b</li>
      <li role="option" aria-disabled="true">c</li>
      <li role="option">d</li>
    </ul>`)
}

describe("RovingTabindex", () => {
  it("makes one tab stop and moves it with arrows, skipping disabled items", () => {
    const container = list()
    const onChange = vi.fn()
    const roving = RovingTabindex.attach(container, "li", { onChange })
    const items = roving.items
    expect(items.map((item) => item.tabIndex)).toEqual([0, -1, -1, -1])
    items[0]!.focus()
    press(items[0]!, "ArrowDown")
    expect(document.activeElement).toBe(items[1])
    press(items[1]!, "ArrowDown")
    expect(document.activeElement).toBe(items[3])
    expect(items.map((item) => item.tabIndex)).toEqual([-1, -1, -1, 0])
    expect(onChange).toHaveBeenLastCalledWith(items[3], 3)
    roving.detach()
  })

  it("wraps by default, and not with wrap: false", () => {
    const container = list()
    const roving = RovingTabindex.attach(container, "li")
    roving.focus(3)
    press(roving.items[3]!, "ArrowDown")
    expect(roving.activeIndex).toBe(0)
    roving.detach()

    const stuck = RovingTabindex.attach(list(), "li", { wrap: false })
    stuck.focus(3)
    press(stuck.items[3]!, "ArrowDown")
    expect(stuck.activeIndex).toBe(3)
    stuck.detach()
  })

  it("Home / End and horizontal orientation", () => {
    const container = list()
    const roving = RovingTabindex.attach(container, "li", { orientation: "horizontal" })
    roving.focus(1)
    press(roving.items[1]!, "ArrowDown")
    expect(roving.activeIndex).toBe(1)
    press(roving.items[1]!, "ArrowRight")
    expect(roving.activeIndex).toBe(3)
    press(roving.items[3]!, "Home")
    expect(roving.activeIndex).toBe(0)
    press(roving.items[0]!, "End")
    expect(roving.activeIndex).toBe(3)
    roving.detach()
  })

  it("follows focus moved by click or script", () => {
    const container = list()
    const roving = RovingTabindex.attach(container, "li")
    roving.items[1]!.focus()
    expect(roving.activeIndex).toBe(1)
    expect(roving.items[1]!.tabIndex).toBe(0)
    roving.detach()
  })
})
