import { core, Thing, List, App, Drawable, DrawableList, h, positionOf, spellPosition, trigger, position, on } from "@spell/core"

core.heading("definition of a Card with nice english aliases for working with it")
/** definition of a Card with nice english aliases for working with it */
export class Card extends Thing {
  /////////////////////////
  // ## properties of cards
  /////////////////////////
  /** card ranks */
  // cards have a rank as one of ace, 2, 3, 4, 5, 6, 7, 8, 9, 10, jack, queen or king
  static Ranks = ["ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king"]
  static { this.declareProp("rank", { oneOf: Card.Ranks }) }
  get rank() { return this.getProp("rank") }
  set rank(value) { this.setProp("rank", value) }

  /** card suits */
  // cards have a suit as one of clubs, diamonds, hearts or spades
  static Suits = ["clubs", "diamonds", "hearts", "spades"]
  static { this.declareProp("suit", { oneOf: Card.Suits }) }
  get suit() { return this.getProp("suit") }
  set suit(value) { this.setProp("suit", value) }

  /** color as derivation of suit */
  get color() {
    if (core.includes(["diamonds", "hearts"], this.suit)) return "red"
    return "black"
  }

  /** value as a derivation of rank */
  get value() {
    return spellPosition(positionOf(Card.Ranks, this.rank))
  }

  /** card direction:  up or down */
  // a card has a direction as either up or down
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
    return core.includes(["jack", "queen", "king"], this.rank)
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

  draw() {
    const className = `Card face-${this.direction} ${this.rank} ${this.suit} ui button compact fluid `
    if (this.isFaceDown) {
      return h("div", { class: () => className, onClick: () => trigger("card-click", { card: this }) },
        h("i", { class: "fitted bicycle icon" })
      )
    }
    return h("div", { class: () => className + this.color, onClick: () => trigger("card-click", { card: this }) },
      () => `${this.shortRank} `,
      h("span", { class: "suit" }, () => this.shortSuit)
    )
  }

  /**
   * "move" a card
   * NOTE: use this rather than `add` to make sure card is only in one pile at a time
   * if you `wait for: move the card to the pile` the move will be animated
   */
  async moveToPile(pile) {
    if (this.pile !== undefined) this.pile.remove(this)
    this.pile = pile
    pile.append(this)
    await core.pauseFor(50, "msec")
  }

  async play() {
    const startPile = this.pile
    if (!startPile.canPickUpCard(this)) return false

    if (startPile === stock) {
      playFromTheStockPile()
      return
    }

    const droppablePiles = allPiles.filter((pile) => pile.droppable && pile.canPlayCard(this))
    const endPile = droppablePiles.firstItem
    if (endPile === undefined) return false

    const cardsToMove = startPile.startingWith(this)
    cardsToMove.name = startPile.name
    core.console.log(`moving (${cardsToMove.state}) to (${endPile.state})`)

    cardsToMove.forEach((card) => card.moveToPile(endPile))

    if (startPile instanceof Tableau && !startPile.isEmpty) {
      await core.pauseFor(200, "msec")
      const it = startPile.lastItem
      core.console.log(`turning over (${startPile.name}: ${it?.state})`)
      it?.turnFaceUp()
    }

    if (endPile instanceof Foundation) game.score = game.score + 10
    else if (startPile === discards) game.score = game.score + 5
    return true
  }

  // set the pile of the card to the pile
  static { this.declareProp("pile", { type: "Pile" }) }
  get pile() { return this.getProp("pile") }
  set pile(value) { this.setProp("pile", value) }
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
    core.expect(card.shortSuit, `the short-suit of the card`, "♠️", `"♠️"`)
    core.expect(card.shortRank, `the short-rank of the card`, "Q", `"Q"`)
    core.expect(card.shortName, `the short-name of the card`, "Q♠️", `"Q♠️"`)

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
    core.echo(`deck: ${cardNames}`)
  }

  // set the is-set-up of the deck to yes
  static { this.declareProp("isSetUp", { type: "choice" }) }
  get isSetUp() { return this.getProp("isSetUp") }
  set isSetUp(value) { this.setProp("isSetUp", value) }
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
    core.expect(deck.lastItem?.name, `the name of the bottom card of the deck`, "king-of-spades", `"king-of-spades"`)
    core.expect(deck.firstItem?.shortName, `the short-name of the top card of the deck`, "A♣️", `"A♣️"`)

    core.echo("the deck before shuffling:")
    core.echoTestAction(`display the deck`)
    deck.display()
    core.echoTestAction(`get the first card of the deck`)
    const it = deck.firstItem
    core.expect(it?.isTheRankOfSuits("ace", "clubs"), `it is the ace of clubs`, true, `yes`)
  })
}
if (!core.isCarryingOver) testDeckCreation()
// -----------
core.heading("Pile of playing cards")
/** Pile of playing cards */
export class Pile extends List {
  static instanceType = Card

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

