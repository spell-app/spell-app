import { existsSync } from "fs"
import { beforeAll, describe, test, expect } from "vite-plus/test"

import { CLI } from "$/cli"

let icons: CLI.IconInfo[]
beforeAll(async () => {
  icons = await CLI.loadIcons()
})

describe("loadIcons()", () => {
  test("every built-in pack, by the names the runtime knows them by", () => {
    expect(new Set(icons.map((icon) => icon.pack))).toEqual(new Set(["fa7-free", "fa7-brands", "fomantic"]))
    const bell = icons.find((icon) => icon.pack === "fomantic" && icon.name === "bell")!
    expect(bell.aliases).toContain("alarm")
    expect(bell.keywords).toContain("buzzer")
    expect(existsSync(bell.svg)).toBe(true)
  })

  test("an unknown pack", async () => {
    await expect(CLI.loadIcons(["nope"])).rejects.toThrow("No icon pack 'nope'")
  })
})

describe("searchIcons()", () => {
  test("the exact name first, then names starting with it, then the rest", () => {
    const names = CLI.searchIcons(icons, "bell").map((icon) => icon.name)
    expect(names.slice(0, 2)).toEqual(["bell", "bell"])
    expect(names).toContain("bell slash")
    expect(names).toContain("dumbbell")
  })

  test("a keyword finds an icon only at the start of one of its words", () => {
    expect(CLI.searchIcons(icons, "buzzer").map((icon) => icon.name)).toContain("bell")
    expect(CLI.searchIcons(icons, "bell").map((icon) => icon.name)).not.toContain("brain")
  })

  test("every word must match;  `-` ~== space", () => {
    const names = CLI.searchIcons(icons, "address-book outline").map((icon) => icon.name)
    expect(new Set(names)).toEqual(new Set(["address book outline"]))
  })
})
