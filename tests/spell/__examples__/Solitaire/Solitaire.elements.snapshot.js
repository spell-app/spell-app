import { core, Thing, List, App, Drawable, DrawableList, h, positionOf, spellPosition, position, sendTrigger, sendCall } from "@spell/core"

///////////////////////////////////////////////////////////////////////////////
// ## A playing card -- in the outline style:  its name, then what's true of it
///////////////////////////////////////////////////////////////////////////////
/**
 * The card says what its suits, ranks and colors are:  a deck, a pile or a game only reads them.
 * A drawable thing:  each card is its own element on the page, e.g. `<cards-card>`.
 */
export class Card extends Drawable {
  static elementTag = core.defineElement(this, "test-project")

  /** card rank */
  // - its "rank" is one of ace, 2 ... 10, jack, queen, king
  static Ranks = ["ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king"]
  static { this.declareProp("rank", { oneOf: Card.Ranks }) }
  get rank() { return this.getProp("rank") }
  set rank(value) { this.setProp("rank", value) }

  /** ace = 1 ... king = 13 */
  get value() {
    return spellPosition(positionOf(Card.Ranks, this.rank))
  }

  /** "card is a king" */
  isARank(rank) {
    return this.rank === rank
  }

  /** "card is a face card" */
  get isAFaceCard() {
    return core.includes(["jack", "queen", "king"], this.rank)
  }

  /** "card is a number card" */
  get isANumberCard() {
    return !this.isAFaceCard
  }

  /** card suit */
  // - its "suit" is one of clubs, diamonds, hearts or spades
  static Suits = ["clubs", "diamonds", "hearts", "spades"]
  static { this.declareProp("suit", { oneOf: Card.Suits }) }
  get suit() { return this.getProp("suit") }
  set suit(value) { this.setProp("suit", value) }

  /** "card is a diamond" */
  isASuit(suit) {
    return this.suit === suit
  }

  get color() {
    if (core.includes(["diamonds", "hearts"], this.suit)) return "red"
    return "black"
  }

  /** specific cards */
  // "queen of spades"
  get name() {
    return `${this.rank} of ${this.suit}`
  }

  /** "card is the queen of spades" */
  isTheRankOfSuit(rank, suit) {
    return this.rank === rank && this.suit === suit
  }

  /** its direction:  face up or face down */
  // - its "direction" is up or down
  static Directions = ["up", "down"]
  static { this.declareProp("direction", { oneOf: Card.Directions }) }
  get direction() { return this.getProp("direction") }
  set direction(value) { this.setProp("direction", value) }

  /** card is face up */
  isFaceDirection(direction) {
    return this.direction === direction
  }

