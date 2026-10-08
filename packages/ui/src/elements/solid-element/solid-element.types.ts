/*!
 * @spell-app/solid-element -- MIT licence.
 * A fork of `@solidjs/element` (https://github.com/solidjs/solid/tree/next/packages/element) and
 * `component-register` (https://github.com/ryansolid/component-register), both MIT, (c) Ryan Carniato.
 */

/**
 * Shared types of `@spell-app/solid-element`, plus the one constant every module reads (`STATE`).
 * - Runtime-light:  types, one symbol, no imports with side effects.
 */

import type { JSX } from "@solidjs/web"

////////////////
// ## Prop definitions
////////////////

/**
 * Constructor used as a prop `type`, as Lit spells it.
 * - `Boolean`:  present / `""` ~== true, removed ~== false;  `true` reflects as `""`, `false` removes
 * - `Number`:  `Number(text)`
 * - `String`:  the text as is
 * - `Object` / `Array`:  `JSON.parse(text)`;  the ONLY types that parse JSON
 */
export type PropType = BooleanConstructor | NumberConstructor | StringConstructor | ArrayConstructor | ObjectConstructor

/**
 * Custom attribute <=> value conversion for one prop;  either half may be left out.
 * - A bare function ~== `{ fromAttribute }`.
 */
export type PropConverter<T = unknown> =
  | ((text: string | null, definition: NormalizedProp) => T)
  | {
      /** Attribute text (`null` when removed) => value. */
      fromAttribute?(text: string | null, definition: NormalizedProp): T
      /** Value => attribute text;  `null` removes the attribute. */
      toAttribute?(value: T, definition: NormalizedProp): string | null
      /**
       * Property write => stored value, e.g. `"yes"` => `true`, a translated enum value => the canonical one.
       * - Default:  stored as is (Lit's rule).  Also runs for properties captured at upgrade.
       */
      fromProperty?(value: unknown, definition: NormalizedProp): T
    }

/**
 * One prop, as authors declare it.
 * - Every field is optional;  a bare non-object value is shorthand for `{ value }`.
 * - `parse` / `notify` are `component-register`'s names, kept for compatibility (`parse: false` ~== `type: String`).
 */
export type PropDefinition<T = unknown> = {
  /** Default value;  objects and arrays are cloned per element. */
  value?: T
  /**
   * Attribute name;  default the key in kebab case (`someProp` => `some-prop`, `a_b_c` => `a-b-c`).
   * - `false`:  property only, not observed, never reflected.
   */
  attribute?: string | false
  /**
   * Name of the element's JS property;  default the key.
   * - Set it to rename a key that would shadow an `HTMLElement` member (`hidden` => `isHidden`);  setting it to
   *   the SAME native name (`id`) opts in to shadowing deliberately.
   */
  property?: string
  /** How the attribute text converts;  default inferred from `value`, else `String`. */
  type?: PropType
  /** Custom conversion;  wins over `type`. */
  converter?: PropConverter<T>
  /** Write property changes back to the attribute (synchronously). */
  reflect?: boolean
  /** DEPRECATED:  `component-register`'s JSON switch.  `false` ~== `type: String`;  `true` parses loosely. */
  parse?: boolean
  /** DEPRECATED:  ignored, as in `component-register`. */
  notify?: boolean
}

/** Props as authors declare them:  a definition or a bare default per key. */
export type PropsDefinitionInput<T = Record<string, unknown>> = {
  [K in keyof T]: PropDefinition<T[K]> | T[K]
}

/** Loose props definition input, as the runtime sees it. */
export type AnyPropsDefinition = Record<string, unknown>

/**
 * The value type a definition entry yields, for inference in `customElement()`.
 * - a `converter` => its return type;  a `value` => its type;  else by `type` (`| undefined` but for `Boolean`,
 *   which is `false` when absent);  a bare default => its own type
 */
export type PropValue<D> = D extends { converter: PropConverter<infer T> }
  ? T
  : D extends { value: infer V }
    ? [V] extends [undefined] | [null]
      ? TypedValue<D> | V
      : V
    : D extends PropDefinition
      ? TypedValue<D>
      : D

/** Value type by `type` alone. */
export type TypedValue<D> = D extends { type: BooleanConstructor }
  ? boolean
  : D extends { type: NumberConstructor }
    ? number | undefined
    : D extends { type: ArrayConstructor }
      ? unknown[] | undefined
      : D extends { type: ObjectConstructor }
        ? Record<string, unknown> | undefined
        : D extends { type: StringConstructor }
          ? string | undefined
          : unknown

