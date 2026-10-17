import { core, Thing, List, App, Drawable, DrawableList, h, sendCall } from "@spell/core"
import { Card, Deck, Pile } from "@spell/project/@spell/test/cards"

//////////////////////////////////
// ## Klondike Solitaire Card Game
//////////////////////////////////
//-- See [wikipedia](https://en.wikipedia.org/wiki/Klondike_(solitaire)) for rules & naming conventions.

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
export let game

/** set up all piles */
export let allPiles
export let foundations
export let tableaus

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
export let stock

/** set up discards: where played cards go when turning over stock */
export class DiscardPile extends Pile {
  canGiveUp(card) {
    return card === this.lastItem
  }

  draw() {
    return h("div", { class: "Pile Discards stacked" }, () => core.drawThing(this.lastItem))
  }
}
export let discards

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
export let it
export let it2
export let it3
export let it4

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

/** set up deck of cards */
export let deck
// start with cards in the stock pile

export function debugTheGame(...args) {
  return sendCall("debug_the_game", args)
}

export function resetTheStockPile(...args) {
  return sendCall("reset_the_stock_pile", args)
}

export function playFromTheStockPile(...args) {
  return sendCall("play_from_the_stock_pile", args)
}

export function dealTheCards(...args) {
  return sendCall("deal_the_cards", args)
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

export function autoPlay(...args) {
  return sendCall("auto_play", args)
}

export function resetTheGame(...args) {
  return sendCall("reset_the_game", args)
}

export function cheat(...args) {
  return sendCall("cheat", args)
}

// -----------
core.installStyles(undefined, `/* File styles.css */¬.Card {¬	position: relative;¬	height: 30px;¬}¬¬.Card .suit {¬	position: relative;¬	font-size: 1.5rem;¬	padding-left: 1px;¬	vertical-align: top;¬	top: -0.15rem;¬}¬¬.Pile {¬	position: relative;¬	min-height: 30px;¬}¬¬.Pile.Tableau {¬	min-height: 500px;¬}¬¬.Pile.stacked .Card {¬	position: absolute;¬	left: 0;¬	top: 0;¬}¬¬.Pile.staggered .Card {¬	margin-bottom: 8px !important;¬}¬¬.Pile > .Placeholder {¬	position: relative;¬	height: 30px;¬}¬¬.Pile > .Placeholder .suit {¬	position: relative;¬	font-size: 1.6rem;¬}¬¬.Pile > .Placeholder .suit.diamonds,¬.Pile > .Placeholder .suit.spades {¬	font-size: 1.75rem;¬	top: -0.1rem;¬}`)

/** Binds each thing the program keeps, from Python's state. */
export function adopt(state) {
  game = state["game"]
  allPiles = state["all_piles"]
  foundations = state["foundations"]
  tableaus = state["tableaus"]
  stock = state["stock"]
  discards = state["discards"]
  it = state["it"]
  it2 = state["it_2"]
  it3 = state["it_3"]
  it4 = state["it_4"]
  deck = state["deck"]
}

