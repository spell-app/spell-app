import { Show } from "solid-js"
import { core, Thing, List, App, Drawable, DrawableList, prop, derived, thing, drawn, positionOf, spellPosition, trigger, css, position, on } from "@spell/core"
import { E, SpellElement } from "@spell/elements"

core.heading("A playing card -- in the outline style:  its name, then what's true of it")
///////////////////////////////////////////////////////////////////////////////
// ## A playing card -- in the outline style:  its name, then what's true of it
///////////////////////////////////////////////////////////////////////////////
export type Direction = (typeof Card.Directions)[number]

/**
 * The card says what its suits, ranks and colors are:  a deck, a pile or a game only reads them.
 * A drawable thing:  each card is its own element on the page, e.g. `<solitaire-card>`.
 */
export class Card extends Drawable {
  static elementTag = core.defineElement(this, "test-project")

  /** its suit and rank */
  // - its "suit" is a suit
  @prop({ oneOf: () => Card.Suits })
  accessor suit!: (typeof Card.Suits)[number]

  // - its "rank" is a rank
  @prop({ oneOf: () => Card.Ranks })
  accessor rank!: (typeof Card.Ranks)[number]

  get color() {
    return Suit.color(this.suit)
  }

  /** ace 1 ... king 13 */
  get value() {
    return spellPosition(positionOf(Card.Ranks, this.rank))
  }

  /** e.g. "the card is a spade" */
  isASuit(suit: (typeof Card.Suits)[number]) {
    return this.suit === suit
  }

  /** e.g. "the card is a queen" */
  isARank(rank: (typeof Card.Ranks)[number]) {
    return this.rank === rank
  }

  /** e.g. "the card is the queen of spades" */
  isTheRankOfSuits(rank: (typeof Card.Ranks)[number], suit: (typeof Card.Suits)[number]) {
    return this.rank === rank && this.suit === suit
  }

  get isAFaceCard() {
    return Rank.isAFaceCard(this.rank)
  }

  isTheColorJoker(color: Color) {
    return this instanceof Joker && this.color == color
  }

  /** its direction:  face up or face down */
  // - its "direction" is up or down
  static Directions = ["up", "down"] as const
  @prop({ oneOf: () => Card.Directions })
  accessor direction!: Direction

  get isFaceUp() {
    return this.direction == "up"
  }

  get isFaceDown() {
    return this.direction == "down"
  }

  /** its names */
  // e.g. "queen-of-spades"
  get name() {
    return `${this.rank}-of-${this.suit}`
  }

  get shortSuit() {
    return Suit.symbol(this.suit)
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
    return this.shortRank + this.shortSuit
  }

  get state() {
    return this.shortRank + this.shortSuit + this.shortDirection
  }

  //////////////////////////////////////////////////////////
  // ## its picture:  a character of unicode's Playing Cards
  //////////////////////////////////////////////////////////
  /**
   * SEE:  https://www.compart.com/en/unicode/block/U+1F0A0
   * The block is a grid:  a row for each suit, and in each row, a column for each rank.
   * - The rows start at 1F0A0 (spades), 1F0B0 (hearts), 1F0C0 (diamonds) and 1F0D0 (clubs).
   * - The columns run ace 1, 2 ... 10, jack B, then a knight our deck doesn't have, C, then queen D and king E.
   */
  get pictureColumn() {
    // past the knight
    if (this.isARank("queen") || this.isARank("king")) return this.value + 1
    return this.value
  }

  get picture() {
    if (this.isASuit("spades")) return core.unicode(0x1F0A0 + this.pictureColumn)
    if (this.isASuit("hearts")) return core.unicode(0x1F0B0 + this.pictureColumn)
    if (this.isASuit("diamonds")) return core.unicode(0x1F0C0 + this.pictureColumn)
    return core.unicode(0x1F0D0 + this.pictureColumn)
  }

  /** drawing:  its picture face up, the back every card shares face down */
  @drawn draw() {
    const click = () => trigger("card-click", { card: this })
    return (
      <Show
        when={this.isFaceDown}
        fallback={<ui-text class="Card" size="massive" prop:color={this.color} onClick={click}>{this.picture}</ui-text>}
      >
        <ui-text class="Card" size="massive" color="blue" onClick={click}>{"🂠"}</ui-text>
      </Show>
    )
  }

  /////////////////////
  // ## turning it over
  /////////////////////
  /** each pauses a moment, so `wait for: turn the card face up` animates */
  async turnFaceUp() {
    this.direction = "up"
    await core.pauseFor(50, "msec")
  }

  async turnFaceDown() {
    this.direction = "down"
    await core.pauseFor(50, "msec")
  }

  async turnOver() {
    if (this.isFaceUp) this.turnFaceDown()
    else this.turnFaceUp()
    await core.pauseFor(50, "msec")
  }

