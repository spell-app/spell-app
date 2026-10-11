import { spellCore, Thing, List, App, Drawable, DrawableList, h, positionOf, sendTrigger, sendCall } from "@spell/core"

///////////////////////////////////////////////////////////////////////////
// ## Deck:  US standard card deck (without jokers) -- in the outline style
///////////////////////////////////////////////////////////////////////////
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
    spellCore.echo(`deck: ${cardNames}`)
  }

  static Suits = ["clubs", "diamonds", "hearts", "spades"]

  static Ranks = ["ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king"]

  static { this.declareProp("isSetUp", { type: "choice" }) }
  get isSetUp() { return this.getProp("isSetUp") }
  set isSetUp(value) { this.setProp("isSetUp", value) }
}
export class Suit {
  static color(suit) {
    if (spellCore.includes(["diamonds", "hearts"], suit)) return "red"
    return "black"
  }
}
export class Rank {
  static isAFaceCard(rank) {
    return spellCore.includes(["jack", "queen", "king"], rank)
  }
}
// -----------
/** Definition of a card -- in the outline style:  a heading, then what's true of it */
export class Card extends Thing {
  /** suit and rank */
  static { this.declareProp("suit", { oneOf: () => Deck.Suits }) }
  get suit() { return this.getProp("suit") }
  set suit(value) { this.setProp("suit", value) }

  get color() {
    return Suit.color(this.suit)
  }

  /** e.g. "the card is a spade" */
  isASuit(suit) {
    return this.suit === suit
  }

  static { this.declareProp("rank", { oneOf: () => Deck.Ranks }) }
  get rank() { return this.getProp("rank") }
  set rank(value) { this.setProp("rank", value) }

  /** e.g. "the card is a queen" */
  isARank(rank) {
    return this.rank === rank
  }

  /** e.g. "the card is the queen of spades" */
  isTheRankOfSuits(rank, suit) {
    return this.rank === rank && this.suit === suit
  }

  get isAFaceCard() {
    return Rank.isAFaceCard(this.rank)
  }

  get value() {
    return positionOf(Deck.Ranks, this.rank)
  }

  /** direction */
  static Directions = ["up", "down"]
  static { this.declareProp("direction", { oneOf: Card.Directions }) }
  get direction() { return this.getProp("direction") }
  set direction(value) { this.setProp("direction", value) }

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
    return `${spellCore.getItemAt(this.rank, 1) ?? ""}`.toLocaleUpperCase()
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
  get front() {
    return h("div", {
      class: () => `Card face-up ${this.rank} ${this.suit} ui button compact fluid ${this.color}`,
      onClick: () => sendTrigger("card-click", { card: this })
    },
      () => `${this.shortRank} `,
      h("span", { class: "suit" }, () => this.icon)
    )
  }

  get back() {
    return h("div", {
      class: () => `Card face-down ${this.rank} ${this.suit} ui button compact fluid`,
      onClick: () => sendTrigger("card-click", { card: this })
    }, h("i", { class: "fitted bicycle icon" }))
  }
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
    return Pile.ownerOf(this)
  }
}

/** create a card instance with default properties */
export function testCardSetup(...args) {
  return sendCall("test_card_setup", args)
}
// -----------
export function testDeckCreation(...args) {
  return sendCall("test_deck_creation", args)
}
// -----------
/** Pile of playing cards */
export class Pile extends List {
  static instanceType = Card

  get color() {
    if (this.isEmpty) return "none"
    return this.lastItem?.color
  }

  get value() {
    if (this.isEmpty) return 0
    return this.lastItem?.value
  }

  get state() {
    let state = `${this.name || "pile"}:`
    this.forEach((card) => (state = `${state} ${card.state}`))
    return state
  }

  static exclusive = true

  get name() { return this.getProp("name") }
  set name(value) { this.setProp("name", value) }
}
/** a card is in one pile at a time:  putting it on another pile takes it off this one */
// -----------
//////////////////////////////////
// ## Klondike Solitaire Card Game
//////////////////////////////////
//-- See [wikipedia](https://en.wikipedia.org/wiki/Klondike_(solitaire)) for rules & naming conventions.

/** Game bits */
export class Game extends App {
  static { this.declareProp("score", { type: "number" }) }
  get score() { return this.getProp("score") }
  set score(value) { this.setProp("score", value) }

  //## actions

  get state() {
    let state = []
    allPiles.forEach((pile) => spellCore.append(state, pile.state))
    return state
  }

