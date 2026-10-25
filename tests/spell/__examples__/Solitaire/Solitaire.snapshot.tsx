import { core, List, App, TwoSidedView, ViewableList, prop, derived, thing, drawn, positionOf, spellPosition, position } from "@spell/core"
import { E, SpellElement } from "@spell/elements"

core.heading("A playing card")
////////////////////
// ## A playing card
////////////////////
// A card says what its rank, suit and color are:  a deck, a pile or the game only reads them.
// It's a two sided view:  face up it shows its picture, face down the back every card shares.
// On the page each card is its own element, `<solitaire-card>`.

export type Rank = (typeof Card.Ranks)[number]
export type Suit = (typeof Card.Suits)[number]

export class Card extends TwoSidedView {
  static elementTag = core.defineElement(this, "test-project")

  // - its "rank" is one of ace, 2 ... 10, jack, queen, king
  //   - it "is a (rank)"
  static Ranks = ["ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king"] as const
  @prop({ oneOf: () => Card.Ranks })
  accessor rank!: Rank
  isARank(rank: Rank) {
    return this.rank === rank
  }

  get value() {
    return spellPosition(positionOf(Card.Ranks, this.rank))
  }

  get isAFaceCard() {
    return core.includes(["jack", "queen", "king"], this.rank)
  }

  get isANumberCard() {
    return !this.isAFaceCard
  }

  // - its "suit" is one of clubs, diamonds, hearts or spades
  //   - it "is a (suit)"
  static Suits = ["clubs", "diamonds", "hearts", "spades"] as const
  @prop({ oneOf: () => Card.Suits })
  accessor suit!: Suit
  isASuit(suit: Suit) {
    return this.suit === suit
  }

  // - its "color" is one of red, black :
  //   red if it is a diamond or it is a heart
  //   black otherwise
  static Colors = ["red", "black"]
  get color() {
    if (this.isASuit("diamonds") || this.isASuit("hearts")) return "red"
    return "black"
  }

  get symbol() {
    if (this.isASuit("clubs")) return "♣"
    if (this.isASuit("diamonds")) return "♦"
    if (this.isASuit("hearts")) return "♥"
    return "♠"
  }

  get name() {
    return `${this.rank} of ${this.suit}`
  }

  isTheRankOfSuit(rank: Rank, suit: Suit) {
    return this.rank === rank && this.suit === suit
  }

  /** Its short name:  Q♠↓ is the queen of spades, face down */
  get state() {
    const rank = this.value === 10 ? 10 : `${core.getItemAt(this.rank, 0) ?? ""}`.toLocaleUpperCase()
    const direction = this.isFaceDirection("up") ? "↑" : "↓"
    return rank + this.symbol + direction
  }

  /** A click plays it:  the game says where it goes */
  onClick(event: any /* spell: type unknown */) {
    return this.play()
  }

  /** Its face:  https://www.compart.com/en/unicode/block/U+1F0A0 */
  get picture() {
    let column = this.value
    if (this.isASuit("clubs")) return core.getItemAt(["🃑", "🃒", "🃓", "🃔", "🃕", "🃖", "🃗", "🃘", "🃙", "🃚", "🃛", "🃝", "🃞"], position(column))
    if (this.isASuit("diamonds")) return core.getItemAt(["🃁", "🃂", "🃃", "🃄", "🃅", "🃆", "🃇", "🃈", "🃉", "🃊", "🃋", "🃍", "🃎"], position(column))
    if (this.isASuit("hearts")) return core.getItemAt(["🂱", "🂲", "🂳", "🂴", "🂵", "🂶", "🂷", "🂸", "🂹", "🂺", "🂻", "🂽", "🂾"], position(column))
    return core.getItemAt(["🂡", "🂢", "🂣", "🂤", "🂥", "🂦", "🂧", "🂨", "🂩", "🂪", "🂫", "🂭", "🂮"], position(column))
  }

  drawFront() {
    return <ui-text color={this.color} part="front">{this.picture}</ui-text>
  }

  drawBack() {
    return <ui-text color="blue" part="back">🂠</ui-text>
  }

  ////////////////////
  // ## Playing a card
  ////////////////////
  // What a click or a drag does:  the card's own moves, and each pile's, as the game plays them.

