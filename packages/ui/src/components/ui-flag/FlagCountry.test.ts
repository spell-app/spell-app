import { describe, expect, test } from "vite-plus/test"

import { FlagCountry } from "./FlagCountry"

describe("new FlagCountry()", () => {
  test.each([
    ["fr", "fr", "🇫🇷"],
    ["FR", "fr", "🇫🇷"],
    [" France ", "fr", "🇫🇷"],
    ["United_States", "us", "🇺🇸"],
    ["united   states", "us", "🇺🇸"],
    ["america", "us", "🇺🇸"],
    ["uk", "gb", "🇬🇧"],
    ["england", "gb-eng", "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}"],
    ["pride", "rainbow", "\u{1F3F3}\u{FE0F}\u{200D}\u{1F308}"],
    ["atlantis", "", ""],
    ["", "", ""]
  ])("%j => %j %s", (country, code, emoji) => {
    const resolved = new FlagCountry(country)
    expect(resolved.code).toBe(code)
    expect(resolved.emoji).toBe(emoji)
  })
})

describe("FlagCountry.textKey / .region", () => {
  test("names non-country flags by text key, countries by region", () => {
    expect(new FlagCountry("england").textKey).toBe("gbEng")
    expect(new FlagCountry("england").region).toBeUndefined()
    expect(new FlagCountry("fr").textKey).toBeUndefined()
    expect(new FlagCountry("fr").region).toBe("FR")
    expect(new FlagCountry("nowhere").region).toBeUndefined()
  })
})
