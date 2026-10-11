import { describe, test, expect, afterEach, vi } from "vite-plus/test"

import { List, Thing } from "$/core"
import { isPlainValue, SpellConsole } from "./console"

afterEach(() => {
  vi.restoreAllMocks()
})

describe("isPlainValue():  what a program prints as data, rather than a dump", () => {
  test("text, numbers, yes / no, nothing, plain lists and objects are plain", () => {
    for (const value of ["ace", 3, 2.5, true, null, undefined, [1, "two"], [new Thing()], { rank: "ace" }]) {
      expect(isPlainValue(value), typeof value).toBe(true)
    }
  })
  test("a thing, a spell list, a map and a function are dumps", () => {
    for (const value of [new Thing(), new List(), new Map(), () => {}]) {
      expect(isPlainValue(value), typeof value).toBe(false)
    }
  })
})

describe("SpellConsole:  a dump goes through printDump(), plain data to the native console", () => {
  test("log() and info()", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const info = vi.spyOn(console, "info").mockImplementation(() => {})
    const spellConsole = new SpellConsole()
    const dumps: unknown[][] = []
    spellConsole.printDump = (...message) => dumps.push(message)
    const card = new Thing()

    spellConsole.log("cards:", 3, [1, 2])
    spellConsole.log(card)
    spellConsole.info("the card is", card)

    expect(log.mock.calls).toEqual([["cards:", 3, [1, 2]]])
    expect(info).not.toHaveBeenCalled()
    expect(dumps).toEqual([[card], ["the card is", card]])
    // every line is kept for a page to show, dump or not
    expect(spellConsole.lines.map((line) => line.message)).toEqual([
      ["cards:", 3, [1, 2]],
      [card],
      ["the card is", card]
    ])
  })
  test("a group's heading", () => {
    const group = vi.spyOn(console, "group").mockImplementation(() => {})
    const spellConsole = new SpellConsole()
    const dumps: unknown[][] = []
    spellConsole.printDump = (...message) => dumps.push(message)
    const card = new Thing()

    spellConsole.group("hand")
    spellConsole.group(card)

    expect(group.mock.calls).toEqual([["hand"], []])
    expect(dumps).toEqual([[card]])
  })
  test("by default, printDump() is the native console.log(), as a page shows it", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const card = new Thing()
    new SpellConsole().log(card)
    expect(log).toHaveBeenCalledWith(card)
  })
})
