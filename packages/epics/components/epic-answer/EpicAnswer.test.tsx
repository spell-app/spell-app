import { describe, expect, test } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

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
})

describe("<epic-reply>", () => {
  test("headed `<from> · re: <re>`, the date `10/6/26 23:55` at the right;  Owen's orange, anyone else's violet;  passes axe", async () => {
    const claude = await ElementFixture.render(
      `<epic-reply from="Claude" at="2026-10-06 23:55" re="as built"><p>Done</p></epic-reply>`
    )
    const owen = await ElementFixture.render(`<epic-reply from="Owen" at="2026-10-06 10:42"><p>Why?</p></epic-reply>`)
    expect([claude, owen].map((host) => [part(host, "who")!.textContent, part(host, "date")!.textContent])).toEqual([
      ["Claude · re: as built", "10/6/26 23:55"],
      ["Owen", "10/6/26 10:42"]
    ])
    expect(part(claude, "date")!.getAttribute("datetime")).toBe("2026-10-06 23:55")
    expect([part(claude, "base")!.className, part(owen, "base")!.className]).toEqual(["reply", "owen reply"])
    await expectAccessible(claude)
  })

  test("no `at`:  no date;  nothing to head it:  no band", async () => {
    const undated = await ElementFixture.render(`<epic-reply from="Claude"><p>Done</p></epic-reply>`)
    const bare = await ElementFixture.render(`<epic-reply><p>Done</p></epic-reply>`)
    expect([part(undated, "date"), part(undated, "header")!.hidden, part(bare, "header")!.hidden]).toEqual([
      null,
      false,
      true
    ])
  })

  test("the date stays at the RIGHT of the TOP line, however long the heading, in the side bar's ~320px", async () => {
    const re = "Hmm, can't we put this in JSON? And while we're at it, every pack template, the catalog and the docs"
    const sideBar = await ElementFixture.render(
      `<div style="width: 320px"><epic-reply from="Claude" at="2026-10-07 10:50" re="${re}"><p>Done</p></epic-reply></div>`
    )
    const host = sideBar.querySelector("epic-reply")!
    const [header, who, date] = ["header", "who", "date"].map((name) => part(host, name)!.getBoundingClientRect())
    // the heading wraps (several lines), the date doesn't:  one line, beside the heading's first
    expect(who.height).toBeGreaterThan(date.height * 1.5)
    expect(Math.abs(date.top - who.top)).toBeLessThan(4)
    expect([date.right <= header.right, date.left >= who.right, part(host, "date")!.textContent]).toEqual([
      true,
      true,
      "10/7/26 10:50"
    ])
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
