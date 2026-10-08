import { Show, createContext, createEffect, createRenderEffect, getOwner, untrack, useContext } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"
import { customElement, onConnect, onDisconnect, onFormDisabled } from "@spell-app/solid-element"

// Import directly to avoid circular import
import { proto } from "$/ui/util"
import { E, UI } from "$/ui/core"
// Import directly to avoid circular import
import { DOMElement } from "./DOMElement"
import { onChange, state } from "./Reactive"

/****************
 * ### `UIComponent`
 * The base class of every Spell UI component.
 *
 * Each `<ui-button>`, etc on a page gets ONE instance of its UIComponent's subclass (`UIButton`)
 * which decides what the element shows and how it behaves.  This is the base for those subclasses.
 *
 * - **DOMElement**: `component.domElement` (`DOMElement.ts`) is a subclass of the *browser's* `HTMLElement`,
 *   and is the object that the browser and all frameworks actually interact with.
 *
 *   For the most part this will be the base `DOMElement` class -- subclasses of `UIComponent`
 *   which need extra functionality in the DOM will have a custom `DOMElement` subclass.
 *
 *   The custom element mechanism in the browser "upgrades" `<ui-button>`
 *   from *its* `HTMLElement` to *our* `DOMElement` automatically when we `define()` a component.
 *
 *   `DomElement.component` is the link from the DOM back to this class.
 *
 * - **Custom-element wrapper**:  `@spell-app/solid-element`, our fork of Solid's own custom-element library.
 *   It defines the tag, watches attributes, makes the shadow root, and calls `render()` inside Solid.  We forked it
 *   to fix bugs upstream hasn't taken yet (`packages/solid-element/UPSTREAM.md`).
 *
 * - **Vocabulary**:  `UIButton.en.ts` (named for its language) names EVERYTHING the tag uses
 *   (attributes and their values, events, slots, parts, states, texts).
 *   Code never writes those names as strings:  it reads them from the vocabulary,
 *   so a translated tag (`<ie-boton>`) runs the same code.
 *
 * - **State**:  fields that change over time are declared with a decorator, and read and written like a field:
 *   ```ts
 *   @state accessor isOpen = false     // this.isOpen = true;  if (this.isOpen) ...
 *   ```
 *   A read is always up to date, even right after a write;  JSX will update the view as the value changes.
 *   The decorators (`@state`, `@controlled`, `@derived`, `@cssState`, `@onChange`) are in `Reactive.ts`.
 *
 * - **Attributes**:  every DOM element attribute has a getter/setter on the component,
 *   under its name in camelCase:  `this.size`, `this.closeIcon`.
 *   The value is already converted (`"true"` => `true`).
 *
 *   A class declares them for TypeScript with one line below it:
 *   `export interface UIButton extends E.AttributeValues<typeof buttonVocabulary> {}`.
 *
 * - **Base classes** (this one, `FormComponent`, `LoadableComponent` ...) never use a member name
 *   that any vocabulary uses for an attribute, or the member would hide that attribute's getter:
 *   - `elementDefinition`, not `definition` (an attribute of `<ui-table>`).
 *   `Reactive.test.tsx` checks every vocabulary against them.
 *
 * - **Lifecycle**:
 *   1. The HTML source includes the tag:  `UIButton.define()` (see "Defining the element")
 *   2. The first time the element is "connected", the custom-element layer builds its component,
 *      then calls `onMount()`, which calls `render()` to return content for the shadow root
 *   3. The content shows once the runtime (`UI`) has loaded and the class's style sheets are in,
 *      so nothing flashes unstyled -- when the `component.isReady`.
 *   4. Moving the element keeps its component (`keepAlive`);  it ends only with `domElement.dispose()`
 *   5. If anything throws, a form control shows its plain-DOM fallback instead, any other element its children
 *      (see "Errors and fallback")
 *
 * - Solid 2 has one rule worth knowing here:  NEVER change state while Solid is drawing.
 *   That means inside `render()`, a getter, or the first function of an effect.
 *
 *   Change state in event handlers, `@onChange` methods, or after an `await`.
 *   (A decorated member's write won't throw there, but it's late.)
 *
 * - Subclasses fill in *Hooks* and set what's marked "Class setting:" with `@proto static`.
 *   It's all documented here once, so an override that only fills it in needs no docstring of its own.
 *   - Most settings are keys of ONE object, `elementSetup`:
 *     a subclass states only the keys it changes (`{ delegatesFocus: false }`).
 ****************/
export abstract class UIComponent<V extends E.ComponentVocabulary = E.ComponentVocabulary> {
  ////////////////
  // ## Vocabulary
  ////////////////

  /**
   * Every piece of human language the tag uses:
   *  its tag, attributes, events, slots, parts, states and texts, from `UI<Name>.en.ts`.
   * - No default:  each component sets its own (`@proto static vocabulary = buttonVocabulary`).
   * - Set on the class, not on each element:
   *   `define()` needs it before any element exists, and the runtime keeps the same object (`UI.vocabulary`).
   */
  declare vocabulary: V