  /**
   * the card, and every card on it, onto the first pile that takes it;  it says whether it moved
   * - the stock's card turns over onto the discards instead
   */
  play() {
    if (this.pile === solitaire.stock) {
      solitaire.playFromTheStock()
      return
    }
    const endPile = core.filter(core.everyThing(Pile), (pile: Pile) => core.canTake(pile, this)).firstItem
    if (endPile === undefined) return false
    return this.putOnPile(endPile)
  }

  /**
   * the card, and every card on it, onto the pile, if the piles' rules let it go and take it;  it says whether it moved
   * - the pile it left turns its new last card up, and the move scores
   */
  async putOnPile(pile: Pile) {
    const startPile = this.pile
    if (!core.canGiveUp(startPile, this)) return false
    if (!core.canTake(pile, this)) return false
    const points = this.countThePointsForCardOnPile(pile)
    startPile.startingWith(this).forEach((card) => core.move(card, pile))
    if (startPile instanceof Tableau && !startPile.isEmpty) {
      await core.pauseFor(200, "msec")
      startPile.lastItem?.turnFaceUp()
    }
    solitaire.score = solitaire.score + points
    return true
  }

  /** what the move scores:  10 on a foundation, 5 from the discards, else nothing */
  countThePointsForCardOnPile(pile: Pile) {
    if (pile instanceof Foundation) return 10
    if (this.pile === solitaire.discards) return 5
    return 0
  }

  static canBeDragged = true

  get pile() {
    return Pile.ownerOf(this)!
  }
}

/**
 * `<test-project-card>`:  a card, drawn in its own element, e.g. by `draw the card`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its card's properties;  its methods call its card's.
 * - What every view's element does, e.g. drawing its card, is `SpellElement`'s.
 */
export class CardElement extends SpellElement<Card> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-card", "card", [
    { name: "rank", kind: "string", description: "Its rank." },
    { name: "suit", kind: "string", description: "Its suit." }
  ])

  isARank(rank: Rank) {
    return this.currentThing?.isARank(rank)
  }

  isASuit(suit: Suit) {
    return this.currentThing?.isASuit(suit)
  }

  isTheRankOfSuit(rank: Rank, suit: Suit) {
    return this.currentThing?.isTheRankOfSuit(rank, suit)
  }

  onClick(event: any /* spell: type unknown */) {
    return this.currentThing?.onClick(event)
  }

  drawFront() {
    return this.currentThing?.drawFront()
  }

  drawBack() {
    return this.currentThing?.drawBack()
  }

  play() {
    return this.currentThing?.play()
  }

  putOnPile(pile: Pile) {
    return this.currentThing?.putOnPile(pile)
  }

  countThePointsForCardOnPile(pile: Pile) {
    return this.currentThing?.countThePointsForCardOnPile(pile)
  }
}
core.useElement(Card, CardElement)
// Ace is low:  ace = 1 ... king = 13

// What a person, a test or the console calls it

// A click plays it;  a drag puts it where it's dropped, if its pile's rules let it go

// One letter of unicode's Playing Cards, at the size of the text around it:  its pile scales it to fit -- styles.css

