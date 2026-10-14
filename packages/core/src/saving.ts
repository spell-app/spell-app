/**
 * Saving things BY ID, each in an entry of its own, and loading them back as the same objects
 * (epic `people-and-orgs`, P2).
 *
 * ```ts
 * const { root, entries } = new Saver().save(owen)
 * // root:  "Person#owen"
 * // entries:  "Person#owen" => { "$type": "Person", "id": "owen", "name": "Owen",
 * //                                "dates": [{ "$type": "DatedEvent", "label": "birthday", ... }],
 * //                                "friends": [{ "$ref": "Person#matt" }] }
 * //           "Person#matt" => { "$type": "Person", "id": "matt", ... }
 *
 * const loader = new Loader({ entryFor: (ref) => entries.get(ref) })
 * loader.load(root)   // owen again;  his friend matt is loaded once, however many hold him
 * ```
 *
 * - A thing is saved INSIDE what holds it, by default (decision Q42):  written whole the first time it's reached,
 *   and a REFERENCE after, `{ "$ref": "Card#ace" }`, so a card in two piles is one card, read back.
 *   - Written whole with its `id` only when something else holds it too.
 *   - A reference from another entry names the entry it's written in, `{ "$ref": "Card#ace", "$in": "Game#g" }`.
 *   - A kind saved IN ITS OWN FILE (`a person is saved in its own file`, `static savedInFile = true`) gets an entry
 *     of its own, and what holds it writes a reference to that, `{ "$ref": "Person#matt" }`.
 *   - What `save()` is given always gets an entry, whatever its kind.
 *   - A plain list a property holds (`its "dates" is a list of dated-events`) is its items alone, a JSON array:
 *     it's part of its owner.  A list TYPE (`a club is a list of people`) is a thing, inside like any other.
 *   - `a dated-event is saved inline` (`static savedInline = true`) says the default:  no change.
 * - An entry is what `toJSON()` writes, `"$type"` first, then its `id`, then its other props,
 *   then the plain fields it was made with (a foundation's `symbol`), then a list's `"$items"`.
 * - What an entry's key and a reference say is `refOf`'s, `"Person#matt"` by default:
 *   the people store (P9) names them by address instead, `"matt@spell"`.
 * - A thing kept in ANOTHER place (`placeOf`) is a reference with that place, `"Person#matt@three-degrees"`,
 *   and gets no entry:  its own place saves it.  `parseRef()` reads one, `refText()` writes one (P4, Q18).
 *   - So an id may never hold an `@`:  saving one throws.
 * - Where entries live is the caller's:  a `Map` here, one file each in the people store.
 * - The twin of Python's `spell_core.saving`:  both write `savedById.expected.json5`, and read it.
 *   It's with the core's tests, in `tests/core/`.
 * - Not the same as a page's state (`state.ts`):  that numbers things per page, and holds them in one message.
 */
import { getProp, ITEMS_KEY, keysOf, schemaOf, setProp, TYPE_KEY } from "$/util"

import { programThings, spellCore } from "./core"
import { fieldsOf, hasSetter, isPlainObject, isSpellObject } from "./state"
// Import directly to avoid circular import
import { List } from "./classes/List"
import { Thing } from "./classes/Thing"

/** Key a reference names its thing under:  `{ "$ref": "Person#matt" }`. */
export const REF_KEY = "$ref"

/**
 * Key a reference to a thing written whole in ANOTHER entry names that entry under:
 * `{ "$ref": "Card#ace", "$in": "Game#g" }` -- so a loader reads that entry first.
 */
export const IN_KEY = "$in"

/** A thing or a list:  what is saved by id. */
type SpellObject = Thing | List

/** A class things are made from, when loaded. */
type SpellClass = new (props?: Record<string, unknown>) => SpellObject

/** What a save writes:  every entry it made, by its key, and the key of the thing it started from. */
export type Saved = {
  /** The key of the thing `save()` was given, e.g. `"Person#owen"`. */
  root: string
  /** Each entry by its key, in the order they were reached:  the root's first. */
  entries: Map<string, Record<string, unknown>>
}

