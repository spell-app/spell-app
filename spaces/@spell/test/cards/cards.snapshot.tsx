import { Show } from "solid-js"
import { core, Thing, List, App, Drawable, DrawableList, prop, derived, thing, drawn, positionOf, spellPosition, trigger } from "@spell/core"
import { E, SpellElement } from "@spell/elements"

core.heading("A playing card -- in the outline style:  its name, then what's true of it")
///////////////////////////////////////////////////////////////////////////////
// ## A playing card -- in the outline style:  its name, then what's true of it
///////////////////////////////////////////////////////////////////////////////
export type Direction = (typeof Card.Directions)[number]

/**
 * The card says what its suits, ranks and colors are:  a deck, a pile or a game only reads them.
 * A drawable thing:  each card is its own element on the page, e.g. `<cards-card>`.
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
 * A drawable list:  its element holds its cards' elements, e.g. `<cards-pile>` around `<cards-card>`s.
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
if (!core.isCarryingOver) testCardSetup()
if (!core.isCarryingOver) testJokers()
if (!core.isCarryingOver) testDeckCreation()
if (!core.isCarryingOver) testDeckWithJokers()
if (!core.isCarryingOver) testPiles()

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
    }
  }
}
