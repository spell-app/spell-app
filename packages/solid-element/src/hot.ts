/*!
 * @spell-app/solid-element -- MIT licence.
 * A fork of `@solidjs/element` and `component-register` (MIT, (c) Ryan Carniato).
 */

/**
 * Hot module replacement:  swap a defined element's component (and props / options) in place, then re-render
 * every live instance with it, keeping the host objects, their attributes and their property values.
 * - The platform can't redefine a tag, so the class stays;  `register()` swaps what the class READS
 *   (`Component`, `props`, `options`), and only when nothing fixed at `customElements.define()` time changed
 *   (observed attributes, `formAssociated`, base class, internals, shadow root options).
 * - Vite (`import.meta.hot`):  re-running a module that calls `customElement()` swaps (`redefine()`);
 *   `hotUpdate()` from its `import.meta.hot.accept()` re-renders the swapped classes' instances, or invalidates
 *   the module when a swap was refused.  `@spell-app/solid-element/vite` injects both.
 * - Webpack / Parcel (`module.hot`):  `hot(module, tag)`, kept from `component-register`;  without
 *   `import.meta.hot` a re-registration swaps only `Component`, as `component-register` did.
 * - Live instances are tracked per class (`WeakRef`s) only while `import.meta.hot` exists:  a production build
 *   replaces it with `undefined`, so tracking, source records and redefinition all drop out of it.  Untracked,
 *   `liveElements()` walks `document` and every open shadow root instead.
 * - NOT preserved:  component-internal state (signals created in the component).  Host attributes and
 *   properties are, since they live on the element.
 */

import { connected } from "./lifecycle"
import { initialValue } from "./props"
import { defineAccessors } from "./upgrade"
import {
  STATE,
  type ElementOptions,
  type FunctionComponent,
  type HotContext,
  type HotIncompatibility,
  type HotUpdateResult,
  type NormalizedProps,
  type SolidElement,
  type SolidElementClass
} from "./solid-element.types"

////////////////
// ## Live instances
////////////////

/** Live instances per class;  weak, so tracking never keeps an element alive.  Filled only in dev. */
const LIVE = new WeakMap<SolidElementClass, Set<WeakRef<SolidElement>>>()

/** Remember `element` as a live instance of its class;  called by the constructor while `import.meta.hot` exists. */
export function trackElement(element: SolidElement) {
  const Class = element.constructor as SolidElementClass
  let refs = LIVE.get(Class)
  if (!refs) LIVE.set(Class, (refs = new Set()))
  refs.add(new WeakRef(element))
}

/**
 * Every live instance of `Class` (or of the class defined as tag `target`).
 * - Tracked (dev):  every instance still in memory, connected or not.
 * - Untracked (a production build):  the instances in `document`, through open shadow roots.
 */
export function liveElements(target: SolidElementClass | string): SolidElement[] {
  const Class = typeof target === "string" ? (customElements.get(target) as SolidElementClass | undefined) : target
  if (!Class) return []
  const refs = LIVE.get(Class)
  const found: SolidElement[] = []
  if (!refs) {
    walk(document.documentElement, (node) => {
      if (node.constructor === Class) found.push(node as SolidElement)
    })
    return found
  }
  for (const ref of refs) {
    const element = ref.deref()
    if (element) found.push(element)
    else refs.delete(ref)
  }
  return found
}

/** Call `visit` for `root` and every element below it, through open shadow roots. */
function walk(root: Element, visit: (node: Element) => void) {
  visit(root)
  if (root.shadowRoot) for (const child of root.shadowRoot.children) walk(child, visit)
  for (const child of root.children) walk(child, visit)
}

////////////////
// ## Reload
////////////////

/**
 * Dispose `element`'s component and, if connected, render its class's CURRENT component again.
 * - Kept:  the element, its attributes, its property values (the fork's `values`), its shadow root and adopted
 *   sheets.  Lost:  state inside the component.
 * - Clears `:state(errored)`, so an element whose render failed recovers with the next good component.
 * - A detached element is only disposed:  it renders the current component on its next connect (a
 *   `keepAlive` element dropped by a parent's re-render would otherwise re-render as garbage).
 */
export function reloadElement(element: SolidElement) {
  if (!(STATE in element)) return
  element.dispose()
  element.renderRoot.textContent = ""
  element.internals?.states.delete("errored")
  if (element.isConnected) connected(element)
}

/** `reloadElement()` every live instance of `target` (a class or a tag);  returns them. */
export function reloadElements(target: SolidElementClass | string): SolidElement[] {
  const elements = liveElements(target)
  for (const element of elements) reloadElement(element)
  return elements
}

/**
 * Webpack / Parcel style, kept from `component-register`:  accept updates of `module` and reload every `<tagName>`
 * on the next task (`register()` has swapped the component by then).
 */
export function hot(module: { hot?: any }, tagName: string) {
  if (!module.hot) return
  module.hot.accept(update)
  if (module.hot.status?.() === "apply") update()

  /** Reload each `<tagName>` on the next task;  logs instead when handed an error. */
  function update(error?: unknown) {
    if (error instanceof Error) return console.error(error)
    setTimeout(() => reloadElements(tagName), 0)
  }
}

