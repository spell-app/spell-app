import { For } from "solid-js"
import { spellCore, Thing, List, App, prop, derived, drawn } from "@spell/core"
import { Card, Deck, Pile } from "@spell/project/@test:fixtures:Cards"

spellCore.heading("Klondike Solitaire Card Game")
//////////////////////////////////
// ## Klondike Solitaire Card Game
//////////////////////////////////
//-- See [wikipedia](https://en.wikipedia.org/wiki/Klondike_(solitaire)) for rules & naming conventions.

spellCore.heading("Game bits")
/** Game bits */
export class Game extends App {
  @prop({ type: "number" }) accessor score!: number

  //## actions

  @derived
  get state() {
    const state: any /* spell: list */ = []
    spellCore.map(allPiles, (pile: Pile) => {
      spellCore.append(state, pile.state)
    })
    return state
  }

  @drawn
  draw() {
    return (
      <div class="ui container">
        <div class="board">
          <table class="ui table fixed">
            <thead>
              <tr>
                <th class="left aligned" colspan="2">Klondike Solitaire</th>
                <th class="right aligned">{`Score: ${this.score}`}</th>
                <th>
                  <div class="tiny fluid ui button compact" onClick={() => autoPlay()}>AutoPlay</div>
                </th>
                <th>
                  <div class="tiny fluid ui button compact" onClick={() => cheat()}>Cheat</div>
                </th>
                <th>
                  <div class="tiny fluid ui button compact" onClick={() => debugTheGame()}>Debug</div>
                </th>
                <th>
                  <div class="tiny fluid ui button compact" onClick={() => resetTheGame()}>Restart</div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{stock.draw()}</td>
                <td>{discards.draw()}</td>
                <td />
                <td>{spellCore.getItemOf(foundations, 1)?.draw()}</td>
                <td>{spellCore.getItemOf(foundations, 2)?.draw()}</td>
                <td>{spellCore.getItemOf(foundations, 3)?.draw()}</td>
                <td>{spellCore.getItemOf(foundations, 4)?.draw()}</td>
              </tr>
              <tr>
                <td>{spellCore.getItemOf(tableaus, 1)?.draw()}</td>
                <td>{spellCore.getItemOf(tableaus, 2)?.draw()}</td>
                <td>{spellCore.getItemOf(tableaus, 3)?.draw()}</td>
                <td>{spellCore.getItemOf(tableaus, 4)?.draw()}</td>
                <td>{spellCore.getItemOf(tableaus, 5)?.draw()}</td>
                <td>{spellCore.getItemOf(tableaus, 6)?.draw()}</td>
                <td>{spellCore.getItemOf(tableaus, 7)?.draw()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}
export const game = new Game()
spellCore.console.log(game)

spellCore.heading("set up all piles")
/** set up all piles */
export const allPiles = new List<Pile>({ instanceType: "Pile" })
export const foundations = new List<Pile>({ instanceType: "Pile" })
export const tableaus = new List<Pile>({ instanceType: "Pile" })

/** set up stock pile: unplayed cards */
export class Stock_Pile extends Pile {
  canGiveUp(card: Card) {
    return card == spellCore.getItemOf(this, -1)!
  }

  @drawn
  draw() {
    return (
      <div class="Pile Stock stacked">
        <div class="Placeholder ui button basic compact fluid" onClick={() => playFromTheStockPile()} />
        {spellCore.getItemOf(this, -1)?.draw()}
      </div>
    )
  }
}
export const stock = new Stock_Pile({ name: "stock", droppable: false })
spellCore.append(allPiles, stock)

/** set up discards: where played cards go when turning over stock */
export class Discard_Pile extends Pile {
  canGiveUp(card: Card) {
    return card == spellCore.getItemOf(this, -1)!
  }

  @drawn
  draw() {
    return <div class="Pile Discards stacked">{spellCore.getItemOf(this, -1)?.draw()}</div>
  }
}
export const discards = new Discard_Pile({ name: "discards", droppable: false })
spellCore.append(allPiles, discards)

/** set up foundation piles: where we build up from ace => king */
export class Foundation extends Pile {
  canGiveUp(card: Card) {
    return false
  }

  /** one card at a time:  the last of its pile */
  canTake(card: Card) {
    if (card != spellCore.getItemOf(card.pile, -1)!) return false
    return this.name == card.suit && this.value + 1 == card.value
  }

  //##############
  //## rendering the bits

  // note: tableaus just draw as a (vertical) list of cards

  @drawn
  draw() {
    const color = () => this.name == "diamonds" || this.name == "hearts" ? "red" : "black"
    return (
      <div class="Pile Foundation stacked">
        <div class={`Placeholder ui button basic compact fluid ${color()} ${this.name}`}>
          <div class={`suit ${this.name}`}>{this.symbol}</div>
        </div>
        {spellCore.getItemOf(this, -1)?.draw()}
      </div>
    )
  }

  declare symbol: string
}
const it = new Foundation({
  name: "clubs",
  symbol: "♣️",
  droppable: true
})
spellCore.append(foundations, it)
const it2 = new Foundation({
  name: "diamonds",
  symbol: "♦️",
  droppable: true
})
spellCore.append(foundations, it2)
const it3 = new Foundation({
  name: "hearts",
  symbol: "♥️",
  droppable: true
})
spellCore.append(foundations, it3)
const it4 = new Foundation({
  name: "spades",
  symbol: "♠️",
  droppable: true
})
spellCore.append(foundations, it4)
spellCore.map(foundations, (pile: Pile) => {
  spellCore.append(allPiles, pile)
})

/** set up tableau piles: vertical piles where we arrange from king to ace */
export class Tableau extends Pile {
  canGiveUp(card: Card) {
    return card.isFaceUp
  }

  canTake(card: Card) {
    if (spellCore.isEmpty(this)) return card.isARank("king")
    return this.color != card.color && this.value == card.value + 1
  }

  @drawn
  draw() {
    return (
      <div class="Pile Tableau staggered">
        <For each={this.items}>{(item) => item.draw()}</For>
      </div>
    )
  }
}
spellCore.map(spellCore.getRange(1, 7), (number) => {
  const it5 = new Tableau({ name: `T${number}`, droppable: true })
  spellCore.append(tableaus, it5)
  spellCore.append(allPiles, it5)
})

/** set up deck of cards */
export const deck = new Deck()
deck.setUp()
// start with cards in the stock pile
spellCore.map(deck, (card: Card) => {
  spellCore.append(stock, card)
})

spellCore.heading("actions")
export function debugTheGame() {
  spellCore.map(game.state, (line) => {
    spellCore.console.log(line)
  })
}

export function resetTheStockPile() {
  const cards = spellCore.duplicateCollection(discards, Pile) as Pile
  spellCore.reverse(cards)
  spellCore.map(cards, (card: Card) => {
    spellCore.append(stock, card)
    card.turnFaceDown()
  })
}

export async function playFromTheStockPile() {
  if (spellCore.processIsRunning("play_from_the_stock_pile")) return
  spellCore.startProcess("play_from_the_stock_pile", "EXCLUSIVE")
  try {
    if (spellCore.isEmpty(stock)) await resetTheStockPile()

    const it5 = spellCore.getItemOf(stock, -1) as Card
    it5.turnFaceUp()
    // pause for 150 msec
    spellCore.move(it5, discards)
  }
  finally {
    spellCore.stopProcess("play_from_the_stock_pile")
  }
}

export async function dealTheCards() {
  if (spellCore.processIsRunning("deal_the_cards")) return
  spellCore.startProcess("deal_the_cards", "EXCLUSIVE")
  try {
    /** pull all cards into stock with a nice animation */
    const cards = spellCore.mergeCollections(allPiles, Pile) as Pile
    spellCore.reverse(cards)
    await spellCore.forEachSequential(cards, async (card: Card) => {
      const startPile = card.pile
      card.turnFaceDown()
      if (startPile != stock) {
        spellCore.append(stock, card)
        await spellCore.pauseFor(50, "msec")
      }
    })
    spellCore.randomize(stock)

    // deal cards into tableaus
    await spellCore.forEachSequential(spellCore.getRange(1, 7), async (row) => {
      spellCore.getItemOf(stock, -1)!.turnFaceUp()
      await spellCore.forEachSequential(spellCore.getRange(row, 7), async (column) => {
        spellCore.append(spellCore.getItemOf(tableaus, column)!, spellCore.getItemOf(stock, -1)!)
        await spellCore.pauseFor(50, "msec")
      })
    })

    await playFromTheStockPile()
  }
  finally {
    spellCore.stopProcess("deal_the_cards")
  }
}

declare module "@spell/project/@test:fixtures:Cards" {
  interface Card { play(): any /* spell: type unknown */ }
}
Card.prototype.play = async function (this: Card) {
  const startPile = this.pile
  if (!spellCore.canGiveUp(startPile, this)) return false

  if (startPile == stock) {
    playFromTheStockPile()
    return
  }

  const endPile = spellCore.getItemOf(spellCore.filter(allPiles, (pile: Pile) => pile.droppable == true && spellCore.canTake(pile, this)), 1) as Pile
  if (!spellCore.isDefined(endPile)) return false

  const cardsToMove = spellCore.rangeStartingAt(startPile, spellCore.itemOf(startPile, this)!) as Pile
  cardsToMove.name = startPile.name
  spellCore.console.log(`moving (${cardsToMove.state}) to (${endPile.state})`)

  spellCore.map(cardsToMove, (card: Card) => {
    spellCore.move(card, endPile)
  })

  if (spellCore.isOfType(startPile, "Tableau") && !spellCore.isEmpty(startPile)) {
    await spellCore.pauseFor(200, "msec")
    const it = spellCore.getItemOf(startPile, -1) as Card
    spellCore.console.log(`turning over (${startPile.name}: ${it.state})`)
    it.turnFaceUp()
  }

  if (spellCore.isOfType(endPile, "Foundation")) game.score = game.score + 10
  else if (startPile == discards) game.score = game.score + 5
  return true
}

spellCore.RUNTIME.on("card-click", (event: { card: Card }) => {
  const { card } = event
  card.play()
})

export async function autoPlay() {
  let anythingChanged: boolean = false
  if (!spellCore.isEmpty(discards)) {
    const testCard = spellCore.getItemOf(discards, -1) as Card
    if (await testCard.play()) {
      anythingChanged = true
      await spellCore.pauseFor(500, "msec")
    }
  }

  // attempt to move bottom card of tableaus to foundations
  await spellCore.forEachSequential(tableaus, async (pile: Pile) => {
    if (spellCore.isEmpty(pile)) return
    const testCard = spellCore.getItemOf(pile, -1) as Card
    const foundation = spellCore.getItemOf(spellCore.filter(foundations, (pile: Pile) => pile.name == testCard.suit), 1) as Pile
    if (spellCore.canTake(foundation, testCard)) {
      anythingChanged = true
      await testCard.play()
      await spellCore.pauseFor(100, "msec")
    }
  })

  // attempt to move the entire pile of face-up cards
  await spellCore.forEachSequential(tableaus, async (pile: Pile) => {
    const faceUpCards = spellCore.filter(pile, (card: Card) => card.isFaceUp) as Pile
    if (spellCore.isEmpty(faceUpCards)) return
    const testCard = spellCore.getItemOf(faceUpCards, 1) as Card
    if (testCard.isARank("king") && testCard == spellCore.getItemOf(pile, 1)!) return
    if (await testCard.play()) {
      anythingChanged = true
      await spellCore.pauseFor(500, "msec")
    }
  })

  // call auto-play again if anything actually changed
  if (anythingChanged) await autoPlay()
}

export function resetTheGame() {
  game.score = 0
  dealTheCards()
}

export async function cheat() {
  const remainingPiles = spellCore.filter(tableaus, (pile: Pile) => !spellCore.isEmpty(pile) && spellCore.getItemOf(pile, 1)!.isFaceDown)
  if (spellCore.isEmpty(remainingPiles)) return
  const pile = spellCore.randomItemOf(remainingPiles) as Pile
  const unplaidCards = spellCore.filter(pile, (card: Card) => card.isFaceDown) as Pile
  const card = spellCore.randomItemOf(unplaidCards) as Card
  card.turnFaceUp()
  await spellCore.pauseFor(30, "ticks")
  spellCore.move(card, discards)
}

spellCore.heading("rendering the bits")
resetTheGame()
game.start()
// -----------
spellCore.installStyles(undefined, `/* File styles.css */¬.Card {¬	position: relative;¬	height: 30px;¬}¬¬.Card .suit {¬	position: relative;¬	font-size: 1.5rem;¬	padding-left: 1px;¬	vertical-align: top;¬	top: -0.15rem;¬}¬¬.Pile {¬	position: relative;¬	min-height: 30px;¬}¬¬.Pile.Tableau {¬	min-height: 500px;¬}¬¬.Pile.stacked .Card {¬	position: absolute;¬	left: 0;¬	top: 0;¬}¬¬.Pile.staggered .Card {¬	margin-bottom: 8px !important;¬}¬¬.Pile > .Placeholder {¬	position: relative;¬	height: 30px;¬}¬¬.Pile > .Placeholder .suit {¬	position: relative;¬	font-size: 1.6rem;¬}¬¬.Pile > .Placeholder .suit.diamonds,¬.Pile > .Placeholder .suit.spades {¬	font-size: 1.75rem;¬	top: -0.1rem;¬}`)
declare module "@spell/project/@test:fixtures:Cards" {
  interface Pile { name: string; droppable: boolean; canGiveUp(card: Card): boolean; canTake(card: Card): boolean }
}