  ////////////////////////////////////////
  // ## Playing a card:  what a click does
  ////////////////////////////////////////
  /** the card, and every card on it, onto the first pile that can take it;  it says whether it moved */
  async play() {
    const startPile = this.pile
    if (!core.canGiveUp(startPile, this)) return false

    if (startPile === solitaire.stock) {
      solitaire.playFromTheStock()
      return
    }

    const endPile = core.filter(core.everyThing(Pile), (pile: Pile) => core.canTake(pile, this)).firstItem
    if (endPile === undefined) return false

    const movingCards = startPile.startingWith(this)
    movingCards.name = startPile.name
    core.console.log(`moving (${movingCards.state}) to (${endPile.state})`)

    movingCards.forEach((card) => core.move(card, endPile))

    if (startPile instanceof Tableau && !startPile.isEmpty) {
      await core.pauseFor(200, "msec")
      const it = startPile.lastItem
      core.console.log(`turning over (${startPile.name}: ${it?.state})`)
      it?.turnFaceUp()
    }

    if (endPile instanceof Foundation) solitaire.score = solitaire.score + 10
    else if (startPile === solitaire.discards) solitaire.score = solitaire.score + 5
    return true
  }

  // "suits" as one of clubs, diamonds, hearts or spades
  static Suits = ["clubs", "diamonds", "hearts", "spades"] as const

  // "ranks" as one of ace, 2 ... 10, jack, queen or king
  static Ranks = ["ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king"] as const

  // "colors" as one of red or black
  static Colors = ["red", "black"] as const

  get pile() {
    return Pile.ownerOf(this)!
  }
}

/**
 * `<test-project-card>`:  a card, drawn in its own element, e.g. by `draw the card`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its card's properties;  its methods call its card's.
 * - What every drawable thing's element does, e.g. drawing its card, is `SpellElement`'s.
 */
export class CardElement extends SpellElement<Card> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-card", "card", [
    { name: "suit", kind: "string", description: "Its suit." },
    { name: "rank", kind: "string", description: "Its rank." },
    { name: "direction", kind: "string", description: "Its direction." }
  ])

  isASuit(suit: (typeof Card.Suits)[number]) {
    return this.currentThing?.isASuit(suit)
  }

  isARank(rank: (typeof Card.Ranks)[number]) {
    return this.currentThing?.isARank(rank)
  }

  isTheRankOfSuits(rank: (typeof Card.Ranks)[number], suit: (typeof Card.Suits)[number]) {
    return this.currentThing?.isTheRankOfSuits(rank, suit)
  }

  isTheColorJoker(color: Color) {
    return this.currentThing?.isTheColorJoker(color)
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
core.useElement(Card, CardElement)

/** A joker:  a wild card with no rank or suit -- there's a red one and a black one */
export class Joker extends Card {
  static elementTag = core.defineElement(this, "test-project")

  /** set when it's made:  it has no suit to work its color out from */
  // - its "color" is a color
  static { this.declareProp("color", { oneOf: () => Card.Colors }) }
  get color(): (typeof Card.Colors)[number] { return this.getProp("color") as (typeof Card.Colors)[number] }
  set color(value: (typeof Card.Colors)[number]) { this.setProp("color", value) }

  /** e.g. "red-joker" */
  get name() {
    return `${this.color}-joker`
  }

  get shortName() {
    return "🃏"
  }

  get state() {
    return this.shortName + this.shortDirection
  }

  get picture() {
    if (this.color == "red") return "🂿"
    return "🃏"
  }
}

/**
 * `<test-project-joker>`:  a joker, drawn in its own element, e.g. by `draw the joker`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its joker's properties;  its methods call its joker's.
 * - What every drawable thing's element does, e.g. drawing its joker, is `SpellElement`'s.
 */
export class JokerElement extends SpellElement<Joker> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-joker", "joker", [
    { name: "color", kind: "string", description: "Its color." }
  ])
}
core.useElement(Joker, JokerElement)

/** suits, ranks and colors:  the card's own kinds of values */
export class Suit {
  static color(suit: (typeof Card.Suits)[number]) {
    if (core.includes(["diamonds", "hearts"], suit)) return "red"
    return "black"
  }

  static symbol(suit: (typeof Card.Suits)[number]) {
    if (suit == "clubs") return "♣️"
    if (suit == "diamonds") return "♦️"
    if (suit == "hearts") return "♥️"
    if (suit == "spades") return "♠️"
    return "?"
  }
}
export class Rank {
  static isAFaceCard(rank: (typeof Card.Ranks)[number]) {
    return core.includes(["jack", "queen", "king"], rank)
  }
}
export class Color {}

