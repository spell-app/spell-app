/**
 * The shared reactive decorators -- standard (TC39 2023-11) decorators over the records of `extend.ts`, on spell cells:
 * - `@prop(info) accessor x!: T` -- a reactive PROP:  public, listed by `keys()`, declared in its class's schema
 * - `@state accessor x = v` -- reactive STATE:  internal, never listed;  the initializer is its starting value
 * - `@derived get y()` -- a memoized derived value, with the equality cutoff
 * - `@state({ equals })` / `@derived({ equals })`:  an equal value is no change, e.g. a filtered list with the same items.
 * - ONE set for every reactive class:  hand-written spell (`Thing`s, `SP.*`, the editor) and, once Spell UI is on
 *   spell cells, Spell UI's components.  Same names and options as Spell UI's `Reactive.ts`, so moving one is a change
 *   of import.
 * - Generic:  no lodash, no Solid, nothing spell-specific.  `$/util/spell` adds spell's own (`@thing`).
 * - NOTE: lowered by esbuild via `vite.decorators.ts`;  a decorator MUST start its line.
 */

import * as extend from "./extend"
import { declareInMetadata, type PropInfo } from "./Schema"

////////////////
// ## `@prop`
////////////////

/**
 * `@prop(info) accessor name!: T` -- a reactive prop:  a getter / setter pair over `getProp()` / `setProp()`, with
 * `info` (type, default, `init`, legal values) declared in its class's schema.
 * - The SAME runtime shape as compiled spell's `static { this.declareProp(name, info) }` + accessor pair:  the
 *   prototype gets a getter / setter, the schema gets `info` (via the class's decorator metadata, see `schemaOf()`).
 * - NEVER give it an initializer (`accessor x = 1`):  it runs per instance, after the base constructor, so after
 *   `create()`.  Say `{ default: 1 }`, or `{ init: () => [] }` for an object made once per instance.
 * - Its schema supplies the default on an `Observable` (whose class has a schema);  elsewhere `default` / `init` are
 *   only declared.
 * - Writes go through the instance's own `setProp()` when it has one, so a `Thing`'s checks its type as a compiled
 *   setter does;  else straight to the record.
 */
export function prop(info: PropInfo = {}) {
  return function <This extends object, Value>(
    _target: ClassAccessorDecoratorTarget<This, Value>,
    context: ClassAccessorDecoratorContext<This, Value>
  ): ClassAccessorDecoratorResult<This, Value> {
    const name = String(context.name)
    // NOTE: `Schema.ts` polyfills `Symbol.metadata`, so lowered decorators always get a metadata object
    declareInMetadata(context.metadata!, name, info)
    return {
      get(this: This): Value {
        return extend.getProp<Value>(this, name) as Value
      },
      set(this: This, value: Value) {
        const setter = (this as unknown as Partial<PropSetter>).setProp
        if (setter) setter.call(this, name, value)
        else extend.setProp(this, name, value)
      },
      init(value: Value): Value {
        if (value !== undefined) {
          console.warn(`@prop ${name}:  has an initializer, which runs after create() -- use @prop({ default })`)
        }
        return value
      }
    }
  }
}

/** What `@prop` writes through when it's there:  an `Observable`'s (protected) `setProp()`. */
type PropSetter = { setProp(name: string, value: unknown): unknown }

////////////////
// ## `@state`
////////////////

/**
 * `@state accessor name = value` -- reactive state:  a getter / setter pair over `getState()` / `setState()`.
 * - Internal:  never listed by `keys()` or `toJSON()`, unlike a `@prop`.
 * - The initializer is its starting value, stored without notifying anyone (nobody can have read it yet).
 *   `undefined`:  no state.
 * - On a class whose base constructor runs `create()` (`Thing`, `List`), `create()` runs BEFORE the initializer:  state
 *   it set wins, and an initializer beside it is ignored, with a warning.
 * - `@state({ equals })`:  `equals(old, next)` true skips the write, and nobody is notified (default `===`).
 * - Replaces a getter / setter pair over `getState()` / `setState()`, e.g. `SpellFile`'s.
 */
