//----------------------------
// Base classes for spell
//--------
import React from "react"

import { Observable, memoize, view } from "~/util"
import { spellCore, Eventful } from ".."

/**
 * `Thing`: base for all object-like things in spell.
 * All things can be drawn as React components, e.g.:
 *  ```spell
 *    a task is a thing
 *    a task has a name as text
 *    to draw (a task)
 *      return <div>{its name}</div>
 *    ...
 *    it = a new task with name = "Test Drawing"
 *    draw it
 *  ```
 */
export class Thing extends Eventful(Observable) {
  constructor(props) {
    super(props)
    this.create()
  }

  // Called automatially at end of `thing` constructor.
  create() {}

  // Default `type` to the name of our constructor.  Instances can override.
  // TESTME
  get type() {
    return "type" in this._props ? this._props.type : this.constructor.name
  }
  set type(type) {
    this._props.type = type
  }

  /**
   * Return a React.Component which renders an instance.
   * Note that we use a class component to get around hook issues with `react-easy-state`.
   */
  @memoize
  get Component() {
    const render = () => this.draw()
    class ThingComponent extends React.Component {
      render = render
    }
    return view(ThingComponent)
  }
}

/** Safer `drawThing()` routine --  */
spellCore.drawThing = function (drawable /*, props, children */) {
  if (!drawable?.Component) return null
  return spellCore.element({ tag: drawable.Component })
}

spellCore.addExport("Thing", Thing)
