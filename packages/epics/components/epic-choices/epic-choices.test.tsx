import { describe, expect, test } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/a11y"

import "$/epics/components/epic-item"
import "$/epics/components/epic-choices"

/** Two options, `B` recommended. */
const OPTIONS =
  `<epic-option letter="A" title="A named palette"><ul><li>short</li></ul></epic-option>` +
  `<epic-option letter="B" title="Any CSS colour" recommended><ul><li>free</li></ul></epic-option>`

/** Render `html`;  returns its `<epic-choices>` and the option hosts. */
async function choices(html: string) {
  const first = await ElementFixture.render(html)
  const host = first.localName === "epic-choices" ? first : first.querySelector("epic-choices")!
  return { host, options: Array.from(host.querySelectorAll("epic-option")) }
}

/** `element`'s shadow part `name`. */
function part(element: Element, name: string): HTMLElement | null {
  return element.shadowRoot!.querySelector<HTMLElement>(`[part~='${name}']`)
}

describe("<epic-choices>", () => {
  test("an open question:  cards side by side, each headed `A · title`, `(recommended)` after;  passes axe", async () => {
    const { host, options } = await choices(`<epic-choices>${OPTIONS}</epic-choices>`)
    expect(host.matches(":state(answered)")).toBe(false)
    expect(getComputedStyle(part(host, "base")!).display).toBe("grid")
    expect(options.map((option) => part(option, "title")!.textContent)).toEqual([
      "A · A named palette",
      "B · Any CSS colour (recommended)"
    ])
    expect(options.map((option) => part(option, "base")!.className)).toEqual(["option card", "option card"])
    expect(part(host, "toggle")).toBeNull()
    await expectAccessible(host)
  })

  test("answered:  folded under `Choices`;  the chosen option a panel marked with a check, and open;  passes axe", async () => {
    const { host, options } = await choices(`<epic-choices chosen="B">${OPTIONS}</epic-choices>`)
    const [a, b] = options
    expect(host.matches(":state(answered)")).toBe(true)
    expect([part(host, "toggle")!.textContent, part(host, "panels")!.getAttribute("hidden")]).toEqual([
      "Choices",
      "until-found"
    ])
    expect([a.matches(":state(chosen)"), b.matches(":state(chosen)")]).toEqual([false, true])
    expect([part(a, "check"), part(b, "check")?.localName]).toEqual([null, "svg"])
    expect([part(a, "body")!.getAttribute("hidden"), part(b, "body")!.hasAttribute("hidden")]).toEqual([
      "until-found",
      false
    ])
    part(host, "toggle")!.click()
    await ElementFixture.tick()
    expect([host.matches(":state(open)"), part(host, "panels")!.hasAttribute("hidden")]).toEqual([true, false])
    await expectAccessible(host)
  })

  test("a panel's header folds and unfolds it", async () => {
    const { options } = await choices(`<epic-choices chosen="A">${OPTIONS}</epic-choices>`)
    const [, b] = options
    part(b, "toggle")!.click()
    await ElementFixture.tick()
    expect([b.matches(":state(open)"), part(b, "body")!.hasAttribute("hidden")]).toEqual([true, false])
    part(b, "toggle")!.click()
    await ElementFixture.tick()
    expect(b.matches(":state(open)")).toBe(false)
  })

  test("answered without a pick (`answered` on its item):  folded too, nothing marked;  follows `chosen` as it's set", async () => {
    const { host, options } = await choices(
      `<epic-item id="q1" title="Which?" status="decided" answered><epic-choices>${OPTIONS}</epic-choices></epic-item>`
    )
    expect(host.matches(":state(answered)")).toBe(true)
    expect(options.some((option) => option.matches(":state(chosen)"))).toBe(false)
    host.setAttribute("chosen", "A")
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(options[0].matches(":state(chosen)")).toBe(true)
  })

  test("an option's title with markup comes through its `title` slot", async () => {
    const { options } = await choices(
      `<epic-choices><epic-option letter="A"><span slot="title">The <code>x</code> API</span><p>Why</p></epic-option></epic-choices>`
    )
    const slot = part(options[0], "title")!.querySelector<HTMLSlotElement>("slot")!
    expect(slot.assignedElements()[0].textContent).toBe("The x API")
  })
})
