import { spellCore, Thing, List, App, h, positionOf, trigger } from "@spell/core"

spellCore.heading("Definition of a Card with nice english aliases for working with it")
/** Definition of a Card with nice english aliases for working with it */
export class Card extends Thing {
  /////////////////////////
  // ## properties of cards
  /////////////////////////
  /** card ranks */
  static Ranks = ['ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'jack', 'queen', 'king']
  static { this.declareProp('rank', { oneOf: Card.Ranks }) }
  get rank() { return this.getProp('rank') }
  set rank(value) { this.setProp('rank', value) }

  /** card suits */
  static Suits = ['clubs', 'diamonds', 'hearts', 'spades']
  static { this.declareProp('suit', { oneOf: Card.Suits }) }
  get suit() { return this.getProp('suit') }
  set suit(value) { this.setProp('suit', value) }

  /** color as derivation of suit */
  get color() {
    if (spellCore.includes(['diamonds', 'hearts'], this.suit)) { return 'red' }
    return 'black'
  }

  /** value as a derivation of rank */
  get value() {
    return positionOf(Card.Ranks, this.rank)
  }

  /** card direction:  up or down */
  static Directions = ['up', 'down']
  static { this.declareProp('direction', { oneOf: Card.Directions }) }
  get direction() { return this.getProp('direction') }
  set direction(value) { this.setProp('direction', value) }

  /////////////
  // ## aliases
  /////////////
  /** "card is face up/down" */
  get isFaceUp() {
    return (this.direction == 'up')
  }

  get isFaceDown() {
    return (this.direction == 'down')
  }

  /** `card is a face card` */
  get isAFaceCard() {
    return spellCore.includes(['jack', 'queen', 'king'], this.rank)
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
    if (this.isASuit('clubs')) { return "♣️" }
    if (this.isASuit('diamonds')) { return "♦️" }
    if (this.isASuit('hearts')) { return "♥️" }
    if (this.isASuit('spades')) { return "♠️" }
    return "?"
  }

  get shortRank() {
    if (this.rank === undefined) { return "?" }
    if (typeof this.rank === 'number') { return `${this.rank}` }
    return `${spellCore.getItemAt(this.rank, 1) ?? ''}`.toLocaleUpperCase()
  }

  get shortDirection() {
    if (this.direction == 'up') { return "+" }
    return "—"
    
  }

  get shortName() {
    return (this.shortRank + this.shortSuit)
  }

  get state() {
    return ((this.shortRank + this.shortSuit) + this.shortDirection)
  }

  //## actions

  /**
   * Turn card face up or face down
   * Note that this will animate if you `wait for turn the card face up`
   */
  async turnFaceUp() {
    this.direction = 'up'
    await spellCore.pauseFor(50, 'msec')
  }

  async turnFaceDown() {
    this.direction = 'down'
    await spellCore.pauseFor(50, 'msec')
  }

  /**
   * Flip card to opposite direction
   * Note that this will animate if you `wait for turn the card face up`
   */
  async turnOver() {
    if (this.direction == 'up') { this.turnFaceDown() }
    else { this.turnFaceUp() }
    await spellCore.pauseFor(50, 'msec')
  }

  draw() {
    let className = `Card face-${this.direction} ${this.rank} ${this.suit} ui button compact fluid `
    if (this.isFaceDown) { return h("div", {
      class: () => className,
      onClick: (event) => {
        return trigger('card-click', { card: this })
      }
    }, h("i", { class: "fitted bicycle icon" })) }
    return h("div", {
      class: () => (className + this.color),
      onClick: (event) => {
        return trigger('card-click', { card: this })
      }
    },
      () => `${this.shortRank} `,
      h("span", { class: "suit" }, () => this.shortSuit)
    )
  }

  /** "card is the red joker", "...is the black joker" -- asked of ANY card, which only a joker of that color is */
  isTheColorJoker(color) {
    return (this instanceof Joker && (this.color == color))
  }
}

spellCore.heading("A joker: a wild card with no rank or suit -- there's a red one and a black one")
/** A joker: a wild card with no rank or suit -- there's a red one and a black one */
export class Joker extends Card {
  /** joker color:  red or black -- set when it's made, as it has no suit to work it out from */
  static Colors = ['red', 'black']
  static { this.declareProp('color', { oneOf: Joker.Colors }) }
  get color() { return this.getProp('color') }
  set color(value) { this.setProp('color', value) }

  /** name as its color, e.g. "red joker" */
  get name() {
    return `${this.color}-joker`
  }

