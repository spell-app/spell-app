/**
 * `spellCore.carryOver()`:  a recompiled program takes over the last run's things (epic `drawable-thing` P16, Q25).
 * - An edit in the editor runs the program again:  without this, Drawable Solitaire deals a new game each time.
 * - With it, each of the last run's top-level things is matched to the new run's of the same name and type,
 *   e.g. `stock`, and its state copied over:  the game in progress stays, drawn the new way.
 * - Everything it holds comes over as the NEW class of the same name, as reading saved JSON back does
 *   (`spellCore.fromJSON()`):  an old `Card` becomes a new `Card`.
 *   - Unlike JSON, it keeps identity:  a card held by the deck AND a pile comes over as ONE card.
 * - The hard cases:
 *   - a property the new type adds:  the new thing's own starting value
 *   - a property the new type no longer declares, or now only computes:  dropped
 *   - a property whose declared type changed, or a type renamed or gone:
 *     each top-level thing holding one starts afresh (keeps what the new run made), and the console says so
 * - The runner decides when (`runCompiled()`'s `keepThings`):  every recompile but Restart, which starts afresh.
 * - Part of `spellCore`:  imported by `$/core`'s barrel for its side effect.
 */
import { getProps, schemaOf, setProp, type PropInfo } from "$/util"

import { spellCore } from "./core"
import { defineSpellCoreModule } from "./spellCore.types"
// Import directly to avoid circular import
import { Thing } from "./classes/Thing"
import { List } from "./classes/List"
import type { NamedThing, ThingClass, ThingLike } from "./things"

export const carryMethods = defineSpellCoreModule({
  /**
   * Is a recompiled program loading, to take over the last run's things?
   * - Set by the runner around the load.
   * - While it is, a `pause for ...` never ends:
   *   the program's start, e.g. a deal with a pause between cards, stops at its first pause,
   *   and `carryOver()` puts the last run's things in place of what it made.
   */
  isCarryingOver: false,

  /**
   * Put the last run's things in place of the new run's -- see the file's header.
   * - `previous`:  the last run's top-level things, by name.
   * - `exports`:  the new program's module, which they go into.
   * - Each top-level thing of the same name and type takes the old one's state, in place:
   *   the new program's own variables, e.g. `stock`, keep pointing at it.
   * - The things they hold come over as new things of the new classes, each once.
   * - SIDE EFFECTS:
   *   - the new run's things that were replaced are forgotten by `spellCore.things`
   *   - the new run's processes are stopped:  they stopped at their first pause (`isCarryingOver`)
   *   - one console line says what was kept, and one per thing that starts afresh, and why
   * - Answers the names of the things kept.
   * - NEVER throws:  a thing that can't come over starts afresh.
   */
  carryOver(previous: NamedThing[], exports: Record<string, unknown>): string[] {
    const flags = spellCore.getProcessFlags()
    for (const name of Object.keys(flags)) delete flags[name]
    try {
      const kept = new CarryOver().run(previous, exports)
      if (kept.length) spellCore.console.info(`Kept ${kept.join(", ")} from the last run:  Restart starts afresh.`)
      return kept
    } catch (error) {
      // e.g. a new class's `create()` that throws:  what came over so far stays
      spellCore.console.error("Couldn't keep the last run's things:", error)
      return []
    }
  }
})
Object.assign(spellCore, carryMethods)

/**
 * One carry-over, from the last run's things to the new run's classes -- see `spellCore.carryOver()`.
 * - Holds which old thing became which new one, so each comes over once.
 */
class CarryOver {
  /** The new thing each old one became, by the old one. */
  private carried = new Map<object, object>()

  /** What the new run's top-level things held before they took the old state:  forgotten, unless carried over. */
  private replaced: ThingLike[] = []