  ///////////////////////////
  // ## turning the card over
  ///////////////////////////
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
    if (this.isFaceDirection("up")) await this.turnFaceDown()
    else await this.turnFaceUp()
  }

  /**
   * Card picture:  drawn with special letters in the unicode character set
   * - SEE:  https://www.compart.com/en/unicode/block/U+1F0A0
   */
  get picture() {
    if (this.isFaceDirection("down")) {
      // "Playing Card Back"
      return "🂠"
    }

    let column = this.value
    if (this.isASuit("clubs")) return core.getItemAt(["🃑", "🃒", "🃓", "🃔", "🃕", "🃖", "🃗", "🃘", "🃙", "🃚", "🃛", "🃝", "🃞"], position(column))
    if (this.isASuit("diamonds")) return core.getItemAt(["🃁", "🃂", "🃃", "🃄", "🃅", "🃆", "🃇", "🃈", "🃉", "🃊", "🃋", "🃍", "🃎"], position(column))
    if (this.isASuit("hearts")) return core.getItemAt(["🂱", "🂲", "🂳", "🂴", "🂵", "🂶", "🂷", "🂸", "🂹", "🂺", "🂻", "🂽", "🂾"], position(column))
    if (this.isASuit("spades")) return core.getItemAt(["🂡", "🂢", "🂣", "🂤", "🂥", "🂦", "🂧", "🂨", "🂩", "🂪", "🂫", "🂭", "🂮"], position(column))
  }

  /////////////////////////////////////////////////////////////////////////
  // ## drawing:  its picture face up, the back every card shares face down
  /////////////////////////////////////////////////////////////////////////
  /** one letter, at the size of the text around it:  its pile scales it to fit -- styles.css */
  draw() {
    return h("ui-text", {
      part: "picture",
      color: () => this.isFaceDirection("up") ? this.color : "blue",
      onClick: () => sendTrigger("card-click", { card: this }),
      style: "cursor:pointer;user-select:none"
    }, () => this.picture)
  }

  get symbol() {
    if (this.isASuit("clubs")) return "♣"
    if (this.isASuit("diamonds")) return "♦"
    if (this.isASuit("hearts")) return "♥"
    if (this.isASuit("spades")) return "♠"
    return "?"

  }

  /** card "state", used for debugging */
  get state() {
    const rank = this.value === 10 ? 10 : `${core.getItemAt(this.rank, 0) ?? ""}`.toLocaleUpperCase()
    const suit = this.symbol
    const direction = this.isFaceDirection("up") ? "↑" : "↓"
    return rank + suit + direction
  }

  //////////////////////////////////////////////////
  // ## Playing a card:  what a click or a drag does
  //////////////////////////////////////////////////
  /**
   * the card, and every card on it, onto the first pile that can take it;  it says whether it moved
   * - the stock's card is turned over onto the discards instead
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

    const movingCards = startPile.startingWith(this)
    movingCards.name = startPile.name
    core.console.log(`moving (${movingCards.state}) to (${pile.state})`)

    movingCards.forEach((card) => core.move(card, pile))

    if (startPile instanceof Tableau && !startPile.isEmpty) {
      await core.pauseFor(200, "msec")
      const it = startPile.lastItem
      core.console.log(`turning over (${startPile.name}: ${it?.state})`)
      it?.turnFaceUp()
    }

    if (pile instanceof Foundation) solitaire.score = solitaire.score + 10
    else if (startPile === solitaire.discards) solitaire.score = solitaire.score + 5
    return true
  }

  get pile() {
    return Pile.ownerOf(this)
  }
}

/** A joker:  a wild card with no rank or suit -- there's a red one and a black one */
export class Joker extends Card {
  static elementTag = core.defineElement(this, "test-project")

  // - its "color" is one of red or black
  static Colors = ["red", "black"]
  static { this.declareProp("color", { oneOf: Joker.Colors }) }
  get color() { return this.getProp("color") }
  set color(value) { this.setProp("color", value) }

  /** "card is the red joker" */
  static isTheColorJoker(card, color) {
    return card instanceof Joker && card.color === color
  }

  get value() {
    if (Joker.isTheColorJoker(this, "red")) return 53
    return 54
  }

  get picture() {
    return "🃟"
  }

  get name() {
    return `${this.color} joker`
  }

  get state() {
    const color = `${core.getItemAt(this.color, 0) ?? ""}`.toLocaleUpperCase()
    const direction = this.isFaceDirection("up") ? "↑" : "↓"
    return `*${color}${direction}`
  }
}

/** Tests */
export function testCardSetup(...args) {
  return sendCall("test_card_setup", args)
}

export function testJokers(...args) {
  return sendCall("test_jokers", args)
}
// -----------
///////////////////////////////////////////////////////////////////////////////////////////////////////
// ## A deck:  the 52 cards of a US standard deck, ace of clubs first -- and its two jokers, if you ask
///////////////////////////////////////////////////////////////////////////////////////////////////////
/** It reads the card's own suits and ranks:  `card suits`, `card ranks`. */
export class Deck extends List {
  static instanceType = Card

  /** no jokers, unless it's made `with jokers` */
  // - its "jokers" is yes or no
  static { this.declareProp("jokers", { type: "choice" }) }
  get jokers() { return this.getProp("jokers") }
  set jokers(value) { this.setProp("jokers", value) }

  /** a new deck holds one of each card, ace of clubs first, then its two jokers, red then black */
  create() {
    Card.Ranks.forEach((rank) => Card.Suits.forEach((suit) => this.append(new Card({ rank: rank, suit: suit }))))
    if (this.jokers) {
      this.append(new Joker({ color: "red" }))
      this.append(new Joker({ color: "black" }))
    }
    this.forEach((card) => card.turnFaceDown())
  }

  /** echo its cards' short names, top to bottom */
  get state() {
    const cardNames = new List({ instanceType: "text" })
    this.forEach((card) => cardNames.append(card.state))
    return `deck: ${cardNames}`
  }
}

