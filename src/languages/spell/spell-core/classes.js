//----------------------------
// Base classes for spell
//--------
import React from "react"
import ReactDOM from "react-dom"
import _ from "lodash"

import { Observable, memoize, view } from "~/util"
import { AST, spellParser } from ".."
import { spellCore } from "."

//----------------------------
// `Thing`: base for all object-like things
//--------
export class Thing extends Observable {
  constructor(props) {
    super(props)
    this.create()
  }

  // Called automatially at end of `thing` constructor.
  create() {}
}
spellCore.addExport("Thing", Thing)

/**
 * `Drawable`: component that can be used for rendering.
 * Define a draw method as `to draw (a <thing>)` which returns JSX.
 * `draw the thing` will then draw it reactively.
 */
export class Drawable extends Thing {
  /**
   * Return a React.Component which renders an instance.
   * Note that we use a class component to get around hook issues with `react-easy-state`.
   */
  @memoize
  get Component() {
    const render = () => this.draw()
    class DrawableC extends React.Component {
      render = render
    }
    return view(DrawableC)
  }
}
spellCore.addExport("Drawable", Drawable)

/** Add `draw <thing>` expression which draws a drawable as a React Component.
 * NOTE: precedence must be higher than ad-hoc `draw_$thing` rules
 *       defined when setting up JSX output with `to draw a <thing>`.
 */
spellParser.defineRule({
  name: "draw_thing",
  alias: "expression",
  syntax: "draw {expression}",
  constructor: "Statement",
  precedence: 100,
  getAST(match) {
    return new AST.CoreMethodInvocation(match, {
      methodName: "element",
      args: [
        new AST.ObjectLiteral(match, {
          properties: [
            new AST.ObjectLiteralProperty(match, {
              property: "tag",
              value: new AST.PropertyExpression(match, {
                object: match.groups.expression.AST,
                property: "Component"
              })
            })
          ]
        })
      ]
    })
  }
})

//----------------------------
// `App`: a Drawable that renders a full application.
//  Set `draw` method and start things with `start app`.
//--------
export class App extends Drawable {
  start() {
    let root = document.getElementById("app-root")
    if (!root) {
      root = document.createElement("div")
      document.id = "app-root"
      document.body.appendChild(root)
    }
    const AppComponent = this.Component
    ReactDOM.render(<AppComponent />, root)
  }
}
spellCore.addExport("App", App)

// Add `start <app>` statement.
spellParser.defineRule({
  name: "start_app",
  alias: "statement",
  syntax: "start {app:expression}",
  constructor: "Statement",
  getAST(match) {
    return new AST.ScopedMethodInvocation(match, {
      thing: match.groups.app.AST,
      methodName: "start"
    })
  }
})

//----------------------------
// `List`: our array concept (1-based)
//--------
export class List extends Observable {
  constructor(...values) {
    super()
    this._state.items = []
    if (values.length) this.add(...values)
    this.create()
  }

  // Called automatially at end of `List` constructor.
  create() {}

  @memoize
  get Component() {
    const render = () => {
      const elements = this.draw()
      console.info({ list: this, elements })
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

  /* list.draw() to return list items as react components */
  draw() {
    return this.map((item, index) => <item.Component key={index} />)
  }

  // syntactic sugar
  get length() {
    return this.itemCount()
  }

  add(...items) {
    spellCore.append(this, ...items)
  }

  // Map callback RETURNING AS AN ARRAY
  map(callback) {
    const results = []
    this.getKeys().forEach(index => {
      results[index] = callback(this.getItem(index), index, this)
    })
    return results
  }

  //----------------------------
  // Collection methods
  //----------------------------

  itemCount() {
    return this._state.items.length
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
