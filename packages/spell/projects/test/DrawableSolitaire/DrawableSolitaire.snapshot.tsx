import { Show } from "solid-js"
import { spellCore, Thing, List, App, Drawable, DrawableList, prop, derived, drawn, css, positionOf, spellPosition, trigger, position, on } from "@spell/core"
import { E, SpellElement } from "@spell/elements"

spellCore.heading("definition of a Card with nice english aliases for working with it")
////////////////////////////////////////////////////////////////////////
// ## definition of a Card with nice english aliases for working with it
////////////////////////////////////////////////////////////////////////
/** card ranks */
const RANKS = ["ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king"] as const
export type Rank = (typeof RANKS)[number]

/** card suits */
const SUITS = ["clubs", "diamonds", "hearts", "spades"] as const
export type Suit = (typeof SUITS)[number]

/** card direction:  up or down */
const DIRECTIONS = ["up", "down"] as const
export type Direction = (typeof DIRECTIONS)[number]

/** a drawable thing:  each card draws in its own element, <solitaire-card>, with its own styles */
export class Card extends Drawable {
  static elementTag = spellCore.defineElement(this, "test-project")

  static css = css`
    :host {
    	display: block;
    	position: relative;
    }
    .card {
    	box-sizing: border-box;
    	height: 30px;
    	padding: 0.2em 0.4em;
    	border: 1px solid #b0b0b0;
    	border-radius: 4px;
    	background: white;
    	font-weight: bold;
    	text-align: center;
    	cursor: pointer;
    	user-select: none;
    }
    .card.red {
    	color: crimson;
    }
    .card.black {
    	color: #222;
    }
    .card.face-down {
    	background: repeating-linear-gradient(45deg, #3a6, #3a6 4px, #285 4px, #285 8px);
    }
    .suit {
    	position: relative;
    	font-size: 1.2rem;
    	vertical-align: top;
    	top: -0.1rem;
    }
  `

  /////////////////////////
  // ## properties of cards
  /////////////////////////
  static Ranks = RANKS
  @prop({ oneOf: RANKS }) accessor rank!: Rank

  static Suits = SUITS
  @prop({ oneOf: SUITS }) accessor suit!: Suit

  /** color as derivation of suit */
  get color() {
    if (spellCore.includes(["diamonds", "hearts"], this.suit)) return "red"
    return "black"
  }

  /** value as a derivation of rank */
  get value() {
    return spellPosition(positionOf(Card.Ranks, this.rank))
  }

  static Directions = DIRECTIONS
  @prop({ oneOf: DIRECTIONS }) accessor direction!: Direction

  /////////////
  // ## aliases
  /////////////
  /** "card is face up/down" */
  get isFaceUp() {
    return this.direction == "up"
  }

  get isFaceDown() {
    return this.direction == "down"
  }

  /** `card is a face card` */
  get isAFaceCard() {
    return spellCore.includes(["jack", "queen", "king"], this.rank)
  }

  /** "card is a spade", "...is a club" etc */
  isASuit(suit: Suit) {
    return this.suit === suit
  }

  /** "card is a queen", "...is an ace" etc */
  isARank(rank: Rank) {
    return this.rank === rank
  }

  /** "card is the queen of spades" etc */
  isTheRankOfSuits(rank: Rank, suit: Suit) {
    return this.rank === rank && this.suit === suit
  }

  /** name as a derivation of name/suit */
  get name() {
    return `${this.rank}-of-${this.suit}`
  }

  get shortSuit() {
    if (this.isASuit("clubs")) return "♣️"
    if (this.isASuit("diamonds")) return "♦️"
    if (this.isASuit("hearts")) return "♥️"
    if (this.isASuit("spades")) return "♠️"
    return "?"
  }

  get shortRank() {
    if (this.rank === undefined) return "?"
    if (typeof this.rank === "number") return `${this.rank}`
    return `${spellCore.getItemAt(this.rank, 0) ?? ""}`.toLocaleUpperCase()
  }

  get shortDirection() {
    if (this.direction == "up") return "+"
    return "—"
  }

