import { spellCore, Thing, List, App } from "@spell/core"

// IDEAS FOR EXTENDING THIS
// - check for NaN in total
// - <delete> button
// - blinking cursor in current field
// - keyboard input
// - `output` as getter
// - tape to show past results

export class Calculator extends App {
  static { this.declareProp('input', { type: 'text' }) }
  get input() { return this.getProp('input') }
  set input(value) { this.setProp('input', value) }

  static { this.declareProp('output', { type: 'text' }) }
  get output() { return this.getProp('output') }
  set output(value) { this.setProp('output', value) }

  static { this.declareProp('left', { type: 'text' }) }
  get left() { return this.getProp('left') }
  set left(value) { this.setProp('left', value) }

  static { this.declareProp('right', { type: 'text' }) }
  get right() { return this.getProp('right') }
  set right(value) { this.setProp('right', value) }

  static { this.declareProp('total', { type: 'number' }) }
  get total() { return this.getProp('total') }
  set total(value) { this.setProp('total', value) }

  static { this.declareProp('operator', { type: 'text' }) }
  get operator() { return this.getProp('operator') }
  set operator(value) { this.setProp('operator', value) }

  clear() {
    this.input = ""
    this.output = ""
    this.left = ""
    this.operator = ""
    this.right = ""
    this.total = 0
  }

  updateTheTotalOfCalculator() {
    if (!this.right) { this.output = "" }
    else {
      let lhs = parseFloat(this.left)
      let rhs = parseFloat(this.right)
      if (this.operator === "+") { this.total = (lhs + rhs) }
      else if (this.operator === "–") { this.total = (lhs - rhs) }
      else if (this.operator === "x") { this.total = (lhs * rhs) }
      else { this.total = (lhs / rhs) }
      this.output = ` = ${this.total}`
    }
  }

  appendDigitToCalculator(digit) {
    // TODO: handle digit = "DELETE"
    if (digit === ".") {
      if (!this.input) { this.input = "0." }
      else if (!this.input.includes(".")) { this.input = `${this.input}.` }
    }
    else if (digit !== "DELETE") { this.input = (this.input + digit) }
    // add to left or right field as appropriate
    if (!this.operator) { this.left = this.input }
    else { this.right = this.input }
    this.updateTheTotalOfCalculator()
  }

  setTheOperatorOfCalculatorToOp(op) {
    this.operator = op
    this.input = ""
    if (this.right) {
      // move total to right
      this.left = `${this.total}`
      this.right = ""
      this.total = 0
      this.output = ""
    }
  }

