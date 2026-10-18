import { describe, expect, test } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

import "$/epics/components/epic-update"

describe("<epic-update>", () => {
  test("bare:  an inline orange UPDATE label, its phase in its tooltip", async () => {
    const root = await ElementFixture.render(`<p>Changed <epic-update phase="5"></epic-update></p>`)
    const update = root.querySelector("epic-update")!
    const label = update.shadowRoot!.querySelector('[part~="label"]')!
    expect({ text: label.textContent, tip: label.getAttribute("title") }).toEqual({
      text: "UPDATE",
      tip: "Changed during P5"
    })
    expect(update.matches(":state(block)")).toBe(false)
    expect(getComputedStyle(update).display).toBe("inline-block")
    await expectAccessible(root)
  })

  test("a block:  `Update: <summary>`, the date at the right of the title row, what changed under it", async () => {
    const update = await ElementFixture.render(
      `<epic-update at="2026-10-11 14:30" summary="Split P7 in two" phase="6"><p>Why it split.</p></epic-update>`
    )
    await ElementFixture.tick()
    const shadow = update.shadowRoot!
    expect(update.matches(":state(block)")).toBe(true)
    expect(update.matches(":state(open)")).toBe(true)
    expect(getComputedStyle(update).display).toBe("block")
    expect(shadow.querySelector('[part~="title"]')!.textContent).toBe("Update: Split P7 in two")
    expect(shadow.querySelector('[part~="title"] b')!.textContent).toBe("Update")
    const time = shadow.querySelector('[part~="time"]')!
    expect({ text: time.textContent, tip: time.getAttribute("title") }).toEqual({
      text: "10/11/26 14:30",
      tip: "2026-10-11 14:30 · Written during P6"
    })
    // the date on the title's right, on its first line
    const title = shadow.querySelector('[part~="title"]')!.getBoundingClientRect()
    const box = time.getBoundingClientRect()
    expect(box.left).toBeGreaterThanOrEqual(title.right - 0.5)
    expect(Math.abs(box.top - title.top)).toBeLessThan(6)
    expect(update.querySelector("p")!.assignedSlot).not.toBeNull()
    await expectAccessible(update.parentElement!)
  })

  test("a block folds by its title row:  what changed `until-found`, open again on a second click", async () => {
    const update = await ElementFixture.render(
      `<epic-update at="2026-10-11 14:30" summary="Moved"><p>Text</p></epic-update>`
    )
    await ElementFixture.tick()
    const shadow = update.shadowRoot!
    const button = shadow.querySelector<HTMLButtonElement>('[part~="toggle"]')!
    const body = shadow.querySelector('[part~="body"]')!
    expect(button.getAttribute("aria-expanded")).toBe("true")
    shadow.querySelector<HTMLElement>('[part~="header"]')!.click()
    await ElementFixture.tick()
    expect(body.getAttribute("hidden")).toBe("until-found")
    expect(update.matches(":state(open)")).toBe(false)
    button.click()
    await ElementFixture.tick()
    expect(body.hasAttribute("hidden")).toBe(false)
  })

  test("a summary alone:  a block with no fold, no body;  an older note (children, no summary):  `Update` alone", async () => {
    const root = await ElementFixture.render(
      `<div><epic-update at="2026-10-11" summary="Renamed"></epic-update>` +
        `<epic-update phase="2"><p>What changed.</p></epic-update></div>`
    )
    await ElementFixture.tick()
    const [summed, note] = Array.from(root.querySelectorAll("epic-update"))
    expect(summed!.matches(":state(block)")).toBe(true)
    expect(summed!.shadowRoot!.querySelector('[part~="toggle"]')).toBeNull()
    expect(summed!.shadowRoot!.querySelector('[part~="time"]')!.textContent).toBe("10/11/26")
    expect(note!.matches(":state(block)")).toBe(true)
    expect(note!.shadowRoot!.querySelector('[part~="title"]')!.textContent).toBe("Update")
    expect(note!.shadowRoot!.querySelector('[part~="time"]')).toBeNull()
    note!.replaceChildren()
    await new Promise(requestAnimationFrame)
    await ElementFixture.tick()
    expect(note!.matches(":state(block)")).toBe(false)
  })
})

