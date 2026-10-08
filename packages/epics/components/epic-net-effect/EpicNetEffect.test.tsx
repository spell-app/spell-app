import { describe, expect, test } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

import "$/epics/components/epic-net-effect"

/** `host`'s shadow part `name`. */
function part(host: Element, name: string): HTMLElement | null {
  return host.shadowRoot!.querySelector<HTMLElement>(`[part~="${name}"]`)
}

/** `host`'s label, as read:  its text, spaces squeezed. */
function label(host: Element): string {
  return part(host, "label")!.textContent!.replace(/\s+/g, " ").trim()
}

/** A Net effect list, one option's and recommended. */
const RECOMMENDED = `<epic-net-effect option="A" recommended><ul><li>one look</li><li>no hand-made label</li></ul></epic-net-effect>`

describe("<epic-net-effect>", () => {
  test("`Net effect:` over its list;  the list is its own light child, through its slot;  axe", async () => {
    const host = await ElementFixture.render(`<epic-net-effect><ul><li>one look</li></ul></epic-net-effect>`)
    expect(label(host)).toBe("Net effect:")
    expect(part(host, "option")).toBeNull()
    expect(host.querySelector("ul")!.assignedSlot).toBe(part(host, "base")!.querySelector("slot"))
    await expectAccessible(host)
  })

  test("`option` and `recommended`:  `Net effect (A, recommended):`, the word in grey, the label in the text's ink", async () => {
    const host = await ElementFixture.render(RECOMMENDED)
    const plain = await ElementFixture.render(`<epic-net-effect option="B"><p>Same.</p></epic-net-effect>`)
    const alone = await ElementFixture.render(`<epic-net-effect recommended><p>All.</p></epic-net-effect>`)
    expect([label(host), label(plain), label(alone)]).toEqual([
      "Net effect (A, recommended):",
      "Net effect (B):",
      "Net effect (recommended):"
    ])
    const ink = getComputedStyle(host).color
    expect(getComputedStyle(part(host, "label")!).color).toBe(ink)
    expect(getComputedStyle(part(host, "recommended")!).color).not.toBe(ink)
  })

  test("neutral, and readable in the LIGHT and DARK schemes (axe)", async () => {
    const light = await ElementFixture.render(
      `<div style="color-scheme: light; color: CanvasText; padding: 4px">${RECOMMENDED}</div>`
    )
    const dark = await ElementFixture.render(
      `<div style="color-scheme: dark; background: #1b1c1d; color: CanvasText; padding: 4px">${RECOMMENDED}</div>`
    )
    for (const wrap of [light, dark]) {
      const host = wrap.querySelector("epic-net-effect")!
      expect(getComputedStyle(part(host, "base")!).backgroundColor).toBe("rgba(0, 0, 0, 0)")
      await expectAccessible(wrap)
    }
  })

  test("in the side bar's ~320px:  the label wraps inside, nothing overflows", async () => {
    const long = `<epic-net-effect option="C" recommended><ul><li>${"a long consequence ".repeat(12)}</li></ul></epic-net-effect>`
    const sideBar = await ElementFixture.render(`<div style="width: 320px">${long}</div>`)
    const host = sideBar.querySelector("epic-net-effect")!
    expect(host.getBoundingClientRect().width).toBeLessThanOrEqual(320)
    expect([part(host, "base")!.scrollWidth, host.querySelector("ul")!.scrollWidth].every((it) => it <= 320)).toBe(true)
  })
})