  /**
   * The vocabulary as built for one actual tag, by `define()`:  the names this element really uses.
   * - Translated names:  a translated tag (`<ie-boton>`) gets its own spelling of each attribute and event.
   * - How each attribute's text converts to a value, and how the classes are built.
   * - Its `.vocabulary` is the same object as `vocabulary` above.
   * - Not called `definition`, because `<ui-table>` has an attribute by that name
   *   (base classes never use an attribute's name).
   */
  readonly elementDefinition: E.ElementDefinition

  /** The `part` attribute value for the vocabulary's part `name` (translated on a translated tag). */
  partForName(name: E.PartName<V>): string {
    return this.elementDefinition.part(name)
  }

  /** The slot name for the vocabulary's slot `name` (translated on a translated tag). */
  slotForName(name: E.SlotName<V>): string {
    return this.elementDefinition.slot(name)
  }

  /**
   * The text for `key` in the page's language (`UI.i18n`), with `params` filled in.
   * - Looked up for THIS component:  another component's text under the same key never shows here.
   */
  translationForKey(key: E.TextKey<V>, params?: Record<string, string | number>): string {
    return UI.i18n.t(key, params, this.vocabulary.tag)
  }

  ////////////////
  // ## The DOM element
  ////////////////

  /**
   * The DOM element itself, the `<ui-button>` in the page:
   * a `DOMElement`, or the subclass `elementSetup.DOMElement` names.
   * - `domElement.component` points back to this object.
   */
  readonly domElement: DOMElement

  /**
   * Called by solid-element once per element, the first time the element is connected.
   * - Three arguments in a row, not one object:  that's how solid-element calls it.
   * - It runs while Solid is drawing:  don't change state here (see the class docs).
   */
  constructor(domElement: DOMElement, definition: E.ElementDefinition, attrs: Readonly<E.AttributeValues<V>>) {
    this.domElement = domElement
    this.elementDefinition = definition
    this.attrs = attrs
    domElement.component = this
    this.appContext = useContext(UIComponent.AppContext)
    this.classInput = this.buildClassInput()
    this.isConnected = isServer || domElement.isConnected
    // on the server there are no style sheets to wait for:  draw at once
    this.isReady = isServer || (E.RUNTIME_KEY in globalThis && !!(globalThis as E.RuntimeGlobal)[E.RUNTIME_KEY])
    if (isServer) return
    this.on("slotchange", (event) => E.PartContext.slotChanged(event.target as HTMLSlotElement), {
      target: domElement.renderRoot
    })
    // update `isConnected` a microtask later:
    // the element may be connected while the app's Solid is drawing, when state can't change yet
    const sync = () => queueMicrotask(() => (this.isConnected = domElement.isConnected))
    onConnect(sync)
    onDisconnect(sync)
    // solid-element calls this right away with the current disabled state, while we're still drawing:
    // wait a microtask then.  Later calls come from the browser, outside Solid, and can write at once.
    if (this.setup.isAFormControl) {
      onFormDisabled((disabled) => {
        if (getOwner()) queueMicrotask(() => (this.formIsDisabled = disabled))
        else this.formIsDisabled = disabled
      })
    }
    if (!this.isReady) void UI.load().then(() => this.onRuntimeLoaded())
  }

  ////////////////
  // ## Element setup
  ////////////////

  /**
   * Class setting:  how the class's custom element is set up, as ONE object (`ElementSetup` documents each key).
   * - A subclass states only the keys it changes:
   *   `@E.proto static elementSetup = { delegatesFocus: false } satisfies Partial<E.ElementSetup>`
   *   (`satisfies`, so a misspelt key fails TypeScript).
   * - The keys merge down the class chain, base class first:
   *   `CheckControl`'s `{ DOMElement: DOMCheckElement }` keeps the `{ isAFormControl: true }` of `FormComponent`.
   * - So `elementSetup` itself is only what ONE class states:
   *   read the merged result through `setup` (or `UIComponent.setupFor(Class)`).
   * - `vocabulary` and `styleSheets` stay settings of their own:
   *   a subclass's `styleSheets` REPLACE its base's, they don't merge.
   */
  declare elementSetup: Partial<ElementSetup>
  @proto static elementSetup: Partial<ElementSetup> = {
    isAFormControl: false,
    delegatesFocus: true,
    assignSlots: "byName",
    isAPart: false,
    DOMElement: DOMElement,
    Fallback: undefined,
    canRenderUnstyled: false
  }

  /** This element's `elementSetup`, merged down its class chain (`UIComponent.setupFor()`). */
  protected get setup(): ElementSetup {
    return UIComponent.setupFor(this.constructor)
  }

  /**
   * The `elementSetup` of `Class`, merged down its class chain.
   * - Each class's own keys, base class first, so a subclass's keys win.
   * - `@proto` puts a class's `elementSetup` on its PROTOTYPE:
   *   a prototype's OWN `elementSetup` is what that class stated.
   * - Worked out once per class, then kept (`setups`).
   */
  static setupFor(Class: { prototype: UIComponent<any> }): ElementSetup {
    let setup = UIComponent.setups.get(Class)
    if (setup) return setup
    const stated: Partial<ElementSetup>[] = []
    for (let prototype = Class.prototype; prototype; prototype = Object.getPrototypeOf(prototype)) {
      if (Object.hasOwn(prototype, "elementSetup")) stated.unshift(prototype.elementSetup)
    }
    setup = Object.assign({}, ...stated) as ElementSetup
    UIComponent.setups.set(Class, setup)
    return setup
  }