  /** Carry `previous` over into `exports` -- see `spellCore.carryOver()`;  answers the names kept. */
  run(previous: NamedThing[], exports: Record<string, unknown>): string[] {
    const targets: Array<[ThingLike, ThingLike]> = []
    for (const { name, thing } of previous) {
      const target = exports[name]
      if (!isThingLike(target)) continue
      const problem =
        target.constructor.name === thing.constructor.name
          ? this.problemIn(thing, new Set())
          : `its type was ${thing.constructor.name}, now ${target.constructor.name}`
      if (problem) {
        spellCore.console.warn(`${name} starts afresh:  ${problem}`)
        continue
      }
      this.carried.set(thing, target)
      targets.push([thing, target])
    }
    for (const [thing, target] of targets) this.fill(thing, target, "in place")
    this.forgetReplaced()
    return previous.filter(({ thing }) => this.carried.has(thing)).map(({ name }) => name)
  }

  /**
   * Why `value`, or something it holds, can't come over -- `undefined` if it all can.
   * - A thing whose type the new program no longer has:  `type Card is gone`.
   * - A thing with a property whose declared type changed:  `Card's rank changed its type`.
   */
  private problemIn(value: unknown, seen: Set<object>): string | undefined {
    if (Array.isArray(value)) return firstOf(value, (item) => this.problemIn(item, seen))
    if (!value || typeof value !== "object" || seen.has(value)) return undefined
    seen.add(value)
    if (isPlainObject(value)) return firstOf(Object.values(value), (field) => this.problemIn(field, seen))
    if (!isThingLike(value)) return undefined
    const type = value.constructor.name
    const Class = spellCore.things.classNamed(type)
    if (!Class) return `type ${type} is gone`
    const props = getProps(value)
    for (const [name, prop] of Object.entries(props)) {
      if (hasChangedType(value.constructor, Class, name, prop)) return `${type}'s ${name} changed its type`
    }
    const items = value instanceof List ? value.items : []
    return firstOf([...Object.values(props), ...items], (held) => this.problemIn(held, seen))
  }

  /** `value` as the new program has it:  a thing as the new class's, each once;  arrays and plain objects copied. */
  private carry(value: unknown): unknown {
    if (Array.isArray(value)) return value.map((item) => this.carry(item))
    if (!value || typeof value !== "object") return value
    if (isPlainObject(value)) {
      return Object.fromEntries(Object.entries(value).map(([key, field]) => [key, this.carry(field)]))
    }
    if (!isThingLike(value)) return value
    const known = this.carried.get(value)
    if (known) return known
    const Class = spellCore.things.classNamed(value.constructor.name)!
    // made with its plain values, as `new Card({ rank, suit })`;  what it holds once it's known, for a cycle back to it
    const plain = Object.fromEntries(
      Object.entries(getProps(value)).filter(
        ([key, prop]) => (prop === null || typeof prop !== "object") && keeps(value.constructor, Class, key)
      )
    )
    const made = new Class(plain)
    this.carried.set(value, made)
    this.fill(value, made, "new")
    return made
  }

  /**
   * Copy `thing`'s state onto `target`, of its new class:  its props, through their setters, and a list's items.
   * - A prop its new class no longer declares, or only computes:  dropped (`keeps()`).
   * - A prop only `target` has:  left as it is, its own starting value.
   * - `in place`:  `target` is one of the new run's top-level things:
   *   what it held is forgotten, unless carried over.
   */
  private fill(thing: ThingLike, target: ThingLike, how: "in place" | "new") {
    const Class = target.constructor as ThingClass
    if (how === "in place") this.replaced.push(...heldBy(target))
    for (const [key, value] of Object.entries(getProps(thing))) {
      if (!keeps(thing.constructor, Class, key)) continue
      const carried = this.carry(value)
      if (hasSetter(Class.prototype, key)) (target as unknown as Record<string, unknown>)[key] = carried
      else setProp(target, key, carried)
    }
    if (thing instanceof List && target instanceof List) target.items = thing.items.map((item) => this.carry(item))
  }

