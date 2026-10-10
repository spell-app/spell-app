import { spellCore, Thing, List, App } from "@spell/core"

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
    return spellCore.itemOf(Card.Ranks, this.rank)
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
  get is_face_up() {
    return (this.direction == 'up')
  }

  get is_face_down() {
    return (this.direction == 'down')
  }

  /** `card is a face card` */
  get is_a_face_card() {
    return spellCore.includes(['jack', 'queen', 'king'], this.rank)
  }

  /** "card is a spade", "...is a club" etc */
  is_a_$suit(suit) {
    return this.suit === suit
  }

  /** "card is a queen", "...is an ace" etc */
  is_a_$rank(rank) {
    return this.rank === rank
  }

  /** "card is the queen of spades" etc */
  is_the_$rank_of_$suits(rank, suit) {
    return this.rank === rank && this.suit === suit
  }

  /** name as a derivation of name/suit */
  get name() {
    return ((this.rank + "-of-") + this.suit)
  }

  get short_suit() {
    if (this.is_a_$suit('clubs')) { return "♣️" }
    if (this.is_a_$suit('diamonds')) { return "♦️" }
    if (this.is_a_$suit('hearts')) { return "♥️" }
    if (this.is_a_$suit('spades')) { return "♠️" }
    return "?"
  }

  get short_rank() {
    if (this.rank == undefined) { return "?" }
    if (spellCore.isOfType(this.rank, 'number')) { return ("" + this.rank) }
    return spellCore.upperCase(spellCore.getItemOf(this.rank, 1))
  }

  get short_direction() {
    if (this.direction == 'up') { return "+" }
    return "—"
    
  }

  get short_name() {
    return (this.short_rank + this.short_suit)
  }

  get state() {
    return ((this.short_rank + this.short_suit) + this.short_direction)
  }

  //## actions

  /**
   * Turn card face up or face down
   * Note that this will animate if you `wait for turn the card face up`
   */
  async turn_face_up() {
    this.direction = 'up'
    await spellCore.pauseFor(50, 'msec')
  }

  async turn_face_down() {
    this.direction = 'down'
    await spellCore.pauseFor(50, 'msec')
  }

  /**
   * Flip card to opposite direction
   * Note that this will animate if you `wait for turn the card face up`
   */
  async turn_over() {
    if (this.direction == 'up') { this.turn_face_down() }
    else { this.turn_face_up() }
    await spellCore.pauseFor(50, 'msec')
  }

  draw() {
    let className = (((((("Card face-" + this.direction) + " ") + this.rank) + " ") + this.suit) + " ui button compact fluid ")
    if (this.is_face_down) { return spellCore.element({
      tag: "div",
      props: {
        onClick: (event) => {
          return spellCore.trigger('card-click', { card: this })
        },
        className: () => className
      },
      children: [
        spellCore.element({ tag: "i", props: { className: "fitted bicycle icon" } })
      ]
    }) }
    return spellCore.element({
      tag: "div",
      props: {
        onClick: (event) => {
          return spellCore.trigger('card-click', { card: this })
        },
        className: () => (className + this.color)
      },
      children: [
        () => (this.short_rank + " "),
        spellCore.element({ tag: "span", props: { className: "suit" }, children: [
          () => this.short_suit
        ] })
      ]
    })
  }

  /** "card is the red joker", "...is the black joker" -- asked of ANY card, which only a joker of that color is */
  is_the_$color_joker(color) {
    return (spellCore.isOfType(this, 'Joker') && (this.color == color))
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
    return (this.color + "-joker")
  }

  get short_name() {
    return "🃏"
  }
}