export function testCardSetup() {
  return core.test("test card setup", function testCardSetup() {
    const it = new Card()
    core.echoTestAction(`get a new card whose rank is queen, suit is spades and direction is down`)
    const it2 = new Card({
      rank: "queen",
      suit: "spades",
      direction: "down"
    })
    core.expect(it2.name, `its name`, "queen of spades", `"queen of spades"`)
    core.expect(it2.color, `its color`, "black", `black`)
    core.expect(it2.value, `its value`, 12, `12`)
    core.expect(it2.state, `its state`, "Q♠↓", `"Q♠↓"`)
    core.expect(it2.isAFaceCard, `it is a face card`, true, `yes`)
    core.expect(it2.isASuit("spades"), `it is a spade`, true, `yes`)
    core.expect(it2.isASuit("clubs"), `it is a club`, false, `no`)
    core.expect(it2.isARank("queen"), `it is a queen`, true, `yes`)
    core.expect(it2.isARank(2), `it is a 2`, false, `no`)
    core.expect(it2.isTheRankOfSuit("queen", "spades"), `it is the queen of spades`, true, `yes`)
    core.expect(it2.isTheRankOfSuit("queen", "clubs"), `it is the queen of clubs`, false, `no`)
    core.expect(it2.picture, `its picture`, "🂭", `"🂭"`)

    core.echoTestAction(`turn it over`)
    it2.turnOver()
    core.expect(it2.isFaceDirection("up"), `it is face up`, true, `yes`)
    core.expect(it2.state, `its state`, "Q♠↑", `"Q♠↑"`)

    core.echoTestAction(`set seven to a new card whose rank is 7 and suit is hearts`)
    const seven = new Card({ rank: 7, suit: "hearts" })
    core.expect(seven.isANumberCard, `seven is a number card`, true, `yes`)
    core.expect(seven.color, `the color of seven`, "red", `red`)
    core.expect(seven.picture, `the picture of seven`, "🂷", `"🂷"`)
    core.expect((new Card({ rank: "ace", suit: "clubs" })).picture, `the picture of a new card whose rank is ace and suit is clubs`, "🃑", `"🃑"`)
    core.expect((new Card({ rank: "king", suit: "diamonds" })).picture, `the picture of a new card whose rank is king and suit is diamonds`, "🃎", `"🃎"`)
  })
}
// -----------
core.heading("A deck")
////////////
// ## A deck
////////////
// The 52 cards of a standard deck, ace of clubs first.

@thing
export class Deck extends List<Card> {
  static instanceType = Card

  /** One of each card, ace of clubs first:  each starts face down, as every two sided view does */
  create() {
    Card.Ranks.forEach((rank: Rank) => Card.Suits.forEach((suit: Suit) => this.append(new Card({ rank: rank, suit: suit }))))
  }

  /** Its cards' short names, top to bottom */
  @derived get state() {
    const cardNames = new List<string>({ instanceType: "text" })
    this.forEach((card) => cardNames.append(card.state))
    return `deck: ${cardNames}`
  }
}

export function testANewDeck() {
  return core.test("test a new deck", function testANewDeck() {
    const it = new Deck()
    core.echoTestAction(`the deck is a new deck`)
    const deck = new Deck()
    core.expect(deck.length, `the number of cards in the deck`, 52, `52`)
    core.expect(deck.filter((card) => card.isARank("queen")).length, `the number of (cards in the deck where it is a queen)`, 4, `4`)
    core.expect(deck.firstItem?.state!, `the state of the first card of the deck`, "A♣↓", `"A♣↓"`)
    core.expect(deck.lastItem?.name!, `the name of the last card of the deck`, "king of spades", `"king of spades"`)
    core.echoTestAction(`shuffle the deck`)
    deck.randomize()
    core.expect(deck.length, `the number of cards in the deck`, 52, `52`)
  })
}
// -----------
core.heading("A pile of cards")
/////////////////////
// ## A pile of cards
/////////////////////
// A game's stock, its discards, a column on the table:  the game names its piles, and says what each kind takes.
// Each pile is its own element around its cards' elements, `<solitaire-tableau>` around `<solitaire-card>`s.

export type Layout = (typeof Pile.Layouts)[number]

export class Pile extends ViewableList<Card> {
  static instanceType = Card
  static elementTag = core.defineElement(this, "test-project")

  /** What the game calls it, e.g. stock */
  // - its "name" is text
  @prop({ type: "text" })
  accessor name!: string

  /** How its cards lie:  on top of each other, down a column, along a row, or fanned as a hand is held -- styles.css */
  // - its "layout" is one of stacked, vertical, horizontal or fanned
  static Layouts = ["stacked", "vertical", "horizontal", "fanned"] as const
  @prop({ oneOf: () => Pile.Layouts })
  accessor layout!: Layout

  /** Its last card's:  what the next card goes on */
  get color() {
    if (this.isEmpty) return "none"
    return this.lastItem!.color
  }

  /** Its last card's */
  get value() {
    if (this.isEmpty) return 0
    return this.lastItem!.value
  }

  /** Its name, then its cards' short names:  stock: Q♠↑ 7♥↓ */
  @derived get state() {
    let state = `${this.name || "pile"}:`
    this.forEach((card) => (state = `${state} ${card.state}`))
    return state
  }

