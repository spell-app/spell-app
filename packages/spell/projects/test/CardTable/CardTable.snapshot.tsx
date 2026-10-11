import { spellCore, Thing, List, App, Drawable, DrawableList, prop, drawn } from "@spell/core"
import { E, SpellElement } from "@spell/elements"

spellCore.heading("A card table:  a drawable list whose frame has a named place, filled by a child that says it goes there")
//## A card table:  a drawable list whose frame has a named place, filled by a child that says it goes there

export class Card extends Drawable {
  static elementTag = spellCore.defineElement(this, "test-project")

  @prop({ type: "text" }) accessor rank!: string

  @drawn
  draw() {
    return <div class="card">{this.rank}</div>
  }
}

/**
 * `<test-project-card>`:  a card, drawn in its own element, e.g. by `draw the card`.
 * - The page defines its tag with this class:  `spellCore.useElement()`, below.
 * - Its attributes are its card's properties;  its methods call its card's.
 * - What every drawable thing's element does, e.g. drawing its card, is `SpellElement`'s.
 */
export class CardElement extends SpellElement<Card> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-card", "card", [
    { name: "rank", kind: "string", description: "Its rank." }
  ])
}
spellCore.useElement(Card, CardElement)

/** its frame:  a header place, then where its cards show */
export class Pile extends DrawableList<Card> {
  static instanceType = Card
  static elementTag = spellCore.defineElement(this, "test-project")

  @prop({ type: "text" }) accessor name!: string

  @drawn
  draw() {
    return (
      <div class="pile">
        <div class="header">
          <slot name="header" />
        </div>
        <slot />
      </div>
    )
  }
}

/**
 * `<test-project-pile>`:  a pile, drawn in its own element, e.g. by `draw the pile`.
 * - The page defines its tag with this class:  `spellCore.useElement()`, below.
 * - Its attributes are its pile's properties;  its methods call its pile's.
 * - What every drawable thing's element does, e.g. drawing its pile, is `SpellElement`'s.
 */
export class PileElement extends SpellElement<Pile> {
  @E.proto static vocabulary = SpellElement.vocabularyFor("test-project-pile", "pile", [
    { name: "name", kind: "string", description: "Its name." }
  ])
}
spellCore.useElement(Pile, PileElement)

export class Table extends App {
  /**
   * a pile written by hand, its <h3> in its header place
   * - its tag is its project's and its type's:  this fixture compiles as project "test-project"
   */
  @drawn
  draw() {
    return (
      <div class="table">
        {pile.draw()}
        <test-project-pile>
          <h3 slot="header">Discards</h3>
        </test-project-pile>
      </div>
    )
  }
}
export const table = new Table()
export const pile = new Pile({ name: "Pile 1" })
pile.append(new Card({ rank: "A" }))
pile.append(new Card({ rank: "K" }))

table.start()

// each drawable type's tag, for the JSX
declare module "@solidjs/web/types/jsx.js" {
  namespace JSX {
    interface IntrinsicElements {
      /** `CardElement` */
      "test-project-card": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
      /** `PileElement` */
      "test-project-pile": HTMLAttributes<HTMLElement> & { [attribute: string]: unknown }
    }
  }
}