  // set the name of cards-to-move to the name of the start-pile
  get name() { return this.getProp("name") }
  set name(value) { this.setProp("name", value) }
}
// -----------
core.heading("Klondike Solitaire Card Game")
//////////////////////////////////
// ## Klondike Solitaire Card Game
//////////////////////////////////
//-- See [wikipedia](https://en.wikipedia.org/wiki/Klondike_(solitaire)) for rules & naming conventions.

core.heading("Game bits")
/** Game bits */
export class Game extends App {
  // a game has a score as a number
  static { this.declareProp("score", { type: "number" }) }
  get score() { return this.getProp("score") }
  set score(value) { this.setProp("score", value) }

  //## actions

  get state() {
    let state = []
    allPiles.forEach((pile) => core.append(state, pile.state))
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
              h("td", () => core.drawThing(stock)),
              h("td", () => core.drawThing(discards)),
              h("td"),
              h("td", () => core.drawThing(foundations.firstItem)),
              h("td", () => core.drawThing(foundations.getItem(1))),
              h("td", () => core.drawThing(foundations.getItem(2))),
              h("td", () => core.drawThing(foundations.getItem(3)))
            ),
            h("tr",
              h("td", () => core.drawThing(tableaus.firstItem)),
              h("td", () => core.drawThing(tableaus.getItem(1))),
              h("td", () => core.drawThing(tableaus.getItem(2))),
              h("td", () => core.drawThing(tableaus.getItem(3))),
              h("td", () => core.drawThing(tableaus.getItem(4))),
              h("td", () => core.drawThing(tableaus.getItem(5))),
              h("td", () => core.drawThing(tableaus.getItem(6)))
            )
          )
        )
      )
    )
  }
}
export const game = new Game()
core.console.log(game)

core.heading("set up all piles")
/** set up all piles */
export const allPiles = new List({ instanceType: "Pile" })
export const foundations = new List({ instanceType: "Pile" })
export const tableaus = new List({ instanceType: "Pile" })

/** set up stock pile: unplayed cards */
export class StockPile extends Pile {
  canPickUpCard(card) {
    return card === this.lastItem
  }

  draw() {
    return h("div", { class: "Pile Stock stacked" },
      h("div", { class: "Placeholder ui button basic compact fluid", onClick: () => playFromTheStockPile() }),
      () => core.drawThing(this.lastItem)
    )
  }
}
export const stock = new StockPile({ name: "stock", droppable: false })
allPiles.append(stock)

/** set up discards: where played cards go when turning over stock */
export class DiscardPile extends Pile {
  canPickUpCard(card) {
    return card === this.lastItem
  }

  draw() {
    return h("div", { class: "Pile Discards stacked" }, () => core.drawThing(this.lastItem))
  }
}
export const discards = new DiscardPile({ name: "discards", droppable: false })
allPiles.append(discards)

/** set up foundation piles: where we build up from ace => king */
export class Foundation extends Pile {
  canPickUpCard(card) {
    return false
  }

  canPlayCard(card) {
    return this.name == card.suit && this.value + 1 === card.value
  }

  //##############
  //## rendering the bits

  // note: tableaus just draw as a (vertical) list of cards

  draw() {
    const color = this.name === "diamonds" || this.name === "hearts" ? "red" : "black"
    return h("div", { class: "Pile Foundation stacked" },
      h("div", { class: () => `Placeholder ui button basic compact fluid ${color} ${this.name}` },
        h("div", { class: () => `suit ${this.name}` }, () => this.symbol)
      ),
      () => core.drawThing(this.lastItem)
    )
  }
}
const it = new Foundation({
  name: "clubs",
  symbol: "♣️",
  droppable: true
})
foundations.append(it)
const it2 = new Foundation({
  name: "diamonds",
  symbol: "♦️",
  droppable: true
})
foundations.append(it2)
const it3 = new Foundation({
  name: "hearts",
  symbol: "♥️",
  droppable: true
})
foundations.append(it3)
const it4 = new Foundation({
  name: "spades",
  symbol: "♠️",
  droppable: true
})
foundations.append(it4)
foundations.forEach((pile) => allPiles.append(pile))

/** set up tableau piles: vertical piles where we arrange from king to ace */
export class Tableau extends Pile {
  canPickUpCard(card) {
    return card.isFaceUp
  }

  canPlayCard(card) {
    if (this.isEmpty) return card.isARank("king")
    return this.color !== card.color && this.value === card.value + 1
  }

  draw() {
    return h("div", { class: "Pile Tableau staggered" }, () => core.drawItems(this))
  }
}
core.getRange(1, 7).forEach((number) => {
  const it5 = new Tableau({ name: `Tableau${number}`, droppable: true })
  tableaus.append(it5)
  allPiles.append(it5)
})

