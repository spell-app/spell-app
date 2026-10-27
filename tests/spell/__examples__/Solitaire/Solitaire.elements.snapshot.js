import { core, List, App, TwoSidedView, ViewableList, h, positionOf, spellPosition, position, sendCall } from "@spell/core"

////////////////////
// ## A playing card
////////////////////
// A card says what its rank, suit and color are:  a deck, a pile or the game only reads them.
// It's a two sided view:  face up it shows its picture, face down the back every card shares.
// On the page each card is its own element, `<solitaire-card>`.

export class Card extends TwoSidedView {
  static elementTag = core.defineElement(this, "test-project")

  // - its "rank" is one of ace, 2 ... 10, jack, queen, king
  //   - it "is a (rank)"
  static Ranks = ["ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king"]
  static { this.declareProp("rank", { oneOf: Card.Ranks }) }
  get rank() { return this.getProp("rank") }
  set rank(value) { this.setProp("rank", value) }
  isARank(rank) {
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
  static Suits = ["clubs", "diamonds", "hearts", "spades"]
  static { this.declareProp("suit", { oneOf: Card.Suits }) }
  get suit() { return this.getProp("suit") }
  set suit(value) { this.setProp("suit", value) }
  isASuit(suit) {
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

  isTheRankOfSuit(rank, suit) {
    return this.rank === rank && this.suit === suit
  }

  /** Its short name:  Q♠↓ is the queen of spades, face down */
  get state() {
    const rank = this.value === 10 ? 10 : `${core.getItemAt(this.rank, 0) ?? ""}`.toLocaleUpperCase()
    const direction = this.isFaceDirection("up") ? "↑" : "↓"
    return rank + this.symbol + direction
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
    return h("ui-text", { color: () => this.color, part: "front" }, () => this.picture)
  }

  drawBack() {
    return h("ui-text", { color: "blue", part: "back" }, "🂠")
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
    const endPile = core.filter(core.everyThing(Pile), (pile) => core.canTake(pile, this)).firstItem
    if (endPile === undefined) return false
    return this.putOnPile(endPile)
  }

  /**
   * the card, and every card on it, onto the pile, if the piles' rules let it go and take it;  it says whether it moved
   * - the pile it left turns its new last card up, and the move scores
   */
  async putOnPile(pile) {
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
  countThePointsForCardOnPile(pile) {
    if (pile instanceof Foundation) return 10
    if (this.pile === solitaire.discards) return 5
    return 0
  }

  /** a click plays it */
  onClick(event) {
    return this.play()
  }

  static canBeDragged = true

  get pile() {
    return Pile.ownerOf(this)
  }
}
// Ace is low:  ace = 1 ... king = 13

// What a person, a test or the console calls it

// A drag puts it where it's dropped, if its pile's rules let it go;  what a click does is the game's

// One letter of unicode's Playing Cards, at the size of the text around it:  its pile scales it to fit -- styles.css

export function testCardSetup(...args) {
  return sendCall("test_card_setup", args)
}
// -----------
////////////
// ## A deck
////////////
// The 52 cards of a standard deck, ace of clubs first.

export class Deck extends List {
  static instanceType = Card

  /** One of each card, ace of clubs first:  each starts face down, as every two sided view does */
  create() {
    Card.Ranks.forEach((rank) => Card.Suits.forEach((suit) => this.append(new Card({ rank: rank, suit: suit }))))
  }

  /** Its cards' short names, top to bottom */
  get state() {
    const cardNames = new List({ instanceType: "text" })
    this.forEach((card) => cardNames.append(card.state))
    return `deck: ${cardNames}`
  }
}

export function testANewDeck(...args) {
  return sendCall("test_a_new_deck", args)
}
// -----------
/////////////////////
// ## A pile of cards
/////////////////////
// A game's stock, its discards, a column on the table:  the game names its piles, and says what each kind takes.
// Each pile is its own element around its cards' elements, `<solitaire-tableau>` around `<solitaire-card>`s.

export class Pile extends ViewableList {
  static instanceType = Card
  static elementTag = core.defineElement(this, "test-project")

  /** What the game calls it, e.g. stock */
  // - its "name" is text
  static { this.declareProp("name", { type: "text" }) }
  get name() { return this.getProp("name") }
  set name(value) { this.setProp("name", value) }

  /** How its cards lie:  on top of each other, down a column, along a row, or fanned as a hand is held -- styles.css */
  // - its "layout" is one of stacked, vertical, horizontal or fanned
  static Layouts = ["stacked", "vertical", "horizontal", "fanned"]
  static { this.declareProp("layout", { oneOf: Pile.Layouts }) }
  get layout() { return this.getProp("layout") }
  set layout(value) { this.setProp("layout", value) }

  /** Its last card's:  what the next card goes on */
  get color() {
    if (this.isEmpty) return "none"
    return this.lastItem.color
  }

  /** Its last card's */
  get value() {
    if (this.isEmpty) return 0
    return this.lastItem.value
  }

  /** Its name, then its cards' short names:  stock: Q♠↑ 7♥↓ */
  get state() {
    let state = `${this.name || "pile"}:`
    this.forEach((card) => (state = `${state} ${card.state}`))
    return state
  }

  /** while a card it would take is over it, the score shows what the move would add -- gone as the card leaves */
  whileCardDraggedOver(card) {
    const points = card.countThePointsForCardOnPile(this)
    if (core.canTake(this, card) && points > 0) solitaire.hint = ` (+${points})`
  }

  whenCardDroppedOn(card) {
    card.putOnPile(this)
  }

  static canBeDroppedOn = true

  static exclusive = true
}

// A card dragged over it glows when it would take the card, by its own rules

export function testPiles(...args) {
  return sendCall("test_piles", args)
}

/** a card is in one pile at a time:  putting it on another pile takes it off this one */
// -----------
////////////////////////
// ## Klondike Solitaire
////////////////////////
// Deal seven columns, then build four foundations, ace to king, one suit each:
// [wikipedia](https://en.wikipedia.org/wiki/Klondike_(solitaire)) has its rules, and what each pile is called.
// The cards, the deck and the piles are this project's own:  `Card`, `Deck` and `Pile`.

/** The cards not played yet, face down:  a click turns the next one over, so none can be taken from it */
export class StockPile extends Pile {
  static elementTag = core.defineElement(this, "test-project")

  get layout() {
    return "stacked"
  }

  canTake(card) {
    return false
  }

  canGiveUp(card) {
    return false
  }

  // A light grey card, face down
  drawItsPlaceholder() {
    return h("ui-text", { part: "placeholder" }, "🂠")
  }

  /** Empty:  a click turns the discards back over;  a click on one of its cards is the card's */
  onClick(event) {
    solitaire.playFromTheStock()
  }
}

/** Where the stock's cards go as they're turned over */
export class DiscardPile extends Pile {
  static elementTag = core.defineElement(this, "test-project")

  get layout() {
    return "stacked"
  }

  canTake(card) {
    return false
  }

  canGiveUp(card) {
    return card === this.lastItem
  }
}

/** Where a suit is built up, ace to king, one card at a time */
export class Foundation extends Pile {
  static elementTag = core.defineElement(this, "test-project")

  get layout() {
    return "stacked"
  }

  // - its "suit" is a card suit
  static { this.declareProp("suit", { oneOf: () => Card.Suits }) }
  get suit() { return this.getProp("suit") }
  set suit(value) { this.setProp("suit", value) }

  canGiveUp(card) {
    return false
  }

  canTake(card) {
    if (card !== card.pile.lastItem) return false
    return this.suit === card.suit && this.value + 1 === card.value
  }

  // A light grey ace of its suit, face up
  drawItsPlaceholder() {
    return h("ui-text", { part: "placeholder" }, () => (new Card({ rank: "ace", suit: this.suit })).picture)
  }
}

/** A column, built down from king to ace, red and black in turn */
export class Tableau extends Pile {
  static elementTag = core.defineElement(this, "test-project")

  get layout() {
    return "vertical"
  }

  canGiveUp(card) {
    return card.isFaceDirection("up")
  }

  canTake(card) {
    if (this.isEmpty) return card.isARank("king")
    return this.color !== card.color && this.value === card.value + 1
  }
}

export class Solitaire extends App {
  static elementTag = core.defineElement(this, "test-project", "App")

  // - its "score" is a number
  static { this.declareProp("score", { type: "number" }) }
  get score() { return this.getProp("score") }
  set score(value) { this.setProp("score", value) }

  /** What the card being dragged would add to the score, e.g. (+10):  shown beside it */
  // - its "hint" is text
  static { this.declareProp("hint", { type: "text" }) }
  get hint() { return this.getProp("hint") }
  set hint(value) { this.setProp("hint", value) }

  // - its "deck" is a new deck
  static { this.declareProp("deck", { init: () => new Deck(), early: true }) }
  get deck() { return this.getProp("deck") }
  set deck(value) { this.setProp("deck", value) }

  // - its "stock" is a new stock pile with name = "stock"
  static { this.declareProp("stock", { init: () => new StockPile({ name: "stock" }), early: true }) }
  get stock() { return this.getProp("stock") }
  set stock(value) { this.setProp("stock", value) }

  // - its "discards" is a new discard pile with name = "discards"
  static { this.declareProp("discards", { init: () => new DiscardPile({ name: "discards" }), early: true }) }
  get discards() { return this.getProp("discards") }
  set discards(value) { this.setProp("discards", value) }

  // - its "clubs" is a new foundation with name = "clubs", suit = clubs
  static { this.declareProp("clubs", { init: () => new Foundation({ name: "clubs", suit: "clubs" }), early: true }) }
  get clubs() { return this.getProp("clubs") }
  set clubs(value) { this.setProp("clubs", value) }

  // - its "diamonds" is a new foundation with name = "diamonds", suit = diamonds
  static { this.declareProp("diamonds", { init: () => new Foundation({ name: "diamonds", suit: "diamonds" }), early: true }) }
  get diamonds() { return this.getProp("diamonds") }
  set diamonds(value) { this.setProp("diamonds", value) }

  // - its "hearts" is a new foundation with name = "hearts", suit = hearts
  static { this.declareProp("hearts", { init: () => new Foundation({ name: "hearts", suit: "hearts" }), early: true }) }
  get hearts() { return this.getProp("hearts") }
  set hearts(value) { this.setProp("hearts", value) }

  // - its "spades" is a new foundation with name = "spades", suit = spades
  static { this.declareProp("spades", { init: () => new Foundation({ name: "spades", suit: "spades" }), early: true }) }
  get spades() { return this.getProp("spades") }
  set spades(value) { this.setProp("spades", value) }

  // - its "T1" is a new tableau with name = "T1"
  static { this.declareProp("T1", { init: () => new Tableau({ name: "T1" }), early: true }) }
  get T1() { return this.getProp("T1") }
  set T1(value) { this.setProp("T1", value) }

  // - its "T2" is a new tableau with name = "T2"
  static { this.declareProp("T2", { init: () => new Tableau({ name: "T2" }), early: true }) }
  get T2() { return this.getProp("T2") }
  set T2(value) { this.setProp("T2", value) }

  // - its "T3" is a new tableau with name = "T3"
  static { this.declareProp("T3", { init: () => new Tableau({ name: "T3" }), early: true }) }
  get T3() { return this.getProp("T3") }
  set T3(value) { this.setProp("T3", value) }

  // - its "T4" is a new tableau with name = "T4"
  static { this.declareProp("T4", { init: () => new Tableau({ name: "T4" }), early: true }) }
  get T4() { return this.getProp("T4") }
  set T4(value) { this.setProp("T4", value) }

  // - its "T5" is a new tableau with name = "T5"
  static { this.declareProp("T5", { init: () => new Tableau({ name: "T5" }), early: true }) }
  get T5() { return this.getProp("T5") }
  set T5(value) { this.setProp("T5", value) }

  // - its "T6" is a new tableau with name = "T6"
  static { this.declareProp("T6", { init: () => new Tableau({ name: "T6" }), early: true }) }
  get T6() { return this.getProp("T6") }
  set T6(value) { this.setProp("T6", value) }

  // - its "T7" is a new tableau with name = "T7"
  static { this.declareProp("T7", { init: () => new Tableau({ name: "T7" }), early: true }) }
  get T7() { return this.getProp("T7") }
  set T7(value) { this.setProp("T7", value) }

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
      this.discards.append(it)
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
          core.getItemAt(core.everyThing(Tableau), position(column))?.append(this.stock.lastItem)
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
  draw() {
    return h("ui-container",
      h("ui-menu",
        h("ui-item", { kind: "header" }, "Klondike Solitaire"),
        h("ui-item", "Score: ", () => this.score, () => this.hint),
        h("ui-menu", { position: "right" },
          h("ui-item", {
            "aria-label": "Auto play",
            title: "Auto play",
            onClick: () => sendCall("auto_play", [], this),
            style: "cursor:pointer;user-select:none"
          }, h("ui-icon", { name: "fast forward" })),
          h("ui-item", {
            "aria-label": "Cheat",
            title: "Cheat",
            onClick: () => sendCall("cheat", [], this),
            style: "cursor:pointer;user-select:none"
          }, h("ui-icon", { name: "eye" })),
          h("ui-item", {
            "aria-label": "Restart",
            title: "Restart",
            onClick: () => sendCall("start_a_new_game", [], this),
            style: "cursor:pointer;user-select:none"
          }, h("ui-icon", { name: "redo" }))
        )
      ),
      h("ui-grid", { class: "Board", columns: "7", "context-menu": "game menu" },
        () => core.drawThing(this.stock),
        () => core.drawThing(this.discards),
        h("ui-column"),
        () => core.drawThing(this.clubs),
        () => core.drawThing(this.diamonds),
        () => core.drawThing(this.hearts),
        () => core.drawThing(this.spades),
        () => core.drawThing(this.T1),
        () => core.drawThing(this.T2),
        () => core.drawThing(this.T3),
        () => core.drawThing(this.T4),
        () => core.drawThing(this.T5),
        () => core.drawThing(this.T6),
        () => core.drawThing(this.T7)
      )
    )
  }

  startANewGame() {
    this.score = 0
    this.hint = ""
    this.dealTheCards()
  }

  async autoPlay() {
    let anythingChanged = false
    if (!this.discards.isEmpty) {
      const testCard = this.discards.lastItem
      if (await testCard?.play()) {
        anythingChanged = true
        await core.pauseFor(500, "msec")
      }
    }
    // each tableau's last card onto its foundation
    await core.forEachSequential(core.everyThing(Tableau), async (pile) => {
      if (pile.isEmpty) return
      const testCard = pile.lastItem
      const foundation = core.filter(core.everyThing(Foundation), (pile) => pile.suit === testCard.suit).firstItem
      if (core.canTake(foundation, testCard)) {
        anythingChanged = true
        await testCard.play()
        await core.pauseFor(100, "msec")
      }
    })
    // each tableau's face-up cards, all together, onto another tableau
    await core.forEachSequential(core.everyThing(Tableau), async (pile) => {
      const faceUpCards = pile.filter((card) => card.isFaceDirection("up"))
      if (faceUpCards.isEmpty) return
      const testCard = faceUpCards.firstItem
      if (testCard.isARank("king") && testCard === pile.firstItem) return
      if (await testCard.play()) {
        anythingChanged = true
        await core.pauseFor(500, "msec")
      }
    })
    if (anythingChanged) await this.autoPlay()
  }

  async cheat() {
    const remainingPiles = core.filter(core.everyThing(Tableau), (pile) => !pile.isEmpty && pile.firstItem?.isFaceDirection("down"))
    if (core.isEmpty(remainingPiles)) return
    const pile = core.randomItemOf(remainingPiles)
    const card = pile?.filter((card) => card.isFaceDirection("down"))?.randomItem()
    card?.turnFaceUp()
    await core.pauseFor(30, "ticks")
    this.discards.append(card)
  }
}
export let solitaire

// One of each, made with the solitaire

// Each pauses a moment, so a deal animates

// Its moves:  the menu's buttons, its keys, and the board's right click

/** Play every card that can go somewhere, until none can */

/** Turn up a face-down card from a tableau, at random, onto the discards */

///////////////
// ## The piles
///////////////
// Each kind of pile, what it may take or give up, and how it lies.
// While one's empty, it shows its placeholder, if it has one.

export function testTheMoves(...args) {
  return sendCall("test_the_moves", args)
}

// -----------
core.installStyles(undefined, `/* File styles.css:  how the board looks -- each card, and how each pile lays its cards out.¬   - Every pile and card is an element of its own on the board, so these rules reach them all:¬     - a pile by its layout, e.g. <solitaire-tableau layout="vertical">¬     - each card in it by its place, --index from 0, and how many there are, --count:  the pile numbers them¬     - an empty pile's placeholder, which it draws itself, by its part:  ::part(placeholder)¬   - A card is one letter of unicode's Playing Cards, at its pile's width:¬     so a card is as wide as its column, whatever the window's width. */¬¬/* A card's picture, in ems of its own letter (measured in Chrome on a Mac):¬   0.604em wide, 0.805em tall, its left edge 0.049em into the letter;  its outline reaches a little past that, so a¬   card keeps 0.008em to spare above and below. */¬:root,¬:host {¬  /* how wide a card is, for each em of its letter */¬  --card-width: 0.604;¬  /* how tall it is, for each of its widths:  (0.805 + 2 x 0.008) / 0.604 */¬  --card-height: 1.359;¬  /* down a column, how much of each card shows under the next:  a fifth of it, its rank and suit */¬  --card-step-down: 0.2;¬  /* along a row, how much of each card the next one covers:  a tenth of it */¬  --card-overlap: 0.1;¬  /* fanned, how far each card turns from the one before */¬  --card-turn: 8deg;¬}¬¬/****************¬ * The board:  below the game's menu, its piles seven to a line¬ ****************/¬¬.Board {¬  /* gutters that shrink with a narrow window, so the cards keep most of its width */¬  --ui-grid-gutter: min(2rem, 2.5vw);¬  --ui-grid-row-spacing: min(2rem, 4vw);¬  /* 1.5rem below the menu:  the grid pulls itself up by half a row's spacing */¬  margin-top: calc(1.5rem + var(--ui-grid-row-spacing) / 2);¬}¬¬/* A narrow window, a phone's:  the menu loses its title, so the score and buttons fit on one line */¬@media (width < 36rem) {¬  ui-item[kind="header"] {¬    display: none;¬  }¬}¬¬/****************¬ * A pile:  as wide as its cell of the board, and as tall as its cards¬ ****************/¬¬[layout] {¬  /* a box of its own, holding its floated sizer */¬  display: flow-root;¬  position: relative;¬  /* its cards size themselves by its width */¬  container-type: inline-size;¬  /* the glow when a dragged card would land here:  0.6em around its cards, inside the board's gutters */¬  --spell-drop-glow-inset: calc(var(--ui-grid-row-spacing) / 2 - 0.6em) calc(var(--ui-grid-gutter) / 2 - 0.6em);¬}¬/* its height:  a card's, by default -- a percentage of padding is one of its width */¬[layout]::before {¬  content: "";¬  /* floated, so its cards start at the top of its content, not below it */¬  float: left;¬  width: 100%;¬  padding-top: calc(100% * var(--card-height));¬}¬¬/* Each card, and the placeholder:  a card's letter as wide as the pile, cut to the card it draws */¬[layout] > *,¬[layout]::part(placeholder) {¬  position: absolute;¬  display: block;¬  /* where its pile's content starts, inside the cell's gutters:  its offsets in a layout are margins */¬  top: auto;¬  left: auto;¬  font-size: calc(100cqi / var(--card-width));¬  width: calc(var(--card-width) * 1em);¬  height: calc(var(--card-width) * var(--card-height) * 1em);¬  overflow: hidden;¬  /* in the font that draws the cards, so the page's font never moves them:  a line's height comes from its FIRST font,¬     and a theme's (Fruity's system font) set them 0.027em higher than Lato did, cutting off their tops */¬  font-family: "Apple Symbols", "Segoe UI Symbol", "Noto Sans Symbols 2", sans-serif;¬  /* the card's spare room above and below its ink (0.008em) padding, its white face only the content, so it hugs the ink¬     (not a border:  a browser rounds a border to whole pixels) */¬  box-sizing: border-box;¬  padding-block: 0.008em;¬  /* Apple Symbols rises 0.67em and drops 0.25em, its card's ink 0.666em above its baseline:¬     a line of 0.917 starts the ink at the top of the face (measured:  0.912 by the font's rounded numbers) */¬  line-height: 0.917;¬  --ui-text-line-height: 0.917;¬  text-indent: -0.049em;¬  user-select: none;¬}¬/* a card's letter is only its ink:  a white face, its corners rounded as the letter's are, hides the cards below */¬[layout] > * {¬  background: #fff;¬  background-clip: content-box;¬  border-radius: 0.035em;¬}¬¬/* An empty pile's placeholder:  a faint card in the page's text colour, so it shows on a dark page too */¬[layout]::part(placeholder) {¬  color: var(--ui-text-color, #000);¬  opacity: 0.15;¬}¬[layout]::part(placeholder):hover {¬  opacity: 0.25;¬}¬¬/****************¬ * The layouts:  stacked puts every card on top of the one before¬ ****************/¬¬/* vertical:  each card a step below the one before */¬[layout="vertical"]::before {¬  padding-top: calc(100% * var(--card-height) * (1 + (max(var(--count, 1), 1) - 1) * var(--card-step-down)));¬}¬[layout="vertical"] > * {¬  margin-top: calc(var(--index) * var(--card-width) * var(--card-height) * 1em * var(--card-step-down));¬}¬¬/* horizontal:  side by side, each covering the edge of the one before;  smaller as there are more, to fit the pile */¬[layout="horizontal"] {¬  --spread: calc(1 + (max(var(--count, 1), 1) - 1) * (1 - var(--card-overlap)));¬}¬[layout="horizontal"]::before {¬  padding-top: calc(100% * var(--card-height) / var(--spread));¬}¬[layout="horizontal"] > * {¬  font-size: calc(100cqi / var(--card-width) / var(--spread));¬  margin-left: calc(var(--index) * var(--card-width) * 1em * (1 - var(--card-overlap)));¬}¬¬/* fanned:  as a hand of cards is held, each turned a little from the one before, around a point below them */¬[layout="fanned"] > * {¬  font-size: calc(60cqi / var(--card-width));¬  left: calc(50% - var(--card-width) * 0.5em);¬  margin-top: 10%;¬  transform-origin: 50% 200%;¬  rotate: calc((var(--index) - (var(--count) - 1) / 2) * var(--card-turn));¬}¬`)
// -----------

/** Binds each thing the program keeps, from Python's state. */
export function adopt(state) {
  solitaire = state["solitaire"]
}

