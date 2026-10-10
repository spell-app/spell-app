import { spellCore, Thing, List, App, on } from "@spell/core"
import { Card, Deck, Pile } from "@spell/project/@test:fixtures:Cards"

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
    allPiles.forEach((pile) => {
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
                () => `Score: ${this.score}`
              ] }),
              spellCore.element({ tag: "th", children: [
                spellCore.element({
                  tag: "div",
                  props: {
                    className: "tiny fluid ui button compact",
                    onClick: (event) => {
                      return autoPlay()
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
                      return debugTheGame()
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
                      return resetTheGame()
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
                () => spellCore.drawThing(stock)
              ] }),
              spellCore.element({ tag: "td", children: [
                () => spellCore.drawThing(discards)
              ] }),
              spellCore.element({ tag: "td" }),
              spellCore.element({ tag: "td", children: [
                () => spellCore.drawThing(foundations.firstItem)
              ] }),
              spellCore.element({ tag: "td", children: [
                () => spellCore.drawThing(foundations.getItem(2))
              ] }),
              spellCore.element({ tag: "td", children: [
                () => spellCore.drawThing(foundations.getItem(3))
              ] }),
              spellCore.element({ tag: "td", children: [
                () => spellCore.drawThing(foundations.getItem(4))
              ] })
            ] }),
            spellCore.element({ tag: "tr", children: [
              spellCore.element({ tag: "td", children: [
                () => spellCore.drawThing(tableaus.firstItem)
              ] }),
              spellCore.element({ tag: "td", children: [
                () => spellCore.drawThing(tableaus.getItem(2))
              ] }),
              spellCore.element({ tag: "td", children: [
                () => spellCore.drawThing(tableaus.getItem(3))
              ] }),
              spellCore.element({ tag: "td", children: [
                () => spellCore.drawThing(tableaus.getItem(4))
              ] }),
              spellCore.element({ tag: "td", children: [
                () => spellCore.drawThing(tableaus.getItem(5))
              ] }),
              spellCore.element({ tag: "td", children: [
                () => spellCore.drawThing(tableaus.getItem(6))
              ] }),
              spellCore.element({ tag: "td", children: [
                () => spellCore.drawThing(tableaus.getItem(7))
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
export let allPiles = new List({ instanceType: "Pile" })
export let foundations = new List({ instanceType: "Pile" })
export let tableaus = new List({ instanceType: "Pile" })

/** set up stock pile: unplayed cards */
export class Stock_Pile extends Pile {
  canGiveUp(card) {
    return (card === this.lastItem)
  }

  draw() {
    return spellCore.element({ tag: "div", props: { className: "Pile Stock stacked" }, children: [
      spellCore.element({
        tag: "div",
        props: {
          className: "Placeholder ui button basic compact fluid",
          onClick: (event) => {
            return playFromTheStockPile()
          }
        }
      }),
      () => spellCore.drawThing(this.lastItem)
    ] })
  }
}
export let stock = new Stock_Pile({ name: "stock", droppable: false })
allPiles.append(stock)

/** set up discards: where played cards go when turning over stock */
export class Discard_Pile extends Pile {
  canGiveUp(card) {
    return (card === this.lastItem)
  }

  draw() {
    return spellCore.element({ tag: "div", props: { className: "Pile Discards stacked" }, children: [
      () => spellCore.drawThing(this.lastItem)
    ] })
  }
}
export let discards = new Discard_Pile({ name: "discards", droppable: false })
allPiles.append(discards)

/** set up foundation piles: where we build up from ace => king */
export class Foundation extends Pile {
  canGiveUp(card) {
    return false
  }

  /** one card at a time:  the last of its pile */
  canTake(card) {
    if (card !== card.pile.lastItem) { return false }
    return ((this.name == card.suit) && ((this.value + 1) === card.value))
  }

  //##############
  //## rendering the bits

  // note: tableaus just draw as a (vertical) list of cards

  draw() {
    let color = (((this.name === 'diamonds') || (this.name === 'hearts')) ? "red" : "black")
    return spellCore.element({ tag: "div", props: { className: "Pile Foundation stacked" }, children: [
      spellCore.element({ tag: "div", props: { className: () => `Placeholder ui button basic compact fluid ${color} ${this.name}` }, children: [
        spellCore.element({ tag: "div", props: { className: () => `suit ${this.name}` }, children: [
          () => this.symbol
        ] })
      ] }),
      () => spellCore.drawThing(this.lastItem)
    ] })
  }
}
let it = new Foundation({
  name: 'clubs',
  symbol: "♣️",
  droppable: true
})
foundations.append(it)
let it2 = new Foundation({
  name: 'diamonds',
  symbol: "♦️",
  droppable: true
})
foundations.append(it2)
let it3 = new Foundation({
  name: 'hearts',
  symbol: "♥️",
  droppable: true
})
foundations.append(it3)
let it4 = new Foundation({
  name: 'spades',
  symbol: "♠️",
  droppable: true
})
foundations.append(it4)
foundations.forEach((pile) => {
  allPiles.append(pile)
})

/** set up tableau piles: vertical piles where we arrange from king to ace */
export class Tableau extends Pile {
  canGiveUp(card) {
    return card.isFaceUp
  }

  canTake(card) {
    if (this.isEmpty) { return card.isARank('king') }
    return ((this.color != card.color) && (this.value === (card.value + 1)))
  }

  draw() {
    return spellCore.element({ tag: "div", props: { className: "Pile Tableau staggered" }, children: [
      () => spellCore.drawItems(this)
    ] })
  }
}
spellCore.getRange(1, 7).forEach((number) => {
  let it5 = new Tableau({ name: `T${number}`, droppable: true })
  tableaus.append(it5)
  allPiles.append(it5)
})

/** set up deck of cards */
export let deck = new Deck()
deck.setUp()
// start with cards in the stock pile
deck.forEach((card) => {
  stock.append(card)
})

spellCore.heading("actions")
export function debugTheGame() {
  spellCore.map(game.state, (line) => {
    spellCore.console.log(line)
  })
}

export function resetTheStockPile() {
  let cards = discards.clone()
  cards.reverse()
  cards.forEach((card) => {
    stock.append(card)
    card.turnFaceDown()
  })
}

export async function playFromTheStockPile() {
  if (spellCore.processIsRunning('play_from_the_stock_pile')) { return }
  spellCore.startProcess('play_from_the_stock_pile', 'EXCLUSIVE')
  try {
    if (stock.isEmpty) { await resetTheStockPile() }
    
    let it5 = stock.lastItem
    it5?.turnFaceUp()
    // pause for 150 msec
    spellCore.move(it5, discards)
  }
  finally {
    spellCore.stopProcess('play_from_the_stock_pile')
  }
}

export async function dealTheCards() {
  if (spellCore.processIsRunning('deal_the_cards')) { return }
  spellCore.startProcess('deal_the_cards', 'EXCLUSIVE')
  try {
    /** pull all cards into stock with a nice animation */
    let cards = allPiles.merged(Pile)
    cards.reverse()
    for (const card of cards) {
      let startPile = card.pile
      card.turnFaceDown()
      if (startPile !== stock) {
        stock.append(card)
        await spellCore.pauseFor(50, 'msec')
      }
    }
    stock.randomize()
    
    // deal cards into tableaus
    for (const row of spellCore.getRange(1, 7)) {
      stock.lastItem?.turnFaceUp()
      for (const column of spellCore.getRange(row, 7)) {
        tableaus.getItem(column)?.append(stock.lastItem)
        await spellCore.pauseFor(50, 'msec')
      }
    }
    
    await playFromTheStockPile()
  }
  finally {
    spellCore.stopProcess('deal_the_cards')
  }
}

Card.prototype.play = async function () {
  let startPile = this.pile
  if (!spellCore.canGiveUp(startPile, this)) { return false }
  
  if (startPile === stock) {
    playFromTheStockPile()
    return
  }
  
  let endPile = allPiles.filter((pile) => {
    return ((pile.droppable) && spellCore.canTake(pile, this))
  }).firstItem
  if (endPile === undefined) { return false }
  
  let cardsToMove = startPile.startingWith(this)
  cardsToMove.name = startPile.name
  spellCore.console.log(`moving (${cardsToMove.state}) to (${endPile.state})`)
  
  cardsToMove.forEach((card) => {
    spellCore.move(card, endPile)
  })
  
  if (startPile instanceof Tableau && !startPile.isEmpty) {
    await spellCore.pauseFor(200, 'msec')
    let it = startPile.lastItem
    spellCore.console.log(`turning over (${startPile.name}: ${it?.state})`)
    it?.turnFaceUp()
  }
  
  if (endPile instanceof Foundation) { game.score = (game.score + 10) }
  else if (startPile === discards) { game.score = (game.score + 5) }
  return true
}

on('card-click', (event) => {
  let { card } = event
  card.play()
})

export async function autoPlay() {
  let anythingChanged = false
  if (!discards.isEmpty) {
    let testCard = discards.lastItem
    if (await testCard?.play()) {
      anythingChanged = true
      await spellCore.pauseFor(500, 'msec')
    }
  }
  
  // attempt to move bottom card of tableaus to foundations
  for (const pile of tableaus) {
    if (pile.isEmpty) { continue }
    let testCard = pile.lastItem
    let foundation = foundations.filter((pile) => {
      return (pile.name == testCard?.suit)
    }).firstItem
    if (spellCore.canTake(foundation, testCard)) {
      anythingChanged = true
      await testCard?.play()
      await spellCore.pauseFor(100, 'msec')
    }
  }
  
  // attempt to move the entire pile of face-up cards
  for (const pile of tableaus) {
    let faceUpCards = pile.filter((card) => {
      return card.isFaceUp
    })
    if (faceUpCards.isEmpty) { continue }
    let testCard = faceUpCards.firstItem
    if (testCard?.isARank('king') && (testCard === pile.firstItem)) { continue }
    if (await testCard?.play()) {
      anythingChanged = true
      await spellCore.pauseFor(500, 'msec')
    }
  }
  
  // call auto-play again if anything actually changed
  if (anythingChanged) { await autoPlay() }
}

export function resetTheGame() {
  game.score = 0
  dealTheCards()
}

export async function cheat() {
  let remainingPiles = tableaus.filter((pile) => {
    return (!pile.isEmpty && pile.firstItem?.isFaceDown)
  })
  if (remainingPiles.isEmpty) { return }
  let pile = remainingPiles.randomItem()
  let unplaidCards = pile?.filter((card) => {
    return card.isFaceDown
  })
  let card = unplaidCards?.randomItem()
  card?.turnFaceUp()
  await spellCore.pauseFor(30, 'ticks')
  spellCore.move(card, discards)
}

spellCore.heading("rendering the bits")
resetTheGame()
game.start()
// -----------
spellCore.installStyles(undefined, `/* File styles.css */¬.Card {¬	position: relative;¬	height: 30px;¬}¬¬.Card .suit {¬	position: relative;¬	font-size: 1.5rem;¬	padding-left: 1px;¬	vertical-align: top;¬	top: -0.15rem;¬}¬¬.Pile {¬	position: relative;¬	min-height: 30px;¬}¬¬.Pile.Tableau {¬	min-height: 500px;¬}¬¬.Pile.stacked .Card {¬	position: absolute;¬	left: 0;¬	top: 0;¬}¬¬.Pile.staggered .Card {¬	margin-bottom: 8px !important;¬}¬¬.Pile > .Placeholder {¬	position: relative;¬	height: 30px;¬}¬¬.Pile > .Placeholder .suit {¬	position: relative;¬	font-size: 1.6rem;¬}¬¬.Pile > .Placeholder .suit.diamonds,¬.Pile > .Placeholder .suit.spades {¬	font-size: 1.75rem;¬	top: -0.1rem;¬}`)
