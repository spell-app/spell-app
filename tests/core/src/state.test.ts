import { readFileSync } from "fs"
import { resolve } from "path"
import { describe, test, expect } from "vite-plus/test"

import { spellCore, StateMirror, StateWriter, Thing, List } from "$/core"

/**
 * A program's state as JSON by id (`state.ts`):  written by a `StateWriter`, read into a `StateMirror`.
 * - `stateById.expected.json5`, beside `src/`, holds the state these tests write.
 *   Python's core writes the same things and reads the same file, so the two agree
 *   (`tests/py/core/tests/test_state.py`).
 * - The classes are what spell compiles from:
 *   - `a chip is a thing` + `a chip has a color as text` + `a chip has a value as a number`
 *   - `a stack is a list of chips` + `a stack has a name as text` + `a chip belongs to one stack`
 *   - `a table is a thing` + `a table has stacks as a list of stacks` + `a table has a top as a chip`
 */
const EXPECTED = JSON.parse(readFileSync(resolve(import.meta.dirname, "..", "stateById.expected.json5"), "utf8")) as {
  first: unknown
  moved: unknown
  patch: unknown
}

////////////////
// ## Classes under test
////////////////

class Chip extends Thing {
  get color() {
    return this.getProp("color")
  }
  set color(value) {
    this.setProp("color", value)
  }
  get value() {
    return this.getProp("value")
  }
  set value(value) {
    this.setProp("value", value)
  }
  /** `the stack of a chip`, from `a chip belongs to one stack`. */
  get stack(): Stack | undefined {
    return Stack.ownerOf(this)
  }
}

class Stack extends List<Chip> {
  static instanceType = Chip
  static exclusive = true
  get name() {
    return this.getProp("name")
  }
  set name(value) {
    this.setProp("name", value)
  }
}

class Table extends Thing {
  get stacks(): Stack[] {
    return this.getProp("stacks") as Stack[]
  }
  set stacks(value) {
    this.setProp("stacks", value)
  }
  get top(): Chip {
    return this.getProp("top") as Chip
  }
  set top(value) {
    this.setProp("top", value)
  }
}

/** A table of two stacks, its top the first chip of the first:  `EXPECTED.first`, written. */
function aTable(): Table {
  const red = new Chip({ color: "red", value: 5 })
  const blue = new Chip({ color: "blue", value: 10 })
  const left = new Stack({ name: "left" }).append(red, blue)
  return new Table({ stacks: [left, new Stack({ name: "right" })], top: red })
}

////////////////
// ## Tests
////////////////

describe("a StateWriter:  each thing whole once, then by its id", () => {
  test("writes what Python's core writes", () => {
    expect(new StateWriter().stateOf(aTable())).toEqual(EXPECTED.first)
  })

  test("keeps each thing's id", () => {
    const writer = new StateWriter()
    const table = aTable()
    writer.stateOf(table)
    const red = table.top
    spellCore.move(red, table.stacks[1]!)
    expect(writer.stateOf(table)).toEqual(EXPECTED.moved)
    expect(writer.idOf(red)).toBe("3")
  })
})

describe("a StateMirror:  reads states into what it read before", () => {
  test("reads a thing mentioned twice as one", () => {
    const table = new StateMirror().read(EXPECTED.first) as Table
    expect(table).toBeInstanceOf(Table)
    expect(table.top).toBe(table.stacks[0]!.items[0])
    expect(table.top.stack).toBe(table.stacks[0])
    expect(table.stacks[0]!.items.map((chip) => chip.color)).toEqual(["red", "blue"])
  })

  test("changes what it holds in place", () => {
    const mirror = new StateMirror()
    const table = mirror.read(EXPECTED.first) as Table
    const [left, right] = table.stacks
    const red = table.top
    const again = mirror.read(EXPECTED.moved) as Table
    expect(again).toBe(table)
    expect(again.stacks[0]).toBe(left)
    expect(again.stacks[1]).toBe(right)
    expect(right!.items).toEqual([red])
    expect(red.stack).toBe(right)
    expect(mirror.thingWithId("3")).toBe(red)
  })

  test("reads Python's patch:  only what changed, the same as the whole state", () => {
    const mirror = new StateMirror()
    const table = mirror.read(EXPECTED.first) as Table
    mirror.read(EXPECTED.patch)
    const moved = aTable()
    spellCore.move(moved.top, moved.stacks[1]!)
    expect(new StateWriter().stateOf(table)).toEqual(new StateWriter().stateOf(moved))
  })

  test("unsets what a thing no longer has", () => {
    const mirror = new StateMirror()
    const chip = mirror.read({ $type: "Chip", $id: "1", color: "red", value: 5 }) as Chip
    mirror.read({ $type: "Chip", $id: "1", color: "red" })
    expect(chip.value).toBeUndefined()
    expect(chip.toJSON()).toEqual({ $type: "Chip", color: "red" })
  })
})

describe("spellCore.fromJSON()", () => {
  test("reads ids too", () => {
    const table = spellCore.fromJSON(JSON.stringify(EXPECTED.first)) as Table
    expect(table.top).toBe(table.stacks[0]!.items[0])
  })

  test("without ids, makes a thing each time", () => {
    const [first, second] = spellCore.fromJSON([
      { $type: "Chip", color: "red" },
      { $type: "Chip", color: "red" }
    ]) as Chip[]
    expect(first).not.toBe(second)
  })
})
