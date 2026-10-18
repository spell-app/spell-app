import { Show } from "solid-js"
import { core, Thing, List, App, Drawable, DrawableList, prop, derived, drawn, positionOf, spellPosition, trigger } from "@spell/core"

core.heading("definition of a Card with nice english aliases for working with it")
/** card ranks */
const RANKS = ["ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king"] as const
export type Rank = (typeof RANKS)[number]

/** card suits */
const SUITS = ["clubs", "diamonds", "hearts", "spades"] as const
export type Suit = (typeof SUITS)[number]

/** card direction:  up or down */
const DIRECTIONS = ["up", "down"] as const
export type Direction = (typeof DIRECTIONS)[number]

/** definition of a Card with nice english aliases for working with it */
export class Card extends Thing {
  /////////////////////////
  // ## properties of cards
  /////////////////////////
  // cards have a rank as one of ace, 2, 3, 4, 5, 6, 7, 8, 9, 10, jack, queen or king
  static Ranks = RANKS
  @prop({ oneOf: RANKS })
  accessor rank!: Rank

  // cards have a suit as one of clubs, diamonds, hearts or spades
  static Suits = SUITS
  @prop({ oneOf: SUITS })
  accessor suit!: Suit

  /** color as derivation of suit */
  get color() {
    if (core.includes(["diamonds", "hearts"], this.suit)) return "red"
    return "black"
  }

  /** value as a derivation of rank */
  get value() {
    return spellPosition(positionOf(Card.Ranks, this.rank))
  }

  // a card has a direction as either up or down
  static Directions = DIRECTIONS
  @prop({ oneOf: DIRECTIONS })
  accessor direction!: Direction

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
    return core.includes(["jack", "queen", "king"], this.rank)
  }

  /** "card is a spade", "...is a club" etc */
  isASuit(suit: Suit) {
    return this.suit === suit
  }

  /** "card is a queen", "...is an ace" etc */
  isARank(rank: Rank) {
    return this.rank === rank
  }

  /** "card is the queen of spades" etc */
  isTheRankOfSuits(rank: Rank, suit: Suit) {
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

  //## actions

  /**
   * Turn card face up or face down
   * Note that this will animate if you `wait for turn the card face up`
   */
  async turnFaceUp() {
    this.direction = "up"
    await core.pauseFor(50, "msec")
  }

  async turnFaceDown() {
    this.direction = "down"
    await core.pauseFor(50, "msec")
  }

  /**
   * Flip card to opposite direction
   * Note that this will animate if you `wait for turn the card face up`
   */
  async turnOver() {
    if (this.direction == "up") this.turnFaceDown()
    else this.turnFaceUp()
    await core.pauseFor(50, "msec")
  }

  @drawn draw() {
    const className = () => `Card face-${this.direction} ${this.rank} ${this.suit} ui button compact fluid `
    const click = () => trigger("card-click", { card: this })
    return (
      <Show
        when={this.isFaceDown}
        fallback={
          <div class={className() + this.color} onClick={click}>
            {`${this.shortRank} `}
            <span class="suit">{this.shortSuit}</span>
          </div>
        }
      >
        <div class={className()} onClick={click}>
          <i class="fitted bicycle icon" />
        </div>
      </Show>
    )
  }

  get pile() {
    return Pile.ownerOf(this)!
  }
}

