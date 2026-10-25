import { core, Thing, List, App, View, Page, TwoSidedView, ViewableList, prop, drawn } from "@spell/core"
import { E, SpellElement } from "@spell/elements"

core.heading("How Flash Cards work")
//////////////////////////
// ## How Flash Cards work
//////////////////////////
// The Flash Cards example is a deck of Spanish words to learn:
// the word on the front, what it means on the back.  Click the card to turn it over.
// Two ideas do the work:
// - a card knows which side is up, and draws only that side
// - the quiz deals the next card at random from the deck
//
// This guide keeps those two, and leaves out the score.  Open Flash Cards, in the Examples, for the whole quiz.

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

  /** which side is up:  "one of" lists every value it can have, and it can't be anything else */
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
        {this.isTurnedOver ? this.back : this.front}
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

core.heading("The quiz:  the deck, and the card showing")
/** The quiz:  the deck, and the card showing */
export class Quiz extends App {
  // - its "deck" is a new deck
  @prop({ init: () => new Deck(), early: true })
  accessor deck!: Deck

  // - its "card" is a flash card
  @prop({ type: "FlashCard" })
  accessor card!: FlashCard

  /** a card at random, front up:  never the one showing now */
  dealACard() {
    const others = this.deck.filter((card) => card !== this.card)
    this.card = others.randomItem()
    this.card.side = "front"
  }

  @drawn draw() {
    return (
      <div class="Quiz">
        {core.drawThing(this.card)}
        <ui-button primary={true} onClick={() => this.dealACard()} style="cursor:pointer;user-select:none">
          Next card
        </ui-button>
      </div>
    )
  }
}
export const quiz = new Quiz()

core.heading("The deck:  four words to start -- add your own")
/** The deck:  four words to start -- add your own */
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

core.heading("Start")
//## Start
quiz.dealACard()
if (!core.isCarryingOver) quiz.start()

core.heading("A check")
/** A check */
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
  })
}

core.heading("Try it")
////////////
// ## Try it
////////////
// - Click the card on the right to turn it over, and "Next card" for another.
// - Add a word:  copy one of the "add" lines above, and change both its words.
//   Click "Next card" until it comes up.
// - Make your own deck:  change all four lines to something you want to learn, in any language.
//
// Where next:  Flash Cards, in the Examples, which keeps score:  "I knew it" and "I missed it" buttons,
// and twelve words.
// -----------
core.installStyles(undefined, `/* File styles.css:  how the quiz looks -- a big card, with the button under it.¬   - The card, <how-flash-cards-work-flash-card>, is one big word:  its part, ::part(card). */¬¬.Quiz {¬  max-width: 22em;¬  margin-inline: auto;¬  padding-block: 2em;¬  text-align: center;¬}¬¬how-flash-cards-work-flash-card::part(card) {¬  display: grid;¬  place-items: center;¬  min-height: 8em;¬  margin-block-end: 1em;¬  border-radius: 0.75em;¬  background: rgb(127 127 127 / 0.12);¬  font-size: 2em;¬  cursor: pointer;¬  user-select: none;¬}¬`)
// -----------
if (!core.isCarryingOver) testTurningACardOver()

// each view type's tag, for the JSX
declare module "@solidjs/web/types/jsx.js" {
  namespace JSX {
    interface IntrinsicElements {
      /** `FlashCardElement` */
      "test-project-flash-card": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
    }
  }
}
