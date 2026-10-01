/**
 * Base classes for spell.
 */
import React from "react"

import { Observable, view } from "#spell-util"
import { spellCore } from "~/spellCore/core"
import { Eventful } from "~/spellCore/SpellEvent"
import type { PropCheck } from "~/spellCore/spellCore.types"

/**
 * `Thing`: base for all object-like things in spell -- what `a task is a thing` extends.
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
 * - `Eventful(Observable)` gives every `Thing` `on`/`off`/`once`/`trigger` for spell's event
 *   syntax, on top of `Observable`'s reactive `props`/`state` -- see `SpellEvent.ts`.
 */
export class Thing extends Eventful(Observable) {
  /** SIDE EFFECT:  registers itself in `spellCore.things`, for the Thing Explorer. */
  constructor(props: Record<string, unknown>) {
    super(props)
    spellCore.things.add(this)
    this.create()
  }

  /** Called automatically at end of `thing` constructor -- override in a subclass to set up initial state. */
  create(): void {}

  /**
   * Set reactive `property` to `value`, warning first if it fails `check` -- it's stored either way.
   * - Compiled property setters call this, e.g. `set title(value) { this.setProp('title', value, { type: 'text' }) }`
   * - Same as `List.setProp()`.
   */
  protected setProp<T>(property: string, value: T, check?: PropCheck) {
    if (check) spellCore.checkProp(property, value, check)
    return super.setProp(property, value)
  }

  /** Default `type` to the name of our constructor.  Instances can override via the setter. */
  get type(): string {
    return this.constructor.name
  }
  set type(type: string) {
    this.override("type", type)
  }

  /**
   * Subclasses (or a spell-compiled `to draw` method) implement this to render themselves.
   * - Compiles from `draw the card` -- see `draw.ts` (`spellCore.drawThing()` calls this via `.Component`).
   */
  draw(): ReactNode {
    throw new Error(`${this.type} does not implement draw()`)
  }

  /**
   * Return a React.Component which renders an instance, memoized so the same component identity
   * is reused across renders (a fresh class each render would remount instead of updating).
   * - NOTE: uses a class component, not a function component, to sidestep hook issues with
   *   `react-easy-state`'s `view()` wrapper.
   */
  /*@memoize*/
  get Component(): ReactComponentType {
    return this.derived("Component", () => {
      const render = () => this.draw()
      class ThingComponent extends React.Component {
        render = render
      }
      return view(ThingComponent)
    })
  }
}