export function state<This extends object, Value>(
  target: ClassAccessorDecoratorTarget<This, Value>,
  context: ClassAccessorDecoratorContext<This, Value>
): ClassAccessorDecoratorResult<This, Value>
export function state(options: StateOptions): typeof state
export function state<This extends object, Value>(
  targetOrOptions: ClassAccessorDecoratorTarget<This, Value> | StateOptions,
  context?: ClassAccessorDecoratorContext<This, Value>
): ClassAccessorDecoratorResult<This, Value> | typeof state {
  if (!context) {
    const { equals } = targetOrOptions as StateOptions
    return ((_target: ClassAccessorDecoratorTarget<This, Value>, inner: ClassAccessorDecoratorContext<This, Value>) =>
      stateAccessor(String(inner.name), equals)) as typeof state
  }
  return stateAccessor(String(context.name))
}

/** Options of `@state({ ... })`. */
export type StateOptions = {
  /** `equals(old, next)` true skips the write -- default `===`. */
  equals?: (old: any, next: any) => boolean
}

/** `@state`'s accessor for member `name`. */
function stateAccessor<This extends object, Value>(
  name: string,
  equals?: (old: any, next: any) => boolean
): ClassAccessorDecoratorResult<This, Value> {
  return {
    get(this: This): Value {
      return extend.getState<Value>(this, name) as Value
    },
    set(this: This, value: Value) {
      if (equals && extend.hasState(this, name) && equals(extend.peekState(this, name), value)) return
      extend.setState(this, name, value)
    },
    init(this: This, value: Value): Value {
      if (extend.hasState(this, name)) {
        if (value !== undefined) console.warn(`@state ${name}:  create() set it first, so its initializer is ignored`)
      } else if (value !== undefined) extend.setState(this, name, value)
      return value
    }
  }
}

////////////////
// ## `@derived`
////////////////

/**
 * `@derived get name()` -- memoized:  re-computed only when what it read changes, and its readers re-run only when
 * its value REALLY changes (`===`).  See `extend.derive()`.
 * - ONLY for pure, worth-it getters (loops, list aggregates):  memoizing a cheap getter is ~2x SLOWER.
 * - The getter MUST be pure:  read props / state, write nothing.
 * - `@derived({ equals })`:  `equals(old, next)` true keeps the OLD value (same identity), and its readers don't
 *   re-run, e.g. a filtered list with the same items.
 */
export function derived<This extends object, Value>(
  getter: (this: This) => Value,
  context: ClassGetterDecoratorContext<This, Value>
): (this: This) => Value
export function derived(options: DerivedOptions): typeof derived
export function derived<This extends object, Value>(
  getterOrOptions: ((this: This) => Value) | DerivedOptions,
  context?: ClassGetterDecoratorContext<This, Value>
): ((this: This) => Value) | typeof derived {
  if (!context) {
    const { equals } = getterOrOptions as DerivedOptions
    return ((getter: (this: This) => Value, inner: ClassGetterDecoratorContext<This, Value>) =>
      derivedGetter(getter, String(inner.name), equals)) as typeof derived
  }
  return derivedGetter(getterOrOptions as (this: This) => Value, String(context.name))
}

/** Options of `@derived({ ... })`. */
export type DerivedOptions = {
  /** `equals(old, next)` true keeps the old value -- default `===`. */
  equals?: (old: any, next: any) => boolean
}

/** `@derived`'s getter for member `name`. */
function derivedGetter<This extends object, Value>(
  getter: (this: This) => Value,
  name: string,
  equals?: (old: Value, next: Value) => boolean
): (this: This) => Value {
  return function (this: This): Value {
    return extend.derive(this, name, getter, equals)
  }
}
