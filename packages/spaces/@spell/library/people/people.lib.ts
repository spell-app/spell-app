import { Thing, List, prop } from "@spell-app/core/model"

///////////////////////////////////////////////////////////////////////////////////////
// ## People and orgs, and what they keep about each other (epic `people-and-orgs`, P7)
///////////////////////////////////////////////////////////////////////////////////////
// The library the app, the people store and the spell command share:  `@spell/library/people`.
// A person and an org are each saved in a file of their own:  a person's is `__me.json5` in their space,
// an org's `__org.json5` in its.  Everything else is saved inside what holds it.
// Every thing has an `id`, built in:  nobody declares it.

export class Person extends Thing {
  static savedInFile = true

  // - it has names as text
  @prop({ type: "text" })
  accessor names!: string

  // - it has a nickname as text
  @prop({ type: "text" })
  accessor nickname!: string

  // - its "emails" is a list of text
  @prop({ itemType: "text", init: () => new List<string>({ instanceType: "text" }) })
  accessor emails!: List<string>

  // - its "dates" is a list of dated-events
  @prop({ itemType: "DatedEvent", init: () => new List<DatedEvent>({ instanceType: "DatedEvent" }) })
  accessor dates!: List<DatedEvent>

  // - its "friend-lists" is a list of friend-lists
  @prop({ itemType: "FriendList", init: () => new List<FriendList>({ instanceType: "FriendList" }) })
  accessor friendLists!: List<FriendList>

  // - its "notes" is a list of notes
  @prop({ itemType: "Note", init: () => new List<Note>({ instanceType: "Note" }) })
  accessor notes!: List<Note>
}

/** What a person keeps */
export class DatedEvent extends Thing {
  // - it has a label as text
  @prop({ type: "text" })
  accessor label!: string

  // - it has a day as a date
  @prop({ type: "date" })
  accessor day!: Date

  // - its "notes" is a list of notes
  @prop({ itemType: "Note", init: () => new List<Note>({ instanceType: "Note" }) })
  accessor notes!: List<Note>
}

export class Note extends Thing {
  // - it has a title as text
  @prop({ type: "text" })
  accessor title!: string

  // - it has a body as text
  @prop({ type: "text" })
  accessor body!: string

  // - it has created as a date
  @prop({ type: "date" })
  accessor created!: Date

  // - it has a modified as date
  @prop({ type: "date" })
  accessor modified!: Date
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

/////////////////////////////
// ## Orgs, and who's in them
/////////////////////////////
/**
 * A membership is its own thing:  a person and their role in one org.
 * A spell-admin may change the `@spell` org's own files, once there's a permissions UI (T8).
 */
export class Org extends Thing {
  static savedInFile = true

  // - it has a name as text
  @prop({ type: "text" })
  accessor name!: string

  // - its "members" is a list of memberships
  @prop({ itemType: "Membership", init: () => new List<Membership>({ instanceType: "Membership" }) })
  accessor members!: List<Membership>
}

const ROLES = ["guest", "member", "admin", "spell-admin"] as const
export type Role = (typeof ROLES)[number]

export class Membership extends Thing {
  // - it has a person as a person
  @prop({ type: "Person" })
  accessor person!: Person

  // - its "role" is one of guest, member, admin, spell-admin
  static Roles = ROLES
  @prop({ oneOf: ROLES })
  accessor role!: Role
}