import { describe, expect, test } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

import "$/epics/components/epic-prompt"

/** `host`'s shadow part `name`. */
function part<T extends HTMLElement = HTMLElement>(host: Element, name: string): T {
  return host.shadowRoot!.querySelector<T>(`[part~="${name}"]`)!
}

/** A kickoff prompt, two paragraphs. */
const PROMPT = `<epic-prompt><p>Plan docs as web components.</p><p>Keep every word.</p></epic-prompt>`

describe("<epic-prompt>", () => {
  test("FOLDED under `Kickoff prompt`;  the prompt is its own light children, in a quoted card;  axe", async () => {
    const host = await ElementFixture.render(PROMPT)
    const fold = part<HTMLDetailsElement>(host, "base")
    expect({ tag: fold.localName, open: fold.open, title: part(host, "title").textContent }).toEqual({
      tag: "details",
      open: false,
      title: "Kickoff prompt"
    })
    expect(host.querySelector("p")!.assignedSlot).toBe(part(host, "quote").querySelector("slot"))
    expect(part(host, "quote").localName).toBe("blockquote")
    await expectAccessible(host)
  })

  test("a click on its title unfolds it;  again folds it", async () => {
    const host = await ElementFixture.render(PROMPT)
    const fold = part<HTMLDetailsElement>(host, "base")
    part(host, "title").click()
    await ElementFixture.tick()
    expect(fold.open).toBe(true)
    expect(host.querySelector("p")!.getBoundingClientRect().height).toBeGreaterThan(0)
    part(host, "title").click()
    await ElementFixture.tick()
    expect(fold.open).toBe(false)
  })

  test("on the ivory (Owen's voice), readable in the LIGHT and DARK schemes, open (axe)", async () => {
    const light = await ElementFixture.render(
      `<div style="color-scheme: light; color: CanvasText; padding: 4px">${PROMPT}</div>`
    )
    const dark = await ElementFixture.render(
      `<div style="color-scheme: dark; background: #1b1c1d; color: CanvasText; padding: 4px">${PROMPT}</div>`
    )
    for (const wrap of [light, dark]) {
      const host = wrap.querySelector("epic-prompt")!
      part<HTMLDetailsElement>(host, "base").open = true
      await ElementFixture.tick()
      expect(getComputedStyle(part(host, "base")).backgroundColor).not.toBe("rgba(0, 0, 0, 0)")
      await expectAccessible(wrap)
    }
  })

  test("in the side bar's ~320px, open:  the card wraps its text, nothing overflows", async () => {
    const long = `<epic-prompt><p>${"plan docs as web components ".repeat(12)}</p></epic-prompt>`
    const sideBar = await ElementFixture.render(`<div style="width: 320px">${long}</div>`)
    const host = sideBar.querySelector("epic-prompt")!
    part<HTMLDetailsElement>(host, "base").open = true
    await ElementFixture.tick()
    const widths = [host.getBoundingClientRect().width, part(host, "base").scrollWidth, part(host, "quote").scrollWidth]
    expect(widths.every((it) => it <= 320)).toBe(true)
  })
})
