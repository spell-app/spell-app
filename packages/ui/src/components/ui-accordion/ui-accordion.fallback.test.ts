import { describe, expect, it } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import type { NativeFallbackHandle } from "$/ui/elements"

import { AccordionFallback } from "./ui-accordion.fallback"

/**
 * A host standing in for a failed `<ui-accordion>`:  like `FallbackStub`, but its shadow root assigns slots by
 * hand (`slotAssignment: "manual"`), as the real element's does.  The fallback keys on the canonical tag.
 */
const TAG = "ui-accordion"

if (!customElements.get(TAG)) {
  customElements.define(
    TAG,
    class extends HTMLElement {
      readonly internals = this.attachInternals()
      handle: NativeFallbackHandle | undefined

      constructor() {
        super()
        this.attachShadow({ mode: "open", slotAssignment: "manual" })
      }

      connectedCallback() {
        this.handle = AccordionFallback.render({
          host: this,
          root: this.shadowRoot!,
          error: new Error("boom"),
          internals: this.internals
        })
      }
    }
  )
}

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

/** Three pairs. */
const PANELS =
  `<ui-title>One</ui-title><ui-content>First</ui-content>` +
  `<ui-title>Two</ui-title><ui-content>Second</ui-content>` +
  `<ui-title>Three</ui-title><ui-content>Third</ui-content>`

/** Render a stub accordion;  returns it and its panels. */
function render(attributes: string) {
  const host = Fixture.render(`<ui-accordion ${attributes}>${PANELS}</ui-accordion>`)
  const root = host.shadowRoot!.firstElementChild as HTMLElement
  const details = [...root.querySelectorAll("details")]
  return { host, root, details }
}

describe("AccordionFallback", () => {
  it("renders native <details> panels in the class grammar, the host's `open` panel open", async () => {
    const { host, root, details } = render(`styled compact="very" open="1" aria-label="FAQ"`)
    expect(root.className).toBe("ui styled very compact accordion")
    expect(root.getAttribute("part")).toBe("accordion")
    expect(root.getAttribute("aria-label")).toBe("FAQ")
    expect(details).toHaveLength(3)
    expect(details.map((panel) => panel.open)).toEqual([false, true, false])
    expect(details.every((panel) => panel.name === "panels")).toBe(true)
    const summary = details[1]!.querySelector("summary")!
    expect(summary.className).toBe("active title")
    expect(summary.querySelector("[part~=icon]")!.getAttribute("aria-hidden")).toBe("true")
    expect(host.querySelectorAll("ui-title")[1]!.assignedSlot!.parentElement).toBe(summary)
    expect(host.querySelectorAll("ui-content")[1]!.assignedSlot!.closest("[part~=content]")!.className).toBe(
      "active content"
    )
    await expectAccessible(host, AXE)
  })

  it("keeps native disclosure:  a title click opens its panel and closes the other (exclusive)", async () => {
    const { details } = render(`open="0"`)
    await userEvent.click(details[2]!.querySelector("summary")!)
    await expect.poll(() => details.map((panel) => panel.open)).toEqual([false, false, true])
  })

  it("drops the group name with exclusive=no", () => {
    const { details } = render(`exclusive="no" open="0 2"`)
    expect(details.map((panel) => panel.open)).toEqual([true, false, true])
    expect(details.every((panel) => !panel.name)).toBe(true)
  })
})
