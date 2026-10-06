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

// Import directly to avoid circular import
import { proto } from "$/ui/util"
import { E, UI } from "$/ui/core"
// Import directly to avoid circular import
import { UIHost } from "./UIHost"

/****************
 * ### `UIElement`
 * Base CONTROLLER of every component:  one instance per element, created by the render function the fork
 * (`@spell-app/solid-element`) calls, holding the component's signals, memos and handlers as fields and methods.
 * - Why a class around a render function:  the library's unit is a function `(props, { element }) => JSX`;
 *   a class keeps the repo's conventions (`@proto static` defaults, methods over loose helpers, one exported
 *   class per file) and gives `this.attrs` / `this.emit()` / `this.classes()` to every component.
 * - `attrs`:  the fork's props -- converted, canonical attribute values, one signal each.
 * - `classes()`:  `ClassBuilder.build()` in a memo, over `classValue()` (overridable, e.g. for controlled state).
 * - Styles:  `await UI.load()`, then the class's sheets (`@proto static styles`) are registered once and adopted
 *   into the shadow root;  content renders only then (`isLoaded()`), so there's no unstyled flash.
 * - Lifecycle:  `keepAlive` -- the controller lives from first connect to `host.dispose()`, across moves;
 *   `isConnected` follows the host.  The constructor may create signals / memos / effects for its OWN fields;
 *   effects that call overridable methods are created in `mount()`, after every subclass field exists.
 * - Errors:  the fork's boundary catches anything thrown while constructing, rendering or updating;  `failed()`
 *   logs and dispatches `ui-error`, then the family's `Fallback` (a native `<button>`, `<select>` ...) replaces
 *   the shadow content -- see `renderFallback()`.
 * - NOTE: Solid 2 forbids signal writes inside an owned scope (component body, memo, effect compute).  Write
 *   from event handlers, promise callbacks or the fork's hooks (deferred, see `isConnected`).
 * - Documents ONCE what subclasses fill in, so their plain overrides need no docstring (`AGENTS.md` "Comments &
 *   docs"):
 *   - the class config, set with `@proto static` ("Class config" below):  `vocabulary`, `styles`, `Fallback`,
 *     `Host`, `isPart`, `delegatesFocus`, `slotAssignment`, `formAssociated`, `canRenderUnstyled`
 *   - the hooks ("Hooks" below):  `render()`, `hostStates()`, `classValue()`, `extraClasses()`, `sheetNames()`,
 *     `isDisabled()`;  a conditional owner adds `isOwnerOf()` (`ConditionalOwner`)
 * - Import graph:  the top of the element core -- it uses `UIHost`, `E.PartContext`, `E.ElementDefinition`, `E.Cell`,
 *   `E.Controlled`, the runtime's eager loader (`UI`) and the fork;  NEVER a component family, and never
 *   `FormElement` / `FormHost` (they extend it, through `$/ui/core`).  `UIHost` and `proto` come directly:  the class
 *   definition reads them (`@proto static Host = UIHost`).
 ****************/
export abstract class UIElement<V extends E.ComponentVocabulary = E.ComponentVocabulary> {
  /**
   * Wrap each element's render in the fork's error boundary (`errorBoundary`), so one element's error disables
   * THAT element instead of halting reactivity for the page.
   * - A measurement switch, set by hand:  `docs/report.md` measures the boundary's cost, `test/isolation.test.tsx`
   *   what a page gets without it.  Read at `define()`.
   */
  static ISOLATE_ERRORS = true

  ////////////////
  // ## Class config
  ////////////////

  // Each is `@proto static` (defaults below the `declare`s):  ONE value per element CLASS, on its prototype, so
  // `define()` / `register()` read a subclass's before any instance exists, and instances carry no copies.

  /**
   * EVERY name the tag uses:  tag, attributes, events, slots, parts, states, texts (`<tag>.vocabulary.en.ts`).
   * - No default:  each element class sets its own (`@proto static vocabulary = buttonVocabulary`).
   * - Static:  `define()`, `register()` and `describe()` read it off the class;  one object per tag, shared with
   *   `UI.vocabulary`.
   */
  declare vocabulary: V

