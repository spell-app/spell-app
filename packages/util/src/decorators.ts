/**
 * Standard (TC39 2023-11) decorators:
 * - `@proto` / `@protoMerged` -- class defaults on the prototype
 * - `@lazy` / `@once` -- a getter / method whose result is made once and kept, with `forget()` to drop it
 * - `@resets` -- an `accessor` whose every write forgets what `@lazy` / `@once` members kept
 * - NOTE: lowered by esbuild via `vite.decorators.ts` -- vite 8's own transformer doesn't do it yet.
 * - Decorator MUST be first thing on its line (`@proto static x = 1` is fine),
 *   or that plugin won't notice the file.
 */

import type { AbstractClass } from "./util.types"

/**
 * Put value of a `static` field on the class's PROTOTYPE, so every instance sees it as a default:
 * `@proto static alias = "statement"` => `instance.alias === "statement"`.
 * - Why not an instance field?
 *   - Those initialize per instance AFTER `super()` returns, so a base class constructor can't see them --
 *     and a standard field decorator never gets to touch the prototype.
 *   - `static` initializers run once, at class definition, with `this` ~== the class.
 * - Inherited through prototype chain;  instances may shadow with their own value, e.g. `Object.assign(this, props)`.
 * - Non-enumerable, so it stays out of `Object.keys()` / spreads -- instances only show what's theirs.
 * - NOTE: static keeps its value too, harmless.
 * - Field name MUST be something instances already declare, e.g. `declare alias: ...` on `Rule` --
 *   so a typo like `@proto static alais` is a compile error rather than a silently-ignored static.
 * - SIDE EFFECT: then calls the class's `static protoDefined(name, value)`, if it has one,
 *   so a base class can react as each subclass is defined,
 *   e.g. `P.Rule` registering `@proto static importableAs = "quoted_property"`.
 */
export function proto<This extends AbstractClass<object>, Value>(
  _target: undefined,
  context: ClassFieldDecoratorContext<This, Value> & { name: keyof InstanceType<This> }
) {
  if (!context.static) {
    throw new TypeError(`@proto ${String(context.name)}: only works on 'static' fields.`)
  }
  return function (this: This, value: Value): Value {
    Object.defineProperty(this.prototype, context.name, { value, writable: true, configurable: true })
    ;(this as ProtoAware).protoDefined?.(context.name, value)
    return value
  }
}

/**
 * Like `@proto`, for a static OBJECT whose keys add up down the class chain:
 * `@protoMerged static elementSetup = { delegatesFocus: false }`.
 * - Puts this class's object on the PROTOTYPE, when the class is defined,
 *   and makes the parent class's object ITS prototype:
 *   a key this class doesn't state is read from the parent's, and so on up the chain.
 *   - Nothing is copied:  ONE object per class, so `Class.elementSetup === Class.prototype.elementSetup`.
 *   - In the browser's console, its own keys are what this class changed;
 *     the rest show under `[[Prototype]]`, the parent's.
 * - A key this class states replaces the parent's value for that key, whole.
 *   To add to an object or a list, spread the parent's:
 *   `styleSheets: { ...UISection.prototype.elementSetup.styleSheets, panel: panelCSS }`.
 *   - Why nested values aren't chained too:
 *     code walks over their keys (`Object.keys()`, `Object.assign()`), which would miss the parent's;
 *     and a spread lets each class choose the order.
 * - A class that doesn't state one inherits its parent's object, through the prototype chain.
 * - NOTE: read keys by name (`setup.styleSheets`, a destructure):
 *   a spread, `Object.keys()`, `Object.assign()` or `JSON.stringify()` of the whole object
 *   sees only the keys its own class stated.
 * - Field name MUST be something instances already declare, as for `@proto`.
 * - SIDE EFFECT: sets the prototype of the object the class states.
 * - SIDE EFFECT: then calls the class's `static protoDefined(name, value)`, if it has one, as `@proto` does.
 */
export function protoMerged<This extends AbstractClass<object>, Value extends object>(
  _target: undefined,
  context: ClassFieldDecoratorContext<This, Value> & { name: keyof InstanceType<This> }
) {
  if (!context.static) {
    throw new TypeError(`@protoMerged ${String(context.name)}: only works on 'static' fields;  make it 'static'.`)
  }
  return function (this: This, value: Value): Value {
    const parentPrototype = Object.getPrototypeOf(this.prototype) as Record<PropertyKey, unknown> | null
    const parentValue = parentPrototype?.[context.name] as object | undefined
    // a key this class doesn't state is looked up on the parent's object
    if (parentValue) Object.setPrototypeOf(value, parentValue)
    Object.defineProperty(this.prototype, context.name, { value, writable: true, configurable: true })
    ;(this as ProtoAware).protoDefined?.(context.name, value)
    return value
  }
}