  draw() {
    return h("div", { class: "ui container" },
      h("div", { class: "board" },
        h("table", { class: "ui table fixed" },
          h("thead",
            h("tr",
              h("th", { class: "left aligned", colspan: "2" }, "Klondike Solitaire"),
              h("th", { class: "right aligned" }, () => `Score: ${this.score}`),
              h("th", h("div", { class: "tiny fluid ui button compact", onClick: () => autoPlay() }, "AutoPlay")),
              h("th", h("div", { class: "tiny fluid ui button compact", onClick: () => cheat() }, "Cheat")),
              h("th", h("div", { class: "tiny fluid ui button compact", onClick: () => debugTheGame() }, "Debug")),
              h("th", h("div", { class: "tiny fluid ui button compact", onClick: () => resetTheGame() }, "Restart"))
            )
          ),
          h("tbody",
            h("tr",
              h("td", () => spellCore.drawThing(stock)),
              h("td", () => spellCore.drawThing(discards)),
              h("td"),
              h("td", () => spellCore.drawThing(foundations.firstItem)),
              h("td", () => spellCore.drawThing(foundations.getItem(2))),
              h("td", () => spellCore.drawThing(foundations.getItem(3))),
              h("td", () => spellCore.drawThing(foundations.getItem(4)))
            ),
            h("tr",
              h("td", () => spellCore.drawThing(tableaus.firstItem)),
              h("td", () => spellCore.drawThing(tableaus.getItem(2))),
              h("td", () => spellCore.drawThing(tableaus.getItem(3))),
              h("td", () => spellCore.drawThing(tableaus.getItem(4))),
              h("td", () => spellCore.drawThing(tableaus.getItem(5))),
              h("td", () => spellCore.drawThing(tableaus.getItem(6))),
              h("td", () => spellCore.drawThing(tableaus.getItem(7)))
            )
          )
        )
      )
    )
  }
}
export let game

/** set up all piles */
export let allPiles
export let foundations
export let tableaus

/** set up stock pile: unplayed cards */
export class StockPile extends Pile {
  canGiveUp(card) {
    return card === this.lastItem
  }

  draw() {
    return h("div", { class: "Pile Stock stacked" },
      h("div", { class: "Placeholder ui button basic compact fluid", onClick: () => playFromTheStockPile() }),
      () => spellCore.drawThing(this.lastItem)
    )
  }
}
export let stock

/** set up discards: where played cards go when turning over stock */
export class DiscardPile extends Pile {
  canGiveUp(card) {
    return card === this.lastItem
  }

  draw() {
    return h("div", { class: "Pile Discards stacked" }, () => spellCore.drawThing(this.lastItem))
  }
}
export let discards

/** set up foundation piles: where we build up from ace => king */
export class Foundation extends Pile {
  canGiveUp(card) {
    return false
  }

  /** one card at a time:  the last of its pile */
  canTake(card) {
    if (card !== card.pile.lastItem) return false
    return this.name == card.suit && this.value + 1 === card.value
  }

  //##############
  //## rendering the bits

  // note: tableaus just draw as a (vertical) list of cards

  draw() {
    const color = this.name === "diamonds" || this.name === "hearts" ? "red" : "black"
    return h("div", { class: "Pile Foundation stacked" },
      h("div", { class: () => `Placeholder ui button basic compact fluid ${color} ${this.name}` },
        h("div", { class: () => `suit ${this.name}` }, () => this.symbol)
      ),
      () => spellCore.drawThing(this.lastItem)
    )
  }
}
export let it
export let it2
export let it3
export let it4

/** set up tableau piles: vertical piles where we arrange from king to ace */
export class Tableau extends Pile {
  canGiveUp(card) {
    return card.isFaceUp
  }

  canTake(card) {
    if (this.isEmpty) return card.isARank("king")
    return this.color != card.color && this.value === card.value + 1
  }

  draw() {
    return h("div", { class: "Pile Tableau staggered" }, () => spellCore.drawItems(this))
  }
}

/** set up deck of cards */
export let deck
// start with cards in the stock pile

export function debugTheGame(...args) {
  return sendCall("debug_the_game", args)
}

export function resetTheStockPile(...args) {
  return sendCall("reset_the_stock_pile", args)
}

export function playFromTheStockPile(...args) {
  return sendCall("play_from_the_stock_pile", args)
}

export function dealTheCards(...args) {
  return sendCall("deal_the_cards", args)
}

export function autoPlay(...args) {
  return sendCall("auto_play", args)
}

export function resetTheGame(...args) {
  return sendCall("reset_the_game", args)
}

export function cheat(...args) {
  return sendCall("cheat", args)
}

// -----------
spellCore.installStyles(undefined, `/* File styles.css */¬.Card {¬	position: relative;¬	height: 30px;¬}¬¬.Card .suit {¬	position: relative;¬	font-size: 1.5rem;¬	padding-left: 1px;¬	vertical-align: top;¬	top: -0.15rem;¬}¬¬.Pile {¬	position: relative;¬	min-height: 30px;¬}¬¬.Pile.Tableau {¬	min-height: 500px;¬}¬¬.Pile.stacked .Card {¬	position: absolute;¬	left: 0;¬	top: 0;¬}¬¬.Pile.staggered .Card {¬	margin-bottom: 8px !important;¬}¬¬.Pile > .Placeholder {¬	position: relative;¬	height: 30px;¬}¬¬.Pile > .Placeholder .suit {¬	position: relative;¬	font-size: 1.6rem;¬}¬¬.Pile > .Placeholder .suit.diamonds,¬.Pile > .Placeholder .suit.spades {¬	font-size: 1.75rem;¬	top: -0.1rem;¬}`)

/** Binds each thing the program keeps, from Python's state. */
export function adopt(state) {
  game = state["game"]
  allPiles = state["all_piles"]
  foundations = state["foundations"]
  tableaus = state["tableaus"]
  stock = state["stock"]
  discards = state["discards"]
  it = state["it"]
  it2 = state["it_2"]
  it3 = state["it_3"]
  it4 = state["it_4"]
  deck = state["deck"]
}

