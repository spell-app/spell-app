import {
  Show,
  createContext,
  createEffect,
  createRenderEffect,
  createMemo,
  createSignal,
  getOwner,
  untrack,
  useContext,
  type Accessor
} from "solid-js"
import { isServer, type JSX } from "@solidjs/web"
import { customElement, onConnect, onDisconnect, onFormDisabled } from "@spell-app/solid-element"

import { proto } from "$/ui/util"
import { RUNTIME_KEY, UI, type RuntimeGlobal } from "$/ui/runtime"
import type { ComponentVocabulary, Dictionary } from "$/ui/vocabulary"

import {
  ERROR_EVENT,
  type ClassInput,
  type NativeFallbackHandle,
  type NativeFallbackRoot,
  type AttributeName,
  type AttributeValues,
  type CamelCase,
  type EventName,
  type PartName,
  type SlotName,
  type StateName,
  type TextKey
} from "./elements.types"
import { Cell } from "./Cell"
import { Controlled } from "./Controlled"
import { ElementDefinition } from "./ElementDefinition"
import { PartContext } from "./PartContext"
import { UIHost } from "./UIHost"

/**
 * Base CONTROLLER of every component:  one instance per element, created by the render function the fork
 * (`@spell-app/solid-element`) calls, holding the component's signals, memos and handlers as fields and methods.
 * - Why a class around a render function:  the library's unit is a function `(props, { element }) => JSX`;
 *   a class keeps the repo's conventions (`@proto static` defaults, methods over loose helpers, one exported
 *   class per file) and gives `this.attrs` / `this.emit()` / `this.classes()` to every component.
 * - `attrs`:  the fork's props -- converted, canonical attribute values, one signal each.
 * - `classes()`:  `ClassBuilder.build()` in a memo, over `classValue()` (overridable, e.g. for controlled state).
 * - Styles:  `await UI.load()`, then the class's sheets (`@proto static styles`) are registered once and adopted
 *   into the shadow root;  content renders only then (`loaded()`), so there's no unstyled flash.
 * - Lifecycle:  `keepAlive` -- the controller lives from first connect to `host.dispose()`, across moves;
 *   `connected()` follows the host.  The constructor may create signals / memos / effects for its OWN fields;
 *   effects that call overridable methods are created in `mount()`, after every subclass field exists.
 * - Errors:  the fork's boundary catches anything thrown while constructing, rendering or updating;  `failed()`
 *   logs and dispatches `ui-error`, then the family's `Fallback` (a native `<button>`, `<select>` ...) replaces
 *   the shadow content -- see `renderFallback()`.
 * - NOTE: Solid 2 forbids signal writes inside an owned scope (component body, memo, effect compute).  Write
 *   from event handlers, promise callbacks or the fork's hooks (deferred, see `connected`).
 */
export abstract class UIElement<V extends ComponentVocabulary = ComponentVocabulary> {
  declare vocabulary: V
  declare styles: Readonly<Record<string, string>>
  declare Host: typeof UIHost
  declare isPart: boolean
  declare delegatesFocus: boolean
  declare slotAssignment: SlotAssignmentMode
  declare formAssociated: boolean
  declare Fallback: FallbackClass | undefined
  declare eager: boolean

  /** Sheets to adopt after the foundation, by registry name => CSS text, in order. */
  @proto static styles: Readonly<Record<string, string>> = {}

  /** Host base class;  `FormElement` swaps in `FormHost` (the form-control API). */
  @proto static Host = UIHost

  /** A generic content part:  transparent to other parts' owner lookups (`PartContext`).  `ContentPart` sets it. */
  @proto static isPart = false

  /** Shadow root `delegatesFocus`;  an element with nothing focusable inside (`<ui-item>`) turns it off. */
  @proto static delegatesFocus = true

  /**
   * Shadow root `slotAssignment`:  `manual` lets an element hand CHOSEN children to chosen `<slot>`s
   * (`slot.assign()`), e.g. `<ui-accordion>` wrapping each title + content pair in its own `<details>`.
   * - NOTE: a `manual` root assigns nothing by itself:  every `<slot>` it renders stays empty until assigned.
   */
  @proto static slotAssignment: SlotAssignmentMode = "named"

  /** Form-associated (the fork's `formAssociated` option):  `FormElement`, and `UIButton` for submit / reset. */
  @proto static formAssociated = false

