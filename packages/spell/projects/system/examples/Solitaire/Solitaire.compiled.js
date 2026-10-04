/*! SPELL: PROJECT { spellVersion: "0.8.0", provides: ["Card", "Deck", "Pile", "Game", "Stock_Pile", "Discard_Pile", "Foundation", "Tableau", "test_card_setup", "test_deck_creation", "debug_the_game", "reset_the_stock_pile", "play_from_the_stock_pile", "deal_the_cards", "auto_play", "reset_the_game", "cheat"] } */
import { spellCore, Thing, List, App } from "@spell/core"

spellCore.heading("definition of a Card with nice english aliases for working with it")
/** definition of a Card with nice english aliases for working with it */
/*! SPELL: DECLARES {
  type: "Card", superType: "Thing",
  defined: "/Card.spell:70-87",
} */
export class Card extends Thing {
  /////////////////////////
  // ## properties of cards
  /////////////////////////
  /** card ranks */
  /*! SPELL: DECLARES {
    property: "rank", classVariable: "Ranks", of: "Card",
    enumeration: ["'ace'", 2, 3, 4, 5, 6, 7, 8, 9, 10, "'jack'", "'queen'", "'king'"],
    defined: "/Card.spell:126-206",
  } */
  static Ranks = ['ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'jack', 'queen', 'king']
  static { this.declareProp('rank', { oneOf: Card.Ranks }) }
  get rank() { return this.getProp('rank') }
  set rank(value) { this.setProp('rank', value) }

  /** card suits */
  /*! SPELL: DECLARES {
    property: "suit", classVariable: "Suits", of: "Card",
    enumeration: ["'clubs'", "'diamonds'", "'hearts'", "'spades'"],
    defined: "/Card.spell:222-283",
  } */
  static Suits = ['clubs', 'diamonds', 'hearts', 'spades']
  static { this.declareProp('suit', { oneOf: Card.Suits }) }
  get suit() { return this.getProp('suit') }
  set suit(value) { this.setProp('suit', value) }

  /** color as derivation of suit */
  /*! SPELL: DECLARES {
    property: "color", of: "Card", constants: ["red", "black"],
    defined: "/Card.spell:316-405",
  } */
  get color() {
    if (spellCore.includes(['diamonds', 'hearts'], this.suit)) { return 'red' }
    return 'black'
  }

  /** value as a derivation of rank */
  /*! SPELL: DECLARES {
    property: "value", of: "Card", datatype: "number",
    defined: "/Card.spell:440-501",
  } */
  get value() {
    return spellCore.itemOf(Card.Ranks, this.rank)
  }

  /** card direction:  up or down */
  /*! SPELL: DECLARES {
    property: "direction", classVariable: "Directions", of: "Card", enumeration: ["'up'", "'down'"],
    defined: "/Card.spell:534-577",
  } */
  static Directions = ['up', 'down']
  static { this.declareProp('direction', { oneOf: Card.Directions }) }
  get direction() { return this.getProp('direction') }
  set direction(value) { this.setProp('direction', value) }

  /////////////
  // ## aliases
  /////////////
  /** "card is face up/down" */
  /*! SPELL: DECLARES {
    syntax: "{operator:is} face up", output: "is_face_up", rule: "method_postfix", of: "Card",
    kind: "method", name: '"is face up"', returns: "choice",
    defined: "/Card.spell:616-658",
  } */
  get is_face_up() {
    return (this.direction == 'up')
  }

  /*! SPELL: DECLARES {
    syntax: "{operator:is} face down", output: "is_face_down", rule: "method_postfix", of: "Card",
    kind: "method", name: '"is face down"', returns: "choice",
    defined: "/Card.spell:659-705",
  } */
  get is_face_down() {
    return (this.direction == 'down')
  }

  /** `card is a face card` */
  /*! SPELL: DECLARES {
    syntax: "{operator:is} a face card", output: "is_a_face_card", rule: "method_postfix", of: "Card",
    kind: "method", name: '"is a face card"', returns: "choice",
    defined: "/Card.spell:731-796",
  } */
  get is_a_face_card() {
    return spellCore.includes(['jack', 'queen', 'king'], this.rank)
  }

  /** "card is a spade", "...is a club" etc */
  /*! SPELL: DECLARES {
    syntax: "{operator:is} (a|an) (expression:club|diamond|heart|spade)", output: "is_a_$suit",
    rule: "quoted_property", of: "Card", kind: "method", name: '"is a (suit)"',
    values: { suit: ["'clubs'", "'diamonds'", "'hearts'", "'spades'"] },
    defined: "/Card.spell:838-872",
  } */
  is_a_$suit(suit) {
    return this.suit === suit
  }

  /** "card is a queen", "...is an ace" etc */
  /*! SPELL: DECLARES {
    syntax: "{operator:is} (a|an) (expression:ace|2|3|4|5|6|7|8|9|10|jack|queen|king)",
    output: "is_a_$rank", rule: "quoted_property", of: "Card", kind: "method", name: '"is a (rank)"',
    values: { rank: ["'ace'", 2, 3, 4, 5, 6, 7, 8, 9, 10, "'jack'", "'queen'", "'king'"] },
    defined: "/Card.spell:914-948",
  } */
  is_a_$rank(rank) {
    return this.rank === rank
  }

  /** "card is the queen of spades" etc */
  /*! SPELL: DECLARES {
    syntax: "{operator:is} the (expression:ace|2|3|4|5|6|7|8|9|10|jack|queen|king) of (expression:clubs|diamonds|hearts|spades)",
    output: "is_the_$rank_of_$suits", rule: "quoted_property", of: "Card", kind: "method",
    name: '"is the (rank) of (suits)"',
    values: { rank: ["'ace'", 2, 3, 4, 5, 6, 7, 8, 9, 10, "'jack'", "'queen'", "'king'"], suits: ["'clubs'", "'diamonds'", "'hearts'", "'spades'"] },
    defined: "/Card.spell:986-1047",
  } */
  is_the_$rank_of_$suits(rank, suit) {
    return this.rank === rank && this.suit === suit
  }

  /** name as a derivation of name/suit */
  /*! SPELL: DECLARES {
    property: "name", of: "Card", datatype: "text",
    defined: "/Card.spell:1086-1137",
  } */
  get name() {
    return ((this.rank + "-of-") + this.suit)
  }

  /*! SPELL: DECLARES {
    property: "short_suit", words: "short suit", of: "Card", datatype: "text",
    defined: "/Card.spell:1139-1300",
  } */
  get short_suit() {
    if (this.is_a_$suit('clubs')) { return "♣️" }
    if (this.is_a_$suit('diamonds')) { return "♦️" }
    if (this.is_a_$suit('hearts')) { return "♥️" }
    if (this.is_a_$suit('spades')) { return "♠️" }
    return "?"
  }

  /*! SPELL: DECLARES {
    property: "short_rank", words: "short rank", of: "Card", datatype: "text",
    defined: "/Card.spell:1302-1464",
  } */
  get short_rank() {
    if (this.rank == undefined) { return "?" }
    if (spellCore.isOfType(this.rank, 'number')) { return ("" + this.rank) }
    return spellCore.upperCase(spellCore.getItemOf(this.rank, 1))
  }

  /*! SPELL: DECLARES {
    property: "short_direction", words: "short direction", of: "Card", datatype: "text",
    defined: "/Card.spell:1466-1546",
  } */
  get short_direction() {
    if (this.direction == 'up') { return "+" }
    return "—"
    
  }

  /*! SPELL: DECLARES {
    property: "short_name", words: "short name", of: "Card", datatype: "text",
    defined: "/Card.spell:1549-1609",
  } */
  get short_name() {
    return (this.short_rank + this.short_suit)
  }

  /*! SPELL: DECLARES {
    property: "state", of: "Card", datatype: "text",
    defined: "/Card.spell:1611-1688",
  } */
  get state() {
    return ((this.short_rank + this.short_suit) + this.short_direction)
  }

  //## actions

  /**
   * Turn card face up or face down
   * Note that this will animate if you `wait for turn the card face up`
   */
  /*! SPELL: DECLARES {
    syntax: "turn {thisArg:expression} face up", output: "turn_face_up", rule: "method_call",
    of: "Card", alias: ["statement", "expression"], kind: "method", name: "turn a card face up",
    defined: "/Card.spell:1807-1875",
  } */
  async turn_face_up() {
    this.direction = 'up'
    await spellCore.pauseFor(50, 'msec')
  }

  /*! SPELL: DECLARES {
    syntax: "turn {thisArg:expression} face down", output: "turn_face_down", rule: "method_call",
    of: "Card", alias: ["statement", "expression"], kind: "method", name: "turn a card face down",
    defined: "/Card.spell:1876-1948",
  } */
  async turn_face_down() {
    this.direction = 'down'
    await spellCore.pauseFor(50, 'msec')
  }

  /**
   * Flip card to opposite direction
   * Note that this will animate if you `wait for turn the card face up`
   */
  /*! SPELL: DECLARES {
    syntax: "turn {thisArg:expression} over", output: "turn_over", rule: "method_call", of: "Card",
    alias: ["statement", "expression"], kind: "method", name: "turn a card over",
    defined: "/Card.spell:2056-2166",
  } */
  async turn_over() {
    if (this.direction == 'up') { this.turn_face_down() }
    else { this.turn_face_up() }
    await spellCore.pauseFor(50, 'msec')
  }

  /*! SPELL: DECLARES {
    syntax: "draw {thisArg:expression}", output: "draw", rule: "method_call", of: "Card",
    alias: ["statement", "expression"], kind: "method", name: "draw a card",
    defined: "/Card.spell:2168-2642",
  } */
  draw() {
    let className = (((((("Card face-" + this.direction) + " ") + this.rank) + " ") + this.suit) + " ui button compact fluid ")
    if (this.is_face_down) { return spellCore.element({
      tag: "div",
      props: {
        onClick: (event) => {
          return spellCore.RUNTIME.trigger('card-click', { card: this })
        },
        className: className
      },
      children: [
        spellCore.element({ tag: "i", props: { className: "fitted bicycle icon" } })
      ]
    }) }
    return spellCore.element({
      tag: "div",
      props: {
        onClick: (event) => {
          return spellCore.RUNTIME.trigger('card-click', { card: this })
        },
        className: (className + this.color)
      },
      children: [
        (this.short_rank + " "),
        spellCore.element({ tag: "span", props: { className: "suit" }, children: [
          this.short_suit
        ] })
      ]
    })
  }

  /**
   * "move" a card:  piles are exclusive, so adding it takes it out of its old pile -- then pause a moment
   * if you `wait for: move the card to the pile` the move will be animated
   */
  /*! SPELL: DECLARES {
    syntax: "move {thisArg:expression} to {callArgs:expression}", output: "move_to_$pile",
    rule: "method_call", of: "Card", alias: ["statement", "expression"], kind: "method",
    name: "move a card to a pile", params: [{ name: "pile", datatype: "Pile" }],
    defined: "/Pile.spell:418-487",
  } */
  async move_to_$pile(pile) {
    spellCore.append(pile, this)
    await spellCore.pauseFor(50, 'msec')
  }

  /*! SPELL: DECLARES {
    syntax: "play {thisArg:expression}", output: "play", rule: "method_call", of: "Card",
    alias: ["statement", "expression"], kind: "method", name: "play a card",
    defined: "/Solitaire.spell:3311-4343",
  } */
  async play() {
    let start_pile = this.pile
    if (!(start_pile.can_pick_up_$card(this))) { return false }
    
    if (start_pile == stock) {
      play_from_the_stock_pile()
      return
    }
    
    let droppable_piles = spellCore.filter(all_piles, (pile) => {
      return ((pile.droppable == true) && (pile.can_play_$card(this)))
    })
    let end_pile = spellCore.getItemOf(droppable_piles, 1)
    if (!spellCore.isDefined(end_pile)) { return false }
    
    let cards_to_move = spellCore.rangeStartingAt(start_pile, spellCore.itemOf(start_pile, this))
    cards_to_move.name = start_pile.name
    spellCore.console.log(((("moving (" + cards_to_move.state) + ") to (") + end_pile.state) + ")")
    
    spellCore.map(cards_to_move, (card) => {
      card.move_to_$pile(end_pile)
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
/*! SPELL: DECLARES {
  syntax: "test card setup", output: "test_card_setup", rule: "method_call", alias: "statement",
  kind: "function", name: "card setup",
  defined: "/Card.spell:2694-3812",
} */
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
spellCore.heading("Deck:   US standard card deck (without jokers currently)")
//## Deck:   US standard card deck (without jokers currently)

/*! SPELL: DECLARES {
  type: "Deck", superType: "List", itemType: "Card",
  defined: "/Deck.spell:61-86",
} */
export class Deck extends List {
  static instanceType = Card

  /*! SPELL: DECLARES {
    syntax: "set up {thisArg:expression}", output: "set_up", rule: "method_call", of: "Deck",
    alias: ["statement", "expression"], kind: "method", name: "set up a deck", returns: "nothing",
    defined: "/Deck.spell:88-311",
  } */
  set_up() {
    if (this.is_set_up) { return }
    spellCore.map(Card.Ranks, (rank) => {
      spellCore.map(Card.Suits, (suit) => {
        let it = new Card({ rank: rank, suit: suit })
        spellCore.append(this, it)
      })
    })
    this.is_set_up = true
  }

  /*! SPELL: DECLARES {
    syntax: "display {thisArg:expression}", output: "display", rule: "method_call", of: "Deck",
    alias: ["statement", "expression"], kind: "method", name: "display a deck",
    defined: "/Deck.spell:313-462",
  } */
  display() {
    let card_names = new List()
    spellCore.map(this, (card) => {
      spellCore.append(card_names, card.short_name)
    })
    spellCore.echo("deck: " + card_names)
  }
}
/*! SPELL: DECLARES {
  property: "is_set_up", words: "is-set-up", of: "Deck", datatype: "choice", auto: true,
  defined: "/Deck.spell:275-311",
} */
Deck.declareProp('is_set_up', { type: 'choice' })
Object.defineProperty(Deck.prototype, 'is_set_up', {
  get() { return this.getProp('is_set_up') },
  set(value) { this.setProp('is_set_up', value) },
  configurable: true
})

/*! SPELL: DECLARES {
  syntax: "test deck creation", output: "test_deck_creation", rule: "method_call",
  alias: "statement", kind: "function", name: "deck creation",
  defined: "/Deck.spell:464-1024",
} */
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
/*! SPELL: DECLARES {
  type: "Pile", superType: "List", itemType: "Card", exclusive: true,
  defined: "/Pile.spell:25-61",
} */
export class Pile extends List {
  static instanceType = Card
  static exclusive = true

  /*! SPELL: DECLARES {
    property: "color", of: "Pile",
    defined: "/Pile.spell:63-151",
  } */
  get color() {
    if (spellCore.isEmpty(this)) { return "none" }
    return spellCore.getItemOf(this, -1).color
  }

  /*! SPELL: DECLARES {
    property: "value", of: "Pile", datatype: "number",
    defined: "/Pile.spell:153-236",
  } */
  get value() {
    if (spellCore.isEmpty(this)) { return 0 }
    return spellCore.getItemOf(this, -1).value
    
  }

  /*! SPELL: DECLARES {
    property: "state", of: "Pile", datatype: "text",
    defined: "/Pile.spell:490-654",
  } */
  get state() {
    let state = ((this.name || "pile") + ":")
    spellCore.map(this, (card) => {
      state = ((state + " ") + card.state)
    })
    return state
  }
}
Object.defineProperty(Card.prototype, 'pile', {
  get() {
    return Pile.ownerOf(this)
  },
  configurable: true
})
// -----------
/*! SPELL: DECLARES {
  property: "name", of: "Pile", auto: true,
  defined: "/Solitaire.spell:3735-3794",
} */
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
/*! SPELL: DECLARES {
  type: "Game", superType: "App",
  defined: "/Solitaire.spell:149-165",
} */
export class Game extends App {
  /*! SPELL: DECLARES {
    property: "score", of: "Game", datatype: "number",
    defined: "/Solitaire.spell:166-196",
  } */
  static { this.declareProp('score', { type: 'number' }) }
  get score() { return this.getProp('score') }
  set score(value) { this.setProp('score', value) }

  //## actions

  /*! SPELL: DECLARES {
    property: "state", of: "Game", datatype: "list",
    defined: "/Solitaire.spell:2188-2307",
  } */
  get state() {
    let state = []
    spellCore.map(all_piles, (pile) => {
      spellCore.append(state, pile.state)
    })
    return state
  }

  /*! SPELL: DECLARES {
    syntax: "draw {thisArg:expression}", output: "draw", rule: "method_call", of: "Game",
    alias: ["statement", "expression"], kind: "method", name: "draw a game",
    defined: "/Solitaire.spell:6759-8155",
  } */
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
/*! SPELL: DECLARES {
  type: "Stock_Pile", superType: "Pile",
  defined: "/Solitaire.spell:410-432",
} */
export class Stock_Pile extends Pile {
  /*! SPELL: DECLARES {
    syntax: "{operator:can} pick up {expression:operand}", output: "can_pick_up_$card",
    rule: "method_infix", of: "Stock_Pile", kind: "method", name: '"can pick up a card"',
    params: [{ name: "card", datatype: "Card" }], returns: "choice",
    defined: "/Solitaire.spell:433-498",
  } */
  can_pick_up_$card(card) {
    return (card == spellCore.getItemOf(this, -1))
  }

  /*! SPELL: DECLARES {
    syntax: "draw {thisArg:expression}", output: "draw", rule: "method_call", of: "Stock_Pile",
    alias: ["statement", "expression"], kind: "method", name: "draw a stock-pile",
    defined: "/Solitaire.spell:6454-6651",
  } */
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
/*! SPELL: DECLARES {
  type: "Discard_Pile", superType: "Pile",
  defined: "/Solitaire.spell:664-688",
} */
export class Discard_Pile extends Pile {
  /*! SPELL: DECLARES {
    syntax: "{operator:can} pick up {expression:operand}", output: "can_pick_up_$card",
    rule: "method_infix", of: "Discard_Pile", kind: "method", name: '"can pick up a card"',
    params: [{ name: "card", datatype: "Card" }], returns: "choice",
    defined: "/Solitaire.spell:689-756",
  } */
  can_pick_up_$card(card) {
    return (card == spellCore.getItemOf(this, -1))
  }

  /*! SPELL: DECLARES {
    syntax: "draw {thisArg:expression}", output: "draw", rule: "method_call", of: "Discard_Pile",
    alias: ["statement", "expression"], kind: "method", name: "draw a discard-pile",
    defined: "/Solitaire.spell:6653-6757",
  } */
  draw() {
    return spellCore.element({ tag: "div", props: { className: "Pile Discards stacked" }, children: [
      spellCore.drawThing(spellCore.getItemOf(this, -1))
    ] })
  }
}
export let discards = new Discard_Pile({ name: "discards", droppable: false })
spellCore.append(all_piles, discards)

/** set up foundation piles: where we build up from ace => king */
/*! SPELL: DECLARES {
  type: "Foundation", superType: "Pile",
  defined: "/Solitaire.spell:922-944",
} */
export class Foundation extends Pile {
  /*! SPELL: DECLARES {
    syntax: "{operator:can} pick up {expression:operand}", output: "can_pick_up_$card",
    rule: "method_infix", of: "Foundation", kind: "method", name: '"can pick up a card"',
    params: [{ name: "card", datatype: "Card" }], returns: "choice",
    defined: "/Solitaire.spell:945-985",
  } */
  can_pick_up_$card(card) {
    return false
  }

  /*! SPELL: DECLARES {
    syntax: "{operator:can} play {expression:operand}", output: "can_play_$card",
    rule: "method_infix", of: "Foundation", kind: "method", name: '"can play a card"',
    params: [{ name: "card", datatype: "Card" }], returns: "choice",
    defined: "/Solitaire.spell:986-1105",
  } */
  can_play_$card(card) {
    return ((this.name == card.suit) && ((this.value + 1) == card.value))
  }

  //##############
  //## rendering the bits

  // note: tableaus just draw as a (vertical) list of cards

  /*! SPELL: DECLARES {
    syntax: "draw {thisArg:expression}", output: "draw", rule: "method_call", of: "Foundation",
    alias: ["statement", "expression"], kind: "method", name: "draw a foundation",
    defined: "/Solitaire.spell:6009-6354",
  } */
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
/*! SPELL: DECLARES {
  type: "Tableau", superType: "Pile",
  defined: "/Solitaire.spell:1628-1647",
} */
export class Tableau extends Pile {
  /*! SPELL: DECLARES {
    syntax: "{operator:can} pick up {expression:operand}", output: "can_pick_up_$card",
    rule: "method_infix", of: "Tableau", kind: "method", name: '"can pick up a card"',
    params: [{ name: "card", datatype: "Card" }], returns: "choice",
    defined: "/Solitaire.spell:1648-1702",
  } */
  can_pick_up_$card(card) {
    return card.is_face_up
  }

  /*! SPELL: DECLARES {
    syntax: "{operator:can} play {expression:operand}", output: "can_play_$card",
    rule: "method_infix", of: "Tableau", kind: "method", name: '"can play a card"',
    params: [{ name: "card", datatype: "Card" }], returns: "choice",
    defined: "/Solitaire.spell:1703-1878",
  } */
  can_play_$card(card) {
    if (spellCore.isEmpty(this)) { return card.is_a_$rank('king') }
    return ((this.color != card.color) && (this.value == (card.value + 1)))
  }

  /*! SPELL: DECLARES {
    syntax: "draw {thisArg:expression}", output: "draw", rule: "method_call", of: "Tableau",
    alias: ["statement", "expression"], kind: "method", name: "draw a tableau",
    defined: "/Solitaire.spell:6356-6452",
  } */
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
  card.move_to_$pile(stock)
})

spellCore.heading("actions")
/*! SPELL: DECLARES {
  syntax: "debug the game", output: "debug_the_game", rule: "method_call",
  alias: ["statement", "expression"], kind: "function",
  defined: "/Solitaire.spell:2309-2383",
} */
export function debug_the_game() {
  spellCore.map(game.state, (line) => {
    spellCore.console.log(line)
  })
}

/*! SPELL: DECLARES {
  syntax: "reset the stock pile", output: "reset_the_stock_pile", rule: "method_call",
  alias: ["statement", "expression"], kind: "function",
  defined: "/Solitaire.spell:2385-2552",
} */
export function reset_the_stock_pile() {
  let cards = spellCore.duplicateCollection(discards, Pile)
  spellCore.reverse(cards)
  spellCore.map(cards, (card) => {
    card.move_to_$pile(stock)
    card.turn_face_down()
  })
}

/*! SPELL: DECLARES {
  syntax: "play from the stock pile", output: "play_from_the_stock_pile", rule: "method_call",
  alias: ["statement", "expression"], kind: "function",
  defined: "/Solitaire.spell:2554-2741",
} */
export async function play_from_the_stock_pile() {
  if (spellCore.processIsRunning('play_from_the_stock_pile')) { return }
  spellCore.startProcess('play_from_the_stock_pile', 'EXCLUSIVE')
  try {
    if (spellCore.isEmpty(stock)) { await reset_the_stock_pile() }
    
    let it_5 = spellCore.getItemOf(stock, -1)
    it_5.turn_face_up()
    // pause for 150 msec
    it_5.move_to_$pile(discards)
  }
  finally {
    spellCore.stopProcess('play_from_the_stock_pile')
  }
}

/*! SPELL: DECLARES {
  syntax: "deal the cards", output: "deal_the_cards", rule: "method_call",
  alias: ["statement", "expression"], kind: "function",
  defined: "/Solitaire.spell:2743-3309",
} */
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
      if (start_pile != stock) { await card.move_to_$pile(stock) }
    })
    spellCore.randomize(stock)
    
    // deal cards into tableaus
    await spellCore.forEachSequential(spellCore.getRange(1, 7), async (row) => {
      spellCore.getItemOf(stock, -1).turn_face_up()
      await spellCore.forEachSequential(spellCore.getRange(row, 7), async (column) => {
        await spellCore.getItemOf(stock, -1).move_to_$pile(spellCore.getItemOf(tableaus, column))
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

/*! SPELL: DECLARES {
  syntax: "auto-play", output: "auto_play", rule: "method_call", alias: ["statement", "expression"],
  kind: "function",
  defined: "/Solitaire.spell:4387-5465",
} */
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
    if (foundation.can_play_$card(test_card)) {
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

/*! SPELL: DECLARES {
  syntax: "reset the game", output: "reset_the_game", rule: "method_call",
  alias: ["statement", "expression"], kind: "function",
  defined: "/Solitaire.spell:5467-5532",
} */
export function reset_the_game() {
  game.score = 0
  deal_the_cards()
}

/*! SPELL: DECLARES {
  syntax: "cheat", output: "cheat", rule: "method_call", alias: ["statement", "expression"],
  kind: "function", returns: "nothing",
  defined: "/Solitaire.spell:5534-5910",
} */
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
  card.move_to_$pile(discards)
}

spellCore.heading("rendering the bits")
reset_the_game()
game.start()
// -----------
spellCore.installStyles(undefined, `/* File styles.css */¬.Card {¬	position: relative;¬	height: 30px;¬}¬¬.Card .suit {¬	position: relative;¬	font-size: 1.5rem;¬	padding-left: 1px;¬	vertical-align: top;¬	top: -0.15rem;¬}¬¬.Pile {¬	position: relative;¬	min-height: 30px;¬}¬¬.Pile.Tableau {¬	min-height: 500px;¬}¬¬.Pile.stacked .Card {¬	position: absolute;¬	left: 0;¬	top: 0;¬}¬¬.Pile.staggered .Card {¬	margin-bottom: 8px !important;¬}¬¬.Pile > .Placeholder {¬	position: relative;¬	height: 30px;¬}¬¬.Pile > .Placeholder .suit {¬	position: relative;¬	font-size: 1.6rem;¬}¬¬.Pile > .Placeholder .suit.diamonds,¬.Pile > .Placeholder .suit.spades {¬	font-size: 1.75rem;¬	top: -0.1rem;¬}`)