/**
 * Base classes for spell.
 */
import _ from "lodash"

import { Cell, isTrackingCells, Observable, runsCreate, type PropInfo } from "$/util"
import { spellCore } from "$/core/core"
import type { Drawing } from "$/core/drawing"
import type { PropCheck } from "$/core/spellCore.types"

/**
 * `List`: our array concept (1-based) -- what `a deck is a list` extends.
 * - Backed by reactive `items` state rather than a raw JS array, so mutations (`add`, `setItem`, ...)
 *   trigger re-renders of anything observing this `List`.
 * - Copy on write:  each mutation sets `items` to a NEW array -- a spell cell notifies on a new value, never on a
 *   change made in place.
 * - Delegates JS collection duck-typing (`itemCount`, `getKeys`, `getItem`, ...) to `spellCore`'s
 *   generic collection methods -- see `CollectionLike` in `collection-core.ts`.
 * - EXCLUSIVE lists (`exclusive`, from `a card belongs to one pile`):
 *   an item is in at most ONE list of a FAMILY (plan doc D7, D8).
 *   - a family:  the exclusive class and its sub-classes, e.g. every `Pile`, `Tableau`, `Foundation`
 *   - adding an item takes it out of the list of its family holding it;  adding one we hold moves it
 *   - removing it leaves it with no owner
 *   - `Pile.ownerOf(card)` is who holds it, tracked -- what `the pile of a card` compiles to
 *   - a collection helper's result, e.g. `filter()`'s, owns nothing:  see `asScratch()`
 *   - every change to `items` goes through `writeItems()`, which keeps the owners
 * - GUARDS:  what a list takes and gives up when something MOVES, e.g. `a tableau can take a card if: ...`
 *   (plan doc Q23 - Q25) -- see `canTake()`, `canGiveUp()`, `moveHere()`.
 *   - Only a move asks.  `add`, `remove` and `clear` never do:  dealing, gathering cards back.
 */
export class List<T = unknown> extends Observable<Record<string, unknown>, { items: T[] }> {
  /**
   * `true` on an exclusive list class, e.g. `Pile`:  the ROOT of its family -- see class docs.
   * - Compiled from `a card belongs to one pile` as `Pile.exclusive = true`,
   *   just after both classes:  sub-classes inherit it, even one declared before that line.
   * - Set it before making a list of the family:  what a list held already has no owner.
   */
  static exclusive = false

  /**
   * The list of our family holding `item`, if any -- tracked:  a reader re-runs when it changes.
   * - Compiled spell's `the pile of a card`:  `Card.prototype.pile` is `get() { return Pile.ownerOf(this) }`.
   * - `undefined` if we're not exclusive, or `item` can't be owned (not an object).
   * - Typed as one of us:  `Pile.ownerOf(card)` is a `Pile`, as only a `Pile` (or a sub-class) can hold it.
   */
  static ownerOf<L extends List>(this: abstract new (...args: never[]) => L, item: unknown): L | undefined {
    return ListFamily.of(this as unknown as typeof List)?.ownerOf(item) as L | undefined
  }

  /**
   * SIDE EFFECT:  a sub-class's instance, e.g. a `Deck`, registers itself in `spellCore.things`.
   * - `props` optional:  `a new deck` compiles to `new Deck()`.
   */
  constructor(props?: Record<string, unknown>) {
    super(props)
    spellCore.things.add(this)
    if (runsCreate(List, new.target)) this.create()
  }

  /** `items` array as state. */
  /*@state*/ get items(): T[] {
    return this.getState<T[]>("items", () => [])
  }
  set items(items: T[]) {
    this.writeItems(items)
  }

  /**
   * SIDE EFFECT:  we own nothing, even if we're exclusive.  Returns us.
   * - For a SCRATCH result, e.g. what `filter()`, `map()`, `a copy of` make (plan doc D8):
   *   filtering a pile mustn't take its cards.
   * - Call it before adding anything:  what we hold already stays owned.
   */
  asScratch(): this {
    SCRATCH_LISTS.add(this)
    return this
  }

  /**
   * Set reactive `property` to `value` -- see `Thing.setProp()`, which this mirrors:  `check` is how compiled spell
   * said it before the class schema, still honoured.
   */
  protected setProp<T>(property: string, value: T, check?: PropCheck) {
    if (check) spellCore.checkProp(property, value, check)
    return super.setProp(property, value)
  }

  /** A declared prop was set:  warn on the PROGRAM's console if `value` isn't what `info` declares. */
  protected checkPropType(property: string, value: unknown, info: PropInfo): void {
    spellCore.checkProp(property, value, info)
  }

  /**
   * Called once per instance, after constructor props are assigned -- override in a subclass to set up initial state.
   * - NOTE: same timing as `Thing.create()`:  a hand-written subclass with fields MUST be `@thing`.
   */
  create(): void {}

  /** Default `type` to the name of our constructor.  Instances can override via the setter. */
  get type(): string {
    return this.constructor.name
  }
  set type(type: string) {
    this.override("type", type)
  }

