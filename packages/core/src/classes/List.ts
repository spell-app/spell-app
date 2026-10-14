/**
 * Base classes for spell.
 */
import _ from "lodash"

import { Cell, isTrackingCells, ITEMS_KEY, Observable, runsCreate, typedJSON, type PropInfo } from "$/util"
import { spellCore } from "$/core/core"
import type { CollectionIterationCallback } from "$/core/collection-other"
import type { Drawing } from "$/core/drawing"
import type { PropCheck } from "$/core/spellCore.types"
import { zeroIndexOf } from "$/core/positions"

import { ID_PROP } from "./ids"

/**
 * `List`: our array concept -- what `a deck is a list` extends.
 * - Counted from 0, as an array is (epic `python-target` P23):
 *   spell code counting from 1 is turned into indexes as it compiles -- see `positions.ts`.
 * - Backed by reactive `items` state rather than a raw JS array, so mutations (`add`, `setItem`, ...)
 *   trigger re-renders of anything observing this `List`.
 * - Copy on write:  each mutation sets `items` to a NEW array --
 *   a spell cell notifies on a new value, never on a change made in place.
 * - Delegates JS collection duck-typing (`itemCount`, `getKeys`, `getItem`, ...) to `spellCore`'s
 *   generic collection methods -- see `CollectionLike` in `collection-core.ts`.
 * - Has its own list methods for hand-written TypeScript, e.g. `pile.filter(...)`, `pile.lastItem`:
 *   each calls its `spellCore` twin -- see "List methods" below.
 * - Iterable:  `for (const card of pile)`.
 * - EXCLUSIVE lists (`exclusive`, from `a card belongs to one pile`):
 *   an item is in at most ONE list of a FAMILY (epic page D7, D8).
 *   - a family:  the exclusive class and its sub-classes, e.g. every `Pile`, `Tableau`, `Foundation`
 *   - adding an item takes it out of the list of its family holding it;  adding one we hold moves it
 *   - removing it leaves it with no owner
 *   - `Pile.ownerOf(card)` is who holds it, tracked -- what `the pile of a card` compiles to
 *   - a collection helper's result, e.g. `filter()`'s, owns nothing:  see `asScratch()`
 *   - every change to `items` goes through `writeItems()`, which keeps the owners
 * - GUARDS:  what a list takes and gives up when something MOVES, e.g. `a tableau can take a card if: ...`
 *   (epic page Q23 - Q25) -- see `canTake()`, `canGiveUp()`, `moveHere()`.
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
   * Is a list of this class saved INSIDE its owner, rather than in a file of its own?  See `Thing.savedInline`.
   * - Compiled from `a hand is saved inline.`, as `static savedInline = true` in its class.
   */
  static savedInline = false

  static {
    this.declareProp("id", ID_PROP)
  }

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
   * - For a SCRATCH result, e.g. what `filter()`, `map()`, `a copy of` make (epic page D8):
   *   filtering a pile mustn't take its cards.
   * - Call it before adding anything:  what we hold already stays owned.
   */
  asScratch(): this {
    SCRATCH_LISTS.add(this)
    return this
  }

  /**
   * Set reactive `property` to `value` -- see `Thing.setProp()`, which this mirrors.
   * - `check`:  how compiled spell said it before the class schema, still honoured.
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

  /**
   * Our id, as a thing's:  a list is a thing in spell -- see `Thing.id`.
   * - Made the first time it's read, then kept;  set it to choose one.
   */
  get id(): string {
    return this.getProp<string>("id")
  }
  set id(id: string) {
    this.setProp("id", id)
  }

  /** Default `type` to the name of our constructor.  Instances can override via the setter. */
  get type(): string {
    return this.constructor.name
  }
  set type(type: string) {
    this.override("type", type)
  }

  /**
   * `list.draw()` draws its items, each in its own error boundary.
   * - Override in a subclass to draw a wrapper element, etc.,
   *   and use `draw items of {list}` or `draw each of {list}` to draw the items inside it.
   * - `draw the deck` calls it through `spellCore.drawThing()` (`drawing.ts`).
   */
  draw(): Drawing {
    return this.drawItems()
  }

  /**
   * Its items, each drawn in its own error boundary, kept by identity -- see `spellCore.drawItems()`.
   * - Compiles from `draw each card in the deck` / `draw cards of the deck` => `spellCore.drawItems(deck)`
   *   -- see `rules/draw/DrawItems.ts`.
   */
  drawItems(): Drawing {
    return spellCore.drawItems(this)
  }

  /** Syntactic sugar for `itemCount()`. */
  get length(): number {
    return this.itemCount()
  }

  /** Append `items` to the end of this list -- delegates to `spellCore.append()`.  See `append()`, which chains. */
  add(...items: T[]): void {
    spellCore.append(this, ...items)
  }

  /** The index `index` reaches in our items:  `undefined` for none.  Negative counts from the end, `-1` the last. */
  _getZeroIndex(index: number): number | undefined {
    return zeroIndexOf(index, this.items.length)
  }

  ////////////////
  // ## Collection methods
  ////////////////

  /** Return the current number of `items`. */
  itemCount(): number {
    return this.items.length || 0
  }
  /** Our indexes, from 0. */
  getKeys(): number[] {
    return _.range(0, this.length)
  }
  /** Return a CLONE of our `items` as a normal `Array`. */
  getValues(): T[] {
    return [...this.items]
  }
  /**
   * The index of the first `thing` in our list, from 0 -- `the position of card in the pile`.
   * - `undefined` if we don't hold it, never `-1`.
   */
  positionOf(thing: unknown): number | undefined {
    // widened:  we may be asked for anything
    const index = (this.items as unknown[]).indexOf(thing)
    return index === -1 ? undefined : index
  }
  /** @deprecated  `positionOf()`, since epic `output-targets` P16:  TypeScript compiled before it calls this. */
  itemOf(thing: unknown): number | undefined {
    return this.positionOf(thing)
  }
  /**
   * The item at `index`, from 0, or `undefined`.  Negative counts from the end:  `-1` is the last.
   * - Not a whole number, e.g. `position(0)`'s `NaN`:  none.
   */
  getItem(index: number): T | undefined {
    const zeroIndex = this._getZeroIndex(index)
    return zeroIndex === undefined ? undefined : this.items[zeroIndex]
  }
  /** The item at `index`, as an array's `at()` -- `getItem()`, which it is. */
  at(index: number): T | undefined {
    return this.getItem(index)
  }
  /**
   * Set the item at `index` to `value`.  Replaces whatever was there;  no such index:  nothing changes.
   * - From 0;  negative counts from the end.
   * - NOTE: an exclusive list may hold an item twice for a moment,
   *   e.g. while `reverse()` sets each position in turn.
   */
  setItem(index: number, value: T): void {
    const zeroIndex = this._getZeroIndex(index)
    if (zeroIndex === undefined) return
    const items = [...this.items]
    items[zeroIndex] = value
    this.writeItems(items)
  }
  /**
   * Add one or more `things` to our items at index `start`, from 0, as `splice()` adds them.
   * - Pushes the items from `start` on over to make room;  past the end:  at the end.
   * - Exclusive:  one we hold already MOVES here -- we hold each item once.
   */
  addAtPosition(start: number, ...things: T[]): void {
    let items = [...this.items]
    // past the end:  at the end;  negative from the end;  further back than the front:  the front
    let itemStart = start >= items.length ? items.length : (this._getZeroIndex(start) ?? 0)
    if (this.family) {
      const moving = new Set<unknown>(things.filter(isOwnable))
      itemStart -= items.slice(0, itemStart).filter((item) => moving.has(item)).length
      items = items.filter((item) => !moving.has(item))
    }
    items.splice(itemStart, 0, ...things)
    this.writeItems(items)
  }
  /**
   * Remove the item at `index`, pulling in other objects to fill the gap.  No such index:  nothing changes.
   * - From 0;  negative counts from the end.
   */
  removeItem(index: number): void {
    const zeroIndex = this._getZeroIndex(index)
    if (zeroIndex === undefined || zeroIndex >= this.items.length) return
    const items = [...this.items]
    items.splice(zeroIndex, 1)
    this.writeItems(items)
  }
  /** Clear all `items` from our list. */
  clear(): void {
    this.writeItems([])
  }

  ////////////////
  // ## List methods
  //  What hand-written TypeScript calls, e.g. `allPiles.filter((pile) => pile.droppable)`
  //  (epic `output-targets`, Q33, Q35).
  //  Each does EXACTLY what its `spellCore` twin does, by calling it:  one copy of the logic.
  //  - every position is an index, from 0, as an array's
  //  - a list result is SCRATCH, of our class, and owns nothing:
  //    filtering the piles never takes a card out of its pile -- see `asScratch()`
  //  - a callback gets `(value, position, list)`, as `spellCore.forEach()`'s does
  //  - a change returns us, so calls chain:  `pile.append(card).reverse()`
  ////////////////

  /** First item, `undefined` if we're empty -- `the first item of my-list`. */
  get firstItem(): T | undefined {
    return this.getItem(0)
  }

  /** Last item, `undefined` if we're empty -- `the last item of my-list`. */
  get lastItem(): T | undefined {
    return this.getItem(-1)
  }

  /** Do we hold nothing?  `my-list is empty` -- see `spellCore.isEmpty()`. */
  get isEmpty(): boolean {
    return spellCore.isEmpty(this)
  }

  /** Largest item, by `>`;  `undefined` if we're empty -- `the largest of my-list`, see `spellCore.largestOf()`. */
  get max(): T | undefined {
    return spellCore.largestOf(this) as T | undefined
  }

  /** Smallest item, by `<`;  `undefined` if we're empty -- `the smallest of my-list`, see `spellCore.smallestOf()`. */
  get min(): T | undefined {
    return spellCore.smallestOf(this) as T | undefined
  }

  /**
   * Our items, as a new plain array -- see `getValues()`.
   * - NOTE:  no `keys` getter beside it:  `keys()` is `Observable`'s, a list's PROPS, which the Thing Explorer reads.
   *   Our indexes are `getKeys()`, `[0, 1, ... length - 1]`.
   */
  get values(): T[] {
    return this.getValues()
  }

  /** One item, picked at random;  `undefined` if we're empty -- `a random card from the deck`. */
  randomItem(): T | undefined {
    return spellCore.randomItemOf<T>(this)
  }

  /**
   * Up to `count` items, picked at random, each at most once -- scratch, of our class.
   * - No `count`:  all of them, shuffled.
   * - `3 random cards from the deck`, see `spellCore.randomItemsOf()`.
   */
  randomItems(count?: number): this {
    return spellCore.randomItemsOf(this, count) as this
  }

  /**
   * Do we hold EVERY one of `values`?  `false` for none -- `my-list includes thing`, see `spellCore.includes()`.
   * - Asks about anything, not just a `T`:  `pile.includes(maybeCard)`.
   */
  includes(...values: unknown[]): boolean {
    return spellCore.includes(this, ...values)
  }

  /** Do we hold ANY of `values`?  See `spellCore.includesAny()`. */
  includesAny(...values: unknown[]): boolean {
    return spellCore.includesAny(this, ...values)
  }

  /**
   * Does `condition` say yes for every item?  No `condition`:  is every item truthy?
   * - NOTE:  `false` if we're empty, as `spellCore.all()`.
   */
  all(condition?: ListCallback<T, this>): boolean {
    return spellCore.all<T>(this, condition as Callback<T>)
  }

  /**
   * Does `condition` say yes for any item?
   * - No `condition`:  is any item truthy?  See `spellCore.any()`.
   */
  any(condition?: ListCallback<T, this>): boolean {
    return spellCore.any<T>(this, condition as Callback<T>)
  }

  /**
   * Call `callback` for each item, in order -- `for each card in the pile: ...`.
   * - Doesn't wait for one that returns a promise:  write a `for (const card of pile)` loop for that.
   */
  forEach(callback: ListCallback<T, this>): void {
    spellCore.forEach<T>(this, callback as Callback<T>)
  }

  /**
   * What `callback` answers for each item, in a scratch list of our class -- see `spellCore.map()`.
   * - NOTE:  typed as a plain `List<R>`:  TypeScript can't say "our class, holding `R`".
   */
  map<R>(callback: ListCallback<T, this, R>): List<R> {
    return spellCore.map<T>(this, callback as Callback<T>) as List<R>
  }

  /**
   * The items `condition` says yes to, in a scratch list of our class:
   * a `Pile` filtered is a `Pile`, which owns none of them.
   * - No `condition`:  the truthy ones.
   * - `words in "a word list" where ...`, see `spellCore.filter()`.
   */
  filter(condition?: ListCallback<T, this>): this {
    return spellCore.filter<T, this>(this, condition as Callback<T>)
  }

  /** SIDE EFFECT:  add `things` at the end.  Returns us -- see `spellCore.append()`. */
  append(...things: T[]): this {
    spellCore.append(this, ...things)
    return this
  }

  /** SIDE EFFECT:  add `things` at the start, pushing the rest down.  Returns us -- see `spellCore.prepend()`. */
  prepend(...things: T[]): this {
    spellCore.prepend(this, ...things)
    return this
  }

  /**
   * SIDE EFFECT:  add `things` at index `position`, pushing what was there down.  Returns us.
   * - `add card to the pile at position 2`, see `spellCore.addAtPosition()`.
   */
  addAt(position: number, ...things: T[]): this {
    spellCore.addAtPosition(this, position, ...things)
    return this
  }

  /**
   * SIDE EFFECT:  add `things` just before `item`.  Returns us.
   * - `item` isn't here:  at the START.
   * - `add card to the pile before other-card`, see `spellCore.addBefore()`.
   */
  addBefore(item: unknown, ...things: T[]): this {
    spellCore.addBefore(this, item, ...things)
    return this
  }

  /**
   * SIDE EFFECT:  add `things` just after `item`.  Returns us.
   * - `item` isn't here:  at the END.
   * - `add card to the pile after other-card`, see `spellCore.addAfter()`.
   */
  addAfter(item: unknown, ...things: T[]): this {
    spellCore.addAfter(this, item, ...things)
    return this
  }

  /** SIDE EFFECT:  take out every one of `things`, wherever it is.  Returns us -- see `spellCore.remove()`. */
  remove(...things: unknown[]): this {
    spellCore.remove(this, ...things)
    return this
  }

  /** SIDE EFFECT:  take out each item `condition` says yes to.  Returns us -- see `spellCore.removeWhere()`. */
  removeWhere(condition: ListCallback<T, this>): this {
    spellCore.removeWhere<T>(this, condition as Callback<T>)
    return this
  }

  /**
   * SIDE EFFECT:  take out the items from index `start` up to, not including, `end`, as `slice()` reads them.
   * - Returns us.
   * - `remove items 2 to 4 of my-list`, its indexes worked out, see `spellCore.removeRangeBetween()`.
   */
  removeBetween(start: number, end: number): this {
    spellCore.removeRangeBetween(this, start, end)
    return this
  }

  /**
   * SIDE EFFECT:  set the items from `position` on to `values`, replacing what's there.  Returns us.
   * - See `spellCore.setItemsOf()`.
   */
  setItems(position: number, ...values: T[]): this {
    spellCore.setItemsOf(this, position, ...values)
    return this
  }

  /** SIDE EFFECT:  reverse our order, in place.  Returns us -- see `spellCore.reverse()`. */
  reverse(): this {
    spellCore.reverse(this)
    return this
  }

  /** SIDE EFFECT:  shuffle our items, in place -- `shuffle the deck`.  Returns us, see `spellCore.randomize()`. */
  randomize(): this {
    spellCore.randomize(this)
    return this
  }

  /**
   * The items from index `index` to the end, in a scratch list of our class.
   * - A negative `index` counts from the end:  `-2` is the last two.
   * - See `spellCore.rangeStartingAt()`.
   */
  startingFrom(index: number): this {
    return spellCore.rangeStartingAt(this, index, undefined)
  }

  /**
   * The items from `item` to the end, in a scratch list of our class -- `cards of the pile starting with card`.
   * - NOTE:  `item` isn't here:  ALL of them.
   *   As compiled spell does it, `rangeStartingAt(list, positionOf(list, item))`.
   */
  startingWith(item: unknown): this {
    return spellCore.rangeStartingAt(this, spellCore.positionOf(this, item))
  }

  /**
   * The items from index `start` up to, not including, `end`, in a scratch list of our class, as an array's `slice()`.
   * - Negative counts from the end;  no `end`:  to the end.  Out of range:  an empty one.
   * - `items 1 to 2 of my-list` compiles to `myList.slice(0, 2)` -- see `spellCore.rangeBetween()`.
   */
  slice(start?: number, end?: number): this {
    return spellCore.rangeBetween(this, start, end) as this
  }

  /** Is `thing` our first item?  `false` for `undefined` -- see `spellCore.startsWith()`. */
  startsWith(thing: unknown): boolean {
    return spellCore.startsWith(this, thing)
  }

  /** Is `thing` our last item?  `false` for `undefined` -- see `spellCore.endsWith()`. */
  endsWith(thing: unknown): boolean {
    return spellCore.endsWith(this, thing)
  }

  /**
   * A scratch copy of us, of our class:
   * `a copy of discards`, or `a copy of discards as a pile` when a discard-pile already is a pile (Q36).
   */
  clone(): this {
    return spellCore.duplicateList(this)
  }

  /** A scratch copy of us, as `Class` -- `a copy of discards as a hand`.  See `spellCore.duplicateList()`. */
  cloneAs<L>(Class: new () => L): L {
    return spellCore.duplicateList(this, Class)
  }

  /** SIDE EFFECT:  add every item of each of `lists`, in turn.  Returns us -- see `spellCore.mergeListsInto()`. */
  appendAll(...lists: unknown[]): this {
    spellCore.mergeListsInto(this, ...lists)
    return this
  }

  /**
   * We're a list of lists:  their items, all in one scratch list -- `merge the piles`.
   * - No `Class`:  of our first list's class, `undefined` if we're empty.
   * - `merge the piles as a pile`:  of `Class`.
   * - See `spellCore.mergeLists()`.
   */
  merged(): T | undefined
  merged<L>(Class: new () => L): L
  merged<L>(Class?: new () => L): T | L | undefined {
    return spellCore.mergeLists<T, T | L>(this, Class)
  }

  /** Are we of type `typeName`, or a sub-type of it?  e.g. `"pile"`, `"list"` -- see `spellCore.isOfType()`. */
  isOfType(typeName: string): boolean {
    return spellCore.isOfType(this, typeName)
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
   * - an item going out, no longer anywhere in `next`, has no owner (epic page D8)
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
   * - Only a move asks (`moveHere()`):  `add` never does, e.g. dealing (epic page Q25).
   * - Compiled spell's `the tableau can take the card` -- see `spellCore.canTake()`.
   */
  canTake(_item: unknown): boolean {
    return true
  }

  /**
   * Will we give up `item`, moved to another list of our family?  Yes -- unless a sub-class says otherwise:
   * `a foundation can never let go of a card` compiles to `canGiveUp(card) { return false }`.
   * - Only a move asks (`moveHere()`):  `remove` and `clear` never do,
   *   e.g. gathering every card back to deal again (epic page Q25).
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
   * Our JSON:  our class's name as `"@type"`, our own props,
   * then our items under `"@items"` (`ITEMS_KEY`), each by its own JSON (epic `output-targets`, Q49, J53).
   * ```
   * { "@type": "Pile", "name": "stock", "@items": [{ "@type": "Card", ... }] }
   * ```
   * - A plain `List`, with no props, or a scratch list:  `{ "@type": "List", "@items": [...] }`.
   * - So it reads back as what it was:  `spellCore.fromJSON()` (`json.ts`).
   * - `"@items"` never collides with a prop, as `"@type"` never does:  no prop is named `@...`.
   * - Tracked:  a reader re-runs when a prop or the items change (and, through each item's `toJSON()`, when they do).
   */
  toJSON(): Record<string, unknown> {
    return { ...typedJSON(this), [ITEMS_KEY]: this.items }
  }

  /**
   * Our items, in order:  `for (const card of pile) { ... }`, `[...pile]`.
   * - Over a copy of our `items`, frozen as they were when it started:
   *   a loop moving cards out of the pile still sees each one.
   */
  [Symbol.iterator](): Iterator<T> {
    return [...this.items][Symbol.iterator]()
  }
}

/**
 * What a `List` method calls for each item, e.g. `filter()`'s condition:  `(value, position, list)`.
 * - `position` is an index, from 0;  `list` is the list it was called on, typed as it is:  a `Pile`'s is a `Pile`.
 * - `R`:  what it answers -- `map()`'s result items, else anything (tested for truth).
 */
export type ListCallback<T, L, R = unknown> = (value: T, position: number, list: L) => R

/** Its `spellCore` twin's callback:  a `ListCallback` passes as one, as a list's keys are its positions. */
type Callback<T> = CollectionIterationCallback<T>

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
