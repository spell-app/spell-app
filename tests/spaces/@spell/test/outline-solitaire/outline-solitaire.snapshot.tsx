import { For } from "solid-js"
import { core, Thing, List, App, Drawable, DrawableList, prop, derived, drawn, positionOf, spellPosition, trigger, position, on } from "@spell/core"

core.heading("Deck:  US standard card deck (without jokers) -- in the outline style")
///////////////////////////////////////////////////////////////////////////
// ## Deck:  US standard card deck (without jokers) -- in the outline style
///////////////////////////////////////////////////////////////////////////
const SUITS = ["clubs", "diamonds", "hearts", "spades"] as const

const RANKS = ["ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king"] as const

/**
 * First in the project:  a card says `its "suit" is a suit of its deck`, so the deck's kinds come before it.
 * What a deck DOES uses the card's names, so it's in `Dealing.spell`, after `Card.spell`.
 */
export class Deck extends List<Card> {
  static get instanceType() {
    return Card
  }

  //## Dealing:  what a deck does -- after `Card.spell`, as it reads a card's names

  setUp() {
    if (this.isSetUp) return
    Deck.Ranks.forEach((rank) => Deck.Suits.forEach((suit) => {
      const it = new Card({ rank: rank, suit: suit })
      this.append(it)
    }))
    this.isSetUp = true
  }

  display() {
    const cardNames = new List()
    this.forEach((card) => cardNames.append(card.shortName))
    core.echo(`deck: ${cardNames}`)
  }

  // "suits" as one of clubs, diamonds, hearts or spades
  static Suits = SUITS

  // "ranks" as one of ace, 2 ... 10, jack, queen or king
  static Ranks = RANKS

  // set the is-set-up of the deck to yes
  @prop({ type: "choice" })
  accessor isSetUp!: boolean
}
export class Suit {
  static color(suit: (typeof SUITS)[number]) {
    if (core.includes(["diamonds", "hearts"], suit)) return "red"
    return "black"
  }
}
export class Rank {
  static isAFaceCard(rank: (typeof RANKS)[number]) {
    return core.includes(["jack", "queen", "king"], rank)
  }
}
// -----------
core.heading("Definition of a card -- in the outline style:  a heading, then what's true of it")
/** direction */
const DIRECTIONS = ["up", "down"] as const
export type Direction = (typeof DIRECTIONS)[number]

/** Definition of a card -- in the outline style:  a heading, then what's true of it */
export class Card extends Thing {
  /** suit and rank */
  // - its "suit" is a suit of its deck
  @prop({ oneOf: () => SUITS })
  accessor suit!: (typeof SUITS)[number]

  get color() {
    return Suit.color(this.suit)
  }

  /** e.g. "the card is a spade" */
  isASuit(suit: (typeof SUITS)[number]) {
    return this.suit === suit
  }

  // - its "rank" is a rank of its deck
  @prop({ oneOf: () => RANKS })
  accessor rank!: (typeof RANKS)[number]

  /** e.g. "the card is a queen" */
  isARank(rank: (typeof RANKS)[number]) {
    return this.rank === rank
  }

  /** e.g. "the card is the queen of spades" */
  isTheRankOfSuits(rank: (typeof RANKS)[number], suit: (typeof SUITS)[number]) {
    return this.rank === rank && this.suit === suit
  }

  get isAFaceCard() {
    return Rank.isAFaceCard(this.rank)
  }

  get value() {
    return spellPosition(positionOf(Deck.Ranks, this.rank))
  }

  // - its direction is up or down
  static Directions = DIRECTIONS
  @prop({ oneOf: DIRECTIONS })
  accessor direction!: Direction

  get isFaceUp() {
    return this.direction == "up"
  }

  get isFaceDown() {
    return this.direction == "down"
  }

  /** names */
  get name() {
    return `${this.rank}-of-${this.suit}`
  }

  get icon() {
    if (this.isASuit("clubs")) return "♣️"
    if (this.isASuit("diamonds")) return "♦️"
    if (this.isASuit("hearts")) return "♥️"
    if (this.isASuit("spades")) return "♠️"
    return "?"
  }

  get shortRank() {
    if (this.rank === undefined) return "?"
    if (typeof this.rank === "number") return `${this.rank}`
    return `${core.getItemAt(this.rank, 0) ?? ""}`.toLocaleUpperCase()
  }

  get shortDirection() {
    if (this.direction == "up") return "+"
    return "—"
  }

  get shortName() {
    return this.shortRank + this.icon
  }