/** Options for a `Saver`. */
export type SaverOptions = {
  /** The key of a thing's entry, and what a reference to it says -- `"<Class>#<id>"` by default, `"Person#owen"`. */
  refOf?: (thing: SpellObject) => string
  /**
   * Where `thing` is kept when it's NOT with what's being saved, e.g. in another project or someone else's space:
   * its place's address, `three-degrees`, or `undefined` when it's saved here (epic `people-and-orgs` Q18).
   * - A thing kept elsewhere is written as a reference with its place, `{ "$ref": "Person#matt@three-degrees" }`,
   *   and gets no entry here:  its own place saves it.
   */
  placeOf?: (thing: SpellObject) => string | undefined
}

/**
 * A saved reference's parts:  `Person#matt@three-degrees` is `{ type: "Person", id: "matt", place: "three-degrees" }`
 * -- see `parseRef()` and `refText()`.
 */
export type SavedRef = {
  /** The thing's kind, e.g. `Person`. */
  type: string
  /** Its id, e.g. `matt`:  never holds an `@`. */
  id: string
  /** Where it's kept, when that's not here:  an address, which may hold an `@` of its own (`matt@three-degrees:game`). */
  place?: string
}

/** Options for a `Loader`. */
export type LoaderOptions = {
  /** The entry saved under `ref`, if there is one:  JSON as `Saver` wrote it. */
  entryFor: (ref: string) => Record<string, unknown> | undefined
  /**
   * The class an entry's `"$type"` names:  the running program's (`spellCore.things.classNamed()`) by default.
   * - Needed under `$/core/model`, which has no running program.
   */
  classNamed?: (name: string) => SpellClass | undefined
}

/****************
 * ### `Saver`
 * Writes a thing, and every thing it reaches, as entries by id:  see the file's docs.
 ****************/
export class Saver {
  /** See `SaverOptions.refOf`. */
  readonly refOf: (thing: SpellObject) => string
  /** See `SaverOptions.placeOf`. */
  readonly placeOf: (thing: SpellObject) => string | undefined

  constructor({ refOf, placeOf }: SaverOptions = {}) {
    this.refOf = refOf ?? defaultRefOf
    this.placeOf = placeOf ?? (() => undefined)
  }

  /**
   * `root` as an entry, and every thing it reaches that's saved in its own file, each as an entry of its own;
   * every other thing written inside what holds it.
   * - SIDE EFFECT:  reads each entry's `id`, and a kept-inside thing's held twice, so one with none is given one
   *   now -- and keeps it.
   */
  save(root: SpellObject): Saved {
    const entries = new Map<string, Record<string, unknown>>()
    const holds = this.holdsOf(root)
    const waiting: SpellObject[] = [root]
    const queued = new Set<SpellObject>(waiting)
    // each thing kept inside, by the key of the entry it's written whole in
    const written = new Map<SpellObject, string>()
    let current = ""
    // each thing reached:  a reference, or written whole the first time -- see `write()`
    const reference = (thing: SpellObject): unknown => {
      const place = this.placeOf(thing)
      if (place) return { [REF_KEY]: refText({ type: thing.constructor.name, id: thing.id, place }) }
      if (queued.has(thing) || isSavedInFile(thing)) {
        if (!queued.has(thing)) {
          queued.add(thing)
          waiting.push(thing)
        }
        return { [REF_KEY]: this.refOf(thing) }
      }
      const where = written.get(thing)
      if (where === undefined) {
        written.set(thing, current)
        // its id only when something else holds it too, for that reference to find it
        const heldTwice = (holds.get(thing) ?? 0) > 1
        const json = heldTwice ? { ...headOf(thing), id: thing.id } : headOf(thing)
        return this.writeProps(thing, json, reference, heldTwice ? undefined : "id")
      }
      const ref = { [REF_KEY]: insideRefOf(thing) }
      return where === current ? ref : { ...ref, [IN_KEY]: where }
    }
    for (let thing = waiting.shift(); thing; thing = waiting.shift()) {
      current = this.refOf(thing)
      entries.set(current, this.entryOf(thing, reference))
    }
    return { root: this.refOf(root), entries }
  }