  /**
   * Sheets to adopt after the foundation, by registry name => CSS text, in order.
   * - Static:  registered with `UI.styles` ONCE per class (`adoptStyles()`);  every instance adopts the same sheets.
   */
  declare styles: Readonly<Record<string, string>>

  /**
   * Native fallback shown when this element fails (`$/ui/components/ui-<name>/ui-<name>.fallback.ts`);  none => a
   * `<slot>`.
   * - Static:  `defineTag()` hands it to the fork's `fallback` option;  it runs when the controller is gone.
   */
  declare Fallback: FallbackClass | undefined

  /**
   * Host base class;  `FormElement` swaps in `FormHost` (the form-control API).
   * - Static:  the fork extends it ONCE, at `define()` (`BaseElement`).
   */
  declare Host: typeof UIHost

  /**
   * A generic content part:  transparent to other parts' owner lookups (`PartContext`).  `ContentPart` sets it.
   * - Static:  `register()` records it page-wide, by tag, before any instance exists.
   */
  declare isPart: boolean

  /**
   * Shadow root `delegatesFocus`;  an element with nothing focusable inside (`<ui-item>`) turns it off.
   * - Static:  a `shadowRootInit` option, read once at `define()`.
   */
  declare delegatesFocus: boolean

  /**
   * Shadow root `slotAssignment`:  `manual` lets an element hand CHOSEN children to chosen `<slot>`s
   * (`slot.assign()`), e.g. `<ui-accordion>` wrapping each title + content pair in its own `<details>`.
   * - NOTE: a `manual` root assigns nothing by itself:  every `<slot>` it renders stays empty until assigned.
   * - Static:  a `shadowRootInit` option, read once at `define()`.
   */
  declare slotAssignment: SlotAssignmentMode

  /**
   * Form-associated (the fork's `formAssociated` option):  `FormElement`, and `UIButton` for submit / reset.
   * - Static:  the platform reads `static formAssociated` once, when the tag is defined.
   */
  declare formAssociated: boolean

  /**
   * Render at once, before the runtime and this class's sheets arrive (`isLoaded()`), instead of waiting for them.
   * - For an element whose content must not wait:  `<ui-root>`'s slot (the page) shows the moment the root is
   *   defined.  Its render MUST look right unstyled (inline styles only) until `isLoaded()`.
   * - Static:  how the class's render is built (`mount()`), the same for every instance.
   */
  declare canRenderUnstyled: boolean

  /** Default:  no sheets of its own. */
  @proto static styles: Readonly<Record<string, string>> = {}

  /** Default:  none -- a failed element shows a bare `<slot>`. */
  @proto static Fallback: FallbackClass | undefined = undefined

  /** Default:  `UIHost`. */
  @proto static Host = UIHost

  /** Default:  not a part. */
  @proto static isPart = false

  /** Default:  on. */
  @proto static delegatesFocus = true

  /** Default:  `named`, the platform's. */
  @proto static slotAssignment: SlotAssignmentMode = "named"

  /** Default:  not form-associated. */
  @proto static formAssociated = false

  /** Default:  wait for the sheets. */
  @proto static canRenderUnstyled = false

  ////////////////
  // ## Instance
  ////////////////

  /** The element. */
  readonly host: UIHost

  /** Names and converters for this tag. */
  readonly definition: E.ElementDefinition

  /** Converted canonical attribute values (the fork's props);  reading one tracks it. */
  readonly attrs: E.AttributeValues<V>

  /** What the app provides as `UIElement.AppContext` above this element, else `null`. */
  readonly app: unknown

  /** Fomantic class string of the component's root. */
  readonly classes: Accessor<string>

  /** Runtime loaded and sheets adopted;  tracked. */
  readonly isLoaded: Accessor<boolean>

  /**
   * In the document?  Tracked;  follows connects / disconnects one microtask late.
   * - Deferred:  the fork's hooks run inside `connectedCallback`, which may run inside a Solid render (an app
   *   inserting the element), where a signal write would throw.
   */
  readonly isConnected: E.Cell<boolean>

  /** Disabled by an ancestor `<fieldset disabled>` (form-associated elements only, the fork's hook);  tracked. */
  readonly isFormDisabled = new E.Cell(false)

