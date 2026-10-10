import { For } from "solid-js"
import { spellCore, Thing, List, App, prop, derived, drawn } from "@spell/core"

spellCore.heading("Deck:  US standard card deck (without jokers) -- in the outline style")
///////////////////////////////////////////////////////////////////////////
// ## Deck:  US standard card deck (without jokers) -- in the outline style
///////////////////////////////////////////////////////////////////////////
const SUITS = ["clubs", "diamonds", "hearts", "spades"] as const
const RANKS = ["ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king"] as const


/**
 * First in the project:  a card says `its "suit" is a suit of its deck`, so the deck's kinds come before it.
 * What a deck DOES uses the card's names, so it's in `Dealing.spell`, after `Card.spell`.
 */
export class Deck extends List {
  static get instanceType() {
    return Card
  }

  //## Dealing:  what a deck does -- after `Card.spell`, as it reads a card's names

  setUp() {
    if (this.is_set_up) return
    spellCore.map(Deck.Ranks, (rank: any /* spell: type unknown */) => {
      spellCore.map(Deck.Suits, (suit: any /* spell: type unknown */) => {
        const it = new Card({ rank: rank, suit: suit })
        spellCore.append(this, it)
      })
    })
    this.is_set_up = true
  }

  display() {
    const cardNames = new List()
    spellCore.map(this, (card: any /* spell: type unknown */) => {
      spellCore.append(cardNames, card.shortName)
    })
    spellCore.echo(`deck: ${cardNames}`)
  }

  static Suits = SUITS

  static Ranks = RANKS

  @prop({ type: "choice" }) accessor is_set_up!: boolean
}
export class Suit {
  static color(suit: any /* spell: type unknown */) {
    if (spellCore.includes(["diamonds", "hearts"], suit)) return "red"
    return "black"
  }
}
export class Rank {
  static isAFaceCard(rank: any /* spell: type unknown */) {
    return spellCore.includes(["jack", "queen", "king"], rank)
  }
}
// -----------
spellCore.heading("Definition of a card -- in the outline style:  a heading, then what's true of it")
/** direction */
const DIRECTIONS = ["up", "down"] as const

export type Direction = (typeof DIRECTIONS)[number]

/** Definition of a card -- in the outline style:  a heading, then what's true of it */
export class Card extends Thing {
  /** suit and rank */
  @prop({ oneOf: () => SUITS }) accessor suit!: (typeof SUITS)[number]

  get color() {
    return Suit.color(this.suit)
  }

  /** e.g. "the card is a spade" */
  isASuit(suit: any /* spell: type unknown */) {
    return this.suit === suit
  }

  @prop({ oneOf: () => RANKS }) accessor rank!: (typeof RANKS)[number]

  /** e.g. "the card is a queen" */
  isARank(rank: any /* spell: type unknown */) {
    return this.rank === rank
  }

  /** e.g. "the card is the queen of spades" */
  isTheRankOfSuits(rank: any /* spell: type unknown */, suit: any /* spell: type unknown */) {
    return this.rank === rank && this.suit === suit
  }

  get isAFaceCard() {
    return Rank.isAFaceCard(this.rank)
  }

  get value() {
    return spellCore.itemOf(Deck.Ranks, this.rank)
  }

  static Directions = DIRECTIONS
  @prop({ oneOf: DIRECTIONS }) accessor direction!: Direction

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

  get shortSuit() {
    if (this.isASuit("clubs")) return "♣️"
    if (this.isASuit("diamonds")) return "♦️"
    if (this.isASuit("hearts")) return "♥️"
    if (this.isASuit("spades")) return "♠️"
    return "?"
  }