  /**
   * How many places hold each thing `root` reaches, for `save()`:  a thing kept inside and held twice is written
   * whole once, with its id, and as a reference to it after.
   * - Never past a thing kept in another place (`placeOf`):  its own place saves it.
   */
  protected holdsOf(root: SpellObject): Map<SpellObject, number> {
    const holds = new Map<SpellObject, number>()
    const visit = (value: unknown): void => {
      if (value instanceof List && value.constructor === List) return value.items.forEach(visit)
      if (isSpellObject(value)) {
        const count = (holds.get(value) ?? 0) + 1
        holds.set(value, count)
        if (count === 1 && !this.placeOf(value)) visitProps(value)
        return
      }
      if (Array.isArray(value)) return value.forEach(visit)
      if (isPlainObject(value)) Object.values(value).forEach(visit)
    }
    const visitProps = (thing: SpellObject) => {
      for (const key of keysOf(thing)) visit(getProp(thing, key))
      Object.values(fieldsOf(thing)).forEach(visit)
      if (thing instanceof List) thing.items.forEach(visit)
    }
    holds.set(root, 1)
    visitProps(root)
    return holds
  }

  /** `thing`'s own entry:  `"$type"`, its `"$version"` past 1, `id`, its other props, a list's `"$items"`. */
  protected entryOf(thing: SpellObject, reference: (thing: SpellObject) => unknown): Record<string, unknown> {
    const entry: Record<string, unknown> = { ...headOf(thing), id: thing.id }
    return this.writeProps(thing, entry, reference)
  }

  /** `thing`'s props and items, written into `json` -- all but `leaveOut`'s, e.g. a kept-inside thing's `id`. */
  protected writeProps(
    thing: SpellObject,
    json: Record<string, unknown>,
    reference: (thing: SpellObject) => unknown,
    leaveOut?: string
  ): Record<string, unknown> {
    for (const key of keysOf(thing)) {
      if (!(key in json) && key !== leaveOut) json[key] = this.write(getProp(thing, key), reference)
    }
    // what it was made with and doesn't declare, e.g. a foundation's `symbol`:  as a page's state writes them
    for (const [key, field] of Object.entries(fieldsOf(thing))) {
      if (!(key in json)) json[key] = this.write(field, reference)
    }
    if (thing instanceof List) json[ITEMS_KEY] = thing.items.map((item) => this.write(item, reference))
    return json
  }

  /**
   * `value` as an entry holds it:
   * - a plain list:  its items, as an array
   * - a thing or a list type saved in its own file:  a reference to its entry
   * - any other thing or list:  written whole, here, the first time it's reached;  a reference after,
   *   `{ "$ref": "Card#ace" }`, with the entry it's written in when that's another one, `"$in": "Game#g"`
   * - arrays and plain objects:  each value written so;  a date as its ISO text;  anything else as it is
   */
  protected write(value: unknown, reference: (thing: SpellObject) => unknown): unknown {
    if (value instanceof List && value.constructor === List) {
      return value.items.map((item) => this.write(item, reference))
    }
    if (isSpellObject(value)) return reference(value)
    if (Array.isArray(value)) return value.map((item) => this.write(item, reference))
    if (value instanceof Date) return value.toISOString()
    if (isPlainObject(value)) {
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, this.write(item, reference)]))
    }
    return value
  }
}

/****************
 * ### `Loader`
 * Reads entries a `Saver` wrote back as things:  each entry ONCE, however many references name it.
 ****************/
export class Loader {
  /** See `LoaderOptions.entryFor`. */
  readonly entryFor: LoaderOptions["entryFor"]
  /** See `LoaderOptions.classNamed`. */
  readonly classNamed: (name: string) => SpellClass | undefined
  /** What it loaded, by key:  a second reference to one gets the same thing. */
  protected loaded = new Map<string, SpellObject>()
  /**
   * The things written whole inside each entry it read, by their key, `"Card#ace"`:  what a reference to one finds
   * (`index()`).
   */
  protected inside = new Map<string, Record<string, unknown>>()

  /**
   * A loader reading entries through `entryFor`.
   * - throws with no `classNamed`, and no running program to find classes in:
   *   under `$/core/model` -- see `programThings()`
   */
  constructor({ entryFor, classNamed }: LoaderOptions) {
    this.entryFor = entryFor
    const things = programThings()
    if (!classNamed && !things) {
      throw new TypeError("new Loader():  no running program to find classes in (`$/core/model`);  pass `classNamed`")
    }
    this.classNamed = classNamed ?? ((name) => things!.classNamed(name) as SpellClass | undefined)
  }