/** Tests */
export function testDeckCreation(...args) {
  return sendCall("test_deck_creation", args)
}

export function testDeckWithJokers(...args) {
  return sendCall("test_deck_with_jokers", args)
}
// -----------
//////////////////////////////////////////////////////////
// ## A pile of cards, e.g. a game's stock or its discards
//////////////////////////////////////////////////////////
/**
 * The game that uses these cards names its piles, and says what each kind of pile takes.
 * A drawable list:  its element holds its cards' elements, e.g. `<solitaire-pile>` around `<solitaire-card>`s.
 */
export class Pile extends DrawableList {
  static instanceType = Card
  static elementTag = core.defineElement(this, "test-project")

  /** what the game calls it, e.g. "stock" */
  // - its "name" is text
  static { this.declareProp("name", { type: "text" }) }
  get name() { return this.getProp("name") }
  set name(value) { this.setProp("name", value) }

  /** how its cards lie:  on top of each other, down a column, along a row, or fanned as a hand is held -- styles.css */
  // - its "layout" is one of stacked, vertical, horizontal or fanned
  static Layouts = ["stacked", "vertical", "horizontal", "fanned"]
  static { this.declareProp("layout", { oneOf: Pile.Layouts }) }
  get layout() { return this.getProp("layout") }
  set layout(value) { this.setProp("layout", value) }

  /** the color and value of its last card:  what the next card goes on */
  get color() {
    if (this.isEmpty) return "none"
    return this.lastItem.color
  }

  get value() {
    if (this.isEmpty) return 0
    return this.lastItem.value
  }

  /** pile state for debugging */
  get state() {
    let state = `${this.name || "pile"}:`
    this.forEach((card) => (state = `${state} ${card.state}`))
    return state
  }

  static exclusive = true
}

/** a card is in one pile at a time:  putting it on another pile takes it off this one */

/** Tests */
export function testPiles(...args) {
  return sendCall("test_piles", args)
}
// -----------
////////////////////////
// ## Klondike Solitaire
////////////////////////
//-- See [wikipedia](https://en.wikipedia.org/wiki/Klondike_(solitaire)) for its rules, and what each pile is called.
// The cards, the deck and the piles are this project's own:  Card, Deck and Pile.
// This file adds the game, its kinds of piles, what each may take or give up, and how each is laid out.
// What's where, top to bottom:
//   the solitaire:  its piles, its moves, auto play and drawing
//   playing a card:  what a click or a drag does
//   start
//   the piles:  each kind, what it may take or give up, and how it lies
//   tests

/** the stock:  the cards not played yet, face down;  a click turns the next one over */
export class StockPile extends Pile {
  static elementTag = core.defineElement(this, "test-project")

  get layout() {
    return "stacked"
  }

  /** a click turns its card over:  none can be taken from it, so none can be dragged */
  canTake(card) {
    return false
  }

  canGiveUp(card) {
    return false
  }

  // empty:  a light grey card, face down -- a click turns the discards back over
  drawItsPlaceholder() {
    return h("div", {
      part: "placeholder",
      onClick: () => sendCall("play_from_the_stock", [], solitaire),
      style: "cursor:pointer;user-select:none"
    }, "🂠")
  }
}

/** the discards:  where the stock's cards go as they're turned over */
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

/** a foundation:  where a suit is built up, ace to king */
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

  /** one card at a time:  the last of its pile */
  canTake(card) {
    if (card !== card.pile.lastItem) return false
    return this.suit === card.suit && this.value + 1 === card.value
  }

  // empty:  a light grey ace of its suit, face up
  drawItsPlaceholder() {
    return h("div", { part: "placeholder" },
      () => (new Card({
        rank: "ace",
        suit: this.suit,
        direction: "up"
      })).picture
    )
  }
}

/** a tableau:  a column, built down from king to ace, red and black in turn */
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

/** The solitaire:  its piles, its moves, auto play and drawing */
export class Solitaire extends App {
  // - its "score" is a number
  static { this.declareProp("score", { type: "number" }) }
  get score() { return this.getProp("score") }
  set score(value) { this.setProp("score", value) }

  // - its "deck" is a new deck
  static { this.declareProp("deck", { init: () => new Deck(), early: true }) }
  get deck() { return this.getProp("deck") }
  set deck(value) { this.setProp("deck", value) }

