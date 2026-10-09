/**
 * Standard (TC39 2023-11) decorators.
 * - NOTE: lowered by esbuild via `vite.decorators.ts` -- vite 8's own transformer doesn't do it yet.
 * - Decorator MUST be first thing on its line (`@proto static x = 1` is fine), or that plugin won't notice the file.
 */

import type { AbstractClass } from "./util.types"

/**
 * Put value of a `static` field on the class's PROTOTYPE, so every instance sees it as a default:
 * `@proto static alias = "statement"` => `instance.alias === "statement"`.
 * - Why not an instance field?  Those initialize per instance AFTER `super()` returns, so a base class
 *   constructor can't see them -- and a standard field decorator never gets to touch the prototype.
 *   `static` initializers run once, at class definition, with `this` ~== the class.
 * - Inherited through prototype chain;  instances may shadow with their own value, e.g. `Object.assign(this, props)`.
 * - Non-enumerable, so it stays out of `Object.keys()` / spreads -- instances only show what's theirs.
 * - NOTE: static keeps its value too, harmless.
 * - Field name MUST be something instances already declare, e.g. `declare alias: ...` on `Rule` --
 *   so a typo like `@proto static alais` is a compile error rather than a silently-ignored static.
 * - SIDE EFFECT: then calls the class's `static protoDefined(name, value)`, if it has one, so a base class can
 *   react as each subclass is defined, e.g. `P.Rule` registering `@proto static importableAs = "quoted_property"`.
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
 * - Puts `{ ...the parent class's value, ...this class's }` on the PROTOTYPE, once, when the class is defined:
 *   so `instance.elementSetup` (and `Class.prototype.elementSetup`) is already the merged result.
 * - Merges SHALLOWLY:  a key this class states replaces the parent's value for that key, whole.
 *   To add to an object-valued key, spread the parent's:
 *   `styleSheets: { ...UISection.prototype.elementSetup.styleSheets, panel: panelCSS }`.
 * - A class that doesn't state one inherits its parent's merged value, through the prototype chain.
 * - NOTE: the static keeps only what THIS class stated;  read the merged result from the prototype.
 * - Field name MUST be something instances already declare, as for `@proto`.
 * - SIDE EFFECT: then calls the class's `static protoDefined(name, mergedValue)`, if it has one, as `@proto` does.
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
    const merged = { ...(parentPrototype?.[context.name] as object | undefined), ...value }
    Object.defineProperty(this.prototype, context.name, { value: merged, writable: true, configurable: true })
    ;(this as ProtoAware).protoDefined?.(context.name, merged)
    return value
  }
}

/** A class which wants to hear about each `@proto static` defined on it or a subclass -- see `proto()`. */
type ProtoAware = {
  /** Called with `this` ~== the class being defined, once its `name` field is on its prototype. */
  protoDefined?: (name: string | symbol, value: unknown) => void
}