  /** Sets `isLoaded`. */
  private readonly setLoaded: (value: boolean) => void

  /**
   * Called by the render function `defineTag()` hands the fork, once per element, under the element's owner.
   * - Positional `(host, definition, attrs)`, not a props object:  the fork's call shape (`AGENTS.md` "Classes").
   */
  constructor(host: UIHost, definition: E.ElementDefinition, attrs: E.AttributeValues<V>) {
    this.host = host
    this.definition = definition
    this.attrs = attrs
    host.controller = this
    this.app = useContext(UIElement.AppContext)
    this.isConnected = new E.Cell(isServer || host.isConnected)
    const classInput = this.classInput()
    // `lazy`:  memos compute EAGERLY in Solid 2, and this one calls overridable methods that read subclass
    // fields, which don't exist yet while this constructor runs
    this.classes = createMemo(() => definition.builder.build(classInput, { extra: this.extraClasses() }), {
      lazy: true
    })
    // on the server (the SSR probe) there are no sheets to adopt:  render at once
    const isRuntimeLoaded =
      isServer || (E.RUNTIME_KEY in globalThis && !!(globalThis as E.RuntimeGlobal)[E.RUNTIME_KEY])
    const [loaded, setLoaded] = createSignal(isRuntimeLoaded)
    this.isLoaded = loaded
    this.setLoaded = setLoaded
    if (isServer) return
    const root = host.renderRoot
    const onSlotChange = (event: Event) => E.PartContext.slotChanged(event.target as HTMLSlotElement)
    root.addEventListener("slotchange", onSlotChange)
    host.addReleaseCallback(() => root.removeEventListener("slotchange", onSlotChange))
    const sync = () => queueMicrotask(() => this.isConnected.set(host.isConnected))
    onConnect(sync)
    onDisconnect(sync)
    // the fork replays the last state to a late registration -- i.e. right here, inside the component body,
    // where Solid 2 forbids the write:  defer it then;  platform calls (no owner) write at once
    if (this.formAssociated) {
      onFormDisabled((disabled) => {
        if (getOwner()) queueMicrotask(() => this.isFormDisabled.set(disabled))
        else this.isFormDisabled.set(disabled)
      })
    }
    if (!isRuntimeLoaded) void UI.load().then(() => this.onLoaded())
  }

  ////////////////
  // ## Hooks
  ////////////////

  // What subclasses override, documented here once:  an override that only fills one needs no docstring.

  /**
   * Hook:  the component's shadow content (JSX).
   * - Runs ONCE, under the element's owner, after its sheets are adopted (`isLoaded()`;  at once with
   *   `canRenderUnstyled`):  what changes later is reactive inside the JSX, not a re-render.
   * - An owned scope:  NEVER write a signal here.
   */
  abstract render(): JSX.Element

  /**
   * Hook:  custom states to set on the host (`:state(open)`), keyed by the vocabulary's state names;  default none.
   * - Tracked:  a render effect sets and clears them as what it reads changes.  A throw reaches the fork's error
   *   boundary, like a throw in `render()`.
   */
  protected hostStates(): Partial<Record<E.StateName<V>, boolean>> {
    return {}
  }

  /**
   * Hook:  extra classes after the noun in `classes()`, e.g. `icon` for an icon-only button;  default none.
   * - Tracked, by the `classes()` memo.
   */
  protected extraClasses(): string | undefined {
    return undefined
  }

  /**
   * Hook:  the value `ClassBuilder` sees for canonical attribute `name`;  default the converted attribute.
   * - Override for state the class string must follow instead of the attribute, e.g. a controlled `active`.
   * - Tracked, by the `classes()` memo.
   */
  protected classValue(name: E.AttributeName<V>): unknown {
    return this.attrs[this.definition.attribute(name).key as keyof E.AttributeValues<V>]
  }

  /**
   * Hook:  registry names of the sheets to adopt now, in order;  default every `styles` entry.
   * - Tracked:  an element whose sheets depend on context (a label owned by a statistic adds `ui-parts.css`)
   *   overrides it, and the root re-adopts when it changes.
   */
  protected sheetNames(): string[] {
    return Object.keys(this.styles)
  }

