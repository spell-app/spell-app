import { core, Thing, List, App, Drawable, DrawableList, prop, thing, drawn, css, position, on } from "@spell/core"
import { E, SpellElement } from "@spell/elements"
import { Card, Suit, Rank, Deck, Pile } from "@spell/project/@spell/library/cards"

core.heading("Klondike Solitaire")
////////////////////////
// ## Klondike Solitaire
////////////////////////
//-- See [wikipedia](https://en.wikipedia.org/wiki/Klondike_(solitaire)) for its rules, and what each pile is called.
// The cards, the deck and the piles are the cards library's, `@spell/library/cards`:
// this file adds the game, its kinds of piles, what each may take or give up, and how each is laid out.
// What's where, top to bottom:
//   the solitaire:  its piles, its moves, auto play and drawing
//   playing a card:  what a click does
//   start
//   the piles:  each kind, what it may take or give up, and how it draws
//   tests

core.heading("The solitaire:  its piles, its moves, auto play and drawing")
/** a stacked pile:  its cards on top of each other, the last one showing, over a place for the first */
export class StackedPile extends Pile {
  static elementTag = core.defineElement(this, "test-project")

  static css = css`
    :host {
    	display: block;
    	position: relative;
    	min-height: 6.5rem;
    }
    /* where its first card goes:  a card-sized outline */
    .Placeholder {
    	position: absolute;
    	top: 1.5rem;
    	left: 0.3rem;
    	width: 4.25rem;
    	height: 5.65rem;
    	box-sizing: border-box;
    	border: 2px dashed #c8c8c8;
    	border-radius: 0.4rem;
    	display: flex;
    	align-items: center;
    	justify-content: center;
    	font-size: 2rem;
    	cursor: pointer;
    }
    ::slotted(*) {
    	position: absolute;
    	top: 0;
    	left: 0;
    }
  `
}

/**
 * `<test-project-stacked-pile>`:  a stacked pile, drawn in its own element, e.g. by `draw the stacked pile`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its stacked pile's properties;  its methods call its stacked pile's.
 * - What every drawable thing's element does, e.g. drawing its stacked pile, is `SpellElement`'s.
 */
export class StackedPileElement extends SpellElement<StackedPile> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-stacked-pile", "stacked pile", [])
  @E.protoMerged static elementSetup = {
    styleSheets: { "test-project-stacked-pile": StackedPile.css }
  } satisfies Partial<E.ElementSetup>
}
core.useElement(StackedPile, StackedPileElement)

/** the stock:  the cards not played yet, face down;  a click turns the next one over */
export class StockPile extends StackedPile {
  static elementTag = core.defineElement(this, "test-project")

  canTake(card: Card) {
    return false
  }

  canGiveUp(card: Card) {
    return card === this.lastItem
  }

  @drawn draw() {
    return (
      <div class="Stock">
        <div class="Placeholder" onClick={() => solitaire.playFromTheStock()} />
        <slot />
      </div>
    )
  }
}

/**
 * `<test-project-stock-pile>`:  a stock pile, drawn in its own element, e.g. by `draw the stock pile`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its stock pile's properties;  its methods call its stock pile's.
 * - What every drawable thing's element does, e.g. drawing its stock pile, is `SpellElement`'s.
 */
export class StockPileElement extends SpellElement<StockPile> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-stock-pile", "stock pile", [])

  canTake(card: Card) {
    return this.currentThing?.canTake(card)
  }

  canGiveUp(card: Card) {
    return this.currentThing?.canGiveUp(card)
  }
}
core.useElement(StockPile, StockPileElement)

/** the discards:  where the stock's cards go as they're turned over */
export class DiscardPile extends StackedPile {
  static elementTag = core.defineElement(this, "test-project")

  canTake(card: Card) {
    return false
  }

  canGiveUp(card: Card) {
    return card === this.lastItem
  }
}

/**
 * `<test-project-discard-pile>`:  a discard pile, drawn in its own element, e.g. by `draw the discard pile`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its discard pile's properties;  its methods call its discard pile's.
 * - What every drawable thing's element does, e.g. drawing its discard pile, is `SpellElement`'s.
 */
export class DiscardPileElement extends SpellElement<DiscardPile> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-discard-pile", "discard pile", [])

  canTake(card: Card) {
    return this.currentThing?.canTake(card)
  }

  canGiveUp(card: Card) {
    return this.currentThing?.canGiveUp(card)
  }
}
core.useElement(DiscardPile, DiscardPileElement)