  get shortName() {
    return "🃏"
  }
}

spellCore.heading("create a card instance with default properties")
/** create a card instance with default properties */
export function testCardSetup() {
  return spellCore.test('test card setup', function testCardSetup() {
    spellCore.echoTestAction(`the card is a new card whose rank is queen, suit is spades and direction is up`)
    let card = new Card({
      rank: 'queen',
      suit: 'spades',
      direction: 'up'
    })
    spellCore.echo(card)
    spellCore.expect(card.rank, `the rank of the card`, 'queen', `queen`)
    spellCore.expect(card.suit, `the suit of the card`, 'spades', `spades`)
    spellCore.expect(card.name, `the name of the card`, "queen-of-spades", `"queen-of-spades"`)
    spellCore.expect(card.color, `the color of the card`, 'black', `black`)
    spellCore.expect(card.value, `the value of the card`, 12, `12`)
    spellCore.expect(card.shortSuit, `the short suit of the card`, "♠️", `"♠️"`)
    spellCore.expect(card.shortRank, `the short rank of the card`, "Q", `"Q"`)
    spellCore.expect(card.shortName, `the short name of the card`, "Q♠️", `"Q♠️"`)
    
    spellCore.expect(card.isFaceUp, `the card is face up`, true, `yes`)
    spellCore.expect(card.isFaceDown, `the card is face down`, false, `no`)
    
    spellCore.expect(card.isAFaceCard, `the card is a face card`, true, `yes`)
    spellCore.expect(!card.isAFaceCard, `the card is not a face card`, false, `false`)
    
    spellCore.expect(card.isASuit('spades'), `the card is a spade`, true, `true`)
    spellCore.expect(card.isASuit('clubs'), `the card is a club`, false, `false`)
    
    spellCore.expect(card.isARank('queen'), `the card is a queen`, true, `true`)
    spellCore.expect(card.isARank('ace'), `the card is an ace`, false, `false`)
    spellCore.expect(card.isARank(2), `the card is a 2`, false, `false`)
    
    spellCore.expect(card.isTheRankOfSuits('queen', 'spades'), `the card is the queen of spades`, true, `true`)
    spellCore.expect(card.isTheRankOfSuits('queen', 'clubs'), `the card is the queen of clubs`, false, `false`)
    spellCore.expect(!card.isTheRankOfSuits(2, 'diamonds'), `the card is not the 2 of diamonds`, true, `true`)
    
    spellCore.echoTestAction(`turn the card face down`)
    card.turnFaceDown()
    spellCore.expect(card.direction, `the direction of the card`, 'down', `down`)
    
    spellCore.echoTestAction(`turn the card over`)
    card.turnOver()
    spellCore.expect(card.isFaceUp, `the card is face up`, true, `true`)
    
    spellCore.echoTestAction(`the joker is a new joker whose color is red and direction is up`)
    let joker = new Joker({ color: 'red', direction: 'up' })
    spellCore.echo(joker)
    spellCore.expect(joker instanceof Joker, `the joker is a joker`, true, `yes`)
    spellCore.expect(joker instanceof Card, `the joker is a card`, true, `yes`)
    spellCore.expect(card instanceof Joker, `the card is a joker`, false, `no`)
    spellCore.expect(!(card instanceof Joker), `the card is not a joker`, true, `yes`)
    
    spellCore.expect(joker.color, `the color of the joker`, 'red', `red`)
    spellCore.expect(joker.name, `the name of the joker`, "red-joker", `"red-joker"`)
    spellCore.expect(joker.shortName, `the short name of the joker`, "🃏", `"🃏"`)
    spellCore.expect(joker.isFaceUp, `the joker is face up`, true, `yes`)
    spellCore.echoTestAction(`turn the joker over`)
    joker.turnOver()
    spellCore.expect(joker.isFaceDown, `the joker is face down`, true, `yes`)
    
    spellCore.expect(joker.isTheColorJoker('red'), `the joker is the red joker`, true, `yes`)
    spellCore.expect(joker.isTheColorJoker('black'), `the joker is the black joker`, false, `no`)
    spellCore.expect(!joker.isTheColorJoker('black'), `the joker is not the black joker`, true, `yes`)
    spellCore.expect(card.isTheColorJoker('red'), `the card is the red joker`, false, `no`)
  })
}
testCardSetup()
// -----------
spellCore.heading("Deck:   US standard card deck -- with its two jokers too, if its with jokers is yes")
//## Deck:   US standard card deck -- with its two jokers too, if its with jokers is yes

export class Deck extends List {
  static instanceType = Card

  /** with jokers:  yes to add the red and the black joker when it's set up, after the 52 cards */
  static { this.declareProp('with_jokers', { type: 'choice' }) }
  get with_jokers() { return this.getProp('with_jokers') }
  set with_jokers(value) { this.setProp('with_jokers', value) }

