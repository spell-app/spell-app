//----------------------------
// Base classes for spell
//--------
import React from "react"
import _ from "lodash"

import { Observable, memoize, view, state } from "~/util"
import { spellCore } from ".."

//----------------------------
// `List`: our array concept (1-based)
//--------
export class List extends Observable {
  constructor(props) {
    super(props)
    this.create()
  }

  /** `items` array as state */
  @state items = []

  // Called automatially at end of `List` constructor.
  create() {}

  // Default `type` to the name of our constructor.  Instances can override.
  get type() {
    return "type" in this._props ? this._props.type : this.constructor.name
  }
  set type(type) {
    this._props.type = type
  }

  @memoize
  get Component() {
    const render = () => {
      const elements = this.draw()
      // console.info({ list: this, elements })
      return elements
    }
    class ListC extends React.Component {
      render = render
    }
    return view(ListC)
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
   * and use `draw items of {list}` to render items if desired.
   */
  draw() {
    return this.drawItems()
  }

  /**
   * Draw items in the list items as react components.
   */

  drawItems() {
    return this.map((item, oneIndex) => <item.Component key={oneIndex} />)
  }

  // syntactic sugar
  get length() {
    return this.itemCount()
  }

  add(...items) {
    spellCore.append(this, ...items)
  }

  // Map callback RETURNING AS A ZERO-BASED ARRAY ???
  map(callback) {
    return this.getKeys().map((oneIndex) => callback(this.getItem(oneIndex), oneIndex, this))
  }

  /** Given a `oneIndex`, return the appropriate `zeroIndex`. */
  _getZeroIndex(oneIndex) {
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
  itemCount() {
    return this.items.length || 0
  }
  /** Return array of `oneIndex`es for each of our items. */
  getKeys() {
    return _.range(1, this.length + 1)
  }
  /**
   * Return a CLONE of our `items` as a normal `Array`.
   */
  getValues() {
    return [...this.items]
  }
  /**
   * Return the `oneIndex` for first occurance of `thing` in our list.
   */
  itemOf(thing) {
    const zeroIndex = this.items.indexOf(thing)
    if (zeroIndex === -1) return undefined
    return zeroIndex + 1
  }
  /**
   * Return item stored at `oneIndex` or `undefined`.
   */
  getItem(oneIndex) {
    return this.items[this._getZeroIndex(oneIndex)]
  }
  /**
   * Set item at `oneIndex` to `value`. Replaces whatever was there.
   */
  setItem(oneIndex, value) {
    const items = [...this.items]
    const zeroIndex = this._getZeroIndex(oneIndex)
    items[zeroIndex] = value
    this.setState("items", items)
  }
  /**
   * Add one or more `things` to our items starting at oneIndex `start`.
   * Pushes any items after `start` over to make room.
   */
  addAtPosition(start, ...things) {
    const items = [...this.items]
    const itemStart = this._getZeroIndex(start)
    items.splice(itemStart, 0, ...things)
    this.setState("items", items)
  }
  /**
   * Remove item at `oneIndex`, pulling in other objects to fill the gap.
   */
  removeItem(oneIndex) {
    const items = [...this.items]
    items.splice(this._getZeroIndex(oneIndex), 1)
    this.setState("items", items)
  }
  /**
   * Clear all `items` from our list.
   */
  clear() {
    this.setState("items", [])
  }

  /**
   * If we're asked for an iterator, use a copy of our `items`,
   * freezing the iteration to the initial state of `items`.
   */
  [Symbol.iterator]() {
    return [...this.items][Symbol.iterator]()
  }
}
spellCore.addExport("List", List)

/** Safer `drawItems()` routine, which won't barf if not called on a list.  */
spellCore.drawItems = function (list) {
  if (!list.drawItems) return null
  return list.drawItems()
}
