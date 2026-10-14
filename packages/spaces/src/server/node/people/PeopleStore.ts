import { execFileSync } from "child_process"

import {
  checkEntry,
  Loader,
  parseRef,
  REF_KEY,
  Saver,
  spellCore,
  upgradeEntry,
  type ThingsToSearch
} from "$/core/model"
import type { FileProblem, OrgRole, PersonChanges, PersonView } from "$/spaces/models/people"
import type { SpaceStorage } from "$/spaces/models/SpaceStorage"
import { readJSON5, writeJSON5 } from "$/spaces/server/node/storage/json5"
import * as People from "../../../../@spell/library/people/people.lib"

/** A saved entry, as the people library's things are saved:  `{ "$type": "Person", "id": "owen", ... }`. */
type Entry = Record<string, unknown>

/** The org every person on this machine is in, for now:  `owen@spell` is `Person#owen@spell`. */
const HOME_ORG = "spell"

/****************
 * ### `PeopleStore`
 * People and orgs in spell-spaces, read and written through a `SpaceStorage` (epic `people-and-orgs` P9):
 * - A person is `Person#owen@spell`, kept in `@spell/owen@/__me.json5`;  an org is `Org#spell`, in `@spell/__org.json5`.
 * - Read:  each file read as JSON5, checked against its class (`checkEntry()`), brought up to its class's version
 *   (the `Loader`), and every person or org it names read too, so `owen.friendLists ... person` is matt himself.
 * - Written:  ONE file at a time, its comments kept (`writeJSON5()`);  a friend it names is written as a reference,
 *   `{ "$ref": "Person#matt@three-degrees" }`, never into their file.
 * - The person's library is `@spell/library/people`, its compiled `people.lib.ts`.
 * - Nobody's refused a save yet, under `@spell` either (J46):  the permissions UI is todo T8.
 ****************/
export class PeopleStore {
  /** Where the files are:  spell-spaces' folder, or a test's. */
  readonly storage: SpaceStorage

  /** Where each person or org read was kept, by its thing:  how a reference to it is written. */
  protected places = new WeakMap<object, string>()

  constructor(storage: SpaceStorage) {
    this.storage = storage
  }

  ////////////////
  // ## People
  ////////////////

  /**
   * Person `id` of org `org` (`owen`, `spell`), with every person and org their file names;  `undefined` if they have
   * no file.  `problems`:  what each file read got wrong, by property;  read anyway.
   */
  async person(id: string, org = HOME_ORG): Promise<{ person?: People.Person; problems: FileProblem[] }> {
    const { thing, problems } = await this.load(`Person#${id}@${org}`)
    return { person: thing instanceof People.Person ? thing : undefined, problems }
  }

  /**
   * Person `id`'s file, made first if there's none:  their names and email from git (`git config user.name`), and a
   * comment saying what the file is.  Returns the person, as `person()` does.
   */
  async me(id: string, org = HOME_ORG): Promise<{ person: People.Person; problems: FileProblem[] }> {
    const file = personFile(id, org)
    if ((await this.storage.read(file)) === undefined) await this.storage.write(file, starterPerson(id))
    const { person, problems } = await this.person(id, org)
    if (!person) throw new Error(`PeopleStore.me():  ${file} has no person in it`)
    return { person, problems }
  }

  /** Change `person`'s own fields to `changes`, and write their file, its comments kept;  returns the text written. */
  async change(person: People.Person, changes: PersonChanges): Promise<string> {
    if (changes.names !== undefined) person.names = changes.names
    if (changes.nickname !== undefined) person.nickname = changes.nickname
    if (changes.emails) person.emails.items = changes.emails.filter((email) => email.trim())
    if (changes.dates) {
      person.dates.items = changes.dates
        .filter(({ label, day }) => label.trim() || day)
        .map(({ label, day }) => new People.DatedEvent({ label, day: new Date(day) }))
    }
    return this.save(person)
  }

