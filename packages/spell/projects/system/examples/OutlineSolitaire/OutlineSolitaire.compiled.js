import { spellCore, Thing, List, App } from "@spell/core"

spellCore.heading("Deck:  US standard card deck (without jokers) -- in the outline style")
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

  set_up() {
    if (this.is_set_up) { return }
    spellCore.map(Deck.Ranks, (rank) => {
      spellCore.map(Deck.Suits, (suit) => {
        let it = new Card({ rank: rank, suit: suit })
        spellCore.append(this, it)
      })
    })
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
Deck.Suits = ['clubs', 'diamonds', 'hearts', 'spades']
export class Suit {
  static color(suit) {
    if (spellCore.includes(['diamonds', 'hearts'], suit)) { return 'red' }
    return 'black'
  }
}
Deck.Ranks = ['ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'jack', 'queen', 'king']
export class Rank {
  static is_a_face_card(rank) {
    return spellCore.includes(['jack', 'queen', 'king'], rank)
  }
}
// -----------
spellCore.heading("Definition of a card -- in the outline style:  a heading, then what's true of it")
/** Definition of a card -- in the outline style:  a heading, then what's true of it */
export class Card extends Thing {
  /** suit and rank */
  static { this.declareProp('suit', { oneOf: () => {
    return Deck.Suits
  } }) }
  get suit() { return this.getProp('suit') }
  set suit(value) { this.setProp('suit', value) }

  get color() {
    return Suit.color(this.suit)
  }

  /** e.g. "the card is a spade" */
  is_a_$suit(suit) {
    return this.suit === suit
  }

  static { this.declareProp('rank', { oneOf: () => {
    return Deck.Ranks
  } }) }
  get rank() { return this.getProp('rank') }
  set rank(value) { this.setProp('rank', value) }

  /** e.g. "the card is a queen" */
  is_a_$rank(rank) {
    return this.rank === rank
  }

  /** e.g. "the card is the queen of spades" */
  is_the_$rank_of_$suits(rank, suit) {
    return this.rank === rank && this.suit === suit
  }

  get is_a_face_card() {
    return Rank.is_a_face_card(this.rank)
  }

  get value() {
    return spellCore.itemOf(Deck.Ranks, this.rank)
  }

  /** direction */
  static Directions = ['up', 'down']
  static { this.declareProp('direction', { oneOf: Card.Directions }) }
  get direction() { return this.getProp('direction') }
  set direction(value) { this.setProp('direction', value) }

  get is_face_up() {
    return (this.direction == 'up')
  }

  get is_face_down() {
    return (this.direction == 'down')
  }

  /** names */
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

  /** drawing */
  get front() {
    return spellCore.element({
      tag: "div",
      props: {
        onClick: (event) => {
          return spellCore.RUNTIME.trigger('card-click', { card: this })
        },
        className: `Card face-up ${this.rank} ${this.suit} ui button compact fluid ${this.color}`
      },
      children: [
        (this.short_rank + " "),
        spellCore.element({ tag: "span", props: { className: "suit" }, children: [
          this.short_suit
        ] })
      ]
    })
  }

  get back() {
    return spellCore.element({
      tag: "div",
      props: {
        onClick: (event) => {
          return spellCore.RUNTIME.trigger('card-click', { card: this })
        },
        className: `Card face-down ${this.rank} ${this.suit} ui button compact fluid`
      },
      children: [
        spellCore.element({ tag: "i", props: { className: "fitted bicycle icon" } })
      ]
    })
  }
  draw() {
    return (this.direction === 'down' ? this.back : this.front)
  }

  //## actions -- the sentence style, beside the outline

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

  async play() {
    let start_pile = this.pile
    if (!spellCore.canGiveUp(start_pile, this)) { return false }
    
    if (start_pile == stock) {
      play_from_the_stock_pile()
      return
    }
    
    let end_pile = spellCore.getItemOf(spellCore.filter(all_piles, (pile) => {
      return ((pile.droppable == true) && spellCore.canTake(pile, this))
    }), 1)
    if (!spellCore.isDefined(end_pile)) { return false }
    
    let cards_to_move = spellCore.rangeStartingAt(start_pile, spellCore.itemOf(start_pile, this))
    cards_to_move.name = start_pile.name
    spellCore.console.log(((("moving (" + cards_to_move.state) + ") to (") + end_pile.state) + ")")
    
    spellCore.map(cards_to_move, (card) => {
      spellCore.move(card, end_pile)
    })
    
    if (spellCore.isOfType(start_pile, 'Tableau') && !spellCore.isEmpty(start_pile)) {
      await spellCore.pauseFor(200, 'msec')
      let it = spellCore.getItemOf(start_pile, -1)
      spellCore.console.log(((("turning over (" + start_pile.name) + ": ") + it.state) + ")")
      it.turn_face_up()
    }
    
    if (spellCore.isOfType(end_pile, 'Foundation')) { game.score = (game.score + 10) }
    else if (start_pile == discards) { game.score = (game.score + 5) }
    return true
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
  })
}
test_card_setup()
// -----------
Deck.declareProp('is_set_up', { type: 'choice' })
Object.defineProperty(Deck.prototype, 'is_set_up', {
  get() { return this.getProp('is_set_up') },
  set(value) { this.setProp('is_set_up', value) },
  configurable: true
})
spellCore.heading("Dealing:  what a deck does -- after `Card.spell`, as it reads a card's names")
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
    spellCore.expect(spellCore.getItemOf(deck, -1).name, `the name of the bottom card of the deck`, "king-of-spades", `"king-of-spades"`)
    spellCore.expect(spellCore.getItemOf(deck, 1).short_name, `the short name of the top card of the deck`, "A♣️", `"A♣️"`)
    
    spellCore.echo("the deck before shuffling:")
    spellCore.echoTestAction(`display the deck`)
    deck.display()
    spellCore.expect(spellCore.getItemOf(deck, 1).is_the_$rank_of_$suits('ace', 'clubs'), `the first card of the deck is the ace of clubs`, true, `yes`)
  })
}
test_deck_creation()
// -----------
spellCore.heading("Pile of playing cards")
/** Pile of playing cards */
export class Pile extends List {
  static instanceType = Card