  get shortName() {
    return this.shortRank + this.shortSuit
  }

  get state() {
    return this.shortRank + this.shortSuit + this.shortDirection
  }

  //## actions

  /**
   * Turn card face up or face down
   * Note that this will animate if you `wait for turn the card face up`
   */
  async turnFaceUp() {
    this.direction = "up"
    await spellCore.pauseFor(50, "msec")
  }

  async turnFaceDown() {
    this.direction = "down"
    await spellCore.pauseFor(50, "msec")
  }

  /**
   * Flip card to opposite direction
   * Note that this will animate if you `wait for turn the card face up`
   */
  async turnOver() {
    if (this.direction == "up") this.turnFaceDown()
    else this.turnFaceUp()
    await spellCore.pauseFor(50, "msec")
  }

  @drawn
  draw() {
    const className = () => `card face-${this.direction} ${this.rank} ${this.suit} `
    const click = () => trigger("card-click", { card: this })
    return (
      <Show
        when={this.isFaceDown}
        fallback={
          <div class={className() + this.color} onClick={click}>
            {`${this.shortRank} `}
            <span class="suit">{this.shortSuit}</span>
          </div>
        }
      >
        <div class={className()} onClick={click} />
      </Show>
    )
  }

  async play() {
    const startPile = this.pile
    if (!spellCore.canGiveUp(startPile, this)) return false

    if (startPile === stock) {
      playFromTheStockPile()
      return
    }

    const endPile = allPiles.filter((pile) => pile.droppable && spellCore.canTake(pile, this)).firstItem
    if (endPile === undefined) return false

    const cardsToMove = startPile.startingWith(this)
    cardsToMove.name = startPile.name
    spellCore.console.log(`moving (${cardsToMove.state}) to (${endPile.state})`)

    cardsToMove.forEach((card) => spellCore.move(card, endPile))

    if (startPile instanceof Tableau && !startPile.isEmpty) {
      await spellCore.pauseFor(200, "msec")
      const it = startPile.lastItem
      spellCore.console.log(`turning over (${startPile.name}: ${it?.state})`)
      it?.turnFaceUp()
    }

    if (endPile instanceof Foundation) game.score = game.score + 10
    else if (startPile === discards) game.score = game.score + 5
    return true
  }

  get pile() {
    return Pile.ownerOf(this)!
  }
}

/**
 * `<test-project-card>`:  a card, drawn in its own element, e.g. by `draw the card`.
 * - The page defines its tag with this class:  `spellCore.useElement()`, below.
 * - Its attributes are its card's properties;  its methods call its card's.
 * - What every drawable thing's element does, e.g. drawing its card, is `SpellElement`'s.
 */
export class CardElement extends SpellElement<Card> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-card", "card", [
    { name: "rank", kind: "string", description: "Its rank." },
    { name: "suit", kind: "string", description: "Its suit." },
    { name: "direction", kind: "string", description: "Its direction." }
  ])
  @E.protoMerged static elementSetup = {
    styleSheets: { "test-project-card": Card.css }
  } satisfies Partial<E.ElementSetup>

  isASuit(suit: Suit) {
    return this.currentThing?.isASuit(suit)
  }

  isARank(rank: Rank) {
    return this.currentThing?.isARank(rank)
  }

  isTheRankOfSuits(rank: Rank, suit: Suit) {
    return this.currentThing?.isTheRankOfSuits(rank, suit)
  }

  turnFaceUp() {
    return this.currentThing?.turnFaceUp()
  }

  turnFaceDown() {
    return this.currentThing?.turnFaceDown()
  }

  turnOver() {
    return this.currentThing?.turnOver()
  }

  play() {
    return this.currentThing?.play()
  }
}
spellCore.useElement(Card, CardElement)