  /**
   * Each class's merged `elementSetup`, worked out once (`setupFor()`).
   * - For the whole page, like `definitions`:  `resetRegistries()` leaves it alone.
   */
  private static readonly setups = new WeakMap<object, ElementSetup>()

  ////////////////
  // ## AppContext
  ////////////////

  /**
   * The value an app put around this element with `<UIComponent.AppContext value={...}>`;  `null` when none.
   * - Read once, when this object is built.
   */
  readonly appContext: unknown

  /**
   * A Solid context an app can wrap around any `ui-*` elements, to hand them a value of its own.
   * - Every component reads it as `appContext`.
   * - One for the whole page.
   * - `null` by default, because Solid 2's `useContext` throws on a context with no default and no provider.
   * - `tools/frameworks/solid/identity.js` uses it to prove context reaches inside custom elements.
   */
  static readonly AppContext = createContext<unknown>(null)

  ////////////////
  // ## Attributes
  //
  // Every vocabulary attribute also has a getter/setter on the component,
  // which may be reformulated to read as English.
  //
  // `<button disabled>` => `isDisabled` = getter/setter pair
  ////////////////

  /**
   * The element's attributes exactly as the DOM has them:  raw text, `null` when absent.
   * - Use it for attributes NOT in the vocabulary (`attributes["aria-label"]`),
   *   or for a vocabulary attribute's raw text (`attributes.value`, to reset a form field).
   * - For vocabulary attributes, prefer their getters (`this.size`):  converted and typed.
   * - Pass the English name:  on a translated tag it reads that tag's spelling (`valor` for `value`).
   * - Reading it in JSX or an effect follows changes.
   * - Protected:  outside code reads the element's own attributes.
   */
  protected get attributes(): Readonly<Record<string, string | null>> {
    const { elementDefinition } = this
    return E.Reactive.attributesOf(this, this.domElement, (name) => elementDefinition.localAttribute(name))
  }

  /**
   * The converted attribute values solid-element hands the constructor, one Solid signal each.
   * - On the way out:  read an attribute through its getter (`this.size`) instead, which is always up to date.
   *   A value here lags one tick behind a change.
   * - Only `brand`'s components still read it;  it goes once they use the decorators.
   */
  // CLAUDE: this should be `$attrs`, to signal that it's reactive.  No?
  readonly attrs: Readonly<E.AttributeValues<V>>

  ////////////////
  // ## Reactive members
  ////////////////

  /**
   * One ACCESSOR per member, under the same name:  `this.$.isOpen` is a function that returns `this.isOpen`.
   * - An accessor is how Solid hands around "a value that may change":
   *   a function you call to read it.  Calling it inside JSX or an effect subscribes to it,
   *   so they update when it changes.
   * - Everyday code just reads `this.isOpen`, which is already reactive.
   * - Use `$` only for a Solid API that wants the function itself:
   *   `createMemo(this.$.isOpen)`, `<Show when={this.$.isOpen}>`.
   */
  get $(): E.Accessors<this> {
    return E.Reactive.accessorsOf(this)
  }

  ////////////////
  // ## Rendering
  ////////////////

  /**
   * Hook:  what the element shows:  the content of its shadow DOM, as JSX.
   * - Runs ONCE.  Later changes happen inside the JSX, as the members it reads change;
   *   `render()` itself never runs again.
   * - It runs while Solid is drawing, so it must NEVER change state:  no `this.isOpen = ...` here.
   */
  abstract render(): JSX.Element

  /**
   * Set the element up and return its content, which solid-element puts into the shadow root.
   * - Called once, by solid-element, right after the constructor.
   * - SIDE EFFECTS:
   *   - adopts the class's style sheets into the shadow root (if the runtime has loaded)
   *   - keeps the element's `:state()`s in step with its `@cssState` members and `cssStates()`
   *   - starts the `@onChange` methods
   *   - re-adopts the style sheets when `styleSheetNames` changes
   * - Not in the constructor, because a subclass's fields don't exist yet while the base constructor runs.
   * - Hook:  an override starts its own effects, then returns `super.onMount()`.
   */
  onMount(): JSX.Element {
    if (!isServer && untrack(() => this.isReady)) this.adoptStyleSheets()
    // a RENDER effect, so a getter that throws shows the element's fallback (a plain effect would only log it)
    const decorated = E.Reactive.cssStatesOf(this)
    createRenderEffect(
      () => {
        const states: Record<string, boolean | undefined> = { ...this.cssStates() }
        for (const { member, state: name } of decorated) states[name] = !!(this as Record<PropertyKey, unknown>)[member]
        return states
      },
      (states) => {
        for (const [name, isOn] of Object.entries(states)) this.domElement.setState(name, !!isOn)
      }
    )
    E.Reactive.startEffects(this)
    // the names joined into one string, so the effect can tell "same names" from "new names"
    const separator = " "
    createEffect(
      () => this.styleSheetNames.join(separator),
      (names) => {
        if (untrack(() => this.isReady)) {
          UI.styles.adoptInto(this.domElement.renderRoot, names ? names.split(separator) : [])
        }
      },
      { defer: true }
    )
    const { canRenderUnstyled } = this.setup
    return <Show when={canRenderUnstyled || this.isReady}>{this.render()}</Show>
  }

