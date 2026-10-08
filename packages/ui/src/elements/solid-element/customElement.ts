/*!
 * @spell-app/solid-element -- MIT licence.
 * A fork of `@solidjs/element` and `component-register` (MIT, (c) Ryan Carniato).
 */

/**
 * FIX 1 -- `customElement(tag, props?, Component, options?)` and `register(tag, props?, options?)`.
 * - `@solidjs/element`'s `customElement()` took no options:  no base class (so no `static formAssociated`, no
 *   constructor of your own), no registry, no shadow root options.  Getting any of them meant calling
 *   `component-register`'s `register()` yourself, with a fake registry to capture the class before it was defined.
 * - Here the 4th argument carries them (`ElementOptions`), and the package builds AND defines the class.
 * - Re-registering a tag this package defined swaps its component (hot reload), as `component-register` did;
 *   in Vite dev its props and options too, when the platform allows (`hot.ts`).  A tag defined by someone else
 *   throws, instead of silently returning their class.
 */

import { createElementClass } from "./element"
import { redefine } from "./hot"
import { normalizeProps } from "./props"
import { isConstructor, withSolid } from "./withSolid"
import type {
  AnyPropsDefinition,
  ComponentType,
  ElementOptions,
  FunctionComponent,
  PropsOf,
  SolidElementClass
} from "./solid-element.types"

/**
 * Define `tag` rendering the Solid `Component`;  returns the element class.
 * - `props`:  a definition per prop, or a bare default (`{ count: 0 }`);  see `PropDefinition`.
 * - `options`:  base class, registry, shadow root, internals / forms, `keepAlive`, error handling.
 */
export function customElement<D extends AnyPropsDefinition = {}>(
  tag: string,
  Component: ComponentType<PropsOf<D>>
): SolidElementClass
export function customElement<D extends AnyPropsDefinition>(
  tag: string,
  props: D,
  Component: ComponentType<PropsOf<D>>,
  options?: ElementOptions
): SolidElementClass
export function customElement(
  tag: string,
  props: AnyPropsDefinition | ComponentType<any>,
  Component?: ComponentType<any> | ElementOptions,
  options?: ElementOptions
): SolidElementClass {
  if (typeof props === "function") {
    options = Component as ElementOptions | undefined
    Component = props
    props = {}
  }
  return register(tag, props, options)(withSolid(Component as ComponentType<any>))
}

/**
 * `component-register`'s HOC:  `register(tag, props, options)(Component)` defines and returns the class.
 * - `Component` gets `(values, { element })` on first connect;  wrap it with `withSolid` to render Solid.
 */
export function register(tag: string, props?: AnyPropsDefinition, options: ElementOptions = {}) {
  return (Component: ComponentType<any>): SolidElementClass => {
    if (!tag) throw new Error("tag is required to register a Component")
    const component: FunctionComponent<any> = isConstructor(Component)
      ? (values, componentOptions) => new Component(values, componentOptions)
      : (Component as FunctionComponent<any>)
    const registry = options.registry ?? options.customElements ?? customElements
    const existing = registry.get(tag) as SolidElementClass | undefined
    if (existing) {
      if (!("Component" in existing)) throw new Error(`<${tag}> is already defined by another library`)
      // dev (Vite):  props and options too, or a refusal `hotUpdate()` turns into a reload;  a build keeps
      // `component-register`'s component-only swap
      if (import.meta.hot) redefine(existing, normalizeProps(props), component, options)
      else existing.Component = component
      return existing
    }
    const Class = createElementClass(tag, normalizeProps(props), component, options)
    registry.define(tag, Class)
    return Class
  }
}

/** Right-to-left composition of mixins, as `component-register` has it:  `compose(register(tag), withSolid)`. */
export function compose(...fns: ((value: any) => any)[]): (value: any) => any {
  return (value) => fns.reduceRight((result, fn) => fn(result), value)
}