  draw() {
    return spellCore.element({ tag: "div", props: { className: "ui container" }, children: [
      spellCore.element({ tag: "table", props: { className: "ui table" }, children: [
        spellCore.element({ tag: "tr", children: [
          spellCore.element({ tag: "td", props: { colSpan: "3" }, children: [
            spellCore.element({ tag: "h2", children: [
              spellCore.element({ tag: "span", children: [
                () => this.left
              ] }),
              spellCore.element({ tag: "span", props: { id: "operator" }, children: [
                " ",
                () => this.operator,
                " "
              ] }),
              spellCore.element({ tag: "span", props: { id: "right" }, children: [
                " ",
                () => this.right,
                " "
              ] }),
              spellCore.element({ tag: "span", props: { id: "output" }, children: [
                () => this.output
              ] })
            ] })
          ] }),
          spellCore.element({ tag: "td", children: [
            spellCore.element({
              tag: "button",
              props: {
                className: "ui button fluid red",
                onClick: (event) => {
                  return this.clear()
                }
              },
              children: [
                "C"
              ]
            })
          ] })
        ] }),
        spellCore.element({ tag: "tr", children: [
          spellCore.element({ tag: "td", children: [
            spellCore.element({
              tag: "button",
              props: {
                className: "ui button fluid",
                onClick: (event) => {
                  return this.appendDigitToCalculator("7")
                }
              },
              children: [
                "7"
              ]
            })
          ] }),
          spellCore.element({ tag: "td", children: [
            spellCore.element({
              tag: "button",
              props: {
                className: "ui button fluid",
                onClick: (event) => {
                  return this.appendDigitToCalculator("8")
                }
              },
              children: [
                "8"
              ]
            })
          ] }),
          spellCore.element({ tag: "td", children: [
            spellCore.element({
              tag: "button",
              props: {
                className: "ui button fluid",
                onClick: (event) => {
                  return this.appendDigitToCalculator("9")
                }
              },
              children: [
                "9"
              ]
            })
          ] }),
          spellCore.element({ tag: "td", children: [
            spellCore.element({
              tag: "button",
              props: {
                className: "ui button fluid orange",
                onClick: (event) => {
                  this.operator = "+"
                }
              },
              children: [
                "+"
              ]
            })
          ] })
        ] }),
        spellCore.element({ tag: "tr", children: [
          spellCore.element({ tag: "td", children: [
            spellCore.element({
              tag: "button",
              props: {
                className: "ui button fluid",
                onClick: (event) => {
                  return this.appendDigitToCalculator("4")
                }
              },
              children: [
                "4"
              ]
            })
          ] }),
          spellCore.element({ tag: "td", children: [
            spellCore.element({
              tag: "button",
              props: {
                className: "ui button fluid",
                onClick: (event) => {
                  return this.appendDigitToCalculator("5")
                }
              },
              children: [
                "5"
              ]
            })
          ] }),
          spellCore.element({ tag: "td", children: [
            spellCore.element({
              tag: "button",
              props: {
                className: "ui button fluid",
                onClick: (event) => {
                  return this.appendDigitToCalculator("6")
                }
              },
              children: [
                "6"
              ]
            })
          ] }),
          spellCore.element({ tag: "td", children: [
            spellCore.element({
              tag: "button",
              props: {
                className: "ui button fluid orange",
                onClick: (event) => {
                  this.operator = "–"
                }
              },
              children: [
                "–"
              ]
            })
          ] })
        ] }),
        spellCore.element({ tag: "tr", children: [
          spellCore.element({ tag: "td", children: [
            spellCore.element({
              tag: "button",
              props: {
                className: "ui button fluid",
                onClick: (event) => {
                  return this.appendDigitToCalculator("1")
                }
              },
              children: [
                "1"
              ]
            })
          ] }),
          spellCore.element({ tag: "td", children: [
            spellCore.element({
              tag: "button",
              props: {
                className: "ui button fluid",
                onClick: (event) => {
                  return this.appendDigitToCalculator("2")
                }
              },
              children: [
                "2"
              ]
            })
          ] }),
          spellCore.element({ tag: "td", children: [
            spellCore.element({
              tag: "button",
              props: {
                className: "ui button fluid",
                onClick: (event) => {
                  return this.appendDigitToCalculator("3")
                }
              },
              children: [
                "3"
              ]
            })
          ] }),
          spellCore.element({ tag: "td", children: [
            spellCore.element({
              tag: "button",
              props: {
                className: "ui button fluid orange",
                onClick: (event) => {
                  this.operator = "x"
                }
              },
              children: [
                "x"
              ]
            })
          ] })
        ] }),
        spellCore.element({ tag: "tr", children: [
          spellCore.element({ tag: "td", children: [
            spellCore.element({
              tag: "button",
              props: {
                className: "ui button fluid",
                onClick: (event) => {
                  return this.appendDigitToCalculator("0")
                }
              },
              children: [
                "0"
              ]
            })
          ] }),
          spellCore.element({ tag: "td", children: [
            spellCore.element({
              tag: "button",
              props: {
                className: "ui button fluid",
                onClick: (event) => {
                  return this.appendDigitToCalculator(".")
                }
              },
              children: [
                "."
              ]
            })
          ] }),
          spellCore.element({ tag: "td", children: [
            spellCore.element({
              tag: "button",
              props: {
                hidden: true,
                className: "ui button fluid",
                onClick: (event) => {
                  return this.appendDigitToCalculator("DELETE")
                }
              },
              children: [
                "DEL"
              ]
            })
          ] }),
          spellCore.element({ tag: "td", children: [
            spellCore.element({
              tag: "button",
              props: {
                className: "ui button fluid orange",
                onClick: (event) => {
                  this.operator = "÷"
                }
              },
              children: [
                "÷"
              ]
            })
          ] })
        ] })
      ] })
    ] })
  }
}

export let calculator = new Calculator()
calculator.clear()
calculator.start()