/*!
 * @spell-app/solid-element -- MIT licence.
 * A fork of `@solidjs/element` and `component-register` (MIT, (c) Ryan Carniato).
 */

/**
 * FIX 4 -- attribute <=> property traffic.
 * - Removals always apply.  `component-register` returned early on `newVal == null && !this[name]`, so removing
 *   a bare boolean attribute (raw value `""`, falsy) never reached the component (issue #20's cousin).
 * - Change callbacks get `(key, value, old, source)`, `source` = `"attribute" | "property"`, so a component can
 *   tell an author's attribute from a framework's property write without its own flags.
 * - Reflection is SYNCHRONOUS, guarded while `setAttribute()` runs (custom-element reactions fire before it
 *   returns).  `component-register` held its guard for a microtask, which swallowed an author's own
 *   `setAttribute()` of the same attribute in the same tick.
 * - Attribute writes don't reflect back:  `primary="yes"` is never rewritten to `primary=""`.
 * - Defaults never reflect:  only a property write does (writing the default value back included), and removing
 *   the attribute restores the default without reflecting.  `component-register` reflected defaults on connect,
 *   so a bare `<x-icon>` grew `variant="solid"` and the component then saw an explicit author choice.
 */

import { STATE, type ChangeSource, type NormalizedProp, type SolidElement } from "./solid-element.types"

/**
 * Store `value` for `prop` (a property write normalized by `fromProperty` first), reflect it when it came from
 * a property, then notify.
 * - Callbacks fire on every write, equal or not:  re-setting the same value is still a decision.
 */
export function setProp(element: SolidElement, prop: NormalizedProp, value: unknown, source: ChangeSource) {
  const state = element[STATE]
  const old = state.values[prop.key]
  if (source === "property") value = prop.fromProperty(value)
  state.values[prop.key] = value
  // dev only:  a hot redefinition re-converts attribute values, keeps property writes (`hot.ts`)
  if (import.meta.hot) (state.sources ??= {})[prop.key] = source
  if (source === "property" && prop.reflect) reflect(element, prop, value)
  for (const callback of state.propertyChangedCallbacks.slice()) callback(prop.key, value, old, source)
}

/**
 * Write `value` to `prop`'s attribute;  no-op when the text is already there.
 * - SIDE EFFECT:  `attributeChangedCallback` runs synchronously inside and is ignored via `state.reflecting`.
 */
export function reflect(element: SolidElement, prop: NormalizedProp, value: unknown) {
  const name = prop.attribute!
  const text = prop.toAttribute(value)
  if (element.getAttribute(name) === text) return
  const state = element[STATE]
  const outer = state.reflecting
  state.reflecting = name
  try {
    if (text === null) element.removeAttribute(name)
    else element.setAttribute(name, text)
  } finally {
    state.reflecting = outer
  }
}

/**
 * `attributeChangedCallback` body:  convert and store, removals included.
 * - Runs before the first connect too (the platform replays present attributes at upgrade), so values are
 *   right before anything renders -- except for props captured by the upgrade step (`upgrade.ts`).
 */
export function attributeChanged(element: SolidElement, prop: NormalizedProp | undefined, text: string | null) {
  const state = element[STATE]
  if (!prop || state.reflecting === prop.attribute) return
  // a property set before upgrade wins over the attributes replayed during it (re-applied on first connect)
  if (state.upgrade?.has(prop.property)) return
  setProp(element, prop, prop.fromAttribute(text), "attribute")
}
