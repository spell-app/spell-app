import { core, Thing, List, App, View, Page, TwoSidedView, ViewableList } from "@spell/core"

core.heading("People, and what they keep about each other (epic `people-and-orgs`, P1)")
//////////////////////////////////////////////////////////////////////////////
// ## People, and what they keep about each other (epic `people-and-orgs`, P1)
//////////////////////////////////////////////////////////////////////////////
// Every thing has an `id`, built in:  nobody declares it.
// A property or list of a kind holds that kind's things, each saved in its own file;
// `it is saved inline` keeps a small thing inside what holds it instead.

export class Person extends Thing {
  // - it has a name as text
  static { this.declareProp("name", { type: "text" }) }
  get name() { return this.getProp("name") }
  set name(value) { this.setProp("name", value) }

  // - it has a nickname as text
  static { this.declareProp("nickname", { type: "text" }) }
  get nickname() { return this.getProp("nickname") }
  set nickname(value) { this.setProp("nickname", value) }

  // - its "emails" is a list of text
  static { this.declareProp("emails", { itemType: "text", init: () => new List({ instanceType: "text" }) }) }
  get emails() { return this.getProp("emails") }
  set emails(value) { this.setProp("emails", value) }

  // - its "dates" is a list of dated-events
  static { this.declareProp("dates", { itemType: "DatedEvent", init: () => new List({ instanceType: "DatedEvent" }) }) }
  get dates() { return this.getProp("dates") }
  set dates(value) { this.setProp("dates", value) }
}

export class DatedEvent extends Thing {
  static savedInline = true

  // - it has a label as text
  static { this.declareProp("label", { type: "text" }) }
  get label() { return this.getProp("label") }
  set label(value) { this.setProp("label", value) }

  // - it has a day as a date
  static { this.declareProp("day", { type: "date" }) }
  get day() { return this.getProp("day") }
  set day(value) { this.setProp("day", value) }
}

export class Note extends Thing {
  // - it has a body as text
  static { this.declareProp("body", { type: "text" }) }
  get body() { return this.getProp("body") }
  set body(value) { this.setProp("body", value) }
}

export class Relationship extends Thing {
  // - it has a kind as text
  static { this.declareProp("kind", { type: "text" }) }
  get kind() { return this.getProp("kind") }
  set kind(value) { this.setProp("kind", value) }

  // - it has a person as a person
  static { this.declareProp("person", { type: "Person" }) }
  get person() { return this.getProp("person") }
  set person(value) { this.setProp("person", value) }

  // - its "notes" is a list of notes
  static { this.declareProp("notes", { itemType: "Note", init: () => new List({ instanceType: "Note" }) }) }
  get notes() { return this.getProp("notes") }
  set notes(value) { this.setProp("notes", value) }
}

export class FriendList extends Thing {
  // - it has a name as text
  static { this.declareProp("name", { type: "text" }) }
  get name() { return this.getProp("name") }
  set name(value) { this.setProp("name", value) }

  // - its "relationships" is a list of relationships
  static { this.declareProp("relationships", { itemType: "Relationship", init: () => new List({ instanceType: "Relationship" }) }) }
  get relationships() { return this.getProp("relationships") }
  set relationships(value) { this.setProp("relationships", value) }
}

core.heading("Using them")
/** Using them */
export const owen = new Person({ id: "owen", name: "Owen" })
export const matt = new Person({ id: "matt", name: "Matt" })
matt.nickname = "Matty"

export const family = new FriendList({ name: "family" })
core.append(family.relationships, new Relationship({ kind: "brother", person: matt }))

core.console.log(owen.id)
core.map(family.relationships, (relationship) => core.console.log(relationship.person.id))
