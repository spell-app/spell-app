import { spellCore, Thing, List, App, Drawable, DrawableList, prop, drawn } from "@spell/core"

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