/** a foundation:  where a suit is built up, ace to king */
export class Foundation extends StackedPile {
  static elementTag = core.defineElement(this, "test-project")

  // - its "suit" is a suit
  @prop({ oneOf: () => Card.Suits })
  accessor suit!: (typeof Card.Suits)[number]

  canGiveUp(card: Card) {
    return false
  }

  /** one card at a time:  the last of its pile */
  canTake(card: Card) {
    if (card !== card.pile.lastItem) return false
    return this.suit === card.suit && this.value + 1 === card.value
  }

  @drawn draw() {
    return (
      <div class="Foundation">
        <div class="Placeholder">{Suit.symbol(this.suit)}</div>
        <slot />
      </div>
    )
  }
}

/**
 * `<test-project-foundation>`:  a foundation, drawn in its own element, e.g. by `draw the foundation`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its foundation's properties;  its methods call its foundation's.
 * - What every drawable thing's element does, e.g. drawing its foundation, is `SpellElement`'s.
 */
export class FoundationElement extends SpellElement<Foundation> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-foundation", "foundation", [
    { name: "suit", kind: "string", description: "Its suit." }
  ])

  canGiveUp(card: Card) {
    return this.currentThing?.canGiveUp(card)
  }

  canTake(card: Card) {
    return this.currentThing?.canTake(card)
  }
}
core.useElement(Foundation, FoundationElement)

/** a tableau:  a column, built down from king to ace, red and black in turn */
export class Tableau extends Pile {
  static elementTag = core.defineElement(this, "test-project")

  canGiveUp(card: Card) {
    return card.isFaceUp
  }

  canTake(card: Card) {
    if (this.isEmpty) return card.isARank("king")
    return this.color != card.color && this.value === card.value + 1
  }

  static css = css`
    :host {
    	display: block;
    	min-height: 30rem;
    }
    /* each card below the one before, its top showing;  the last one whole */
    ::slotted(*) {
    	display: block;
    }
    ::slotted(:not(:last-child)) {
    	height: 2.6rem;
    	overflow: hidden;
    }
  `
}

/**
 * `<test-project-tableau>`:  a tableau, drawn in its own element, e.g. by `draw the tableau`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its tableau's properties;  its methods call its tableau's.
 * - What every drawable thing's element does, e.g. drawing its tableau, is `SpellElement`'s.
 */
export class TableauElement extends SpellElement<Tableau> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-tableau", "tableau", [])
  @E.protoMerged static elementSetup = {
    styleSheets: { "test-project-tableau": Tableau.css }
  } satisfies Partial<E.ElementSetup>

  canGiveUp(card: Card) {
    return this.currentThing?.canGiveUp(card)
  }

  canTake(card: Card) {
    return this.currentThing?.canTake(card)
  }
}
core.useElement(Tableau, TableauElement)

/** The solitaire:  its piles, its moves, auto play and drawing */
@thing
export class Solitaire extends App {
  // - its "score" is a number
  @prop({ type: "number" })
  accessor score!: number

  // - its "deck" is a new deck
  @prop({ init: () => new Deck(), early: true })
  accessor deck!: Deck

  /** one of each pile, made with the solitaire */
  // - its "stock" is a new stock pile with name = "stock"
  @prop({ init: () => new StockPile({ name: "stock" }), early: true })
  accessor stock!: StockPile

  // - its "discards" is a new discard pile with name = "discards"
  @prop({ init: () => new DiscardPile({ name: "discards" }), early: true })
  accessor discards!: DiscardPile

  // - its "clubs" is a new foundation with name = "clubs", suit = clubs
  @prop({ init: () => new Foundation({ name: "clubs", suit: "clubs" }), early: true })
  accessor clubs!: Foundation

  // - its "diamonds" is a new foundation with name = "diamonds", suit = diamonds
  @prop({ init: () => new Foundation({ name: "diamonds", suit: "diamonds" }), early: true })
  accessor diamonds!: Foundation

  // - its "hearts" is a new foundation with name = "hearts", suit = hearts
  @prop({ init: () => new Foundation({ name: "hearts", suit: "hearts" }), early: true })
  accessor hearts!: Foundation

  // - its "spades" is a new foundation with name = "spades", suit = spades
  @prop({ init: () => new Foundation({ name: "spades", suit: "spades" }), early: true })
  accessor spades!: Foundation

