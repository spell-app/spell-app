/*! SPELL: PROJECT { spellVersion: "0.8.0", provides: ["Game", "Stock_Pile", "Discard_Pile", "Foundation", "Tableau", "debug_the_game", "reset_the_stock_pile", "play_from_the_stock_pile", "deal_the_cards", "auto_play", "reset_the_game", "cheat"] } */
import { spellCore, Thing, List, App } from "@spell/core"
import { Card, Deck, Pile } from "@spell/project/@system:examples:Solitaire"

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

/*! SPELL: DECLARES {
  syntax: "play {thisArg:expression}", output: "play", rule: "method_call", of: "Card",
  alias: ["statement", "expression"], kind: "method", name: "play a card",
  defined: "/Solitaire.spell:3311-4343",
} */
Card.prototype.play = async function () {
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