core.heading("Tests")
/** Tests */
export function testCardSetup() {
  return core.test("test card setup", function testCardSetup() {
    core.echoTestAction(`get a new card whose rank is queen, suit is spades and direction is up`)
    const it = new Card({
      rank: "queen",
      suit: "spades",
      direction: "up"
    })
    core.echo(it)
    core.expect(it.rank, `its rank`, "queen", `queen`)
    core.expect(it.suit, `its suit`, "spades", `spades`)
    core.expect(it.name, `its name`, "queen-of-spades", `"queen-of-spades"`)
    core.expect(it.color, `its color`, "black", `black`)
    core.expect(it.value, `its value`, 12, `12`)
    core.expect(it.shortSuit, `its short suit`, "♠️", `"♠️"`)
    core.expect(it.shortRank, `its short rank`, "Q", `"Q"`)
    core.expect(it.shortName, `its short name`, "Q♠️", `"Q♠️"`)
    core.expect(it.state, `its state`, "Q♠️+", `"Q♠️+"`)
    core.expect(it.picture, `its picture`, "🂭", `"🂭"`)

    core.expect(it.isFaceUp, `it is face up`, true, `yes`)
    core.expect(it.isFaceDown, `it is face down`, false, `no`)

    core.expect(it.isAFaceCard, `it is a face card`, true, `yes`)
    core.expect(!it.isAFaceCard, `it is not a face card`, false, `no`)

    core.expect(it.isASuit("spades"), `it is a spade`, true, `yes`)
    core.expect(it.isASuit("clubs"), `it is a club`, false, `no`)

    core.expect(it.isARank("queen"), `it is a queen`, true, `yes`)
    core.expect(it.isARank("ace"), `it is an ace`, false, `no`)
    core.expect(it.isARank(2), `it is a 2`, false, `no`)

    core.expect(it.isTheRankOfSuits("queen", "spades"), `it is the queen of spades`, true, `yes`)
    core.expect(it.isTheRankOfSuits("queen", "clubs"), `it is the queen of clubs`, false, `no`)
    core.expect(!it.isTheRankOfSuits(2, "diamonds"), `it is not the 2 of diamonds`, true, `yes`)

    core.echoTestAction(`turn it face down`)
    it.turnFaceDown()
    core.expect(it.direction, `its direction`, "down", `down`)
    core.expect(it.isFaceDown, `it is face down`, true, `yes`)

    core.echoTestAction(`turn it over`)
    it.turnOver()
    core.expect(it.isFaceUp, `it is face up`, true, `yes`)

    /** a number card:  its rank as it is, and its picture in the row of its suit */
    const seven = new Card({
      rank: 7,
      suit: "hearts",
      direction: "up"
    })
    core.expect(seven.shortName, `the short name of the seven`, "7♥️", `"7♥️"`)
    core.expect(seven.color, `the color of the seven`, "red", `red`)
    core.expect(seven.picture, `the picture of the seven`, "🂷", `"🂷"`)
    core.expect((new Card({ rank: "ace", suit: "clubs" })).picture, `the picture of a new card whose rank is ace and suit is clubs`, "🃑", `"🃑"`)
    core.expect((new Card({ rank: "king", suit: "diamonds" })).picture, `the picture of a new card whose rank is king and suit is diamonds`, "🃎", `"🃎"`)
  })
}

export function testJokers() {
  return core.test("test jokers", function testJokers() {
    core.echoTestAction(`get a new joker whose color is red and direction is up`)
    const it = new Joker({ color: "red", direction: "up" })
    core.echo(it)
    core.expect(it instanceof Joker, `it is a joker`, true, `yes`)
    core.expect(it instanceof Card, `it is a card`, true, `yes`)
    core.expect(it.color, `its color`, "red", `red`)
    core.expect(it.name, `its name`, "red-joker", `"red-joker"`)
    core.expect(it.shortName, `its short name`, "🃏", `"🃏"`)
    core.expect(it.picture, `its picture`, "🂿", `"🂿"`)
    core.expect(it.isTheColorJoker("red"), `it is the red joker`, true, `yes`)
    core.expect(it.isTheColorJoker("black"), `it is the black joker`, false, `no`)
    core.expect(!it.isTheColorJoker("black"), `it is not the black joker`, true, `yes`)

    core.expect(it.isFaceUp, `it is face up`, true, `yes`)
    core.echoTestAction(`turn it over`)
    it.turnOver()
    core.expect(it.isFaceDown, `it is face down`, true, `yes`)

    core.echoTestAction(`set black joker to a new joker whose color is black`)
    const blackJoker = new Joker({ color: "black" })
    core.expect(blackJoker.picture, `the picture of black joker`, "🃏", `"🃏"`)

    core.echoTestAction(`set the card to a new card whose rank is queen and suit is spades`)
    const card = new Card({ rank: "queen", suit: "spades" })
    core.expect(card instanceof Joker, `the card is a joker`, false, `no`)
    core.expect(!(card instanceof Joker), `the card is not a joker`, true, `yes`)
    core.expect(card.isTheColorJoker("red"), `the card is the red joker`, false, `no`)
  })
}
// -----------
core.heading("A deck:  the 52 cards of a US standard deck, ace of clubs first -- and its two jokers, if you ask")
///////////////////////////////////////////////////////////////////////////////////////////////////////
// ## A deck:  the 52 cards of a US standard deck, ace of clubs first -- and its two jokers, if you ask
///////////////////////////////////////////////////////////////////////////////////////////////////////
/** It reads the card's own suits and ranks:  `card suits`, `card ranks`. */
@thing
export class Deck extends List<Card> {
  static instanceType = Card

  /** no jokers, unless it's made `with jokers` */
  // - its "jokers" is yes or no
  @prop({ type: "choice" })
  accessor jokers!: boolean

  /** a new deck holds one of each card, ace of clubs first, then its two jokers, red then black */
  create() {
    Card.Ranks.forEach((rank) => Card.Suits.forEach((suit) => {
      // `the deck`, not `it`:  in a `for each`, `it` is the loop's item, here the suit
      this.append(new Card({ rank: rank, suit: suit }))
    }))
    if (this.jokers) {
      this.append(new Joker({ color: "red" }))
      this.append(new Joker({ color: "black" }))
    }
  }

