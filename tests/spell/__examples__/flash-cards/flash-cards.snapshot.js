import { core, Thing, List, App, Drawable, DrawableList, h } from "@spell/core"

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
/** A card:  a word on the front, what it means on the back */
export class FlashCard extends Drawable {
  static elementTag = core.defineElement(this, "test-project")

  // - its "front" is text
  static { this.declareProp("front", { type: "text" }) }
  get front() { return this.getProp("front") }
  set front(value) { this.setProp("front", value) }

  // - its "back" is text
  static { this.declareProp("back", { type: "text" }) }
  get back() { return this.getProp("back") }
  set back(value) { this.setProp("back", value) }

  /** which side is up */
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
      h("div", { part: "hint" }, () => this.side === "back" ? "What it means" : "Spanish"),
      h("div", { part: "word" }, () => this.isTurnedOver ? this.back : this.front)
    )
  }
}

/** the cards to learn */
export class Deck extends List {
  static instanceType = FlashCard
}

core.heading("The quiz:  the deck, the card showing, and the score")
/** The quiz:  the deck, the card showing, and the score */
export class Quiz extends App {
  // - its "deck" is a new deck
  static { this.declareProp("deck", { init: () => new Deck(), early: true }) }
  get deck() { return this.getProp("deck") }
  set deck(value) { this.setProp("deck", value) }

  /** the card showing */
  // - its "card" is a flash card
  static { this.declareProp("card", { type: "FlashCard" }) }
  get card() { return this.getProp("card") }
  set card(value) { this.setProp("card", value) }

  /** how many you knew, and how many you've tried */
  // - its "known" is a number
  static { this.declareProp("known", { type: "number" }) }
  get known() { return this.getProp("known") }
  set known(value) { this.setProp("known", value) }

  // - its "tried" is a number
  static { this.declareProp("tried", { type: "number" }) }
  get tried() { return this.getProp("tried") }
  set tried(value) { this.setProp("tried", value) }

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
  draw() {
    return h("div", { class: "Quiz" },
      h("ui-menu", { secondary: true },
        h("ui-item", { type: "header" }, "Flash Cards"),
        h("ui-item", () => this.score),
        h("ui-menu", { position: "right" },
          h("ui-item", { onClick: () => this.startOver(), style: "cursor:pointer;user-select:none" },
            h("ui-icon", { name: "redo" }),
            "Start over"
          )
        )
      ),
      () => core.drawThing(this.card),
      h("div", { class: "Answers" },
        () => !this.card.isTurnedOver ? h("ui-button", { primary: true, onClick: () => this.card.turnOver(), style: "cursor:pointer;user-select:none" },
          "Show the answer"
        ) : [
          h("ui-button", {
            positive: true,
            icon: "check",
            onClick: () => this.sayIKnew(),
            style: "cursor:pointer;user-select:none"
          }, "I knew it"),
          h("ui-button", {
            negative: true,
            basic: true,
            icon: "close",
            onClick: () => this.sayIMissed(),
            style: "cursor:pointer;user-select:none"
          }, "I missed it")
        ]
      )
    )
  }
}
export const quiz = new Quiz()

core.heading("The deck:  twelve Spanish words -- add your own")
/** The deck:  twelve Spanish words -- add your own */
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