  /** `person` as the app shows them:  plain JSON, a day as `"1970-01-01"`. */
  view(person: People.Person): PersonView {
    return {
      id: person.id,
      address: `${person.id}@${this.placeOf(person) ?? HOME_ORG}`,
      names: person.names ?? "",
      nickname: person.nickname ?? "",
      emails: [...person.emails.items],
      dates: person.dates.items.map(({ label, day }) => ({
        label: label ?? "",
        day: day instanceof Date && !Number.isNaN(day.getTime()) ? day.toISOString().slice(0, 10) : ""
      }))
    }
  }

  /**
   * Write `thing`, a person or an org, into its own file, its comments kept;  returns the text written.
   * - Everything it keeps is written inside it;  a person or org it names, as a reference with its org.
   */
  async save(thing: People.Person | People.Org): Promise<string> {
    const place = this.placeOf(thing)
    const { root, entries } = new Saver({
      placeOf: (other) => (other === thing ? undefined : this.placeOf(other))
    }).save(thing)
    const file = fileFor(refWithPlace(root, place))
    if (!file) throw new TypeError(`PeopleStore.save():  ${root} is neither a person nor an org`)
    return writeJSON5(this.storage, file, entries.get(root)!)
  }

  ////////////////
  // ## Orgs
  ////////////////

  /** Every org in spell-spaces, by its folder:  `@spell/`, with an `__org.json5`, is `Org#spell`. */
  async orgs(): Promise<{ orgs: People.Org[]; problems: FileProblem[] }> {
    const orgs: People.Org[] = []
    const problems: FileProblem[] = []
    for (const name of await this.storage.list("")) {
      if (!name.startsWith("@") || !name.endsWith("/")) continue
      const id = name.slice(1, -1)
      if ((await this.storage.read(orgFile(id))) === undefined) continue
      const read = await this.load(`Org#${id}`)
      problems.push(...read.problems)
      if (read.thing instanceof People.Org) orgs.push(read.thing)
    }
    return { orgs, problems }
  }

  /** The orgs `person` is a member of, and their role in each, e.g. `{ id: "spell", name: "Spell", role: "admin" }`. */
  async rolesOf(person: People.Person): Promise<OrgRole[]> {
    const { orgs } = await this.orgs()
    return orgs.flatMap((org) =>
      org.memberships.items
        .filter((membership) => membership.person === person || sameAs(membership.person, person))
        .map((membership) => ({ id: org.id, name: org.name || org.id, role: membership.role }))
    )
  }

  ////////////////
  // ## Helpers
  ////////////////

  /**
   * The thing saved under `ref` (`Person#owen@spell`, `Org#spell`), its file and every file it names read first;
   * `problems`, each file's.
   * - While it loads, references by name (`Person#owen`) search what's read (`spellCore.searchThings()`, Q44).
   */
  protected async load(ref: string): Promise<{ thing?: object; problems: FileProblem[] }> {
    const { entries, problems } = await this.entriesFrom(ref)
    const loader = new Loader({ entryFor: (key) => entries.get(key), classNamed })
    const made: object[] = []
    const before = spellCore.searchThings({ all: () => made, classNamed } satisfies ThingsToSearch)
    try {
      for (const key of entries.keys()) {
        const thing = loader.load(key)
        if (!thing) continue
        made.push(thing)
        this.places.set(thing, parseRef(key).place ?? "")
      }
    } finally {
      spellCore.searchThings(before)
    }
    return { thing: loader.load(ref), problems }
  }

  /**
   * Entry `ref`, and every person's or org's it names, by key:  each file read once, and checked.
   * - Each person's reference given its org, so one person is one key, read once:  `Person#matt` in owen's file is
   *   `Person#matt@spell`, as owen's org is spell's.
   */
  protected async entriesFrom(ref: string): Promise<{ entries: Map<string, Entry>; problems: FileProblem[] }> {
    const entries = new Map<string, Entry>()
    const problems: FileProblem[] = []
    const waiting = [ref]
    for (let key = waiting.shift(); key; key = waiting.shift()) {
      if (entries.has(key)) continue
      const file = fileFor(key)
      const entry = file ? await readJSON5<Entry>(this.storage, file).catch(() => undefined) : undefined
      if (!entry) continue
      for (const problem of checkEntry(upgraded(entry), { classNamed })) problems.push({ file: file!, ...problem })
      const placed = withPlaces(entry, parseRef(key).place) as Entry
      entries.set(key, placed)
      waiting.push(...refsIn(placed))
    }
    return { entries, problems }
  }