  get color() {
    if (spellCore.isEmpty(this)) { return "none" }
    return spellCore.getItemOf(this, -1).color
  }

  get value() {
    if (spellCore.isEmpty(this)) { return 0 }
    return spellCore.getItemOf(this, -1).value
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
// -----------
Object.defineProperty(Pile.prototype, 'name', {
  get() { return this.getProp('name') },
  set(value) { this.setProp('name', value) },
  configurable: true
})
spellCore.heading("Klondike Solitaire Card Game")
//////////////////////////////////
// ## Klondike Solitaire Card Game
//////////////////////////////////
//-- See [wikipedia](https://en.wikipedia.org/wiki/Klondike_(solitaire)) for rules & naming conventions.

spellCore.heading("Game bits")
/** Game bits */
export class Game extends App {
  static { this.declareProp('score', { type: 'number' }) }
  get score() { return this.getProp('score') }
  set score(value) { this.setProp('score', value) }

  //## actions

  get state() {
    let state = []
    spellCore.map(all_piles, (pile) => {
      spellCore.append(state, pile.state)
    })
    return state
  }

  draw() {
    return spellCore.element({ tag: "div", props: { className: "ui container" }, children: [
      spellCore.element({ tag: "div", props: { className: "board" }, children: [
        spellCore.element({ tag: "table", props: { className: "ui table fixed" }, children: [
          spellCore.element({ tag: "thead", children: [
            spellCore.element({ tag: "tr", children: [
              spellCore.element({ tag: "th", props: { colSpan: "2", className: "left aligned" }, children: [
                "Klondike Solitaire"
              ] }),
              spellCore.element({ tag: "th", props: { className: "right aligned" }, children: [
                ("Score: " + this.score)
              ] }),
              spellCore.element({ tag: "th", children: [
                spellCore.element({
                  tag: "div",
                  props: {
                    className: "tiny fluid ui button compact",
                    onClick: (event) => {
                      return auto_play()
                    }
                  },
                  children: [
                    "AutoPlay"
                  ]
                })
              ] }),
              spellCore.element({ tag: "th", children: [
                spellCore.element({
                  tag: "div",
                  props: {
                    className: "tiny fluid ui button compact",
                    onClick: (event) => {
                      return cheat()
                    }
                  },
                  children: [
                    "Cheat"
                  ]
                })
              ] }),
              spellCore.element({ tag: "th", children: [
                spellCore.element({
                  tag: "div",
                  props: {
                    className: "tiny fluid ui button compact",
                    onClick: (event) => {
                      return debug_the_game()
                    }
                  },
                  children: [
                    "Debug"
                  ]
                })
              ] }),
              spellCore.element({ tag: "th", children: [
                spellCore.element({
                  tag: "div",
                  props: {
                    className: "tiny fluid ui button compact",
                    onClick: (event) => {
                      return reset_the_game()
                    }
                  },
                  children: [
                    "Restart"
                  ]
                })
              ] })
            ] })
          ] }),
          spellCore.element({ tag: "tbody", children: [
            spellCore.element({ tag: "tr", children: [
              spellCore.element({ tag: "td", children: [
                spellCore.drawThing(stock)
              ] }),
              spellCore.element({ tag: "td", children: [
                spellCore.drawThing(discards)
              ] }),
              spellCore.element({ tag: "td" }),
              spellCore.element({ tag: "td", children: [
                spellCore.drawThing(spellCore.getItemOf(foundations, 1))
              ] }),
              spellCore.element({ tag: "td", children: [
                spellCore.drawThing(spellCore.getItemOf(foundations, 2))
              ] }),
              spellCore.element({ tag: "td", children: [
                spellCore.drawThing(spellCore.getItemOf(foundations, 3))
              ] }),
              spellCore.element({ tag: "td", children: [
                spellCore.drawThing(spellCore.getItemOf(foundations, 4))
              ] })
            ] }),
            spellCore.element({ tag: "tr", children: [
              spellCore.element({ tag: "td", children: [
                spellCore.drawThing(spellCore.getItemOf(tableaus, 1))
              ] }),
              spellCore.element({ tag: "td", children: [
                spellCore.drawThing(spellCore.getItemOf(tableaus, 2))
              ] }),
              spellCore.element({ tag: "td", children: [
                spellCore.drawThing(spellCore.getItemOf(tableaus, 3))
              ] }),
              spellCore.element({ tag: "td", children: [
                spellCore.drawThing(spellCore.getItemOf(tableaus, 4))
              ] }),
              spellCore.element({ tag: "td", children: [
                spellCore.drawThing(spellCore.getItemOf(tableaus, 5))
              ] }),
              spellCore.element({ tag: "td", children: [
                spellCore.drawThing(spellCore.getItemOf(tableaus, 6))
              ] }),
              spellCore.element({ tag: "td", children: [
                spellCore.drawThing(spellCore.getItemOf(tableaus, 7))
              ] })
            ] })
          ] })
        ] })
      ] })
    ] })
    
  }
}
export let game = new Game()
spellCore.console.log(game)

spellCore.heading("set up all piles")
/** set up all piles */
export let all_piles = new List({ instanceType: "Pile" })
export let foundations = new List({ instanceType: "Pile" })
export let tableaus = new List({ instanceType: "Pile" })

/** set up stock pile: unplayed cards */
export class Stock_Pile extends Pile {
  canGiveUp(card) {
    return (card == spellCore.getItemOf(this, -1))
  }

  draw() {
    return spellCore.element({ tag: "div", props: { className: "Pile Stock stacked" }, children: [
      spellCore.element({
        tag: "div",
        props: {
          className: "Placeholder ui button basic compact fluid",
          onClick: (event) => {
            return play_from_the_stock_pile()
          }
        }
      }),
      spellCore.drawThing(spellCore.getItemOf(this, -1))
    ] })
  }
}
export let stock = new Stock_Pile({ name: "stock", droppable: false })
spellCore.append(all_piles, stock)

/** set up discards: where played cards go when turning over stock */
export class Discard_Pile extends Pile {
  canGiveUp(card) {
    return (card == spellCore.getItemOf(this, -1))
  }

  draw() {
    return spellCore.element({ tag: "div", props: { className: "Pile Discards stacked" }, children: [
      spellCore.drawThing(spellCore.getItemOf(this, -1))
    ] })
  }
}
export let discards = new Discard_Pile({ name: "discards", droppable: false })
spellCore.append(all_piles, discards)

/** set up foundation piles: where we build up from ace => king */
export class Foundation extends Pile {
  canGiveUp(card) {
    return false
  }

  /** one card at a time:  the last of its pile */
  canTake(card) {
    if (card != spellCore.getItemOf(card.pile, -1)) { return false }
    return ((this.name == card.suit) && ((this.value + 1) == card.value))
  }

  //##############
  //## rendering the bits

  // note: tableaus just draw as a (vertical) list of cards

  draw() {
    let color = (((this.name == 'diamonds') || (this.name == 'hearts')) ? "red" : "black")
    return spellCore.element({ tag: "div", props: { className: "Pile Foundation stacked" }, children: [
      spellCore.element({ tag: "div", props: { className: ((("Placeholder ui button basic compact fluid " + color) + " ") + this.name) }, children: [
        spellCore.element({ tag: "div", props: { className: ("suit " + this.name) }, children: [
          this.symbol
        ] })
      ] }),
      spellCore.drawThing(spellCore.getItemOf(this, -1))
    ] })
  }
}
let it = new Foundation({
  name: 'clubs',
  symbol: "♣️",
  droppable: true
})
spellCore.append(foundations, it)
let it_2 = new Foundation({
  name: 'diamonds',
  symbol: "♦️",
  droppable: true
})
spellCore.append(foundations, it_2)
let it_3 = new Foundation({
  name: 'hearts',
  symbol: "♥️",
  droppable: true
})
spellCore.append(foundations, it_3)
let it_4 = new Foundation({
  name: 'spades',
  symbol: "♠️",
  droppable: true
})
spellCore.append(foundations, it_4)
spellCore.map(foundations, (pile) => {
  spellCore.append(all_piles, pile)
})

/** set up tableau piles: vertical piles where we arrange from king to ace */
export class Tableau extends Pile {
  canGiveUp(card) {
    return card.is_face_up
  }

  canTake(card) {
    if (spellCore.isEmpty(this)) { return card.is_a_$rank('king') }
    return ((this.color != card.color) && (this.value == (card.value + 1)))
  }

  draw() {
    return spellCore.element({ tag: "div", props: { className: "Pile Tableau staggered" }, children: [
      spellCore.drawItems(this)
    ] })
  }
}
spellCore.map(spellCore.getRange(1, 7), (number) => {
  let it_5 = new Tableau({ name: ("T" + number), droppable: true })
  spellCore.append(tableaus, it_5)
  spellCore.append(all_piles, it_5)
})

/** set up deck of cards */
export let deck = new Deck()
deck.set_up()
// start with cards in the stock pile
spellCore.map(deck, (card) => {
  spellCore.append(stock, card)
})

spellCore.heading("actions")
export function debug_the_game() {
  spellCore.map(game.state, (line) => {
    spellCore.console.log(line)
  })
}

export function reset_the_stock_pile() {
  let cards = spellCore.duplicateCollection(discards, Pile)
  spellCore.reverse(cards)
  spellCore.map(cards, (card) => {
    spellCore.append(stock, card)
    card.turn_face_down()
  })
}

export async function play_from_the_stock_pile() {
  if (spellCore.processIsRunning('play_from_the_stock_pile')) { return }
  spellCore.startProcess('play_from_the_stock_pile', 'EXCLUSIVE')
  try {
    if (spellCore.isEmpty(stock)) { await reset_the_stock_pile() }
    
    let it_5 = spellCore.getItemOf(stock, -1)
    it_5.turn_face_up()
    // pause for 150 msec
    spellCore.move(it_5, discards)
  }
  finally {
    spellCore.stopProcess('play_from_the_stock_pile')
  }
}

export async function deal_the_cards() {
  if (spellCore.processIsRunning('deal_the_cards')) { return }
  spellCore.startProcess('deal_the_cards', 'EXCLUSIVE')
  try {
    /** pull all cards into stock with a nice animation */
    let cards = spellCore.mergeCollections(all_piles, Pile)
    spellCore.reverse(cards)
    await spellCore.forEachSequential(cards, async (card) => {
      let start_pile = card.pile
      card.turn_face_down()
      if (start_pile != stock) {
        spellCore.append(stock, card)
        await spellCore.pauseFor(50, 'msec')
      }
    })
    spellCore.randomize(stock)
    
    // deal cards into tableaus
    await spellCore.forEachSequential(spellCore.getRange(1, 7), async (row) => {
      spellCore.getItemOf(stock, -1).turn_face_up()
      await spellCore.forEachSequential(spellCore.getRange(row, 7), async (column) => {
        spellCore.append(spellCore.getItemOf(tableaus, column), spellCore.getItemOf(stock, -1))
        await spellCore.pauseFor(50, 'msec')
      })
    })
    
    await play_from_the_stock_pile()
  }
  finally {
    spellCore.stopProcess('deal_the_cards')
  }
}

spellCore.RUNTIME.on('card-click', (event) => {
  let { card } = event
  card.play()
})

export async function auto_play() {
  let anything_changed = false
  if (!spellCore.isEmpty(discards)) {
    let test_card = spellCore.getItemOf(discards, -1)
    if (await test_card.play()) {
      anything_changed = true
      await spellCore.pauseFor(500, 'msec')
    }
  }
  
  // attempt to move bottom card of tableaus to foundations
  await spellCore.forEachSequential(tableaus, async (pile) => {
    if (spellCore.isEmpty(pile)) { return }
    let test_card = spellCore.getItemOf(pile, -1)
    let foundation = spellCore.getItemOf(spellCore.filter(foundations, (pile) => {
      return (pile.name == test_card.suit)
    }), 1)
    if (spellCore.canTake(foundation, test_card)) {
      anything_changed = true
      await test_card.play()
      await spellCore.pauseFor(100, 'msec')
    }
  })
  
  // attempt to move the entire pile of face-up cards
  await spellCore.forEachSequential(tableaus, async (pile) => {
    let face_up_cards = spellCore.filter(pile, (card) => {
      return card.is_face_up
    })
    if (spellCore.isEmpty(face_up_cards)) { return }
    let test_card = spellCore.getItemOf(face_up_cards, 1)
    if (test_card.is_a_$rank('king') && (test_card == spellCore.getItemOf(pile, 1))) { return }
    if (await test_card.play()) {
      anything_changed = true
      await spellCore.pauseFor(500, 'msec')
    }
  })
  
  // call auto-play again if anything actually changed
  if (anything_changed) { await auto_play() }
}

export function reset_the_game() {
  game.score = 0
  deal_the_cards()
}

export async function cheat() {
  let remaining_piles = spellCore.filter(tableaus, (pile) => {
    return (!spellCore.isEmpty(pile) && spellCore.getItemOf(pile, 1).is_face_down)
  })
  if (spellCore.isEmpty(remaining_piles)) { return }
  let pile = spellCore.randomItemOf(remaining_piles)
  let unplaid_cards = spellCore.filter(pile, (card) => {
    return card.is_face_down
  })
  let card = spellCore.randomItemOf(unplaid_cards)
  card.turn_face_up()
  await spellCore.pauseFor(30, 'ticks')
  spellCore.move(card, discards)
}

spellCore.heading("rendering the bits")
reset_the_game()
game.start()
// -----------
spellCore.installStyles(undefined, `/* File styles.css */¬.Card {¬	position: relative;¬	height: 30px;¬}¬¬.Card .suit {¬	position: relative;¬	font-size: 1.5rem;¬	padding-left: 1px;¬	vertical-align: top;¬	top: -0.15rem;¬}¬¬.Pile {¬	position: relative;¬	min-height: 30px;¬}¬¬.Pile.Tableau {¬	min-height: 500px;¬}¬¬.Pile.stacked .Card {¬	position: absolute;¬	left: 0;¬	top: 0;¬}¬¬.Pile.staggered .Card {¬	margin-bottom: 8px !important;¬}¬¬.Pile > .Placeholder {¬	position: relative;¬	height: 30px;¬}¬¬.Pile > .Placeholder .suit {¬	position: relative;¬	font-size: 1.6rem;¬}¬¬.Pile > .Placeholder .suit.diamonds,¬.Pile > .Placeholder .suit.spades {¬	font-size: 1.75rem;¬	top: -0.1rem;¬}`)