import { describe, expect, it } from "vite-plus/test"

import { Browser } from "./Browser"

////////////////
// ## Instance flags
////////////////

describe("Browser.supports", () => {
  const browser = new Browser()

  it("detects features once, as booleans", () => {
    const supports = browser.supports
    expect(browser.supports).toBe(supports)
    for (const [flag, value] of Object.entries(supports)) expect(typeof value, flag).toBe("boolean")
  })

  it("reports what the test browser is known to have", () => {
    // `yarn review` runs chromium;  `yarn test:all` adds firefox / webkit, where these still hold
    expect(browser.supports).toMatchObject({ popover: true, customStates: true, startingStyle: true })
  })
})

describe("Browser.isChromium / isFirefox / isSafari", () => {
  it("sniffs exactly one engine", () => {
    const browser = new Browser()
    const engines = [browser.isChromium, browser.isFirefox, browser.isSafari].filter(Boolean)
    expect(engines).toHaveLength(1)
  })
})

describe("Browser.isReducedMotion / isDark", () => {
  it("reads live media preferences", () => {
    const browser = new Browser()
    expect(browser.isReducedMotion).toBe(matchMedia("(prefers-reduced-motion: reduce)").matches)
    expect(browser.isDark).toBe(matchMedia("(prefers-color-scheme: dark)").matches)
  })
})

////////////////
// ## Statics
////////////////

describe("Browser.isApplePlatform()", () => {
  it("reads the platform, else the user agent", () => {
    const navigatorFor = (platform: string, userAgent = "") => ({ platform, userAgent }) as Navigator
    expect(Browser.isApplePlatform(navigatorFor("MacIntel"))).toBe(true)
    expect(Browser.isApplePlatform(navigatorFor("", "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)"))).toBe(true)
    expect(Browser.isApplePlatform(navigatorFor("Win32"))).toBe(false)
    expect(new Browser().isApple).toBe(Browser.isApplePlatform(navigator))
  })
})