spellCore.heading("create a card instance with default properties")
/** create a card instance with default properties */
export function test_card_setup() {
  return spellCore.test('test card setup', function test_card_setup() {
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
    spellCore.expect(card.short_suit, `the short suit of the card`, "♠️", `"♠️"`)
    spellCore.expect(card.short_rank, `the short rank of the card`, "Q", `"Q"`)
    spellCore.expect(card.short_name, `the short name of the card`, "Q♠️", `"Q♠️"`)
    
    spellCore.expect(card.is_face_up, `the card is face up`, true, `yes`)
    spellCore.expect(card.is_face_down, `the card is face down`, false, `no`)
    
    spellCore.expect(card.is_a_face_card, `the card is a face card`, true, `yes`)
    spellCore.expect(!card.is_a_face_card, `the card is not a face card`, false, `false`)
    
    spellCore.expect(card.is_a_$suit('spades'), `the card is a spade`, true, `true`)
    spellCore.expect(card.is_a_$suit('clubs'), `the card is a club`, false, `false`)
    
    spellCore.expect(card.is_a_$rank('queen'), `the card is a queen`, true, `true`)
    spellCore.expect(card.is_a_$rank('ace'), `the card is an ace`, false, `false`)
    spellCore.expect(card.is_a_$rank(2), `the card is a 2`, false, `false`)
    
    spellCore.expect(card.is_the_$rank_of_$suits('queen', 'spades'), `the card is the queen of spades`, true, `true`)
    spellCore.expect(card.is_the_$rank_of_$suits('queen', 'clubs'), `the card is the queen of clubs`, false, `false`)
    spellCore.expect(!card.is_the_$rank_of_$suits(2, 'diamonds'), `the card is not the 2 of diamonds`, true, `true`)
    
    spellCore.echoTestAction(`turn the card face down`)
    card.turn_face_down()
    spellCore.expect(card.direction, `the direction of the card`, 'down', `down`)
    
    spellCore.echoTestAction(`turn the card over`)
    card.turn_over()
    spellCore.expect(card.is_face_up, `the card is face up`, true, `true`)
    
    spellCore.echoTestAction(`the joker is a new joker whose color is red and direction is up`)
    let joker = new Joker({ color: 'red', direction: 'up' })
    spellCore.echo(joker)
    spellCore.expect(spellCore.isOfType(joker, 'Joker'), `the joker is a joker`, true, `yes`)
    spellCore.expect(spellCore.isOfType(joker, 'Card'), `the joker is a card`, true, `yes`)
    spellCore.expect(spellCore.isOfType(card, 'Joker'), `the card is a joker`, false, `no`)
    spellCore.expect(!spellCore.isOfType(card, 'Joker'), `the card is not a joker`, true, `yes`)
    
    spellCore.expect(joker.color, `the color of the joker`, 'red', `red`)
    spellCore.expect(joker.name, `the name of the joker`, "red-joker", `"red-joker"`)
    spellCore.expect(joker.short_name, `the short name of the joker`, "🃏", `"🃏"`)
    spellCore.expect(joker.is_face_up, `the joker is face up`, true, `yes`)
    spellCore.echoTestAction(`turn the joker over`)
    joker.turn_over()
    spellCore.expect(joker.is_face_down, `the joker is face down`, true, `yes`)
    
    spellCore.expect(joker.is_the_$color_joker('red'), `the joker is the red joker`, true, `yes`)
    spellCore.expect(joker.is_the_$color_joker('black'), `the joker is the black joker`, false, `no`)
    spellCore.expect(!(joker.is_the_$color_joker('black')), `the joker is not the black joker`, true, `yes`)
    spellCore.expect(card.is_the_$color_joker('red'), `the card is the red joker`, false, `no`)
  })
}
test_card_setup()
// -----------
spellCore.heading("Deck:   US standard card deck -- with its two jokers too, if its with jokers is yes")
//## Deck:   US standard card deck -- with its two jokers too, if its with jokers is yes

export class Deck extends List {
  static instanceType = Card

  /** with jokers:  yes to add the red and the black joker when it's set up, after the 52 cards */
  static { this.declareProp('with_jokers', { type: 'choice' }) }
  get with_jokers() { return this.getProp('with_jokers') }
  set with_jokers(value) { this.setProp('with_jokers', value) }

  set_up() {
    if (this.is_set_up) { return }
    spellCore.map(Card.Ranks, (rank) => {
      spellCore.map(Card.Suits, (suit) => {
        let it = new Card({ rank: rank, suit: suit })
        spellCore.append(this, it)
      })
    })
    if (this.with_jokers) {
      let it = new Joker({ color: 'red' })
      spellCore.append(this, it)
      let it_2 = new Joker({ color: 'black' })
      spellCore.append(this, it_2)
    }
    this.is_set_up = true
  }

