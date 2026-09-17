//----------------------------
// Base classes for spell
//--------
import React from "react"
import _ from "lodash"

import { Observable, view } from "~/util"
import { spellCore } from ".."

//----------------------------
// `List`: our array concept (1-based)
//--------
export class List extends Observable<Record<string, unknown>, { items: unknown[] }> {
  constructor(props: Record<string, unknown>) {
    super(props)
    this.create()
  }

  /** `items` array as state */
  /*@state*/ get items(): unknown[] {
    return this.getState<unknown[]>("items", () => [])
  }
  set items(items: unknown[]) {
    this.setState<unknown[]>("items", items)
  }

  // Called automatially at end of `List` constructor.
  create(): void {}

  // Default `type` to the name of our constructor.  Instances can override.
  get type(): string {
    return this.constructor.name
  }
  set type(type: string) {
    this.override("type", type)
  }

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
   * You can override in a subclass to render a wrapper element, etc
   * and use `draw items of {list}` or `draw each of {list}` to render items if desired.
   */
  draw(): ReactNode {
    return this.drawItems()
  }

  /**
   * Draw items in the list items as react components.
   */

  drawItems(): ReactNode {
    return this.map((item, oneIndex) => {
      const { Component } = item as { Component: ReactComponentType }
      return <Component key={oneIndex} />
    })
  }

  // syntactic sugar
  get length(): number {
    return this.itemCount()
  }

  add(...items: unknown[]): void {
    spellCore.append(this, ...items)
  }

  // Map callback RETURNING AS A ZERO-BASED ARRAY ???
  map<T>(callback: (item: unknown, oneIndex: number, list: List) => T): T[] {
    return this.getKeys().map((oneIndex) => callback(this.getItem(oneIndex), oneIndex, this))
  }

  /** Given a `oneIndex`, return the appropriate `zeroIndex`. */
  _getZeroIndex(oneIndex: number): number {
    if (oneIndex === 0) return 1 // ???
    if (oneIndex < 0) return this.items.length + oneIndex
    return oneIndex - 1
  }

  //----------------------------
  // Collection methods
  //----------------------------

  /**
   * Return the current number of `items`.
   */
  itemCount(): number {
    return this.items.length || 0
  }
  /** Return array of `oneIndex`es for each of our items. */
  getKeys(): number[] {
    return _.range(1, this.length + 1)
  }
  /**
   * Return a CLONE of our `items` as a normal `Array`.
   */
  getValues(): unknown[] {
    return [...this.items]
  }
  /**
   * Return the `oneIndex` for first occurance of `thing` in our list.
   */
  itemOf(thing: unknown): number | undefined {
    const zeroIndex = this.items.indexOf(thing)
    if (zeroIndex === -1) return undefined
    return zeroIndex + 1
  }
  /**
   * Return item stored at `oneIndex` or `undefined`.
   */
  getItem(oneIndex: number): unknown {
    return this.items[this._getZeroIndex(oneIndex)]
  }
  /**
   * Set item at `oneIndex` to `value`. Replaces whatever was there.
   */
  setItem(oneIndex: number, value: unknown): void {
    const items = [...this.items]
    const zeroIndex = this._getZeroIndex(oneIndex)
    items[zeroIndex] = value
    this.setState("items", items)
  }
  /**
   * Add one or more `things` to our items starting at oneIndex `start`.
   * Pushes any items after `start` over to make room.
   */
  addAtPosition(start: number, ...things: unknown[]): void {
    const items = [...this.items]
    const itemStart = this._getZeroIndex(start)
    items.splice(itemStart, 0, ...things)
    this.setState("items", items)
  }
  /**
   * Remove item at `oneIndex`, pulling in other objects to fill the gap.
   */
  removeItem(oneIndex: number): void {
    const items = [...this.items]
    items.splice(this._getZeroIndex(oneIndex), 1)
    this.setState("items", items)
  }
  /**
   * Clear all `items` from our list.
   */
  clear(): void {
    this.setState("items", [])
  }

  /**
   * Convert to string by joining with comma.
   */
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
spellCore.addExport("List", List)
