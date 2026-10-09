/**
 * Base classes for spell.
 */
import { Observable, runsCreate, type PropInfo } from "$/util"
import { spellCore } from "$/core/core"
import type { Drawing } from "$/core/drawing"
import { Eventful } from "$/core/SpellEvent"
import type { PropCheck } from "$/core/spellCore.types"

/**
 * `Thing`: base for all object-like things in spell -- what `a task is a thing` extends.
 * All things can be drawn, with Solid (`drawing.ts`), e.g.:
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
  /**
   * SIDE EFFECT:  registers itself in `spellCore.things`, for the Thing Explorer.
   * - `props` optional:  `a new game` compiles to `new Game()`.
   */
  constructor(props?: Record<string, unknown>) {
    super(props)
    spellCore.things.add(this)
    if (runsCreate(Thing, new.target)) this.create()
  }

  /**
   * Called once per instance, after constructor props are assigned -- override in a subclass to set up initial state.
   * - NOTE: runs from THIS constructor, before any subclass field initializer:  a plain field set here is clobbered
   *   by its initializer.  Compiled classes have no fields, so they're safe;  a hand-written subclass with fields
   *   MUST be `@thing` (`$/util`), which runs `create()` after them instead.  Exactly once either way.
   */
  create(): void {}

  /**
   * Set reactive `property` to `value` -- see `Observable.setProp()`.
   * - Compiled property setters call this, e.g. `set title(value) { this.setProp('title', value) }`:  what it's
   *   checked against is declared in the class's schema, `static { this.declareProp('title', { type: 'text' }) }`.
   * - `check`:  how compiled spell said it BEFORE the schema, e.g. `this.setProp('title', value, { type: 'text' })` --
   *   still honoured, warning first if it fails, so programs compiled then still run.
   * - Same as `List.setProp()`.
   */
  protected setProp<T>(property: string, value: T, check?: PropCheck) {
    if (check) spellCore.checkProp(property, value, check)
    return super.setProp(property, value)
  }

  /** A declared prop was set:  warn on the PROGRAM's console if `value` isn't what `info` declares -- see `checkProp()`. */
  protected checkPropType(property: string, value: unknown, info: PropInfo): void {
    spellCore.checkProp(property, value, info)
  }

  /** Default `type` to the name of our constructor.  Instances can override via the setter. */
  get type(): string {
    return this.constructor.name
  }
  set type(type: string) {
    this.override("type", type)
  }

  /**
   * Subclasses (or a spell-compiled `to draw` method) implement this to draw themselves.
   * - `draw the card` calls it through `spellCore.drawThing()`, in the card's own error net (`drawing.ts`).
   * - throws:  a thing with no `to draw` can't be drawn.  Its net shows a stand-in.
   */
  draw(): Drawing {
    throw new Error(`${this.type} does not implement draw()`)
  }
}