  /**
   * `list.draw()` draws its items, each in its own error net.
   * - Override in a subclass to draw a wrapper element, etc.,
   *   and use `draw items of {list}` or `draw each of {list}` to draw the items inside it.
   * - `draw the deck` calls it through `spellCore.drawThing()` (`drawing.ts`).
   */
  draw(): Drawing {
    return this.drawItems()
  }

  /**
   * Its items, each drawn in its own error net, kept by identity -- see `spellCore.drawItems()`.
   * - Compiles from `draw each card in the deck` / `draw cards of the deck` => `spellCore.drawItems(deck)`
   *   -- see `draw.ts`.
   */
  drawItems(): Drawing {
    return spellCore.drawItems(this)
  }

  /** Syntactic sugar for `itemCount()`. */
  get length(): number {
    return this.itemCount()
  }

  /** Append `items` to the end of this list -- delegates to `spellCore.append()`. */
  add(...items: T[]): void {
    spellCore.append(this, ...items)
  }

  /**
   * Map callback RETURNING AS A ZERO-BASED ARRAY ???
   * - `oneIndex` passed to `callback` is still 1-based (matching this list's own indexing) even
   *   though the returned array is zero-based -- NOTE the mismatch if you rely on both.
   */
  map<R>(callback: (item: T, oneIndex: number, list: this) => R): R[] {
    // a key from `getKeys()` is in range
    return this.getKeys().map((oneIndex) => callback(this.getItem(oneIndex) as T, oneIndex, this))
  }

  /**
   * Given a `oneIndex`, return the appropriate `zeroIndex`.
   * NOTE: `oneIndex === 0` returns zeroIndex `1` (the SECOND item), not `0` -- looks off by one,
   * but marked `???` by the original author too rather than treated as a confirmed bug.
   */
  _getZeroIndex(oneIndex: number): number {
    if (oneIndex === 0) return 1 // ???
    if (oneIndex < 0) return this.items.length + oneIndex
    return oneIndex - 1
  }

  ////////////////
  // ## Collection methods
  ////////////////

  /** Return the current number of `items`. */
  itemCount(): number {
    return this.items.length || 0
  }
  /** Return array of `oneIndex`es for each of our items. */
  getKeys(): number[] {
    return _.range(1, this.length + 1)
  }
  /** Return a CLONE of our `items` as a normal `Array`. */
  getValues(): T[] {
    return [...this.items]
  }
  /** Return the `oneIndex` for first occurance of `thing` in our list. */
  itemOf(thing: unknown): number | undefined {
    // widened:  we may be asked for anything
    const zeroIndex = (this.items as unknown[]).indexOf(thing)
    if (zeroIndex === -1) return undefined
    return zeroIndex + 1
  }
  /** Return item stored at `oneIndex` or `undefined`. */
  getItem(oneIndex: number): T | undefined {
    return this.items[this._getZeroIndex(oneIndex)]
  }
  /**
   * Set item at `oneIndex` to `value`.  Replaces whatever was there.
   * - NOTE: an exclusive list may hold an item twice for a moment,
   *   e.g. while `reverse()` sets each position in turn.
   */
  setItem(oneIndex: number, value: T): void {
    const items = [...this.items]
    const zeroIndex = this._getZeroIndex(oneIndex)
    items[zeroIndex] = value
    this.writeItems(items)
  }
  /**
   * Add one or more `things` to our items starting at oneIndex `start`.
   * - Pushes any items after `start` over to make room.
   * - Exclusive:  one we hold already MOVES here -- we hold each item once.
   */
  addAtPosition(start: number, ...things: T[]): void {
    let items = [...this.items]
    let itemStart = this._getZeroIndex(start)
    if (this.family) {
      const moving = new Set<unknown>(things.filter(isOwnable))
      itemStart -= items.slice(0, itemStart).filter((item) => moving.has(item)).length
      items = items.filter((item) => !moving.has(item))
    }
    items.splice(itemStart, 0, ...things)
    this.writeItems(items)
  }
  /** Remove item at `oneIndex`, pulling in other objects to fill the gap. */
  removeItem(oneIndex: number): void {
    const items = [...this.items]
    items.splice(this._getZeroIndex(oneIndex), 1)
    this.writeItems(items)
  }
  /** Clear all `items` from our list. */
  clear(): void {
    this.writeItems([])
  }

  ////////////////
  // ## Exclusive lists
  ////////////////

  /** Our family's owners, if we're an exclusive list that isn't scratch -- see class docs. */
  private get family(): ListFamily | undefined {
    if (SCRATCH_LISTS.has(this)) return undefined
    return ListFamily.of(this.constructor as typeof List)
  }

  /**
   * Make `next` our items -- EVERY change to them comes here, so an exclusive list keeps its family's owners:
   * - an item going out, no longer anywhere in `next`, has no owner (plan doc D8)
   * - an item coming in is ours, THEN leaves the list of our family that held it --
   *   in that order, so its owner changes once:  a reader never sees it ownerless mid-move
   * - SIDE EFFECT:  the list it left changes too, and readers of each item's owner re-run
   */
  private writeItems(next: T[]): void {
    const { family } = this
    if (!family) {
      this.setState("items", next)
      return
    }
    const previous = this.items
    this.setState("items", next)
    const kept = new Set(next)
    for (const item of previous) {
      if (!kept.has(item) && family.ownerOf(item, "UNTRACKED") === this) family.setOwner(item, undefined)
    }
    for (const item of next) {
      const owner = family.ownerOf(item, "UNTRACKED")
      if (owner === this) continue
      family.setOwner(item, this)
      owner?.release(item)
    }
  }

