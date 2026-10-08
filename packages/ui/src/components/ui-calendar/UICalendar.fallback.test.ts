import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/Fixture"
import { expectAccessible } from "$/ui/test/A11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"

import { CalendarFallback } from "./UICalendar.fallback"

FallbackStub.define(
  "x-fb-calendar",
  (host, root, internals) => CalendarFallback.render({ domElement: host, root, error: new Error("boom"), internals }),
  true
)

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

describe("CalendarFallback", () => {
  it("renders the box and the native input holding the same ISO value, per type", async () => {
    const host = Fixture.render<StubHost>(
      `<x-fb-calendar size="small" type="date" value="2026-09-30" min="2026-01-01" required placeholder="Due"></x-fb-calendar>`
    )
    const root = FallbackStub.shadow(host).firstElementChild!
    expect(root.className).toBe("ui small calendar")
    expect(root.getAttribute("part")).toBe("calendar")
    const input = root.querySelector<HTMLInputElement>(".ui.input > input[part=control]")!
    expect([input.type, input.value, input.min, input.required]).toEqual(["date", "2026-09-30", "2026-01-01", true])
    expect(input.getAttribute("aria-label")).toBe("Due")
    await expectAccessible(host, AXE)
    const types = { time: "time", datetime: "datetime-local", month: "month", year: "number" }
    for (const [type, native] of Object.entries(types)) {
      const other = Fixture.render<StubHost>(`<x-fb-calendar type="${type}" aria-label="${type}"></x-fb-calendar>`)
      // the attribute, not `.type`:  Safari has no `month` input, and reflects it as `text`
      expect(FallbackStub.shadow(other).querySelector("input")!.getAttribute("type"), type).toBe(native)
    }
    const fallback = Fixture.render<StubHost>(`<x-fb-calendar aria-label="Default"></x-fb-calendar>`)
    expect(FallbackStub.shadow(fallback).querySelector("input")!.type).toBe("datetime-local")
  })

  it("is still a form control:  value, validity, host.value and ui-change", () => {
    const form = Fixture.render<HTMLFormElement>(
      `<form><x-fb-calendar name="due" type="date" required aria-label="Due"></x-fb-calendar></form>`
    )
    const host = form.querySelector<StubHost & { value?: string }>("x-fb-calendar")!
    expect(form.checkValidity()).toBe(false)
    const changes: unknown[] = []
    host.addEventListener("ui-change", (event) => changes.push((event as CustomEvent).detail.value))
    const input = FallbackStub.shadow(host).querySelector("input")!
    input.value = "2026-10-04"
    input.dispatchEvent(new Event("input", { bubbles: true }))
    input.dispatchEvent(new Event("change", { bubbles: true }))
    expect(new FormData(form).get("due")).toBe("2026-10-04")
    expect(form.checkValidity()).toBe(true)
    expect(host.value).toBe("2026-10-04")
    expect(changes).toEqual(["2026-10-04"])
  })
})
