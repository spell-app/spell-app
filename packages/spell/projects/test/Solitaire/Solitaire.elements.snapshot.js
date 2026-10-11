import { spellCore, Thing, List, App, Drawable, DrawableList, h, positionOf, spellPosition, sendTrigger, sendCall } from "@spell/core"

/** definition of a Card with nice english aliases for working with it */
export class Card extends Thing {
  /////////////////////////
  // ## properties of cards
  /////////////////////////
  /** card ranks */
  static Ranks = ["ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king"]
  static { this.declareProp("rank", { oneOf: Card.Ranks }) }
  get rank() { return this.getProp("rank") }
  set rank(value) { this.setProp("rank", value) }

  /** card suits */
  static Suits = ["clubs", "diamonds", "hearts", "spades"]
  static { this.declareProp("suit", { oneOf: Card.Suits }) }
  get suit() { return this.getProp("suit") }
  set suit(value) { this.setProp("suit", value) }

  /** color as derivation of suit */
  get color() {
    if (spellCore.includes(["diamonds", "hearts"], this.suit)) return "red"
    return "black"
  }

  /** value as a derivation of rank */
  get value() {
    return spellPosition(positionOf(Card.Ranks, this.rank))
  }

  /** card direction:  up or down */
  static Directions = ["up", "down"]
  static { this.declareProp("direction", { oneOf: Card.Directions }) }
  get direction() { return this.getProp("direction") }
  set direction(value) { this.setProp("direction", value) }

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
  isASuit(suit) {
    return this.suit === suit
  }

  /** "card is a queen", "...is an ace" etc */
  isARank(rank) {
    return this.rank === rank
  }

  /** "card is the queen of spades" etc */
  isTheRankOfSuits(rank, suit) {
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

  draw() {
    const className = `Card face-${this.direction} ${this.rank} ${this.suit} ui button compact fluid `
    if (this.isFaceDown) {
      return h("div", { class: () => className, onClick: () => sendTrigger("card-click", { card: this }) },
        h("i", { class: "fitted bicycle icon" })
      )
    }
    return h("div", { class: () => className + this.color, onClick: () => sendTrigger("card-click", { card: this }) },
      () => `${this.shortRank} `,
      h("span", { class: "suit" }, () => this.shortSuit)
    )
  }

  /**
   * "move" a card
   * NOTE: use this rather than `add` to make sure card is only in one pile at a time
   * if you `wait for: move the card to the pile` the move will be animated
   */
  async moveToPile(pile) {
    if (this.pile !== undefined) this.pile.remove(this)
    this.pile = pile
    pile.append(this)
    await spellCore.pauseFor(50, "msec")
  }

  async play() {
    const startPile = this.pile
    if (!startPile.canPickUpCard(this)) return false

    if (startPile === stock) {
      playFromTheStockPile()
      return
    }

    const droppablePiles = allPiles.filter((pile) => pile.droppable && pile.canPlayCard(this))
    const endPile = droppablePiles.firstItem
    if (endPile === undefined) return false

    const cardsToMove = startPile.startingWith(this)
    cardsToMove.name = startPile.name
    spellCore.console.log(`moving (${cardsToMove.state}) to (${endPile.state})`)

    cardsToMove.forEach((card) => card.moveToPile(endPile))

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

  static { this.declareProp("pile", { type: "Pile" }) }
  get pile() { return this.getProp("pile") }
  set pile(value) { this.setProp("pile", value) }
}

/** create a card instance with default properties */
export function testCardSetup(...args) {
  return sendCall("test_card_setup", args)
}
// -----------
//## Deck:   US standard card deck (without jokers currently)

export class Deck extends List {
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
    const cardNames = new List()
    this.forEach((card) => cardNames.append(card.shortName))
    spellCore.echo(`deck: ${cardNames}`)
  }

  static { this.declareProp("isSetUp", { type: "choice" }) }
  get isSetUp() { return this.getProp("isSetUp") }
  set isSetUp(value) { this.setProp("isSetUp", value) }
}

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

  get name() { return this.getProp("name") }
  set name(value) { this.setProp("name", value) }
}
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
              h("td", () => spellCore.drawThing(foundations.getItem(1))),
              h("td", () => spellCore.drawThing(foundations.getItem(2))),
              h("td", () => spellCore.drawThing(foundations.getItem(3)))
            ),
            h("tr",
              h("td", () => spellCore.drawThing(tableaus.firstItem)),
              h("td", () => spellCore.drawThing(tableaus.getItem(1))),
              h("td", () => spellCore.drawThing(tableaus.getItem(2))),
              h("td", () => spellCore.drawThing(tableaus.getItem(3))),
              h("td", () => spellCore.drawThing(tableaus.getItem(4))),
              h("td", () => spellCore.drawThing(tableaus.getItem(5))),
              h("td", () => spellCore.drawThing(tableaus.getItem(6)))
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
  canPickUpCard(card) {
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
  canPickUpCard(card) {
    return card === this.lastItem
  }

  draw() {
    return h("div", { class: "Pile Discards stacked" }, () => spellCore.drawThing(this.lastItem))
  }
}
export let discards

/** set up foundation piles: where we build up from ace => king */
export class Foundation extends Pile {
  canPickUpCard(card) {
    return false
  }

  canPlayCard(card) {
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
  canPickUpCard(card) {
    return card.isFaceUp
  }

  canPlayCard(card) {
    if (this.isEmpty) return card.isARank("king")
    return this.color !== card.color && this.value === card.value + 1
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