  ////////////////
  // ## Readiness
  ////////////////

  /**
   * Ready to show:  the runtime (`UI`) has loaded, and this element's style sheets are in its shadow root.
   * - The content shows only then (unless `elementSetup.canRenderUnstyled`).
   * - Not the same as a source element's loading (`LoadableComponent.loadStatus`):
   *   this is the element itself being styled and drawn.
   */
  @state accessor isReady = false

  /** Once ready:  resolve `domElement.ready`, a microtask later, after the content has drawn with its styles. */
  @onChange("isReady")
  protected onReadyChanged(isReady: boolean) {
    if (isReady) queueMicrotask(() => this.domElement.markReady())
  }

  /** The runtime has loaded:  adopt the style sheets, then show the content. */
  private onRuntimeLoaded() {
    this.adoptStyleSheets()
    this.isReady = true
  }

  ////////////////
  // ## StyleSheets
  ////////////////

  /**
   * Class setting:  the component's own style sheets, as `name => CSS text`, in order:  `{ button: buttonCSS }`.
   * - Default none.
   * - Every element of the class uses the same sheets:
   *   registered with the runtime (`UI.styles`) once per class,
   *   then adopted into each element's shadow root, after the shared foundation sheets.
   * - Which of them apply right now:  `styleSheetNames`.
   */
  declare styleSheets: Readonly<Record<string, string>>
  @proto static styleSheets: Readonly<Record<string, string>> = {}

  /**
   * Hook:  the names of the `styleSheets` to adopt right now, in order.
   * - Default:  all of them.
   * - Override it when the sheets depend on where the element sits:
   *   a `<ui-label>` inside a `<ui-statistic>` adds `UIParts.css`.  The shadow root re-adopts when it changes.
   * - The server render reads it too, to scope each sheet to the elements that use it.
   */
  get styleSheetNames(): string[] {
    return Object.keys(this.styleSheets)
  }

  /** Register this class's sheets with the runtime (the first time only), then adopt them into the shadow root. */
  private adoptStyleSheets() {
    if (!UIComponent.registeredStyleSheets.has(this.styleSheets)) {
      UIComponent.registeredStyleSheets.add(this.styleSheets)
      for (const [name, css] of Object.entries(this.styleSheets))
        if (!UI.styles.has(name)) UI.styles.register(name, css)
    }
    UI.styles.adoptInto(
      this.domElement.renderRoot,
      untrack(() => this.styleSheetNames)
    )
  }

  /**
   * The `styleSheets` already registered with the runtime, so each class registers only once.
   * - For the whole page.
   * - Not `readonly`:  `resetRegistries()` replaces it (a `WeakSet` can't be emptied).
   */
  private static registeredStyleSheets = new WeakSet<object>()

  ////////////////
  // ## Connection
  ////////////////

  /**
   * Is the element in the document?
   * - Updated a microtask after it connects or disconnects:
   *   that can happen while the app's Solid is drawing, when state can't change yet.
   */
  @state accessor isConnected = false

  ////////////////
  // ## Disabled
  ////////////////

  /**
   * Hook:  is the element unusable right now?
   * - Default never.
   * - While it's true, the element ignores clicks (`DOMElement`).
   * - Elements with a `disabled` attribute override it:  `<ui-card>`, `<ui-step>`,
   *   and the form controls, which also check `formIsDisabled`.
   * - An element whose `disabled` only changes how it LOOKS (`<ui-icon>`, `<ui-segment>`, `<ui-form>` ...)
   *   leaves this alone, and puts `@cssState("disabled")` on its own `get looksDisabled()`:
   *   it gets `:state(disabled)`, and clicks still go through.
   */
  get isDisabled(): boolean {
    return false
  }

  /** Can the element be used right now?  The opposite of `isDisabled`. */
  get isEnabled(): boolean {
    return !this.isDisabled
  }

  /**
   * Is a `<fieldset disabled>` around this element disabling it?
   * - Form controls only (`elementSetup.isAFormControl`).
   */
  @state accessor formIsDisabled = false

  ////////////////
  // ## Classes
  ////////////////

  /**
   * The `class` of the top box in the element's shadow DOM, in Fomantic's class names:  `ui small primary button`.
   * - Built from the attributes (through `classValue()`), then `extraClasses`.
   */
  get rootClasses(): string {
    return this.elementDefinition.builder.build(this.classInput, { extra: this.extraClasses })
  }