  /** The org `thing` was read from, `three-degrees`;  this machine's for a person never read, `undefined` else. */
  protected placeOf(thing: object): string | undefined {
    const place = this.places.get(thing)
    if (place) return place
    return thing instanceof People.Person ? HOME_ORG : undefined
  }
}

/** The people library's class named `name`, `Person` ...;  `undefined` for none. */
function classNamed(name: string) {
  const found = (People as Record<string, unknown>)[name]
  return typeof found === "function" ? (found as new (props?: Record<string, unknown>) => People.Person) : undefined
}

/** `entry` as its class reads it today (`upgradeEntry()`):  what's checked, an older file's renames made first. */
function upgraded(entry: Entry): Entry {
  const Class = classNamed(`${entry.$type}`)
  return Class ? upgradeEntry(entry, Class).entry : entry
}

/** `@spell/owen@/__me.json5`:  the file of person `id` in org `org`. */
export function personFile(id: string, org: string): string {
  return `@${org}/${id}@/__me.json5`
}

/** `@spell/__org.json5`:  the file of org `id`. */
export function orgFile(id: string): string {
  return `@${id}/__org.json5`
}

/** The file entry `ref` is kept in:  a person's or an org's;  `undefined` for anything else. */
function fileFor(ref: string): string | undefined {
  const { type, id, place } = parseRef(ref)
  if (type === "Person") return personFile(id, place ?? HOME_ORG)
  if (type === "Org") return orgFile(id)
  return undefined
}

/** `ref` with its org:  `Person#matt` in `three-degrees` is `Person#matt@three-degrees`;  an org's has none. */
function refWithPlace(ref: string, place: string | undefined): string {
  const { type, id } = parseRef(ref)
  return type === "Person" ? `${type}#${id}@${place || HOME_ORG}` : `${type}#${id}`
}

/** `json` with each person's reference given an org, `place` if it has none:  a copy, `json` itself unchanged. */
function withPlaces(json: unknown, place: string | undefined): unknown {
  if (Array.isArray(json)) return json.map((item) => withPlaces(item, place))
  if (!json || typeof json !== "object") return json
  const copy = Object.fromEntries(Object.entries(json).map(([key, value]) => [key, withPlaces(value, place)]))
  const ref = copy[REF_KEY]
  if (typeof ref === "string" && /^Person#/.test(ref)) copy[REF_KEY] = refWithPlace(ref, parseRef(ref).place ?? place)
  return copy
}

/** Every person's or org's reference `json` holds, at any depth:  `["Person#matt@three-degrees"]`. */
function refsIn(json: unknown): string[] {
  if (Array.isArray(json)) return json.flatMap(refsIn)
  if (!json || typeof json !== "object") return []
  const ref = (json as Entry)[REF_KEY]
  if (typeof ref === "string") return /^(Person|Org)#/.test(ref) ? [ref] : []
  return Object.values(json).flatMap(refsIn)
}

/** Do `a` and `b` name the same person, read from two files:  the same id. */
function sameAs(a: People.Person | undefined, b: People.Person): boolean {
  return !!a && a.id === b.id
}

/**
 * A new person's file:  a comment saying what it is, their id, and their names and email from git, if it knows them.
 */
function starterPerson(id: string): string {
  const names = gitConfig("user.name")
  const email = gitConfig("user.email")
  const entry = JSON.stringify({ $type: "Person", id, names: names ?? id, emails: email ? [email] : [] }, null, 2)
  return [
    "// You, as spell knows you:  a person of spell's people library (@spell/library/people).",
    "// The app's You panel changes it;  so can you, here.  Comments stay where they are.",
    `${entry}\n`
  ].join("\n")
}

/** `git config <key>`, e.g. your name;  `undefined` if git doesn't know it. */
function gitConfig(key: string): string | undefined {
  try {
    return (
      execFileSync("git", ["config", key], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() ||
      undefined
    )
  } catch {
    return undefined
  }
}
