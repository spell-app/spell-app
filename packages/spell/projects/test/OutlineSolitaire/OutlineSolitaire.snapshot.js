import { spellCore, Thing, List, App, h, positionOf, trigger, on } from "@spell/core"

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

  setUp() {
    if (this.is_set_up) { return }
    Deck.Ranks.forEach((rank) => {
      Deck.Suits.forEach((suit) => {
        let it = new Card({ rank: rank, suit: suit })
        this.append(it)
      })
    })
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
Deck.Suits = ['clubs', 'diamonds', 'hearts', 'spades']
export class Suit {
  static color(suit) {
    if (spellCore.includes(['diamonds', 'hearts'], suit)) { return 'red' }
    return 'black'
  }
}
Deck.Ranks = ['ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'jack', 'queen', 'king']
export class Rank {
  static isAFaceCard(rank) {
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
  isASuit(suit) {
    return this.suit === suit
  }

  static { this.declareProp('rank', { oneOf: () => {
    return Deck.Ranks
  } }) }
  get rank() { return this.getProp('rank') }
  set rank(value) { this.setProp('rank', value) }

  /** e.g. "the card is a queen" */
  isARank(rank) {
    return this.rank === rank
  }

  /** e.g. "the card is the queen of spades" */
  isTheRankOfSuits(rank, suit) {
    return this.rank === rank && this.suit === suit
  }

  get isAFaceCard() {
    return Rank.isAFaceCard(this.rank)
  }

  get value() {
    return positionOf(Deck.Ranks, this.rank)
  }

  /** direction */
  static Directions = ['up', 'down']
  static { this.declareProp('direction', { oneOf: Card.Directions }) }
  get direction() { return this.getProp('direction') }
  set direction(value) { this.setProp('direction', value) }

  get isFaceUp() {
    return (this.direction == 'up')
  }

  get isFaceDown() {
    return (this.direction == 'down')
  }

  /** names */
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

  /** drawing */
  get front() {
    return h("div", {
      class: () => `Card face-up ${this.rank} ${this.suit} ui button compact fluid ${this.color}`,
      onClick: (event) => {
        return trigger('card-click', { card: this })
      }
    },
      () => `${this.shortRank} `,
      h("span", { class: "suit" }, () => this.shortSuit)
    )
  }

  get back() {
    return h("div", {
      class: () => `Card face-down ${this.rank} ${this.suit} ui button compact fluid`,
      onClick: (event) => {
        return trigger('card-click', { card: this })
      }
    }, h("i", { class: "fitted bicycle icon" }))
  }
  draw() {
    return (this.direction === 'down' ? this.back : this.front)
  }

  //## actions -- the sentence style, beside the outline

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

  async play() {
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
  })
}
testCardSetup()
// -----------
Deck.declareProp('is_set_up', { type: 'choice' })
Object.defineProperty(Deck.prototype, 'is_set_up', {
  get() { return this.getProp('is_set_up') },
  set(value) { this.setProp('is_set_up', value) },
  configurable: true
})
spellCore.heading("Dealing:  what a deck does -- after `Card.spell`, as it reads a card's names")
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
  })
}
testDeckCreation()
// -----------
spellCore.heading("Pile of playing cards")
/** Pile of playing cards */
export class Pile extends List {
  static instanceType = Card

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
    allPiles.forEach((pile) => {
      spellCore.append(state, pile.state)
    })
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
              h("th",
                h("div", {
                  class: "tiny fluid ui button compact",
                  onClick: (event) => {
                    return autoPlay()
                  }
                }, "AutoPlay")
              ),
              h("th",
                h("div", {
                  class: "tiny fluid ui button compact",
                  onClick: (event) => {
                    return cheat()
                  }
                }, "Cheat")
              ),
              h("th",
                h("div", {
                  class: "tiny fluid ui button compact",
                  onClick: (event) => {
                    return debugTheGame()
                  }
                }, "Debug")
              ),
              h("th",
                h("div", {
                  class: "tiny fluid ui button compact",
                  onClick: (event) => {
                    return resetTheGame()
                  }
                }, "Restart")
              )
            )
          ),
          h("tbody",
            h("tr",
              h("td", () => spellCore.drawThing(stock)),
              h("td", () => spellCore.drawThing(discards)),
              h("td"),
              h("td", () => spellCore.drawThing(foundations.firstItem)),
              h("td", () => spellCore.drawThing(foundations.getItem(2))),
              h("td", () => spellCore.drawThing(foundations.getItem(3))),
              h("td", () => spellCore.drawThing(foundations.getItem(4)))
            ),
            h("tr",
              h("td", () => spellCore.drawThing(tableaus.firstItem)),
              h("td", () => spellCore.drawThing(tableaus.getItem(2))),
              h("td", () => spellCore.drawThing(tableaus.getItem(3))),
              h("td", () => spellCore.drawThing(tableaus.getItem(4))),
              h("td", () => spellCore.drawThing(tableaus.getItem(5))),
              h("td", () => spellCore.drawThing(tableaus.getItem(6))),
              h("td", () => spellCore.drawThing(tableaus.getItem(7)))
            )
          )
        )
      )
    )
    
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
    return h("div", { class: "Pile Stock stacked" },
      h("div", {
        class: "Placeholder ui button basic compact fluid",
        onClick: (event) => {
          return playFromTheStockPile()
        }
      }),
      () => spellCore.drawThing(this.lastItem)
    )
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
    return h("div", { class: "Pile Discards stacked" }, () => spellCore.drawThing(this.lastItem))
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
    return h("div", { class: "Pile Foundation stacked" },
      h("div", { class: () => `Placeholder ui button basic compact fluid ${color} ${this.name}` },
        h("div", { class: () => `suit ${this.name}` }, () => this.symbol)
      ),
      () => spellCore.drawThing(this.lastItem)
    )
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
    return h("div", { class: "Pile Tableau staggered" }, () => spellCore.drawItems(this))
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