  /** echo its cards' short names, top to bottom */
  display() {
    const cardNames = new List<string>({ instanceType: "text" })
    this.forEach((card) => cardNames.append(card.shortName))
    core.echo(`deck: ${cardNames}`)
  }
}

core.heading("Tests")
/** Tests */
export function testDeckCreation() {
  return core.test("test deck creation", function testDeckCreation() {
    core.echoTestAction(`the deck is a new deck`)
    const deck = new Deck()
    core.expect(deck.length, `the number of cards in the deck`, 52, `52`)
    core.echoTestAction(`set the queens to the cards in the deck where the rank of the card is queen`)
    const queens = deck.filter((card) => card.rank == "queen")
    core.expect(queens.length, `the number of cards in the queens`, 4, `4`)
    core.expect(deck.firstItem?.name!, `the name of the top card of the deck`, "ace-of-clubs", `"ace-of-clubs"`)
    core.expect(deck.lastItem?.name!, `the name of the bottom card of the deck`, "king-of-spades", `"king-of-spades"`)
    core.expect(deck.firstItem?.shortName!, `the short name of the top card of the deck`, "A♣️", `"A♣️"`)
    core.expect(deck.firstItem?.isTheRankOfSuits("ace", "clubs")!, `the first card of the deck is the ace of clubs`, true, `yes`)

    core.echo("the deck before shuffling:")
    core.echoTestAction(`display the deck`)
    deck.display()
    core.echoTestAction(`shuffle the deck`)
    deck.randomize()
    core.expect(deck.length, `the number of cards in the deck`, 52, `52`)
    core.echo("the deck after shuffling:")
    core.echoTestAction(`display the deck`)
    deck.display()
  })
}

export function testDeckWithJokers() {
  return core.test("test deck with jokers", function testDeckWithJokers() {
    core.echoTestAction(`the deck is a new deck with jokers`)
    const deck = new Deck({ jokers: true })
    core.expect(deck.length, `the number of cards in the deck`, 54, `54`)
    core.echoTestAction(`set wild cards to the cards in the deck where it is a joker`)
    const wildCards = deck.filter((card) => card instanceof Joker)
    core.expect(wildCards.length, `the number of cards in wild cards`, 2, `2`)
    core.expect(deck.firstItem?.isTheRankOfSuits("ace", "clubs")!, `the first card of the deck is the ace of clubs`, true, `yes`)
    // the red joker, then the black one, last
    core.expect(deck.lastItem?.isTheColorJoker("black")!, `the last card of the deck is the black joker`, true, `yes`)
    core.expect(deck.lastItem?.name!, `the name of the bottom card of the deck`, "black-joker", `"black-joker"`)
  })
}
// -----------
core.heading("A pile of cards, e.g. a game's stock or its discards")
//////////////////////////////////////////////////////////
// ## A pile of cards, e.g. a game's stock or its discards
//////////////////////////////////////////////////////////
/**
 * The game that uses these cards names its piles, and says what each kind of pile takes.
 * A drawable list:  its element holds its cards' elements, e.g. `<solitaire-pile>` around `<solitaire-card>`s.
 */
export class Pile extends DrawableList<Card> {
  static instanceType = Card
  static elementTag = core.defineElement(this, "test-project")

  /** what the game calls it, e.g. "stock" */
  // - its "name" is text
  @prop({ type: "text" })
  accessor name!: string

  /** the color and value of its last card:  what the next card goes on */
  get color() {
    if (this.isEmpty) return "none"
    return this.lastItem!.color
  }

  get value() {
    if (this.isEmpty) return 0
    return this.lastItem!.value
  }

  /** its name, then each card's state, e.g. "stock: Q♠️+ 7♥️—" */
  @derived get state() {
    let state = `${this.name || "pile"}:`
    this.forEach((card) => (state = `${state} ${card.state}`))
    return state
  }

  static exclusive = true
}
export interface Pile {
  canTake(card: Card): boolean
  canGiveUp(card: Card): boolean
}

/**
 * `<test-project-pile>`:  a pile, drawn in its own element, e.g. by `draw the pile`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its pile's properties;  its methods call its pile's.
 * - What every drawable thing's element does, e.g. drawing its pile, is `SpellElement`'s.
 */
export class PileElement extends SpellElement<Pile> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-pile", "pile", [
    { name: "name", kind: "string", description: "Its name." }
  ])
}
core.useElement(Pile, PileElement)

/** a card is in one pile at a time:  putting it on another pile takes it off this one */