spellCore.heading("create a card instance with default properties")
/** create a card instance with default properties */
export function testCardSetup() {
  return spellCore.test("test card setup", function testCardSetup() {
    spellCore.echoTestAction(`the card is a new card whose rank is queen, suit is spades and direction is up`)
    const card = new Card({
      rank: "queen",
      suit: "spades",
      direction: "up"
    })
    spellCore.echo(card)
    spellCore.expect(card.rank, `the rank of the card`, "queen", `queen`)
    spellCore.expect(card.suit, `the suit of the card`, "spades", `spades`)
    spellCore.expect(card.name, `the name of the card`, "queen-of-spades", `"queen-of-spades"`)
    spellCore.expect(card.color, `the color of the card`, "black", `black`)
    spellCore.expect(card.value, `the value of the card`, 12, `12`)
    spellCore.expect(card.shortSuit, `the short suit of the card`, "♠️", `"♠️"`)
    spellCore.expect(card.shortRank, `the short rank of the card`, "Q", `"Q"`)
    spellCore.expect(card.shortName, `the short name of the card`, "Q♠️", `"Q♠️"`)

    spellCore.expect(card.isFaceUp, `the card is face up`, true, `yes`)
    spellCore.expect(card.isFaceDown, `the card is face down`, false, `no`)

    spellCore.expect(card.isAFaceCard, `the card is a face card`, true, `yes`)
    spellCore.expect(!card.isAFaceCard, `the card is not a face card`, false, `false`)

    spellCore.expect(card.isASuit("spades"), `the card is a spade`, true, `true`)
    spellCore.expect(card.isASuit("clubs"), `the card is a club`, false, `false`)

    spellCore.expect(card.isARank("queen"), `the card is a queen`, true, `true`)
    spellCore.expect(card.isARank("ace"), `the card is an ace`, false, `false`)
    spellCore.expect(card.isARank(2), `the card is a 2`, false, `false`)

    spellCore.expect(card.isTheRankOfSuits("queen", "spades"), `the card is the queen of spades`, true, `true`)
    spellCore.expect(card.isTheRankOfSuits("queen", "clubs"), `the card is the queen of clubs`, false, `false`)
    spellCore.expect(!card.isTheRankOfSuits(2, "diamonds"), `the card is not the 2 of diamonds`, true, `true`)

    spellCore.echoTestAction(`turn the card face down`)
    card.turnFaceDown()
    spellCore.expect(card.direction, `the direction of the card`, "down", `down`)

    spellCore.echoTestAction(`turn the card over`)
    card.turnOver()
    spellCore.expect(card.isFaceUp, `the card is face up`, true, `true`)
  })
}
if (!spellCore.isCarryingOver) testCardSetup()
// -----------
spellCore.heading("Deck:   US standard card deck (without jokers currently)")
//## Deck:   US standard card deck (without jokers currently)

export class Deck extends List<Card> {
  static instanceType = Card

  setUp() {
    if (this.isSetUp) return
    Card.Ranks.forEach((rank) => Card.Suits.forEach((suit) => {
      const it = new Card({ rank: rank, suit: suit })
      this.append(it)
    }))
    this.isSetUp = true
  }

  display() {
    const cardNames = new List<string>({ instanceType: "text" })
    this.forEach((card) => cardNames.append(card.shortName))
    spellCore.echo(`deck: ${cardNames}`)
  }

  @prop({ type: "choice" }) accessor isSetUp!: boolean
}