  /** Hook:  classes to add after the noun, e.g. `icon` for a button with only an icon;  default none. */
  protected get extraClasses(): string | undefined {
    return undefined
  }

  /**
   * Hook:  the value used for attribute `name` when building the classes.
   * - Default:  the attribute's own value.
   * - Override it when a class must follow state rather than the attribute:
   *   a button's `active` class follows `isActive`, which a click can change without touching the attribute.
   */
  protected classValue(name: E.AttributeName<V>): unknown {
    return E.Reactive.attributeValue(this, this.elementDefinition.attribute(name).key)
  }

  /**
   * Classes for a SECOND box, from attribute values you choose:  e.g. the wrapper of a button with a label beside it.
   * - Keys are the vocabulary's attribute names, type-checked.
   */
  protected buildClasses(values: Partial<Record<E.AttributeName<V>, unknown>>, extra?: string): string {
    return this.elementDefinition.builder.build(values, { extra })
  }

  /**
   * What `rootClasses` builds from:  an object with one getter per attribute, each calling `classValue()`.
   * - Getters, so `rootClasses` only reacts to the attributes the class names actually use.
   */
  private readonly classInput: E.ClassInput

  /** Build `classInput`, once, in the constructor. */
  private buildClassInput(): E.ClassInput {
    const input: Record<string, unknown> = {}
    for (const { spec } of this.elementDefinition.attributes) {
      Object.defineProperty(input, spec.name, {
        get: () => this.classValue(spec.name as E.AttributeName<V>),
        enumerable: true
      })
    }
    return input
  }

  ////////////////
  // ## CSS states
  ////////////////

  /**
   * Hook:  `:state()`s for the element worked out in code, when no single member can carry one with `@cssState`.
   * - Default none.
   * - Keys are the vocabulary's state names.
   * - Prefer `@cssState("open")` on the member the state follows.
   * - If it throws, the element shows its fallback, as when `render()` throws.
   */
  protected cssStates(): Partial<Record<E.StateName<V>, boolean>> {
    return {}
  }

  ////////////////
  // ## Controlled state
  //
  // A `@controlled` member follows an attribute that the USER can change too (a dropdown's `open`):
  // the page's value when the page set one, else the element's own.
  ////////////////

  /**
   * The user wants to change `@controlled` member `member` to `next`.
   * - First `announce()` sends the event;  it returns false if the page cancelled it.
   * - Then `next` is written to the element's property, unless the event was cancelled,
   *   or the page set the property itself while handling it (the page's value wins).
   * - Returns true when `next` was applied.
   */
  requestChange<K extends keyof this & string>(member: K, next: this[K], announce: () => boolean): boolean {
    return E.Reactive.requestChange(this, member, next, announce)
  }

  /** Is the page controlling `@controlled` member `member` right now, by having set its property? */
  isPageControlled(member: keyof this & string): boolean {
    return E.Reactive.isPageControlled(this, member)
  }

  /**
   * DEPRECATED:  write `@controlled("open") accessor isOpen = false` instead.
   * - The old way to declare a controlled attribute;  only `brand`'s components still use it.
   * - MUST be called from a field initializer or the constructor.
   */
  protected controlled<N extends E.AttributeName<V>>(
    name: N,
    initial: E.AttributeValues<V>[E.CamelCase<N> & keyof E.AttributeValues<V>]
  ): E.Controlled<E.AttributeValues<V>[E.CamelCase<N> & keyof E.AttributeValues<V>]> {
    const { key, property } = this.elementDefinition.attribute(name)
    type Value = E.AttributeValues<V>[E.CamelCase<N> & keyof E.AttributeValues<V>]
    return new E.Controlled<Value>({
      domElement: this.domElement,
      key,
      property,
      value: () => this.attrs[key as keyof E.AttributeValues<V>] as Value | undefined,
      initial
    })
  }

  ////////////////
  // ## Effects
  ////////////////

  /**
   * An effect that writes to the element itself (its ARIA attributes, `internals.role`, `:state()`s).
   * - In a browser:  `createEffect(compute, apply)`.
   * - On the server:  `apply` runs once, right away, so the server-rendered HTML has the element's ARIA.
   *   (The server never runs an effect's `apply` by itself.)
   * - A decorated method gets the same with `@onChange(..., { writesDOMElement: true })`.
   * - MUST be called from the constructor, a field initializer or `onMount()`, like `createEffect`.
   */
  protected domElementEffect<T>(compute: () => T, apply: (value: T) => void) {
    if (isServer) apply(untrack(compute))
    else createEffect(compute, apply)
  }

  ////////////////
  // ## Events
  ////////////////