core.heading("Tests")
/** Tests */
export function testPiles() {
  return core.test("test piles", function testPiles() {
    core.echoTestAction(`set the stock to a new pile with name = "stock"`)
    const stock = new Pile({ name: "stock" })
    core.echoTestAction(`set the discards to a new pile with name = "discards"`)
    const discards = new Pile({ name: "discards" })
    core.expect(stock.color, `the color of the stock`, "none", `"none"`)
    core.expect(stock.value, `the value of the stock`, 0, `0`)

    core.echoTestAction(`add (a new card whose rank is queen, suit is spades and direction is up) to the stock`)
    stock.append(new Card({
      rank: "queen",
      suit: "spades",
      direction: "up"
    }))
    core.echoTestAction(`add (a new card whose rank is 7, suit is hearts and direction is down) to the stock`)
    stock.append(new Card({
      rank: 7,
      suit: "hearts",
      direction: "down"
    }))
    core.expect(stock.color, `the color of the stock`, "red", `red`)
    core.expect(stock.value, `the value of the stock`, 7, `7`)
    core.expect(stock.state, `the state of the stock`, "stock: Q♠️+ 7♥️—", `"stock: Q♠️+ 7♥️—"`)

    /** a card is in one pile at a time */
    const card = stock.lastItem
    core.echoTestAction(`add the card to the discards`)
    discards.append(card!)
    core.expect(stock.length, `the number of cards in the stock`, 1, `1`)
    core.expect(card?.pile === discards, `the pile of the card is the discards`, true, `yes`)
    core.expect(discards.state, `the state of the discards`, "discards: 7♥️—", `"discards: 7♥️—"`)
  })
}
// -----------
core.heading("Klondike Solitaire")
////////////////////////
// ## Klondike Solitaire
////////////////////////
//-- See [wikipedia](https://en.wikipedia.org/wiki/Klondike_(solitaire)) for its rules, and what each pile is called.
// The cards, the deck and the piles are this project's own:  Card, Deck and Pile.
// This file adds the game, its kinds of piles, what each may take or give up, and how each is laid out.
// What's where, top to bottom:
//   the solitaire:  its piles, its moves, auto play and drawing
//   playing a card:  what a click does
//   start
//   the piles:  each kind, what it may take or give up, and how it draws
//   tests

core.heading("The solitaire:  its piles, its moves, auto play and drawing")
/** a stacked pile:  its cards on top of each other, the last one showing, over a place for the first */
export class StackedPile extends Pile {
  static elementTag = core.defineElement(this, "test-project")

  static css = css`
    :host {
    	display: block;
    	position: relative;
    	min-height: 6.5rem;
    }
    /* where its first card goes:  a card-sized outline */
    .Placeholder {
    	position: absolute;
    	top: 1.5rem;
    	left: 0.3rem;
    	width: 4.25rem;
    	height: 5.65rem;
    	box-sizing: border-box;
    	border: 2px dashed #c8c8c8;
    	border-radius: 0.4rem;
    	display: flex;
    	align-items: center;
    	justify-content: center;
    	font-size: 2rem;
    	cursor: pointer;
    }
    ::slotted(*) {
    	position: absolute;
    	top: 0;
    	left: 0;
    }
  `
}

/**
 * `<test-project-stacked-pile>`:  a stacked pile, drawn in its own element, e.g. by `draw the stacked pile`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its stacked pile's properties;  its methods call its stacked pile's.
 * - What every drawable thing's element does, e.g. drawing its stacked pile, is `SpellElement`'s.
 */
export class StackedPileElement extends SpellElement<StackedPile> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-stacked-pile", "stacked pile", [])
  @E.protoMerged static elementSetup = {
    styleSheets: { "test-project-stacked-pile": StackedPile.css }
  } satisfies Partial<E.ElementSetup>
}
core.useElement(StackedPile, StackedPileElement)

/** the stock:  the cards not played yet, face down;  a click turns the next one over */
export class StockPile extends StackedPile {
  static elementTag = core.defineElement(this, "test-project")

  canTake(card: Card) {
    return false
  }

  canGiveUp(card: Card) {
    return card === this.lastItem
  }

  @drawn draw() {
    return (
      <div class="Stock">
        <div class="Placeholder" onClick={() => solitaire.playFromTheStock()} />
        <slot />
      </div>
    )
  }
}

/**
 * `<test-project-stock-pile>`:  a stock pile, drawn in its own element, e.g. by `draw the stock pile`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its stock pile's properties;  its methods call its stock pile's.
 * - What every drawable thing's element does, e.g. drawing its stock pile, is `SpellElement`'s.
 */
export class StockPileElement extends SpellElement<StockPile> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-stock-pile", "stock pile", [])

  canTake(card: Card) {
    return this.currentThing?.canTake(card)
  }

  canGiveUp(card: Card) {
    return this.currentThing?.canGiveUp(card)
  }
}
core.useElement(StockPile, StockPileElement)

/** the discards:  where the stock's cards go as they're turned over */
export class DiscardPile extends StackedPile {
  static elementTag = core.defineElement(this, "test-project")

  canTake(card: Card) {
    return false
  }

  canGiveUp(card: Card) {
    return card === this.lastItem
  }
}

/**
 * `<test-project-discard-pile>`:  a discard pile, drawn in its own element, e.g. by `draw the discard pile`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its discard pile's properties;  its methods call its discard pile's.
 * - What every drawable thing's element does, e.g. drawing its discard pile, is `SpellElement`'s.
 */
export class DiscardPileElement extends SpellElement<DiscardPile> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-discard-pile", "discard pile", [])

  canTake(card: Card) {
    return this.currentThing?.canTake(card)
  }

  canGiveUp(card: Card) {
    return this.currentThing?.canGiveUp(card)
  }
}
core.useElement(DiscardPile, DiscardPileElement)