export function testDeckCreation() {
  return spellCore.test("test deck creation", function testDeckCreation() {
    spellCore.echoTestAction(`the deck is a new deck`)
    const deck = new Deck()
    spellCore.echoTestAction(`set up the deck`)
    deck.setUp()
    spellCore.expect(deck.length, `the number of cards in the deck`, 52, `52`)
    spellCore.echoTestAction(`set up the deck`)
    deck.setUp()
    spellCore.expect(deck.length, `the number of cards in the deck`, 52, `52`)
    spellCore.echoTestAction(`set the queens to the cards in the deck where the rank of the card is "queen"`)
    const queens = deck.filter((card) => card.rank == "queen")
    spellCore.expect(queens.length, `the number of cards in the queens`, 4, `4`)
    spellCore.expect(deck.lastItem?.name!, `the name of the bottom card of the deck`, "king-of-spades", `"king-of-spades"`)
    spellCore.expect(deck.firstItem?.shortName!, `the short name of the top card of the deck`, "A♣️", `"A♣️"`)

    spellCore.echo("the deck before shuffling:")
    spellCore.echoTestAction(`display the deck`)
    deck.display()
    spellCore.expect(deck.firstItem?.isTheRankOfSuits("ace", "clubs")!, `the first card of the deck is the ace of clubs`, true, `yes`)
  })
}
if (!spellCore.isCarryingOver) testDeckCreation()
// -----------
spellCore.heading("Pile of playing cards")
///////////////////////////
// ## Pile of playing cards
///////////////////////////
/** a drawable list:  each pile is its own element, <solitaire-pile>, holding its cards' elements */
export class Pile extends DrawableList<Card> {
  static instanceType = Card
  static elementTag = spellCore.defineElement(this, "test-project")

  static css = css`
    :host {
    	display: block;
    	position: relative;
    	min-height: 30px;
    }
    .pile {
    	position: relative;
    	min-height: 30px;
    }
    /* its cards, stacked:  the last on top */
    ::slotted(*) {
    	position: absolute;
    	left: 0;
    	top: 0;
    	width: 100%;
    }
    .placeholder {
    	box-sizing: border-box;
    	height: 30px;
    	border: 1px dashed #b0b0b0;
    	border-radius: 4px;
    	text-align: center;
    	cursor: pointer;
    }
    .placeholder.red {
    	color: crimson;
    }
    .placeholder .suit {
    	font-size: 1.4rem;
    	line-height: 28px;
    }
  `

  @prop({ type: "text" }) accessor name!: string

  get color() {
    if (this.isEmpty) return "none"
    return this.lastItem!.color
  }

  get value() {
    if (this.isEmpty) return 0
    return this.lastItem!.value
  }

  @derived
  get state() {
    let state = `${this.name || "pile"}:`
    this.forEach((card) => (state = `${state} ${card.state}`))
    return state
  }

  static exclusive = true

  declare droppable: boolean
}
export interface Pile {
  canGiveUp(card: Card): boolean
  canTake(card: Card): boolean
}

/**
 * `<test-project-pile>`:  a pile, drawn in its own element, e.g. by `draw the pile`.
 * - The page defines its tag with this class:  `spellCore.useElement()`, below.
 * - Its attributes are its pile's properties;  its methods call its pile's.
 * - What every drawable thing's element does, e.g. drawing its pile, is `SpellElement`'s.
 */
export class PileElement extends SpellElement<Pile> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-pile", "pile", [
    { name: "name", kind: "string", description: "Its name." }
  ])
  @E.protoMerged static elementSetup = {
    styleSheets: { "test-project-pile": Pile.css }
  } satisfies Partial<E.ElementSetup>
}
spellCore.useElement(Pile, PileElement)
/** a card is in one pile at a time:  putting it on another pile takes it off this one */
// -----------
spellCore.heading("Klondike Solitaire Card Game")
//////////////////////////////////
// ## Klondike Solitaire Card Game
//////////////////////////////////
//-- See [wikipedia](https://en.wikipedia.org/wiki/Klondike_(solitaire)) for rules & naming conventions.

spellCore.heading("Game bits")
/** Game bits */
export class Game extends App {
  @prop({ type: "number" }) accessor score!: number

  //## actions

  @derived
  get state() {
    let state = new List<string>({ instanceType: "text" })
    allPiles.forEach((pile) => state.append(pile.state))
    return state
  }