  /**
   * Hook:  can't the element be used right now?  Default never.
   * - The host swallows clicks while it says so (`UIHost`);  an element with a `disabled` attribute overrides it
   *   (`<ui-card>`, `<ui-step>`, the form controls with `isFormDisabled`).
   */
  isDisabled(): boolean {
    return false
  }

  ////////////////
  // ## Rendering
  ////////////////

  /**
   * Create the effects that call overridable methods, then return the content.  Called by the render function.
   * - Host states follow `hostStates()`;  `ready` resolves once content has rendered with styles.
   */
  mount(): JSX.Element {
    // adopted HERE when the runtime was already loaded:  `sheetNames()` is overridable and may read subclass
    // fields, which don't exist yet while the base constructor runs
    if (!isServer && untrack(this.isLoaded)) this.adoptStyles()
    // a RENDER effect:  a throw in `hostStates()` (a subclass's, in the compute) must reach the fork's error
    // boundary, for `:state(errored)` and the fallback -- a plain effect's error is only logged
    createRenderEffect(
      () => this.hostStates(),
      (states) => {
        for (const [name, isOn] of Object.entries(states)) this.host.setState(name, !!isOn)
      }
    )
    createEffect(
      () => this.isLoaded(),
      (isLoaded) => {
        if (isLoaded) queueMicrotask(() => this.host.markReady())
      }
    )
    // the APPLY uses the computed names:  calling `sheetNames()` there again would read its signals untracked
    const separator = SHEET_SEPARATOR
    createEffect(
      () => this.sheetNames().join(separator),
      (names) => {
        if (untrack(this.isLoaded)) UI.styles.adoptInto(this.host.renderRoot, names ? names.split(separator) : [])
      },
      { defer: true }
    )
    return <Show when={this.canRenderUnstyled || this.isLoaded()}>{this.render()}</Show>
  }

  /**
   * Registry names of the sheets this element adopts now (`sheetNames()`, untracked).
   * - For the static render (`$/ui/static`):  an item adopts its owner's sheet (`ui-list.css`), so that sheet's
   *   static scope must include the item.
   */
  sheets(): string[] {
    return untrack(() => this.sheetNames())
  }

  /**
   * Classes for a SECOND root from chosen attribute values, e.g. the wrapper of a labeled button.
   * - Keys are canonical attribute names, type-checked against the vocabulary.
   */
  protected buildClasses(values: Partial<Record<E.AttributeName<V>, unknown>>, extra?: string): string {
    return this.definition.builder.build(values, { extra })
  }

  /**
   * An effect that writes to the HOST (`internals.role`, ARIA, states):  `createEffect(compute, apply)`, except on
   * a server, where it applies once, now.
   * - Why:  the server build runs an effect's compute only, never its apply, so host ARIA a static render must
   *   write out (`$/ui/static`) would never be set.
   * - MUST be called from a constructor or field initializer, like `createEffect`.
   */
  protected hostEffect<T>(compute: () => T, apply: (value: T) => void) {
    if (isServer) apply(untrack(compute))
    else createEffect(compute, apply)
  }

  /**
   * Auto-controlled state for attribute `name` (see `Controlled`):  the host's property when set, else internal.
   * - MUST be called from a field initializer or constructor (it creates a signal).
   */
  protected controlled<N extends E.AttributeName<V>>(
    name: N,
    initial: E.AttributeValues<V>[E.CamelCase<N> & keyof E.AttributeValues<V>]
  ): E.Controlled<E.AttributeValues<V>[E.CamelCase<N> & keyof E.AttributeValues<V>]> {
    const { key, property } = this.definition.attribute(name)
    type Value = E.AttributeValues<V>[E.CamelCase<N> & keyof E.AttributeValues<V>]
    return new E.Controlled<Value>({
      host: this.host,
      key,
      property,
      value: () => this.attrs[key as keyof E.AttributeValues<V>] as Value | undefined,
      initial
    })
  }

  /** `ClassBuilder` input:  getters over `classValue()`, so the classes memo tracks exactly what it reads. */
  private classInput(): E.ClassInput {
    const input: Record<string, unknown> = {}
    for (const { spec } of this.definition.attributes) {
      Object.defineProperty(input, spec.name, {
        get: () => this.classValue(spec.name as E.AttributeName<V>),
        enumerable: true
      })
    }
    return input
  }

