import { spellCore, Thing, List, App, Drawable, DrawableList } from "@spell/core"

spellCore.heading("Thing references:  one thing by its type and its name, or its place")
/////////////////////////////////////////////////////////////////////////
// ## Thing references:  one thing by its type and its name, or its place
/////////////////////////////////////////////////////////////////////////
//-- epic `drawable-thing` P19:  `tableau T1` is the tableau named T1;  `the first tableau` the first one made.

export class Pile extends List {
  static instanceType = Thing

  // a pile has a name as text
  static { this.declareProp("name", { type: "text" }) }
  get name() { return this.getProp("name") }
  set name(value) { this.setProp("name", value) }
}
export class Tableau extends Pile {}
export class Foundation extends Pile {}
export class DiscardPile extends Pile {}

/** two tableaus named T1:  a reference to T1 below warns, and finds the first */
export const firstT1 = new Tableau({ name: "T1" })
export const secondT1 = new Tableau({ name: "T1" })
export const t2 = new Tableau({ name: "T2" })

// foundations, each its own name:  no warning
const it = new Foundation({ name: "clubs" })
const it2 = new Foundation({ name: "hearts" })

/** two discard piles named "spare", but nothing names one by its name:  no warning */
export const spare = new DiscardPile({ name: "spare" })
export const otherSpare = new DiscardPile({ name: "spare" })

// names worked out as the program runs are never counted
spellCore.getRange(3, 4).forEach((number) => {
  const it3 = new Tableau({ name: `T${number}` })
})

spellCore.heading("by name")
//## by name
spellCore.console.log(spellCore.thingNamed(Tableau, "T1")?.name)
spellCore.console.log(spellCore.thingNamed(Tableau, "T2")?.name)
spellCore.console.log(spellCore.thingNamed(Foundation, "hearts")?.name)
// a tableau is a pile:  `pile T2` finds it
spellCore.console.log(spellCore.thingNamed(Pile, "T2")?.name)

spellCore.heading("by place")
//## by place
spellCore.console.log(spellCore.thingAtPlace(Tableau, 1)?.name)
spellCore.console.log(spellCore.thingAtPlace(Foundation, 2)?.name)
spellCore.console.log(spellCore.thingAtPlace(Tableau, -1)?.name)
