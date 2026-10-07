import { describe, expect, test } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/a11y"

import { EpicAnswerFallback } from "./epic-answer.fallback"

import "$/epics/components/epic-answer"

/** `element`'s shadow part `name`. */
function part(element: Element, name: string): HTMLElement | null {
  return element.shadowRoot!.querySelector<HTMLElement>(`[part~='${name}']`)
}

describe("<epic-answer>", () => {
  test("a card headed `Answer · <title>`, its body slotted;  passes axe", async () => {
    const host = await ElementFixture.render(`<epic-answer title="Named palette"><p>Why</p></epic-answer>`)
    expect(part(host, "header")!.textContent).toBe("Answer · Named palette")
    expect(host.querySelector("p")!.assignedSlot).not.toBeNull()
    expect(part(host, "body")!.classList.contains("empty")).toBe(false)
    await expectAccessible(host)
  })

  test("keeps an old decision's id:  headed `D7 · ...`, and `#d7` lands on it;  no body:  the heading alone", async () => {
    const host = await ElementFixture.render(`<epic-answer id="d7" title="Chrome"></epic-answer>`)
    expect(part(host, "header")!.textContent).toBe("D7 · Chrome")
    expect(document.getElementById("d7")).toBe(host)
    expect(part(host, "body")!.classList.contains("empty")).toBe(true)
  })

  test("a title with markup comes through its `title` slot (T12);  the body's first child keeps its place", async () => {
    const host = await ElementFixture.render(
      `<epic-answer><span slot="title">The <code>x</code> API</span><p>Why</p></epic-answer>`
    )
    const slot = part(host, "title")!.querySelector<HTMLSlotElement>("slot")!
    expect([part(host, "header")!.textContent, slot.assignedElements()[0].textContent]).toEqual([
      "Answer · ",
      "The x API"
    ])
    expect(host.querySelector("p")!.assignedSlot!.name).toBe("")
    await expectAccessible(host)
  })

  test("its native fallback draws the same heading and body, without Solid", () => {
    const host = document.createElement("div")
    host.setAttribute("id", "d8")
    host.setAttribute("title", "Chrome")
    const root = host.attachShadow({ mode: "open" })
    EpicAnswerFallback.render(host, root)
    expect(root.querySelector(".header")!.textContent).toBe("D8 · Chrome")
    expect(root.querySelector(".body > slot")).not.toBeNull()
  })
})

describe("<epic-reply>", () => {
  test("headed `<from> · <at> · re: <re>`;  Owen's orange, anyone else's violet;  passes axe", async () => {
    const claude = await ElementFixture.render(
      `<epic-reply from="Claude" at="2026-10-06 23:55" re="as built"><p>Done</p></epic-reply>`
    )
    const owen = await ElementFixture.render(`<epic-reply from="Owen" at="2026-10-06 10:42"><p>Why?</p></epic-reply>`)
    expect([part(claude, "header")!.textContent, part(owen, "header")!.textContent]).toEqual([
      "Claude · 2026-10-06 23:55 · re: as built",
      "Owen · 2026-10-06 10:42"
    ])
    expect([part(claude, "base")!.className, part(owen, "base")!.className]).toEqual(["reply", "reply owen"])
    await expectAccessible(claude)
  })
})

describe("<epic-more>", () => {
  test("a card headed More Details, open to start with;  its heading folds it;  passes axe", async () => {
    const host = await ElementFixture.render(`<epic-more><p>More</p></epic-more>`)
    const toggle = part(host, "toggle")!
    expect([toggle.textContent, host.matches(":state(open)"), part(host, "body")!.hasAttribute("hidden")]).toEqual([
      "More Details",
      true,
      false
    ])
    await expectAccessible(host)
    toggle.click()
    await ElementFixture.tick()
    expect([host.matches(":state(open)"), part(host, "body")!.getAttribute("hidden")]).toEqual([false, "until-found"])
  })
})