  /**
   * The thing saved under `ref`, made from its entry the first time, then the same thing every time.
   * - Nothing saved under `ref`:  `undefined`, with a warning on the program's console.
   */
  load(ref: string): SpellObject | undefined {
    const known = this.loaded.get(ref)
    if (known) return known
    const entry = this.inside.has(ref) ? undefined : this.entryFor(ref)
    if (entry) this.index(entry)
    const json = entry ?? this.inside.get(ref)
    if (!json) {
      spellCore.console.warn(`Loader.load():  nothing is saved as "${ref}"`)
      return undefined
    }
    const made = this.make(json, ref)
    return made instanceof Thing || made instanceof List ? made : undefined
  }

  /**
   * `json` read back:  a reference followed (`follow()`), a thing written whole made, arrays and objects read
   * through.
   */
  read(json: unknown): unknown {
    // a reference to nothing saved is left out:  the list holds what loaded
    if (Array.isArray(json)) {
      return json.flatMap((item) => {
        const value = this.read(item)
        return value === undefined && isReference(item) ? [] : [value]
      })
    }
    if (!isPlainObject(json)) return json
    if (isReference(json)) return this.follow(json)
    if (typeof json[TYPE_KEY] === "string") return this.make(json)
    return Object.fromEntries(Object.entries(json).map(([key, value]) => [key, this.read(value)]))
  }

  /**
   * The thing reference `json` names:  an entry, or a thing written whole inside one -- the entry it's in (`"$in"`)
   * read first, when that's another one not read yet.
   */
  protected follow(json: Record<string, unknown>): SpellObject | undefined {
    const ref = json[REF_KEY] as string
    const where = json[IN_KEY]
    if (!this.loaded.has(ref) && !this.inside.has(ref) && typeof where === "string") this.load(where)
    return this.load(ref)
  }

  /** Note each thing written whole inside `json` (an entry), by its key, for a reference to it to find:  `inside`. */
  protected index(json: unknown): void {
    if (Array.isArray(json)) return json.forEach((item) => this.index(item))
    if (!isPlainObject(json)) return
    const type = json[TYPE_KEY]
    if (typeof type === "string" && typeof json.id === "string") {
      const key = refText({ type, id: json.id })
      if (!this.inside.has(key)) this.inside.set(key, json)
    }
    Object.values(json).forEach((value) => this.index(value))
  }

  /**
   * A thing made from `json`, an entry or a thing saved inline -- kept as `ref`'s, if it's an entry.
   * - Made with its plain values (text, numbers ...) through its setters, so its `create()` sees them;
   *   then its things and lists set, once it's kept:  one of them may hold it back, a person's friend's friend.
   * - Its class unknown:  the entry read as a plain object, its `"$type"` kept.
   */
  protected make(json: Record<string, unknown>, ref?: string): unknown {
    const Class = this.classNamed(`${json[TYPE_KEY]}`)
    if (!Class) return Object.fromEntries(Object.entries(json).map(([key, value]) => [key, this.read(value)]))
    // a thing written whole with its id:  kept by its key, so the references to it get this one
    if (!ref && typeof json.id === "string") ref = refText({ type: `${json[TYPE_KEY]}`, id: json.id })
    const known = ref ? this.loaded.get(ref) : undefined
    if (known) return known
    // an older version's entry:  brought up to its type's version first -- see `upgradeEntry()`
    const { entry, upgrades } = upgradeEntry(json, Class)
    const plain: Record<string, unknown> = {}
    const later: Record<string, unknown> = {}
    // the file's own keys (`$type`, `$version`, `$schema` ...) are never props
    for (const [key, value] of Object.entries(entry)) {
      if (key.startsWith("$")) continue
      if (isPlainValue(value)) plain[key] = dateIfDeclared(Class, key, value)
      else later[key] = value
    }
    const made = new Class(plain)
    if (ref) this.loaded.set(ref, made)
    for (const [key, value] of Object.entries(later)) this.setRead(made, key, value)
    const items = entry[ITEMS_KEY]
    if (made instanceof List && Array.isArray(items)) made.items = this.read(items) as unknown[]
    // then each version's `to upgrade` method, in order
    for (const method of upgrades) (made as unknown as Record<string, () => void>)[method]!()
    return made
  }

