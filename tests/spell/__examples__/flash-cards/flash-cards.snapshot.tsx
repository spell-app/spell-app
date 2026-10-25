import { core, List, App, View, prop, drawn } from "@spell/core"
import { E, SpellElement } from "@spell/elements"

core.heading("Flash Cards")
/////////////////
// ## Flash Cards
/////////////////
// A deck of cards to learn from:  a word on the front, what it means on the back.
// Click the card to turn it over, then say whether you knew it:  the score keeps count,
// and the next card comes up at random.
// What's where, top to bottom:
//   a card:  its two sides, and turning it over
//   the quiz:  the deck, the card showing, the score, and its drawing
//   the deck:  the words to learn
//   start
//   tests

core.heading("A card:  a word on the front, what it means on the back")
export type Side = (typeof FlashCard.Sides)[number]

/** A card:  a word on the front, what it means on the back */
export class FlashCard extends View {
  static elementTag = core.defineElement(this, "test-project")

  // - its "front" is text
  @prop({ type: "text" })
  accessor front!: string

  // - its "back" is text
  @prop({ type: "text" })
  accessor back!: string

  /** which side is up */
  // - its "side" is one of front or back
  static Sides = ["front", "back"] as const
  @prop({ oneOf: () => FlashCard.Sides })
  accessor side!: Side

  get isTurnedOver() {
    return this.side === "back"
  }

  turnOver() {
    this.side = this.side === "front" ? "back" : "front"
  }

  /** one side at a time:  a click turns it over */
  @drawn draw() {
    return (
      <div part="card" onClick={() => this.turnOver()} style="cursor:pointer;user-select:none">
        <div part="hint">{this.side === "back" ? "What it means" : "Spanish"}</div>
        <div part="word">{this.isTurnedOver ? this.back : this.front}</div>
      </div>
    )
  }
}

/**
 * `<test-project-flash-card>`:  a flash card, drawn in its own element, e.g. by `draw the flash card`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its flash card's properties;  its methods call its flash card's.
 * - What every view's element does, e.g. drawing its flash card, is `SpellElement`'s.
 */
export class FlashCardElement extends SpellElement<FlashCard> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-flash-card", "flash card", [
    { name: "front", kind: "string", description: "Its front." },
    { name: "back", kind: "string", description: "Its back." },
    { name: "side", kind: "string", description: "Its side." }
  ])

  turnOver() {
    return this.currentThing?.turnOver()
  }
}
core.useElement(FlashCard, FlashCardElement)

/** the cards to learn */
export class Deck extends List<FlashCard> {
  static instanceType = FlashCard
}

core.heading("The quiz:  the deck, the card showing, and the score")
/** The quiz:  the deck, the card showing, and the score */
export class Quiz extends App {
  static elementTag = core.defineElement(this, "test-project", "App")

  // - its "deck" is a new deck
  @prop({ init: () => new Deck(), early: true })
  accessor deck!: Deck

  /** the card showing */
  // - its "card" is a flash card
  @prop({ type: "FlashCard" })
  accessor card!: FlashCard

  /** how many you knew, and how many you've tried */
  // - its "known" is a number
  @prop({ type: "number" })
  accessor known!: number

  // - its "tried" is a number
  @prop({ type: "number" })
  accessor tried!: number

  get score() {
    if (this.tried === 0) return "Nothing tried yet"
    return `${this.known} of ${this.tried} right`
  }

  /** a card from the deck at random, front up:  never the one just shown */
  dealACard() {
    const others = this.deck.filter((card) => card !== this.card)
    this.card = others.randomItem()
    this.card.side = "front"
  }

  /** you knew it, or you didn't:  counted, then the next card */
  sayIKnew() {
    this.known = this.known + 1
    this.tried = this.tried + 1
    this.dealACard()
  }

  sayIMissed() {
    this.tried = this.tried + 1
    this.dealACard()
  }

  startOver() {
    this.known = 0
    this.tried = 0
    this.dealACard()
  }

  /** the score, the card, then what you can do:  turn it over, or say how you did */
  @drawn draw() {
    return (
      <div class="Quiz">
        <ui-menu secondary={true}>
          <ui-item type="header">Flash Cards</ui-item>
          <ui-item>{this.score}</ui-item>
          <ui-menu position="right">
            <ui-item onClick={() => this.startOver()} style="cursor:pointer;user-select:none">
              <ui-icon name="redo" />
              Start over
            </ui-item>
          </ui-menu>
        </ui-menu>
        {core.drawThing(this.card)}
        <div class="Answers">
          {!this.card.isTurnedOver ? <ui-button primary={true} onClick={() => this.card.turnOver()} style="cursor:pointer;user-select:none">
            Show the answer
          </ui-button> : <>
            <ui-button positive={true} icon="check" onClick={() => this.sayIKnew()} style="cursor:pointer;user-select:none">
              I knew it
            </ui-button>
            <ui-button negative={true} basic={true} icon="close" onClick={() => this.sayIMissed()} style="cursor:pointer;user-select:none">
              I missed it
            </ui-button>
          </>}
        </div>
      </div>
    )
  }
}

