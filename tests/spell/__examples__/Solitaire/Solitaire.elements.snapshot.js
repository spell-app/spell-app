import { core, Thing, List, App, Drawable, DrawableList, h, positionOf, spellPosition, position, sendTrigger, css, sendCall } from "@spell/core"

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

  /** drawing:  its picture face up, the back every card shares face down */
  draw() {
    return h("ui-text", {
      class: "Card",
      size: "massive",
      color: () => this.isFaceDirection("up") ? this.color : "blue",
      onClick: () => sendTrigger("card-click", { card: this })
    }, () => this.picture)
  }

  static css = css`
    /* a card is a card-sized box:  its size is the board's, --card-width x --card-height in styles.css */
    :host {
    	display: block;
    	position: relative;
    	width: var(--card-width);
    	height: var(--card-height);
    	overflow: hidden;
    	cursor: pointer;
    }
    /* its picture, a character of unicode's Playing Cards:  moved so the card it draws fills the box */
    ui-text::part(text) {
    	position: absolute;
    	left: -0.049em;
    	top: -0.222em;
    }
  `

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

    const endPile = core.filter(core.everyThing(Pile), (pile) => core.canTake(pile, this)).firstItem
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
//   playing a card:  what a click does
//   start
//   the piles:  each kind, what it may take or give up, and how it draws
//   tests

/** a stacked pile:  its cards on top of each other, the last one showing, over a place for the first */
export class StackedPile extends Pile {
  static elementTag = core.defineElement(this, "test-project")

  static css = css`
    :host {
    	display: block;
    	position: relative;
    	min-width: var(--card-width);
    	min-height: var(--card-height);
    }
    /* where its first card goes:  a card-sized outline */
    .Placeholder {
    	position: absolute;
    	top: 0;
    	left: 0;
    	width: var(--card-width);
    	height: var(--card-height);
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

/** the stock:  the cards not played yet, face down;  a click turns the next one over */
export class StockPile extends StackedPile {
  static elementTag = core.defineElement(this, "test-project")

  canTake(card) {
    return false
  }

  canGiveUp(card) {
    return card === this.lastItem
  }

  draw() {
    return h("div", { class: "Stock" },
      h("div", { class: "Placeholder", onClick: () => sendCall("play_from_the_stock", [], solitaire) }),
      h("slot")
    )
  }
}

/** the discards:  where the stock's cards go as they're turned over */
export class DiscardPile extends StackedPile {
  static elementTag = core.defineElement(this, "test-project")

  canTake(card) {
    return false
  }

  canGiveUp(card) {
    return card === this.lastItem
  }
}

/** a foundation:  where a suit is built up, ace to king */
export class Foundation extends StackedPile {
  static elementTag = core.defineElement(this, "test-project")

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

  draw() {
    return h("div", { class: "Foundation" },
      h("div", { class: "Placeholder" }, () => (new Card({ suit: this.suit })).symbol),
      h("slot")
    )
  }
}

/** a tableau:  a column, built down from king to ace, red and black in turn */
export class Tableau extends Pile {
  static elementTag = core.defineElement(this, "test-project")

  canGiveUp(card) {
    return card.isFaceDirection("up")
  }

  canTake(card) {
    if (this.isEmpty) return card.isARank("king")
    return this.color !== card.color && this.value === card.value + 1
  }

  static css = css`
    :host {
    	display: block;
    	min-height: 30rem;
    }
    /* each card below the one before, a strip of its top showing (--card-strip);  the last one whole */
    ::slotted(*) {
    	display: block;
    }
    ::slotted(:not(:last-child)) {
    	height: var(--card-strip);
    }
  `
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

  draw() {
    return h("ui-container",
      h("ui-menu",
        h("ui-item", { type: "header" }, "Klondike Solitaire"),
        h("ui-item", () => `Score: ${this.score}`),
        h("ui-menu", { position: "right" },
          h("ui-item", { onClick: () => sendCall("auto_play", [], this) }, "AutoPlay"),
          h("ui-item", { onClick: () => sendCall("cheat", [], this) }, "Cheat"),
          h("ui-item", { onClick: () => sendCall("debug", [], this) }, "Debug"),
          h("ui-item", { onClick: () => sendCall("start_a_new_game", [], this) }, "Restart")
        )
      ),
      h("ui-grid", { columns: "7" },
        h("ui-row",
          h("ui-column", () => core.drawThing(this.stock)),
          h("ui-column", () => core.drawThing(this.discards)),
          h("ui-column"),
          h("ui-column", () => core.drawThing(this.clubs)),
          h("ui-column", () => core.drawThing(this.diamonds)),
          h("ui-column", () => core.drawThing(this.hearts)),
          h("ui-column", () => core.drawThing(this.spades))
        ),
        h("ui-row",
          h("ui-column", () => core.drawThing(this.T1)),
          h("ui-column", () => core.drawThing(this.T2)),
          h("ui-column", () => core.drawThing(this.T3)),
          h("ui-column", () => core.drawThing(this.T4)),
          h("ui-column", () => core.drawThing(this.T5)),
          h("ui-column", () => core.drawThing(this.T6)),
          h("ui-column", () => core.drawThing(this.T7))
        )
      )
    )
  }
}
export let solitaire

//## Start

//////////////////////////////////////////////////////////////////////////
// ## The piles:  each kind, what it may take or give up, and how it draws
//////////////////////////////////////////////////////////////////////////
// Each pile is a drawable list:  an element of its own, e.g. `<solitaire-tableau>`, around its cards' elements.
// So each kind styles itself, in its `<css>`, and where its cards go:  styles.css can't reach inside it.

/** Tests */
export function testTheMoves(...args) {
  return sendCall("test_the_moves", args)
}
// -----------
core.installStyles(undefined, `/* File styles.css:  the board's own styles.¬   Each kind of pile styles itself, and where its cards go:  its <css>, in Solitaire.spell.¬   A pile is a drawable list, drawn in its own element's shadow root, which styles here can't reach. */¬¬/* The size of a card, which every card and pile reads:  custom properties reach inside their shadow roots.¬   - A card's picture, a character of unicode's Playing Cards, is 68 x 90px at the size the card draws it. */¬:root,¬:host {¬  --card-width: 4.25rem;¬  --card-height: 5.65rem;¬  /* how much of a card shows under the one on it, in a tableau */¬  --card-strip: 1.4rem;¬}¬¬/* Each column at least a card wide, and a little more:  a narrow board scrolls sideways, never squeezes them. */¬ui-row::part(row) {¬  flex-wrap: nowrap;¬}¬ui-column::part(column) {¬  min-width: calc(var(--card-width) + 1rem);¬}¬`)
// -----------

/** Binds each thing the program keeps, from Python's state. */
export function adopt(state) {
  solitaire = state["solitaire"]
}

