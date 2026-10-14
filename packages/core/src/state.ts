/**
 * A program's state as JSON, each thing by its id (epic `python-target`, P17):
 * what a page mirrors, so a click names the thing a program holds.
 *
 * ```ts
 * const writer = new StateWriter()
 * writer.stateOf(game)
 * // { "$type": "Game", "$id": "1", "piles": [{ "$type": "Pile", "$id": "2", "name": "stock", "$items": [
 * //     { "$type": "Card", "$id": "3", "rank": "ace" }] }], "top": { "$id": "3" } }
 *
 * const mirror = new StateMirror()
 * mirror.read(state)   // the first time:  made, as `spellCore.fromJSON()` makes them
 * mirror.read(later)   // after that:  the SAME things, changed in place, so what draws them redraws
 * ```
 *
 * - The same JSON as `toJSON()`, plus an `"$id"` on each thing and list, after its `"$type"`,
 *   and its plain fields after its props:  what it was made with and doesn't declare, e.g. a foundation's `symbol`.
 *   - The first mention of one is whole;  each later one is `{ "$id": "3" }` alone:
 *     so a card in two places is one card, read back.
 *   - `"$id"` as JSON-LD spells it, beside its `"$type"`.
 * - Each `StateWriter` gives a thing its id the first time it writes it, and keeps it:
 *   every state it writes after names that thing the same.
 *   - One writer per page:  ids are its own, counted from 1.
 * - A `StateMirror` keeps what it read by id, and reads each new state INTO it:
 *   a thing it has already gets the new props, a list its new items.
 * - The twin of Python's `spell_core.state`:  both write the same JSON for the same things.
 *   `stateById.expected.json5`, with the core's tests (`tests/core/`), holds one, read by both.
 */
import { getProp, ITEMS_KEY, keysOf, setProp, TYPE_KEY } from "$/util"

import { programThings } from "./core"
// Import directly to avoid circular import
import { List } from "./classes/List"
import { Thing } from "./classes/Thing"

/** Key a thing's id goes under:  `{ "$type": "Card", "$id": "3", ... }`, or `{ "$id": "3" }` alone, to mention it. */
export const ID_KEY = "$id"

/** A thing or a list:  what has an id in a state. */
type SpellObject = Thing | List

/** Writes the state of things as JSON, each with its id:  see the file's docs. */
export class StateWriter {
  /** Each thing's id, given the first time it's written. */
  protected ids = new Map<SpellObject, string>()

  /** `thing`'s id, given now if it has none:  `"1"`, `"2"` ... in the order they're first asked for. */
  idOf(thing: SpellObject): string {
    let id = this.ids.get(thing)
    if (id === undefined) {
      id = String(this.ids.size + 1)
      this.ids.set(thing, id)
    }
    return id
  }

  /**
   * `value` as JSON can hold it, each thing with its id:  whole the first time, then `{ "$id": ... }` alone.
   * - Arrays and plain objects all the way down, as `toJSON()` writes them.
   */
  stateOf(value: unknown): unknown {
    return this.write(value, new Set())
  }

  /** `value`'s JSON, the things in `written` as their ids alone -- see `stateOf()`. */
  protected write(value: unknown, written: Set<SpellObject>): unknown {
    if (isSpellObject(value)) {
      const id = this.idOf(value)
      if (written.has(value)) return { [ID_KEY]: id }
      written.add(value)
      const json: Record<string, unknown> = { [TYPE_KEY]: value.constructor.name, [ID_KEY]: id }
      for (const key of keysOf(value)) json[key] = this.write(getProp(value, key), written)
      for (const [key, field] of Object.entries(fieldsOf(value)))
        if (!(key in json)) json[key] = this.write(field, written)
      if (value instanceof List) json[ITEMS_KEY] = value.items.map((item) => this.write(item, written))
      return json
    }
    if (Array.isArray(value)) return value.map((item) => this.write(item, written))
    if (isPlainObject(value)) {
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, this.write(item, written)]))
    }
    return value
  }
}

/** Reads states a `StateWriter` wrote, into the things it read before:  see the file's docs. */
export class StateMirror {
  /** What it read, by id. */
  protected byId = new Map<string, SpellObject>()

  /**
   * A mirror holding nothing yet.
   * - `nameOf`:  our name for each property the states name, e.g. Python's `is_set_up` => `isSetUp`;
   *   as they are, by default.
   */
  constructor({ nameOf }: { nameOf?: (name: string) => string } = {}) {
    if (nameOf) this.nameOf = nameOf
  }

  /** Our name for a property a state names:  see the constructor. */
  protected nameOf = (name: string): string => name

  /** The id of each thing it read:  what the page sends, to name one. */
  protected ids = new WeakMap<SpellObject, string>()

