import { Thing, List, prop } from "@spell-app/core/model"

///////////////////////////////////////////////////////////////////////////////////////
// ## People and orgs, and what they keep about each other (epic `people-and-orgs`, P7)
///////////////////////////////////////////////////////////////////////////////////////
// The library the app, the people store and the spell command share:  `@spell/library/people`.
// A person and an org are each saved in a file of their own:  a person's is `__me.json5` in their space,
// an org's `__org.json5` in its.  Everything else is saved inside what holds it.
// Every thing has an `id`, built in:  nobody declares it.

export class Person extends Thing {
  @prop({ type: "text" }) accessor names!: string

  @prop({ type: "text" }) accessor nickname!: string

  @prop({ itemType: "text", init: () => new List<string>({ instanceType: "text" }) }) accessor emails!: List<string>

  @prop({ itemType: "DatedEvent", init: () => new List<DatedEvent>({ instanceType: "DatedEvent" }) }) accessor dates!: List<DatedEvent>

  @prop({ itemType: "FriendList", init: () => new List<FriendList>({ instanceType: "FriendList" }) }) accessor friendLists!: List<FriendList>

  @prop({ itemType: "Note", init: () => new List<Note>({ instanceType: "Note" }) }) accessor notes!: List<Note>

  static savedInFile = true
}

/** What a person keeps */
export class DatedEvent extends Thing {
  @prop({ type: "text" }) accessor label!: string

  @prop({ type: "date" }) accessor day!: Date
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

/////////////////////////////
// ## Orgs, and who's in them
/////////////////////////////
/**
 * A membership is its own thing:  a person and their role in one org.
 * A spell-admin may change the `@spell` org's own files, once there's a permissions UI (T8).
 */
export class Org extends Thing {
  @prop({ type: "text" }) accessor name!: string

  @prop({ itemType: "Membership", init: () => new List<Membership>({ instanceType: "Membership" }) }) accessor memberships!: List<Membership>

  static savedInFile = true
}

const ROLES = ["member", "admin", "spell-admin"] as const
export type Role = (typeof ROLES)[number]

export class Membership extends Thing {
  @prop({ type: "Person" }) accessor person!: Person

  static Roles = ROLES
  @prop({ oneOf: ROLES }) accessor role!: Role
}