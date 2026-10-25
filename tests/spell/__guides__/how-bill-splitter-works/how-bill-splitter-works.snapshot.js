import { core, App, h } from "@spell/core"

core.heading("How the Bill Splitter works")
/////////////////////////////////
// ## How the Bill Splitter works
/////////////////////////////////
// The Bill Splitter example works out who owes what after a meal:
// each person pays for what they ordered, plus their share of the tip.
// Change any amount, and every sum on the page follows at once.  Two ideas make that happen:
// - the sums are RULES:  worked out from the amounts, never typed in, so they can't fall behind
// - the boxes you type in are a FORM bound to the bill:  typing in one changes the bill itself
//
// This guide splits a bill evenly instead, so the whole thing fits on one screen.
// Open Bill Splitter, in the Examples, for one line per person.

core.heading("Money:  a number written as dollars and cents, e.g. 12.5 => \"$12.50\"")
//////////////////////////////////////////////////////////////////////////
// ## Money:  a number written as dollars and cents, e.g. 12.5 => "$12.50"
//////////////////////////////////////////////////////////////////////////
/**
 * The same lines as the example's.  "round" drops anything smaller than a cent;
 * the last two lines add a 0 when the cents are under ten, so 3.07 doesn't show as $3.7.
 */
export function writeAmountAsMoney(amount) {
  const cents = Math.round(amount * 100)
  const dollars = parseInt(cents / 100)
  const leftOver = cents - dollars * 100
  if (leftOver < 10) return `$${dollars}.0${leftOver}`
  return `$${dollars}.${leftOver}`
}

core.heading("The bill")
/** The bill */
export class Bill extends App {
  static elementTag = core.defineElement(this, "test-project", "App")

  /** what the three boxes hold */
  // - its "amount" is a number
  static { this.declareProp("amount", { type: "number" }) }
  get amount() { return this.getProp("amount") }
  set amount(value) { this.setProp("amount", value) }

  // - its "percent" is a number
  static { this.declareProp("percent", { type: "number" }) }
  get percent() { return this.getProp("percent") }
  set percent(value) { this.setProp("percent", value) }

  // - its "people" is a number
  static { this.declareProp("people", { type: "number" }) }
  get people() { return this.getProp("people") }
  set people(value) { this.setProp("people", value) }

  /** the sums:  each worked out from the lines above, every time one of them changes */
  get tip() {
    return this.amount * this.percent / 100
  }

  get total() {
    return this.amount + this.tip
  }

  get each() {
    if (this.people < 1) return 0
    return this.total / this.people
  }

  /** "value={it}" binds the form to the bill:  each box's "name" is the property it changes */
  draw() {
    return h("div", { class: "Bill" },
      h("ui-segment",
        h("ui-form", { value: this },
          h("ui-input", { name: "amount", type: "number", min: "0", step: "0.01", label: "Bill $", fluid: true }),
          h("ui-input", { name: "percent", type: "number", min: "0", label: "Tip %", fluid: true }),
          h("ui-input", { name: "people", type: "number", min: "1", label: "People", fluid: true })
        ),
        h("div", { class: "Sums" },
          h("div", "Tip"),
          h("div", () => writeAmountAsMoney(this.tip)),
          h("div", "Total"),
          h("div", () => writeAmountAsMoney(this.total)),
          h("div", { class: "Each" }, "Each"),
          h("div", { class: "Each" }, () => writeAmountAsMoney(this.each))
        )
      )
    )
  }
}
export const bill = new Bill()

core.heading("Start:  a $60 dinner for three, with an 18% tip")
//## Start:  a $60 dinner for three, with an 18% tip
bill.amount = 60
bill.percent = 18
bill.people = 3
if (!core.isCarryingOver) bill.start()

core.heading("Checks")
/** Checks */
export function testMoney() {
  return core.test("test money", function testMoney() {
    core.expect(writeAmountAsMoney(12.5), `write 12.5 as money`, "$12.50", `"$12.50"`)
    core.expect(writeAmountAsMoney(3.07), `write 3.07 as money`, "$3.07", `"$3.07"`)
  })
}

export function testSplitting() {
  return core.test("test splitting", function testSplitting() {
    core.expect(bill.total, `the total of bill`, 70.8, `70.8`)
    core.expect(writeAmountAsMoney(bill.each), `write the each of bill as money`, "$23.60", `"$23.60"`)
  })
}

core.heading("Try it")
////////////
// ## Try it
////////////
// - On the right, change People to 4:  Each drops to $17.70 as you type.
// - Change the tip to 20:  Tip, Total and Each all follow.
//   Nothing in this file says "when the tip changes, redo the total":  the rules are always up to date.
// - Add a line of your own:  under "its each", add
//       - its "tip each" is its tip / its people
//   and show it on the page, the way "Tip" is shown.
//
// Where next:  Bill Splitter, in the Examples, where each diner is a thing of their own,
// with their own row, their own amount and their own share of the tip.
// -----------
core.installStyles(undefined, `/* File styles.css:  how the bill looks -- the three boxes, then the sums in two columns. */¬¬.Bill {¬  max-width: 22em;¬  margin: 2em auto;¬}¬¬.Bill ui-input {¬  margin-block-end: 0.5em;¬}¬¬.Sums {¬  display: grid;¬  grid-template-columns: 1fr auto;¬  gap: 0.25em;¬  margin-block-start: 1em;¬  font-variant-numeric: tabular-nums;¬}¬¬.Each {¬  font-weight: bold;¬}¬`)
// -----------
if (!core.isCarryingOver) testMoney()
if (!core.isCarryingOver) testSplitting()
