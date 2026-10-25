import { core, App, h } from "@spell/core"

core.heading("How the Calculator works")
//////////////////////////////
// ## How the Calculator works
//////////////////////////////
// The Calculator example is a pocket calculator:  press 7, +, 5, and it shows 12.
// Every key on it does the same two things:
// - it runs an ACTION, a few lines that change what the calculator keeps
// - and the display, drawn from what it keeps, changes with it
//
// This guide builds a smaller one, an adding machine, on the right:  three number keys, a + key and a C key.
// Open Calculator, in the Examples, to see the whole thing with every key.

core.heading("What it keeps")
///////////////////
// ## What it keeps
///////////////////
/**
 * In Calculator these are written one sentence each, as here:
 * "an adding machine has a total as a number" means every adding machine keeps a number called its total.
 * (A tour of Spell writes them as a list under the thing's name instead.  Both mean the same.)
 */
export class AddingMachine extends App {
  static elementTag = core.defineElement(this, "test-project", "App")

  // an adding machine has a total as a number
  static { this.declareProp("total", { type: "number" }) }
  get total() { return this.getProp("total") }
  set total(value) { this.setProp("total", value) }

  /** the number being typed, as text, so each key can add a digit on the end */
  // an adding machine has an input as text
  static { this.declareProp("input", { type: "text" }) }
  get input() { return this.getProp("input") }
  set input(value) { this.setProp("input", value) }

  //////////////////////
  // ## What its keys do
  //////////////////////
  /**
   * A digit key:  that digit, on the end of the number being typed
   * - "+" joins two pieces of text:  "1" + "2" is "12"
   */
  pressDigitOnAddingMachine(digit) {
    this.input = this.input + digit
  }

  /**
   * The + key:  the number typed, added to the total, then a fresh start for the next one
   * - "as a number" turns the text "12" into the number 12, so it can be added up:
   * it's kept for a moment as "typed", then added to the total
   */
  addTheInputToAddingMachine() {
    if (!this.input) return
    const typed = parseFloat(this.input)
    this.total = this.total + typed
    this.input = ""
  }

  /** The C key:  back to nothing */
  clear() {
    this.total = 0
    this.input = ""
  }

  ///////////////////////////////////////////////
  // ## How it draws:  the display, then the keys
  ///////////////////////////////////////////////
  /**
   * "onClick" says what a key does when it's clicked:  one of the actions above.
   * The display shows the number being typed, or the total when nothing is.
   */
  draw() {
    return h("div", { class: "Adder" },
      h("ui-segment", { appearance: "raised" },
        h("div", { class: "Display" }, () => !this.input ? this.total : this.input),
        h("div", { class: "Keys" },
          h("ui-button", {
            fluid: true,
            onClick: () => this.pressDigitOnAddingMachine("1"),
            style: "cursor:pointer;user-select:none"
          }, "1"),
          h("ui-button", {
            fluid: true,
            onClick: () => this.pressDigitOnAddingMachine("2"),
            style: "cursor:pointer;user-select:none"
          }, "2"),
          h("ui-button", {
            fluid: true,
            onClick: () => this.pressDigitOnAddingMachine("5"),
            style: "cursor:pointer;user-select:none"
          }, "5"),
          h("ui-button", {
            fluid: true,
            color: "primary",
            onClick: () => this.addTheInputToAddingMachine(),
            style: "cursor:pointer;user-select:none"
          }, "+"),
          h("ui-button", {
            fluid: true,
            color: "negative",
            onClick: () => this.clear(),
            style: "cursor:pointer;user-select:none"
          }, "C")
        )
      )
    )
  }
}

core.heading("Start")
/** Start */
export const adder = new AddingMachine()
adder.clear()
if (!core.isCarryingOver) adder.start()

core.heading("A check:  12 and 5 make 17")
/** A check:  12 and 5 make 17 */
export function testAddingUp() {
  return core.test("test adding up", function testAddingUp() {
    core.echoTestAction(`set machine to a new adding machine`)
    const machine = new AddingMachine()
    core.echoTestAction(`clear the machine`)
    machine.clear()
    core.echoTestAction(`press "1" on the machine`)
    machine.pressDigitOnAddingMachine("1")
    core.echoTestAction(`press "2" on the machine`)
    machine.pressDigitOnAddingMachine("2")
    core.echoTestAction(`add the input to the machine`)
    machine.addTheInputToAddingMachine()
    core.echoTestAction(`press "5" on the machine`)
    machine.pressDigitOnAddingMachine("5")
    core.echoTestAction(`add the input to the machine`)
    machine.addTheInputToAddingMachine()
    core.expect(machine.total, `the total of the machine`, 17, `17`)
  })
}

core.heading("Try it")
////////////
// ## Try it
////////////
// - Click 1, 2, +, 5, + on the right:  the display shows 12, then 17.
// - Add a 9 key:  copy the line with "5" in it twice, and change both to "9".
// - Make + into - :  in "to add the input", change the + in "its total + typed" to a -,
//   then change the key's label.  The check above will turn red, because 12 take away 5 isn't 17.
//
// Where next:  the Calculator example, which keeps a left number, an operator and a right number,
// so it can do all four sums.
// -----------
core.installStyles(undefined, `/* File styles.css:  how the adding machine looks -- the display over a row of keys. */¬¬.Adder {¬  max-width: 20em;¬  margin: 2em auto;¬}¬¬.Display {¬  padding: 0.5em;¬  font-size: 2em;¬  text-align: right;¬  font-variant-numeric: tabular-nums;¬}¬¬.Keys {¬  display: grid;¬  grid-template-columns: repeat(5, 1fr);¬  gap: 0.4em;¬}¬`)
// -----------
if (!core.isCarryingOver) testAddingUp()