  get shortRank() {
    if (this.rank == undefined) return "?"
    if (spellCore.isOfType(this.rank, "number")) return `${this.rank}`
    return spellCore.upperCase(spellCore.getItemOf(this.rank, 1))
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

  /** drawing */
  @derived
  get front() {
    return (
      <div class={`Card face-up ${this.rank} ${this.suit} ui button compact fluid ${this.color}`} onClick={() => spellCore.RUNTIME.trigger("card-click", { card: this })}>
        {`${this.shortRank} `}
        <span class="suit">{this.shortSuit}</span>
      </div>
    )
  }

  @derived
  get back() {
    return (
      <div class={`Card face-down ${this.rank} ${this.suit} ui button compact fluid`} onClick={() => spellCore.RUNTIME.trigger("card-click", { card: this })}>
        <i class="fitted bicycle icon" />
      </div>
    )
  }
  @drawn
  draw() {
    return this.direction === "down" ? this.back : this.front
  }

  //## actions -- the sentence style, beside the outline

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

  async play() {
    const startPile = this.pile
    if (!spellCore.canGiveUp(startPile, this)) return false

    if (startPile == stock) {
      playFromTheStockPile()
      return
    }

    const endPile: any /* spell: type unknown */ = spellCore.getItemOf(spellCore.filter(allPiles, (pile: any /* spell: type unknown */) => pile.droppable == true && spellCore.canTake(pile, this)), 1)
    if (!spellCore.isDefined(endPile)) return false

    const cardsToMove: any /* spell: type unknown */ = spellCore.rangeStartingAt(startPile, spellCore.itemOf(startPile, this))
    cardsToMove.name = startPile.name
    spellCore.console.log(`moving (${cardsToMove.state}) to (${endPile.state})`)

    spellCore.map(cardsToMove, (card: any /* spell: type unknown */) => {
      spellCore.move(card, endPile)
    })

    if (spellCore.isOfType(startPile, "Tableau") && !spellCore.isEmpty(startPile)) {
      await spellCore.pauseFor(200, "msec")
      const it: any /* spell: type unknown */ = spellCore.getItemOf(startPile, -1)
      spellCore.console.log(`turning over (${startPile.name}: ${it.state})`)
      it.turnFaceUp()
    }

    if (spellCore.isOfType(endPile, "Foundation")) game.score = game.score + 10
    else if (startPile == discards) game.score = game.score + 5
    return true
  }

  get pile() {
    return Pile.ownerOf(this)
  }
}

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
testCardSetup()
// -----------
spellCore.heading("Dealing:  what a deck does -- after `Card.spell`, as it reads a card's names")
export function testDeckCreation() {
  return spellCore.test("test deck creation", function testDeckCreation() {
    spellCore.echoTestAction(`the deck is a new deck`)
    const deck = new Deck()
    spellCore.echoTestAction(`set up the deck`)
    deck.setUp()
    spellCore.expect(spellCore.itemCountOf(deck), `the number of cards in the deck`, 52, `52`)
    spellCore.echoTestAction(`set up the deck`)
    deck.setUp()
    spellCore.expect(spellCore.itemCountOf(deck), `the number of cards in the deck`, 52, `52`)
    spellCore.echoTestAction(`set the queens to the cards in the deck where the rank of the card is "queen"`)
    const queens: any /* spell: type unknown */ = spellCore.filter(deck, (card: any /* spell: type unknown */) => card.rank == "queen")
    spellCore.expect(spellCore.itemCountOf(queens), `the number of cards in the queens`, 4, `4`)
    spellCore.expect(spellCore.getItemOf(deck, -1)!.name, `the name of the bottom card of the deck`, "king-of-spades", `"king-of-spades"`)
    spellCore.expect(spellCore.getItemOf(deck, 1)!.shortName, `the short name of the top card of the deck`, "A♣️", `"A♣️"`)

    spellCore.echo("the deck before shuffling:")
    spellCore.echoTestAction(`display the deck`)
    deck.display()
    spellCore.expect(spellCore.getItemOf(deck, 1)!.isTheRankOfSuits("ace", "clubs"), `the first card of the deck is the ace of clubs`, true, `yes`)
  })
}
testDeckCreation()
// -----------
spellCore.heading("Pile of playing cards")
/** Pile of playing cards */
export class Pile extends List<Card> {
  static instanceType = Card

  get color() {
    if (spellCore.isEmpty(this)) return "none"
    return spellCore.getItemOf(this, -1)!.color
  }

  get value() {
    if (spellCore.isEmpty(this)) return 0
    return spellCore.getItemOf(this, -1)!.value
  }

  @derived
  get state() {
    let state = `${this.name || "pile"}:`
    spellCore.map(this, (card: any /* spell: type unknown */) => {
      state = `${state} ${card.state}`
    })
    return state
  }

  static exclusive = true

  @prop() accessor name!: any /* spell: type unknown */
}
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
    let state: any /* spell: list */ = []
    spellCore.map(allPiles, (pile: any /* spell: type unknown */) => {
      spellCore.append(state, pile.state)
    })
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
                <td>{spellCore.getItemOf(foundations, 1)?.draw()}</td>
                <td>{spellCore.getItemOf(foundations, 2)?.draw()}</td>
                <td>{spellCore.getItemOf(foundations, 3)?.draw()}</td>
                <td>{spellCore.getItemOf(foundations, 4)?.draw()}</td>
              </tr>
              <tr>
                <td>{spellCore.getItemOf(tableaus, 1)?.draw()}</td>
                <td>{spellCore.getItemOf(tableaus, 2)?.draw()}</td>
                <td>{spellCore.getItemOf(tableaus, 3)?.draw()}</td>
                <td>{spellCore.getItemOf(tableaus, 4)?.draw()}</td>
                <td>{spellCore.getItemOf(tableaus, 5)?.draw()}</td>
                <td>{spellCore.getItemOf(tableaus, 6)?.draw()}</td>
                <td>{spellCore.getItemOf(tableaus, 7)?.draw()}</td>
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
export class Stock_Pile extends Pile {
  canGiveUp(card: any /* spell: type unknown */) {
    return card == spellCore.getItemOf(this, -1)
  }

