/**
 * `spellCore.fromJSON()`:  a spell object's JSON read back as what it was (epic `output-targets`, P15, Q49).
 * - A thing's JSON says its class first, `"@type"`, then its props:  `Thing.toJSON()`.
 * - A list's says its class, its own props, then its items:  `{ "@type": "Pile", "name": "stock", "items": [...] }`,
 *   `List.toJSON()`.
 */
import { setProp, TYPE_KEY } from "$/util"

import { spellCore } from "./core"
import { defineSpellCoreModule } from "./spellCore.types"
// Import directly to avoid circular import
import { List } from "./classes/List"
import type { ThingClass } from "./things"

export const jsonMethods = defineSpellCoreModule({
  /**
   * `json` read back as what it was:  each object with a `"@type"` rebuilt as the program's class of that name,
   * each of its props rebuilt the same way, and so on down.
   * - `json`:  JSON text, or a value `JSON.parse()` already answered.  A string is always read as JSON text.
   * - The class:  one the program declares, or a project it imports, has -- see `ThingRegistry.classNamed()` --
   *   else spell's own, e.g. `List`.
   * - Made as the program makes one, `new Card({ rank, suit })`:  through its setters, then its `create()`;
   *   a prop with no setter is set after.  It's one of the program's things then, in the Thing Explorer.
   * - A list:  its own props as above, then its items, each rebuilt, set as its `items`, so an exclusive list,
   *   e.g. a `Pile`, owns its cards (`List.writeItems()`).  What its `create()` added is replaced.
   * - An unknown `"@type"`, no class by that name:  a plain object, its `"@type"` kept, its fields rebuilt.
   *   NEVER throws for one.
   * - NOTE: JSON keeps no identity:  a card in two places comes back as two cards.
   * - throws:  `json` is text that isn't JSON (`JSON.parse()`'s `SyntaxError`).
   */
  fromJSON(json: unknown): unknown {
    return rebuild(typeof json === "string" ? JSON.parse(json) : json)
  }
})
Object.assign(spellCore, jsonMethods)

/** `value`, read from JSON, rebuilt -- see `fromJSON()`. */
function rebuild(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(rebuild)
  if (!isPlainObject(value)) return value
  const type = value[TYPE_KEY]
  const Class = typeof type === "string" ? spellCore.things.classNamed(type) : undefined
  if (!Class) return rebuildFields(value)
  const { [TYPE_KEY]: _type, ...fields } = value
  if (!isListClass(Class)) return make(Class, fields)
  const { items, ...props } = fields
  const list = make(Class, props) as List
  list.items = Array.isArray(items) ? items.map(rebuild) : []
  return list
}

/** A new `Class`, its props `fields`, each rebuilt:  through its setters, as `new Card({ rank })`;  the rest after. */
function make(Class: ThingClass, fields: Record<string, unknown>): object {
  const settable: Record<string, unknown> = {}
  const others: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(fields)) {
    ;(hasSetter(Class.prototype, key) ? settable : others)[key] = rebuild(value)
  }
  const made = new Class(settable)
  for (const [key, value] of Object.entries(others)) setProp(made, key, value)
  return made
}

/** `fields`, each rebuilt, in a new plain object:  for a JSON object of no class we know. */
function rebuildFields(fields: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, rebuild(value)]))
}

/** Is `value` a plain object, as `JSON.parse()` makes:  NOT an array, a thing, or `null`? */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false
  const proto = Object.getPrototypeOf(value) as unknown
  return proto === Object.prototype || proto === null
}

/** Is `Class` `List`, or a sub-class of it? */
function isListClass(Class: ThingClass): Class is ThingClass & (new (props?: Record<string, unknown>) => List) {
  return Class === List || Class.prototype instanceof List
}

/** Does `proto`, or one up its chain, have a setter for `key`?  The nearest accessor decides. */
function hasSetter(proto: object | null, key: string): boolean {
  for (; proto; proto = Object.getPrototypeOf(proto) as object | null) {
    const descriptor = Object.getOwnPropertyDescriptor(proto, key)
    if (descriptor) return !!descriptor.set
  }
  return false
}