  get state() {
    return this.shortRank + this.icon + this.shortDirection
  }

  /** drawing */
  @derived get front() {
    return (
      <div class={`Card face-up ${this.rank} ${this.suit} ui button compact fluid ${this.color}`} onClick={() => trigger("card-click", { card: this })}>
        {`${this.shortRank} `}
        <span class="suit">{this.icon}</span>
      </div>
    )
  }

  @derived get back() {
    return (
      <div class={`Card face-down ${this.rank} ${this.suit} ui button compact fluid`} onClick={() => trigger("card-click", { card: this })}>
        <i class="fitted bicycle icon" />
      </div>
    )
  }
  @drawn draw() {
    return this.direction === "down" ? this.back : this.front
  }

  //## actions -- the sentence style, beside the outline

  /**
   * Turn card face up or face down
   * Note that this will animate if you `wait for turn the card face up`
   */
  async turnFaceUp() {
    this.direction = "up"
    await core.pauseFor(50, "msec")
  }

  async turnFaceDown() {
    this.direction = "down"
    await core.pauseFor(50, "msec")
  }

  /**
   * Flip card to opposite direction
   * Note that this will animate if you `wait for turn the card face up`
   */
  async turnOver() {
    if (this.direction == "up") this.turnFaceDown()
    else this.turnFaceUp()
    await core.pauseFor(50, "msec")
  }