  ////////////////
  // ## Names
  ////////////////

  /** `part` attribute for canonical part `name`. */
  part(name: E.PartName<V>): string {
    return this.definition.part(name)
  }

  /** Localized slot name for canonical `name`. */
  slot(name: E.SlotName<V>): string {
    return this.definition.slot(name)
  }

  /**
   * Text for `key` in the current locale, via `UI.i18n`, scoped to this component's canonical tag.
   * - Another family's text under the same key never leaks in (see `registerTexts()`).
   */
  text(key: E.TextKey<V>, params?: Record<string, string | number>): string {
    return UI.i18n.t(key, params, this.vocabulary.tag)
  }

  ////////////////
  // ## Events
  ////////////////

  /**
   * Dispatch vocabulary event `name` from the host:  `bubbles`, `composed`, `cancelable` as the vocabulary says.
   * - Returns false when a cancelable event was vetoed (`preventDefault()`).
   */
  emit(name: E.EventName<V>, detail: object): boolean {
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
    if (!UIElement.registeredStyles.has(this.styles)) {
      UIElement.registeredStyles.add(this.styles)
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

  // Static:  called on the element CLASS (`UIButton.define()`), before any instance exists.

  /**
   * A value the host APP may provide around any `ui-*` element (`<AppContext value={...}>`);  read by every
   * controller as `app`.
   * - Proves owner adoption across the custom-element boundary (the Solid host page's identity probe,
   *   `tools/frameworks/solid/identity.js`).
   * - `null` default:  Solid 2's `useContext` throws on a context with neither a default nor a provider.
   * - Static:  ONE context for the page, shared by every element and the app around it.
   */
  static readonly AppContext = createContext<unknown>(null)

  /**
   * Definition per registered tag, canonical and translated;  components read it to tell a child's kind by its tag
   * (`UIElement.definitions.get(child.localName)?.vocabulary.noun`).
   * - Static:  page-wide, like `customElements`, which it mirrors;  `reset()` leaves it, since a defined tag can't
   *   be undefined.
   */
  static readonly definitions = new Map<string, E.ElementDefinition>()

  /**
   * Everything this component's markup can say, for introspection at runtime:  its whole vocabulary -- tag,
   * attributes (kinds, allowed values, defaults), events, slots, parts, states, text strings, descriptions, `topics`
   * and `aka`.  Live data:  the same object the element reads (`UIButton.describe().topics`).
   * - Every tag's summary at once:  `ComponentDefinitions` (`src/components/ComponentDefinitions.ts`).
   */
  static describe<T extends { prototype: { vocabulary: E.ComponentVocabulary } }>(
    this: T
  ): T["prototype"]["vocabulary"] {
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
  static define(this: UIElementClass, tag?: string, dictionary?: E.Dictionary): CustomElementConstructor {
    const definition = new E.ElementDefinition(this.prototype.vocabulary, { tag, dictionary })
    return customElements.get(definition.tag) ?? UIElement.defineTag.call(this, definition)
  }

  /**
   * `define()` minus the idempotence check:  record `definition`, then hand the fork its tag, props, component
   * and options.
   * - For a tag already defined, the fork swaps the component in place (Vite dev only:  hot module replacement
   *   re-defines a new version of a class through here, see `HotDefinitions`).
   */
  static defineTag(this: UIElementClass, definition: E.ElementDefinition): CustomElementConstructor {
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
        errorBoundary: UIElement.ISOLATE_ERRORS,
        onError: (element, error) => UIElement.failed(element as unknown as UIHost, error),
        fallback: (element, error) => UIElement.renderFallback(element as unknown as UIHost, error, Fallback)
      }
    )
  }

  /**
   * Record `definition` page-wide WITHOUT defining an element:  `definitions`, the part registry
   * (`PartContext.define()`), its English texts.
   * - `defineTag()` starts with it;  the server render (`$/ui/static`) calls it alone:  node has no
   *   `customElements`.
   */
  static register(this: UIElementClass, definition: E.ElementDefinition) {
    const { vocabulary, isPart } = this.prototype
    UIElement.definitions.set(definition.tag, definition)
    E.PartContext.define({ vocabulary, tag: definition.tag, isPart, isConditionalOwner: "isOwnerOf" in this.prototype })
    UIElement.registerTexts(vocabulary)
  }

  ////////////////
  // ## Errors
  ////////////////

  // Static:  the fork calls these per HOST, after the controller broke (or was never built).

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
    const event = new CustomEvent(E.ERROR_EVENT, { bubbles: true, composed: true, cancelable: true, detail: { error } })
    if (!host.dispatchEvent(event)) UIElement.cancelledHosts.add(host)
  }

