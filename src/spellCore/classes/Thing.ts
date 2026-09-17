//----------------------------
// Base classes for spell
//--------
import React from "react"

import { Observable, view } from "~/util"
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
  constructor(props: Record<string, unknown>) {
    super(props)
    this.create()
  }

  // Called automatially at end of `thing` constructor.
  create(): void {}

  // Default `type` to the name of our constructor.  Instances can override.
  get type(): string {
    return this.constructor.name
  }
  set type(type: string) {
    this.override("type", type)
  }

  /**
   * Subclasses (or a spell-compiled `to draw` method) implement this to render themselves.
   */
  draw(): React.ReactNode {
    throw new Error(`${this.type} does not implement draw()`)
  }

  /**
   * Return a React.Component which renders an instance.
   * Note that we use a class component to get around hook issues with `react-easy-state`.
   */
  /*@memoize*/
  get Component(): React.ComponentType {
    return this.derived("Component", () => {
      const render = () => this.draw()
      class ThingComponent extends React.Component {
        render = render
      }
      return view(ThingComponent)
    })
  }
}

spellCore.addExport("Thing", Thing)
