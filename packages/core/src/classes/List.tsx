/**
 * Base classes for spell.
 */
import React from "react"
import _ from "lodash"

import { Observable, runsCreate, view } from "$/util"
import { spellCore } from "$/core/core"
import type { PropCheck } from "$/core/spellCore.types"

/**
 * `List`: our array concept (1-based) -- what `a deck is a list` extends.
 * - Backed by reactive `items` state rather than a raw JS array, so mutations (`add`, `setItem`, ...)
 *   trigger re-renders of anything observing this `List`.
 * - Delegates JS collection duck-typing (`itemCount`, `getKeys`, `getItem`, ...) to `spellCore`'s
 *   generic collection methods -- see `CollectionLike` in `collection-core.ts`.
 */
export class List extends Observable<Record<string, unknown>, { items: unknown[] }> {
  /** SIDE EFFECT:  a sub-class's instance, e.g. a `Deck`, registers itself in `spellCore.things`. */
  constructor(props: Record<string, unknown>) {
    super(props)
    spellCore.things.add(this)
    if (runsCreate(List, new.target)) this.create()
  }

  /** `items` array as state. */
  /*@state*/ get items(): unknown[] {
    return this.getState<unknown[]>("items", () => [])
  }
  set items(items: unknown[]) {
    this.setState<unknown[]>("items", items)
  }

  /**
   * Set reactive `property` to `value`, warning first if it fails `check` -- it's stored either way.
   * - Compiled property setters call this, e.g. `set name(value) { this.setProp('name', value, { type: 'text' }) }`
   * - Same as `Thing.setProp()`.
   */
  protected setProp<T>(property: string, value: T, check?: PropCheck) {
    if (check) spellCore.checkProp(property, value, check)
    return super.setProp(property, value)
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
   * React component which renders this list, memoized so the same component identity is reused
   * across renders (a fresh class each render would remount instead of updating).
   * - NOTE: uses a class component, not a function component, to sidestep hook issues with
   *   `react-easy-state`'s `view()` wrapper.
   */
  /*@memoize*/
  get Component(): ReactComponentType {
    return this.derived("Component", () => {
      const render = () => this.draw()
      class ListC extends React.Component {
        render = render
      }
      return view(ListC)
    })
  }

  // @memoize
  // get Component() {
  //   return view(() => {
  //     const elements = this.draw()
  //     console.info({ list: this, elements })
  //     return elements
  //   })
  // }

  /**
   * `list.draw()` returns list items as react components.
   * - You can override in a subclass to render a wrapper element, etc.
   *   and use `draw items of {list}` or `draw each of {list}` to render items if desired.
   * - Compiles from `draw the deck` -- see `draw.ts` (`spellCore.drawThing()` calls this via `.Component`).
   */
  draw(): ReactNode {
    return this.drawItems()
  }

  /**
   * Draw items in the list items as react components.
   * - Compiles from `draw each card in the deck` / `draw cards of the deck` => `spellCore.drawItems(deck)`
   *   -- see `draw.ts`.
   */
  drawItems(): ReactNode {
    return this.map((item, oneIndex) => {
      const { Component } = item as { Component: ReactComponentType }
      return <Component key={oneIndex} />
    })
  }

  /** Syntactic sugar for `itemCount()`. */
  get length(): number {
    return this.itemCount()
  }

  /** Append `items` to the end of this list -- delegates to `spellCore.append()`. */
  add(...items: unknown[]): void {
    spellCore.append(this, ...items)
  }

  /**
   * Map callback RETURNING AS A ZERO-BASED ARRAY ???
   * - `oneIndex` passed to `callback` is still 1-based (matching this list's own indexing) even
   *   though the returned array is zero-based -- NOTE the mismatch if you rely on both.
   */
  map<T>(callback: (item: unknown, oneIndex: number, list: List) => T): T[] {
    return this.getKeys().map((oneIndex) => callback(this.getItem(oneIndex), oneIndex, this))
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
  getValues(): unknown[] {
    return [...this.items]
  }
  /** Return the `oneIndex` for first occurance of `thing` in our list. */
  itemOf(thing: unknown): number | undefined {
    const zeroIndex = this.items.indexOf(thing)
    if (zeroIndex === -1) return undefined
    return zeroIndex + 1
  }
  /** Return item stored at `oneIndex` or `undefined`. */
  getItem(oneIndex: number): unknown {
    return this.items[this._getZeroIndex(oneIndex)]
  }
  /** Set item at `oneIndex` to `value`.  Replaces whatever was there. */
  setItem(oneIndex: number, value: unknown): void {
    const items = [...this.items]
    const zeroIndex = this._getZeroIndex(oneIndex)
    items[zeroIndex] = value
    this.setState("items", items)
  }
  /**
   * Add one or more `things` to our items starting at oneIndex `start`.
   * - Pushes any items after `start` over to make room.
   */
  addAtPosition(start: number, ...things: unknown[]): void {
    const items = [...this.items]
    const itemStart = this._getZeroIndex(start)
    items.splice(itemStart, 0, ...things)
    this.setState("items", items)
  }
  /** Remove item at `oneIndex`, pulling in other objects to fill the gap. */
  removeItem(oneIndex: number): void {
    const items = [...this.items]
    items.splice(this._getZeroIndex(oneIndex), 1)
    this.setState("items", items)
  }
  /** Clear all `items` from our list. */
  clear(): void {
    this.setState("items", [])
  }

  /** Convert to string by joining with comma. */
  toString(): string {
    return this.items.join(", ")
  }

  /**
   * If we're asked for an iterator, use a copy of our `items`,
   * freezing the iteration to the initial state of `items`.
   */
  [Symbol.iterator](): Iterator<unknown> {
    return [...this.items][Symbol.iterator]()
  }
}