  /** Set `made`'s `key` to `json` read back:  a property's list gets its items, else the value is set. */
  protected setRead(made: SpellObject, key: string, json: unknown): void {
    const value = this.read(json)
    const current = Array.isArray(value) ? (made as unknown as Record<string, unknown>)[key] : undefined
    if (current instanceof List) current.items = value as unknown[]
    else if (hasSetter(Object.getPrototypeOf(made) as object, key))
      (made as unknown as Record<string, unknown>)[key] = value
    else setProp(made, key, value)
  }
}

////////////////
// ## Versions (P6)
////////////////

/** Key a saved thing's version is under, past version 1:  `{ "$type": "Person", "$version": 3, ... }`. */
export const VERSION_KEY = "$version"

/** A version step's static, as the writers name it:  `Person.v2RenamesName = "names"`, `Person.v3DropsNickname = true`. */
const VERSION_STEP = /^v(\d+)(Renames|Drops)([A-Z]\w*)$/

/** A version's upgrade method:  `upgradeToVersion4()`. */
const UPGRADE_METHOD = /^upgradeToVersion(\d+)$/

/**
 * `Class`'s version:  the highest any of its version steps or upgrade methods names, its superclasses' too;
 * 1 if none (`a person version 2 renames name to names`, `to upgrade (a person) to version 4:`).
 */
export function versionOf(Class: Function): number {
  let version = 1
  for (const { version: step } of stepsOf(Class)) version = Math.max(version, step)
  for (const { version: upgrade } of upgradesOf(Class)) version = Math.max(version, upgrade)
  return version
}

/**
 * Saved `entry`, of `Class`, brought up to `Class`'s version (epic `people-and-orgs` P6):  the entry as it should
 * read now, and the upgrade methods still to run on the thing made from it, in order.
 * - Its version is its `"$version"`, 1 if it has none.
 * - Each version after it in turn:  its renames (`name` => `names`), then its drops;  its upgrade method, if any,
 *   runs on the made thing after (`upgradeToVersion4`), where what the old file held is still there to read.
 * - Already at its type's version, or past it (a newer file):  as it is.
 * - A new copy:  `entry` itself is never changed.
 */
export function upgradeEntry(
  entry: Record<string, unknown>,
  Class: Function
): { entry: Record<string, unknown>; upgrades: string[] } {
  const saved = typeof entry[VERSION_KEY] === "number" ? (entry[VERSION_KEY] as number) : 1
  const current = versionOf(Class)
  if (saved >= current) return { entry, upgrades: [] }
  const upgraded: Record<string, unknown> = { ...entry, [VERSION_KEY]: current }
  const steps = stepsOf(Class)
  const methods = upgradesOf(Class)
  const upgrades: string[] = []
  for (let version = saved + 1; version <= current; version++) {
    for (const step of steps.filter((it) => it.version === version)) {
      if (!(step.property in upgraded)) continue
      if (step.renamesTo) upgraded[step.renamesTo] = upgraded[step.property]
      delete upgraded[step.property]
    }
    const method = methods.find((it) => it.version === version)
    if (method) upgrades.push(method.name)
  }
  return { entry: upgraded, upgrades }
}

/** One version step of a class:  a property renamed (`renamesTo`), or dropped. */
type VersionStepInfo = { version: number; property: string; renamesTo?: string }

/** Every version step `Class` and its superclasses declare, as statics:  see `VERSION_STEP`. */
function stepsOf(Class: Function): VersionStepInfo[] {
  const steps: VersionStepInfo[] = []
  for (let at: Function | null = Class; at && at !== Function.prototype; at = Object.getPrototypeOf(at)) {
    for (const name of Object.getOwnPropertyNames(at)) {
      const match = VERSION_STEP.exec(name)
      if (!match) continue
      const value = (at as unknown as Record<string, unknown>)[name]
      const property = match[3]!.charAt(0).toLowerCase() + match[3]!.slice(1)
      steps.push({
        version: Number(match[1]),
        property,
        ...(match[2] === "Renames" && typeof value === "string" && { renamesTo: value })
      })
    }
  }
  return steps
}

