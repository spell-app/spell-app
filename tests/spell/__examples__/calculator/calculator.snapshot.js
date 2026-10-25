import { core, App, h } from "@spell/core"

core.heading("Calculator")
////////////////
// ## Calculator
////////////////
// A pocket calculator:  a number, an operator, another number, and the total as you type.
// What's where, top to bottom:
//   what it keeps:  the two numbers, the operator and the total
//   what its keys do:  clear, a digit, an operator, equals
//   how it draws:  the display, then the keypad
//   start

core.heading("What it keeps")
/** What it keeps */
export class Calculator extends App {
  static elementTag = core.defineElement(this, "test-project", "App")

  // a calculator has an input as text
  static { this.declareProp("input", { type: "text" }) }
  get input() { return this.getProp("input") }
  set input(value) { this.setProp("input", value) }

  // a calculator has an output as text
  static { this.declareProp("output", { type: "text" }) }
  get output() { return this.getProp("output") }
  set output(value) { this.setProp("output", value) }

  // a calculator has a left as text
  static { this.declareProp("left", { type: "text" }) }
  get left() { return this.getProp("left") }
  set left(value) { this.setProp("left", value) }

  // a calculator has a right as text
  static { this.declareProp("right", { type: "text" }) }
  get right() { return this.getProp("right") }
  set right(value) { this.setProp("right", value) }

  // a calculator has a total as a number
  static { this.declareProp("total", { type: "number" }) }
  get total() { return this.getProp("total") }
  set total(value) { this.setProp("total", value) }

  // a calculator has an operator as text
  static { this.declareProp("operator", { type: "text" }) }
  get operator() { return this.getProp("operator") }
  set operator(value) { this.setProp("operator", value) }

  /** What its keys do */
  clear() {
    this.input = ""
    this.output = ""
    this.left = ""
    this.operator = ""
    this.right = ""
    this.total = 0
  }

  updateTheTotalOfCalculator() {
    if (!this.right) this.output = ""
    else {
      const lhs = parseFloat(this.left)
      const rhs = parseFloat(this.right)
      if (this.operator === "+") this.total = lhs + rhs
      else if (this.operator === "–") this.total = lhs - rhs
      else if (this.operator === "×") this.total = lhs * rhs
      else this.total = lhs / rhs
      this.output = `= ${this.total}`
    }
  }

  /** a digit, or the decimal point:  onto the number being typed, the left one until there's an operator */
  appendDigitToCalculator(digit) {
    if (digit === ".") {
      if (!this.input) this.input = "0."
      else if (!this.input.includes(".")) this.input = `${this.input}.`
    } else this.input = this.input + digit
    if (!this.operator) this.left = this.input
    else this.right = this.input
    this.updateTheTotalOfCalculator()
  }

  /** an operator:  after a whole sum, its total carries on as the next sum's left number */
  applyOpToCalculator(op) {
    if (this.right) this.finish()
    this.operator = op
    this.input = ""
  }

  /** equals:  the total becomes the left number, ready for the next operator */
  finish() {
    if (!this.right) return
    this.left = `${this.total}`
    this.operator = ""
    this.right = ""
    this.input = ""
    this.output = ""
  }