  @drawn
  draw() {
    return (
      <div class="Pile Stock stacked">
        <div class="Placeholder ui button basic compact fluid" onClick={() => playFromTheStockPile()} />
        {spellCore.getItemOf(this, -1)?.draw()}
      </div>
    )
  }
}
export const stock = new Stock_Pile({ name: "stock", droppable: false })
spellCore.append(allPiles, stock)

/** set up discards: where played cards go when turning over stock */
export class Discard_Pile extends Pile {
  canGiveUp(card: any /* spell: type unknown */) {
    return card == spellCore.getItemOf(this, -1)
  }

  @drawn
  draw() {
    return <div class="Pile Discards stacked">{spellCore.getItemOf(this, -1)?.draw()}</div>
  }
}
export const discards = new Discard_Pile({ name: "discards", droppable: false })
spellCore.append(allPiles, discards)

/** set up foundation piles: where we build up from ace => king */
export class Foundation extends Pile {
  canGiveUp(card: any /* spell: type unknown */) {
    return false
  }

  /** one card at a time:  the last of its pile */
  canTake(card: any /* spell: type unknown */) {
    if (card != spellCore.getItemOf(card.pile, -1)) return false
    return this.name == card.suit && this.value + 1 == card.value
  }

  //##############
  //## rendering the bits

  // note: tableaus just draw as a (vertical) list of cards

  @drawn
  draw() {
    const color = () => this.name == "diamonds" || this.name == "hearts" ? "red" : "black"
    return (
      <div class="Pile Foundation stacked">
        <div class={`Placeholder ui button basic compact fluid ${color()} ${this.name}`}>
          <div class={`suit ${this.name}`}>{this.symbol}</div>
        </div>
        {spellCore.getItemOf(this, -1)?.draw()}
      </div>
    )
  }
}
const it = new Foundation({
  name: "clubs",
  symbol: "♣️",
  droppable: true
})
spellCore.append(foundations, it)
const it2 = new Foundation({
  name: "diamonds",
  symbol: "♦️",
  droppable: true
})
spellCore.append(foundations, it2)
const it3 = new Foundation({
  name: "hearts",
  symbol: "♥️",
  droppable: true
})
spellCore.append(foundations, it3)
const it4 = new Foundation({
  name: "spades",
  symbol: "♠️",
  droppable: true
})
spellCore.append(foundations, it4)
spellCore.map(foundations, (pile: any /* spell: type unknown */) => {
  spellCore.append(allPiles, pile)
})

/** set up tableau piles: vertical piles where we arrange from king to ace */
export class Tableau extends Pile {
  canGiveUp(card: any /* spell: type unknown */) {
    return card.isFaceUp
  }

  canTake(card: any /* spell: type unknown */) {
    if (spellCore.isEmpty(this)) return card.isARank("king")
    return this.color != card.color && this.value == card.value + 1
  }

