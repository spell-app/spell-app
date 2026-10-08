import { describe, expect, test } from "vite-plus/test"

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
})
