import {
  DERIVED,
  HAS_SCHEMA,
  KEYS,
  PROP_CELLS,
  PROPS,
  STATE,
  STATE_CELLS,
  declareProp,
  extend,
  schemaOf,
  spellTypeOf,
  type Cell,
  type Derived,
  type PropInfo,
  type Schema
} from "$/util/reactive"

import { Derivative } from "./Derivative"

/**
 * Base class giving subclasses reactive `props` and `state`, on spell cells (`$/util/reactive`).
 * - A prop is a getter / setter pair over `getProp()` / `setProp()` -- what compiled spell emits, and what
 *   `@prop accessor` (`$/util/reactive`) makes for hand-written classes.  Same runtime shape either way.
 * - Reads and writes are SYNCHRONOUS:  a read right after a write sees it.  Readers -- Solid computations through
 *   the host's bridge, `observe()` -- re-run when a value they read REALLY changes:
 *   an `===` write notifies nobody.
 * - "Normal" getters are reactive if they read a prop or state.  `derive()` / `@derived` memoize one, with an
 *   equality cutoff -- only for pure, worth-it ones.
 * - Each class has a schema (`Schema.ts`):  declared prop types win, undeclared ones are observed and widened.
 * - As for all classes, non-observable SHARED properties or defaults can be defined with `@proto`.
 * - NOTE: `delete this.prop` isn't trapped -- `deleteProp()`, or set it to `undefined`.
 * - NOTE: a plain field (`foo = 1`, or a constructor prop with no setter) is NOT spell state:  not reactive, not
 *   one of `keys()`.
 *
 * Props vs state:
 * - `props` are public:  `keys()` and `toJSON()` list them, in the order they were first set.
 * - `state` is transient internal state, e.g. a `Task`'s `status`:  a getter over `this.getState("status")`, set
 *   with `this.setState("status", ...)`, cleared with `this.resetState()`.
 */
export class Observable<
  Props extends Record<string, any> = Record<string, any>,
  State extends Record<string, any> = Record<string, any>
