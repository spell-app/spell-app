/**
 * Spell's own standard (TC39 2023-11) decorators, for HAND-WRITTEN `Observable`s:  `Thing` / `List` / `App`
 * subclasses, `SP.*`, the editor.
 * - `@prop(info) accessor x!: T` -- a reactive prop, declared in its class's schema
 * - `@derived get y()` -- a memoized derived value, with the equality cutoff
 * - `@thing` -- runs `create()` after every field initializer
 * - Here, not beside `@proto` in `../decorators.ts`:  `ui` re-exports that whole file, and these are spell-only.
 * - Compiled spell can't use decorators (it runs from a `blob:` URL, no transpile step), so whatever these do,
 *   compiled classes MUST get the same runtime shape without them.  See `packages/docs/content/solid/solid-2.md`.
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
 * - On an `Observable` only:  its schema is what supplies the default.
 * - Writes go through the instance's own `setProp()`, so a `Thing`'s checks its type as a compiled setter does.
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
        ;(this as unknown as PropSetter).setProp(name, value)
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

/** What `@prop` writes through:  an `Observable`'s (protected) `setProp()`. */
type PropSetter = { setProp(name: string, value: unknown): unknown }

////////////////
// ## `@derived`
////////////////

/**
 * `@derived get name()` -- memoized:  re-computed only when what it read changes, and its readers re-run only when
 * its value REALLY changes (`===`).  See `Observable.derive()`.
 * - ONLY for pure, worth-it getters (loops, list aggregates):  memoizing a cheap getter is ~2x SLOWER.
 * - The getter MUST be pure:  read props / state, write nothing.
 */
export function derived<This extends object, Value>(
  getter: (this: This) => Value,
  context: ClassGetterDecoratorContext<This, Value>
): (this: This) => Value {
  const name = String(context.name)
  return function (this: This): Value {
    return extend.derive(this, name, getter)
  }
}

////////////////
// ## `@thing`
////////////////

/** Marks a class returned by `@thing`, as an OWN static:  subclasses inherit it, `Object.hasOwn()` doesn't see it. */
const THING_CLASS = Symbol("thingClass")

/**
 * `@thing`:  run `create()` once, after the MOST-derived `@thing` class's field initializers.
 * - Why:  `Thing` / `List` call `create()` from their own constructor, before any subclass field initializer runs,
 *   so a plain field set in `create()` is clobbered by its initializer:  `created = ""` wins over `create()`'s write.
 * - Wraps the class:  the wrapper's constructor runs `create()` after `super()` returns, i.e. after the decorated
 *   class's fields.  A class extending it without `@thing` (e.g. compiled spell) has no fields, so that's last.
 * - Exactly once, however `@thing` classes nest:  whoever constructs checks `runsCreate()` first.
 * - The wrapper keeps the decorated class's `name`, so `Thing.type` and error messages are unchanged.
 */
export function thing<C extends new (...args: any[]) => { create(): void }>(
  Base: C,
  _context: ClassDecoratorContext<C>
) {
  const Wrapped = class extends Base {
    constructor(...args: any[]) {
      super(...args)
      if (runsCreate(Wrapped, new.target)) this.create()
    }
  }
  Object.defineProperty(Wrapped, "name", { value: Base.name })
  Object.defineProperty(Wrapped, THING_CLASS, { value: true })
  return Wrapped
}

/**
 * Whether `ctor`'s constructor should call `create()` for an instance being built as `newTarget`.
 * - True unless a `@thing` class sits between `newTarget` (inclusive) and `ctor` (exclusive):  its wrapper
 *   constructor runs later, after more field initializers, so it calls `create()` instead.
 * - `Thing` / `List` call this with themselves:  no `@thing` in the chain => they call `create()`, as before.
 */
export function runsCreate(ctor: Function, newTarget: Function): boolean {
  for (let current = newTarget; current && current !== ctor; current = Object.getPrototypeOf(current)) {
    if (Object.hasOwn(current, THING_CLASS)) return false
  }
  return true
}