core.heading("create a card instance with default properties")
/** create a card instance with default properties */
export function testCardSetup() {
  return core.test("test card setup", function testCardSetup() {
    core.echoTestAction(`the card is a new card whose rank is queen, suit is spades and direction is up`)
    const card = new Card({
      rank: "queen",
      suit: "spades",
      direction: "up"
    })
    core.echo(card)
    core.expect(card.rank, `the rank of the card`, "queen", `queen`)
    core.expect(card.suit, `the suit of the card`, "spades", `spades`)
    core.expect(card.name, `the name of the card`, "queen-of-spades", `"queen-of-spades"`)
    core.expect(card.color, `the color of the card`, "black", `black`)
    core.expect(card.value, `the value of the card`, 12, `12`)
    core.expect(card.shortSuit, `the short suit of the card`, "♠️", `"♠️"`)
    core.expect(card.shortRank, `the short rank of the card`, "Q", `"Q"`)
    core.expect(card.shortName, `the short name of the card`, "Q♠️", `"Q♠️"`)

    core.expect(card.isFaceUp, `the card is face up`, true, `yes`)
    core.expect(card.isFaceDown, `the card is face down`, false, `no`)

    core.expect(card.isAFaceCard, `the card is a face card`, true, `yes`)
    core.expect(!card.isAFaceCard, `the card is not a face card`, false, `false`)

    core.expect(card.isASuit("spades"), `the card is a spade`, true, `true`)
    core.expect(card.isASuit("clubs"), `the card is a club`, false, `false`)

    core.expect(card.isARank("queen"), `the card is a queen`, true, `true`)
    core.expect(card.isARank("ace"), `the card is an ace`, false, `false`)
    core.expect(card.isARank(2), `the card is a 2`, false, `false`)

    core.expect(card.isTheRankOfSuits("queen", "spades"), `the card is the queen of spades`, true, `true`)
    core.expect(card.isTheRankOfSuits("queen", "clubs"), `the card is the queen of clubs`, false, `false`)
    core.expect(!card.isTheRankOfSuits(2, "diamonds"), `the card is not the 2 of diamonds`, true, `true`)

    core.echoTestAction(`turn the card face down`)
    card.turnFaceDown()
    core.expect(card.direction, `the direction of the card`, "down", `down`)

    core.echoTestAction(`turn the card over`)
    card.turnOver()
    core.expect(card.isFaceUp, `the card is face up`, true, `true`)
  })
}
if (!core.isCarryingOver) testCardSetup()
// -----------
core.heading("Deck:   US standard card deck (without jokers currently)")
//## Deck:   US standard card deck (without jokers currently)

export class Deck extends List<Card> {
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
    core.echo(`deck: ${cardNames}`)
  }

  // set the is-set-up of the deck to yes
  @prop({ type: "choice" })
  accessor isSetUp!: boolean
}

export function testDeckCreation() {
  return core.test("test deck creation", function testDeckCreation() {
    core.echoTestAction(`the deck is a new deck`)
    const deck = new Deck()
    core.echoTestAction(`set up the deck`)
    deck.setUp()
    core.expect(deck.length, `the number of cards in the deck`, 52, `52`)
    core.echoTestAction(`set up the deck`)
    deck.setUp()
    core.expect(deck.length, `the number of cards in the deck`, 52, `52`)
    core.echoTestAction(`set the queens to the cards in the deck where the rank of the card is "queen"`)
    const queens = deck.filter((card) => card.rank == "queen")
    core.expect(queens.length, `the number of cards in the queens`, 4, `4`)
    core.expect(deck.lastItem?.name!, `the name of the bottom card of the deck`, "king-of-spades", `"king-of-spades"`)
    core.expect(deck.firstItem?.shortName!, `the short name of the top card of the deck`, "A♣️", `"A♣️"`)

    core.echo("the deck before shuffling:")
    core.echoTestAction(`display the deck`)
    deck.display()
    core.expect(deck.firstItem?.isTheRankOfSuits("ace", "clubs")!, `the first card of the deck is the ace of clubs`, true, `yes`)
  })
}
if (!core.isCarryingOver) testDeckCreation()
// -----------
core.heading("Pile of playing cards")
/** Pile of playing cards */
export class Pile extends List<Card> {
  static instanceType = Card

  get color() {
    if (this.isEmpty) return "none"
    return this.lastItem!.color
  }

  get value() {
    if (this.isEmpty) return 0
    return this.lastItem!.value
  }

  @derived get state() {
    let state = `${this.name || "pile"}:`
    this.forEach((card) => (state = `${state} ${card.state}`))
    return state
  }

  static exclusive = true
}
/** a card is in one pile at a time:  putting it on another pile takes it off this one */
