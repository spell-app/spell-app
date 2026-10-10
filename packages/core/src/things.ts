/**
 * `spellCore.things`:  every thing the running program has made, by type -- for the runners' Thing Explorer.
 * - Each `Thing` registers itself as it's constructed, and so does each instance of a `List` sub-class,
 *   e.g. a `Deck` -- NOT a plain `new List()`, which would bury the explorer in scratch lists.
 * - NOT while a test runs, e.g. in `to test card setup`:  a test's things are its own, not the program's.
 * - Plus the program's top-level things, by name -- see `setTopLevel()` -- so a plain list the program keeps,
 *   e.g. `all_piles`, shows too.
 * - And the heading each was made under, as the program ran -- see `heading()`.
 * - And the program's classes, by name, e.g. for `spellCore.fromJSON()` -- see `classNamed()`.
 */
import { Cell } from "$/util"

import { spellCore } from "./core"
import { defineSpellCoreModule } from "./spellCore.types"
// Import directly to avoid circular import
import { Thing } from "./classes/Thing"
import { List } from "./classes/List"
import { App } from "./classes/App"

/**
 * Registry of the things one run of a program made -- `spellCore.things`, cleared by `resetRuntime()`.
 * - Holds each thing WEAKLY, so it shows only while the program still holds it:  a thing thrown away drops out
 *   once it's garbage-collected -- which may be a while.
 * - `version` is a spell cell, so a reader of the registry (the Thing Explorer) re-runs as things come and go.
 *   Their properties are cells already.
 * - NOTE: `version` changes in a microtask, NOT as a thing registers -- a thing made while a reader reads, e.g. in a
 *   `to draw`, would otherwise change what the explorer reads mid-read.  It also makes one change of a loop making
 *   52 cards.
 */
export class ThingRegistry {
  /** Changes as the registry does -- see `version`. */
  private versionCell = new Cell()

  /** Change count, tracked:  read it to re-run as the registry changes. */
  get version(): number {
    this.versionCell.read()
    return this.versionCell.version
  }

  /** Each thing made, by creation number -- in order, as a `Map` iterates. */
  private entries = new Map<number, WeakRef<ThingLike>>()

  /** Creation number of each thing -- see `numberOf()`. */
  private numbers = new WeakMap<ThingLike, number>()

  /** Last creation number handed out. */
  private lastNumber = 0

  /** Heading each thing was made under, by creation number -- see `heading()`. */
  private headings = new Map<number, string>()

  /** Heading the program's running under -- see `heading()`. */
  private currentHeading: string | undefined

  /** Top-level things, by name -- see `setTopLevel()`. */
  private exports: Record<string, unknown> = {}

  /** The program's classes, by name -- see `classNamed()`. */
  private classes = new Map<string, ThingClass>()

  /** Is a `version` bump waiting for its microtask? */
  private changePending = false

  /** How deep in `quietly()` we are:  nothing made meanwhile registers. */
  private quiet = 0

  /** Drops a garbage-collected thing's entry -- `undefined` where there's no `FinalizationRegistry`. */
  private finalizer =
    typeof FinalizationRegistry === "undefined"
      ? undefined
      : new FinalizationRegistry<number>((number) => {
          this.headings.delete(number)
          if (this.entries.delete(number)) this.changed()
        })

  /**
   * Register `thing`, as it's constructed -- see `Thing` and `List`'s constructors.
   * - A `List` counts only if it's a sub-class's, e.g. a `Deck` -- see `ThingRegistry`.
   * - Nothing made while a test runs counts -- see `spellCore.ACTIVE_TEST`.  It gets no creation number either,
   *   so the program's things keep theirs whatever its tests make.
   * - NOTE: a `start test` with no `end test` runs till the next test starts, or the program ends -- so
   *   nothing made after it shows.
   * - Nor does anything made `quietly()`, e.g. while the explorer reads a value, or a collection helper's result.
   * - Its CLASS always counts, though:  see `addClass()`.
   */
  add(thing: ThingLike): void {
    this.addClass(thing.constructor as ThingClass)
    if (this.quiet || spellCore.ACTIVE_TEST || thing.constructor === List || this.numbers.has(thing)) return
    const number = ++this.lastNumber
    this.entries.set(number, new WeakRef(thing))
    this.numbers.set(thing, number)
    if (this.currentHeading) this.headings.set(number, this.currentHeading)
    this.finalizer?.register(thing, number)
    this.changed()
  }