> extends Derivative {
  /** Every subclass keeps a schema -- see `schemaOf()`. */
  static [HAS_SCHEMA] = true;

  /** Prop values, in the order first set -- see `extend.ts`. */
  [PROPS] = new Map<string, unknown>();
  /** State values, made on first use. */
  [STATE]: Map<string, unknown> | null = null;
  /** Cells of props someone read. */
  [PROP_CELLS]: Map<string, Cell> | null = null;
  /** Cells of state someone read. */
  [STATE_CELLS]: Map<string, Cell> | null = null;
  /** Cell of the props' key set. */
  [KEYS]: Cell | null = null;
  /** Memoized derived values -- see `derive()`. */
  [DERIVED]: Map<string, Derived> | null = null

  /**
   * On construction, assign `props` passed in to our instance.
   * - Through each key's setter, if it has one;  a key without one becomes a plain field.
   * - `props` here can include state keys too, since we don't distinguish them at the call site.
   * - Optional:  compiled spell's `a new deck` is `new Deck()`.
   */
  constructor(props?: Partial<Props & State>) {
    super()
    Object.assign(this, props)
  }

  ////////////////
  // ## Schema
  ////////////////

  /** This class's schema:  declared and observed prop types -- see `Schema`. */
  static get schema(): Schema {
    return schemaOf(this)
  }

  /**
   * Declare prop `name` of this class:  its type, default, legal values -- see `PropInfo`.
   * - What compiled spell emits, e.g. `static { this.declareProp('suit', { oneOf: Card.Suits }) }`.
   * - Same runtime shape as `@prop(info) accessor name` in a hand-written class.
   */
  static declareProp(name: string, info: PropInfo): void {
    declareProp(this, name, info)
  }

  ////////////////
  // ## Props
  ////////////////

  /**
   * Prop `property`, tracked -- `initializer()`'s value if it's unset (stored), else its declared default.
   * - See `extend.getProp()`.
   */
  protected getProp<T>(property: string, initializer?: () => T): T {
    return extend.getProp(this, property, initializer)
  }

  /**
   * Set prop `property` to `value` -- returns `value`.
   * - `undefined` deletes it instead;  `===` its current value does nothing.
   * - A CHANGED value is checked against the class's schema:  its declaration, else its observed type -- see
   *   `checkPropType()`.  Stored either way.
   */
  protected setProp<T>(property: string, value: T): T {
    if (extend.storeProp(this, property, value) && value !== undefined) {
      const Class = this.constructor as typeof Observable
      const info = schemaOf(Class).observe(property, value, Class.name)
      if (info) this.checkPropType(property, value, info)
    }
    return value
  }

  /** Delete prop `property`:  it leaves `keys()`.  Returns whether it was set. */
  deleteProp(property: string): boolean {
    return extend.deleteProp(this, property)
  }

  /**
   * Names of our props, in the order they were first set -- tracked:  a reader re-runs when a key comes or goes,
   * NOT when a value changes.  An overwrite keeps its place;  a delete removes it;  setting it again appends it.
   */
  keys(): string[] {
    return extend.keysOf(this)
  }

  /**
   * `value` was just set as declared prop `property`:  warn if it isn't what `info` declares.  Stored either way.
   * - Here:  a dev warning, for hand-written classes.  `Thing` / `List` override it to warn on the program's console.
   */
  protected checkPropType(property: string, value: unknown, info: PropInfo): void {
    if (import.meta.env?.PROD) return
    const oneOf = typeof info.oneOf === "function" ? info.oneOf() : info.oneOf
    if (oneOf && !oneOf.includes(value)) {
      console.warn(`${this.constructor.name}.${property}:  expected one of ${oneOf.join(", ")}, got`, value)
    } else if (info.type && !isOfType(value, info.type)) {
      console.warn(`${this.constructor.name}.${property}:  expected ${info.type}, got`, value)
    }
  }

  ////////////////
  // ## Derived
  ////////////////

  /**
   * Memoized derived value `name`:  `fn()`, re-computed only when what it read changes, its readers re-run only when
   * its value REALLY changes.  Call from a getter;  `@derived` does it for you.
   * - `fn` MUST be pure:  reads cells, writes nothing.  See `extend.derive()`.
   */
  derive<T>(name: string, fn: (this: this) => T): T {
    return extend.derive(this, name, fn)
  }

  ////////////////
  // ## State
  ////////////////

  /** State `property`, tracked -- `initializer()`'s value if unset. */
  protected getState<T>(property: string, initializer?: () => T): T {
    return extend.getState(this, property, initializer)
  }

  /**
   * Set state `property` to `value`.
   * - `undefined` deletes it instead.
   * - `property` can be a dotted path:  see `extend.setState()`.
   */
  protected setState<T>(property: string, value: T) {
    return extend.setState(this, property, value)
  }

  /**
   * Reset our `state` to its defaults.
   * - By default we clear state entirely.
   * - Pass specific string `properties` path(s) to clear just those.
   */
  protected resetState(...properties: string[]) {
    return extend.resetState(this, ...properties)
  }

  /**
   * Clean up this object when it's being "removed".
   * - MUST be called manually -- there's no automatic hook that calls this for you.
   * - TODO: finalizer???
   */
  onRemove() {}

  /** Our `props` (not `state`), in `keys()` order, when serializing to JSON. */
  toJSON() {
    return extend.getProps(this)
  }
}

/**
 * Run `fn` and return what it returns.
 * - DEPRECATED:  `easy-state` needed it to re-render once for many writes.  Cells don't:  Solid re-runs a reader on
 *   its own schedule, so ten writes re-run a reader once anyway.
 */
export function batch<T>(fn: () => T): T {
  return fn()
}

/** Is `value` of declared type `type` -- by spell's name for it, or a class it's an instance of (by name)? */
function isOfType(value: unknown, type: string): boolean {
  if (spellTypeOf(value) === type) return true
  if (typeof value !== "object" || value === null) return false
  for (let proto = Object.getPrototypeOf(value); proto; proto = Object.getPrototypeOf(proto)) {
    if (proto.constructor?.name === type) return true
  }
  return false
}
