import { core, Thing, List, prop } from "@spell/core"

core.heading("People, and what they keep about each other (epic `people-and-orgs`, P1)")
//////////////////////////////////////////////////////////////////////////////
// ## People, and what they keep about each other (epic `people-and-orgs`, P1)
//////////////////////////////////////////////////////////////////////////////
// Every thing has an `id`, built in:  nobody declares it.
// A property or list of a kind holds that kind's things, each saved in its own file;
// `it is saved inline` keeps a small thing inside what holds it instead.

export class Person extends Thing {
  // - it has a name as text
  @prop({ type: "text" })
  accessor name!: string

  // - it has a nickname as text
  @prop({ type: "text" })
  accessor nickname!: string

  // - its "emails" is a list of text
  @prop({ itemType: "text", init: () => new List<string>({ instanceType: "text" }) })
  accessor emails!: List<string>

  // - its "dates" is a list of dated-events
  @prop({ itemType: "DatedEvent", init: () => new List<DatedEvent>({ instanceType: "DatedEvent" }) })
  accessor dates!: List<DatedEvent>
}

export class DatedEvent extends Thing {
  static savedInline = true

  // - it has a label as text
  @prop({ type: "text" })
  accessor label!: string

  // - it has a day as a date
  @prop({ type: "date" })
  accessor day!: Date
}

export class Note extends Thing {
  // - it has a body as text
  @prop({ type: "text" })
  accessor body!: string
}

export class Relationship extends Thing {
  // - it has a kind as text
  @prop({ type: "text" })
  accessor kind!: string

  // - it has a person as a person
  @prop({ type: "Person" })
  accessor person!: Person

  // - its "notes" is a list of notes
  @prop({ itemType: "Note", init: () => new List<Note>({ instanceType: "Note" }) })
  accessor notes!: List<Note>
}

export class FriendList extends Thing {
  // - it has a name as text
  @prop({ type: "text" })
  accessor name!: string

  // - its "relationships" is a list of relationships
  @prop({ itemType: "Relationship", init: () => new List<Relationship>({ instanceType: "Relationship" }) })
  accessor relationships!: List<Relationship>
}

core.heading("Using them")
/** Using them */
export const owen = new Person({ id: "owen", name: "Owen" })
export const matt = new Person({ id: "matt", name: "Matt" })
matt.nickname = "Matty"

export const family = new FriendList({ name: "family" })
core.append(family.relationships, new Relationship({ kind: "brother", person: matt }))

core.console.log(owen.id)
core.map(family.relationships, (relationship: Relationship) => core.console.log(relationship.person.id))