  /**
   * Remember the program's top-level things:  its module's exports, e.g. `export let deck = new Deck()`.
   * - Pass the module namespace itself:  its bindings are live, so a thing a top-level variable is set to
   *   later shows too -- but only when something else redraws the explorer.  See `agents/CODE-DEBT.md`.
   * - Only `Thing`s and `List`s count -- see `topLevel()`.
   * - Only the main program's -- NOT those of the projects it imports.  See `agents/CODE-DEBT.md`.
   * - SIDE EFFECT:  ends the program's last `heading()`.
   */
  setTopLevel(exports: Record<string, unknown>): void {
    this.exports = exports
    this.addClasses(exports)
    // its top level's done:  what's made from now on, e.g. by a click, is under no heading
    this.currentHeading = undefined
    this.changed()
  }

  /** Forget everything, e.g. as a new run starts -- see `resetRuntime()`. */
  clear(): void {
    this.entries.forEach((ref, number) => {
      const thing = ref.deref()
      if (thing) this.finalizer?.unregister(thing)
      this.entries.delete(number)
    })
    this.numbers = new WeakMap()
    this.headings.clear()
    this.currentHeading = undefined
    this.lastNumber = 0
    this.exports = {}
    this.classes.clear()
    this.changed()
  }

  ////////////////
  // ## The program's classes
  //  Found by name, e.g. to read a thing's JSON back as its class:  `spellCore.fromJSON()` (`json.ts`).
  ////////////////

  /**
   * Remember `Class`, and each class it extends, by name -- for `classNamed()`.
   * - Down to, NOT including, spell's own:  `Thing`, `List`, `App` are always known.
   * - Called for each thing made (`add()`), so a class shows once one of its things is made;  and for each class
   *   the program and the projects it imports export (`addClasses()`), so one shows before that.
   * - A later class of the same name wins, e.g. the next run's `Card`.  `@thing`'s wrapper keeps the name of the class
   *   it wraps:  the wrapper wins, as it's what the program makes.
   * - Not a `Thing` or `List` class, e.g. a plain one:  ignored.
   */
  addClass(Class: ThingClass): void {
    if (this.classes.get(Class.name) === Class) return
    const named = new Set<string>()
    for (let at = Class; isProgramClass(at); at = Object.getPrototypeOf(at) as ThingClass) {
      if (named.has(at.name)) continue
      named.add(at.name)
      this.classes.set(at.name, at)
    }
  }

  /**
   * Remember each `Thing` or `List` class in `namespace`, e.g. a program's module, or a project's it imports.
   * - What isn't one, e.g. a function, a thing, is ignored.  See `addClass()`.
   */
  addClasses(namespace: Record<string, unknown>): void {
    for (const value of Object.values(namespace)) {
      if (isProgramClass(value)) this.addClass(value)
    }
  }

  /**
   * The program's class named `name`, e.g. `Card`, else spell's own, e.g. `List` -- `undefined` if none.
   * - Only the classes `addClass()` has seen:  a program's are, once it's run or made one of their things.
   * - Exact:  `card` isn't `Card`.
   */
  classNamed(name: string): ThingClass | undefined {
    return this.classes.get(name) ?? BUILT_IN_CLASSES.find((Class) => Class.name === name)
  }

  /**
   * Things still alive, grouped by `type`, e.g. `Card` -- types in order of their first thing, each type's
   * things in the order they were made.
   * - Reads `version`, so a reader calling it re-runs as things come and go.
   * - Groups by each thing's `type` NOW, which an instance may override.
   */
  byType(): ThingsOfType[] {
    void this.version
    const byType = new Map<string, ThingLike[]>()
    for (const ref of this.entries.values()) {
      const thing = ref.deref()
      if (!thing) continue
      const { type } = thing
      let things = byType.get(type)
      if (!things) byType.set(type, (things = []))
      things.push(thing)
    }
    return [...byType].map(([type, things]) => ({ type, things }))
  }

