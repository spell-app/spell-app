import { spellCore, Thing, List, App, Drawable, DrawableList, prop } from "@spell/core"

spellCore.heading("People, and what they keep about each other (epic `people-and-orgs`, P1)")
//////////////////////////////////////////////////////////////////////////////
// ## People, and what they keep about each other (epic `people-and-orgs`, P1)
//////////////////////////////////////////////////////////////////////////////
// Every thing has an `id`, built in:  nobody declares it.
// A property or list of a kind holds that kind's things, each saved in its own file;
// `it is saved inline` keeps a small thing inside what holds it instead.

export class Person extends Thing {
  @prop({ type: "text" }) accessor name!: string

  @prop({ type: "text" }) accessor nickname!: string

  @prop({ itemType: "text", init: () => new List<string>({ instanceType: "text" }) }) accessor emails!: List<string>

  @prop({ itemType: "DatedEvent", init: () => new List<DatedEvent>({ instanceType: "DatedEvent" }) }) accessor dates!: List<DatedEvent>
}

export class DatedEvent extends Thing {
  @prop({ type: "text" }) accessor label!: string

  @prop({ type: "date" }) accessor day!: Date

  static savedInline = true
}

export class Note extends Thing {
  @prop({ type: "text" }) accessor body!: string
}

export class Relationship extends Thing {
  @prop({ type: "text" }) accessor kind!: string

  @prop({ type: "Person" }) accessor person!: Person

  @prop({ itemType: "Note", init: () => new List<Note>({ instanceType: "Note" }) }) accessor notes!: List<Note>
}

export class FriendList extends Thing {
  @prop({ type: "text" }) accessor name!: string

  @prop({ itemType: "Relationship", init: () => new List<Relationship>({ instanceType: "Relationship" }) }) accessor relationships!: List<Relationship>
}

spellCore.heading("Using them")
/** Using them */
export const owen = new Person({ id: "owen", name: "Owen" })
export const matt = new Person({ id: "matt", name: "Matt" })
matt.nickname = "Matty"

export const family = new FriendList({ name: "family" })
spellCore.append(family.relationships, new Relationship({ kind: "brother", person: matt }))

spellCore.console.log(owen.id)
spellCore.map(family.relationships, (relationship: Relationship) => spellCore.console.log(relationship.person.id))
