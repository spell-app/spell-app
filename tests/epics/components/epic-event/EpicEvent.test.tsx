import { describe, expect, test } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

import "$/epics/components/epic-event"

describe("<epic-event>", () => {
  test("its icon, its time to the minute, then its text through its slot;  axe", async () => {
    const event = await ElementFixture.render(`<epic-event at="2026-10-06T08:12-04:00">plan doc created</epic-event>`)
    const time = event.shadowRoot!.querySelector("time")!
    expect({ shown: time.textContent, at: time.getAttribute("datetime") }).toEqual({
      shown: "2026-10-06 08:12",
      at: "2026-10-06T08:12-04:00"
    })
    expect(event.shadowRoot!.querySelector('[part~="icon"]')).not.toBeNull()
    expect(event.firstChild!.textContent).toBe("plan doc created")
    await expectAccessible(event)
  })

  test("a date alone shows as written", async () => {
    const event = await ElementFixture.render(`<epic-event at="2026-10-06" icon="flag">a day</epic-event>`)
    expect(event.shadowRoot!.querySelector("time")!.textContent).toBe("2026-10-06")
  })
})