/** Component props inferred from a props definition. */
export type PropsOf<D> = { [K in keyof D]: PropValue<D[K]> }

/** One prop after `normalizeProps()`:  everything resolved, converters bound. */
export type NormalizedProp = {
  /** Key in the definition;  the name the COMPONENT reads (`props.key`). */
  key: string
  /** Element property name (`element[property]`). */
  property: string
  /** Observed attribute, or `undefined` for property-only props. */
  attribute: string | undefined
  /** Resolved type, `undefined` for the loose (`parse: true`) conversion. */
  type: PropType | undefined
  /** Default value (cloned per element when an object / array). */
  value: unknown
  /** Reflect property writes to the attribute. */
  reflect: boolean
  /** Property name set explicitly:  shadowing a native member is deliberate. */
  renamed: boolean
  /** Attribute text => value. */
  fromAttribute(text: string | null): unknown
  /** Value => attribute text, `null` to remove. */
  toAttribute(value: unknown): string | null
  /** Property write => stored value;  identity unless the converter normalizes. */
  fromProperty(value: unknown): unknown
}

/** All props of one element class, with lookups. */
export type NormalizedProps = {
  /** In declaration order. */
  list: NormalizedProp[]
  /** By definition key. */
  byKey: Map<string, NormalizedProp>
  /** By observed attribute name. */
  byAttribute: Map<string, NormalizedProp>
}

////////////////
// ## Components
////////////////

/** Where a prop change came from. */
export type ChangeSource = "attribute" | "property"

/**
 * Hears every prop write on an element.
 * - `key` is the DEFINITION key (what the component reads), not the renamed property.
 */
export type PropertyChangedCallback = (key: string, value: unknown, old: unknown, source: ChangeSource) => void

/** Second argument of a component:  the element it renders for. */
export type ComponentOptions<E = SolidElement> = {
  element: E
}

/**
 * A function component.
 * - `options.element` is typed with the props as properties;  NOTE: a prop renamed with `property` is
 *   typed under its key.
 */
export type FunctionComponent<T> = (props: T, options: ComponentOptions<SolidElement & T>) => unknown

/** A class component (`component-register` allows them);  constructed with `new`. */
export type ConstructableComponent<T> = new (props: T, options: ComponentOptions<SolidElement & T>) => unknown

/** What `register()` / `customElement()` accept. */
export type ComponentType<T> = FunctionComponent<T> | ConstructableComponent<T>

////////////////
// ## Element options
////////////////

/**
 * Fourth argument of `customElement()` / third of `register()`:  everything `@solidjs/element` couldn't say.
 * - All optional;  `{}` behaves like `@solidjs/element` except for the fixed bugs (see `UPSTREAM.md`).
 */
export type ElementOptions = {
  /** Class the element extends;  default `HTMLElement`.  Its constructor runs first. */
  BaseElement?: typeof HTMLElement
  /** Registry to define in;  default `customElements` (scoped registries work). */
  registry?: CustomElementRegistry
  /** DEPRECATED:  `component-register`'s name for `registry`. */
  customElements?: CustomElementRegistry
  /**
   * Shadow root options;  default `{ mode: "open" }`.
   * - `false`:  render into the element itself (like calling `noShadowDOM()` in every instance).
   */
  shadowRootInit?: ShadowRootInit | false
  /** `static formAssociated = true`;  implies `internals`. */
  formAssociated?: boolean
  /** Attach `ElementInternals` as `element.internals` (states, ARIA, forms). */
  internals?: boolean
  /**
   * Keep the reactive root across disconnect / reconnect;  only `element.dispose()` ends it.
   * - Default `false`:  disposed a microtask after a disconnect that wasn't followed by a reconnect.
   */
  keepAlive?: boolean
  /** Wrap the render in an `<Errored>` boundary;  default `true`. */
  errorBoundary?: boolean
  /**
   * An error escaped the component;  default logs one `console.error` naming the tag.
   * - Called outside any reactive scope, so it may write signals.
   */
  onError?: (element: SolidElement, error: unknown) => void
  /** Replacement content rendered into the render root after an error (nodes, text or JSX). */
  fallback?: (element: SolidElement, error: unknown) => JSX.Element
  /**
   * Also dispatch a cancelable `CustomEvent` of this name from the element (`detail: { error }`), e.g. `ui-error`.
   * - `preventDefault()` skips the default log and the `fallback`:  the listener took over.
   */
  errorEvent?: string
}