  @drawn
  draw() {
    return (
      <div class="ui container">
        <div class="board">
          <table class="ui table fixed">
            <thead>
              <tr>
                <th class="left aligned" colspan="2">Klondike Solitaire</th>
                <th class="right aligned">{`Score: ${this.score}`}</th>
                <th>
                  <div class="tiny fluid ui button compact" onClick={() => autoPlay()}>AutoPlay</div>
                </th>
                <th>
                  <div class="tiny fluid ui button compact" onClick={() => cheat()}>Cheat</div>
                </th>
                <th>
                  <div class="tiny fluid ui button compact" onClick={() => debugTheGame()}>Debug</div>
                </th>
                <th>
                  <div class="tiny fluid ui button compact" onClick={() => resetTheGame()}>Restart</div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{stock.draw()}</td>
                <td>{discards.draw()}</td>
                <td />
                <td>{foundations.firstItem?.draw()}</td>
                <td>{foundations.getItem(1)?.draw()}</td>
                <td>{foundations.getItem(2)?.draw()}</td>
                <td>{foundations.getItem(3)?.draw()}</td>
              </tr>
              <tr>
                <td>{tableaus.firstItem?.draw()}</td>
                <td>{tableaus.getItem(1)?.draw()}</td>
                <td>{tableaus.getItem(2)?.draw()}</td>
                <td>{tableaus.getItem(3)?.draw()}</td>
                <td>{tableaus.getItem(4)?.draw()}</td>
                <td>{tableaus.getItem(5)?.draw()}</td>
                <td>{tableaus.getItem(6)?.draw()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}
export const game = new Game()
spellCore.console.log(game)

spellCore.heading("set up all piles")
/** set up all piles */
export const allPiles = new List<Pile>({ instanceType: "Pile" })
export const foundations = new List<Pile>({ instanceType: "Pile" })
export const tableaus = new List<Pile>({ instanceType: "Pile" })

/** set up stock pile: unplayed cards */
export class StockPile extends Pile {
  static elementTag = spellCore.defineElement(this, "test-project")

  canGiveUp(card: Card) {
    return card === this.lastItem
  }

  @drawn
  draw() {
    return (
      <div class="pile stock">
        <div class="placeholder" onClick={() => playFromTheStockPile()} />
        <slot />
      </div>
    )
  }
}

/**
 * `<test-project-stock-pile>`:  a stock pile, drawn in its own element, e.g. by `draw the stock pile`.
 * - The page defines its tag with this class:  `spellCore.useElement()`, below.
 * - Its attributes are its stock pile's properties;  its methods call its stock pile's.
 * - What every drawable thing's element does, e.g. drawing its stock pile, is `SpellElement`'s.
 */
export class StockPileElement extends SpellElement<StockPile> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-stock-pile", "stock pile", [])

  canGiveUp(card: Card) {
    return this.currentThing?.canGiveUp(card)
  }
}
spellCore.useElement(StockPile, StockPileElement)
export const stock = new StockPile({ name: "stock", droppable: false })
allPiles.append(stock)

/** set up discards: where played cards go when turning over stock */
export class DiscardPile extends Pile {
  static elementTag = spellCore.defineElement(this, "test-project")

  canGiveUp(card: Card) {
    return card === this.lastItem
  }

  @drawn
  draw() {
    return (
      <div class="pile discards">
        <slot />
      </div>
    )
  }
}

/**
 * `<test-project-discard-pile>`:  a discard pile, drawn in its own element, e.g. by `draw the discard pile`.
 * - The page defines its tag with this class:  `spellCore.useElement()`, below.
 * - Its attributes are its discard pile's properties;  its methods call its discard pile's.
 * - What every drawable thing's element does, e.g. drawing its discard pile, is `SpellElement`'s.
 */
export class DiscardPileElement extends SpellElement<DiscardPile> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-discard-pile", "discard pile", [])

  canGiveUp(card: Card) {
    return this.currentThing?.canGiveUp(card)
  }
}
spellCore.useElement(DiscardPile, DiscardPileElement)
export const discards = new DiscardPile({ name: "discards", droppable: false })
allPiles.append(discards)

/** set up foundation piles: where we build up from ace => king */
export class Foundation extends Pile {
  static elementTag = spellCore.defineElement(this, "test-project")

  canGiveUp(card: Card) {
    return false
  }

  /** one card at a time:  the last of its pile */
  canTake(card: Card) {
    if (card !== card.pile.lastItem) return false
    return this.name == card.suit && this.value + 1 === card.value
  }

  //##############
  //## rendering the bits

