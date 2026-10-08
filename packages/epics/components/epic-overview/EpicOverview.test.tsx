import { describe, expect, test } from "vite-plus/test"

import type { E } from "$/ui/core"
import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

import "$/ui/components/ui-section"
import "$/epics/components/epic-overview"
import "$/epics/components/epic-section"
import "$/epics/components/epic-summary"
import "$/epics/components/epic-prompt"

/** `host`'s inner `<ui-section>`. */
function inner(host: Element): E.DOMElement {
  return host.shadowRoot!.querySelector("ui-section") as E.DOMElement
}

describe("<epic-overview>", () => {
  test("`1. Overview`:  the summary, the Kickoff prompt FOLDED, the estimate, then its sub-sections;  axe", async () => {
    const host = await ElementFixture.render<E.DOMElement>(
      `<epic-overview id="overview" estimate="4h in all, 2h left" open>` +
        `<p slot="summary">Summary</p><blockquote slot="prompt"><p>Prompt</p></blockquote>` +
        `<epic-section id="o1" kind="overview-part" title="Structure"><p>Hello</p></epic-section></epic-overview>`
    )
    await inner(host).ready
    await ElementFixture.settle(host)
    const shadow = host.shadowRoot!
    const header = inner(host).shadowRoot!.querySelector('[part~="header"] slot') as HTMLSlotElement
    expect(
      header
        .assignedNodes({ flatten: true })
        .map((node) => node.textContent)
        .join("")
    ).toBe("1. Overview")
    const prompt = shadow.querySelector<HTMLDetailsElement>('[part~="prompt"]')!
    expect({ open: prompt.open, title: prompt.querySelector("summary")!.textContent }).toEqual({
      open: false,
      title: "Kickoff prompt"
    })
    expect(host.querySelector("blockquote")!.assignedSlot).toBe(prompt.querySelector("slot"))
    expect(shadow.querySelector('[part~="estimate"]')!.textContent!.replace(/\s+/g, " ").trim()).toBe(
      "Estimate: 4h in all, 2h left"
    )
    expect(host.querySelector('p[slot="summary"]')!.assignedSlot).not.toBeNull()
    const part = host.querySelector("epic-section")!
    await inner(part).ready
    await ElementFixture.tick()
    expect(part.shadowRoot!.querySelector(".number")!.textContent).toBe("1.1")
    await expectAccessible(host)
  })

  test("`<epic-summary>` and `<epic-prompt>` (P14) are drawn where the slots were:  summary, prompt, estimate, sub-sections", async () => {
    const host = await ElementFixture.render<E.DOMElement>(
      `<epic-overview id="overview" estimate="4h in all, 2h left" open>` +
        `<epic-summary>Summary</epic-summary><epic-prompt><p>Prompt</p></epic-prompt>` +
        `<epic-section id="o1" kind="overview-part" title="Structure"><p>Hello</p></epic-section></epic-overview>`
    )
    await inner(host).ready
    await ElementFixture.settle(host)
    const shadow = host.shadowRoot!
    const top = (element: Element) => element.getBoundingClientRect().top
    const [summary, prompt, part] = ["epic-summary", "epic-prompt", "epic-section"].map((tag) =>
      host.querySelector(tag)!
    )
    const estimate = shadow.querySelector('[part~="estimate"]')!
    expect([top(summary) < top(prompt), top(prompt) < top(estimate), top(estimate) < top(part)]).toEqual([
      true,
      true,
      true
    ])
    // the overview's own fold for an older doc's prompt isn't drawn:  `<epic-prompt>` folds itself
    expect(shadow.querySelector('[part~="prompt"]')).toBeNull()
    await expectAccessible(host)
  })

  test("an older doc's slots keep their places too:  summary, prompt, estimate, sub-sections", async () => {
    const host = await ElementFixture.render<E.DOMElement>(
      `<epic-overview id="overview" estimate="4h" open><p slot="summary">S</p>` +
        `<blockquote slot="prompt"><p>P</p></blockquote>` +
        `<epic-section id="o1" kind="overview-part" title="Structure"><p>Hello</p></epic-section></epic-overview>`
    )
    await inner(host).ready
    await ElementFixture.settle(host)
    const shadow = host.shadowRoot!
    const top = (element: Element) => element.getBoundingClientRect().top
    const [summary, prompt, estimate] = [
      host.querySelector('[slot="summary"]')!,
      shadow.querySelector('[part~="prompt"]')!,
      shadow.querySelector('[part~="estimate"]')!
    ]
    expect([
      top(summary) < top(prompt),
      top(prompt) < top(estimate),
      top(estimate) < top(host.querySelector("epic-section")!)
    ]).toEqual([true, true, true])
  })

  test("no prompt, no estimate:  neither is drawn", async () => {
    const host = await ElementFixture.render<E.DOMElement>(
      `<epic-overview id="overview" open><p slot="summary">S</p></epic-overview>`
    )
    await ElementFixture.settle(host)
    expect(host.shadowRoot!.querySelector('[part~="prompt"], [part~="estimate"]')).toBeNull()
  })
})
