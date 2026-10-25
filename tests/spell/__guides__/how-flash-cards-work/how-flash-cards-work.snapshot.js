import { core, Thing, List, App, View, Page, TwoSidedView, ViewableList, h } from "@spell/core"

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
/** A card:  a word on the front, what it means on the back */
export class FlashCard extends View {
  static elementTag = core.defineElement(this, "test-project")

  // - its "front" is text
  static { this.declareProp("front", { type: "text" }) }
  get front() { return this.getProp("front") }
  set front(value) { this.setProp("front", value) }

  // - its "back" is text
  static { this.declareProp("back", { type: "text" }) }
  get back() { return this.getProp("back") }
  set back(value) { this.setProp("back", value) }

  /** which side is up:  "one of" lists every value it can have, and it can't be anything else */
  // - its "side" is one of front or back
  static Sides = ["front", "back"]
  static { this.declareProp("side", { oneOf: FlashCard.Sides }) }
  get side() { return this.getProp("side") }
  set side(value) { this.setProp("side", value) }

  get isTurnedOver() {
    return this.side === "back"
  }

  turnOver() {
    this.side = this.side === "front" ? "back" : "front"
  }

  /** one side at a time:  a click turns it over */
  draw() {
    return h("div", { part: "card", onClick: () => this.turnOver(), style: "cursor:pointer;user-select:none" },
      () => this.isTurnedOver ? this.back : this.front
    )
  }
}

/** the cards to learn */
export class Deck extends List {
  static instanceType = FlashCard
}

core.heading("The quiz:  the deck, and the card showing")
/** The quiz:  the deck, and the card showing */
export class Quiz extends App {
  // - its "deck" is a new deck
  static { this.declareProp("deck", { init: () => new Deck(), early: true }) }
  get deck() { return this.getProp("deck") }
  set deck(value) { this.setProp("deck", value) }

  // - its "card" is a flash card
  static { this.declareProp("card", { type: "FlashCard" }) }
  get card() { return this.getProp("card") }
  set card(value) { this.setProp("card", value) }

  /** a card at random, front up:  never the one showing now */
  dealACard() {
    const others = this.deck.filter((card) => card !== this.card)
    this.card = others.randomItem()
    this.card.side = "front"
  }

  draw() {
    return h("div", { class: "Quiz" },
      () => core.drawThing(this.card),
      h("ui-button", { primary: true, onClick: () => this.dealACard(), style: "cursor:pointer;user-select:none" },
        "Next card"
      )
    )
  }
}
export const quiz = new Quiz()

core.heading("The deck:  four words to start -- add your own")
/** The deck:  four words to start -- add your own */
export function addWordMeaningTranslation(word, translation) {
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