  @drawn
  draw() {
    return (
      <div class="Pile Tableau staggered">
        <For each={this.items}>{(card) => card.draw()}</For>
      </div>
    )
  }
}
spellCore.map(spellCore.getRange(1, 7), (number: any /* spell: type unknown */) => {
  const it5 = new Tableau({ name: `T${number}`, droppable: true })
  spellCore.append(tableaus, it5)
  spellCore.append(allPiles, it5)
})

/** set up deck of cards */
export const deck = new Deck()
deck.setUp()
// start with cards in the stock pile
spellCore.map(deck, (card: any /* spell: type unknown */) => {
  spellCore.append(stock, card)
})

spellCore.heading("actions")
export function debugTheGame() {
  spellCore.map(game.state, (line: any /* spell: type unknown */) => {
    spellCore.console.log(line)
  })
}

export function resetTheStockPile() {
  const cards: any /* spell: type unknown */ = spellCore.duplicateCollection(discards, Pile)
  spellCore.reverse(cards)
  spellCore.map(cards, (card: any /* spell: type unknown */) => {
    spellCore.append(stock, card)
    card.turnFaceDown()
  })
}

export async function playFromTheStockPile() {
  if (spellCore.processIsRunning("play_from_the_stock_pile")) return
  spellCore.startProcess("play_from_the_stock_pile", "EXCLUSIVE")
  try {
    if (spellCore.isEmpty(stock)) await resetTheStockPile()

    const it5: any /* spell: type unknown */ = spellCore.getItemOf(stock, -1)
    it5.turnFaceUp()
    // pause for 150 msec
    spellCore.move(it5, discards)
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
    const cards: any /* spell: type unknown */ = spellCore.mergeCollections(allPiles, Pile)
    spellCore.reverse(cards)
    await spellCore.forEachSequential(cards, async (card: any /* spell: type unknown */) => {
      const startPile = card.pile
      card.turnFaceDown()
      if (startPile != stock) {
        spellCore.append(stock, card)
        await spellCore.pauseFor(50, "msec")
      }
    })
    spellCore.randomize(stock)

    // deal cards into tableaus
    await spellCore.forEachSequential(spellCore.getRange(1, 7), async (row: any /* spell: type unknown */) => {
      spellCore.getItemOf(stock, -1)!.turnFaceUp()
      await spellCore.forEachSequential(spellCore.getRange(row, 7), async (column: any /* spell: type unknown */) => {
        spellCore.append(spellCore.getItemOf(tableaus, column), spellCore.getItemOf(stock, -1))
        await spellCore.pauseFor(50, "msec")
      })
    })

    await playFromTheStockPile()
  }
  finally {
    spellCore.stopProcess("deal_the_cards")
  }
}

spellCore.RUNTIME.on("card-click", (event: any /* spell: type unknown */) => {
  const { card } = event
  card.play()
})

export async function autoPlay() {
  let anythingChanged: boolean = false
  if (!spellCore.isEmpty(discards)) {
    const testCard: any /* spell: type unknown */ = spellCore.getItemOf(discards, -1)
    if (await testCard.play()) {
      anythingChanged = true
      await spellCore.pauseFor(500, "msec")
    }
  }

  // attempt to move bottom card of tableaus to foundations
  await spellCore.forEachSequential(tableaus, async (pile: any /* spell: type unknown */) => {
    if (spellCore.isEmpty(pile)) return
    const testCard: any /* spell: type unknown */ = spellCore.getItemOf(pile, -1)
    const foundation: any /* spell: type unknown */ = spellCore.getItemOf(spellCore.filter(foundations, (pile: any /* spell: type unknown */) => pile.name == testCard.suit), 1)
    if (spellCore.canTake(foundation, testCard)) {
      anythingChanged = true
      await testCard.play()
      await spellCore.pauseFor(100, "msec")
    }
  })

  // attempt to move the entire pile of face-up cards
  await spellCore.forEachSequential(tableaus, async (pile: any /* spell: type unknown */) => {
    const faceUpCards: any /* spell: type unknown */ = spellCore.filter(pile, (card: any /* spell: type unknown */) => card.isFaceUp)
    if (spellCore.isEmpty(faceUpCards)) return
    const testCard: any /* spell: type unknown */ = spellCore.getItemOf(faceUpCards, 1)
    if (testCard.isARank("king") && testCard == spellCore.getItemOf(pile, 1)) return
    if (await testCard.play()) {
      anythingChanged = true
      await spellCore.pauseFor(500, "msec")
    }
  })

  // call auto-play again if anything actually changed
  if (anythingChanged) await autoPlay()
}

export function resetTheGame() {
  game.score = 0
  dealTheCards()
}

export async function cheat() {
  const remainingPiles: any /* spell: type unknown */ = spellCore.filter(tableaus, (pile: any /* spell: type unknown */) => !spellCore.isEmpty(pile) && spellCore.getItemOf(pile, 1)!.isFaceDown)
  if (spellCore.isEmpty(remainingPiles)) return
  const pile: any /* spell: type unknown */ = spellCore.randomItemOf(remainingPiles)
  const unplaidCards: any /* spell: type unknown */ = spellCore.filter(pile, (card: any /* spell: type unknown */) => card.isFaceDown)
  const card: any /* spell: type unknown */ = spellCore.randomItemOf(unplaidCards)
  card.turnFaceUp()
  await spellCore.pauseFor(30, "ticks")
  spellCore.move(card, discards)
}

spellCore.heading("rendering the bits")
resetTheGame()
game.start()
// -----------
spellCore.installStyles(undefined, `/* File styles.css */¬.Card {¬	position: relative;¬	height: 30px;¬}¬¬.Card .suit {¬	position: relative;¬	font-size: 1.5rem;¬	padding-left: 1px;¬	vertical-align: top;¬	top: -0.15rem;¬}¬¬.Pile {¬	position: relative;¬	min-height: 30px;¬}¬¬.Pile.Tableau {¬	min-height: 500px;¬}¬¬.Pile.stacked .Card {¬	position: absolute;¬	left: 0;¬	top: 0;¬}¬¬.Pile.staggered .Card {¬	margin-bottom: 8px !important;¬}¬¬.Pile > .Placeholder {¬	position: relative;¬	height: 30px;¬}¬¬.Pile > .Placeholder .suit {¬	position: relative;¬	font-size: 1.6rem;¬}¬¬.Pile > .Placeholder .suit.diamonds,¬.Pile > .Placeholder .suit.spades {¬	font-size: 1.75rem;¬	top: -0.1rem;¬}`)
