import { core, App, prop, drawn } from "@spell/core"
import { E, SpellElement } from "@spell/elements"

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
  @prop({ type: "text" })
  accessor input!: string

  // a calculator has an output as text
  @prop({ type: "text" })
  accessor output!: string

  // a calculator has a left as text
  @prop({ type: "text" })
  accessor left!: string

  // a calculator has a right as text
  @prop({ type: "text" })
  accessor right!: string

  // a calculator has a total as a number
  @prop({ type: "number" })
  accessor total!: number

  // a calculator has an operator as text
  @prop({ type: "text" })
  accessor operator!: string

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
  appendDigitToCalculator(digit: string) {
    if (digit === ".") {
      if (!this.input) this.input = "0."
      else if (!this.input.includes(".")) this.input = `${this.input}.`
    } else this.input = this.input + digit
    if (!this.operator) this.left = this.input
    else this.right = this.input
    this.updateTheTotalOfCalculator()
  }

  /** an operator:  after a whole sum, its total carries on as the next sum's left number */
  applyOpToCalculator(op: string) {
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
  @drawn draw() {
    return (
      <div class="Calculator">
        <ui-segment raised={true}>
          <div class="Display">
            <div class="Sum">{!this.left ? "0" : this.left}{" "}{this.operator}{" "}{this.right}</div>
            <div class="Total">{this.output}</div>
          </div>
          <div class="Keypad">
            <ui-button class="Wide" fluid={true} negative={true} onClick={() => this.clear()} style="cursor:pointer;user-select:none">
              C
            </ui-button>
            <ui-button fluid={true} secondary={true} onClick={() => this.finish()} style="cursor:pointer;user-select:none">
              =
            </ui-button>
            <ui-button fluid={true} primary={true} onClick={() => this.applyOpToCalculator("÷")} style="cursor:pointer;user-select:none">
              ÷
            </ui-button>
            <ui-button fluid={true} onClick={() => this.appendDigitToCalculator("7")} style="cursor:pointer;user-select:none">
              7
            </ui-button>
            <ui-button fluid={true} onClick={() => this.appendDigitToCalculator("8")} style="cursor:pointer;user-select:none">
              8
            </ui-button>
            <ui-button fluid={true} onClick={() => this.appendDigitToCalculator("9")} style="cursor:pointer;user-select:none">
              9
            </ui-button>
            <ui-button fluid={true} primary={true} onClick={() => this.applyOpToCalculator("×")} style="cursor:pointer;user-select:none">
              ×
            </ui-button>
            <ui-button fluid={true} onClick={() => this.appendDigitToCalculator("4")} style="cursor:pointer;user-select:none">
              4
            </ui-button>
            <ui-button fluid={true} onClick={() => this.appendDigitToCalculator("5")} style="cursor:pointer;user-select:none">
              5
            </ui-button>
            <ui-button fluid={true} onClick={() => this.appendDigitToCalculator("6")} style="cursor:pointer;user-select:none">
              6
            </ui-button>
            <ui-button fluid={true} primary={true} onClick={() => this.applyOpToCalculator("–")} style="cursor:pointer;user-select:none">
              –
            </ui-button>
            <ui-button fluid={true} onClick={() => this.appendDigitToCalculator("1")} style="cursor:pointer;user-select:none">
              1
            </ui-button>
            <ui-button fluid={true} onClick={() => this.appendDigitToCalculator("2")} style="cursor:pointer;user-select:none">
              2
            </ui-button>
            <ui-button fluid={true} onClick={() => this.appendDigitToCalculator("3")} style="cursor:pointer;user-select:none">
              3
            </ui-button>
            <ui-button fluid={true} primary={true} onClick={() => this.applyOpToCalculator("+")} style="cursor:pointer;user-select:none">
              +
            </ui-button>
            <ui-button class="Wide" fluid={true} onClick={() => this.appendDigitToCalculator("0")} style="cursor:pointer;user-select:none">
              0
            </ui-button>
            <ui-button fluid={true} onClick={() => this.appendDigitToCalculator(".")} style="cursor:pointer;user-select:none">
              .
            </ui-button>
          </div>
        </ui-segment>
      </div>
    )
  }
}

/**
 * `<test-project-app>`:  a calculator, drawn in its own element, e.g. by `draw the calculator`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its calculator's properties;  its methods call its calculator's.
 * - What every view's element does, e.g. drawing its calculator, is `SpellElement`'s.
 */
export class CalculatorElement extends SpellElement<Calculator> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-app", "calculator", [
    { name: "input", kind: "string", description: "Its input." },
    { name: "output", kind: "string", description: "Its output." },
    { name: "left", kind: "string", description: "Its left." },
    { name: "right", kind: "string", description: "Its right." },
    { name: "total", kind: "number", description: "Its total." },
    { name: "operator", kind: "string", description: "Its operator." }
  ])

  clear() {
    return this.currentThing?.clear()
  }

  updateTheTotalOfCalculator() {
    return this.currentThing?.updateTheTotalOfCalculator()
  }

  appendDigitToCalculator(digit: string) {
    return this.currentThing?.appendDigitToCalculator(digit)
  }

  applyOpToCalculator(op: string) {
    return this.currentThing?.applyOpToCalculator(op)
  }

  finish() {
    return this.currentThing?.finish()
  }
}
core.useElement(Calculator, CalculatorElement)

core.heading("Start")
/** Start */
export const calculator = new Calculator()
calculator.clear()
if (!core.isCarryingOver) calculator.start()
// -----------
core.installStyles(undefined, `/* File styles.css:  how the calculator looks.¬   - A segment holding the display, then the keypad:  four keys a row, C and 0 two keys wide. */¬¬.Calculator {¬  max-width: 20em;¬  margin: 2em auto;¬}¬¬/****************¬ * The display:  the sum on one line, its total under it, both on the right as a calculator's are¬ ****************/¬¬.Display {¬  min-height: 4.5em;¬  margin-bottom: 1em;¬  padding: 0.5em 0.75em;¬  border-radius: 0.3em;¬  background: rgb(0 0 0 / 0.05);¬  text-align: right;¬  font-variant-numeric: tabular-nums;¬}¬¬.Sum {¬  min-height: 1.5em;¬  font-size: 1.6em;¬}¬¬.Total {¬  min-height: 1.25em;¬  opacity: 0.6;¬  font-size: 1.1em;¬}¬¬/****************¬ * The keypad¬ ****************/¬¬.Keypad {¬  display: grid;¬  grid-template-columns: repeat(4, minmax(0, 1fr));¬  gap: 0.5em;¬}¬¬.Keypad > ui-button {¬  --ui-button-margin-inline: 0;¬  font-size: 1.2em;¬}¬¬.Keypad > .Wide {¬  grid-column: span 2;¬}¬`)

// each view type's tag, for the JSX
declare module "@solidjs/web/types/jsx.js" {
  namespace JSX {
    interface IntrinsicElements {
      /** `CalculatorElement` */
      "test-project-app": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
    }
  }
}
