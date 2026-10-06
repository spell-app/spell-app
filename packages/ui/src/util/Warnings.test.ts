import { afterEach, describe, expect, test, vi } from "vite-plus/test"

import { Warnings } from "$/ui/util"

describe("Warnings.warn()", () => {
  afterEach(() => vi.restoreAllMocks())

  test("prints `[@spell-app/ui] <source>:  <message>`, then the data as separate arguments", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const error = new Error("404")
    Warnings.warn("UI.icons", "icon pack x.json didn't load:", error)
    expect(warn).toHaveBeenCalledWith("[@spell-app/ui] UI.icons:  icon pack x.json didn't load:", error)
  })
})

describe("Warnings.devWarn()", () => {
  afterEach(() => vi.restoreAllMocks())

  test("warns in a development build (tests run as one)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    Warnings.devWarn("<ui-button color>", 'unknown value "gray"')
    expect(warn).toHaveBeenCalledWith('[@spell-app/ui] <ui-button color>:  unknown value "gray"')
  })
})