/**
 * `<test-project-app>`:  a quiz, drawn in its own element, e.g. by `draw the quiz`.
 * - The page defines its tag with this class:  `core.useElement()`, below.
 * - Its attributes are its quiz's properties;  its methods call its quiz's.
 * - What every view's element does, e.g. drawing its quiz, is `SpellElement`'s.
 */
export class QuizElement extends SpellElement<Quiz> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-app", "quiz", [
    { name: "deck", kind: "json", description: "Its deck." },
    { name: "card", kind: "string", description: "Its card." },
    { name: "known", kind: "number", description: "Its known." },
    { name: "tried", kind: "number", description: "Its tried." }
  ])

  dealACard() {
    return this.currentThing?.dealACard()
  }

  sayIKnew() {
    return this.currentThing?.sayIKnew()
  }

  sayIMissed() {
    return this.currentThing?.sayIMissed()
  }

  startOver() {
    return this.currentThing?.startOver()
  }
}
core.useElement(Quiz, QuizElement)
export const quiz = new Quiz()

core.heading("The deck:  twelve Spanish words -- add your own")
/** The deck:  twelve Spanish words -- add your own */
export function addWordMeaningTranslation(word: string, translation: string) {
  quiz.deck.append(new FlashCard({
    front: word,
    back: translation,
    side: "front"
  }))
}

addWordMeaningTranslation("el gato", "the cat")
addWordMeaningTranslation("el perro", "the dog")
addWordMeaningTranslation("la casa", "the house")
addWordMeaningTranslation("el libro", "the book")
addWordMeaningTranslation("la manzana", "the apple")
addWordMeaningTranslation("el agua", "the water")
addWordMeaningTranslation("la luna", "the moon")
addWordMeaningTranslation("el sol", "the sun")
addWordMeaningTranslation("la playa", "the beach")
addWordMeaningTranslation("el tren", "the train")
addWordMeaningTranslation("la llave", "the key")
addWordMeaningTranslation("la mariposa", "the butterfly")

core.heading("Start")
//## Start
quiz.startOver()
if (!core.isCarryingOver) quiz.start()

core.heading("Tests")
/** Tests */
export function testTurningACardOver() {
  return core.test("test turning a card over", function testTurningACardOver() {
    core.echoTestAction(`set the card to a new flash card with front = "el gato", back = "the cat", side = front`)
    const card = new FlashCard({
      front: "el gato",
      back: "the cat",
      side: "front"
    })
    core.expect(card.isTurnedOver, `the card is turned over`, false, `no`)
    core.echoTestAction(`turn the card over`)
    card.turnOver()
    core.expect(card.isTurnedOver, `the card is turned over`, true, `yes`)
    core.echoTestAction(`turn the card over`)
    card.turnOver()
    core.expect(card.side, `the side of the card`, "front", `front`)
  })
}
// -----------
core.installStyles(undefined, `/* File styles.css:  how the quiz looks.¬   - The card showing, <flash-cards-flash-card>, draws one side at a time:  ::part(card) holds its hint and its word.¬   - Turned over, it says so:  its side is an attribute, [side="back"]. */¬¬.Quiz {¬  max-width: 30em;¬  margin-inline: auto;¬  padding-block: 1em;¬}¬¬/****************¬ * The card:  big, centred, a different tint on its back¬ ****************/¬¬flash-cards-flash-card {¬  display: block;¬  margin-block: 1.5em;¬}¬¬flash-cards-flash-card::part(card) {¬  display: flex;¬  flex-direction: column;¬  align-items: center;¬  justify-content: center;¬  gap: 0.5em;¬  min-height: 12em;¬  padding: 1.5em;¬  border-radius: 1em;¬  background: rgb(33 133 208 / 0.1);¬  box-shadow: 0 0.25em 1em rgb(0 0 0 / 0.08);¬  cursor: pointer;¬}¬¬flash-cards-flash-card[side="back"]::part(card) {¬  background: rgb(33 186 69 / 0.12);¬}¬¬flash-cards-flash-card::part(hint) {¬  opacity: 0.6;¬  font-size: 0.85em;¬  letter-spacing: 0.05em;¬  text-transform: uppercase;¬}¬¬flash-cards-flash-card::part(word) {¬  font-size: 2.2em;¬  font-weight: bold;¬}¬¬/****************¬ * What you can do:  turn it over, or say how you did¬ ****************/¬¬.Answers {¬  display: flex;¬  justify-content: center;¬  gap: 0.75em;¬  min-height: 2.75em;¬}¬`)
// -----------
if (!core.isCarryingOver) testTurningACardOver()

// each view type's tag, for the JSX
declare module "@solidjs/web/types/jsx.js" {
  namespace JSX {
    interface IntrinsicElements {
      /** `FlashCardElement` */
      "test-project-flash-card": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
      /** `QuizElement` */
      "test-project-app": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
    }
  }
}
