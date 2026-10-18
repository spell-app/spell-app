/**
 * What the app and the server say about people, over `/api/people/...` (epic `people-and-orgs` P9).
 * - Plain JSON, so the app needs no people library to show one.
 * - Types only:  safe in a browser.
 * - The server's side:  `PeopleStore` (`$/spaces/server/node/people/PeopleStore`), and its routes.
 */

/** A person, as the "You" panel shows them:  `GET /api/people/me`'s `person`. */
export type PersonView = {
  /** Their id in their org:  `owen`, of `owen@spell`. */
  id: string
  /** Their address:  `owen@spell`. */
  address: string
  names: string
  nickname: string
  emails: string[]
  /** Each a label and a day, `"1970-01-01"`. */
  dates: { label: string; day: string }[]
}

/** What a person can change of themselves:  `POST /api/people/me`'s body.  Every field optional, the rest kept. */
export type PersonChanges = Partial<Pick<PersonView, "names" | "nickname" | "emails" | "dates">>

/** A role in an org, as the people library's `Membership` has it. */
export type Role = "guest" | "member" | "admin" | "spell-admin"

/** One of a person's orgs, and their role in it:  `{ id: "spell", name: "Spell", role: "spell-admin" }`. */
export type OrgRole = { id: string; name: string; role: Role }

/** A problem a saved file has, by its file and property:  `{ file: "@spell/owen@/__me.json5", property: "names", ... }`. */
export type FileProblem = { file: string; property: string; message: string }

/** `GET` and `POST /api/people/me`'s answer:  the person, their orgs (read only), and what their files got wrong. */
export type MeAnswer = { person: PersonView; orgs: OrgRole[]; problems: FileProblem[] }