  /** while a card it would take is over it, the score shows what the move would add -- gone as the card leaves */
  whileCardDraggedOver(card: Card) {
    const points = card.countThePointsForCardOnPile(this)
    if (core.canTake(this, card) && points > 0) solitaire.hint = ` (+${points})`
  }

  whenCardDroppedOn(card: Card) {
    card.putOnPile(this)
  }

  static canBeDroppedOn = true

  static exclusive = true
}
export interface Pile {
  canTake(card: Card): boolean
  canGiveUp(card: Card): boolean
  drawItsPlaceholder(): any /* spell: type unknown */
}

/**
 * `<test-project-pile>`:  a pile, drawn in its own element, e.g. by `draw the pile`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its pile's properties;  its methods call its pile's.
 * - What every view's element does, e.g. drawing its pile, is `SpellElement`'s.
 */
export class PileElement extends SpellElement<Pile> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-pile", "pile", [
    { name: "name", kind: "string", description: "Its name." },
    { name: "layout", kind: "string", description: "Its layout." }
  ])

  whileCardDraggedOver(card: Card) {
    return this.currentThing?.whileCardDraggedOver(card)
  }

  whenCardDroppedOn(card: Card) {
    return this.currentThing?.whenCardDroppedOn(card)
  }
}
core.useElement(Pile, PileElement)

// A card dragged over it glows when it would take the card, by its own rules

export function testPiles() {
  return core.test("test piles", function testPiles() {
    const it = new Pile()
    core.echoTestAction(`set the stock to a new pile with name = "stock"`)
    const stock = new Pile({ name: "stock" })
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
    core.expect(stock.state, `the state of the stock`, "stock: Q♠↑ 7♥↓", `"stock: Q♠↑ 7♥↓"`)

    /** a card is in one pile at a time */
    const discards = new Pile({ name: "discards" })
    core.echoTestAction(`get the last card of the stock`)
    const it2 = stock.lastItem
    core.echoTestAction(`add it to the discards`)
    discards.append(it2!)
    core.expect(it2?.pile === discards, `its pile is the discards`, true, `yes`)
    core.expect(stock.length, `the number of cards in the stock`, 1, `1`)
    core.expect(discards.state, `the state of the discards`, "discards: 7♥↓", `"discards: 7♥↓"`)
  })
}

/** a card is in one pile at a time:  putting it on another pile takes it off this one */
// -----------
core.heading("Klondike Solitaire")
////////////////////////
// ## Klondike Solitaire
////////////////////////
// Deal seven columns, then build four foundations, ace to king, one suit each:
// [wikipedia](https://en.wikipedia.org/wiki/Klondike_(solitaire)) has its rules, and what each pile is called.
// The cards, the deck and the piles are this project's own:  `Card`, `Deck` and `Pile`.

/** The cards not played yet, face down:  a click turns the next one over, so none can be taken from it */
export class StockPile extends Pile {
  static elementTag = core.defineElement(this, "test-project")

  get layout(): Layout {
    return "stacked"
  }

  canTake(card: Card) {
    return false
  }

  canGiveUp(card: Card) {
    return false
  }

  // A light grey card, face down:  a click turns the discards back over
  drawItsPlaceholder() {
    return (
      <ui-text part="placeholder" onClick={() => solitaire.playFromTheStock()} style="cursor:pointer;user-select:none">
        🂠
      </ui-text>
    )
  }
}

/**
 * `<test-project-stock-pile>`:  a stock pile, drawn in its own element, e.g. by `draw the stock pile`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its stock pile's properties;  its methods call its stock pile's.
 * - What every view's element does, e.g. drawing its stock pile, is `SpellElement`'s.
 */
export class StockPileElement extends SpellElement<StockPile> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-stock-pile", "stock pile", [])

  canTake(card: Card) {
    return this.currentThing?.canTake(card)
  }

  canGiveUp(card: Card) {
    return this.currentThing?.canGiveUp(card)
  }

  drawItsPlaceholder() {
    return this.currentThing?.drawItsPlaceholder()
  }
}
core.useElement(StockPile, StockPileElement)

/** Where the stock's cards go as they're turned over */
export class DiscardPile extends Pile {
  static elementTag = core.defineElement(this, "test-project")