////////////////
// ## Element
////////////////

/** Lifecycle hooks the component registers (see `onConnect()` & co). */
export type HookName = "connect" | "disconnect" | "formAssociated" | "formDisabled" | "formReset" | "formStateRestore"

/** Per-element bookkeeping, under `element[STATE]`. */
export type ElementState = {
  /** Current prop values by definition key (already converted). */
  values: Record<string, unknown>
  /** Properties set before upgrade, re-applied on first connect. */
  upgrade?: Map<string, unknown>
  /** Attribute being reflected right now (synchronous guard). */
  reflecting?: string
  /** A component is rendered (between first render and dispose). */
  initialized: boolean
  /** Render root, once resolved. */
  renderRoot?: HTMLElement | ShadowRoot
  /** The render root is a declarative shadow root to be emptied before the first render. */
  adopted?: boolean
  /** Run on dispose, newest first. */
  releaseCallbacks: ((element: SolidElement) => void)[]
  /** Run on every prop write. */
  propertyChangedCallbacks: PropertyChangedCallback[]
  /** Hook sets, by name. */
  hooks: Partial<Record<HookName, Set<(...args: any[]) => void>>>
  /** Last arguments of the state-like hooks (`formAssociated`, `formDisabled`), replayed to late registrations. */
  last: Partial<Record<HookName, unknown[]>>
  /**
   * Where each key's value last came from;  dev only (`import.meta.hot`), read by a hot redefinition
   * (`hot.ts`) to re-convert attribute values with a new converter while keeping property writes.
   */
  sources?: Record<string, ChangeSource>
}

/**
 * Instance side of every element this package defines.
 * - A SUPERSET of `component-register`'s `ICustomElement`, so its mixins (`withSolid`) run on either.
 */
export type SolidElement = HTMLElement & {
  /** Where the component renders:  the shadow root, or the element itself. */
  readonly renderRoot: HTMLElement | ShadowRoot
  /** Platform internals, when `formAssociated` or `internals` (or the base class attached them). */
  internals?: ElementInternals
  /** Run `fn` when the component is disposed. */
  addReleaseCallback(fn: (element: SolidElement) => void): void
  /** Run `fn` on every prop write until disposed. */
  addPropertyChangedCallback(fn: PropertyChangedCallback): void
  /** Definition key for an attribute or key name. */
  lookupProp(name: string): string | undefined
  /** Dispose the component now (the only way to end a `keepAlive` element's root).  Idempotent. */
  dispose(): void
  /** Bookkeeping;  NEVER touch from outside the package. */
  [STATE]: ElementState
}

/** Static side of every element class this package defines. */
export type SolidElementClass = CustomElementConstructor & {
  /**
   * Resolved props.
   * - NOTE: a hot redefinition (`hot.ts`) updates this object IN PLACE, so closures holding it see the new props.
   */
  readonly props: NormalizedProps
  /**
   * Options it was defined with.
   * - NOTE: a hot redefinition updates this object in place too.
   */
  readonly options: ElementOptions
  /** Current component;  swapped on hot reload. */
  Component: FunctionComponent<any>
  /** Tag it was defined as. */
  readonly tag: string
  /** Attributes the platform observes;  it reads them ONCE, at `customElements.define()`. */
  readonly observedAttributes: string[]
}

////////////////
// ## Hot module replacement
////////////////

/** A redefinition the platform can't apply to a defined class (see `hot.ts`). */
export type HotIncompatibility = {
  /** Tag whose redefinition was refused. */
  tag: string
  /** What changed, e.g. `observed attributes changed (+size)`. */
  reason: string
}

/** What one `hotUpdate()` did. */
export type HotUpdateResult = {
  /** Tags whose live instances were re-rendered. */
  reloaded: string[]
  /** Refused redefinitions;  non-empty => the module was invalidated (full reload) instead. */
  incompatible: HotIncompatibility[]
}

/** The slice of Vite's `import.meta.hot` that `hotUpdate()` uses. */
export type HotContext = {
  /** Give up on this update:  Vite propagates it to the importers (a full reload when none accepts). */
  invalidate(message?: string): void
}

/** Key of `ElementState` on every element. */
export const STATE: unique symbol = Symbol("solid-element")