/** Every upgrade method `Class` (or a superclass) has, with its version:  see `UPGRADE_METHOD`. */
function upgradesOf(Class: Function): { version: number; name: string }[] {
  const upgrades: { version: number; name: string }[] = []
  for (
    let proto = Class.prototype as object | null;
    proto && proto !== Object.prototype;
    proto = Object.getPrototypeOf(proto)
  ) {
    for (const name of Object.getOwnPropertyNames(proto)) {
      const match = UPGRADE_METHOD.exec(name)
      if (match && !upgrades.some((it) => it.name === name)) upgrades.push({ version: Number(match[1]), name })
    }
  }
  return upgrades
}

/** A saved thing's first keys:  its `"$type"`, then its type's `"$version"` if that's past 1. */
function headOf(thing: SpellObject): Record<string, unknown> {
  const version = versionOf(thing.constructor)
  return version > 1
    ? { [TYPE_KEY]: thing.constructor.name, [VERSION_KEY]: version }
    : { [TYPE_KEY]: thing.constructor.name }
}

////////////////
// ## Helpers
////////////////

/**
 * A saved reference read:  `Person#matt@three-degrees` => `{ type: "Person", id: "matt", place: "three-degrees" }`.
 * - The type runs up to the `#`;  the id from there to the FIRST `@`;  everything after that `@` is the place,
 *   which may hold an `@` of its own:  `Card#26@matt@three-degrees:bubble-trouble`'s place is
 *   `matt@three-degrees:bubble-trouble` (epic `people-and-orgs` Q18).
 * - No `@`:  no place, the thing is kept here, `Person#matt`.
 * - throws `TypeError` with no `#`, or nothing before or after it
 */
export function parseRef(text: string): SavedRef {
  const hash = text.indexOf("#")
  const at = text.indexOf("@", hash + 1)
  const type = text.slice(0, hash)
  const id = at < 0 ? text.slice(hash + 1) : text.slice(hash + 1, at)
  if (hash < 0 || !type || !id) {
    throw new TypeError(`parseRef():  "${text}" isn't a reference;  write it as Type#id, or Type#id@place`)
  }
  return at < 0 ? { type, id } : { type, id, place: text.slice(at + 1) }
}

/**
 * `ref` written as a saved reference:  `Person#matt`, or with its place, `Person#matt@three-degrees`.
 * - throws `TypeError` if the id holds an `@`:  a reader couldn't tell where the id ends and the place begins
 */
export function refText({ type, id, place }: SavedRef): string {
  if (id.includes("@")) {
    throw new TypeError(
      `refText():  ${type}'s id "${id}" holds an @, which a saved reference can't;  give it another id`
    )
  }
  return place ? `${type}#${id}@${place}` : `${type}#${id}`
}

/**
 * `"<Class>#<id>"`, e.g. `"Person#owen"`:  a thing's key, until the people store names things by address.
 * - throws if its id holds an `@` -- see `refText()`
 */
function defaultRefOf(thing: SpellObject): string {
  return refText({ type: thing.constructor.name, id: thing.id })
}

/** Is `thing`'s kind saved in a file of its own (`static savedInFile = true`, `a person is saved in its own file`)? */
function isSavedInFile(thing: SpellObject): boolean {
  return (thing.constructor as { savedInFile?: boolean }).savedInFile === true
}

/** A thing kept inside an entry's key, `"Card#ace"`:  always its type and id, whatever an entry's key says. */
function insideRefOf(thing: SpellObject): string {
  return refText({ type: thing.constructor.name, id: thing.id })
}

/** Is `value` text, a number, yes or no, or nothing:  a value to make a thing with, before its references? */
function isPlainValue(value: unknown): boolean {
  return value === null || typeof value !== "object"
}

/** Is `json` a reference alone, `{ "$ref": ... }`? */
function isReference(json: unknown): json is Record<string, unknown> {
  return (
    isPlainObject(json) &&
    typeof json[REF_KEY] === "string" &&
    Object.keys(json).every((key) => key === REF_KEY || key === IN_KEY)
  )
}

/** `value` as a `Date`, if `Class` declares `key` a date and `value` is its ISO text;  else `value`. */
function dateIfDeclared(Class: SpellClass, key: string, value: unknown): unknown {
  if (typeof value !== "string" || schemaOf(Class).info(key)?.type !== "date") return value
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date
}
