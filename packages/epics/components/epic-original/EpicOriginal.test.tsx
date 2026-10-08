import { describe, expect, test } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

import "$/epics/components/epic-original"

/** `element`'s shadow part `name`. */
function part(element: Element, name: string): HTMLElement | null {
  return element.shadowRoot!.querySelector<HTMLElement>(`[part~='${name}']`)
}

describe("<epic-original>", () => {
  test("an `Original Discussion` aside, folded;  its heading unfolds it;  passes axe", async () => {
    const host = await ElementFixture.render(
      `<epic-original><epic-version><p>As first asked.</p></epic-version></epic-original>`
    )
    const toggle = part(host, "toggle")!
    expect([toggle.textContent, part(host, "body")!.getAttribute("hidden")]).toEqual([
      "Original Discussion",
      "until-found"
    ])
    toggle.click()
    await ElementFixture.tick()
    expect([host.matches(":state(open)"), part(host, "body")!.hasAttribute("hidden")]).toEqual([true, false])
    await expectAccessible(host)
  })
})

describe("<epic-version>", () => {
  test("a lone first version has no heading;  with a second, `As first written`, then `As of <as-of>`", async () => {
    const lone = await ElementFixture.render(`<epic-original><epic-version><p>Only</p></epic-version></epic-original>`)
    expect(part(lone.querySelector("epic-version")!, "heading")).toBeNull()
    const two = await ElementFixture.render(
      `<epic-original><epic-version><p>First</p></epic-version>` +
        `<epic-version as-of="2026-10-04 20:49"><p>Second</p></epic-version></epic-original>`
    )
    expect(
      Array.from(two.querySelectorAll("epic-version"), (version) => part(version, "heading")!.textContent)
    ).toEqual(["As first written", "As of 10/4/26 20:49"])
  })

  test("the first version gets its heading when a second arrives", async () => {
    const host = await ElementFixture.render(`<epic-original><epic-version><p>Only</p></epic-version></epic-original>`)
    host.insertAdjacentHTML("beforeend", `<epic-version as-of="2026-10-07 01:00"><p>Next</p></epic-version>`)
    await ElementFixture.settle(host)
    await ElementFixture.tick()
    expect(part(host.querySelector("epic-version")!, "heading")!.textContent).toBe("As first written")
  })
})
