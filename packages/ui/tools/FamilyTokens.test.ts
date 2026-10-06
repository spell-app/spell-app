import { describe, expect, test } from "vite-plus/test"

import { FamilyTokens } from "./FamilyTokens.ts"

describe("FamilyTokens.typeFor()", () => {
  test.each([
    ["--ui-x-color", "var(--ui-text-color)", "color"],
    ["--ui-x-background", "oklch(0.5 0 0)", "color"],
    ["--ui-x-radius", "var(--ui-radius)", "length"],
    ["--ui-x-padding-block", "0.5em", "length"],
    ["--ui-x-duration", "var(--ui-duration-fast)", "time"],
    ["--ui-x-opacity", "0.5", "number"],
    ["--ui-x-shadow", "0 1px 2px var(--ui-border-color)", "other"]
  ])("%s: %s => %s", (name, value, type) => {
    expect(FamilyTokens.typeFor(name, value)).toBe(type)
  })
})
