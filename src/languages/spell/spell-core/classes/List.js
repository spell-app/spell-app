//----------------------------
// Base classes for spell
//--------
import React from "react"
import _ from "lodash"

import { Observable, memoize, view } from "~/util"
import { spellCore } from ".."

//----------------------------
// `List`: our array concept (1-based)
//--------
export class List extends Observable {
  constructor(props) {
    super(props)
    this._state.items = []
    this.create()
  }

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
    return this.map((item, index) => <item.Component key={index} />)
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
    return this.getKeys().map((index) => callback(this.getItem(index), index, this))
  }

  //----------------------------
  // Collection methods
  //----------------------------

  itemCount() {
    return this._state.items?.length || 0
  }
  getKeys() {
    return _.range(1, this.length + 1)
  }
  getValues() {
    return [...this._state.items]
  }
  itemOf(thing) {
    const zeroIndex = this._state.items.indexOf(thing)
    if (zeroIndex === -1) return undefined
    return zeroIndex + 1
  }
  _getZeroIndex(index) {
    if (index === 0) return 1 // ???
    if (index < 0) return this._state.items.length + index
    return index - 1
  }
  getItem(index) {
    return this._state.items[this._getZeroIndex(index)]
  }
  setItem(index, value) {
    const items = [...this._state.items]
    const zeroIndex = this._getZeroIndex(index)
    items[zeroIndex] = value
    this._state.items = items
  }
  addAtPosition(start, ...things) {
    const items = [...this._state.items]
    const itemStart = this._getZeroIndex(start)
    items.splice(itemStart, 0, ...things)
    this._state.items = items
  }
  removeItem(index) {
    const items = [...this._state.items]
    items.splice(this._getZeroIndex(index), 1)
    this._state.items = items
  }
  clear() {
    this._state.items = []
  }

  [Symbol.iterator]() {
    return this._state.items[Symbol.iterator]()
  }
}
spellCore.addExport("List", List)

/** Safer `drawItems()` routine --  */
spellCore.drawItems = function (list) {
  if (!list.drawItems) return null
  return list.drawItems()
}