/**
 * A getter whose value is made on first read, then kept:
 * `@lazy get supports() { return this.detect() }`.
 * - Kept per object it's read on:  each instance its own;  a `static` one, per class it's read on (`X.supports`).
 * - Replaces a backing field plus `return (this.field ??= make())`.
 * - A getter that throws keeps nothing:  the next read tries again.
 * - `undefined` IS kept.
 * - `forget(object, "name")` drops the kept value:  the next read makes it anew.
 *   Writing a member marked `@resets("name")` does it too.
 * - NOT reactive:  the value is made once, whatever it read.
 *   A reactive cached value is `@derived` (`ui`).
 * - throws a `TypeError` on anything but a getter
 */
export function lazy<This extends object, Value>(
  getter: (this: This) => Value,
  context: ClassGetterDecoratorContext<This, Value>
) {
  if (context.kind !== "getter") {
    throw new TypeError(`@lazy ${String(context.name)}: only works on getters;  make it a 'get'.`)
  }
  return function (this: This): Value {
    return remembered(this, context.name, () => getter.call(this))
  }
}

/**
 * A method that runs ONCE, then returns the same result to every later call, e.g. a loader's promise:
 * `@once static load() { return import("./Engine").then(...) }`.
 * - Takes no arguments:  one result per object would ignore them.
 * - Kept per object it's called on, as `@lazy`'s value is:
 *   each instance, or for a `static`, the class it's called on.
 *   Call it on its object (`X.load()`), never detached (`const load = X.load`).
 * - A rejected promise is kept too:  every later call gets the same rejection,
 *   until `forget(object, "name")` or a write to a `@resets("name")` member.
 *   A method that THROWS keeps nothing:  the next call runs it again.
 * - throws a `TypeError` on anything but a method
 */
export function once<This extends object, Value>(
  method: (this: This) => Value,
  context: ClassMethodDecoratorContext<This, (this: This) => Value>
) {
  if (context.kind !== "method") {
    throw new TypeError(`@once ${String(context.name)}: only works on methods.`)
  }
  return function (this: This): Value {
    return remembered(this, context.name, () => method.call(this))
  }
}

/**
 * An `accessor` whose every write forgets what the `@lazy` / `@once` members `names` kept,
 * so the next read or call makes it anew:
 * `@resets("load") static accessor url: string | undefined`, then `SiteData.url = other` fetches again.
 * - Needs `accessor`:  a plain field's decorator only sets its starting value, it never sees a later write.
 * - Every write resets, even of the same value:
 *   `X.url = X.url` starts over (tests do that after a failed fetch).
 * - Forgets on the object written to:  an instance, or for a `static`, the class it's set on.
 * - `names` are checked:  `keyof` the instance, or for a `static`, the class,
 *   so a typo is a compile error.
 */
export function resets<This extends object, Value>(...names: (keyof This)[]) {
  return function (
    target: ClassAccessorDecoratorTarget<This, Value>,
    _context: ClassAccessorDecoratorContext<This, Value>
  ): ClassAccessorDecoratorResult<This, Value> {
    return {
      set(this: This, value: Value) {
        for (const name of names) forget(this, name)
        target.set.call(this, value)
      }
    }
  }
}

/**
 * Drop what `@lazy` getter or `@once` method `name` kept for `owner`:  the next read or call makes it anew.
 * - `owner` is the object it was kept for:  an instance, or the class for a `static` one.
 * - e.g. `forget(counted, "parts")` in a test;
 *   a member whose writes should reset says `@resets("parts")`.
 * - Nothing kept:  does nothing.
 */
export function forget<Owner extends object>(owner: Owner, name: keyof Owner): void {
  REMEMBERED.get(owner)?.delete(name)
}

/** `owner`'s kept value for `name`, made by `make()` the first time. */
function remembered<Value>(owner: object, name: PropertyKey, make: () => Value): Value {
  let values = REMEMBERED.get(owner)
  if (values?.has(name)) return values.get(name) as Value
  const value = make()
  if (!values) REMEMBERED.set(owner, (values = new Map()))
  values.set(name, value)
  return value
}

/**
 * What `@lazy` / `@once` kept:  object => member name => value.
 * - A `WeakMap`, so an object's values go with it;
 *   outside the object, so a frozen object can have them too.
 */
const REMEMBERED = new WeakMap<object, Map<PropertyKey, unknown>>()

/** A class which wants to hear about each `@proto static` defined on it or a subclass -- see `proto()`. */
type ProtoAware = {
  /** Called with `this` ~== the class being defined, once its `name` field is on its prototype. */
  protoDefined?: (name: string | symbol, value: unknown) => void
}