  // each pile draws its outside:  its cards show in its <slot/>, each card its own element

  @drawn
  draw() {
    const color = () => this.name === "diamonds" || this.name === "hearts" ? "red" : "black"
    return (
      <div class="pile foundation">
        <div class={`placeholder ${color()} ${this.name}`}>
          <div class={`suit ${this.name}`}>{this.symbol}</div>
        </div>
        <slot />
      </div>
    )
  }

  declare symbol: string
}

/**
 * `<test-project-foundation>`:  a foundation, drawn in its own element, e.g. by `draw the foundation`.
 * - The page defines its tag with this class:  `spellCore.useElement()`, below.
 * - Its attributes are its foundation's properties;  its methods call its foundation's.
 * - What every drawable thing's element does, e.g. drawing its foundation, is `SpellElement`'s.
 */
export class FoundationElement extends SpellElement<Foundation> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-foundation", "foundation", [])

  canGiveUp(card: Card) {
    return this.currentThing?.canGiveUp(card)
  }

  canTake(card: Card) {
    return this.currentThing?.canTake(card)
  }
}
spellCore.useElement(Foundation, FoundationElement)
const it = new Foundation({
  name: "clubs",
  symbol: "♣️",
  droppable: true
})
foundations.append(it)
const it2 = new Foundation({
  name: "diamonds",
  symbol: "♦️",
  droppable: true
})
foundations.append(it2)
const it3 = new Foundation({
  name: "hearts",
  symbol: "♥️",
  droppable: true
})
foundations.append(it3)
const it4 = new Foundation({
  name: "spades",
  symbol: "♠️",
  droppable: true
})
foundations.append(it4)
foundations.forEach((pile) => allPiles.append(pile))

/** set up tableau piles: vertical piles where we arrange from king to ace */
export class Tableau extends Pile {
  static elementTag = spellCore.defineElement(this, "test-project")

  static css = css`
    :host {
    	min-height: 500px;
    }
    /* its cards, one below the other */
    ::slotted(*) {
    	position: relative;
    	margin-bottom: 8px;
    }
  `

  canGiveUp(card: Card) {
    return card.isFaceUp
  }

  canTake(card: Card) {
    if (this.isEmpty) return card.isARank("king")
    return this.color !== card.color && this.value === card.value + 1
  }

  @drawn
  draw() {
    return (
      <div class="pile tableau">
        <slot />
      </div>
    )
  }
}

/**
 * `<test-project-tableau>`:  a tableau, drawn in its own element, e.g. by `draw the tableau`.
 * - The page defines its tag with this class:  `spellCore.useElement()`, below.
 * - Its attributes are its tableau's properties;  its methods call its tableau's.
 * - What every drawable thing's element does, e.g. drawing its tableau, is `SpellElement`'s.
 */
export class TableauElement extends SpellElement<Tableau> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-tableau", "tableau", [])
  @E.protoMerged static elementSetup = {
    styleSheets: { "test-project-tableau": Tableau.css }
  } satisfies Partial<E.ElementSetup>

  canGiveUp(card: Card) {
    return this.currentThing?.canGiveUp(card)
  }

  canTake(card: Card) {
    return this.currentThing?.canTake(card)
  }
}
spellCore.useElement(Tableau, TableauElement)
spellCore.getRange(1, 7).forEach((number) => {
  const it5 = new Tableau({ name: `T${number}`, droppable: true })
  tableaus.append(it5)
  allPiles.append(it5)
})

/** set up deck of cards */
export const deck = new Deck()
deck.setUp()
// start with cards in the stock pile
deck.forEach((card) => stock.append(card))

spellCore.heading("actions")
export function debugTheGame() {
  spellCore.map(game.state, (line: string) => spellCore.console.log(line))
}

export function resetTheStockPile() {
  const cards = discards.clone()
  cards.reverse()
  cards.forEach((card) => {
    stock.append(card)
    card.turnFaceDown()
  })
}