  /**
   * Render at once, before the runtime and this class's sheets arrive (`loaded()`), instead of waiting for them.
   * - For an element whose content must not wait:  `<ui-root>`'s slot (the page) shows the moment the root is
   *   defined.  Its render must look right unstyled (inline styles only) until `loaded()`.
   */
  @proto static eager = false

  /** Native fallback shown when this element fails (`$/ui/components/ui-<name>/ui-<name>.fallback.ts`);  none => a `<slot>`. */
  @proto static Fallback: FallbackClass | undefined = undefined

  /**
   * Wrap each element's render in the fork's error boundary (`errorBoundary`), so one element's error disables
   * THAT element instead of halting reactivity for the page.  Read at `define()`;  a switch only so `docs/report.md`
   * can measure the cost.
   */
  static isolateErrors = true

  /**
   * A value the host APP may provide around any `ui-*` element (`<AppContext value={...}>`);  read by every
   * controller as `app`.
   * - Proves owner adoption across the custom-element boundary (the Solid host page's identity probe,
   *   `tools/frameworks/solid/identity.js`).
   * - `null` default:  Solid 2's `useContext` throws on a context with neither a default nor a provider.
   */
  static readonly AppContext = createContext<unknown>(null)

  /** Definition per registered tag, canonical and translated. */
  static readonly definitions = new Map<string, ElementDefinition>()

  /** The element. */
  readonly host: UIHost

  /** Names and converters for this tag. */
  readonly definition: ElementDefinition

  /** Converted canonical attribute values (the fork's props);  reading one tracks it. */
  readonly attrs: AttributeValues<V>

  /** What the app provides as `UIElement.AppContext` above this element, else `null`. */
  readonly app: unknown

  /** Fomantic class string of the component's root. */
  readonly classes: Accessor<string>

  /** Runtime loaded and sheets adopted. */
  readonly loaded: Accessor<boolean>

  /**
   * In the document?  Tracked;  follows connects / disconnects one microtask late.
   * - Deferred:  the fork's hooks run inside `connectedCallback`, which may run inside a Solid render (an app
   *   inserting the element), where a signal write would throw.
   */
  readonly connected: Cell<boolean>

  /** Disabled by an ancestor `<fieldset disabled>` (form-associated elements only, the fork's hook);  tracked. */
  readonly formDisabled = new Cell(false)

  /** Sets `loaded`. */
  private readonly setLoaded: (value: boolean) => void

