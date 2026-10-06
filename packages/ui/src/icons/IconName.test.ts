import { describe, expect, test } from "vite-plus/test"

import { IconName } from "./IconName"

////////////////
// ## Spelling
////////////////

describe("IconName.normalize()", () => {
  test("lowercases, turns dashes and underscores into spaces, and collapses whitespace", () => {
    expect(IconName.normalize("Address-Book")).toBe("address book")
    expect(IconName.normalize("  arrow__up   circle ")).toBe("arrow up circle")
  })
})

describe("IconName.fromKey()", () => {
  test("names an icon by its file name, without the folder", () => {
    expect(IconName.fromKey("solid/address-book")).toBe("address book")
    expect(IconName.fromKey("bell")).toBe("bell")
  })
})

describe("IconName.aliases()", () => {
  test("takes one alias or a list, normalized;  empty ones drop", () => {
    expect(IconName.aliases(undefined)).toEqual([])
    expect(IconName.aliases("Cog")).toEqual(["cog"])
    expect(IconName.aliases(["setting", "", "Gear-Wheel"])).toEqual(["setting", "gear wheel"])
  })
})

describe("IconName.split()", () => {
  test("splits at the FIRST separator only;  no separator means no prefix", () => {
    expect(IconName.split("Lucide:Arrow-Up")).toEqual({ prefix: "lucide", name: "arrow up" })
    expect(IconName.split("a:b:c")).toEqual({ prefix: "a", name: "b:c" })
    expect(IconName.split("bell")).toEqual({ name: "bell" })
  })
})

////////////////
// ## Claiming names
////////////////

describe("IconName.claim()", () => {
  test("an alias beats a name derived from a file;  otherwise the FIRST entry keeps a name", () => {
    const claimed = IconName.claim([
      ["solid/shield", undefined],
      ["solid/shield-halved", "shield"],
      ["regular/bell", undefined],
      ["solid/bell", undefined]
    ])
    expect(Object.fromEntries(claimed)).toEqual({
      shield: "solid/shield-halved",
      "shield halved": "solid/shield-halved",
      bell: "regular/bell"
    })
  })
})
