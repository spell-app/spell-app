/**
 * Standard (TC39 2023-11) decorators.
 * - NOTE: lowered by esbuild via `vite.decorators.ts` -- vite 8's own transformer doesn't do it yet.
 * - Decorator MUST be first thing on its line (`@proto static x = 1` is fine), or that plugin won't notice the file.
 */

/**
 * Put value of a `static` field on the class's PROTOTYPE, so every instance sees it as a default:
 * `@proto static alias = "statement"` => `instance.alias === "statement"`.
 * - Why not an instance field?  Those initialize per instance AFTER `super()` returns, so a base class
 *   constructor can't see them -- and a standard field decorator never gets to touch the prototype.
 *   `static` initializers run once, at class definition, with `this` ~== the class.
 * - Inherited through prototype chain;  instances may shadow with their own value, e.g. `Object.assign(this, props)`.
 * - Non-enumerable, so it stays out of `Object.keys()` / spreads -- instances only show what's theirs.
 * - NOTE: static keeps its value too, harmless.
 */
export function proto<This extends AbstractClass<object>, Value>(
  _target: undefined,
  context: ClassFieldDecoratorContext<This, Value>
) {
  if (!context.static) {
    throw new TypeError(`@proto ${String(context.name)}: only works on 'static' fields.`)
  }
  return function (this: This, value: Value): Value {
    Object.defineProperty(this.prototype, context.name, { value, writable: true, configurable: true })
    return value
  }
}