  /**
   * Things still alive, under each type they are -- their own, and each it extends -- e.g. a foundation under
   * `Foundation` AND `Pile`.  Types alphabetical, each type's things in the order they were made.
   * - NOT the built-in types, e.g. `Thing`, which every thing would be under.
   * - Reads `version`, as `byType()`.
   */
  bySuperType(): ThingsOfType[] {
    const byType = new Map<string, ThingLike[]>()
    for (const thing of this.all()) {
      for (const type of this.typeChainOf(thing).filter((it) => !BUILT_IN_TYPES.includes(it))) {
        let things = byType.get(type)
        if (!things) byType.set(type, (things = []))
        things.push(thing)
      }
    }
    return [...byType]
      .sort(([a], [b]) => a.localeCompare(b, undefined, { sensitivity: "base" }))
      .map(([type, things]) => ({ type, things }))
  }

  /** Things still alive, in the order they were made.  Reads `version`, as `byType()`. */
  all(): ThingLike[] {
    void this.version
    return [...this.entries.values()].map((ref) => ref.deref()).filter((thing) => thing !== undefined)
  }

  /**
   * The program's top-level things, by name, in the order it declares them -- `Thing`s and `List`s only.
   * - Includes plain lists, e.g. `all_piles`, which `byType()` leaves out.
   */
  topLevel(): NamedThing[] {
    void this.version
    return Object.entries(this.exports)
      .filter((entry): entry is [string, ThingLike] => entry[1] instanceof Thing || entry[1] instanceof List)
      .map(([name, thing]) => ({ name, thing }))
  }

  /**
   * The program's running the code under heading `text` now, e.g. `set up all piles` for `## set up all piles` --
   * what it makes from here on was made under it.
   * - Compiled spell calls it, as `spellCore.heading("set up all piles")`, at each heading at a file's top level
   *   -- see `Block.getAST()`.  So it's the heading of the TOP-LEVEL code running:  cards a `new Deck()` deals
   *   are under the heading above that line, not one in `Deck.spell`.
   * - Until the next, or the program's top level finishes -- see `setTopLevel()`.
   */
  heading(text: string): void {
    this.currentHeading = text
  }

  /** Heading `thing` was made under -- see `heading()`.  `undefined` if none, or it isn't registered. */
  headingOf(thing: ThingLike): string | undefined {
    const number = this.numberOf(thing)
    return number === undefined ? undefined : this.headings.get(number)
  }

  /** Top-level name `thing` goes by, e.g. `deck` -- `undefined` if it has none. */
  nameOf(thing: ThingLike): string | undefined {
    return Object.keys(this.exports).find((name) => this.exports[name] === thing)
  }

  /**
   * Order `thing` was made in, this run:  1 for the first thing made, and so on -- `undefined` if it wasn't
   * registered, e.g. a plain list.
   */
  numberOf(thing: ThingLike): number | undefined {
    return this.numbers.get(thing)
  }

  ////////////////
  // ## Inspecting things
  //  For the Thing Explorer, which runs in the runner's bundle and so can't import `Thing` or `List` itself.
  ////////////////

  /** Is `value` something the explorer shows as a thing -- a `Thing`, or ANY `List`? */
  isThing(value: unknown): value is ThingLike {
    return value instanceof Thing || value instanceof List
  }

  /** `thing`'s items, if it's a `List` -- else `undefined`.  Observable. */
  itemsOf(thing: ThingLike): unknown[] | undefined {
    return thing instanceof List ? thing.items : undefined
  }

  /**
   * What to show `thing` as:  its type, then its top-level name, e.g. `Deck deck`, else its `name`, e.g.
   * `Foundation clubs` or `Card queen-of-spades` -- else just its type.
   * - Reads `name` even when it's computed, e.g. a card's.  One which throws is skipped.
   */
  labelOf(thing: ThingLike): string {
    let name = this.nameOf(thing)
    if (!name) {
      const own = this.read(thing, "name")
      if ("value" in own && typeof own.value === "string") name = own.value
    }
    return name ? `${thing.type} ${name}` : thing.type
  }