/** a foundation:  where a suit is built up, ace to king */
export class Foundation extends StackedPile {
  static elementTag = core.defineElement(this, "test-project")

  // - its "suit" is a suit
  @prop({ oneOf: () => Card.Suits })
  accessor suit!: (typeof Card.Suits)[number]

  canGiveUp(card: Card) {
    return false
  }

  /** one card at a time:  the last of its pile */
  canTake(card: Card) {
    if (card !== card.pile.lastItem) return false
    return this.suit === card.suit && this.value + 1 === card.value
  }

  @drawn draw() {
    return (
      <div class="Foundation">
        <div class="Placeholder">{Suit.symbol(this.suit)}</div>
        <slot />
      </div>
    )
  }
}

/**
 * `<test-project-foundation>`:  a foundation, drawn in its own element, e.g. by `draw the foundation`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its foundation's properties;  its methods call its foundation's.
 * - What every drawable thing's element does, e.g. drawing its foundation, is `SpellElement`'s.
 */
export class FoundationElement extends SpellElement<Foundation> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-foundation", "foundation", [
    { name: "suit", kind: "string", description: "Its suit." }
  ])

  canGiveUp(card: Card) {
    return this.currentThing?.canGiveUp(card)
  }

  canTake(card: Card) {
    return this.currentThing?.canTake(card)
  }
}
core.useElement(Foundation, FoundationElement)

/** a tableau:  a column, built down from king to ace, red and black in turn */
export class Tableau extends Pile {
  static elementTag = core.defineElement(this, "test-project")

  canGiveUp(card: Card) {
    return card.isFaceUp
  }

  canTake(card: Card) {
    if (this.isEmpty) return card.isARank("king")
    return this.color != card.color && this.value === card.value + 1
  }

  static css = css`
    :host {
    	display: block;
    	min-height: 30rem;
    }
    /* each card below the one before, its top showing;  the last one whole */
    ::slotted(*) {
    	display: block;
    }
    ::slotted(:not(:last-child)) {
    	height: 2.6rem;
    	overflow: hidden;
    }
  `
}

/**
 * `<test-project-tableau>`:  a tableau, drawn in its own element, e.g. by `draw the tableau`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
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
core.useElement(Tableau, TableauElement)

/** The solitaire:  its piles, its moves, auto play and drawing */
@thing
export class Solitaire extends App {
  // - its "score" is a number
  @prop({ type: "number" })
  accessor score!: number

  // - its "deck" is a new deck
  @prop({ init: () => new Deck(), early: true })
  accessor deck!: Deck

  /** one of each pile, made with the solitaire */
  // - its "stock" is a new stock pile with name = "stock"
  @prop({ init: () => new StockPile({ name: "stock" }), early: true })
  accessor stock!: StockPile

  // - its "discards" is a new discard pile with name = "discards"
  @prop({ init: () => new DiscardPile({ name: "discards" }), early: true })
  accessor discards!: DiscardPile

  // - its "clubs" is a new foundation with name = "clubs", suit = clubs
  @prop({ init: () => new Foundation({ name: "clubs", suit: "clubs" }), early: true })
  accessor clubs!: Foundation

  // - its "diamonds" is a new foundation with name = "diamonds", suit = diamonds
  @prop({ init: () => new Foundation({ name: "diamonds", suit: "diamonds" }), early: true })
  accessor diamonds!: Foundation

  // - its "hearts" is a new foundation with name = "hearts", suit = hearts
  @prop({ init: () => new Foundation({ name: "hearts", suit: "hearts" }), early: true })
  accessor hearts!: Foundation

  // - its "spades" is a new foundation with name = "spades", suit = spades
  @prop({ init: () => new Foundation({ name: "spades", suit: "spades" }), early: true })
  accessor spades!: Foundation

  // - its "T1" is a new tableau with name = "T1"
  @prop({ init: () => new Tableau({ name: "T1" }), early: true })
  accessor T1!: Tableau

  // - its "T2" is a new tableau with name = "T2"
  @prop({ init: () => new Tableau({ name: "T2" }), early: true })
  accessor T2!: Tableau

  // - its "T3" is a new tableau with name = "T3"
  @prop({ init: () => new Tableau({ name: "T3" }), early: true })
  accessor T3!: Tableau

  // - its "T4" is a new tableau with name = "T4"
  @prop({ init: () => new Tableau({ name: "T4" }), early: true })
  accessor T4!: Tableau

  // - its "T5" is a new tableau with name = "T5"
  @prop({ init: () => new Tableau({ name: "T5" }), early: true })
  accessor T5!: Tableau

  // - its "T6" is a new tableau with name = "T6"
  @prop({ init: () => new Tableau({ name: "T6" }), early: true })
  accessor T6!: Tableau

  // - its "T7" is a new tableau with name = "T7"
  @prop({ init: () => new Tableau({ name: "T7" }), early: true })
  accessor T7!: Tableau

  /**
   * once, as the solitaire is made:  every card of the deck into the stock
   * - its deck and piles are made with it, before this runs
   * - inside the loop `it` is the card:  so the stock is `the stock of solitaire`
   */
  create() {
    this.deck.forEach((card) => this.stock.append(card))
  }

  /** print each pile's cards, e.g. "stock: Q♠️— 7♥️—" */
  debug() {
    core.map(core.everyThing(Pile), (pile: Pile) => core.console.log(pile.state))
  }

