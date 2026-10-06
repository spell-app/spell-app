import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/Fixture"
import { expectAccessible } from "$/ui/test/A11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"

import { StatisticFallback } from "./ui-statistic.fallback"

FallbackStub.define("x-fb-statistic", (host, root, internals) =>
  StatisticFallback.render({ host, root, error: new Error("boom"), internals })
)

describe("StatisticFallback", () => {
  it("renders the class grammar, the value shorthand, the slot, then the label shorthand", async () => {
    const host = Fixture.render<StubHost>(
      `<x-fb-statistic size="large" color="red" horizontal value="5,550" label="Downloads"></x-fb-statistic>`
    )
    const statistic = FallbackStub.shadow(host).firstElementChild!
    expect(statistic.className).toBe("ui large red horizontal statistic")
    expect(statistic.getAttribute("part")).toBe("statistic")
    const [value, slot, label] = [...statistic.children]
    expect(value!.className).toBe("value in-statistic")
    expect(value!.textContent).toBe("5,550")
    expect(slot!.localName).toBe("slot")
    expect(label!.className).toBe("label in-statistic")
    expect(label!.getAttribute("part")).toBe("label")
    await expectAccessible(host)
  })

  it("marks a text value, and leaves out absent shorthands", () => {
    const host = Fixture.render<StubHost>(`<x-fb-statistic value="Three" text></x-fb-statistic>`)
    const statistic = FallbackStub.shadow(host).firstElementChild!
    expect(statistic.querySelector("[part=value]")!.className).toBe("text value in-statistic")
    expect(statistic.querySelector("[part=label]")).toBeNull()
  })
})