  /** The thing read with `id`, if any:  what a click on the page names. */
  thingWithId(id: string): SpellObject | undefined {
    return this.byId.get(id)
  }

  /** The id `thing` was read with, if any:  `"3"`. */
  idOf(thing: SpellObject): string | undefined {
    return this.ids.get(thing)
  }

  /**
   * `state` read back:  each thing with an id we hold changed in place, each new one made and kept.
   * - A thing we hold:  its props set to the state's, and any it no longer has unset;
   *   a list's items set to the state's.
   * - A new one:  made as `spellCore.fromJSON()` makes one, through its setters, then its `create()`.
   * - `{ "$id": ... }` alone:  the thing with that id.
   * - JSON with no ids (`toJSON()`'s) reads as `spellCore.fromJSON()` reads it:  a new thing each time.
   */
  read(state: unknown): unknown {
    if (Array.isArray(state)) return state.map((item) => this.read(item))
    if (!isPlainObject(state)) return state
    const id = state[ID_KEY]
    const keys = Object.keys(state)
    if (typeof id === "string" && keys.length === 1) return this.byId.get(id)
    const type = state[TYPE_KEY]
    const Class = typeof type === "string" ? programThings()?.classNamed(type) : undefined
    if (!Class) return Object.fromEntries(Object.entries(state).map(([key, value]) => [key, this.read(value)]))
    const { [TYPE_KEY]: _type, [ID_KEY]: _id, [ITEMS_KEY]: items, ...named } = state
    const fields = Object.fromEntries(Object.entries(named).map(([key, value]) => [this.nameOf(key), value]))
    const known = typeof id === "string" ? this.byId.get(id) : undefined
    let made = known instanceof Class ? known : undefined
    let rest = fields
    if (!made) {
      // the props it has setters for, through the class, so its `create()` sees them;  the rest after
      const settable: Record<string, unknown> = {}
      rest = {}
      for (const [key, value] of Object.entries(fields)) {
        if (hasSetter(Class.prototype, key)) settable[key] = this.read(value)
        else rest[key] = value
      }
      made = new Class(settable) as SpellObject
    }
    // kept BEFORE its fields are read:  a field may mention it, `{ "$id": ... }`
    if (typeof id === "string") {
      this.byId.set(id, made)
      this.ids.set(made, id)
      for (const key of keysOf(made)) if (!(key in fields)) setProp(made, key, undefined)
    }
    for (const [key, value] of Object.entries(rest)) set(made, key, this.read(value), typeof id === "string")
    if (made instanceof List) made.items = Array.isArray(items) ? items.map((item) => this.read(item)) : []
    return made
  }
}

/**
 * Set `thing`'s `key` to `value`:  through its setter, else as a prop.
 * - `fromState`:  read from a state, which holds plain fields too (`StateWriter`):
 *   a key it has no accessor or prop for is one, as its constructor set it (`Foundation({ symbol })`).
 *   `toJSON()`'s JSON holds props only.
 */
function set(thing: SpellObject, key: string, value: unknown, fromState: boolean): void {
  const proto = Object.getPrototypeOf(thing) as object
  const isField = fromState && !hasAccessor(proto, key) && !keysOf(thing).includes(key)
  if (isField || hasSetter(proto, key)) (thing as unknown as Record<string, unknown>)[key] = value
  else setProp(thing, key, value)
}

/**
 * `thing`'s plain fields, not its props:  what its constructor was given and doesn't declare,
 * e.g. `{ symbol: "♣️" }` for `new Foundation({ symbol: "♣️" })`.  Never a `_private` one, or a function.
 */
export function fieldsOf(thing: SpellObject): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(thing).filter(([key, value]) => !key.startsWith("_") && typeof value !== "function")
  )
}

/** Does `proto`, or one up its chain, have a getter or setter for `key`? */
function hasAccessor(proto: object | null, key: string): boolean {
  for (; proto; proto = Object.getPrototypeOf(proto) as object | null) {
    const descriptor = Object.getOwnPropertyDescriptor(proto, key)
    if (descriptor) return !!(descriptor.get || descriptor.set)
  }
  return false
}

/** Is `value` a thing or a list? */
export function isSpellObject(value: unknown): value is SpellObject {
  return value instanceof Thing || value instanceof List
}

/** Is `value` a plain object, as `JSON.parse()` makes:  NOT an array, a thing, or `null`? */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false
  const proto = Object.getPrototypeOf(value) as unknown
  return proto === Object.prototype || proto === null
}

/** Does `proto`, or one up its chain, have a setter for `key`?  The nearest accessor decides. */
export function hasSetter(proto: object | null, key: string): boolean {
  for (; proto; proto = Object.getPrototypeOf(proto) as object | null) {
    const descriptor = Object.getOwnPropertyDescriptor(proto, key)
    if (descriptor) return !!descriptor.set
  }
  return false
}
