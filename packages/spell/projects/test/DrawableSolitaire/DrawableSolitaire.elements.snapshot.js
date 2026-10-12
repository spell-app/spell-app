import { spellCore, Thing, List, App, Drawable, DrawableList, h, css, positionOf, spellPosition, sendTrigger, sendCall } from "@spell/core"

////////////////////////////////////////////////////////////////////////
// ## definition of a Card with nice english aliases for working with it
////////////////////////////////////////////////////////////////////////
/** a drawable thing:  each card draws in its own element, <solitaire-card>, with its own styles */
export class Card extends Drawable {
  static elementTag = spellCore.defineElement(this, "test-project")

  static css = css`
    :host {
    	display: block;
    	position: relative;
    }
    .card {
    	box-sizing: border-box;
    	height: 30px;
    	padding: 0.2em 0.4em;
    	border: 1px solid #b0b0b0;
    	border-radius: 4px;
    	background: white;
    	font-weight: bold;
    	text-align: center;
    	cursor: pointer;
    	user-select: none;
    }
    .card.red {
    	color: crimson;
    }
    .card.black {
    	color: #222;
    }
    .card.face-down {
    	background: repeating-linear-gradient(45deg, #3a6, #3a6 4px, #285 4px, #285 8px);
    }
    .suit {
    	position: relative;
    	font-size: 1.2rem;
    	vertical-align: top;
    	top: -0.1rem;
    }
  `

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
    const className = `card face-${this.direction} ${this.rank} ${this.suit} `
    if (this.isFaceDown) return h("div", { class: () => className, onClick: () => sendTrigger("card-click", { card: this }) })
    return h("div", { class: () => className + this.color, onClick: () => sendTrigger("card-click", { card: this }) },
      () => `${this.shortRank} `,
      h("span", { class: "suit" }, () => this.shortSuit)
    )
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
    const cardNames = new List({ instanceType: "text" })
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
///////////////////////////
// ## Pile of playing cards
///////////////////////////
/** a drawable list:  each pile is its own element, <solitaire-pile>, holding its cards' elements */
export class Pile extends DrawableList {
  static instanceType = Card
  static elementTag = spellCore.defineElement(this, "test-project")

  static css = css`
    :host {
    	display: block;
    	position: relative;
    	min-height: 30px;
    }
    .pile {
    	position: relative;
    	min-height: 30px;
    }
    /* its cards, stacked:  the last on top */
    ::slotted(*) {
    	position: absolute;
    	left: 0;
    	top: 0;
    	width: 100%;
    }
    .placeholder {
    	box-sizing: border-box;
    	height: 30px;
    	border: 1px dashed #b0b0b0;
    	border-radius: 4px;
    	text-align: center;
    	cursor: pointer;
    }
    .placeholder.red {
    	color: crimson;
    }
    .placeholder .suit {
    	font-size: 1.4rem;
    	line-height: 28px;
    }
  `

  static { this.declareProp("name", { type: "text" }) }
  get name() { return this.getProp("name") }
  set name(value) { this.setProp("name", value) }

  get color() {
    if (this.isEmpty) return "none"
    return this.lastItem.color
  }

  get value() {
    if (this.isEmpty) return 0
    return this.lastItem.value
  }

  get state() {
    let state = `${this.name || "pile"}:`
    this.forEach((card) => (state = `${state} ${card.state}`))
    return state
  }

  static exclusive = true
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
    let state = new List({ instanceType: "text" })
    allPiles.forEach((pile) => state.append(pile.state))
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
  static elementTag = spellCore.defineElement(this, "test-project")

  canGiveUp(card) {
    return card === this.lastItem
  }

  draw() {
    return h("div", { class: "pile stock" },
      h("div", { class: "placeholder", onClick: () => playFromTheStockPile() }),
      h("slot")
    )
  }
}
export let stock

/** set up discards: where played cards go when turning over stock */
export class DiscardPile extends Pile {
  static elementTag = spellCore.defineElement(this, "test-project")

  canGiveUp(card) {
    return card === this.lastItem
  }

  draw() {
    return h("div", { class: "pile discards" }, h("slot"))
  }
}
export let discards

/** set up foundation piles: where we build up from ace => king */
export class Foundation extends Pile {
  static elementTag = spellCore.defineElement(this, "test-project")

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

  // each pile draws its outside:  its cards show in its <slot/>, each card its own element

  draw() {
    const color = this.name === "diamonds" || this.name === "hearts" ? "red" : "black"
    return h("div", { class: "pile foundation" },
      h("div", { class: () => `placeholder ${color} ${this.name}` },
        h("div", { class: () => `suit ${this.name}` }, () => this.symbol)
      ),
      h("slot")
    )
  }
}
export let it
export let it2
export let it3
export let it4

/** set up tableau piles: vertical piles where we arrange from king to ace */
export class Tableau extends Pile {
  static elementTag = spellCore.defineElement(this, "test-project")

  static css = css`
    :host {
    	min-height: 500px;
    }
    /* its cards, one below the other */
    ::slotted(*) {
    	position: relative;
    	margin-bottom: 8px;
    }
  `

  canGiveUp(card) {
    return card.isFaceUp
  }

  canTake(card) {
    if (this.isEmpty) return card.isARank("king")
    return this.color !== card.color && this.value === card.value + 1
  }

  draw() {
    return h("div", { class: "pile tableau" }, h("slot"))
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
spellCore.installStyles(undefined, `/* File styles.css:  the board's own styles.  The cards and piles style themselves:  their <css>. */¬`)

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