  /**
   * Listen for event `type` on the element (or on `options.target`), for the element's whole life.
   * - The listener is removed when the element is disposed (`domElement.dispose()`),
   *   NOT when it's moved or disconnected:  the element keeps working after a move.
   * - For a listener that should stop sooner, use your own `AbortController`.
   */
  protected on<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (event: HTMLElementEventMap[K]) => void,
    options?: OnOptions
  ): void
  protected on(type: string, listener: (event: Event) => void, options?: OnOptions): void
  protected on(type: string, listener: (event: Event) => void, { target, ...options }: OnOptions = {}) {
    if (!this.listeners) {
      const listeners = (this.listeners = new AbortController())
      this.domElement.addReleaseCallback(() => listeners.abort())
    }
    ;(target ?? this.domElement).addEventListener(type, listener, { ...options, signal: this.listeners.signal })
  }

  /**
   * Removes every listener `on()` added, all at once.
   * - `on()` adds each listener with this component's `signal`;  aborting it removes them all.
   * - Made by the first `on()`, which also has it aborted when the element is disposed.
   */
  private listeners: AbortController | undefined

  /**
   * Send the vocabulary's event `name` from the element, with `detail`.
   * - It bubbles, and crosses shadow roots.
   * - It's cancelable when the vocabulary says so;  then it returns false if a listener cancelled it.
   * - On a translated tag, the event goes out under that tag's name for it.
   */
  send(name: E.EventName<V>, detail: object): boolean {
    const spec = this.elementDefinition.vocabulary.events.find((event) => event.name === name)
    const event = new CustomEvent(this.elementDefinition.event(name), {
      bubbles: true,
      composed: true,
      cancelable: !!spec?.cancelable,
      detail
    })
    return this.domElement.dispatchEvent(event)
  }

  ////////////////
  // ## Errors and fallback
  //
  // When an element breaks (its constructor, `render()` or an effect throws):
  // - solid-element catches the error (`ISOLATE_ERRORS`) and calls `onError()`, then `renderFallback()`
  // - the element shows a plain-DOM stand-in (a native `<button>`, `<select>` ...):  `elementSetup.Fallback`
  // - the rest of the page keeps working
  ////////////////

  /**
   * An error escaped this element's constructor, `render()` or an effect.
   * - SIDE EFFECTS:
   *   - logs one `console.error` naming the tag
   *   - sends a cancelable `ui-error` event (`{ error }`):  an app that cancels it keeps the fallback away
   *   - resolves `domElement.ready`, and drops this broken object
   * - Called by solid-element, outside Solid's drawing, so it may change state.
   */
  private static onError(domElement: DOMElement, error: unknown) {
    console.error(`<${domElement.localName}> failed:`, error)
    domElement.component = undefined
    domElement.markReady()
    const event = new CustomEvent(E.ERROR_EVENT, { bubbles: true, composed: true, cancelable: true, detail: { error } })
    if (!domElement.dispatchEvent(event)) UIComponent.cancelledElements.add(domElement)
  }

  /**
   * Show the fallback in the shadow root:  `Fallback.render(...)`, or a bare `<slot>` when there's none.
   * - Skipped if the app cancelled `ui-error`.
   * - Done a microtask LATER:  solid-element clears the shadow root after an error, which would wipe it out;
   *   and some fallbacks (the dropdown's) must already be in place to attach their validity messages.
   * - The fallback is disposed with the element.
   * - Called by solid-element after this object broke (or was never built).
   */
  private static renderFallback(
    domElement: DOMElement,
    error: unknown,
    Fallback: FallbackClass | undefined
  ): undefined {
    if (UIComponent.cancelledElements.has(domElement)) return undefined
    queueMicrotask(() => {
      const root = domElement.renderRoot
      const handle = Fallback
        ? Fallback.render({ domElement, root, error, internals: domElement.internals })
        : (root.replaceChildren(domElement.ownerDocument.createElement("slot")), undefined)
      if (handle) domElement.addReleaseCallback(() => handle.dispose())
    })
    return undefined
  }

  /**
   * Elements whose `ui-error` the app cancelled:  they get no fallback.
   * - For the whole page.
   * - Not `readonly`:  `resetRegistries()` replaces it.
   */
  private static cancelledElements = new WeakSet<DOMElement>()

  ////////////////
  // ## Defining the element
  //
  // These are called on the component CLASS, before any element exists:
  // - `define()`:  what a component's `index.ts` calls (`UIButton.define()`),
  //   and what an app calls for a translated tag (`UIButton.define("ie-boton", es)`)
  // - `defineTag()`:  `define()` without its "already defined?" check;  hot reload uses it
  // - `register()`:  the records `defineTag()` starts with;  the server render calls it alone
  ////////////////

  /**
   * Global registry of `ElementDefinition`s of every defined tag, English and translated.
   * - A component uses it to tell what kind of element a child is:
   *   `UIComponent.definitions.get(child.localName)?.vocabulary.noun`.
   * - For the whole page, like `customElements`;  `resetRegistries()` leaves it alone.
   */
  static readonly definitions = new Map<string, E.ElementDefinition>()

  /**
   * Global registry of vocabularies which have been registered.
   * - For the whole page.
   * - NOTE: Not `readonly`, `resetRegistries()` replaces it in tests.
   */
  private static registeredVocabularies = new WeakSet<E.ComponentVocabulary>()

  /**
   * Make this component a custom element, under its vocabulary's tag or a translated one.
   * - `UIButton.define("ie-boton", es)` registers `<ie-boton primario color="rojo">`:
   *   its translated attribute, property and event names all reach the same component.
   * - Does nothing for a tag already defined.
   * - Returns the element class.
   */
  static define(this: UIComponentClass, tag?: string, dictionary?: E.Dictionary): CustomElementConstructor {
    const definition = new E.ElementDefinition(this.prototype.vocabulary, { tag, dictionary })
    return customElements.get(definition.tag) ?? UIComponent.defineTag.call(this, definition)
  }

  /**
   * `define()` without the "already defined?" check.
   * - Records `definition` (`register()`), then hands solid-element the tag, its attributes,
   *   how to build this component, and the class's merged `elementSetup`.
   * - For a tag that's already defined, solid-element swaps the new class in, in place:
   *   that's how hot reload (in development) re-defines an edited class (`HotDefinitions`).
   */
  static defineTag(this: UIComponentClass, definition: E.ElementDefinition): CustomElementConstructor {
    const {
      DOMElement: BaseElement,
      delegatesFocus,
      assignSlots,
      isAFormControl,
      Fallback
    } = UIComponent.setupFor(this)
    UIComponent.register.call(this, definition)
    return customElement(
      definition.tag,
      definition.props,
      (attrs, { element }) => new this(element as unknown as DOMElement, definition, attrs).onMount(),
      {
        BaseElement,
        shadowRootInit: {
          mode: "open",
          delegatesFocus,
          slotAssignment: SlotAssignments[assignSlots]
        },
        internals: true,
        formAssociated: isAFormControl,
        keepAlive: true,
        errorBoundary: UIComponent.ISOLATE_ERRORS,
        onError: (element, error) => UIComponent.onError(element as unknown as DOMElement, error),
        fallback: (element, error) => UIComponent.renderFallback(element as unknown as DOMElement, error, Fallback)
      }
    )
  }

  /**
   * Record `definition` for the page, WITHOUT defining a custom element.
   * - Adds it to `definitions` and to the parts registry (`PartContext.define()`),
   *   hands its vocabulary and English texts to the runtime,
   *   and puts a getter for each attribute on the class (`Reactive.installAttributeGetters()`).
   * - `defineTag()` starts with it;  the server render calls it alone, since node has no `customElements`.
   */
  static register(this: UIComponentClass, definition: E.ElementDefinition) {
    const { vocabulary } = this.prototype
    UIComponent.definitions.set(definition.tag, definition)
    E.PartContext.define({
      vocabulary,
      tag: definition.tag,
      isAPart: UIComponent.setupFor(this).isAPart,
      isConditionalOwner: "isOwnerOf" in this.prototype
    })
    // Hand the vocabulary to the runtime (`UI.vocabulary`), and its English texts to `UI.i18n`:
    // - when the class is DEFINED, not when its first element connects,
    //   so translations can find them before any element exists
    // - the texts are English DEFAULTS for this component only:
    //   any other text registered for the key (an app's own English, a translation) wins,
    //   and two components may use the same key (`label`) for different words
    // - once per vocabulary;  the runtime is loaded first if it hasn't loaded yet
    // - on the server, never loads the runtime (that needs the browser's `CSSStyleSheet`):
    //   it registers only with the one the server render installed (`ServerRuntime`)
    const isRuntimeLoaded = !!(globalThis as E.RuntimeGlobal)[E.RUNTIME_KEY]
    if (!UIComponent.registeredVocabularies.has(vocabulary) && (isRuntimeLoaded || !isServer)) {
      UIComponent.registeredVocabularies.add(vocabulary)
      if (isRuntimeLoaded) handOver()
      else void UI.load().then(handOver)
    }
    E.Reactive.installAttributeGetters(
      this.prototype,
      definition.attributes.map(({ key, spec }) => ({ key, name: spec.name }))
    )

    /** Hand the vocabulary and its English texts to the runtime. */
    function handOver() {
      // on the server, editing a vocabulary makes a new object for the same tag:  replace the old one
      if (isServer) UI.vocabulary.replace(vocabulary)
      else UI.vocabulary.register(vocabulary)
      const texts: Record<string, string> = {}
      for (const { key, text } of vocabulary.texts) texts[key] = text
      UI.i18n.registerDefaults(texts, vocabulary.tag)
    }
  }

  ////////////////
  // ## Reflection
  ////////////////

  /**
   * This component's whole vocabulary, for code that wants to look at it:  `UIButton.describe().topics`.
   * - Tag, attributes (kinds, values, defaults), events, slots, parts, states, texts, descriptions, `topics`, `aka`.
   * - The same object the element itself reads.
   * - Every tag's summary at once:  `ComponentDefinitions` (`src/components/ComponentDefinitions.ts`).
   */
  static describe<T extends { prototype: { vocabulary: E.ComponentVocabulary } }>(
    this: T
  ): T["prototype"]["vocabulary"] {
    return this.prototype.vocabulary
  }

  ////////////////
  // ## Testing
  ////////////////

  /**
   * If one element throws while drawing, show ITS fallback and keep the rest of the page working.
   * - Turn it off only to measure what this protection costs:
   *   `docs/report.md` has the numbers, `test/isolation.test.tsx` shows a page without it.
   * - Read when a tag is defined.
   */
  static ISOLATE_ERRORS = true

  /**
   * For tests:  forget which style sheets, vocabularies and cancelled elements were registered.
   * - Leaves `definitions` alone (a defined tag can't be undefined),
   *   and the runtime's own records (`UI.styles`, `UI.i18n`):  the next element simply registers again.
   */
  static resetRegistries() {
    UIComponent.registeredStyleSheets = new WeakSet()
    UIComponent.registeredVocabularies = new WeakSet()
    UIComponent.cancelledElements = new WeakSet()
  }
}

