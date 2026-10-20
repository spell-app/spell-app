import { core, Thing, List, App, Drawable, DrawableList, h, position, on } from "@spell/core"
import { Card, Deck, Pile } from "@spell/project/@spell/test/cards"

core.heading("Klondike Solitaire Card Game")
//////////////////////////////////
// ## Klondike Solitaire Card Game
//////////////////////////////////
//-- See [wikipedia](https://en.wikipedia.org/wiki/Klondike_(solitaire)) for rules & naming conventions.

core.heading("Game bits")
/** Game bits */
export class Game extends App {
  static description = "A game of **Klondike**:  its piles, and its score."

  // a game has a score as a number
  static { this.declareProp("score", { type: "number" }) }
  get score() { return this.getProp("score") }
  set score(value) { this.setProp("score", value) }

  //## actions

  get state() {
    const state = []
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
      ),
      h("div", { class: "rules" },
        h("ui-markdown",
          () => `## How to play\nBuild each tableau **down**, alternating colours, and each foundation *up* from its ace.\nScore:  **${this.score}**`
        )
      )
    )
  }
}

/** set up stock pile: unplayed cards */
export class StockPile extends Pile {
  canGiveUp(card) {
    return card === this.lastItem
  }

  draw() {
    return h("div", { class: "Pile Stock stacked" },
      h("div", { class: "Placeholder ui button basic compact fluid", onClick: () => playFromTheStockPile() }),
      () => core.drawThing(this.lastItem)
    )
  }
}

/** set up discards: where played cards go when turning over stock */
export class DiscardPile extends Pile {
  canGiveUp(card) {
    return card === this.lastItem
  }

  draw() {
    return h("div", { class: "Pile Discards stacked" }, () => core.drawThing(this.lastItem))
  }
}

/** set up foundation piles: where we build up from ace => king */
export class Foundation extends Pile {
  canGiveUp(card) {
    return false
  }

  /** one card at a time:  the last of its pile */
  canTake(card) {
    if (card !== card.pile.lastItem) return false
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

/** set up tableau piles: vertical piles where we arrange from king to ace */
export class Tableau extends Pile {
  canGiveUp(card) {
    return card.isFaceUp
  }

  canTake(card) {
    if (this.isEmpty) return card.isARank("king")
    return this.color != card.color && this.value === card.value + 1
  }

  draw() {
    return h("div", { class: "Pile Tableau staggered" }, () => core.drawItems(this))
  }
}

export const game = new Game()
core.console.log(game)

core.heading("set up all piles")
/** set up all piles */
export const allPiles = new List({ instanceType: "Pile" })
export const foundations = new List({ instanceType: "Pile" })
export const tableaus = new List({ instanceType: "Pile" })

export const stock = new StockPile({ name: "stock", droppable: false })
allPiles.append(stock)

export const discards = new DiscardPile({ name: "discards", droppable: false })
allPiles.append(discards)

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

core.getRange(1, 7).forEach((number) => {
  const it5 = new Tableau({ name: `T${number}`, droppable: true })
  tableaus.append(it5)
  allPiles.append(it5)
})

/** set up deck of cards */
export const deck = new Deck()
deck.setUp()
// start with cards in the stock pile
deck.forEach((card) => stock.append(card))

core.heading("actions")
export function debugTheGame() {
  core.map(game.state, (line) => core.console.log(line))
}

export function resetTheStockPile() {
  const cards = discards.clone()
  cards.reverse()
  cards.forEach((card) => {
    stock.append(card)
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
    core.move(it5, discards)
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
      if (startPile !== stock) {
        stock.append(card)
        await core.pauseFor(50, "msec")
      }
    }
    stock.randomize()

    // deal cards into tableaus
    for (const row of core.getRange(1, 7)) {
      stock.lastItem?.turnFaceUp()
      for (const column of core.getRange(row, 7)) {
        tableaus.getItem(position(column))?.append(stock.lastItem)
        await core.pauseFor(50, "msec")
      }
    }

    await playFromTheStockPile()
  }
  finally {
    core.stopProcess("deal_the_cards")
  }
}

Card.prototype.play = async function () {
  const startPile = this.pile
  if (!core.canGiveUp(startPile, this)) return false

  if (startPile === stock) {
    playFromTheStockPile()
    return
  }

  const endPile = allPiles.filter((pile) => pile.droppable && core.canTake(pile, this)).firstItem
  if (endPile === undefined) return false

  const cardsToMove = startPile.startingWith(this)
  cardsToMove.name = startPile.name
  core.console.log(`moving (${cardsToMove.state}) to (${endPile.state})`)

  cardsToMove.forEach((card) => core.move(card, endPile))

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
    if (core.canTake(foundation, testCard)) {
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
  core.move(card, discards)
}

core.heading("rendering the bits")
resetTheGame()
if (!core.isCarryingOver) game.start()
// -----------
core.installStyles(undefined, `/* File styles.css */¬.Card {¬	position: relative;¬	height: 30px;¬}¬¬.Card .suit {¬	position: relative;¬	font-size: 1.5rem;¬	padding-left: 1px;¬	vertical-align: top;¬	top: -0.15rem;¬}¬¬.Pile {¬	position: relative;¬	min-height: 30px;¬}¬¬.Pile.Tableau {¬	min-height: 500px;¬}¬¬.Pile.stacked .Card {¬	position: absolute;¬	left: 0;¬	top: 0;¬}¬¬.Pile.staggered .Card {¬	margin-bottom: 8px !important;¬}¬¬.Pile > .Placeholder {¬	position: relative;¬	height: 30px;¬}¬¬.Pile > .Placeholder .suit {¬	position: relative;¬	font-size: 1.6rem;¬}¬¬.Pile > .Placeholder .suit.diamonds,¬.Pile > .Placeholder .suit.spades {¬	font-size: 1.75rem;¬	top: -0.1rem;¬}`)