// epic `epic-workflow` P25:  the page's own buttons in the title row, where the docs runtime puts the bullhorn too
describe("<epic-update> actions slot", () => {
  // P25:  the page's own buttons in the title row, where the docs runtime puts the bullhorn
  test("`slot=\"actions\"`:  on the title row's right, BEFORE the date;  a click never folds it, and isn't what changed", async () => {
    const update = await ElementFixture.render(
      `<epic-update at="2026-10-11 14:30" summary="Split P7"><p>Why.</p>` +
        `<button slot="actions" aria-label="Copy">C</button></epic-update>`
    )
    await ElementFixture.tick()
    const shadow = update.shadowRoot!
    const button = update.querySelector<HTMLElement>("button[slot=actions]")!
    expect(button.assignedSlot?.getAttribute("name")).toBe("actions")
    const [b, time, title] = [
      button,
      shadow.querySelector('[part~="time"]')!,
      shadow.querySelector('[part~="title"]')!
    ].map((each) => each.getBoundingClientRect())
    expect(b.right).toBeLessThanOrEqual(time.left + 0.5)
    expect(title.top).toBeLessThan(b.bottom)
    button.click()
    await ElementFixture.tick()
    expect(update.matches(":state(open)")).toBe(true)
    // a summary and a button, no children:  nothing to fold
    const alone = await ElementFixture.render(
      `<epic-update at="2026-10-11 14:30" summary="Alone"><button slot="actions">C</button></epic-update>`
    )
    await ElementFixture.tick()
    expect(alone.shadowRoot!.querySelector('[part~="toggle"]')).toBeNull()
    await expectAccessible(update)
  })
})

/** Where `element`'s first line of text starts, from the viewport top:  its first character's box. */
function firstLineTop(element: Element): number {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, (node) =>
    node.textContent!.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
  )
  const text = walker.nextNode()!
  const range = document.createRange()
  range.setStart(text, text.textContent!.search(/\S/))
  range.setEnd(text, text.textContent!.search(/\S/) + 1)
  return range.getBoundingClientRect().top
}

// epic `epic-workflow` P25, J183 (Owen, 2026-10-18:  "ellipsis when collapsed, wrap when expanded")

describe("<epic-update> title, folded and open", () => {
  test("open (as it starts):  the title wraps;  folded:  ONE line beside the date, cut with …, its words the tooltip", async () => {
    const wrap = await ElementFixture.render(
      `<div style="width: 320px"><epic-update at="2026-10-11 14:30" summary="A long title that cannot fit on one line of the narrow side bar, so folded it is cut and open it wraps"><p>Why.</p></epic-update></div>`
    )
    await ElementFixture.tick()
    const update = wrap.querySelector("epic-update")!
    const shadow = update.shadowRoot!
    const title = shadow.querySelector<HTMLElement>('[part~="title"]')!
    const time = shadow.querySelector<HTMLElement>('[part~="time"]')!
    const lineHeight =
      parseFloat(getComputedStyle(title).lineHeight) || parseFloat(getComputedStyle(title).fontSize) * 1.2
    const open = { top: firstLineTop(title), time: time.getBoundingClientRect() }
    expect([title.getBoundingClientRect().height > lineHeight * 1.5, title.hasAttribute("title")]).toEqual([
      true,
      false
    ])
    shadow.querySelector<HTMLElement>('[part~="toggle"]')!.click()
    await ElementFixture.tick()
    expect(update.matches(":state(open)")).toBe(false)
    expect(title.getBoundingClientRect().height).toBeLessThan(lineHeight * 1.5)
    expect(title.scrollWidth).toBeGreaterThan(title.clientWidth)
    expect(title.title).toBe(
      "Update: A long title that cannot fit on one line of the narrow side bar, so folded it is cut and open it wraps"
    )
    expect(title.getBoundingClientRect().right).toBeLessThanOrEqual(time.getBoundingClientRect().left)
    expect(firstLineTop(title)).toBeCloseTo(open.top, 0)
    expect(time.getBoundingClientRect().left).toBeCloseTo(open.time.left, 0)
  })
})
