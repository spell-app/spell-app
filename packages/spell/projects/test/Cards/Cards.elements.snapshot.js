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

  static exclusive = true
}
/** a card is in one pile at a time:  putting it on another pile takes it off this one */

/** Binds each thing the program keeps, from Python's state. */
export function adopt(state) {

}

