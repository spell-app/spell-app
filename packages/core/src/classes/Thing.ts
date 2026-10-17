/**
 * Base classes for spell.
 */
import { Observable, runsCreate, typedJSON, type PropInfo } from "$/util"
import { registerThing, core } from "$/core/core"
import type { Drawing } from "$/core/drawing"
import { Eventful } from "$/core/SpellEvent"
import type { PropCheck } from "$/core/core.types"

import { ID_PROP } from "./ids"

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
 * - Every thing has an `id`, built in:  made the first time it's read, or set -- see `id`.
 */
export class Thing extends Eventful(Observable) {
  /**
   * Is a thing of this class saved in a FILE OF ITS OWN, rather than inside what holds it (decision Q42)?
   * - Compiled from `a person is saved in its own file.`, as `static savedInFile = true` in its class:
   *   sub-classes inherit it.
   * - The saver gives such a thing an entry of its own, and what holds it a reference to that.
   * - Every other thing is written whole inside what holds it, and a reference after (`saving.ts`).
   */
  static savedInFile = false

  /**
   * Is a thing of this class saved inside what holds it?  The default since decision Q42, so this only says it.
   * - Compiled from `a dated-event is saved inline.`, as `static savedInline = true`.
   * - Kept so a program compiled before then still loads.
   */
  static savedInline = false

  static {
    this.declareProp("id", ID_PROP)
  }

  /**
   * SIDE EFFECT:  registers itself in `core.things`, for the Thing Explorer -- see `registerThing()`.
   * - `props` optional:  `a new game` compiles to `new Game()`.
   */
  constructor(props?: Record<string, unknown>) {
    super(props)
    registerThing(this)
    if (runsCreate(Thing, new.target)) this.create()
  }

  /**
   * Called once per instance, after constructor props are assigned -- override in a subclass to set up initial state.
   * - Exactly once, whichever runs it.
   * - NOTE: runs from THIS constructor, before any subclass field initializer:
   *   a plain field set here is clobbered by its initializer.
   *   - Compiled classes have no fields, so they're safe.
   *   - A hand-written subclass with fields MUST be `@thing` (`$/util`), which runs `create()` after them instead.
   */
  create(): void {}

  /**
   * Set reactive `property` to `value` -- see `Observable.setProp()`.
   * - Compiled property setters call this, e.g. `set title(value) { this.setProp('title', value) }`.
   *   - What it's checked against is declared in the class's schema:
   *     `static { this.declareProp('title', { type: 'text' }) }`.
   * - `check`:  how compiled spell said it BEFORE the schema, e.g. `this.setProp('title', value, { type: 'text' })` --
   *   still honoured, warning first if it fails, so programs compiled then still run.
   * - Same as `List.setProp()`.
   */
  protected setProp<T>(property: string, value: T, check?: PropCheck) {
    if (check) core.checkProp(property, value, check)
    return super.setProp(property, value)
  }

  /** A declared prop was set:  warn on the PROGRAM's console if `value` isn't what `info` declares -- see `checkProp()`. */
  protected checkPropType(property: string, value: unknown, info: PropInfo): void {
    core.checkProp(property, value, info)
  }

  /**
   * Our id:  what we're saved and referred to by, e.g. `dated-event-k3x9q2mf` -- see `newThingId()`.
   * - Made the first time it's read, then kept:  a thing whose id is never read has none, nor has its JSON.
   * - Set it to choose one:  `new Person({ id: "owen" })`, `person.id = "owen"`.
   * - Built in:  a program never declares it.  Same as `List.id`.
   */
  get id(): string {
    return this.getProp<string>("id")
  }
  set id(id: string) {
    this.setProp("id", id)
  }

  /** Default `type` to the name of our constructor.  Instances can override via the setter. */
  get type(): string {
    return this.constructor.name
  }
  set type(type: string) {
    this.override("type", type)
  }

  /**
   * Are we of type `typeName`, or a sub-type of it?  e.g. `"card"` for a joker, if `a joker is a card`.
   * - What `core.isOfType(thing, typeName)` does.
   * - Hand-written TypeScript says `card instanceof Joker` for a class it can name (Q37).
   */
  isOfType(typeName: string): boolean {
    return core.isOfType(this, typeName)
  }

  /**
   * Our JSON:  our class's name as `"$type"`, then our props -- `{ "$type": "Card", "rank": "ace", ... }`.
   * - So it reads back as what it was:  `core.fromJSON()` (`json.ts`).
   * - `"$type"` is our CLASS's name, even if this instance overrides `type`:  the class is what's rebuilt.
   * - Tracked:  a reader re-runs when a prop comes, goes or changes, e.g. `<ui-form debug>`.
   */
  toJSON(): Record<string, unknown> {
    return typedJSON(this)
  }

  /**
   * Subclasses (or a spell-compiled `to draw` method) implement this to draw themselves.
   * - `draw the card` calls it through `core.drawThing()`, in the card's own error boundary (`drawing.ts`).
   * - throws:  a thing with no `to draw` can't be drawn.  Its boundary shows a stand-in.
   */
  draw(): Drawing {
    throw new Error(`${this.type} does not implement draw()`)
  }
}