  /** one of each pile, made with the solitaire */
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

  /**
   * once, as the solitaire is made:  every card of the deck into the stock
   * - its deck and piles are made with it, before this runs
   * - inside the loop `it` is the card:  so the stock is `the stock of solitaire`
   */
  create() {
    this.deck.forEach((card) => this.stock.append(card))
  }

  /** print each pile's cards, e.g. "stock: Q♠↓ 7♥↓" */
  debug() {
    core.map(core.everyThing(Pile), (pile) => core.console.log(pile.state))
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
      this.discards.append(it)
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

  startANewGame() {
    this.score = 0
    this.dealTheCards()
  }

  /** turn up a face-down card from a tableau, at random, onto the discards */
  async cheat() {
    const remainingPiles = core.filter(core.everyThing(Tableau), (pile) => !pile.isEmpty && pile.firstItem?.isFaceDirection("down"))
    if (core.isEmpty(remainingPiles)) return
    const pile = core.randomItemOf(remainingPiles)
    const hiddenCards = pile?.filter((card) => card.isFaceDirection("down"))
    const card = hiddenCards?.randomItem()
    card?.turnFaceUp()
    await core.pauseFor(30, "ticks")
    this.discards.append(card)
  }

  /** play every card that can go somewhere, until none can */
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

  /**
   * its menu, then its piles:  seven to a line, each a cell of its own, the third left empty
   * - its buttons are icons, each with a tooltip:  the popup right after its icon shows as the pointer rests on it
   */
  draw() {
    return h("ui-container",
      h("ui-menu",
        h("ui-item", { type: "header" }, "Klondike Solitaire"),
        h("ui-item", () => `Score: ${this.score}`),
        h("ui-menu", { position: "right" },
          h("ui-item", {
            "aria-label": "Auto play",
            onClick: () => sendCall("auto_play", [], this),
            style: "cursor:pointer;user-select:none"
          },
            h("ui-icon", { name: "fast forward" }),
            h("ui-popup", { content: "Auto play", inverted: true, size: "small" })
          ),
          h("ui-item", {
            "aria-label": "Cheat",
            onClick: () => sendCall("cheat", [], this),
            style: "cursor:pointer;user-select:none"
          },
            h("ui-icon", { name: "eye" }),
            h("ui-popup", { content: "Cheat", inverted: true, size: "small" })
          ),
          h("ui-item", {
            "aria-label": "Restart",
            onClick: () => sendCall("start_a_new_game", [], this),
            style: "cursor:pointer;user-select:none"
          },
            h("ui-icon", { name: "redo" }),
            h("ui-popup", { content: "Restart", inverted: true, size: "small" })
          )
        )
      ),
      h("ui-grid", { class: "Board", columns: "7" },
        () => core.drawThing(this.stock),
        () => core.drawThing(this.discards),
        h("div"),
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
}
export let solitaire

/** a click plays the card;  a drag puts it where it's dropped */

//## Start

/////////////////////////////////////////////////////////////////////////
// ## The piles:  each kind, what it may take or give up, and how it lies
/////////////////////////////////////////////////////////////////////////
// Each pile is a drawable list:  an element of its own, e.g. `<solitaire-tableau>`, around its cards' elements.
// How its cards lie is its layout:  styles.css draws each one.
// While it's empty, it shows its placeholder, if it has one.

/** Tests */
export function testTheMoves(...args) {
  return sendCall("test_the_moves", args)
}
// -----------
core.installStyles(undefined, `/* File styles.css:  how the board looks -- each card, and how each pile lays its cards out.¬   - Every pile and card is an element of its own on the board, so these rules reach them all:¬     - a pile by its layout, e.g. <solitaire-tableau layout="vertical">¬     - each card in it by its place, --index from 0, and how many there are, --count:  the pile numbers them¬     - an empty pile's placeholder, which it draws itself, by its part:  ::part(placeholder)¬   - A card is one letter of unicode's Playing Cards, at its pile's width:¬     so a card is as wide as its column, whatever the window's width. */¬¬/* A card's picture, in ems of its own letter (measured in Chrome on a Mac):¬   0.604em wide, 0.805em tall, its left edge 0.049em into the letter. */¬:root,¬:host {¬  /* how wide a card is, for each em of its letter */¬  --card-width: 0.604;¬  /* how tall it is, for each of its widths:  0.805 / 0.604 */¬  --card-height: 1.333;¬  /* down a column, how much of each card shows under the next:  a fifth of it, its rank and suit */¬  --card-step-down: 0.2;¬  /* along a row, how much of each card the next one covers:  a tenth of it */¬  --card-overlap: 0.1;¬  /* fanned, how far each card turns from the one before */¬  --card-turn: 8deg;¬}¬¬/****************¬ * The board:  below the game's menu, its piles seven to a line¬ ****************/¬¬.Board {¬  /* gutters that shrink with a narrow window, so the cards keep most of its width */¬  --ui-grid-gutter: min(2rem, 2.5vw);¬  --ui-grid-row-spacing: min(2rem, 4vw);¬  /* 1.5rem below the menu:  the grid pulls itself up by half a row's spacing */¬  margin-top: calc(1.5rem + var(--ui-grid-row-spacing) / 2);¬}¬¬/* A narrow window, a phone's:  the menu loses its title, so the score and buttons fit on one line */¬@media (width < 36rem) {¬  ui-item[type="header"] {¬    display: none;¬  }¬}¬¬/****************¬ * A pile:  as wide as its cell of the board, and as tall as its cards¬ ****************/¬¬[layout] {¬  display: block;¬  position: relative;¬  /* its cards size themselves by its width */¬  container-type: inline-size;¬}¬/* its height:  a card's, by default -- a percentage of padding is one of its width */¬[layout]::before {¬  content: "";¬  display: block;¬  padding-top: calc(100% * var(--card-height));¬}¬¬/* Each card, and the placeholder:  a card's letter as wide as the pile, cut to the card it draws */¬[layout] > *,¬[layout]::part(placeholder) {¬  position: absolute;¬  top: 0;¬  left: 0;¬  font-size: calc(100cqi / var(--card-width));¬  width: calc(var(--card-width) * 1em);¬  height: calc(var(--card-width) * var(--card-height) * 1em);¬  overflow: hidden;¬  /* its letter's ink starts 0.224em below a line's top at a line height of 1:  a line of 0.552 starts it at the top */¬  line-height: 0.552;¬  --ui-text-line-height: 0.552;¬  text-indent: -0.049em;¬  user-select: none;¬}¬/* a card's letter is only its ink:  a white face, its corners rounded as the letter's are, hides the cards below */¬[layout] > * {¬  background: #fff;¬  border-radius: 0.035em;¬}¬¬/* An empty pile's placeholder:  a light grey card */¬[layout]::part(placeholder) {¬  color: #000;¬  opacity: 0.15;¬}¬[layout]::part(placeholder):hover {¬  opacity: 0.25;¬}¬¬/****************¬ * The layouts:  stacked puts every card on top of the one before¬ ****************/¬¬/* vertical:  each card a step below the one before */¬[layout="vertical"]::before {¬  padding-top: calc(100% * var(--card-height) * (1 + (max(var(--count, 1), 1) - 1) * var(--card-step-down)));¬}¬[layout="vertical"] > * {¬  top: calc(var(--index) * var(--card-width) * var(--card-height) * 1em * var(--card-step-down));¬}¬¬/* horizontal:  side by side, each covering the edge of the one before;  smaller as there are more, to fit the pile */¬[layout="horizontal"] {¬  --spread: calc(1 + (max(var(--count, 1), 1) - 1) * (1 - var(--card-overlap)));¬}¬[layout="horizontal"]::before {¬  padding-top: calc(100% * var(--card-height) / var(--spread));¬}¬[layout="horizontal"] > * {¬  font-size: calc(100cqi / var(--card-width) / var(--spread));¬  left: calc(var(--index) * var(--card-width) * 1em * (1 - var(--card-overlap)));¬}¬¬/* fanned:  as a hand of cards is held, each turned a little from the one before, around a point below them */¬[layout="fanned"] > * {¬  font-size: calc(60cqi / var(--card-width));¬  left: calc(50% - var(--card-width) * 0.5em);¬  top: 10%;¬  transform-origin: 50% 200%;¬  rotate: calc((var(--index) - (var(--count) - 1) / 2) * var(--card-turn));¬}¬`)
// -----------

/** Binds each thing the program keeps, from Python's state. */
export function adopt(state) {
  solitaire = state["solitaire"]
}

