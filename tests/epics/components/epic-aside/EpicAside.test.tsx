import { describe, expect, test } from "vite-plus/test"

import type { DOMElement } from "$/ui/core"
import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

import "$/epics/components/epic-aside"

/** `element`'s shadow part `name`. */
function part(element: Element, name: string): HTMLElement {
  return element.shadowRoot!.querySelector<HTMLElement>(`[part~='${name}']`)!
}

/** An aside as a doc holds it. */
const ASIDE = `<epic-aside title="where it stood at kickoff, 2026-10-03"><p>Plain markup, then.</p></epic-aside>`

describe("<epic-aside>", () => {
  test("FOLDED, headed `Aside:  <title>`, its prose slotted (the page's own);  passes axe", async () => {
    const host = await ElementFixture.render(ASIDE)
    expect({
      heading: part(host, "heading").textContent,
      expanded: part(host, "toggle").getAttribute("aria-expanded"),
      hidden: part(host, "body").getAttribute("hidden"),
      slotted: !!host.querySelector("p")!.assignedSlot
    }).toEqual({
      heading: "Aside:  where it stood at kickoff, 2026-10-03",
      expanded: "false",
      hidden: "until-found",
      slotted: true
    })
    await expectAccessible(host)
  })

  test("a click unfolds it;  find-in-page (`beforematch`) does too;  no title reads `Aside`", async () => {
    const host = await ElementFixture.render(`<epic-aside><p>Text</p></epic-aside>`)
    expect(part(host, "heading").textContent).toBe("Aside")
    part(host, "toggle").click()
    await ElementFixture.tick()
    expect([host.matches(":state(open)"), part(host, "body").hidden]).toEqual([true, false])

    const found = await ElementFixture.render(ASIDE)
    part(found, "body").dispatchEvent(new Event("beforematch"))
    await ElementFixture.tick()
    expect(found.matches(":state(open)")).toBe(true)
  })

  test("never wider than the side bar's ~320px, the heading wrapping;  readable on its ivory in the DARK scheme", async () => {
    const wrap = await ElementFixture.render(
      `<div style="width: 320px; color-scheme: dark; background: #1b1c1d"><epic-aside title="${"a long title ".repeat(8)}"><p>Text</p></epic-aside></div>`
    )
    const host = wrap.querySelector("epic-aside")!
    part(host, "toggle").click()
    await ElementFixture.tick()
    expect([host.getBoundingClientRect().width <= 320, wrap.scrollWidth <= 320]).toEqual([true, true])
    await expectAccessible(host)
  })

  test("`disabled` is unusable (the default):  dimmed, its fold button inert, `aria-disabled`", async () => {
    const host = await ElementFixture.render<DOMElement>(ASIDE.replace("<epic-aside ", "<epic-aside disabled "))
    await ElementFixture.tick()
    expect({
      dimmed: host.matches(":state(dimmed)"),
      inert: part(host, "toggle").closest("[inert]") !== null,
      ariaDisabled: host.internals.ariaDisabled
    }).toEqual({ dimmed: true, inert: true, ariaDisabled: "true" })
  })
})

// epic `epic-workflow` P25:  the page's own buttons in the title row, where the docs runtime puts the bullhorn too
describe("<epic-aside> actions slot", () => {
  // P25:  the page's own buttons in the heading's row, where the docs runtime puts the bullhorn
  test('`slot="actions"`:  in the heading\'s row, the fold button ending where they start;  a click never folds it', async () => {
    const host = await ElementFixture.render(
      ASIDE.replace("</epic-aside>", '<button slot="actions" aria-label="Copy">C</button></epic-aside>')
    )
    const button = host.querySelector<HTMLElement>("button[slot=actions]")!
    expect(button.assignedSlot?.getAttribute("name")).toBe("actions")
    expect(part(host, "actions").hidden).toBe(false)
    const [toggle, own] = [part(host, "toggle"), button].map((each) => each.getBoundingClientRect())
    expect(toggle.right).toBeLessThanOrEqual(own.left + 0.5)
    expect(own.right).toBeLessThanOrEqual(host.getBoundingClientRect().right)
    button.click()
    await ElementFixture.tick()
    expect(host.matches(":state(open)")).toBe(false)
    // nothing slotted:  no box, and the fold button is the whole row
    const plain = await ElementFixture.render(ASIDE)
    expect(part(plain, "actions").hidden).toBe(true)
    expect(part(plain, "toggle").getBoundingClientRect().width).toBe(part(plain, "head").getBoundingClientRect().width)
    // one slotted later (the docs runtime's bullhorn):  the box follows
    plain.append(Object.assign(document.createElement("button"), { slot: "actions", textContent: "B" }))
    await ElementFixture.tick()
    expect(part(plain, "actions").hidden).toBe(false)
    await expectAccessible(host)
  })
})

// epic `epic-workflow` P25, J183 (Owen, 2026-10-18:  "ellipsis when collapsed, wrap when expanded")

describe("<epic-aside> heading, folded and open", () => {
  test("folded:  ONE line cut with …, its words the tooltip;  open:  it wraps;  the slot's button stays put", async () => {
    const wrap = await ElementFixture.render(
      `<div style="width: 320px"><epic-aside title="A long title that cannot fit on one line of the narrow side bar, so folded it is cut and open it wraps"><p>Text</p>` +
        `<button slot="actions" aria-label="Copy">C</button></epic-aside></div>`
    )
    const host = wrap.querySelector("epic-aside")!
    const heading = part(host, "heading")
    const button = host.querySelector<HTMLElement>("button[slot=actions]")!
    const lineHeight = parseFloat(getComputedStyle(heading).lineHeight)
    const folded = { top: heading.getBoundingClientRect().top, button: button.getBoundingClientRect() }
    expect(heading.getBoundingClientRect().height).toBeLessThan(lineHeight * 1.5)
    expect(heading.scrollWidth).toBeGreaterThan(heading.clientWidth)
    expect(heading.title).toBe(
      "Aside:  A long title that cannot fit on one line of the narrow side bar, so folded it is cut and open it wraps"
    )
    part(host, "toggle").click()
    await ElementFixture.tick()
    expect(heading.getBoundingClientRect().height).toBeGreaterThan(lineHeight * 1.5)
    expect(heading.hasAttribute("title")).toBe(false)
    expect(heading.getBoundingClientRect().top).toBeCloseTo(folded.top, 0)
    expect(button.getBoundingClientRect().left).toBeCloseTo(folded.button.left, 0)
    expect(button.getBoundingClientRect().top).toBeCloseTo(folded.button.top, 0)
  })
})