  /**
   * Property `name` of `thing`, as the explorer shows it -- its `value`, or the `error` reading it threw.
   * - Read `quietly()`:  a computed property may make things, e.g. a pile's `state` makes a new `Pile` in
   *   `spellCore.map()`.
   */
  read(thing: ThingLike, name: string): { value: unknown } | { error: string } {
    try {
      return { value: this.quietly(() => (thing as unknown as Record<string, unknown>)[name]) }
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) }
    }
  }

  /**
   * Do `work()` with nothing it makes registering -- it's scratch, NOT one of the program's things:
   * - the explorer reading a value.  Registering what that makes would also redraw the explorer, which would
   *   read the value again, and make another -- forever.
   * - a collection helper's result, e.g. the new `Pile` `spellCore.map()` makes -- see `spellCore.newThingLike()`
   *   and `agents/CODE-DEBT.md`.
   */
  quietly<T>(work: () => T): T {
    this.quiet++
    try {
      return work()
    } finally {
      this.quiet--
    }
  }

  /**
   * `thing`'s type, then each type it extends, down to the built-in type it comes from -- e.g.
   * `["Joker", "Card", "Thing"]`, or `["Game", "App", "Thing"]`.
   * - Starts with its `type`, which an instance may override.
   */
  typeChainOf(thing: ThingLike): string[] {
    const chain = [thing.type]
    for (let proto = Object.getPrototypeOf(thing) as object | null; proto; proto = Object.getPrototypeOf(proto)) {
      const { name } = proto.constructor
      if (name && !chain.includes(name)) chain.push(name)
      if (proto === Thing.prototype || proto === List.prototype) break
    }
    return chain
  }

  /**
   * Properties of `thing`, as its program declares them -- each type's own first, then those it inherits.
   * - Each getter of its classes, down to -- NOT including -- the built-in type it comes from:  so a property
   *   never set, e.g. a game's `score` before it's set, shows too.  Spell compiles every property to one.
   * - Getter only, e.g. a card's `name`, is `computed`:  reading it runs code, so the explorer asks first.
   * - Then any other property it holds, e.g. one passed to its constructor but never declared -- a plain
   *   field, NOT observable:  it shows its value as of the last redraw.
   */
  propertiesOf(thing: ThingLike): ThingProperty[] {
    const target = thing
    const properties = new Map<string, ThingProperty>()
    for (
      let proto = Object.getPrototypeOf(target) as object | null;
      proto && !BASE_PROTOTYPES.includes(proto);
      proto = Object.getPrototypeOf(proto)
    ) {
      for (const [name, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(proto))) {
        if (descriptor.get && !properties.has(name)) properties.set(name, { name, computed: !descriptor.set })
      }
    }
    for (const name of [...target.keys(), ...Object.keys(target)]) {
      if (!properties.has(name) && !isBuiltIn(name)) properties.set(name, { name, computed: false })
    }
    return [...properties.values()]
  }

  /**
   * Actions of `thing`, as its program declares them -- each type's own first, then those it inherits, each
   * once:  a sub-type's overrides its super-type's.
   * - Each method of its classes, down to -- NOT including -- the built-in type it comes from.  Spell compiles
   *   an action on a type to one, e.g. `to turn (a card) over` => `turn_over()`.
   * - NOTE: named from the METHOD's name -- see `actionLabel()` -- as its spell wording is only in a comment.
   * - An action spell compiles to a getter, e.g. `(a card) is face up`, is a computed property instead.
   */
  actionsOf(thing: ThingLike): ThingAction[] {
    const own = Object.getPrototypeOf(thing) as object
    const actions = new Map<string, ThingAction>()
    for (
      let proto: object | null = own;
      proto && !BASE_PROTOTYPES.includes(proto);
      proto = Object.getPrototypeOf(proto)
    ) {
      for (const [name, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(proto))) {
        if (name === "constructor" || actions.has(name) || typeof descriptor.value !== "function") continue
        const action: ThingAction = { name, label: actionLabel(name), arguments: (descriptor.value as Function).length }
        if (proto !== own) action.inheritedFrom = proto.constructor.name
        actions.set(name, action)
      }
    }
    return [...actions.values()]
  }

  /**
   * Do action `name` to `thing`, e.g. `turn_over` -- one which takes no arguments.
   * - An error, thrown or from a promise it returns, goes to `spellCore.console`, as the program's would.
   */
  perform(thing: ThingLike, name: string): void {
    const report = (error: unknown) => spellCore.console.error(`${this.labelOf(thing)}:  ${name}() failed`, error)
    try {
      const result: unknown = (thing as unknown as Record<string, () => unknown>)[name]!()
      if (result instanceof Promise) result.catch(report)
    } catch (error) {
      report(error)
    }
  }

  /** Change `version` in a microtask, once however many changes before it -- see `ThingRegistry`. */
  private changed(): void {
    if (this.changePending) return
    this.changePending = true
    queueMicrotask(() => {
      this.changePending = false
      this.versionCell.changed()
    })
  }
}