////////////////
// ## Redefinition
////////////////

/** Swaps and refusals since the last `hotUpdate()`. */
const PENDING = {
  swapped: new Set<SolidElementClass>(),
  incompatible: [] as HotIncompatibility[]
}

/**
 * `register()` for a tag this package already defined, while `import.meta.hot` exists:  swap `Class`'s
 * component, props and options in place, or record why the platform can't take the change.
 * - Props are swapped IN PLACE (`Class.props` is the object every closure of the class holds);  accessors are
 *   redefined, and each live instance's values migrated (`migrate()`).
 * - NEVER re-renders:  `hotUpdate()` does, once the whole module has re-run.
 * - Throws, changing nothing, when a new prop would shadow an element member (as a first definition would).
 */
export function redefine(
  Class: SolidElementClass,
  props: NormalizedProps,
  Component: FunctionComponent<any>,
  options: ElementOptions
) {
  const reason = definitionChange(Class, props, options)
  if (reason) {
    PENDING.incompatible.push({ tag: Class.tag, reason })
    return
  }
  const base = Object.getPrototypeOf(Class.prototype) as object
  // dry run on a stand-in with the same chain:  a shadowing prop throws BEFORE anything changed
  defineAccessors(Object.create(base) as object, props)
  const previous = { ...Class.props }
  for (const prop of previous.list) delete (Class.prototype as Record<string, unknown>)[prop.property]
  defineAccessors(Class.prototype, props)
  Object.assign(Class.props, props)
  // copied first:  a caller may hand the SAME options object again
  const next = { ...options }
  const current = Class.options as Record<string, unknown>
  for (const key of Object.keys(current)) delete current[key]
  Object.assign(current, next)
  Class.Component = Component
  for (const element of liveElements(Class)) migrate(element, previous, props)
  PENDING.swapped.add(Class)
}

/**
 * Why `Class` can't take `props` / `options`, or `undefined` if it can.
 * - All of these are read ONCE, by `customElements.define()` or the constructor of instances that already exist.
 */
export function definitionChange(
  Class: SolidElementClass,
  props: NormalizedProps,
  options: ElementOptions
): string | undefined {
  const before = Class.observedAttributes
  const after = [...props.byAttribute.keys()]
  const added = after.filter((name) => !before.includes(name))
  const removed = before.filter((name) => !after.includes(name))
  if (added.length || removed.length) {
    const diff = [...added.map((name) => `+${name}`), ...removed.map((name) => `-${name}`)].join(" ")
    return `observed attributes changed (${diff})`
  }
  const was = Class.options
  if ((options.BaseElement ?? HTMLElement) !== (was.BaseElement ?? HTMLElement)) return "base class changed"
  if (!!options.formAssociated !== !!was.formAssociated) return "formAssociated changed"
  if (!!(options.formAssociated || options.internals) !== !!(was.formAssociated || was.internals)) {
    return "internals changed"
  }
  if (shadowInit(options) !== shadowInit(was)) return "shadow root options changed"
  return undefined
}

/**
 * Finish a hot update:  re-render the live instances of every class swapped since the last call, or, if a
 * redefinition was refused, log it and `hot.invalidate()` (Vite then reloads the page).
 * - Call it from `import.meta.hot.accept()` of a module that (re)defines elements;  the Vite plugin injects that.
 */
export function hotUpdate(hot?: HotContext): HotUpdateResult {
  const incompatible = PENDING.incompatible.splice(0)
  const swapped = [...PENDING.swapped]
  PENDING.swapped.clear()
  if (incompatible.length) {
    const message = incompatible.map(({ tag, reason }) => `<${tag}>: ${reason}, full reload`).join("\n")
    console.warn(message)
    hot?.invalidate(message)
    return { reloaded: [], incompatible }
  }
  for (const Class of swapped) reloadElements(Class)
  return { reloaded: swapped.map((Class) => Class.tag), incompatible }
}

/**
 * Carry `element`'s values over to the new props.
 * - Last written as a PROPERTY:  kept as is (a framework's rich data, a controlled value).
 * - Last written by its ATTRIBUTE:  converted again with the new converter (a vocabulary that learned a value).
 * - Never written:  the new default.  Removed keys are dropped.
 */
function migrate(element: SolidElement, previous: NormalizedProps, props: NormalizedProps) {
  const state = element[STATE]
  const values: Record<string, unknown> = {}
  for (const prop of props.list) {
    const source = previous.byKey.has(prop.key) ? state.sources?.[prop.key] : undefined
    if (source === "property") values[prop.key] = state.values[prop.key]
    else if (source === "attribute") values[prop.key] = prop.fromAttribute(element.getAttribute(prop.attribute!))
    else values[prop.key] = initialValue(prop)
  }
  state.values = values
}

/** Shadow root options as comparable text;  `false` => rendered into the element. */
function shadowInit(options: ElementOptions): string {
  return JSON.stringify(options.shadowRootInit ?? { mode: "open" })
}
