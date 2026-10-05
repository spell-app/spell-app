import { describe, expect, it } from "vite-plus/test"

import { CLI } from "$/cli"

describe("ponyLines()", () => {
  it("puts the saying in a bubble as wide as it", () => {
    const lines = CLI.ponyLines("Hello")
    expect(lines[0]).toBe("  -------")
    expect(lines[1]).toBe(" < Hello >")
    expect(lines[2]).toBe("  -------")
  })

  it("draws the pony in its hat under the bubble", () => {
    const lines = CLI.ponyLines("Hi")
    expect(lines.some((line) => line.includes("/_|_\\"))).toBe(true)
    expect(lines.at(-1)).toContain("''  ''")
  })

  it("has something to say when told nothing", () => {
    expect(CLI.PONY_SAYINGS.length).toBeGreaterThan(0)
  })
})
