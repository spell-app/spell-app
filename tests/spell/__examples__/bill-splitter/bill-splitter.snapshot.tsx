import { core, App, View, ViewableList, prop, derived, drawn } from "@spell/core"
import { E, SpellElement } from "@spell/elements"

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
  @prop({ type: "text" })
  accessor name!: string

  /** what they ordered, before the tip */
  // - its "amount" is a number
  @prop({ type: "number" })
  accessor amount!: number

  /** their share of the tip:  the same part of it as their part of the bill */
  get tip() {
    return this.amount * billSplitter.percent / 100
  }

  get share() {
    return this.amount + this.tip
  }

  /** a form of its own, bound to it:  typing a name or an amount changes the diner */
  @drawn draw() {
    return (
      <ui-form value={this}>
        <div part="row">
          <ui-input part="name" name="name" placeholder="Name" aria-label="Name" fluid={true} />
          <ui-input part="amount" name="amount" type="number" min="0" step="0.01" aria-label="Amount" label="$" fluid={true} />
          <div part="share">{writeAmountAsMoney(this.share)}</div>
          <ui-button part="remove" icon="close" appearance="basic" aria-label="Remove" onClick={() => this.remove()} style="cursor:pointer;user-select:none" />
        </div>
      </ui-form>
    )
  }

  /** takes them off the bill */
  remove() {
    billSplitter.diners.remove(this)
  }

  get table() {
    return Table.ownerOf(this)!
  }
}

/**
 * `<test-project-diner>`:  a diner, drawn in its own element, e.g. by `draw the diner`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its diner's properties;  its methods call its diner's.
 * - What every view's element does, e.g. drawing its diner, is `SpellElement`'s.
 */
export class DinerElement extends SpellElement<Diner> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-diner", "diner", [
    { name: "name", kind: "string", description: "Its name." },
    { name: "amount", kind: "number", description: "Its amount." }
  ])

  remove() {
    return this.currentThing?.remove()
  }
}
core.useElement(Diner, DinerElement)

/** The table:  the diners, one a row */
export class Table extends ViewableList<Diner> {
  static instanceType = Diner
  static elementTag = core.defineElement(this, "test-project")

  drawItsPlaceholder() {
    return <div part="placeholder">Nobody yet:  add someone</div>
  }

  static exclusive = true
}

/**
 * `<test-project-table>`:  a table, drawn in its own element, e.g. by `draw the table`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its table's properties;  its methods call its table's.
 * - What every view's element does, e.g. drawing its table, is `SpellElement`'s.
 */
export class TableElement extends SpellElement<Table> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-table", "table", [])

  drawItsPlaceholder() {
    return this.currentThing?.drawItsPlaceholder()
  }
}
core.useElement(Table, TableElement)

/** Money:  an amount as dollars and cents, e.g. 12.5 => "$12.50" */
export function writeAmountAsMoney(amount: number) {
  const cents = Math.round(amount * 100)
  const dollars = parseInt(cents / 100)
  const leftOver = cents - dollars * 100
  if (leftOver < 10) return `$${dollars}.0${leftOver}`
  return `$${dollars}.${leftOver}`
}

core.heading("The bill splitter")
/** The bill splitter */
export class BillSplitter extends App {
  static elementTag = core.defineElement(this, "test-project", "App")

  // - its "diners" is a new table
  @prop({ init: () => new Table(), early: true })
  accessor diners!: Table

  /** the tip, as a percent of what was ordered, e.g. 18 */
  // - its "percent" is a number
  @prop({ type: "number" })
  accessor percent!: number

  /** what everyone ordered, added up */
  @derived get subtotal() {
    let addedUp: number = 0
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
  @drawn draw() {
    return (
      <div class="BillSplitter">
        <h2>Bill Splitter</h2>
        <ui-form value={this}>
          <div class="Tip">
            <label>Tip</label>
            <ui-input name="percent" type="number" min="0" step="1" aria-label="Tip percent" label="%" labeled="right" />
            <ui-buttons size="small" appearance="basic">
              <ui-button onClick={() => (this.percent = 15)} style="cursor:pointer;user-select:none">15%</ui-button>
              <ui-button onClick={() => (this.percent = 18)} style="cursor:pointer;user-select:none">18%</ui-button>
              <ui-button onClick={() => (this.percent = 20)} style="cursor:pointer;user-select:none">20%</ui-button>
            </ui-buttons>
          </div>
        </ui-form>
        {core.drawThing(this.diners)}
        <ui-button appearance="basic" icon="plus" onClick={() => this.addSomeone()} style="cursor:pointer;user-select:none">
          Add someone
        </ui-button>
        <ui-segment>
          <div class="Sums">
            <div>Ordered</div>
            <div>{writeAmountAsMoney(this.subtotal)}</div>
            <div>Tip</div>
            <div>{writeAmountAsMoney(this.tip)}</div>
            <div class="Total">Total</div>
            <div class="Total">{writeAmountAsMoney(this.total)}</div>
          </div>
        </ui-segment>
      </div>
    )
  }
}

/**
 * `<test-project-app>`:  a bill splitter, drawn in its own element, e.g. by `draw the bill splitter`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its bill splitter's properties;  its methods call its bill splitter's.
 * - What every view's element does, e.g. drawing its bill splitter, is `SpellElement`'s.
 */
export class BillSplitterElement extends SpellElement<BillSplitter> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-app", "bill splitter", [
    { name: "diners", kind: "json", description: "Its diners." },
    { name: "percent", kind: "number", description: "Its percent." }
  ])

  addSomeone() {
    return this.currentThing?.addSomeone()
  }
}
core.useElement(BillSplitter, BillSplitterElement)
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

// each view type's tag, for the JSX
declare module "@solidjs/web/types/jsx.js" {
  namespace JSX {
    interface IntrinsicElements {
      /** `DinerElement` */
      "test-project-diner": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
      /** `TableElement` */
      "test-project-table": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
      /** `BillSplitterElement` */
      "test-project-app": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
    }
  }
}