/** Prototypes of the built-in types a program's types extend -- where `propertiesOf()` stops. */
const BASE_PROTOTYPES: object[] = [Thing.prototype, List.prototype, App.prototype]

/** The built-in classes a program's classes extend -- see `classNamed()`. */
const BUILT_IN_CLASSES: ThingClass[] = [Thing, List, App]

/** Names of the built-in types a program's types extend, e.g. `Thing` -- see `bySuperType()`. */
const BUILT_IN_TYPES = BUILT_IN_CLASSES.map((Class) => Class.name)

/** Is `value` a class of the program's own:  a named sub-class of `Thing` or `List`, NOT one of those? */
function isProgramClass(value: unknown): value is ThingClass {
  if (typeof value !== "function" || !value.name || BUILT_IN_CLASSES.includes(value as ThingClass)) return false
  const { prototype } = value as { prototype?: unknown }
  return prototype instanceof Thing || prototype instanceof List
}

/**
 * Name to show action method `name` by:  its words, and `(name)` for each argument, e.g.
 * `move_to_$pile` => `move to (pile)`, `turn_over` => `turn over`.
 */
function actionLabel(name: string): string {
  return name
    .split("_")
    .map((word) => (word.startsWith("$") ? `(${word.slice(1)})` : word))
    .join(" ")
}

/** Is `name` a member of a built-in type, e.g. `type`, `items`, `Component` -- NOT one of a thing's properties? */
function isBuiltIn(name: string): boolean {
  return name in Thing.prototype || name in List.prototype || name in App.prototype
}

/** A thing the registry holds:  a `Thing`, or a `List`. */
export type ThingLike = Thing | List

/** A class of things:  `Thing`, `List`, `App`, or one a program declares, e.g. `Card`. */
export type ThingClass = new (props?: Record<string, unknown>) => ThingLike

/** Things of one type, as `ThingRegistry.byType()` answers them. */
export type ThingsOfType = {
  /** Their `type`, e.g. `Card`. */
  type: string
  /** Each still alive, in the order they were made. */
  things: ThingLike[]
}

/** A property of a thing, as `ThingRegistry.propertiesOf()` answers it. */
export type ThingProperty = {
  /** Its name, e.g. `score`. */
  name: string
  /** Getter only, e.g. a card's `name`?  Reading it runs code. */
  computed: boolean
}

/** An action of a thing, as `ThingRegistry.actionsOf()` answers it. */
export type ThingAction = {
  /** Its method's name, e.g. `move_to_$pile`. */
  name: string
  /** Name to show it by, e.g. `move to (pile)`. */
  label: string
  /** How many arguments it takes:  `0` for one that can be done as is, e.g. `turn over`. */
  arguments: number
  /** Type_Case name of the super-type it came from, if not the thing's own type's. */
  inheritedFrom?: string
}

/** A top-level thing, as `ThingRegistry.topLevel()` answers it. */
export type NamedThing = {
  /** Its variable's name, e.g. `deck`. */
  name: string
  /** What that variable holds now. */
  thing: ThingLike
}

/** Assembled `spellCore.things` module. */
export const thingsMethods = defineSpellCoreModule({
  /** Every thing the running program has made -- see `ThingRegistry`. */
  things: new ThingRegistry(),

  /**
   * The program's running the code under heading `text` now -- see `ThingRegistry.heading()`.
   * - Compiles from each heading at a file's top level, e.g. `## set up all piles`.
   */
  heading(text: string): void {
    spellCore.things.heading(text)
  }
})
Object.assign(spellCore, thingsMethods)