  display() {
    let card_names = new List()
    spellCore.map(this, (card) => {
      spellCore.append(card_names, card.short_name)
    })
    spellCore.echo("deck: " + card_names)
  }
}
Deck.declareProp('is_set_up', { type: 'choice' })
Object.defineProperty(Deck.prototype, 'is_set_up', {
  get() { return this.getProp('is_set_up') },
  set(value) { this.setProp('is_set_up', value) },
  configurable: true
})

export function test_deck_creation() {
  return spellCore.test('test deck creation', function test_deck_creation() {
    spellCore.echoTestAction(`the deck is a new deck`)
    let deck = new Deck()
    spellCore.echoTestAction(`set up the deck`)
    deck.set_up()
    spellCore.expect(spellCore.itemCountOf(deck), `the number of cards in the deck`, 52, `52`)
    spellCore.echoTestAction(`set up the deck`)
    deck.set_up()
    spellCore.expect(spellCore.itemCountOf(deck), `the number of cards in the deck`, 52, `52`)
    spellCore.echoTestAction(`set the queens to the cards in the deck where the rank of the card is "queen"`)
    let queens = spellCore.filter(deck, (card) => {
      return (card.rank == "queen")
    })
    spellCore.expect(spellCore.itemCountOf(queens), `the number of cards in the queens`, 4, `4`)
    spellCore.expect(spellCore.getItemOf(deck, -1)?.name, `the name of the bottom card of the deck`, "king-of-spades", `"king-of-spades"`)
    spellCore.expect(spellCore.getItemOf(deck, 1)?.short_name, `the short name of the top card of the deck`, "A♣️", `"A♣️"`)
    
    spellCore.echo("the deck before shuffling:")
    spellCore.echoTestAction(`display the deck`)
    deck.display()
    spellCore.expect(spellCore.getItemOf(deck, 1)?.is_the_$rank_of_$suits('ace', 'clubs'), `the first card of the deck is the ace of clubs`, true, `yes`)
    
    spellCore.echoTestAction(`shuffle the deck`)
    spellCore.randomize(deck)
    spellCore.echoTestAction(`shuffle the deck`)
    spellCore.randomize(deck)
    
    spellCore.echo("the deck after shuffling:")
    spellCore.echoTestAction(`display the deck`)
    deck.display()
  })
}
test_deck_creation()

export function test_deck_with_jokers() {
  return spellCore.test('test deck with jokers', function test_deck_with_jokers() {
    spellCore.echoTestAction(`the deck is a new deck whose with jokers is yes`)
    let deck = new Deck({ with_jokers: true })
    spellCore.echoTestAction(`set up the deck`)
    deck.set_up()
    spellCore.expect(spellCore.itemCountOf(deck), `the number of cards in the deck`, 54, `54`)
    spellCore.echoTestAction(`set the jokers to the cards in the deck where the card is a joker`)
    let jokers = spellCore.filter(deck, (card) => {
      return spellCore.isOfType(card, 'Joker')
    })
    spellCore.expect(spellCore.itemCountOf(jokers), `the number of cards in the jokers`, 2, `2`)
    spellCore.expect(spellCore.getItemOf(deck, -1)?.is_the_$color_joker('black'), `the last card of the deck is the black joker`, true, `yes`)
    spellCore.expect(spellCore.getItemOf(deck, 1)?.is_the_$rank_of_$suits('ace', 'clubs'), `the first card of the deck is the ace of clubs`, true, `yes`)
  })
}
test_deck_with_jokers()
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
    if (spellCore.isEmpty(this)) { return "none" }
    return spellCore.getItemOf(this, -1)?.color
  }

  get value() {
    if (spellCore.isEmpty(this)) { return 0 }
    return spellCore.getItemOf(this, -1)?.value
  }

  get state() {
    let state = ((this.name || "pile") + ":")
    spellCore.map(this, (card) => {
      state = ((state + " ") + card.state)
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