/** A concrete `UIComponent` subclass, as `define()` sees it. */
export type UIComponentClass = {
  new (domElement: DOMElement, definition: E.ElementDefinition, attrs: any): UIComponent<any>
  prototype: UIComponent<any>
}

/** The options of `UIComponent.on()`:  `addEventListener()`'s, plus where to listen. */
export type OnOptions = Omit<AddEventListenerOptions, "signal"> & {
  /** what to listen on;  default the element itself.  E.g. its shadow root, for `slotchange` */
  target?: EventTarget
}

/** A form control's plain-DOM fallback class (`ButtonFallback` ...), as `renderFallback()` calls it. */
export type FallbackClass = {
  render(props: E.NativeFallbackProps): E.NativeFallbackHandle
}

/**
 * How a class's custom element is set up:  `UIComponent.elementSetup`, merged down the class chain.
 * - Read once, when the tag is defined,
 *   except `isAFormControl` and `canRenderUnstyled`, which each element reads as it's built.
 */
export type ElementSetup = {
  /**
   * Does this element act as a control in an HTML `<form>`?
   * - If so, browser treats the element like an `<input>`:
   *    - its value is sent with the form,
   *    - it takes part in the form's validation and reset, and
   *    - a `<fieldset disabled>` around it disables it (`formIsDisabled`).
   *
   * - `false` by default
   * - `true` for `FormComponent` (inputs, checkboxes, dropdowns ...) and `UIButton`s for submit / reset.
   * - It's the platform's "form-associated custom element" (`static formAssociated`),
   *   which the browser reads once, when the tag is defined.
   */
  isAFormControl: boolean

  /**
   * Does clicking the element move focus to the first focusable thing in its shadow DOM?
   * - Default yes.
   * - An element with nothing focusable inside (`<ui-flag>`) says no.
   * - The platform's `delegatesFocus`, read once, when the tag is defined.
   */
  delegatesFocus: boolean

  /**
   * How the element's children land in the `<slot>`s of its shadow DOM.
   * - `byName` (the default):  each child goes to the slot its `slot` attribute names.
   * - `manually`:  the element itself hands chosen children to chosen slots (`slot.assign()`).
   *   `<ui-accordion>` does, to wrap each title + content pair in its own `<details>`.
   *   A slot it hasn't assigned stays empty.
   * - The platform's `slotAssignment` (`named` / `manual`), read once, when the tag is defined.
   */
  assignSlots: "byName" | "manually"

  /**
   * Is this one of the generic parts other elements are built from?  (`<ui-header>`, `<ui-content>` ...)
   * - A part looks for the element it belongs to by walking up past other parts:
   *   a `<ui-header>` inside a `<ui-content>` inside a `<ui-card>` belongs to the card (`PartContext`).
   * - Default no.
   * - `true` for `PartComponent` (every tag of `ui-parts`),
   *   and for `<ui-item>`, `<ui-list>`, `<ui-menu>` and a feed's `<ui-event>`.
   * - Said, not worked out from `ownsParts`:  `<ui-label>` is owned by a statistic, but isn't a part.
   */
  isAPart: boolean

  /**
   * The class the DOM element itself is made from.
   * - Default `DOMElement`.
   * - `FormComponent` uses `DOMFormControl`, which adds what a form control needs:
   *   `value`, `form`, `checkValidity()` ...
   * - A family with a script API of its own names its `DOM<Name>Element` here (`DOMNagElement`).
   * - Read once, when the tag is defined.
   */
  DOMElement: typeof DOMElement

  /**
   * The plain-DOM stand-in this element shows when it breaks (`UI<Name>.fallback.ts`).
   * - Default none:  a broken element shows a bare `<slot>`, so its children stay visible.
   * - Only form controls have one, so a broken control still submits, validates and resets (`docs/fallback.md`).
   * - It can't use the component:  it runs after the component is gone.
   */
  Fallback: FallbackClass | undefined

  /**
   * Show the content at once, without waiting for the runtime and the style sheets.
   * - Default `false`:  wait until `isReady`, so nothing shows unstyled.
   * - For an element whose content must never wait:  `<ui-root>`, which holds the whole page.
   *   Its `render()` MUST look right unstyled (inline styles only) until `isReady`.
   */
  canRenderUnstyled: boolean
}

/** The platform's `slotAssignment` for each `ElementSetup.assignSlots`. */
const SlotAssignments = {
  byName: "named",
  manually: "manual"
} as const satisfies Record<ElementSetup["assignSlots"], SlotAssignmentMode>