  get layout(): Layout {
    return "stacked"
  }

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
 * - What every view's element does, e.g. drawing its discard pile, is `SpellElement`'s.
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

/** Where a suit is built up, ace to king, one card at a time */
export class Foundation extends Pile {
  static elementTag = core.defineElement(this, "test-project")

  get layout(): Layout {
    return "stacked"
  }

  // - its "suit" is a card suit
  @prop({ oneOf: () => Card.Suits })
  accessor suit!: Suit

  canGiveUp(card: Card) {
    return false
  }

  canTake(card: Card) {
    if (card !== card.pile.lastItem) return false
    return this.suit === card.suit && this.value + 1 === card.value
  }

  // A light grey ace of its suit, face up
  drawItsPlaceholder() {
    return <ui-text part="placeholder">{(new Card({ rank: "ace", suit: this.suit })).picture}</ui-text>
  }
}

/**
 * `<test-project-foundation>`:  a foundation, drawn in its own element, e.g. by `draw the foundation`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its foundation's properties;  its methods call its foundation's.
 * - What every view's element does, e.g. drawing its foundation, is `SpellElement`'s.
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

  drawItsPlaceholder() {
    return this.currentThing?.drawItsPlaceholder()
  }
}
core.useElement(Foundation, FoundationElement)

/** A column, built down from king to ace, red and black in turn */
export class Tableau extends Pile {
  static elementTag = core.defineElement(this, "test-project")

  get layout(): Layout {
    return "vertical"
  }

  canGiveUp(card: Card) {
    return card.isFaceDirection("up")
  }

  canTake(card: Card) {
    if (this.isEmpty) return card.isARank("king")
    return this.color !== card.color && this.value === card.value + 1
  }
}

/**
 * `<test-project-tableau>`:  a tableau, drawn in its own element, e.g. by `draw the tableau`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its tableau's properties;  its methods call its tableau's.
 * - What every view's element does, e.g. drawing its tableau, is `SpellElement`'s.
 */
export class TableauElement extends SpellElement<Tableau> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-tableau", "tableau", [])

  canGiveUp(card: Card) {
    return this.currentThing?.canGiveUp(card)
  }

  canTake(card: Card) {
    return this.currentThing?.canTake(card)
  }
}
core.useElement(Tableau, TableauElement)

@thing
export class Solitaire extends App {
  static elementTag = core.defineElement(this, "test-project", "App")

  // - its "score" is a number
  @prop({ type: "number" })
  accessor score!: number

  /** What the card being dragged would add to the score, e.g. (+10):  shown beside it */
  // - its "hint" is text
  @prop({ type: "text" })
  accessor hint!: string

  // - its "deck" is a new deck
  @prop({ init: () => new Deck(), early: true })
  accessor deck!: Deck

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

  /** Every card of its deck into the stock:  inside the loop `it` is the card, so the stock is the solitaire's */
  create() {
    this.deck.forEach((card) => this.stock.append(card))
  }

  /** The discards, turned over, back into the stock */
  resetTheStock() {
    const cards = this.discards.clone()
    cards.reverse()
    cards.forEach((card) => {
      this.stock.append(card)
      card.turnFaceDown()
    })
  }

  /** turn the stock's next card over, onto the discards:  the discards back into the stock when it's empty */
  async playFromTheStock() {
    if (core.processIsRunning("play_from_the_stock")) return
    core.startProcess("play_from_the_stock", "EXCLUSIVE")
    try {
      if (this.stock.isEmpty) await this.resetTheStock()
      const it = this.stock.lastItem
      it?.turnFaceUp()
      await core.pauseFor(50, "msec")
      this.discards.append(it!)
    }
    finally {
      core.stopProcess("play_from_the_stock")
    }
  }

  /** gather every card into the stock, shuffle it, and deal the tableaus:  one card more in each, left to right */
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

