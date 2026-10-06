import { describe, expect, test } from "vite-plus/test"

import { BuiltInPacks } from "./BuiltInPacks"

describe("BuiltInPacks.url()", () => {
  test("`assets` re-points built-in packs:  `<assets>icon-packs/<id>/pack.js`", () => {
    expect(BuiltInPacks.url("fa7-brands", "https://cdn.example/ui/")).toBe(
      "https://cdn.example/ui/icon-packs/fa7-brands/pack.js"
    )
  })

  test("defaults to the folder beside this module", () => {
    expect(BuiltInPacks.url("fa7-free")).toBe(new URL("icon-packs/fa7-free/pack.js", BuiltInPacks.base).href)
  })
})

describe("BuiltInPacks.has()", () => {
  test("knows the ids we ship;  a URL or another name is NOT one", () => {
    expect(BuiltInPacks.has("fa7-brands")).toBe(true)
    expect(BuiltInPacks.has("fomantic")).toBe(true)
    expect(BuiltInPacks.has("/icons/pack.js")).toBe(false)
    expect(BuiltInPacks.has("lucide")).toBe(false)
  })
})