  /** Forget what the new run's top-level things held before, and what that held, unless it was carried over. */
  private forgetReplaced() {
    const kept = new Set(this.carried.values())
    const seen = new Set<object>()
    for (let thing = this.replaced.pop(); thing; thing = this.replaced.pop()) {
      if (kept.has(thing) || seen.has(thing)) continue
      seen.add(thing)
      spellCore.things.forget(thing)
      this.replaced.push(...heldBy(thing))
    }
  }
}

/** The things `thing` holds itself:  in its props, and a list's items. */
function heldBy(thing: ThingLike): ThingLike[] {
  const items = thing instanceof List ? thing.items : []
  return [...Object.values(getProps(thing)), ...items].filter(isThingLike)
}

/**
 * Does a thing of class `Class` keep prop `key` it had as an `Old`?
 * - No when `Old` declared it and `Class` doesn't:  it was removed.
 * - No when `Class` only computes it now:  a getter with no setter.
 */
function keeps(Old: Function, Class: ThingClass, key: string): boolean {
  if (schemaOf(Old).info(key) && !schemaOf(Class).info(key)) return false
  return !isComputed(Class.prototype, key)
}

/**
 * Did prop `name`, `value` on a thing of class `Old`, change its declared type in `Class`?
 * - Both declare a type, and they differ:  `number` was `text`.
 * - Or `Class` declares a plain type `value` isn't, e.g. `number` for `"ace"`.
 * - Or `Class` declares legal values, and `value` isn't one of them any more.
 * - Nothing never counts.
 */
function hasChangedType(Old: Function, Class: ThingClass, name: string, value: unknown): boolean {
  if (value === undefined || value === null) return false
  const [was, now] = [schemaOf(Old).info(name), schemaOf(Class).info(name)]
  if (!now) return false
  if (was?.type && now.type && was.type !== now.type) return true
  const plainType = now.type && PLAIN_TYPES[now.type]
  if (plainType && typeof value !== plainType) return true
  const values = legalValues(now)
  return !!values && !values.includes(value)
}

/** What `typeof` says of a value of each of spell's plain types:  `text` is a `string`. */
const PLAIN_TYPES: Record<string, string> = {
  text: "string",
  character: "string",
  number: "number",
  integer: "number",
  choice: "boolean"
}

/** The legal values `info` declares, if any. */
function legalValues(info: PropInfo): readonly unknown[] | undefined {
  return typeof info.oneOf === "function" ? info.oneOf() : info.oneOf
}

/** Is `value` a spell thing:  a `Thing`, or any `List`? */
function isThingLike(value: unknown): value is ThingLike {
  return value instanceof Thing || value instanceof List
}

/** Is `value` a plain object, as a literal makes:  NOT an array, a thing, or `null`? */
function isPlainObject(value: object): value is Record<string, unknown> {
  const proto = Object.getPrototypeOf(value) as unknown
  return proto === Object.prototype || proto === null
}

/** Does `proto`, or one up its chain, have a setter for `key`?  The nearest accessor decides. */
function hasSetter(proto: object | null, key: string): boolean {
  return !!accessorOf(proto, key)?.set
}

/** Is `key` only computed on `proto`'s chain:  its nearest accessor a getter with no setter? */
function isComputed(proto: object | null, key: string): boolean {
  const accessor = accessorOf(proto, key)
  return !!accessor?.get && !accessor.set
}

/** The nearest descriptor of `key` up `proto`'s chain, if any. */
function accessorOf(proto: object | null, key: string): PropertyDescriptor | undefined {
  for (; proto; proto = Object.getPrototypeOf(proto) as object | null) {
    const descriptor = Object.getOwnPropertyDescriptor(proto, key)
    if (descriptor) return descriptor
  }
  return undefined
}

/** The first of `values` that `check()` answers something for -- that answer. */
function firstOf<T>(values: Iterable<T>, check: (value: T) => string | undefined): string | undefined {
  for (const value of values) {
    const answer = check(value)
    if (answer) return answer
  }
  return undefined
}