  /** Its menu, then its piles seven to a line, the third cell empty;  a right click on the board shows the game menu */
  @drawn draw() {
    return (
      <ui-container>
        <ui-menu>
          <ui-item kind="header">Klondike Solitaire</ui-item>
          <ui-item>Score: {this.score}{this.hint}</ui-item>
          <ui-menu position="right">
            <ui-item aria-label="Auto play" title="Auto play" onClick={() => this.autoPlay()} style="cursor:pointer;user-select:none">
              <ui-icon name="fast forward" />
            </ui-item>
            <ui-item aria-label="Cheat" title="Cheat" onClick={() => this.cheat()} style="cursor:pointer;user-select:none">
              <ui-icon name="eye" />
            </ui-item>
            <ui-item aria-label="Restart" title="Restart" onClick={() => this.startANewGame()} style="cursor:pointer;user-select:none">
              <ui-icon name="redo" />
            </ui-item>
          </ui-menu>
        </ui-menu>
        <ui-grid class="Board" columns="7" context-menu="game menu">
          {core.drawThing(this.stock)}
          {core.drawThing(this.discards)}
          <ui-column />
          {core.drawThing(this.clubs)}
          {core.drawThing(this.diamonds)}
          {core.drawThing(this.hearts)}
          {core.drawThing(this.spades)}
          {core.drawThing(this.T1)}
          {core.drawThing(this.T2)}
          {core.drawThing(this.T3)}
          {core.drawThing(this.T4)}
          {core.drawThing(this.T5)}
          {core.drawThing(this.T6)}
          {core.drawThing(this.T7)}
        </ui-grid>
      </ui-container>
    )
  }

  startANewGame() {
    this.score = 0
    this.hint = ""
    this.dealTheCards()
  }

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
      const foundation = core.filter(core.everyThing(Foundation), (pile: Foundation) => pile.suit === testCard.suit).firstItem
      if (core.canTake(foundation!, testCard)) {
        anythingChanged = true
        await testCard.play()
        await core.pauseFor(100, "msec")
      }
    })
    // each tableau's face-up cards, all together, onto another tableau
    await core.forEachSequential(core.everyThing(Tableau), async (pile: Tableau) => {
      const faceUpCards = pile.filter((card) => card.isFaceDirection("up"))
      if (faceUpCards.isEmpty) return
      const testCard = faceUpCards.firstItem!
      if (testCard.isARank("king") && testCard === pile.firstItem) return
      if (await testCard.play()) {
        anythingChanged = true
        await core.pauseFor(500, "msec")
      }
    })
    if (anythingChanged) await this.autoPlay()
  }

  async cheat() {
    const remainingPiles = core.filter(core.everyThing(Tableau), (pile: Tableau) => !pile.isEmpty && pile.firstItem?.isFaceDirection("down"))
    if (core.isEmpty(remainingPiles)) return
    const pile = core.randomItemOf<Tableau>(remainingPiles)
    const card = pile?.filter((card) => card.isFaceDirection("down"))?.randomItem()
    card?.turnFaceUp()
    await core.pauseFor(30, "ticks")
    this.discards.append(card!)
  }
}

/**
 * `<test-project-app>`:  a solitaire, drawn in its own element, e.g. by `draw the solitaire`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its solitaire's properties;  its methods call its solitaire's.
 * - What every view's element does, e.g. drawing its solitaire, is `SpellElement`'s.
 */
export class SolitaireElement extends SpellElement<Solitaire> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-app", "solitaire", [
    { name: "score", kind: "number", description: "Its score." },
    { name: "hint", kind: "string", description: "Its hint." },
    { name: "deck", kind: "json", description: "Its deck." },
    { name: "stock", kind: "json", description: "Its stock." },
    { name: "discards", kind: "json", description: "Its discards." },
    { name: "clubs", kind: "json", description: "Its clubs." },
    { name: "diamonds", kind: "json", description: "Its diamonds." },
    { name: "hearts", kind: "json", description: "Its hearts." },
    { name: "spades", kind: "json", description: "Its spades." },
    { name: "-t1", kind: "json", description: "Its T1." },
    { name: "-t2", kind: "json", description: "Its T2." },
    { name: "-t3", kind: "json", description: "Its T3." },
    { name: "-t4", kind: "json", description: "Its T4." },
    { name: "-t5", kind: "json", description: "Its T5." },
    { name: "-t6", kind: "json", description: "Its T6." },
    { name: "-t7", kind: "json", description: "Its T7." }
  ])

  create() {
    return this.currentThing?.create()
  }

  resetTheStock() {
    return this.currentThing?.resetTheStock()
  }

  playFromTheStock() {
    return this.currentThing?.playFromTheStock()
  }

  dealTheCards() {
    return this.currentThing?.dealTheCards()
  }

  startANewGame() {
    return this.currentThing?.startANewGame()
  }

  autoPlay() {
    return this.currentThing?.autoPlay()
  }

  cheat() {
    return this.currentThing?.cheat()
  }
}
core.useElement(Solitaire, SolitaireElement)
export const solitaire = new Solitaire()

