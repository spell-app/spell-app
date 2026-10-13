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
 * - Every thing is saved in an entry of its own, and what holds it saves a REFERENCE, `{ "$ref": "Person#matt" }`:
 *   so a card in two piles is one card, read back.
 *   - EXCEPT a kind saved inline (`a dated-event is saved inline`, `static savedInline = true`):
 *     written whole, inside what holds it.
 *   - A plain list a property holds (`its "dates" is a list of dated-events`) is its items alone, a JSON array:
 *     it's part of its owner.  A list TYPE (`a club is a list of people`) is a thing, saved on its own.
 * - An entry is what `toJSON()` writes, `"$type"` first, then its `id`, then its other props,
 *   then the plain fields it was made with (a foundation's `symbol`), then a list's `"$items"`.
 * - What an entry's key and a reference say is `refOf`'s, `"Person#matt"` by default:
 *   the people store (P9) names them by address instead, `"matt@spell"`.
 * - A thing kept in ANOTHER place (`placeOf`) is a reference with that place, `"Person#matt@three-degrees"`,
 *   and gets no entry:  its own place saves it.  `parseRef()` reads one, `refText()` writes one (P4, Q18).
 *   - So an id may never hold an `@`:  saving one throws.
 * - Where entries live is the caller's:  a `Map` here, one file each in the people store.
 * - The twin of Python's `spell_core.saving`:  both write `savedById.expected.json`, and read it.
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
   * `root`, and every thing it reaches that isn't saved inline, each as an entry of its own.
   * - SIDE EFFECT:  reads each saved thing's `id`, so one with none is given one now -- and keeps it.
   */
  save(root: SpellObject): Saved {
    const entries = new Map<string, Record<string, unknown>>()
    const waiting: SpellObject[] = [root]
    const queued = new Set<SpellObject>(waiting)
    // each thing reached:  a reference to it, and saved in its turn -- unless it's kept elsewhere
    const reference = (thing: SpellObject) => {
      const place = this.placeOf(thing)
      if (place) return { [REF_KEY]: refText({ type: thing.constructor.name, id: thing.id, place }) }
      if (!queued.has(thing)) {
        queued.add(thing)
        waiting.push(thing)
      }
      return { [REF_KEY]: this.refOf(thing) }
    }
    for (let thing = waiting.shift(); thing; thing = waiting.shift()) {
      entries.set(this.refOf(thing), this.entryOf(thing, reference))
    }
    return { root: this.refOf(root), entries }
  }

  /** `thing`'s own entry:  `"$type"`, `id`, its other props, a list's `"$items"`. */
  protected entryOf(thing: SpellObject, reference: (thing: SpellObject) => unknown): Record<string, unknown> {
    const entry: Record<string, unknown> = { [TYPE_KEY]: thing.constructor.name, id: thing.id }
    return this.writeProps(thing, entry, reference)
  }

  /** `thing`'s props and items, written into `json`. */
  protected writeProps(
    thing: SpellObject,
    json: Record<string, unknown>,
    reference: (thing: SpellObject) => unknown
  ): Record<string, unknown> {
    for (const key of keysOf(thing)) {
      if (!(key in json)) json[key] = this.write(getProp(thing, key), reference)
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
   * - a thing saved inline:  whole, here
   * - a plain list:  its items, as an array
   * - any other thing or list:  a reference
   * - arrays and plain objects:  each value written so;  a date as its ISO text;  anything else as it is
   */
  protected write(value: unknown, reference: (thing: SpellObject) => unknown): unknown {
    if (value instanceof List && value.constructor === List) {
      return value.items.map((item) => this.write(item, reference))
    }
    if (isSpellObject(value)) {
      if (!isSavedInline(value)) return reference(value)
      return this.writeProps(value, { [TYPE_KEY]: value.constructor.name }, reference)
    }
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
    const entry = this.entryFor(ref)
    if (!entry) {
      spellCore.console.warn(`Loader.load():  nothing is saved as "${ref}"`)
      return undefined
    }
    const made = this.make(entry, ref)
    return made instanceof Thing || made instanceof List ? made : undefined
  }

  /**
   * `json` read back:  a reference loaded (`load()`), a thing saved inline made, arrays and objects read through.
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
    if (isReference(json)) return this.load(json[REF_KEY] as string)
    if (typeof json[TYPE_KEY] === "string") return this.make(json)
    return Object.fromEntries(Object.entries(json).map(([key, value]) => [key, this.read(value)]))
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
    const { [TYPE_KEY]: _type, [ITEMS_KEY]: items, ...props } = json
    const plain: Record<string, unknown> = {}
    const later: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(props)) {
      if (isPlainValue(value)) plain[key] = dateIfDeclared(Class, key, value)
      else later[key] = value
    }
    const made = new Class(plain)
    if (ref) this.loaded.set(ref, made)
    for (const [key, value] of Object.entries(later)) this.setRead(made, key, value)
    if (made instanceof List && Array.isArray(items)) made.items = this.read(items) as unknown[]
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

/** Is `thing`'s kind saved inside what holds it (`static savedInline = true`)? */
function isSavedInline(thing: SpellObject): boolean {
  return (thing.constructor as { savedInline?: boolean }).savedInline === true
}

/** Is `value` text, a number, yes or no, or nothing:  a value to make a thing with, before its references? */
function isPlainValue(value: unknown): boolean {
  return value === null || typeof value !== "object"
}

/** Is `json` a reference alone, `{ "$ref": ... }`? */
function isReference(json: unknown): boolean {
  return isPlainObject(json) && typeof json[REF_KEY] === "string" && Object.keys(json).length === 1
}

/** `value` as a `Date`, if `Class` declares `key` a date and `value` is its ISO text;  else `value`. */
function dateIfDeclared(Class: SpellClass, key: string, value: unknown): unknown {
  if (typeof value !== "string" || schemaOf(Class).info(key)?.type !== "date") return value
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date
}
