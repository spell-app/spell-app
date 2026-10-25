import { core, Thing, List, App, View, Page, TwoSidedView, ViewableList, h } from "@spell/core"

core.heading("Bill Splitter")
///////////////////
// ## Bill Splitter
///////////////////
// Who owes what after a meal:  each person pays for what they ordered, and their share of the tip.
// Change a name, an amount or the tip, and every sum follows.
// What's where, top to bottom:
//   money:  an amount written as dollars and cents
//   the bill splitter:  its diners, the tip, the sums, and its drawing
//   a diner:  their name, what they ordered, and what they owe
//   start
//   tests

core.heading("Money:  an amount as dollars and cents, e.g. 12.5 => \"$12.50\"")
/** A diner:  their name, what they ordered, and what they owe */
export class Diner extends View {
  static elementTag = core.defineElement(this, "test-project")

  // - its "name" is text
  static { this.declareProp("name", { type: "text" }) }
  get name() { return this.getProp("name") }
  set name(value) { this.setProp("name", value) }

  /** what they ordered, before the tip */
  // - its "amount" is a number
  static { this.declareProp("amount", { type: "number" }) }
  get amount() { return this.getProp("amount") }
  set amount(value) { this.setProp("amount", value) }

  /** their share of the tip:  the same part of it as their part of the bill */
  get tip() {
    return this.amount * billSplitter.percent / 100
  }

  get share() {
    return this.amount + this.tip
  }

  /** a form of its own, bound to it:  typing a name or an amount changes the diner */
  draw() {
    return h("ui-form", { value: this },
      h("div", { part: "row" },
        h("ui-input", { part: "name", name: "name", placeholder: "Name", "aria-label": "Name", fluid: true }),
        h("ui-input", {
          part: "amount",
          name: "amount",
          type: "number",
          min: "0",
          step: "0.01",
          "aria-label": "Amount",
          label: "$",
          fluid: true
        }),
        h("div", { part: "share" }, () => writeAmountAsMoney(this.share)),
        h("ui-button", {
          part: "remove",
          icon: "close",
          basic: true,
          "aria-label": "Remove",
          onClick: () => this.remove(),
          style: "cursor:pointer;user-select:none"
        })
      )
    )
  }

  /** takes them off the bill */
  remove() {
    billSplitter.diners.remove(this)
  }

  get table() {
    return Table.ownerOf(this)
  }
}

/** The table:  the diners, one a row */
export class Table extends ViewableList {
  static instanceType = Diner
  static elementTag = core.defineElement(this, "test-project")

  drawItsPlaceholder() {
    return h("div", { part: "placeholder" }, "Nobody yet:  add someone")
  }

  static exclusive = true
}

/** Money:  an amount as dollars and cents, e.g. 12.5 => "$12.50" */
export function writeAmountAsMoney(amount) {
  const cents = Math.round(amount * 100)
  const dollars = parseInt(cents / 100)
  const leftOver = cents - dollars * 100
  if (leftOver < 10) return `$${dollars}.0${leftOver}`
  return `$${dollars}.${leftOver}`
}

core.heading("The bill splitter")
/** The bill splitter */
export class BillSplitter extends App {
  // - its "diners" is a new table
  static { this.declareProp("diners", { init: () => new Table(), early: true }) }
  get diners() { return this.getProp("diners") }
  set diners(value) { this.setProp("diners", value) }

  /** the tip, as a percent of what was ordered, e.g. 18 */
  // - its "percent" is a number
  static { this.declareProp("percent", { type: "number" }) }
  get percent() { return this.getProp("percent") }
  set percent(value) { this.setProp("percent", value) }

  /** what everyone ordered, added up */
  get subtotal() {
    let addedUp = 0
    this.diners.forEach((diner) => (addedUp = addedUp + diner.amount))
    return addedUp
  }

  get tip() {
    return this.subtotal * this.percent / 100
  }

  get total() {
    return this.subtotal + this.tip
  }

  /** an empty row, for the next person */
  addSomeone() {
    this.diners.append(new Diner({ name: "", amount: 0 }))
  }

