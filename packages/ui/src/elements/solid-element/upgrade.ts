/*!
 * @spell-app/solid-element -- MIT licence.
 * A fork of `@solidjs/element` and `component-register` (MIT, (c) Ryan Carniato).
 */

/**
 * FIX 2 -- accessors on the PROTOTYPE, and the standard upgrade step.
 * - `component-register` defined one accessor per prop on each INSTANCE at connect time, so
 *   - `"key" in el` was false until connect (PR #30:  Vue / React pick attribute vs property with `in`)
 *   - its constructor assigned `undefined` to every key, dropping properties a framework set before the element
 *     was defined (PR #39:  and a constructor that adds own properties breaks `createElement`)
 *   - a prop named `style`, `hidden`, `id` (issue #38) or `title` silently replaced the native member
 * - Here:  accessors live on the class prototype;  own properties found in the constructor are captured,
 *   deleted and re-applied through the setters on first connect;  a key that would shadow a member of the base
 *   class (or of this package's element API) throws at definition unless renamed with `property`.
 */

import { setProp } from "./attributes"
import { STATE, type NormalizedProps, type SolidElement } from "./solid-element.types"

/**
 * Define one accessor per prop on `prototype`.
 * - Throws when a prop's property name exists on `prototype` already (inherited from the base class, e.g.
 *   `hidden`, or this package's own API, e.g. `dispose`) and wasn't set explicitly with `property`.
 */
export function defineAccessors(prototype: object, props: NormalizedProps) {
  for (const prop of props.list) {
    if (!prop.renamed && (prop.property in prototype || prop.property === "internals")) {
      throw new Error(
        `prop "${prop.key}" would shadow the element's own "${prop.property}";  ` +
          `rename it with { property: "..." } (or set property: "${prop.property}" to override on purpose)`
      )
    }
    Object.defineProperty(prototype, prop.property, {
      get(this: SolidElement) {
        return this[STATE].values[prop.key]
      },
      set(this: SolidElement, value: unknown) {
        setProp(this, prop, value, "property")
      },
      enumerable: true,
      configurable: true
    })
  }
}

/**
 * Constructor step:  take own properties that shadow the prototype accessors (set before upgrade).
 * - The value is stored at once, so reads before connect see it;  the setter runs again on first connect
 *   (reflection, callbacks, and it wins over attributes replayed during the upgrade).
 */
export function captureUpgradeProperties(element: SolidElement, props: NormalizedProps) {
  const state = element[STATE]
  const self = element as unknown as Record<string, unknown>
  for (const prop of props.list) {
    if (!Object.hasOwn(element, prop.property)) continue
    const value = self[prop.property]
    delete self[prop.property]
    ;(state.upgrade ??= new Map()).set(prop.property, value)
    state.values[prop.key] = prop.fromProperty(value)
  }
}

/** First-connect step:  re-set captured properties through the real setters. */
export function restoreUpgradeProperties(element: SolidElement) {
  const state = element[STATE]
  const upgrade = state.upgrade
  if (!upgrade) return
  state.upgrade = undefined
  for (const [property, value] of upgrade) (element as unknown as Record<string, unknown>)[property] = value
}
