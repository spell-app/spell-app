// TODO:
// - addition doesn't work -- `as a number`
// - check for NaN in total
// - <delete> button
// - blinking cursor in current field
// - keyboard input
// - `output` as getter
// - tape

export class Calculator extends App {}
spellCore.addExport('Calculator', Calculator)
spellCore.defineProperty(Calculator.prototype, { property: 'input' })
spellCore.defineProperty(Calculator.prototype, { property: 'output' })
spellCore.defineProperty(Calculator.prototype, { property: 'left' })
spellCore.defineProperty(Calculator.prototype, { property: 'right' })
spellCore.defineProperty(Calculator.prototype, { property: 'total' })
spellCore.defineProperty(Calculator.prototype, { property: 'operator' })

/* SPELL: added rule: `clear {thisArg:expression}` */
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

/* SPELL: added rule: `update the total of {thisArg:expression}` */
spellCore.define(Calculator.prototype, 'update_the_total_of', {
	value() {
		if (spellCore.isEmpty(this.right)) { this.output = "" }
		else {
			if (this.operator == "+") { this.total = (this.left + this.right) }
			else if (this.operator == "-") { this.total = (this.left - this.right) }
			else if (this.operator == "x") { this.total = (this.left * this.right) }
			else { this.total = (this.left / this.right) }
			this.output = (" = " + this.total)
		}
	}
})

/* SPELL: added rule: `append {callArgs:expression} to {thisArg:expression}` */
spellCore.define(Calculator.prototype, 'append_$digit_to', {
	value(digit) {
		if (digit == ".") {
			if (spellCore.isEmpty(this.input)) { this.input = "0." }
			else if (!spellCore.includes(this.input, ".")) { this.input = (this.input + ".") }
		}
		else if (spellCore.isOfType(digit, 'number')) { this.input = (("" + this.input) + digit) }
		// add to left or right field as appropriate
		if (spellCore.isEmpty(this.operator)) { this.left = this.input }
		else { this.right = this.input }
		this.update_the_total_of()
	}
})

/* SPELL: added rule: `set the operator of {thisArg:expression} to {callArgs:expression}` */
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

/* SPELL: added rule: `draw {thisArg:expression}` */
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
									return this.append_$digit_to("7")
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
									return this.set_the_operator_of_to_$op("+")
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
									return this.set_the_operator_of_to_$op("-")
								}
							},
							children: [
								"-"
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
									return this.set_the_operator_of_to_$op("x")
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
									return this.set_the_operator_of_to_$op("÷")
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
