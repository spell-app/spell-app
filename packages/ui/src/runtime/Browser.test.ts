import { describe, expect, it } from "vite-plus/test"

import { Browser } from "./Browser"

describe("Browser", () => {
  const browser = new Browser()

  it("detects features once, as booleans", () => {
    const supports = browser.supports
    expect(browser.supports).toBe(supports)
    for (const [flag, value] of Object.entries(supports)) expect(typeof value, flag).toBe("boolean")
  })

  it("reports what the test browser is known to have", () => {
    // `yarn review` runs chromium;  `yarn test:all` adds firefox / webkit, where these still hold
    expect(browser.supports.popover).toBe(true)
    expect(browser.supports.customStates).toBe(true)
    expect(browser.supports.startingStyle).toBe(true)
  })

  it("sniffs exactly one engine", () => {
    const engines = [browser.isChromium, browser.isFirefox, browser.isSafari].filter(Boolean)
    expect(engines).toHaveLength(1)
  })

  it("reads live media preferences", () => {
    expect(browser.reducedMotion).toBe(matchMedia("(prefers-reduced-motion: reduce)").matches)
    expect(browser.prefersDark).toBe(matchMedia("(prefers-color-scheme: dark)").matches)
  })
})