  // - its "T1" is a new tableau with name = "T1"
  @prop({ init: () => new Tableau({ name: "T1" }), early: true })
  accessor T1!: Tableau

  // - its "T2" is a new tableau with name = "T2"
  @prop({ init: () => new Tableau({ name: "T2" }), early: true })
  accessor T2!: Tableau

  // - its "T3" is a new tableau with name = "T3"
  @prop({ init: () => new Tableau({ name: "T3" }), early: true })
  accessor T3!: Tableau

  // - its "T4" is a new tableau with name = "T4"
  @prop({ init: () => new Tableau({ name: "T4" }), early: true })
  accessor T4!: Tableau

  // - its "T5" is a new tableau with name = "T5"
  @prop({ init: () => new Tableau({ name: "T5" }), early: true })
  accessor T5!: Tableau

  // - its "T6" is a new tableau with name = "T6"
  @prop({ init: () => new Tableau({ name: "T6" }), early: true })
  accessor T6!: Tableau

  // - its "T7" is a new tableau with name = "T7"
  @prop({ init: () => new Tableau({ name: "T7" }), early: true })
  accessor T7!: Tableau

  /**
   * once, as the solitaire is made:  every card of the deck into the stock
   * - its deck and piles are made with it, before this runs
   * - inside the loop `it` is the card:  so the stock is `the stock of solitaire`
   */
  create() {
    this.deck.forEach((card) => this.stock.append(card))
  }

  /** print each pile's cards, e.g. "stock: Q♠️— 7♥️—" */
  debug() {
    core.map(core.everyThing(Pile), (pile: Pile) => core.console.log(pile.state))
  }

  /** the discards, turned over, back into the stock */
  resetTheStock() {
    const cards = this.discards.clone()
    cards.reverse()
    cards.forEach((card) => {
      this.stock.append(card)
      card.turnFaceDown()
    })
  }

  /** turn the stock's next card over, onto the discards */
  async playFromTheStock() {
    if (core.processIsRunning("play_from_the_stock")) return
    core.startProcess("play_from_the_stock", "EXCLUSIVE")
    try {
      if (this.stock.isEmpty) await this.resetTheStock()

      const it = this.stock.lastItem
      it?.turnFaceUp()
      this.discards.append(it!)
    }
    finally {
      core.stopProcess("play_from_the_stock")
    }
  }

  /** gather every card of its deck into the stock, shuffle it, and deal the tableaus:  one card more in each, left to right */
  async dealTheCards() {
    if (core.processIsRunning("deal_the_cards")) return
    core.startProcess("deal_the_cards", "EXCLUSIVE")
    try {
      for (const card of this.deck) {
        const startPile = card.pile
        card.turnFaceDown()
        if (startPile !== this.stock) {
          this.stock.append(card)
          await core.pauseFor(50, "msec")
        }
      }
      this.stock.randomize()

      for (const row of core.getRange(1, 7)) {
        this.stock.lastItem?.turnFaceUp()
        for (const column of core.getRange(row, 7)) {
          core.getItemAt(core.everyThing(Tableau), position(column))?.append(this.stock.lastItem!)
          await core.pauseFor(50, "msec")
        }
      }

      await this.playFromTheStock()
    }
    finally {
      core.stopProcess("deal_the_cards")
    }
  }

  startANewGame() {
    this.score = 0
    this.dealTheCards()
  }

  /** turn up a face-down card from a tableau, at random, onto the discards */
  async cheat() {
    const remainingPiles = core.filter(core.everyThing(Tableau), (pile: Tableau) => !pile.isEmpty && pile.firstItem?.isFaceDown)
    if (core.isEmpty(remainingPiles)) return
    const pile = core.randomItemOf<Tableau>(remainingPiles)
    const hiddenCards = pile?.filter((card) => card.isFaceDown)
    const card = hiddenCards?.randomItem()
    card?.turnFaceUp()
    await core.pauseFor(30, "ticks")
    this.discards.append(card!)
  }

