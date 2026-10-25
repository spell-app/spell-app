import { core, App, View, ViewableList, h, positionOf, spellPosition } from "@spell/core"

core.heading("How Solitaire works")
/////////////////////////
// ## How Solitaire works
/////////////////////////
// The Solitaire example is Klondike, the card game that came with every computer:
// seven columns of cards, built down from king to ace, red and black in turn.
// It's the biggest example, but it's made of small pieces:
// - a CARD, which knows its rank, its suit, and from those its color and its value
// - PILES of cards, each kind with its own rules for what it will take
//
// This guide is one card type and one rule:  a column, with a king on it, and four cards to try.
// Open Solitaire, in the Examples, to play the whole game.

core.heading("A card")
////////////
// ## A card
////////////
/** "one of" lists every value a property can have:  "2 ... 10" means every number in between */
export class Card extends View {
  static elementTag = core.defineElement(this, "test-project")

  // - its "rank" is one of ace, 2 ... 10, jack, queen, king
  static Ranks = ["ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king"]
  static { this.declareProp("rank", { oneOf: Card.Ranks }) }
  get rank() { return this.getProp("rank") }
  set rank(value) { this.setProp("rank", value) }

  // - its "suit" is one of clubs, diamonds, hearts or spades
  static Suits = ["clubs", "diamonds", "hearts", "spades"]
  static { this.declareProp("suit", { oneOf: Card.Suits }) }
  get suit() { return this.getProp("suit") }
  set suit(value) { this.setProp("suit", value) }

  /** ace is 1, 2 is 2 ... king is 13:  its place in the list of ranks */
  get value() {
    return spellPosition(positionOf(Card.Ranks, this.rank))
  }

  get color() {
    if (core.includes(["diamonds", "hearts"], this.suit)) return "red"
    return "black"
  }

  /** e.g. "queen of hearts" */
  get name() {
    return `${this.rank} of ${this.suit}`
  }

  /** a click tries it on the column */
  draw() {
    return h("ui-button", {
      basic: true,
      color: () => this.color,
      onClick: () => this.try(),
      style: "cursor:pointer;user-select:none"
    }, () => this.name)
  }

  /** onto the column, if it takes the card;  the message says what happened */
  try() {
    if (core.canTake(table.column, this)) {
      table.column.append(this)
      table.message = `The ${this.name} goes on.`
    } else table.message = `The column won't take the ${this.name}.`
  }

  get pile() {
    return Pile.ownerOf(this)
  }
}

core.heading("A pile, and a column")
/** A pile, and a column */
export class Pile extends ViewableList {
  static instanceType = Card
  static elementTag = core.defineElement(this, "test-project")

  static exclusive = true
}
/** a card is in one pile at a time:  putting it on another takes it off this one */

/**
 * The rule that makes it Solitaire:  a column takes a card one lower than its last, in the other color.
 * - "can take a card if" is a yes-or-no question the pile answers for each card
 * - "return" gives the answer:  the first line that returns, wins
 */
export class Column extends Pile {
  static elementTag = core.defineElement(this, "test-project")

  canTake(card) {
    if (this.isEmpty) return card.rank === "king"
    return this.lastItem.color !== card.color && this.lastItem.value === card.value + 1
  }
}

core.heading("The table:  a column, and a hand of cards to try on it")
/** The table:  a column, and a hand of cards to try on it */
export class Table extends App {
  static elementTag = core.defineElement(this, "test-project", "App")

  // - its "column" is a new column
  static { this.declareProp("column", { init: () => new Column(), early: true }) }
  get column() { return this.getProp("column") }
  set column(value) { this.setProp("column", value) }

  // - its "hand" is a new pile
  static { this.declareProp("hand", { init: () => new Pile(), early: true }) }
  get hand() { return this.getProp("hand") }
  set hand(value) { this.setProp("hand", value) }

  // - its "message" is text
  static { this.declareProp("message", { type: "text" }) }
  get message() { return this.getProp("message") }
  set message(value) { this.setProp("message", value) }

  draw() {
    return h("div", { class: "Table" },
      h("h3", "The column"),
      () => core.drawThing(this.column),
      h("h3", "Your hand: click a card to put it on the column"),
      () => core.drawThing(this.hand),
      h("p", () => this.message)
    )
  }
}
export const table = new Table()

core.heading("Start:  a king of spades on the column")
//## Start:  a king of spades on the column
table.column.append(new Card({ rank: "king", suit: "spades" }))
table.hand.append(new Card({ rank: "queen", suit: "spades" }))
table.hand.append(new Card({ rank: "queen", suit: "hearts" }))
table.hand.append(new Card({ rank: "jack", suit: "clubs" }))
table.hand.append(new Card({ rank: 10, suit: "diamonds" }))
if (!core.isCarryingOver) table.start()

core.heading("A check:  the rule, card by card")
/** A check:  the rule, card by card */
export function testTheColumn() {
  return core.test("test the column", function testTheColumn() {
    core.echoTestAction(`set the stack to a new column`)
    const stack = new Column()
    core.echoTestAction(`set the red queen to a new card with rank = queen, suit = hearts`)
    const redQueen = new Card({ rank: "queen", suit: "hearts" })
    core.expect(core.canTake(stack, redQueen), `the stack can take the red queen`, false, `no`)
    core.echoTestAction(`add (a new card with rank = king, suit = spades) to the stack`)
    stack.append(new Card({ rank: "king", suit: "spades" }))
    core.expect(core.canTake(stack, redQueen), `the stack can take the red queen`, true, `yes`)
    core.expect(core.canTake(stack, new Card({ rank: "queen", suit: "clubs" })), `the stack can take (a new card with rank = queen, suit = clubs)`, false, `no`)
  })
}

core.heading("Try it")
////////////
// ## Try it
////////////
// - Click the queen of spades on the right:  the column won't take it, because it's black, like the king.
// - Click the queen of hearts, then the jack of clubs, then the 10 of diamonds:  each one goes on.
// - Bend the rule:  in "a column is a pile where", take out
//   "the color of its last card is not the color of the card and".
//   Then the queen of spades goes on too.  (Click ↻, above the table, to deal the hand again.)
//
// Where next:  Solitaire, in the Examples, where the stock, the discards and the four foundations
// each have rules of their own, written the same way.  Solitario is the same game, in Spanish.
// -----------
core.installStyles(undefined, `/* File styles.css:  how the table looks -- the column, then the hand, each a row of cards. */¬¬.Table {¬  max-width: 34em;¬  margin-inline: auto;¬  padding-block: 1.5em;¬}¬¬how-solitaire-works-column,¬how-solitaire-works-pile {¬  display: flex;¬  flex-wrap: wrap;¬  gap: 0.5em;¬  min-height: 2.5em;¬}¬`)
// -----------
if (!core.isCarryingOver) testTheColumn()