  constructor(host: UIHost, definition: ElementDefinition, attrs: AttributeValues<V>) {
    this.host = host
    this.definition = definition
    this.attrs = attrs
    host.controller = this
    this.app = useContext(UIElement.AppContext)
    this.connected = new Cell(isServer || host.isConnected)
    const classInput = this.classInput()
    // `lazy`:  memos compute EAGERLY in Solid 2, and this one calls overridable methods that read subclass
    // fields, which don't exist yet while this constructor runs
    this.classes = createMemo(() => definition.builder.build(classInput, { extra: this.extraClasses() }), {
      lazy: true
    })
    // on the server (the SSR probe) there are no sheets to adopt:  render at once
    const loaded = isServer || (RUNTIME_KEY in globalThis && !!(globalThis as RuntimeGlobal)[RUNTIME_KEY])
    const [isLoaded, setLoaded] = createSignal(loaded)
    this.loaded = isLoaded
    this.setLoaded = setLoaded
    if (isServer) return
    const root = host.renderRoot
    const onSlotChange = (event: Event) => PartContext.slotChanged(event.target as HTMLSlotElement)
    root.addEventListener("slotchange", onSlotChange)
    host.addReleaseCallback(() => root.removeEventListener("slotchange", onSlotChange))
    const sync = () => queueMicrotask(() => this.connected.set(host.isConnected))
    onConnect(sync)
    onDisconnect(sync)
    // the fork replays the last state to a late registration -- i.e. right here, inside the component body,
    // where Solid 2 forbids the write:  defer it then;  platform calls (no owner) write at once
    if (this.formAssociated) {
      onFormDisabled((disabled) => {
        if (getOwner()) queueMicrotask(() => this.formDisabled.set(disabled))
        else this.formDisabled.set(disabled)
      })
    }
    if (!loaded) void UI.load().then(() => this.onLoaded())
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** The component's shadow content;  runs once, after styles are adopted. */
  abstract render(): JSX.Element

  /**
   * Create the effects that call overridable methods, then return the content.  Called by the render function.
   * - Host states follow `hostStates()`;  `ready` resolves once content has rendered with styles.
   */
  mount(): JSX.Element {
    // adopted HERE when the runtime was already loaded:  `sheetNames()` is overridable and may read subclass
    // fields, which don't exist yet while the base constructor runs
    if (!isServer && untrack(this.loaded)) this.adoptStyles()
    // a RENDER effect:  a throw in `hostStates()` (a subclass's, in the compute) must reach the fork's error
    // boundary, for `:state(errored)` and the fallback -- a plain effect's error is only logged
    createRenderEffect(
      () => this.hostStates(),
      (states) => {
        for (const [name, on] of Object.entries(states)) this.host.setState(name, !!on)
      }
    )
    createEffect(
      () => this.loaded(),
      (loaded) => {
        if (loaded) queueMicrotask(() => this.host.markReady())
      }
    )
    // the APPLY uses the computed names:  calling `sheetNames()` there again would read its signals untracked
    createEffect(
      () => this.sheetNames().join(SHEET_SEPARATOR),
      (names) => {
        if (untrack(this.loaded)) UI.styles.adoptInto(this.host.renderRoot, names ? names.split(SHEET_SEPARATOR) : [])
      },
      { defer: true }
    )
    return <Show when={this.eager || this.loaded()}>{this.render()}</Show>
  }

  /**
   * Registry names of the sheets to adopt now, in order;  default every `styles` entry.
   * - Tracked:  an element whose sheets depend on context (a label owned by a statistic adds `ui-parts.css`)
   *   overrides it, and the root re-adopts when it changes.
   */
  protected sheetNames(): string[] {
    return Object.keys(this.styles)
  }

  /** Extra classes after the noun, e.g. `icon` for an icon-only button. */
  protected extraClasses(): string | undefined {
    return undefined
  }

  /** Value `ClassBuilder` sees for canonical attribute `name`;  default the converted attribute. */
  protected classValue(name: AttributeName<V>): unknown {
    return this.attrs[this.definition.attribute(name).key as keyof AttributeValues<V>]
  }

  /**
   * Classes for a SECOND root from chosen attribute values, e.g. the wrapper of a labeled button.
   * - Keys are canonical attribute names, type-checked against the vocabulary.
   */
  protected buildClasses(values: Partial<Record<AttributeName<V>, unknown>>, extra?: string): string {
    return this.definition.builder.build(values, { extra })
  }

  /** Custom states to set on the host;  default none. */
  protected hostStates(): Partial<Record<StateName<V>, boolean>> {
    return {}
  }

  /**
   * An effect that writes to the HOST (`internals.role`, ARIA, states):  `createEffect(compute, apply)`, except on
   * a server, where it applies once, now.
   * - Why:  the server build runs an effect's compute only, never its apply, so host ARIA a static render must
   *   write out (`$/ui/server`) would never be set.
   * - MUST be called from a constructor or field initializer, like `createEffect`.
   */
  protected hostEffect<T>(compute: () => T, apply: (value: T) => void) {
    if (isServer) apply(untrack(compute))
    else createEffect(compute, apply)
  }

  /** True when the element can't be used;  the host swallows clicks then. */
  isDisabled(): boolean {
    return false
  }

  /**
   * Auto-controlled state for attribute `name` (see `Controlled`):  the host's property when set, else internal.
   * - MUST be called from a field initializer or constructor (it creates a signal).
   */
  protected controlled<N extends AttributeName<V>>(
    name: N,
    initial: AttributeValues<V>[CamelCase<N> & keyof AttributeValues<V>]
  ): Controlled<AttributeValues<V>[CamelCase<N> & keyof AttributeValues<V>]> {
    const { key, property } = this.definition.attribute(name)
    type Value = AttributeValues<V>[CamelCase<N> & keyof AttributeValues<V>]
    return new Controlled<Value>({
      host: this.host,
      key,
      property,
      value: () => this.attrs[key as keyof AttributeValues<V>] as Value | undefined,
      initial
    })
  }

  /** `ClassBuilder` input:  getters over `classValue()`, so the classes memo tracks exactly what it reads. */
  private classInput(): ClassInput {
    const input: Record<string, unknown> = {}
    for (const { spec } of this.definition.attributes) {
      Object.defineProperty(input, spec.name, {
        get: () => this.classValue(spec.name as AttributeName<V>),
        enumerable: true
      })
    }
    return input
  }

  ////////////////
  // ## Names
  ////////////////

  /** `part` attribute for canonical part `name`. */
  part(name: PartName<V>): string {
    return this.definition.part(name)
  }

  /** Localized slot name for canonical `name`. */
  slot(name: SlotName<V>): string {
    return this.definition.slot(name)
  }

  /**
   * Text for `key` in the current locale, via `UI.i18n`, scoped to this component's canonical tag.
   * - Another family's text under the same key never leaks in (see `registerTexts()`).
   */
  text(key: TextKey<V>, params?: Record<string, string | number>): string {
    return UI.i18n.t(key, params, this.vocabulary.tag)
  }

  ////////////////
  // ## Events
  ////////////////

  /**
   * Dispatch vocabulary event `name` from the host:  `bubbles`, `composed`, `cancelable` as the vocabulary says.
   * - Returns false when a cancelable event was vetoed (`preventDefault()`).
   */
  emit(name: EventName<V>, detail: object): boolean {
    const spec = this.definition.vocabulary.events.find((event) => event.name === name)
    const event = new CustomEvent(this.definition.event(name), {
      bubbles: true,
      composed: true,
      cancelable: !!spec?.cancelable,
      detail
    })
    return this.host.dispatchEvent(event)
  }

  ////////////////
  // ## Styles
  ////////////////

  /** Runtime arrived:  adopt, show content. */
  private onLoaded() {
    this.adoptStyles()
    this.setLoaded(true)
  }

  /** Register this class's sheets once, then adopt foundation + sheets into the shadow root. */
  private adoptStyles() {
    if (!SHEETS.has(this.styles)) {
      SHEETS.add(this.styles)
      for (const [name, css] of Object.entries(this.styles)) if (!UI.styles.has(name)) UI.styles.register(name, css)
    }
    UI.styles.adoptInto(
      this.host.renderRoot,
      untrack(() => this.sheetNames())
    )
  }

  ////////////////
  // ## Definition
  ////////////////

  /**
   * Everything this component's markup can say, for introspection at runtime:  its whole vocabulary -- tag,
   * attributes (kinds, allowed values, defaults), events, slots, parts, states, text strings, descriptions, `topics`
   * and `aka`.  Live data:  the same object the element reads (`UIButton.describe().topics`).
   * - Every tag's summary at once:  `ComponentDefinitions` (`src/components/component-definitions.ts`).
   */
  static describe<T extends { prototype: { vocabulary: ComponentVocabulary } }>(this: T): T["prototype"]["vocabulary"] {
    return this.prototype.vocabulary
  }

  /**
   * Define this component under its vocabulary's tag, or under a translated alias:
   * `UIButton.define("ie-boton", es)` registers `<ie-boton primario color="rojo">` with localized
   * attribute / property / event names mapping onto the same controller.
   * - Everything platform-shaped is a fork option:  base class, `delegatesFocus`, internals, form association,
   *   `keepAlive`, the error boundary and its `onError` / `fallback`.
   * - Idempotent per tag;  returns the element class.
   */
  static define(this: UIElementClass, tag?: string, dictionary?: Dictionary): CustomElementConstructor {
    const definition = new ElementDefinition(this.prototype.vocabulary, { tag, dictionary })
    return customElements.get(definition.tag) ?? UIElement.defineTag.call(this, definition)
  }

  /**
   * `define()` minus the idempotence check:  record `definition`, then hand the fork its tag, props, component
   * and options.
   * - For a tag already defined, the fork swaps the component in place (Vite dev only:  hot module replacement
   *   re-defines a new version of a class through here, see `HotDefinitions`).
   */
  static defineTag(this: UIElementClass, definition: ElementDefinition): CustomElementConstructor {
    const { Host, delegatesFocus, slotAssignment, formAssociated, Fallback } = this.prototype
    UIElement.register.call(this, definition)
    return customElement(
      definition.tag,
      definition.props,
      (attrs, { element }) => new this(element as unknown as UIHost, definition, attrs).mount(),
      {
        BaseElement: Host,
        shadowRootInit: { mode: "open", delegatesFocus, slotAssignment },
        internals: true,
        formAssociated,
        keepAlive: true,
        errorBoundary: UIElement.isolateErrors,
        onError: (element, error) => UIElement.failed(element as unknown as UIHost, error),
        fallback: (element, error) => UIElement.renderFallback(element as unknown as UIHost, error, Fallback)
      }
    )
  }

  /**
   * Record `definition` page-wide WITHOUT defining an element:  `definitions`, the part registry
   * (`PartContext.define()`), its English texts.
   * - `defineTag()` starts with it;  the server render (`$/ui/server`) calls it alone:  node has no
   *   `customElements`.
   */
  static register(this: UIElementClass, definition: ElementDefinition) {
    const { vocabulary, isPart } = this.prototype
    UIElement.definitions.set(definition.tag, definition)
    PartContext.define(vocabulary, definition.tag, isPart, "ownsPart" in this.prototype)
    UIElement.registerTexts(vocabulary)
  }

  ////////////////
  // ## Errors
  ////////////////

  /**
   * The fork's `onError`:  an error escaped this element's render, construction or an effect.
   * - SIDE EFFECT:  one `console.error` naming the tag;  a cancelable, composed `ui-error` (`{ error }`) -- an
   *   app cancelling it keeps the fallback out;  resolves `host.ready`;  drops the (broken) controller.
   * - Runs outside any owner (the fork's rule), so it may write signals.
   */
  private static failed(host: UIHost, error: unknown) {
    console.error(`<${host.localName}> failed:`, error)
    host.controller = undefined
    host.markReady()
    const event = new CustomEvent(ERROR_EVENT, { bubbles: true, composed: true, cancelable: true, detail: { error } })
    if (!host.dispatchEvent(event)) CANCELLED.add(host)
  }

  /**
   * The fork's `fallback`:  `Fallback.render(host, renderRoot, error, internals)` -- plain DOM, library-neutral
   * markup -- or a bare `<slot>` for an element without one (a group keeps its children visible).
   * - Built a microtask LATER, into the render root directly:  the boundary's own insert would otherwise clear
   *   the root after us, and a fallback like the dropdown's must be attached to set its validity anchor.
   * - Skipped when an app cancelled `ui-error`;  its handle is disposed with the element.
   */
  private static renderFallback(host: UIHost, error: unknown, Fallback: FallbackClass | undefined): undefined {
    if (CANCELLED.has(host)) return undefined
    queueMicrotask(() => {
      const root = host.renderRoot
      const handle = Fallback
        ? Fallback.render(host, root, error, host.internals)
        : (root.replaceChildren(host.ownerDocument.createElement("slot")), undefined)
      if (handle) host.addReleaseCallback(() => handle.dispose())
    })
    return undefined
  }

  /**
   * Register `vocabulary` with `UI.vocabulary` and its English texts with `UI.i18n` when the class is DEFINED,
   * not on first connect, so `UI.i18n.t()` and translations see them before any instance exists.
   * - Texts are English DEFAULTS scoped to the canonical tag (`I18n.registerDefaults()`):  any registered string
   *   (an app's English, a translation) beats them, and two families may share a key (`label`) with different
   *   text.  Code outside the element (`UI.i18n.t("notifications")`, unscoped) gets the FIRST family's.
   * - Loads the runtime if it isn't yet;  idempotent per vocabulary.
   * - Server:  never loads one (the real runtime needs `CSSStyleSheet`);  registers only into the one the server
   *   render installed first (`ServerRuntime`).
   */
  private static registerTexts(vocabulary: ComponentVocabulary) {
    if (TEXTS.has(vocabulary)) return
    const loaded = !!(globalThis as RuntimeGlobal)[RUNTIME_KEY]
    if (isServer && !loaded) return
    TEXTS.add(vocabulary)
    if (loaded) register()
    else void UI.load().then(register)

    /** Hand the vocabulary and its English texts to the runtime. */
    function register() {
      UI.vocabulary.register(vocabulary)
      const texts: Record<string, string> = {}
      for (const { key, text } of vocabulary.texts) texts[key] = text
      UI.i18n.registerDefaults(texts, vocabulary.tag)
    }
  }
}

/** A concrete `UIElement` subclass, as `define()` sees it. */
export type UIElementClass = {
  new (host: UIHost, definition: ElementDefinition, attrs: any): UIElement<any>
  prototype: UIElement<any>
}

/** A per-family native fallback class (`ButtonFallback` ...), as `NativeFallback.render()` is called. */
export type FallbackClass = {
  render(
    host: HTMLElement,
    root: NativeFallbackRoot,
    error?: unknown,
    internals?: ElementInternals
  ): NativeFallbackHandle
}

/** Joins sheet registry names into one comparable value (names never contain it). */
const SHEET_SEPARATOR = " "

/** `styles` maps whose sheets are registered with the runtime. */
const SHEETS = new WeakSet<object>()

/** Vocabularies whose texts are registered (or queued) with the runtime. */
const TEXTS = new WeakSet<ComponentVocabulary>()

/** Hosts whose `ui-error` an app cancelled:  no fallback. */
const CANCELLED = new WeakSet<UIHost>()
