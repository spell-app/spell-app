import { spellCore, Thing, List, App, Drawable, DrawableList, h } from "@spell/core"

//## A card table:  a drawable list whose frame has a named place, filled by a child that says it goes there

export class Card extends Drawable {
  static elementTag = spellCore.defineElement(this, "test-project")

  static { this.declareProp("rank", { type: "text" }) }
  get rank() { return this.getProp("rank") }
  set rank(value) { this.setProp("rank", value) }

  draw() {
    return h("div", { class: "card" }, () => this.rank)
  }
}

/** its frame:  a header place, then where its cards show */
export class Pile extends DrawableList {
  static instanceType = Card
  static elementTag = spellCore.defineElement(this, "test-project")

  static { this.declareProp("name", { type: "text" }) }
  get name() { return this.getProp("name") }
  set name(value) { this.setProp("name", value) }

  draw() {
    return h("div", { class: "pile" },
      h("div", { class: "header" }, h("slot", { name: "header" })),
      h("slot")
    )
  }
}

export class Table extends App {
  /**
   * a pile written by hand, its <h3> in its header place
   * - its tag is its project's and its type's:  this fixture compiles as project "test-project"
   */
  draw() {
    return h("div", { class: "table" },
      () => spellCore.drawThing(pile),
      h("test-project-pile", h("h3", { slot: "header" }, "Discards"))
    )
  }
}
export let table
export let pile

/** Binds each thing the program keeps, from Python's state. */
export function adopt(state) {
  table = state["table"]
  pile = state["pile"]
}

