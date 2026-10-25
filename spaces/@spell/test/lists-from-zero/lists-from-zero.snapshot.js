import { core, Thing, List } from "@spell/core"

core.heading("Counting from 0:  this project's lists start at 0 (its project file)")
//////////////////////////////////////////////////////////////////////////
// ## Counting from 0:  this project's lists start at 0 (its project file)
//////////////////////////////////////////////////////////////////////////
/** Numbers count from 0;  ordinal words don't change.  Its rack is its own:  five tiles, A first. */
export class Tile extends Thing {
  // - its "letter" is text
  static { this.declareProp("letter", { type: "text" }) }
  get letter() { return this.getProp("letter") }
  set letter(value) { this.setProp("letter", value) }
}

export class Rack extends List {
  static instanceType = Tile

  /** a new rack holds five tiles, A to E */
  create() {
    this.append(new Tile({ letter: "A" }))
    this.append(new Tile({ letter: "B" }))
    this.append(new Tile({ letter: "C" }))
    this.append(new Tile({ letter: "D" }))
    this.append(new Tile({ letter: "E" }))
  }
}

core.heading("Tests")
/** Tests */
export function testCountingFromZero() {
  return core.test("test counting from zero", function testCountingFromZero() {
    core.echoTestAction(`the rack is a new rack`)
    const rack = new Rack()
    core.expect(rack.firstItem?.letter, `the letter of tile 0 of the rack`, "A", `"A"`)
    core.expect(rack.getItem(1)?.letter, `the letter of tile 1 of the rack`, "B", `"B"`)
    core.expect(rack.lastItem?.letter, `the letter of tile -1 of the rack`, "E", `"E"`)
    core.expect(rack.firstItem?.letter, `the letter of the first tile of the rack`, "A", `"A"`)
    core.expect(rack.getItem(1)?.letter, `the letter of the second tile of the rack`, "B", `"B"`)
    core.expect(rack.lastItem?.letter, `the letter of the last tile of the rack`, "E", `"E"`)
    core.echoTestAction(`set the start to the first tile of the rack`)
    const start = rack.firstItem
    core.expect(rack.positionOf(start), `the position of the start in the rack`, 0, `0`)
    core.echoTestAction(`set the front to tiles 0 to 2 of the rack`)
    const front = rack.slice(0, 3)
    core.expect(front.length, `the number of tiles in the front`, 3, `3`)
    core.expect(front.lastItem?.letter, `the letter of the last tile of the front`, "C", `"C"`)
    core.echoTestAction(`set the back to last two tiles of the rack`)
    const back = core.rangeStartingAt(rack, -2, 2)
    core.expect(back.length, `the number of tiles in the back`, 2, `2`)
    core.expect(back.firstItem?.letter, `the letter of the first tile of the back`, "D", `"D"`)
    core.echoTestAction(`set the positions to a new list of numbers`)
    const positions = new List({ instanceType: "number" })
    core.echoTestAction(`for each tile, position in the front`)
    front.forEach((tile, position_) => positions.append(position_))
    core.echo(`positions: ${positions}`)
    core.echoTestAction(`remove tile 0 of the rack`)
    core.removeItemAt(rack, 0)
    core.expect(rack.firstItem?.letter, `the letter of the first tile of the rack`, "B", `"B"`)
  })
}
// -----------
if (!core.isCarryingOver) testCountingFromZero()