export async function playFromTheStockPile() {
  if (spellCore.processIsRunning("play_from_the_stock_pile")) return
  spellCore.startProcess("play_from_the_stock_pile", "EXCLUSIVE")
  try {
    if (stock.isEmpty) await resetTheStockPile()

    const it5 = stock.lastItem
    it5?.turnFaceUp()
    // pause for 150 msec
    spellCore.move(it5!, discards)
  }
  finally {
    spellCore.stopProcess("play_from_the_stock_pile")
  }
}

export async function dealTheCards() {
  if (spellCore.processIsRunning("deal_the_cards")) return
  spellCore.startProcess("deal_the_cards", "EXCLUSIVE")
  try {
    /** pull all cards into stock with a nice animation */
    const cards = allPiles.merged(Pile)
    cards.reverse()
    for (const card of cards) {
      const startPile = card.pile
      card.turnFaceDown()
      if (startPile !== stock) {
        stock.append(card)
        await spellCore.pauseFor(50, "msec")
      }
    }
    stock.randomize()

    // deal cards into tableaus
    for (const row of spellCore.getRange(1, 7)) {
      stock.lastItem?.turnFaceUp()
      for (const column of spellCore.getRange(row, 7)) {
        tableaus.getItem(position(column))?.append(stock.lastItem!)
        await spellCore.pauseFor(50, "msec")
      }
    }

    await playFromTheStockPile()
  }
  finally {
    spellCore.stopProcess("deal_the_cards")
  }
}

on<{ card: Card }>("card-click", ({ card }) => card.play())

export async function autoPlay() {
  let anythingChanged: boolean = false
  if (!discards.isEmpty) {
    const testCard = discards.lastItem
    if (await testCard?.play()) {
      anythingChanged = true
      await spellCore.pauseFor(500, "msec")
    }
  }

  // attempt to move bottom card of tableaus to foundations
  for (const pile of tableaus) {
    if (pile.isEmpty) continue
    const testCard = pile.lastItem!
    const foundation = foundations.filter((pile) => pile.name == testCard.suit).firstItem
    if (spellCore.canTake(foundation!, testCard)) {
      anythingChanged = true
      await testCard.play()
      await spellCore.pauseFor(100, "msec")
    }
  }

  // attempt to move the entire pile of face-up cards
  for (const pile of tableaus) {
    const faceUpCards = pile.filter((card) => card.isFaceUp)
    if (faceUpCards.isEmpty) continue
    const testCard = faceUpCards.firstItem!
    if (testCard.isARank("king") && testCard === pile.firstItem) continue
    if (await testCard.play()) {
      anythingChanged = true
      await spellCore.pauseFor(500, "msec")
    }
  }

  // call auto-play again if anything actually changed
  if (anythingChanged) await autoPlay()
}

export function resetTheGame() {
  game.score = 0
  dealTheCards()
}

export async function cheat() {
  const remainingPiles = tableaus.filter((pile) => !pile.isEmpty && pile.firstItem?.isFaceDown)
  if (remainingPiles.isEmpty) return
  const pile = remainingPiles.randomItem()
  const unplaidCards = pile?.filter((card) => card.isFaceDown)
  const card = unplaidCards?.randomItem()
  card?.turnFaceUp()
  await spellCore.pauseFor(30, "ticks")
  spellCore.move(card!, discards)
}

spellCore.heading("rendering the bits")
resetTheGame()
if (!spellCore.isCarryingOver) game.start()
// -----------
spellCore.installStyles(undefined, `/* File styles.css:  the board's own styles.  The cards and piles style themselves:  their <css>. */¬`)

// each drawable type's tag, for the JSX
declare module "@solidjs/web/types/jsx.js" {
  namespace JSX {
    interface IntrinsicElements {
      /** `CardElement` */
      "test-project-card": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
      /** `PileElement` */
      "test-project-pile": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
      /** `StockPileElement` */
      "test-project-stock-pile": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
      /** `DiscardPileElement` */
      "test-project-discard-pile": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
      /** `FoundationElement` */
      "test-project-foundation": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
      /** `TableauElement` */
      "test-project-tableau": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
    }
  }
}