/** set up deck of cards */
export const deck = new Deck()
deck.setUp()
// start with cards in the stock pile
deck.forEach((card) => card.moveToPile(stock))

core.heading("actions")
export function debugTheGame() {
  core.map(game.state, (line) => core.console.log(line))
}

export function resetTheStockPile() {
  const cards = discards.clone()
  cards.reverse()
  cards.forEach((card) => {
    card.moveToPile(stock)
    card.turnFaceDown()
  })
}

export async function playFromTheStockPile() {
  if (core.processIsRunning("play_from_the_stock_pile")) return
  core.startProcess("play_from_the_stock_pile", "EXCLUSIVE")
  try {
    if (stock.isEmpty) await resetTheStockPile()

    const it5 = stock.lastItem
    it5?.turnFaceUp()
    // pause for 150 msec
    it5?.moveToPile(discards)
  }
  finally {
    core.stopProcess("play_from_the_stock_pile")
  }
}

export async function dealTheCards() {
  if (core.processIsRunning("deal_the_cards")) return
  core.startProcess("deal_the_cards", "EXCLUSIVE")
  try {
    /** pull all cards into stock with a nice animation */
    const cards = allPiles.merged(Pile)
    cards.reverse()
    for (const card of cards) {
      const startPile = card.pile
      card.turnFaceDown()
      if (startPile !== stock) await card.moveToPile(stock)
    }
    stock.randomize()

    // deal cards into tableaus
    for (const row of core.getRange(1, 7)) {
      stock.lastItem?.turnFaceUp()
      for (const column of core.getRange(row, 7)) {
        await stock.lastItem?.moveToPile(tableaus.getItem(position(column)))
      }
    }

    await playFromTheStockPile()
  }
  finally {
    core.stopProcess("deal_the_cards")
  }
}

on("card-click", (event) => {
  const { card } = event
  card.play()
})

export async function autoPlay() {
  let anythingChanged = false
  if (!discards.isEmpty) {
    const testCard = discards.lastItem
    if (await testCard?.play()) {
      anythingChanged = true
      await core.pauseFor(500, "msec")
    }
  }

  // attempt to move bottom card of tableaus to foundations
  for (const pile of tableaus) {
    if (pile.isEmpty) continue
    const testCard = pile.lastItem
    const foundation = foundations.filter((pile) => pile.name == testCard.suit).firstItem
    if (foundation?.canPlayCard(testCard)) {
      anythingChanged = true
      await testCard.play()
      await core.pauseFor(100, "msec")
    }
  }

  // attempt to move the entire pile of face-up cards
  for (const pile of tableaus) {
    const faceUpCards = pile.filter((card) => card.isFaceUp)
    if (faceUpCards.isEmpty) continue
    const testCard = faceUpCards.firstItem
    if (testCard.isARank("king") && testCard === pile.firstItem) continue
    if (await testCard.play()) {
      anythingChanged = true
      await core.pauseFor(500, "msec")
    }
  }

  // call auto-play again if anything actually changed
  if (anythingChanged) await autoPlay()
}

export function resetTheGame() {
  game.score = 0
  dealTheCards()
}

export async function cheat() {
  const remainingPiles = tableaus.filter((pile) => !pile.isEmpty && pile.firstItem?.isFaceDown)
  if (remainingPiles.isEmpty) return
  const pile = remainingPiles.randomItem()
  const unplaidCards = pile?.filter((card) => card.isFaceDown)
  const card = unplaidCards?.randomItem()
  card?.turnFaceUp()
  await core.pauseFor(30, "ticks")
  card?.moveToPile(discards)
}

core.heading("rendering the bits")
resetTheGame()
if (!core.isCarryingOver) game.start()
// -----------
core.installStyles(undefined, `/* File styles.css */¬.Card {¬	position: relative;¬	height: 30px;¬}¬¬.Card .suit {¬	position: relative;¬	font-size: 1.5rem;¬	padding-left: 1px;¬	vertical-align: top;¬	top: -0.15rem;¬}¬¬.Pile {¬	position: relative;¬	min-height: 30px;¬}¬¬.Pile.Tableau {¬	min-height: 500px;¬}¬¬.Pile.stacked .Card {¬	position: absolute;¬	left: 0;¬	top: 0;¬}¬¬.Pile.staggered .Card {¬	margin-bottom: 8px !important;¬}¬¬.Pile > .Placeholder {¬	position: relative;¬	height: 30px;¬}¬¬.Pile > .Placeholder .suit {¬	position: relative;¬	font-size: 1.6rem;¬}¬¬.Pile > .Placeholder .suit.diamonds,¬.Pile > .Placeholder .suit.spades {¬	font-size: 1.75rem;¬	top: -0.1rem;¬}`)