  /** How it draws:  the display, then the keypad, four keys a row */
  draw() {
    return h("div", { class: "Calculator" },
      h("ui-segment", { appearance: "raised" },
        h("div", { class: "Display" },
          h("div", { class: "Sum" },
            () => !this.left ? "0" : this.left,
            " ",
            () => this.operator,
            " ",
            () => this.right
          ),
          h("div", { class: "Total" }, () => this.output)
        ),
        h("div", { class: "Keypad" },
          h("ui-button", {
            class: "Wide",
            fluid: true,
            color: "negative",
            onClick: () => this.clear(),
            style: "cursor:pointer;user-select:none"
          }, "C"),
          h("ui-button", {
            fluid: true,
            color: "secondary",
            onClick: () => this.finish(),
            style: "cursor:pointer;user-select:none"
          }, "="),
          h("ui-button", {
            fluid: true,
            color: "primary",
            onClick: () => this.applyOpToCalculator("÷"),
            style: "cursor:pointer;user-select:none"
          }, "÷"),
          h("ui-button", {
            fluid: true,
            onClick: () => this.appendDigitToCalculator("7"),
            style: "cursor:pointer;user-select:none"
          }, "7"),
          h("ui-button", {
            fluid: true,
            onClick: () => this.appendDigitToCalculator("8"),
            style: "cursor:pointer;user-select:none"
          }, "8"),
          h("ui-button", {
            fluid: true,
            onClick: () => this.appendDigitToCalculator("9"),
            style: "cursor:pointer;user-select:none"
          }, "9"),
          h("ui-button", {
            fluid: true,
            color: "primary",
            onClick: () => this.applyOpToCalculator("×"),
            style: "cursor:pointer;user-select:none"
          }, "×"),
          h("ui-button", {
            fluid: true,
            onClick: () => this.appendDigitToCalculator("4"),
            style: "cursor:pointer;user-select:none"
          }, "4"),
          h("ui-button", {
            fluid: true,
            onClick: () => this.appendDigitToCalculator("5"),
            style: "cursor:pointer;user-select:none"
          }, "5"),
          h("ui-button", {
            fluid: true,
            onClick: () => this.appendDigitToCalculator("6"),
            style: "cursor:pointer;user-select:none"
          }, "6"),
          h("ui-button", {
            fluid: true,
            color: "primary",
            onClick: () => this.applyOpToCalculator("–"),
            style: "cursor:pointer;user-select:none"
          }, "–"),
          h("ui-button", {
            fluid: true,
            onClick: () => this.appendDigitToCalculator("1"),
            style: "cursor:pointer;user-select:none"
          }, "1"),
          h("ui-button", {
            fluid: true,
            onClick: () => this.appendDigitToCalculator("2"),
            style: "cursor:pointer;user-select:none"
          }, "2"),
          h("ui-button", {
            fluid: true,
            onClick: () => this.appendDigitToCalculator("3"),
            style: "cursor:pointer;user-select:none"
          }, "3"),
          h("ui-button", {
            fluid: true,
            color: "primary",
            onClick: () => this.applyOpToCalculator("+"),
            style: "cursor:pointer;user-select:none"
          }, "+"),
          h("ui-button", {
            class: "Wide",
            fluid: true,
            onClick: () => this.appendDigitToCalculator("0"),
            style: "cursor:pointer;user-select:none"
          }, "0"),
          h("ui-button", {
            fluid: true,
            onClick: () => this.appendDigitToCalculator("."),
            style: "cursor:pointer;user-select:none"
          }, ".")
        )
      )
    )
  }
}

core.heading("Start")
/** Start */
export const calculator = new Calculator()
calculator.clear()
if (!core.isCarryingOver) calculator.start()
// -----------
core.installStyles(undefined, `/* File styles.css:  how the calculator looks.¬   - A segment holding the display, then the keypad:  four keys a row, C and 0 two keys wide. */¬¬.Calculator {¬  max-width: 20em;¬  margin: 2em auto;¬}¬¬/****************¬ * The display:  the sum on one line, its total under it, both on the right as a calculator's are¬ ****************/¬¬.Display {¬  min-height: 4.5em;¬  margin-bottom: 1em;¬  padding: 0.5em 0.75em;¬  border-radius: 0.3em;¬  background: rgb(0 0 0 / 0.05);¬  text-align: right;¬  font-variant-numeric: tabular-nums;¬}¬¬.Sum {¬  min-height: 1.5em;¬  font-size: 1.6em;¬}¬¬.Total {¬  min-height: 1.25em;¬  opacity: 0.6;¬  font-size: 1.1em;¬}¬¬/****************¬ * The keypad¬ ****************/¬¬.Keypad {¬  display: grid;¬  grid-template-columns: repeat(4, minmax(0, 1fr));¬  gap: 0.5em;¬}¬¬.Keypad > ui-button {¬  --ui-button-margin-inline: 0;¬  font-size: 1.2em;¬}¬¬.Keypad > .Wide {¬  grid-column: span 2;¬}¬`)