  async play() {
    const startPile = this.pile
    if (!core.canGiveUp(startPile, this)) return false

    if (startPile === stock) {
      playFromTheStockPile()
      return
    }

    const endPile = allPiles.filter((pile) => pile.droppable && core.canTake(pile, this)).firstItem
    if (endPile === undefined) return false

    const cardsToMove = startPile.startingWith(this)
    cardsToMove.name = startPile.name
    core.console.log(`moving (${cardsToMove.state}) to (${endPile.state})`)

    cardsToMove.forEach((card) => core.move(card, endPile))

    if (startPile instanceof Tableau && !startPile.isEmpty) {
      await core.pauseFor(200, "msec")
      const it = startPile.lastItem
      core.console.log(`turning over (${startPile.name}: ${it?.state})`)
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

core.heading("create a card instance with default properties")
/** create a card instance with default properties */
export function testCardSetup() {
  return core.test("test card setup", function testCardSetup() {
    core.echoTestAction(`the card is a new card whose rank is queen, suit is spades and direction is up`)
    const card = new Card({
      rank: "queen",
      suit: "spades",
      direction: "up"
    })
    core.echo(card)
    core.expect(card.rank, `the rank of the card`, "queen", `queen`)
    core.expect(card.suit, `the suit of the card`, "spades", `spades`)
    core.expect(card.name, `the name of the card`, "queen-of-spades", `"queen-of-spades"`)
    core.expect(card.color, `the color of the card`, "black", `black`)
    core.expect(card.value, `the value of the card`, 12, `12`)
    core.expect(card.icon, `the icon of the card`, "♠️", `"♠️"`)
    core.expect(card.shortRank, `the short rank of the card`, "Q", `"Q"`)
    core.expect(card.shortName, `the short name of the card`, "Q♠️", `"Q♠️"`)

    core.expect(card.isFaceUp, `the card is face up`, true, `yes`)
    core.expect(card.isFaceDown, `the card is face down`, false, `no`)

    core.expect(card.isAFaceCard, `the card is a face card`, true, `yes`)
    core.expect(!card.isAFaceCard, `the card is not a face card`, false, `false`)

    core.expect(card.isASuit("spades"), `the card is a spade`, true, `true`)
    core.expect(card.isASuit("clubs"), `the card is a club`, false, `false`)

    core.expect(card.isARank("queen"), `the card is a queen`, true, `true`)
    core.expect(card.isARank("ace"), `the card is an ace`, false, `false`)
    core.expect(card.isARank(2), `the card is a 2`, false, `false`)

    core.expect(card.isTheRankOfSuits("queen", "spades"), `the card is the queen of spades`, true, `true`)
    core.expect(card.isTheRankOfSuits("queen", "clubs"), `the card is the queen of clubs`, false, `false`)
    core.expect(!card.isTheRankOfSuits(2, "diamonds"), `the card is not the 2 of diamonds`, true, `true`)

    core.echoTestAction(`turn the card face down`)
    card.turnFaceDown()
    core.expect(card.direction, `the direction of the card`, "down", `down`)

    core.echoTestAction(`turn the card over`)
    card.turnOver()
    core.expect(card.isFaceUp, `the card is face up`, true, `true`)
  })
}
if (!core.isCarryingOver) testCardSetup()
// -----------
core.heading("Dealing:  what a deck does -- after `Card.spell`, as it reads a card's names")
export function testDeckCreation() {
  return core.test("test deck creation", function testDeckCreation() {
    core.echoTestAction(`the deck is a new deck`)
    const deck = new Deck()
    core.echoTestAction(`set up the deck`)
    deck.setUp()
    core.expect(deck.length, `the number of cards in the deck`, 52, `52`)
    core.echoTestAction(`set up the deck`)
    deck.setUp()
    core.expect(deck.length, `the number of cards in the deck`, 52, `52`)
    core.echoTestAction(`set the queens to the cards in the deck where the rank of the card is "queen"`)
    const queens = deck.filter((card) => card.rank == "queen")
    core.expect(queens.length, `the number of cards in the queens`, 4, `4`)
    core.expect(deck.lastItem?.name!, `the name of the bottom card of the deck`, "king-of-spades", `"king-of-spades"`)
    core.expect(deck.firstItem?.shortName!, `the short name of the top card of the deck`, "A♣️", `"A♣️"`)

    core.echo("the deck before shuffling:")
    core.echoTestAction(`display the deck`)
    deck.display()
    core.expect(deck.firstItem?.isTheRankOfSuits("ace", "clubs")!, `the first card of the deck is the ace of clubs`, true, `yes`)
  })
}
if (!core.isCarryingOver) testDeckCreation()
// -----------
core.heading("Pile of playing cards")
/** Pile of playing cards */
export class Pile extends List<Card> {
  static instanceType = Card

  get color() {
    if (this.isEmpty) return "none"
    return this.lastItem!.color
  }

  get value() {
    if (this.isEmpty) return 0
    return this.lastItem!.value
  }

  @derived get state() {
    let state = `${this.name || "pile"}:`
    this.forEach((card) => (state = `${state} ${card.state}`))
    return state
  }

  static exclusive = true

  // set the name of cards-to-move to the name of the start-pile
  @prop() accessor name!: string

  declare droppable: boolean
}
export interface Pile {
  canGiveUp(card: Card): boolean
  canTake(card: Card): boolean
}
/** a card is in one pile at a time:  putting it on another pile takes it off this one */
// -----------
core.heading("Klondike Solitaire Card Game")
//////////////////////////////////
// ## Klondike Solitaire Card Game
//////////////////////////////////
//-- See [wikipedia](https://en.wikipedia.org/wiki/Klondike_(solitaire)) for rules & naming conventions.

core.heading("Game bits")
/** Game bits */
export class Game extends App {
  // a game has a score as a number
  @prop({ type: "number" })
  accessor score!: number

  //## actions

  @derived get state() {
    let state: any /* spell: list */ = []
    allPiles.forEach((pile) => core.append(state, pile.state))
    return state
  }

  @drawn draw() {
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
core.console.log(game)

core.heading("set up all piles")
/** set up all piles */
export const allPiles = new List<Pile>({ instanceType: "Pile" })
export const foundations = new List<Pile>({ instanceType: "Pile" })
export const tableaus = new List<Pile>({ instanceType: "Pile" })

/** set up stock pile: unplayed cards */
export class StockPile extends Pile {
  canGiveUp(card: Card) {
    return card === this.lastItem
  }

  @drawn draw() {
    return (
      <div class="Pile Stock stacked">
        <div class="Placeholder ui button basic compact fluid" onClick={() => playFromTheStockPile()} />
        {this.lastItem?.draw()}
      </div>
    )
  }
}
export const stock = new StockPile({ name: "stock", droppable: false })
allPiles.append(stock)

/** set up discards: where played cards go when turning over stock */
export class DiscardPile extends Pile {
  canGiveUp(card: Card) {
    return card === this.lastItem
  }

  @drawn draw() {
    return <div class="Pile Discards stacked">{this.lastItem?.draw()}</div>
  }
}
export const discards = new DiscardPile({ name: "discards", droppable: false })
allPiles.append(discards)

/** set up foundation piles: where we build up from ace => king */
export class Foundation extends Pile {
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

  // note: tableaus just draw as a (vertical) list of cards

  @drawn draw() {
    const color = () => this.name === "diamonds" || this.name === "hearts" ? "red" : "black"
    return (
      <div class="Pile Foundation stacked">
        <div class={`Placeholder ui button basic compact fluid ${color()} ${this.name}`}>
          <div class={`suit ${this.name}`}>{this.symbol}</div>
        </div>
        {this.lastItem?.draw()}
      </div>
    )
  }

  declare symbol: string
}
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
  canGiveUp(card: Card) {
    return card.isFaceUp
  }

  canTake(card: Card) {
    if (this.isEmpty) return card.isARank("king")
    return this.color != card.color && this.value === card.value + 1
  }

  @drawn draw() {
    return (
      <div class="Pile Tableau staggered">
        <For each={this.items}>{(card) => card.draw()}</For>
      </div>
    )
  }
}
core.getRange(1, 7).forEach((number) => {
  const it5 = new Tableau({ name: `T${number}`, droppable: true })
  tableaus.append(it5)
  allPiles.append(it5)
})

/** set up deck of cards */
export const deck = new Deck()
deck.setUp()
// start with cards in the stock pile
deck.forEach((card) => stock.append(card))

core.heading("actions")
export function debugTheGame() {
  core.map(game.state, (line) => core.console.log(line))
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
  if (core.processIsRunning("play_from_the_stock_pile")) return
  core.startProcess("play_from_the_stock_pile", "EXCLUSIVE")
  try {
    if (stock.isEmpty) await resetTheStockPile()

    const it5 = stock.lastItem
    it5?.turnFaceUp()
    // pause for 150 msec
    core.move(it5!, discards)
  }
  finally {
    core.stopProcess("play_from_the_stock_pile")
  }
}

export async function dealTheCards() {
  if (core.processIsRunning("deal_the_cards")) return
  core.startProcess("deal_the_cards", "EXCLUSIVE")
  try {
    /** pull all cards into stock with a nice animation */
    const cards = allPiles.merged(Pile)
    cards.reverse()
    for (const card of cards) {
      const startPile = card.pile
      card.turnFaceDown()
      if (startPile !== stock) {
        stock.append(card)
        await core.pauseFor(50, "msec")
      }
    }
    stock.randomize()

    // deal cards into tableaus
    for (const row of core.getRange(1, 7)) {
      stock.lastItem?.turnFaceUp()
      for (const column of core.getRange(row, 7)) {
        tableaus.getItem(position(column))?.append(stock.lastItem!)
        await core.pauseFor(50, "msec")
      }
    }

    await playFromTheStockPile()
  }
  finally {
    core.stopProcess("deal_the_cards")
  }
}

on<{ card: Card }>("card-click", ({ card }) => card.play())

export async function autoPlay() {
  let anythingChanged: boolean = false
  if (!discards.isEmpty) {
    const testCard = discards.lastItem
    if (await testCard?.play()) {
      anythingChanged = true
      await core.pauseFor(500, "msec")
    }
  }

  // attempt to move bottom card of tableaus to foundations
  for (const pile of tableaus) {
    if (pile.isEmpty) continue
    const testCard = pile.lastItem!
    const foundation = foundations.filter((pile) => pile.name == testCard.suit).firstItem
    if (core.canTake(foundation!, testCard)) {
      anythingChanged = true
      await testCard.play()
      await core.pauseFor(100, "msec")
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
      await core.pauseFor(500, "msec")
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
  await core.pauseFor(30, "ticks")
  core.move(card!, discards)
}

core.heading("rendering the bits")
resetTheGame()
if (!core.isCarryingOver) game.start()
// -----------
core.installStyles(undefined, `/* File styles.css */¬.Card {¬	position: relative;¬	height: 30px;¬}¬¬.Card .suit {¬	position: relative;¬	font-size: 1.5rem;¬	padding-left: 1px;¬	vertical-align: top;¬	top: -0.15rem;¬}¬¬.Pile {¬	position: relative;¬	min-height: 30px;¬}¬¬.Pile.Tableau {¬	min-height: 500px;¬}¬¬.Pile.stacked .Card {¬	position: absolute;¬	left: 0;¬	top: 0;¬}¬¬.Pile.staggered .Card {¬	margin-bottom: 8px !important;¬}¬¬.Pile > .Placeholder {¬	position: relative;¬	height: 30px;¬}¬¬.Pile > .Placeholder .suit {¬	position: relative;¬	font-size: 1.6rem;¬}¬¬.Pile > .Placeholder .suit.diamonds,¬.Pile > .Placeholder .suit.spades {¬	font-size: 1.75rem;¬	top: -0.1rem;¬}`)
