/**
 * Spell's own standard (TC39 2023-11) decorators, for HAND-WRITTEN `Thing` / `List` / `App` subclasses.
 * - Here, not beside `@proto` in `../decorators.ts`:  `ui` re-exports that whole file, and these are spell-only.
 * - Compiled spell can't use decorators (it runs from a `blob:` URL, no transpile step), so whatever these do,
 *   compiled classes MUST get the same runtime shape without them.  See `packages/docs/solid/solid-2.md`.
 * - NOTE: lowered by esbuild via `vite.decorators.ts`;  a decorator MUST start its line.
 */

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