  /** SIDE EFFECT:  `item` leaves us, wherever it is -- it's joining another list of our family. */
  private release(item: unknown): void {
    this.writeItems(this.items.filter((it) => it !== item))
  }

  ////////////////
  // ## Guards
  ////////////////

  /**
   * Will we take `item`, moved here?  Yes -- unless a sub-class says otherwise:
   * `a tableau can take a card if: ...` compiles to `canTake(card) {...}` in `Tableau`.
   * - Only a move asks (`moveHere()`):  `add` never does, e.g. dealing (plan doc Q25).
   * - Compiled spell's `the tableau can take the card` -- see `spellCore.canTake()`.
   */
  canTake(_item: unknown): boolean {
    return true
  }

  /**
   * Will we give up `item`, moved to another list of our family?  Yes -- unless a sub-class says otherwise:
   * `a foundation can never let go of a card` compiles to `canGiveUp(card) { return false }`.
   * - Only a move asks (`moveHere()`):  `remove` and `clear` never do,
   *   e.g. gathering every card back to deal again (plan doc Q25).
   * - Compiled spell's `the pile can give up the card` -- see `spellCore.canGiveUp()`.
   */
  canGiveUp(_item: unknown): boolean {
    return true
  }

  /**
   * Move `item` here, if the list holding it lets it go and we take it -- `move the card to the tableau`.
   * - Returns whether it moved.  Refused:  nothing changes.
   * - The list holding it:  the one of our family, if we're exclusive.  Else none is asked:  just `canTake()`.
   * - Then added, as `add`:  its owner changes ONCE -- see `writeItems()`.
   * - See `spellCore.move()`.
   */
  moveHere(item: T): boolean {
    const owner = this.family?.ownerOf(item, "UNTRACKED")
    if (owner && !owner.canGiveUp(item)) return false
    if (!this.canTake(item)) return false
    this.add(item)
    return true
  }

  /** Convert to string by joining with comma. */
  toString(): string {
    return this.items.join(", ")
  }

  /**
   * If we're asked for an iterator, use a copy of our `items`,
   * freezing the iteration to the initial state of `items`.
   */
  [Symbol.iterator](): Iterator<T> {
    return [...this.items][Symbol.iterator]()
  }
}

/**
 * Lists that own nothing -- see `List.asScratch()`.
 * - A `WeakSet`, as `items` may be set before our fields are.
 */
const SCRATCH_LISTS = new WeakSet<List>()

/** Each exclusive family's owners, by its root class -- see `ListFamily.of()`. */
const FAMILIES = new WeakMap<typeof List, ListFamily>()

/**
 * Who holds each item, for ONE family of exclusive lists, e.g. every `Pile` -- see `List`'s class docs.
 * - Plain `WeakMap`s:  an item, or a list, that's gone is forgotten.
 * - Each item's owner is tracked with its own `Cell`, made when someone reads it.
 */
class ListFamily {
  /** Each item's list. */
  owners = new WeakMap<object, List>()
  /** Each item's cell, once someone has read its owner. */
  cells = new WeakMap<object, Cell>()

  /** Family of `listClass`, if it's exclusive:  rooted at the HIGHEST class up its chain that says so. */
  static of(listClass: typeof List): ListFamily | undefined {
    if (!listClass.exclusive) return undefined
    let root = listClass
    for (let at = listClass; at && at !== List; at = Object.getPrototypeOf(at) as typeof List) {
      if (Object.hasOwn(at, "exclusive") && at.exclusive) root = at
    }
    let family = FAMILIES.get(root)
    if (!family) FAMILIES.set(root, (family = new ListFamily()))
    return family
  }

  /** `item`'s list -- tracked, unless `UNTRACKED`. */
  ownerOf(item: unknown, untracked?: "UNTRACKED"): List | undefined {
    if (!isOwnable(item)) return undefined
    if (!untracked && isTrackingCells()) {
      let cell = this.cells.get(item)
      if (!cell) this.cells.set(item, (cell = new Cell()))
      cell.read()
    }
    return this.owners.get(item)
  }

  /** SIDE EFFECT:  `owner` holds `item` now -- `undefined`:  nothing does.  Readers re-run if it changed. */
  setOwner(item: unknown, owner: List | undefined): void {
    if (!isOwnable(item) || this.owners.get(item) === owner) return
    if (owner) this.owners.set(item, owner)
    else this.owners.delete(item)
    this.cells.get(item)?.changed()
  }
}

/** Can a list own `item`:  an object -- a `WeakMap` key.  A number or text can't be. */
function isOwnable(item: unknown): item is object {
  return (typeof item === "object" && item !== null) || typeof item === "function"
}