  /** the discards, turned over, back into the stock */
  resetTheStock() {
    const cards = this.discards.clone()
    cards.reverse()
    cards.forEach((card) => {
      this.stock.append(card)
      card.turnFaceDown()
    })
  }

  /** turn the stock's next card over, onto the discards */
  async playFromTheStock() {
    if (core.processIsRunning("play_from_the_stock")) return
    core.startProcess("play_from_the_stock", "EXCLUSIVE")
    try {
      if (this.stock.isEmpty) await this.resetTheStock()

      const it = this.stock.lastItem
      it?.turnFaceUp()
      this.discards.append(it!)
    }
    finally {
      core.stopProcess("play_from_the_stock")
    }
  }

  /** gather every card of its deck into the stock, shuffle it, and deal the tableaus:  one card more in each, left to right */
  async dealTheCards() {
    if (core.processIsRunning("deal_the_cards")) return
    core.startProcess("deal_the_cards", "EXCLUSIVE")
    try {
      for (const card of this.deck) {
        const startPile = card.pile
        card.turnFaceDown()
        if (startPile !== this.stock) {
          this.stock.append(card)
          await core.pauseFor(50, "msec")
        }
      }
      this.stock.randomize()

      for (const row of core.getRange(1, 7)) {
        this.stock.lastItem?.turnFaceUp()
        for (const column of core.getRange(row, 7)) {
          core.getItemAt(core.everyThing(Tableau), position(column))?.append(this.stock.lastItem!)
          await core.pauseFor(50, "msec")
        }
      }

      await this.playFromTheStock()
    }
    finally {
      core.stopProcess("deal_the_cards")
    }
  }

  startANewGame() {
    this.score = 0
    this.dealTheCards()
  }

  /** turn up a face-down card from a tableau, at random, onto the discards */
  async cheat() {
    const remainingPiles = core.filter(core.everyThing(Tableau), (pile: Tableau) => !pile.isEmpty && pile.firstItem?.isFaceDown)
    if (core.isEmpty(remainingPiles)) return
    const pile = core.randomItemOf<Tableau>(remainingPiles)
    const hiddenCards = pile?.filter((card) => card.isFaceDown)
    const card = hiddenCards?.randomItem()
    card?.turnFaceUp()
    await core.pauseFor(30, "ticks")
    this.discards.append(card!)
  }

  /** play every card that can go somewhere, until none can */
  async autoPlay() {
    let anythingChanged: boolean = false
    if (!this.discards.isEmpty) {
      const testCard = this.discards.lastItem
      if (await testCard?.play()) {
        anythingChanged = true
        await core.pauseFor(500, "msec")
      }
    }

    // each tableau's last card onto its foundation
    await core.forEachSequential(core.everyThing(Tableau), async (pile: Tableau) => {
      if (pile.isEmpty) return
      const testCard = pile.lastItem!
      const foundation = core.filter(core.everyThing(Foundation), (pile: Foundation) => pile.suit == testCard.suit).firstItem
      if (core.canTake(foundation!, testCard)) {
        anythingChanged = true
        await testCard.play()
        await core.pauseFor(100, "msec")
      }
    })

    // each tableau's face-up cards, all together, onto another tableau
    await (core.forEachSequential(core.everyThing(Tableau), async (pile: Tableau) => {
      const faceUpCards = pile.filter((card) => card.isFaceUp)
      if (faceUpCards.isEmpty) return
      const testCard = faceUpCards.firstItem!
      if (testCard.isARank("king") && testCard === pile.firstItem) return
      if (await testCard.play()) {
        anythingChanged = true
        await core.pauseFor(500, "msec")
      }
    }))

    if (anythingChanged) await this.autoPlay()
  }

  @drawn draw() {
    return (
      <ui-container>
        <ui-menu>
          <ui-item type="header">Klondike Solitaire</ui-item>
          <ui-item>{`Score: ${this.score}`}</ui-item>
          <ui-menu position="right">
            <ui-item onClick={() => this.autoPlay()}>AutoPlay</ui-item>
            <ui-item onClick={() => this.cheat()}>Cheat</ui-item>
            <ui-item onClick={() => this.debug()}>Debug</ui-item>
            <ui-item onClick={() => this.startANewGame()}>Restart</ui-item>
          </ui-menu>
        </ui-menu>
        <ui-grid columns="7">
          <ui-row>
            <ui-column>{core.drawThing(this.stock)}</ui-column>
            <ui-column>{core.drawThing(this.discards)}</ui-column>
            <ui-column />
            <ui-column>{core.drawThing(this.clubs)}</ui-column>
            <ui-column>{core.drawThing(this.diamonds)}</ui-column>
            <ui-column>{core.drawThing(this.hearts)}</ui-column>
            <ui-column>{core.drawThing(this.spades)}</ui-column>
          </ui-row>
          <ui-row>
            <ui-column>{core.drawThing(this.T1)}</ui-column>
            <ui-column>{core.drawThing(this.T2)}</ui-column>
            <ui-column>{core.drawThing(this.T3)}</ui-column>
            <ui-column>{core.drawThing(this.T4)}</ui-column>
            <ui-column>{core.drawThing(this.T5)}</ui-column>
            <ui-column>{core.drawThing(this.T6)}</ui-column>
            <ui-column>{core.drawThing(this.T7)}</ui-column>
          </ui-row>
        </ui-grid>
      </ui-container>
    )
  }
}
export const solitaire = new Solitaire()