  /**
   * The fork's `fallback`:  `Fallback.render({ host, root, error, internals })` -- plain DOM, library-neutral
   * markup -- or a bare `<slot>` for an element without one (a group keeps its children visible).
   * - Built a microtask LATER, into the render root directly:  the boundary's own insert would otherwise clear
   *   the root after us, and a fallback like the dropdown's must be attached to set its validity anchor.
   * - Skipped when an app cancelled `ui-error`;  its handle is disposed with the element.
   */
  private static renderFallback(host: UIHost, error: unknown, Fallback: FallbackClass | undefined): undefined {
    if (UIElement.cancelledHosts.has(host)) return undefined
    queueMicrotask(() => {
      const root = host.renderRoot
      const handle = Fallback
        ? Fallback.render({ host, root, error, internals: host.internals })
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
   * - Static:  once per vocabulary, page-wide (`registeredVocabularies`).
   */
  private static registerTexts(vocabulary: E.ComponentVocabulary) {
    if (UIElement.registeredVocabularies.has(vocabulary)) return
    const isRuntimeLoaded = !!(globalThis as E.RuntimeGlobal)[E.RUNTIME_KEY]
    if (isServer && !isRuntimeLoaded) return
    UIElement.registeredVocabularies.add(vocabulary)
    if (isRuntimeLoaded) register()
    else void UI.load().then(register)

    /** Hand the vocabulary and its English texts to the runtime. */
    function register() {
      // a server keeps ONE runtime on `globalThis` while Vite re-runs edited modules (a new vocabulary object for the
      // same tag):  swap it in, as hot reload does
      if (isServer) UI.vocabulary.replace(vocabulary)
      else UI.vocabulary.register(vocabulary)
      const texts: Record<string, string> = {}
      for (const { key, text } of vocabulary.texts) texts[key] = text
      UI.i18n.registerDefaults(texts, vocabulary.tag)
    }
  }

  ////////////////
  // ## Page-wide registries
  ////////////////

  /**
   * Forget which sheets, texts and cancelled hosts were registered, for tests.
   * - Leaves `definitions` (it mirrors `customElements`) and the runtime's own registries (`UI.styles`,
   *   `UI.i18n`):  the next element of each class registers again, idempotently.
   */
  static reset() {
    UIElement.registeredStyles = new WeakSet()
    UIElement.registeredVocabularies = new WeakSet()
    UIElement.cancelledHosts = new WeakSet()
  }

  // Not `readonly`:  a `WeakSet` can't be cleared, so `reset()` replaces each.

  /** `styles` maps whose sheets are registered with the runtime. */
  private static registeredStyles = new WeakSet<object>()

  /** Vocabularies whose texts are registered (or queued) with the runtime. */
  private static registeredVocabularies = new WeakSet<E.ComponentVocabulary>()

  /** Hosts whose `ui-error` an app cancelled:  no fallback. */
  private static cancelledHosts = new WeakSet<UIHost>()
}

/** A concrete `UIElement` subclass, as `define()` sees it. */
export type UIElementClass = {
  new (host: UIHost, definition: E.ElementDefinition, attrs: any): UIElement<any>
  prototype: UIElement<any>
}

/** A per-family native fallback class (`ButtonFallback` ...), as `NativeFallback.render()` is called. */
export type FallbackClass = {
  render(props: E.NativeFallbackProps): E.NativeFallbackHandle
}

/** Joins sheet registry names into one comparable value (names never contain it). */
const SHEET_SEPARATOR = " "