  /** play every card that can go somewhere, until none can */
  async autoPlay() {
    let anythingChanged: boolean = false
    if (!this.discards.isEmpty) {
      const testCard = this.discards.lastItem
      if (await testCard?.play()) {
        anythingChanged = true
        await core.pauseFor(500, "msec")
      }
    }

    // each tableau's last card onto its foundation
    await core.forEachSequential(core.everyThing(Tableau), async (pile: Tableau) => {
      if (pile.isEmpty) return
      const testCard = pile.lastItem!
      const foundation = core.filter<Foundation>(core.everyThing(Foundation), (pile: Foundation) => pile.suit == testCard.suit).firstItem
      if (core.canTake(foundation!, testCard)) {
        anythingChanged = true
        await testCard.play()
        await core.pauseFor(100, "msec")
      }
    })

    // each tableau's face-up cards, all together, onto another tableau
    await core.forEachSequential(core.everyThing(Tableau), async (pile: Tableau) => {
      const faceUpCards = pile.filter((card) => card.isFaceUp)
      if (faceUpCards.isEmpty) return
      const testCard = faceUpCards.firstItem!
      if (testCard.isARank("king") && testCard == pile.firstItem) return
      if (await testCard.play()) {
        anythingChanged = true
        await core.pauseFor(500, "msec")
      }
    })

    if (anythingChanged) await this.autoPlay()
  }

  @drawn draw() {
    return (
      <ui-container>
        <ui-menu>
          <ui-item type="header">Klondike Solitaire</ui-item>
          <ui-item>{`Score: ${this.score}`}</ui-item>
          <ui-menu position="right">
            <ui-item onClick={() => this.autoPlay()}>AutoPlay</ui-item>
            <ui-item onClick={() => this.cheat()}>Cheat</ui-item>
            <ui-item onClick={() => this.debug()}>Debug</ui-item>
            <ui-item onClick={() => this.startANewGame()}>Restart</ui-item>
          </ui-menu>
        </ui-menu>
        <ui-grid columns="7">
          <ui-row>
            <ui-column>{this.stock.draw()}</ui-column>
            <ui-column>{this.discards.draw()}</ui-column>
            <ui-column />
            <ui-column>{this.clubs.draw()}</ui-column>
            <ui-column>{this.diamonds.draw()}</ui-column>
            <ui-column>{this.hearts.draw()}</ui-column>
            <ui-column>{this.spades.draw()}</ui-column>
          </ui-row>
          <ui-row>
            <ui-column>{this.T1.draw()}</ui-column>
            <ui-column>{this.T2.draw()}</ui-column>
            <ui-column>{this.T3.draw()}</ui-column>
            <ui-column>{this.T4.draw()}</ui-column>
            <ui-column>{this.T5.draw()}</ui-column>
            <ui-column>{this.T6.draw()}</ui-column>
            <ui-column>{this.T7.draw()}</ui-column>
          </ui-row>
        </ui-grid>
      </ui-container>
    )
  }
}
export const solitaire = new Solitaire()

core.heading("Playing a card:  what a click does")
////////////////////////////////////////
// ## Playing a card:  what a click does
////////////////////////////////////////
/** the card, and every card on it, onto the first pile that can take it;  it says whether it moved */
declare module "@spell/project/@spell/library/cards" {
  interface Card { play(): Promise<boolean | undefined> }
}
Card.prototype.play = async function (this: Card) {
  const startPile = this.pile
  if (!core.canGiveUp(startPile, this)) return false

  if (startPile === solitaire.stock) {
    solitaire.playFromTheStock()
    return
  }

  const endPile = core.filter<Pile>(core.everyThing(Pile), (pile: Pile) => core.canTake(pile, this)).firstItem
  if (endPile === undefined) return false

  const movingCards = startPile.startingWith(this)
  movingCards.name = startPile.name
  core.console.log(`moving (${movingCards.state}) to (${endPile.state})`)

  movingCards.forEach((card) => core.move(card, endPile))

  if (startPile instanceof Tableau && !startPile.isEmpty) {
    await core.pauseFor(200, "msec")
    const it = startPile.lastItem
    core.console.log(`turning over (${startPile.name}: ${it?.state})`)
    it?.turnFaceUp()
  }

  if (endPile instanceof Foundation) solitaire.score = solitaire.score + 10
  else if (startPile === solitaire.discards) solitaire.score = solitaire.score + 5
  return true
}

on<{ card: Card }>("card-click", ({ card }) => card.play())

core.heading("Start")
//## Start
core.console.log(solitaire)
solitaire.startANewGame()
if (!core.isCarryingOver) solitaire.start()

core.heading("The piles:  each kind, what it may take or give up, and how it draws")
//////////////////////////////////////////////////////////////////////////
// ## The piles:  each kind, what it may take or give up, and how it draws
//////////////////////////////////////////////////////////////////////////
// Each pile is a drawable list:  an element of its own, e.g. `<solitaire-tableau>`, around its cards' elements.
// So each kind styles itself, in its `<css>`, and where its cards go:  styles.css can't reach inside it.