core.heading("Playing a card:  what a click does")
on<{ card: Card }>("card-click", ({ card }) => card.play())

core.heading("Start")
//## Start
core.console.log(solitaire)
solitaire.startANewGame()
if (!core.isCarryingOver) solitaire.start()

core.heading("The piles:  each kind, what it may take or give up, and how it draws")
//////////////////////////////////////////////////////////////////////////
// ## The piles:  each kind, what it may take or give up, and how it draws
//////////////////////////////////////////////////////////////////////////
// Each pile is a drawable list:  an element of its own, e.g. `<solitaire-tableau>`, around its cards' elements.
// So each kind styles itself, in its `<css>`, and where its cards go:  styles.css can't reach inside it.

core.heading("Tests")
/** Tests */
export function testTheMoves() {
  return core.test("test the moves", function testTheMoves() {
    core.echoTestAction(`set the column to a new tableau with name = "T1"`)
    let column = new Tableau({ name: "T1" })
    core.echoTestAction(`set the king to a new card whose rank is king, suit is spades and direction is up`)
    const king = new Card({
      rank: "king",
      suit: "spades",
      direction: "up"
    })
    core.echoTestAction(`set the queen to a new card whose rank is queen, suit is hearts and direction is up`)
    const queen = new Card({
      rank: "queen",
      suit: "hearts",
      direction: "up"
    })
    core.echoTestAction(`set the jack to a new card whose rank is jack, suit is clubs and direction is up`)
    const jack = new Card({
      rank: "jack",
      suit: "clubs",
      direction: "up"
    })
    // an empty tableau takes only a king, then one lower in the other color
    core.expect(core.canTake(column, queen), `the column can take the queen`, false, `no`)
    core.expect(core.canTake(column, king), `the column can take the king`, true, `yes`)
    core.echoTestAction(`add the king to the column`)
    column.append(king)
    core.expect(core.canTake(column, jack), `the column can take the jack`, false, `no`)
    core.expect(core.canTake(column, queen), `the column can take the queen`, true, `yes`)
    core.echoTestAction(`add the queen to the column`)
    column.append(queen)
    core.expect(column.state, `the state of the column`, "T1: K♠️+ Q♥️+", `"T1: K♠️+ Q♥️+"`)
    core.expect(core.canGiveUp(column, queen), `the column can give up the queen`, true, `yes`)
    core.echoTestAction(`turn the queen face down`)
    queen.turnFaceDown()
    core.expect(core.canGiveUp(column, queen), `the column can give up the queen`, false, `no`)

    /** a foundation takes its suit, ace first, then one higher:  each the last card of its pile */
    const foundation = new Foundation({ name: "hearts", suit: "hearts" })
    core.echoTestAction(`set the two to a new card whose rank is 2, suit is hearts and direction is up`)
    const two = new Card({
      rank: 2,
      suit: "hearts",
      direction: "up"
    })
    core.echoTestAction(`set the ace to a new card whose rank is ace, suit is hearts and direction is up`)
    const ace = new Card({
      rank: "ace",
      suit: "hearts",
      direction: "up"
    })
    core.echoTestAction(`set the column to a new tableau with name = "T2"`)
    column = new Tableau({ name: "T2" })
    core.echoTestAction(`add the two to the column`)
    column.append(two)
    core.echoTestAction(`add the ace to the column`)
    column.append(ace)
    core.expect(core.canTake(foundation, two), `the foundation can take the two`, false, `no`)
    core.expect(core.canTake(foundation, ace), `the foundation can take the ace`, true, `yes`)
    core.echoTestAction(`move the ace to the foundation`)
    core.move(ace, foundation)
    core.expect(core.canTake(foundation, two), `the foundation can take the two`, true, `yes`)
    core.echoTestAction(`add the queen to the column`)
    column.append(queen)
    core.expect(core.canTake(foundation, queen), `the foundation can take the queen`, false, `no`)
  })
}
// -----------
core.installStyles(undefined, `/* File styles.css:  the board's own styles.¬   Each kind of pile styles itself, and where its cards go:  its <css>, in Solitaire.spell.¬   A pile is a drawable list, drawn in its own element's shadow root, which styles here can't reach. */¬`)
// -----------
if (!core.isCarryingOver) testCardSetup()
if (!core.isCarryingOver) testJokers()
if (!core.isCarryingOver) testDeckCreation()
if (!core.isCarryingOver) testDeckWithJokers()
if (!core.isCarryingOver) testPiles()
if (!core.isCarryingOver) testTheMoves()

// each drawable type's tag, for the JSX
declare module "@solidjs/web/types/jsx.js" {
  namespace JSX {
    interface IntrinsicElements {
      /** `CardElement` */
      "test-project-card": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
      /** `JokerElement` */
      "test-project-joker": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
      /** `PileElement` */
      "test-project-pile": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
      /** `StackedPileElement` */
      "test-project-stacked-pile": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
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