  setUp() {
    if (this.is_set_up) { return }
    Card.Ranks.forEach((rank) => {
      Card.Suits.forEach((suit) => {
        let it = new Card({ rank: rank, suit: suit })
        this.append(it)
      })
    })
    if (this.with_jokers) {
      let it = new Joker({ color: 'red' })
      this.append(it)
      let it2 = new Joker({ color: 'black' })
      this.append(it2)
    }
    this.is_set_up = true
  }

  display() {
    let cardNames = new List()
    this.forEach((card) => {
      cardNames.append(card.shortName)
    })
    spellCore.echo(`deck: ${cardNames}`)
  }
}
Deck.declareProp('is_set_up', { type: 'choice' })
Object.defineProperty(Deck.prototype, 'is_set_up', {
  get() { return this.getProp('is_set_up') },
  set(value) { this.setProp('is_set_up', value) },
  configurable: true
})

export function testDeckCreation() {
  return spellCore.test('test deck creation', function testDeckCreation() {
    spellCore.echoTestAction(`the deck is a new deck`)
    let deck = new Deck()
    spellCore.echoTestAction(`set up the deck`)
    deck.setUp()
    spellCore.expect(deck.length, `the number of cards in the deck`, 52, `52`)
    spellCore.echoTestAction(`set up the deck`)
    deck.setUp()
    spellCore.expect(deck.length, `the number of cards in the deck`, 52, `52`)
    spellCore.echoTestAction(`set the queens to the cards in the deck where the rank of the card is "queen"`)
    let queens = deck.filter((card) => {
      return (card.rank == "queen")
    })
    spellCore.expect(queens.length, `the number of cards in the queens`, 4, `4`)
    spellCore.expect(deck.lastItem?.name, `the name of the bottom card of the deck`, "king-of-spades", `"king-of-spades"`)
    spellCore.expect(deck.firstItem?.shortName, `the short name of the top card of the deck`, "A♣️", `"A♣️"`)
    
    spellCore.echo("the deck before shuffling:")
    spellCore.echoTestAction(`display the deck`)
    deck.display()
    spellCore.expect(deck.firstItem?.isTheRankOfSuits('ace', 'clubs'), `the first card of the deck is the ace of clubs`, true, `yes`)
    
    spellCore.echoTestAction(`shuffle the deck`)
    deck.randomize()
    spellCore.echoTestAction(`shuffle the deck`)
    deck.randomize()
    
    spellCore.echo("the deck after shuffling:")
    spellCore.echoTestAction(`display the deck`)
    deck.display()
  })
}
testDeckCreation()

export function testDeckWithJokers() {
  return spellCore.test('test deck with jokers', function testDeckWithJokers() {
    spellCore.echoTestAction(`the deck is a new deck whose with jokers is yes`)
    let deck = new Deck({ with_jokers: true })
    spellCore.echoTestAction(`set up the deck`)
    deck.setUp()
    spellCore.expect(deck.length, `the number of cards in the deck`, 54, `54`)
    spellCore.echoTestAction(`set the jokers to the cards in the deck where the card is a joker`)
    let jokers = deck.filter((card) => {
      return card instanceof Joker
    })
    spellCore.expect(jokers.length, `the number of cards in the jokers`, 2, `2`)
    spellCore.expect(deck.lastItem?.isTheColorJoker('black'), `the last card of the deck is the black joker`, true, `yes`)
    spellCore.expect(deck.firstItem?.isTheRankOfSuits('ace', 'clubs'), `the first card of the deck is the ace of clubs`, true, `yes`)
  })
}
testDeckWithJokers()
// -----------
spellCore.heading("Pile of playing cards")
/** Pile of playing cards */
export class Pile extends List {
  static instanceType = Card

  /** what a program calls it, e.g. "stock":  the program importing these cards names its piles */
  static { this.declareProp('name', { type: 'text' }) }
  get name() { return this.getProp('name') }
  set name(value) { this.setProp('name', value) }

  get color() {
    if (this.isEmpty) { return "none" }
    return this.lastItem?.color
  }

  get value() {
    if (this.isEmpty) { return 0 }
    return this.lastItem?.value
  }

  get state() {
    let state = `${this.name || "pile"}:`
    this.forEach((card) => {
      state = `${state} ${card.state}`
    })
    return state
  }
}
/** a card is in one pile at a time:  putting it on another pile takes it off this one */
Pile.exclusive = true
Object.defineProperty(Card.prototype, 'pile', {
  get() {
    return Pile.ownerOf(this)
  },
  configurable: true
})