  /** the tip, the diners, then the sums */
  draw() {
    return h("div", { class: "BillSplitter" },
      h("h2", "Bill Splitter"),
      h("ui-form", { value: this },
        h("div", { class: "Tip" },
          h("label", "Tip"),
          h("ui-input", {
            name: "percent",
            type: "number",
            min: "0",
            step: "1",
            "aria-label": "Tip percent",
            label: "%",
            labeled: "right"
          }),
          h("ui-buttons", { size: "small", basic: true },
            h("ui-button", { onClick: () => (this.percent = 15), style: "cursor:pointer;user-select:none" },
              "15%"
            ),
            h("ui-button", { onClick: () => (this.percent = 18), style: "cursor:pointer;user-select:none" },
              "18%"
            ),
            h("ui-button", { onClick: () => (this.percent = 20), style: "cursor:pointer;user-select:none" },
              "20%"
            )
          )
        )
      ),
      () => core.drawThing(this.diners),
      h("ui-button", {
        basic: true,
        icon: "plus",
        onClick: () => this.addSomeone(),
        style: "cursor:pointer;user-select:none"
      }, "Add someone"),
      h("ui-segment",
        h("div", { class: "Sums" },
          h("div", "Ordered"),
          h("div", () => writeAmountAsMoney(this.subtotal)),
          h("div", "Tip"),
          h("div", () => writeAmountAsMoney(this.tip)),
          h("div", { class: "Total" }, "Total"),
          h("div", { class: "Total" }, () => writeAmountAsMoney(this.total))
        )
      )
    )
  }
}
export const billSplitter = new BillSplitter()

core.heading("The table:  the diners, one a row")
/** a diner sits at one table */

core.heading("Start")
//## Start
billSplitter.percent = 18
billSplitter.diners.append(new Diner({ name: "Ana", amount: 24 }))
billSplitter.diners.append(new Diner({ name: "Ben", amount: 18.5 }))
billSplitter.diners.append(new Diner({ name: "Cleo", amount: 31.25 }))
if (!core.isCarryingOver) billSplitter.start()

core.heading("Tests")
/** Tests */
export function testMoney() {
  return core.test("test money", function testMoney() {
    core.expect(writeAmountAsMoney(12.5), `write 12.5 as money`, "$12.50", `"$12.50"`)
    core.expect(writeAmountAsMoney(3.07), `write 3.07 as money`, "$3.07", `"$3.07"`)
    core.expect(writeAmountAsMoney(0), `write 0 as money`, "$0.00", `"$0.00"`)
  })
}
// -----------
core.installStyles(undefined, `/* File styles.css:  how the bill splitter looks.¬   - The table, <bill-splitter-table>, holds a <bill-splitter-diner> a row.¬   - Inside a diner, by its parts:  its row, ::part(row);  its name, amount, share and remove button. */¬¬.BillSplitter {¬  max-width: 36em;¬  margin-inline: auto;¬  padding-block: 1.5em;¬}¬¬/* the tip:  its field, then three quick picks */¬.Tip {¬  display: flex;¬  align-items: center;¬  gap: 0.75em;¬  margin-block: 1em;¬}¬¬.Tip > label {¬  font-weight: bold;¬}¬¬.Tip > ui-input {¬  width: 7em;¬}¬¬/****************¬ * The diners:  name, amount, what they owe, remove¬ ****************/¬¬bill-splitter-table {¬  display: flex;¬  flex-direction: column;¬  gap: 0.5em;¬  margin-block: 1em;¬}¬¬bill-splitter-table::part(placeholder) {¬  padding: 1em;¬  opacity: 0.6;¬  text-align: center;¬}¬¬bill-splitter-diner::part(row) {¬  display: grid;¬  grid-template-columns: 1fr 9em 6em auto;¬  align-items: center;¬  gap: 0.5em;¬}¬¬bill-splitter-diner::part(share) {¬  font-weight: bold;¬  font-variant-numeric: tabular-nums;¬  text-align: right;¬}¬¬/****************¬ * The sums:  two columns, the total in bold¬ ****************/¬¬.Sums {¬  display: grid;¬  grid-template-columns: 1fr auto;¬  row-gap: 0.25em;¬  font-variant-numeric: tabular-nums;¬}¬¬.Sums > :nth-child(even) {¬  text-align: right;¬}¬¬.Sums > .Total {¬  padding-top: 0.25em;¬  font-size: 1.2em;¬  font-weight: bold;¬}¬`)
// -----------
if (!core.isCarryingOver) testMoney()
