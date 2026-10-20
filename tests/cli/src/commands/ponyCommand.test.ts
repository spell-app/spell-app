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

describe("gallopFrames()", () => {
  it("one stride:  legs reaching, passing, tucked, passing;  only the legs move", () => {
    const frames = CLI.gallopFrames("Hi")
    expect(frames.map((frame) => frame.at(-2))).toEqual([
      "            //  //     \\\\  \\\\",
      "            ||  ||     ||  ||",
      "            \\\\  \\\\     //  //",
      "            ||  ||     ||  ||"
    ])
    const standing = CLI.ponyLines("Hi")
    for (const frame of frames) {
      expect(frame).toHaveLength(standing.length)
      expect(frame.slice(0, -2)).toEqual(standing.slice(0, -2))
    }
  })

  it("each leg's top stays under the body's bottom line", () => {
    const top = (line: string) => [...line].flatMap((char, column) => (char.trim() ? [column] : []))
    for (const frame of CLI.gallopFrames("Hi")) expect(top(frame.at(-2)!)).toEqual([12, 13, 16, 17, 23, 24, 27, 28])
  })
})
