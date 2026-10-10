import { spellCore, Thing, List, App, h } from "@spell/core"

// IDEAS FOR EXTENDING THIS
// - check for NaN in total
// - <delete> button
// - blinking cursor in current field
// - keyboard input
// - `output` as getter
// - tape to show past results

export class Calculator extends App {
  static { this.declareProp("input", { type: "text" }) }
  get input() { return this.getProp("input") }
  set input(value) { this.setProp("input", value) }

  static { this.declareProp("output", { type: "text" }) }
  get output() { return this.getProp("output") }
  set output(value) { this.setProp("output", value) }

  static { this.declareProp("left", { type: "text" }) }
  get left() { return this.getProp("left") }
  set left(value) { this.setProp("left", value) }

  static { this.declareProp("right", { type: "text" }) }
  get right() { return this.getProp("right") }
  set right(value) { this.setProp("right", value) }

  static { this.declareProp("total", { type: "number" }) }
  get total() { return this.getProp("total") }
  set total(value) { this.setProp("total", value) }

  static { this.declareProp("operator", { type: "text" }) }
  get operator() { return this.getProp("operator") }
  set operator(value) { this.setProp("operator", value) }

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
      else if (this.operator === "x") this.total = lhs * rhs
      else this.total = lhs / rhs
      this.output = ` = ${this.total}`
    }
  }

  appendDigitToCalculator(digit) {
    // TODO: handle digit = "DELETE"
    if (digit === ".") {
      if (!this.input) this.input = "0."
      else if (!this.input.includes(".")) this.input = `${this.input}.`
    } else if (digit !== "DELETE") this.input = this.input + digit
    // add to left or right field as appropriate
    if (!this.operator) this.left = this.input
    else this.right = this.input
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
    return h("div", { class: "ui container" },
      h("table", { class: "ui table" },
        h("tr",
          h("td", { colspan: "3" },
            h("h2",
              h("span", () => this.left),
              h("span", { id: "operator" }, " ", () => this.operator, " "),
              h("span", { id: "right" }, " ", () => this.right, " "),
              h("span", { id: "output" }, () => this.output)
            )
          ),
          h("td", h("button", { class: "ui button fluid red", onClick: () => this.clear() }, "C"))
        ),
        h("tr",
          h("td",
            h("button", { class: "ui button fluid", onClick: () => this.appendDigitToCalculator("7") }, "7")
          ),
          h("td",
            h("button", { class: "ui button fluid", onClick: () => this.appendDigitToCalculator("8") }, "8")
          ),
          h("td",
            h("button", { class: "ui button fluid", onClick: () => this.appendDigitToCalculator("9") }, "9")
          ),
          h("td", h("button", { class: "ui button fluid orange", onClick: () => (this.operator = "+") }, "+"))
        ),
        h("tr",
          h("td",
            h("button", { class: "ui button fluid", onClick: () => this.appendDigitToCalculator("4") }, "4")
          ),
          h("td",
            h("button", { class: "ui button fluid", onClick: () => this.appendDigitToCalculator("5") }, "5")
          ),
          h("td",
            h("button", { class: "ui button fluid", onClick: () => this.appendDigitToCalculator("6") }, "6")
          ),
          h("td", h("button", { class: "ui button fluid orange", onClick: () => (this.operator = "–") }, "–"))
        ),
        h("tr",
          h("td",
            h("button", { class: "ui button fluid", onClick: () => this.appendDigitToCalculator("1") }, "1")
          ),
          h("td",
            h("button", { class: "ui button fluid", onClick: () => this.appendDigitToCalculator("2") }, "2")
          ),
          h("td",
            h("button", { class: "ui button fluid", onClick: () => this.appendDigitToCalculator("3") }, "3")
          ),
          h("td", h("button", { class: "ui button fluid orange", onClick: () => (this.operator = "x") }, "x"))
        ),
        h("tr",
          h("td",
            h("button", { class: "ui button fluid", onClick: () => this.appendDigitToCalculator("0") }, "0")
          ),
          h("td",
            h("button", { class: "ui button fluid", onClick: () => this.appendDigitToCalculator(".") }, ".")
          ),
          h("td",
            h("button", { class: "ui button fluid", hidden: true, onClick: () => this.appendDigitToCalculator("DELETE") },
              "DEL"
            )
          ),
          h("td", h("button", { class: "ui button fluid orange", onClick: () => (this.operator = "÷") }, "÷"))
        )
      )
    )
  }
}

export const calculator = new Calculator()
calculator.clear()
calculator.start()