core.heading("Tests")
/** Tests */
export function testTheMoves() {
  return core.test("test the moves", function testTheMoves() {
    core.echoTestAction(`set the column to a new tableau with name = "T1"`)
    let column = new Tableau({ name: "T1" })
    core.echoTestAction(`set the king to a new card whose rank is king, suit is spades and direction is up`)
    const king = new Card({
      rank: "king",
      suit: "spades",
      direction: "up"
    })
    core.echoTestAction(`set the queen to a new card whose rank is queen, suit is hearts and direction is up`)
    const queen = new Card({
      rank: "queen",
      suit: "hearts",
      direction: "up"
    })
    core.echoTestAction(`set the jack to a new card whose rank is jack, suit is clubs and direction is up`)
    const jack = new Card({
      rank: "jack",
      suit: "clubs",
      direction: "up"
    })
    // an empty tableau takes only a king, then one lower in the other color
    core.expect(core.canTake(column, queen), `the column can take the queen`, false, `no`)
    core.expect(core.canTake(column, king), `the column can take the king`, true, `yes`)
    core.echoTestAction(`add the king to the column`)
    column.append(king)
    core.expect(core.canTake(column, jack), `the column can take the jack`, false, `no`)
    core.expect(core.canTake(column, queen), `the column can take the queen`, true, `yes`)
    core.echoTestAction(`add the queen to the column`)
    column.append(queen)
    core.expect(column.state, `the state of the column`, "T1: K♠️+ Q♥️+", `"T1: K♠️+ Q♥️+"`)
    core.expect(core.canGiveUp(column, queen), `the column can give up the queen`, true, `yes`)
    core.echoTestAction(`turn the queen face down`)
    queen.turnFaceDown()
    core.expect(core.canGiveUp(column, queen), `the column can give up the queen`, false, `no`)

    /** a foundation takes its suit, ace first, then one higher:  each the last card of its pile */
    const foundation = new Foundation({ name: "hearts", suit: "hearts" })
    core.echoTestAction(`set the two to a new card whose rank is 2, suit is hearts and direction is up`)
    const two = new Card({
      rank: 2,
      suit: "hearts",
      direction: "up"
    })
    core.echoTestAction(`set the ace to a new card whose rank is ace, suit is hearts and direction is up`)
    const ace = new Card({
      rank: "ace",
      suit: "hearts",
      direction: "up"
    })
    core.echoTestAction(`set the column to a new tableau with name = "T2"`)
    column = new Tableau({ name: "T2" })
    core.echoTestAction(`add the two to the column`)
    column.append(two)
    core.echoTestAction(`add the ace to the column`)
    column.append(ace)
    core.expect(core.canTake(foundation, two), `the foundation can take the two`, false, `no`)
    core.expect(core.canTake(foundation, ace), `the foundation can take the ace`, true, `yes`)
    core.echoTestAction(`move the ace to the foundation`)
    core.move(ace, foundation)
    core.expect(core.canTake(foundation, two), `the foundation can take the two`, true, `yes`)
    core.echoTestAction(`add the queen to the column`)
    column.append(queen)
    core.expect(core.canTake(foundation, queen), `the foundation can take the queen`, false, `no`)
  })
}
// -----------
core.installStyles(undefined, `/* File styles.css:  the board's own styles.¬   Each kind of pile styles itself, and where its cards go:  its <css>, in Solitaire.spell.¬   A pile is a drawable list, drawn in its own element's shadow root, which styles here can't reach. */¬`)
// -----------
if (!core.isCarryingOver) testTheMoves()

// each drawable type's tag, for the JSX
declare module "@solidjs/web/types/jsx.js" {
  namespace JSX {
    interface IntrinsicElements {
      /** `StackedPileElement` */
      "test-project-stacked-pile": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
      /** `StockPileElement` */
      "test-project-stock-pile": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
      /** `DiscardPileElement` */
      "test-project-discard-pile": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
      /** `FoundationElement` */
      "test-project-foundation": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
      /** `TableauElement` */
      "test-project-tableau": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
    }
  }
}
declare module "@spell/project/@spell/library/cards" {
  interface Pile {
    canTake(card: Card): boolean
    canGiveUp(card: Card): boolean
  }
}

