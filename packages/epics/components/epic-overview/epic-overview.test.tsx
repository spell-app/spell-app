import { describe, expect, test } from "vite-plus/test"

import type { UIHost } from "$/ui/core"
import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/a11y"

import "$/ui/components/ui-section"
import "$/epics/components/epic-overview"
import "$/epics/components/epic-section"

/** `host`'s inner `<ui-section>`. */
function inner(host: Element): UIHost {
  return host.shadowRoot!.querySelector("ui-section") as UIHost
}

describe("<epic-overview>", () => {
  test("`1. Overview`:  the summary, the Kickoff prompt FOLDED, the estimate, then its sub-sections;  axe", async () => {
    const host = await ElementFixture.render<UIHost>(
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

  test("no prompt, no estimate:  neither is drawn", async () => {
    const host = await ElementFixture.render<UIHost>(
      `<epic-overview id="overview" open><p slot="summary">S</p></epic-overview>`
    )
    await ElementFixture.settle(host)
    expect(host.shadowRoot!.querySelector('[part~="prompt"], [part~="estimate"]')).toBeNull()
  })
})
