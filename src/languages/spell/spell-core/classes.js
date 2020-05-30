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

//----------------------------
// `Drawable`: something that can be used for rendering... ???
//--------
export class Drawable extends Thing {
  @memoize
  get Component() {
    // return view(() => this.draw())
    // Wrap with `view` from react-easy-state to make it dynamic
    return view(() => {
      const elements = this.draw()
      console.info({ drawable: this, elements })
      return elements
    })
  }
}
spellCore.addExport("Drawable", Drawable)
// Add `draw <thing>` statement with high precedence.
spellParser.defineRule({
  name: "draw_thing",
  alias: "expression",
  syntax: "draw {expression}",
  precedence: 100,
  getAST(match) {
    return new AST.CoreMethodInvocation(match, {
      method: "element",
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
    console.warn(AppComponent)
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
      method: "start"
    })
  }
})

//----------------------------
// `List`: our array concept (1-based)
//--------
export class List extends Array {
  constructor(...values) {
    super()
    if (values.length) this.push(...values)
    this.create()
  }

  // Called automatially at end of `List` constructor.
  create() {}

  @memoize
  get Component() {
    // return view(() => this.draw())
    // Wrap with `view` from react-easy-state to make it dynamic
    // return view(() => {
    //   const elements = this.draw()
    //   console.info({ list: this, elements })
    //   return elements
    // })
    return view(() => {
      const elements = this.draw()
      console.info({ list: this, elements })
      return elements
    })
  }

  /* list.draw() to return list items as react components */
  draw() {
    return this.map((item, index) => <item.Component key={index} />)
  }
}
spellCore.addExport("List", List)