// One of each, made with the solitaire

// Each pauses a moment, so a deal animates

// Its moves:  the menu's buttons, its keys, and the board's right click
core.describeAction(Solitaire, "startANewGame", { title: "start a new game", shortcuts: ["N"] })

/** Play every card that can go somewhere, until none can */
core.describeAction(Solitaire, "autoPlay", { title: "auto play", shortcuts: ["A"] })

/** Turn up a face-down card from a tableau, at random, onto the discards */
core.describeAction(Solitaire, "cheat", { title: "cheat", shortcuts: ["C"] })

// - its "game menu" is a menu of "start a new game" , "-" , "auto play" and "cheat"
core.describeMenu(Solitaire, "gameMenu", { items: ["startANewGame", "-", "autoPlay", "cheat"] })

core.heading("Playing a card")

core.heading("The piles")
///////////////
// ## The piles
///////////////
// Each kind of pile, what it may take or give up, and how it lies.
// While one's empty, it shows its placeholder, if it has one.

export function testTheMoves() {
  return core.test("test the moves", function testTheMoves() {
    const it = new Tableau()
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
    core.expect(column.state, `the state of the column`, "T1: K♠↑ Q♥↑", `"T1: K♠↑ Q♥↑"`)
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

solitaire.startANewGame()
if (!core.isCarryingOver) solitaire.start()
// -----------
core.installStyles(undefined, `/* File styles.css:  how the board looks -- each card, and how each pile lays its cards out.¬   - Every pile and card is an element of its own on the board, so these rules reach them all:¬     - a pile by its layout, e.g. <solitaire-tableau layout="vertical">¬     - each card in it by its place, --index from 0, and how many there are, --count:  the pile numbers them¬     - an empty pile's placeholder, which it draws itself, by its part:  ::part(placeholder)¬   - A card is one letter of unicode's Playing Cards, at its pile's width:¬     so a card is as wide as its column, whatever the window's width. */¬¬/* A card's picture, in ems of its own letter (measured in Chrome on a Mac):¬   0.604em wide, 0.805em tall, its left edge 0.049em into the letter;  its outline reaches a little past that, so a¬   card keeps 0.008em to spare above and below. */¬:root,¬:host {¬  /* how wide a card is, for each em of its letter */¬  --card-width: 0.604;¬  /* how tall it is, for each of its widths:  (0.805 + 2 x 0.008) / 0.604 */¬  --card-height: 1.359;¬  /* down a column, how much of each card shows under the next:  a fifth of it, its rank and suit */¬  --card-step-down: 0.2;¬  /* along a row, how much of each card the next one covers:  a tenth of it */¬  --card-overlap: 0.1;¬  /* fanned, how far each card turns from the one before */¬  --card-turn: 8deg;¬}¬¬/****************¬ * The board:  below the game's menu, its piles seven to a line¬ ****************/¬¬.Board {¬  /* gutters that shrink with a narrow window, so the cards keep most of its width */¬  --ui-grid-gutter: min(2rem, 2.5vw);¬  --ui-grid-row-spacing: min(2rem, 4vw);¬  /* 1.5rem below the menu:  the grid pulls itself up by half a row's spacing */¬  margin-top: calc(1.5rem + var(--ui-grid-row-spacing) / 2);¬}¬¬/* A narrow window, a phone's:  the menu loses its title, so the score and buttons fit on one line */¬@media (width < 36rem) {¬  ui-item[type="header"] {¬    display: none;¬  }¬}¬¬/****************¬ * A pile:  as wide as its cell of the board, and as tall as its cards¬ ****************/¬¬[layout] {¬  /* a box of its own, holding its floated sizer */¬  display: flow-root;¬  position: relative;¬  /* its cards size themselves by its width */¬  container-type: inline-size;¬  /* the glow when a dragged card would land here:  0.6em around its cards, inside the board's gutters */¬  --spell-drop-glow-inset: calc(var(--ui-grid-row-spacing) / 2 - 0.6em) calc(var(--ui-grid-gutter) / 2 - 0.6em);¬}¬/* its height:  a card's, by default -- a percentage of padding is one of its width */¬[layout]::before {¬  content: "";¬  /* floated, so its cards start at the top of its content, not below it */¬  float: left;¬  width: 100%;¬  padding-top: calc(100% * var(--card-height));¬}¬¬/* Each card, and the placeholder:  a card's letter as wide as the pile, cut to the card it draws */¬[layout] > *,¬[layout]::part(placeholder) {¬  position: absolute;¬  display: block;¬  /* where its pile's content starts, inside the cell's gutters:  its offsets in a layout are margins */¬  top: auto;¬  left: auto;¬  font-size: calc(100cqi / var(--card-width));¬  width: calc(var(--card-width) * 1em);¬  height: calc(var(--card-width) * var(--card-height) * 1em);¬  overflow: hidden;¬  /* in the font that draws the cards, so the page's font never moves them:  a line's height comes from its FIRST font,¬     and a theme's (Fruity's system font) set them 0.027em higher than Lato did, cutting off their tops */¬  font-family: "Apple Symbols", "Segoe UI Symbol", "Noto Sans Symbols 2", sans-serif;¬  /* the card's spare room above and below its ink (0.008em) padding, its white face only the content, so it hugs the ink¬     (not a border:  a browser rounds a border to whole pixels) */¬  box-sizing: border-box;¬  padding-block: 0.008em;¬  /* Apple Symbols rises 0.67em and drops 0.25em, its card's ink 0.666em above its baseline:¬     a line of 0.917 starts the ink at the top of the face (measured:  0.912 by the font's rounded numbers) */¬  line-height: 0.917;¬  --ui-text-line-height: 0.917;¬  text-indent: -0.049em;¬  user-select: none;¬}¬/* a card's letter is only its ink:  a white face, its corners rounded as the letter's are, hides the cards below */¬[layout] > * {¬  background: #fff;¬  background-clip: content-box;¬  border-radius: 0.035em;¬}¬¬/* An empty pile's placeholder:  a light grey card */¬[layout]::part(placeholder) {¬  color: #000;¬  opacity: 0.15;¬}¬[layout]::part(placeholder):hover {¬  opacity: 0.25;¬}¬¬/****************¬ * The layouts:  stacked puts every card on top of the one before¬ ****************/¬¬/* vertical:  each card a step below the one before */¬[layout="vertical"]::before {¬  padding-top: calc(100% * var(--card-height) * (1 + (max(var(--count, 1), 1) - 1) * var(--card-step-down)));¬}¬[layout="vertical"] > * {¬  margin-top: calc(var(--index) * var(--card-width) * var(--card-height) * 1em * var(--card-step-down));¬}¬¬/* horizontal:  side by side, each covering the edge of the one before;  smaller as there are more, to fit the pile */¬[layout="horizontal"] {¬  --spread: calc(1 + (max(var(--count, 1), 1) - 1) * (1 - var(--card-overlap)));¬}¬[layout="horizontal"]::before {¬  padding-top: calc(100% * var(--card-height) / var(--spread));¬}¬[layout="horizontal"] > * {¬  font-size: calc(100cqi / var(--card-width) / var(--spread));¬  margin-left: calc(var(--index) * var(--card-width) * 1em * (1 - var(--card-overlap)));¬}¬¬/* fanned:  as a hand of cards is held, each turned a little from the one before, around a point below them */¬[layout="fanned"] > * {¬  font-size: calc(60cqi / var(--card-width));¬  left: calc(50% - var(--card-width) * 0.5em);¬  margin-top: 10%;¬  transform-origin: 50% 200%;¬  rotate: calc((var(--index) - (var(--count) - 1) / 2) * var(--card-turn));¬}¬`)
// -----------
if (!core.isCarryingOver) testCardSetup()
if (!core.isCarryingOver) testANewDeck()
if (!core.isCarryingOver) testPiles()
if (!core.isCarryingOver) testTheMoves()

// each view type's tag, for the JSX
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
      /** `SolitaireElement` */
      "test-project-app": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
    }
  }
}
