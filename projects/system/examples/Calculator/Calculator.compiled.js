/*! SPELL: PROJECT { spellVersion: "0.8.0", provides: ["Calculator"] } */
import { spellCore, Thing, List, App } from "@spell/core"

// IDEAS FOR EXTENDING THIS
// - check for NaN in total
// - <delete> button
// - blinking cursor in current field
// - keyboard input
// - `output` as getter
// - tape to show past results

/*! SPELL: DECLARES {
  type: "Calculator", superType: "App",
  line: 9, defined: "/Calculator.spell:191-213",
} */
export class Calculator extends App {}
/*! SPELL: DECLARES {
  property: "input", of: "Calculator",
  line: 10, defined: "/Calculator.spell:214-239",
} */
spellCore.defineProperty(Calculator.prototype, { property: 'input' })
/*! SPELL: DECLARES {
  property: "output", of: "Calculator",
  line: 11, defined: "/Calculator.spell:240-266",
} */
spellCore.defineProperty(Calculator.prototype, { property: 'output' })
/*! SPELL: DECLARES {
  property: "left", of: "Calculator",
  line: 12, defined: "/Calculator.spell:267-290",
} */
spellCore.defineProperty(Calculator.prototype, { property: 'left' })
/*! SPELL: DECLARES {
  property: "right", of: "Calculator",
  line: 13, defined: "/Calculator.spell:291-315",
} */
spellCore.defineProperty(Calculator.prototype, { property: 'right' })
/*! SPELL: DECLARES {
  property: "total", of: "Calculator",
  line: 14, defined: "/Calculator.spell:316-340",
} */
spellCore.defineProperty(Calculator.prototype, { property: 'total' })
/*! SPELL: DECLARES {
  property: "operator", of: "Calculator",
  line: 15, defined: "/Calculator.spell:341-369",
} */
spellCore.defineProperty(Calculator.prototype, { property: 'operator' })

/*! SPELL: DECLARES {
  syntax: "clear {thisArg:expression}", output: "clear", rule: "method_call", of: "Calculator",
  alias: ["statement", "expression"], kind: "method", name: "clear (a calculator)",
  line: [17, 23], defined: "/Calculator.spell:371-524",
} */
spellCore.define(Calculator.prototype, 'clear', {
	value() {
		this.input = ""
		this.output = ""
		this.left = ""
		this.operator = ""
		this.right = ""
		this.total = ""
	}
})

/*! SPELL: DECLARES {
  syntax: "update the total of {thisArg:expression}", output: "update_the_total_of",
  rule: "method_call", of: "Calculator", alias: ["statement", "expression"], kind: "method",
  name: "update the total of (a calculator)",
  line: [25, 39], defined: "/Calculator.spell:526-955",
} */
spellCore.define(Calculator.prototype, 'update_the_total_of', {
	value() {
		if (spellCore.isEmpty(this.right)) { this.output = "" }
		else {
			let lhs = parseFloat(this.left)
			let rhs = parseFloat(this.right)
			if (this.operator == "+") { this.total = (lhs + rhs) }
			else if (this.operator == "–") { this.total = (lhs - rhs) }
			else if (this.operator == "x") { this.total = (lhs * rhs) }
			else { this.total = (lhs / rhs) }
			this.output = (" = " + this.total)
		}
	}
})

/*! SPELL: DECLARES {
  syntax: "append {callArgs:expression} to {thisArg:expression}", output: "append_$digit_to",
  rule: "method_call", of: "Calculator", alias: ["statement", "expression"], kind: "method",
  name: "append (digit) to (a calculator)",
  line: [41, 55], defined: "/Calculator.spell:957-1457",
} */
spellCore.define(Calculator.prototype, 'append_$digit_to', {
	value(digit) {
		// TODO: handle digit = "DELETE"
		if (digit == ".") {
			if (spellCore.isEmpty(this.input)) { this.input = "0." }
			else if (!spellCore.includes(this.input, ".")) { this.input = (this.input + ".") }
		}
		else if (spellCore.isOfType(digit, 'number')) { this.input = (("" + this.input) + digit) }
		// add to left or right field as appropriate
		if (spellCore.isEmpty(this.operator)) { this.left = parseFloat(this.input) }
		else { this.right = parseFloat(this.input) }
		this.update_the_total_of()
	}
})

/*! SPELL: DECLARES {
  syntax: "set the operator of {thisArg:expression} to {callArgs:expression}",
  output: "set_the_operator_of_to_$op", rule: "method_call", of: "Calculator",
  alias: ["statement", "expression"], kind: "method",
  name: "set the operator of (a calculator) to (op)",
  line: [57, 65], defined: "/Calculator.spell:1459-1701",
} */
spellCore.define(Calculator.prototype, 'set_the_operator_of_to_$op', {
	value(op) {
		this.operator = op
		this.input = ""
		if (!spellCore.isEmpty(this.right)) {
			// move total to right
			this.left = this.total
			this.right = ""
			this.total = ""
			this.output = ""
		}
	}
})

/*! SPELL: DECLARES {
  syntax: "draw {thisArg:expression}", output: "draw", rule: "method_call", of: "Calculator",
  alias: ["statement", "expression"], kind: "method", name: "draw (a calculator)",
  line: [67, 106], defined: "/Calculator.spell:1703-3629",
} */
spellCore.define(Calculator.prototype, 'draw', {
	value() {
		return spellCore.element({ tag: "div", props: { className: "ui container" }, children: [
			spellCore.element({ tag: "table", props: { className: "ui table" }, children: [
				spellCore.element({ tag: "tr", children: [
					spellCore.element({ tag: "td", props: { colSpan: "3" }, children: [
						spellCore.element({ tag: "h2", children: [
							spellCore.element({ tag: "span", children: [
								this.left
							] }),
							spellCore.element({ tag: "span", props: { id: "operator" }, children: [
								" ",
								this.operator,
								" "
							] }),
							spellCore.element({ tag: "span", props: { id: "right" }, children: [
								" ",
								this.right,
								" "
							] }),
							spellCore.element({ tag: "span", props: { id: "output" }, children: [
								this.output
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
									return this.append_$digit_to(7)
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
									return this.append_$digit_to(8)
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
									return this.append_$digit_to(9)
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
									return this.append_$digit_to(4)
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
									return this.append_$digit_to(5)
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
									return this.append_$digit_to(6)
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
									return this.append_$digit_to(1)
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
									return this.append_$digit_to(2)
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
									return this.append_$digit_to(3)
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
									return this.append_$digit_to(0)
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
									return this.append_$digit_to(".")
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
									return this.append_$digit_to("DELETE")
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
})

export let calculator = new Calculator()
calculator.clear()
calculator.start()
