/*! Derived from `@solidjs/element` and `component-register`:  MIT licence, (c) Ryan Carniato. */
import {
  Errored,
  Show,
  createEffect,
  createRenderEffect,
  createRoot,
  getOwner,
  runWithOwner,
  untrack,
  type Accessor
} from "solid-js"
import { insert, isServer, type JSX } from "@solidjs/web"

// Import directly to avoid circular import
import { protoMerged } from "$/ui/util"
import { E, UI, UIT } from "$/ui/core"
// Import directly to avoid circular import:  `elementSetup`'s initializer reads it
import { DEFAULT_ANIMATION } from "$/ui/components/components.types"
// Import directly to avoid circular import
import { DOMElement, type TagSetup } from "./DOMElement"
import { controlled, cssState, on, onChange, state, untracked } from "./Reactive"
// a leaf of its own (Solid only, no `ui` imports), not part of `E`
import { ShadowEvents } from "./ShadowEvents"

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
 *   For the most part this will be the base `DOMElement` class --
 *   subclasses of `UIComponent` which need extra functionality in the DOM will have a custom `DOMElement` subclass.
 *
 *   The custom element mechanism in the browser "upgrades" `<ui-button>`
 *   from *its* `HTMLElement` to *our* `DOMElement` automatically when we `define()` a component.
 *
 *   `domElement.component` is the link from the DOM back to this class.
 *
 * - **Custom element**:
 *   - the DOM element is the browser's side:  DOM API `connectedCallback()`, the attributes, the shadow root
 *   - this class is Solid's side:  it builds the component, renders it inside its own Solid root,
 *     and catches what it throws (see "Mounting" and "Errors and fallback")
 *
 * - **Lifecycle events** reach the component as methods (`onConnect()`, `onFormReset()` ...):  see "Lifecycle".
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
 *   The decorators (`@state`, `@controlled`, `@derived`, `@cssState`, `@aria`, `@onChange`,
 *   `@whileConnected`, `@watches`, `@on`, `@untracked`) are in `Reactive.ts`.
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
 *   2. The first time the element is "connected" (DOM API `connectedCallback()`), `mount()` builds its component,
 *      then calls `onMount()`, which calls `render()` to return content for the shadow root;  then `onConnect()`
 *   3. The content shows once the runtime (`UI`) has loaded and the class's style sheets are in,
 *      so nothing flashes unstyled -- when the `component.isReady`.
 *   4. Moving the element keeps its component;  it ends only with `domElement.dispose()`
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
 *   - Most settings are keys of ONE object, `elementSetup` (style sheets included), set with `@protoMerged static`:
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
   * - A subclass that uses its DOM element class's own members says which class it is, as a type only:
   *   `declare readonly domElement: DOMFormControl` (`FormComponent`).
   */
  readonly domElement: DOMElement

  /**
   * Built once per element, the first time the element is connected (`UIComponent.mount()`).
   * - Two arguments in a row, not one object:  the server render (`$/ui/static`) builds components the same way.
   * - It runs while Solid is drawing:  don't change state here (see the class docs).
   */
  constructor(domElement: DOMElement, definition: E.ElementDefinition) {
    this.domElement = domElement
    this.elementDefinition = definition
    domElement.component = this
    this.appContext = isServer ? null : UIComponent.appContextFor(domElement)
    this.internalState = { classInput: definition.classInput((name) => this.classValue(name as E.AttributeName<V>)) }
    this.isConnected = isServer || domElement.isConnected
    // the class's constant ARIA, on the server too:  short names (`live`) to `internals` properties (`ariaLive`)
    for (const [name, text] of Object.entries(this.elementSetup.aria) as [E.AriaName, string][])
      domElement.internals[E.AriaNames[name]] = text
    // on the server there are no style sheets to wait for:  draw at once
    this.isReady = isServer || (E.RUNTIME_KEY in globalThis && !!(globalThis as E.RuntimeGlobal)[E.RUNTIME_KEY])
    if (isServer) return
    this.startListeners()
    if (!this.isReady) void UI.load().then(() => this.onRuntimeLoaded())
  }

  ////////////////
  // ## Lifecycle
  //
  // In the order they're called:
  // 1. the constructor (above), on the element's first connect
  // 2. `onMount()`, right after it, which calls `render()`
  // 3. `onConnect()`:  every time the element is added to a page, the first time included
  // 4. `onRuntimeLoaded()`, once, if the runtime (`UI`) wasn't loaded yet:  the content shows then
  // 5. form controls only, as the browser reports them:
  //    `onFormAssociated()`, `onFormDisabled()`, `onFormReset()`, `onFormStateRestore()`
  // 6. `onDisconnect()`:  every time it's removed;  the component stays for the next connect
  //
  // - The DOM element calls 3, 5 and 6 as the browser reports each event
  //   (DOM API `connectedCallback()`, the form callbacks ...).
  // - Each is a hook:  override the ones you need.
  // - The base class's own work is in `onMount()`, `onConnect()`, `onDisconnect()` and `onFormDisabled()`:
  //   an override of those calls `super`.
  ////////////////

  /**
   * Set the element up and return its content, which `mount()` puts into the shadow root.
   * - Called once, by `mount()`, right after the constructor.
   * - SIDE EFFECTS:
   *   - adopts the class's style sheets into the shadow root (if the runtime has loaded)
   *   - keeps the element's `:state()`s in step with its `@cssState` members, `elementSetup.cssStates`
   *     and `cssStates()`;  for a state two classes of the chain name, the subclass's member wins
   *   - starts the `@onChange` and `@whileConnected` methods, the `@aria` members' effect,
   *     and the `@watches` methods' watch
   *   - re-adopts the style sheets when `styleSheetNames` changes
   * - Not in the constructor, because a subclass's fields don't exist yet while the base constructor runs.
   * - Hook:  an override starts its own effects, then returns `super.onMount()`.
   */
  onMount(): JSX.Element {
    if (!isServer && untrack(() => this.isReady)) this.adoptStyleSheets()
    // a RENDER effect, so a getter that throws shows the element's fallback (a plain effect would only log it)
    const decorated = E.Reactive.cssStatesOf(this, this.elementSetup.cssStates)
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
    const { canRenderUnstyled } = this.elementSetup
    // `untrack`:  `<Show>` evaluates its children in a TRACKED computation, so a reactive read in `render()`'s body
    // (outside its JSX) would run it again and rebuild the whole view;  it runs ONCE
    return <Show when={canRenderUnstyled || this.isReady}>{untrack(() => this.render())}</Show>
  }

  /**
   * Hook:  the element was added to a page;  the first time right after `onMount()`.
   * - Keeps `isConnected` in step, a microtask later:
   *   the element may be connected while the app's Solid is drawing, when state can't change yet.
   * - A part re-checks which element it belongs to (`PartContext`).
   * - It may run while Solid is drawing:
   *   defer a state change (`E.afterSolidUpdate()`), or write an `ownedWrite` member.
   */
  onConnect() {
    const { domElement } = this
    E.afterSolidUpdate(() => (this.isConnected = domElement.isConnected))
    E.PartContext.connected(domElement)
  }

  /** The runtime has loaded:  adopt the style sheets, then show the content. */
  private onRuntimeLoaded() {
    this.adoptStyleSheets()
    this.isReady = true
  }

  /** Hook (form controls only):  the element's form owner changed (`null`:  none);  default nothing. */
  onFormAssociated(_form: HTMLFormElement | null) {}

  /**
   * Hook (form controls only):  a `<fieldset disabled>` around the element started or stopped disabling it.
   * - Keeps `formIsDisabled` in step;  a microtask later when it arrives while Solid is drawing.
   */
  onFormDisabled(disabled: boolean) {
    if (getOwner()) E.afterSolidUpdate(() => (this.formIsDisabled = disabled))
    else this.formIsDisabled = disabled
  }

  /** Hook (form controls only):  the form was reset:  restore the starting value;  default nothing. */
  onFormReset() {}

  /**
   * Hook (form controls only):  the browser restored a value (back / forward cache, autofill);  default nothing.
   * - `mode`:  `"restore"` or `"autocomplete"`.
   */
  onFormStateRestore(_state: File | string | FormData | null, _mode: string) {}

  /** Hook:  the element was removed from its page.  The component stays, for the next connect. */
  onDisconnect() {
    const { domElement } = this
    E.afterSolidUpdate(() => (this.isConnected = domElement.isConnected))
  }

  ////////////////
  // ## Element setup
  ////////////////

  /**
   * Class setting:  how the class's custom element is set up, as ONE object (`ElementSetup` documents each key):
   * its style sheets, the `:state()`s that mirror an attribute, form control, focus, slots, part, DOM element class,
   * fallback, unstyled first paint, whether it's a root, ARIA,
   * and what the shared `disabled`, `loading`, `visible` and `animation` do for it.
   * - A subclass states only the keys it changes:
   *   `@E.protoMerged static elementSetup = { delegatesFocus: false } satisfies Partial<E.ElementSetup>`
   *   (`satisfies`, so a misspelt key fails TypeScript).
   * - Each class's object is chained to its base class's (`@protoMerged`):
   *   a key it doesn't state is read from the base's, so
   *   `CheckControl`'s `{ DOMElement: DOMCheckElement }` keeps the `{ isAFormControl: true }` of `FormComponent`.
   * - Read keys by name (`this.elementSetup.styleSheets`, `Class.prototype.elementSetup` outside an instance):
   *   a spread or `Object.keys()` of the whole object sees only its own class's keys.
   * - Key by key:  a key a subclass states replaces its base's whole,
   *   so a subclass's `styleSheets` replace its base's;  spread the base's to add to them
   *   (`styleSheets: { ...UISection.prototype.elementSetup.styleSheets, panel: panelCSS }`).
   * - `vocabulary` stays a setting of its own.
   */
  declare elementSetup: E.ElementSetup
  @protoMerged static elementSetup: Partial<E.ElementSetup> = {
    styleSheets: {},
    cssStates: [],
    isAFormControl: false,
    delegatesFocus: true,
    slotAssignment: "named",
    isAPart: false,
    DOMElement: DOMElement,
    Fallback: undefined,
    canRenderUnstyled: false,
    root: false,
    aria: {},
    disabled: "unusable",
    loading: "loader",
    visible: "shown",
    animation: DEFAULT_ANIMATION
  }

  ////////////////
  // ## AppContext
  ////////////////

  /**
   * The value an app handed its `ui-*` elements;  `null` when none:
   * the `appContext` property of the nearest root around this element (crossing shadow roots):
   * a `<ui-root>`, or any other root (`elementSetup.root`:  `<spell-app>`).
   * - `<ui-root prop:appContext={value}>` in a Solid app, `root.appContext = value` anywhere else.
   * - Read once, when this object is built.
   * - Why not a Solid context:  each element draws in a Solid root of its own, with no parent,
   *   so a Solid app's providers don't reach inside `ui-*` tags (epic `spell-element`, Q9).
   * - `tools/frameworks/solid/identity.js` uses it to prove an app's value reaches inside custom elements.
   */
  readonly appContext: unknown

  /** The `appContext` of the nearest root around `domElement` (a translated tag too), else `null`. */
  private static appContextFor(domElement: DOMElement): unknown {
    let node: Node | null = domElement.parentNode
    while (node) {
      const { localName } = node as Element
      if (localName && UIComponent.isRootTag(localName)) return (node as AppContextHolder).appContext ?? null
      // a shadow root (nodeType 11) continues at its host;  NEVER read `host` elsewhere (`<a>.host` is a URL part)
      node = node.parentNode ?? (node.nodeType === 11 ? (node as ShadowRoot).host : null)
    }
    return null
  }

  /**
   * Is `localName` a root's tag?  One whose class says `elementSetup.root` (`<ui-root>`, a translation of it,
   * `<spell-app>`), or `<ui-root>` before its family has loaded:  an app may set its `appContext` that early.
   */
  private static isRootTag(localName: string): boolean {
    return localName === ROOT_TAG || UIComponent.rootTags.has(localName)
  }

  /** Every defined tag whose class says `elementSetup.root`:  `register()` adds them.  Page-wide. */
  private static readonly rootTags = new Set<string>()

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
   * - Tracked:  JSX or an effect that reads `attributes["aria-label"]` runs again when that attribute changes.
   * - Protected:  outside code reads the element's own attributes.
   */
  protected get attributes(): Readonly<Record<string, string | null>> {
    const { elementDefinition } = this
    return E.Reactive.attributesOf(this, this.domElement, (name) => elementDefinition.localAttribute(name))
  }

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

  ////////////////
  // ## Readiness
  ////////////////

  /**
   * Is the element in the document?
   * - Updated a microtask after it connects or disconnects:
   *   that can happen while the app's Solid is drawing, when state can't change yet.
   */
  @state accessor isConnected = false

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
    if (isReady) E.afterSolidUpdate(() => this.domElement.markReady())
  }

  ////////////////
  // ## StyleSheets
  //
  // The component's own sheets are a key of its setup, `elementSetup.styleSheets` (`ElementSetup` documents it).
  ////////////////

  /**
   * Hook:  the names of the `elementSetup.styleSheets` to adopt right now, in order.
   * - Default:  all of them.
   * - Override it when the sheets depend on where the element sits:
   *   a `<ui-label>` inside a `<ui-statistic>` adds `UIParts.css`.
   * - The shadow root re-adopts when it changes.
   * - The server render reads it too, to scope each sheet to the elements that use it.
   */
  get styleSheetNames(): string[] {
    return Object.keys(this.elementSetup.styleSheets)
  }

  /** Register this class's sheets with the runtime (the ones it doesn't have yet), then adopt them into the shadow root. */
  @untracked
  private adoptStyleSheets() {
    UI.styles.registerOnce(this.elementSetup.styleSheets)
    UI.styles.adoptInto(this.domElement.renderRoot, this.styleSheetNames)
  }

  ////////////////
  // ## Shared states:  disabled, loading
  //
  // Every element takes `disabled` and `loading`, though its vocabulary may not name them
  // (`SharedVocabulary`), and the platform's own `inert`:
  // - `disabled`:  `:state(disabled)` always;  the rest per family (`elementSetup.disabled`):
  //   by default unusable, with everything inside inert
  // - `loading`:  `:state(loading)` always;  by default a loader over it (`elementSetup.loading`)
  // - `inert` is the platform's, unstyled
  // - `visible`, `hidden` and `animation`:  "Shown or hidden", below
  ////////////////

  /**
   * Is `disabled` set:  its attribute, or (a form control) a `<fieldset disabled>` around it?
   * - `:state(disabled)` follows it, whatever disabled means for the family.
   * - Not `isDisabled`:  an element whose disabled is only a look (`<ui-icon>`) is marked disabled, yet usable.
   */
  @cssState("disabled")
  get isMarkedDisabled(): boolean {
    return E.Reactive.attributeValue(this, "disabled") === true || this.formIsDisabled
  }

  /**
   * Hook:  is the element unusable right now?
   * - Default:  `isMarkedDisabled`, where `elementSetup.disabled` is `"unusable"`;  never where it's `"its own"`.
   * - While it's true, the DOM element swallows clicks (`DOMElement`).
   * - A family whose disabled is unusable ITS own way says so here:
   *   the form controls (`FormComponent`), `<ui-button>`, `<ui-step>`, `<ui-item>` ...
   */
  get isDisabled(): boolean {
    return this.elementSetup.disabled === "unusable" && this.isMarkedDisabled
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

  /**
   * Is `loading` set?
   * - `:state(loading)` follows it, whatever loading means for the family.
   * - `true` only:  `<ui-root loading="Fetching…">` is a message, and its own (`elementSetup.loading`).
   */
  @cssState("loading")
  get isMarkedLoading(): boolean {
    return E.Reactive.attributeValue(this, "loading") === true
  }

  /**
   * Is the base class drawing its loader over the element (`elementSetup.loading` is `"loader"`)?
   * - `:state(busy)`, which `reset.css` draws a spinner for.
   */
  @cssState("busy")
  get showsLoader(): boolean {
    return this.elementSetup.loading === "loader" && this.isMarkedLoading
  }

  /**
   * Is everything inside the element inert right now, the base class's way?
   * - `:state(dimmed)`, which `reset.css` dims.
   * - Disabled where `elementSetup.disabled` is `"unusable"`, or loading where `elementSetup.loading` is `"loader"`.
   * - Inert:  its shadow content (and so what's slotted into it) can't be clicked, focused or typed in,
   *   and leaves the accessibility tree.
   */
  @cssState("dimmed")
  get hasInertContent(): boolean {
    return (this.elementSetup.disabled === "unusable" && this.isMarkedDisabled) || this.showsLoader
  }

  /**
   * A shared state changed (ONE effect for all of them, as every element has it):
   * - ARIA on the DOM element, its content inert or not,
   *   and focus inside moves on to the next focusable element.
   * - ARIA only where the base class owns that state:
   *   a family with a disabled or loading of its own sets its own.
   * - Inert from ALL of them at once (`hasInertContent`:  disabled the base class's way, or its loader);
   *   and it clears only the boxes IT made inert, so a family's own (`<ui-form loading>`'s veil) stays (I10).
   * - On a server:  the ARIA only, once.
   */
  @onChange("hasInertContent", "isDisabled", "showsLoader", "isReady", { writesDOMElement: true })
  protected onSharedStatesChanged(
    hasInertContent: boolean,
    isDisabled: boolean,
    showsLoader: boolean,
    isReady: boolean
  ) {
    const { domElement, elementSetup, internalState } = this
    if (elementSetup.disabled === "unusable") domElement.internals.ariaDisabled = isDisabled ? "true" : null
    if (elementSetup.loading === "loader") domElement.internals.ariaBusy = showsLoader ? "true" : null
    if (isServer || !isReady) return
    if (!hasInertContent) {
      // never touch the content of an element that was never inert:  most never are
      for (const box of internalState.madeInert ?? []) box.inert = false
      internalState.madeInert = undefined
      return
    }
    UI.focus.moveOutOf(domElement)
    const madeInert = (internalState.madeInert ??= [])
    for (const child of domElement.renderRoot.children) {
      const box = child as HTMLElement
      if (box.inert) continue
      box.inert = true
      madeInert.push(box)
    }
  }

  ////////////////
  // ## Shown or hidden:  visible, hidden, animation
  //
  // `visible` and the platform's `hidden` are ONE fact, opposites;  the DOM element keeps the two names in step
  // (`DOMElement`, "Shown or hidden"), and this class runs each change:
  // - `isVisible` is the fact, controlled;  `elementSetup.visible` what it is when the page writes neither name
  // - a change runs `onVisibleChange()` with `animationToRun`:  by default on the shadow root's top-level boxes;
  //   a family overrides it to show and hide its own way (a dialog's `showModal()` / `close()`)
  // - while a hide runs, `:state(hiding)` keeps the element on screen (`reset.css`);  `:state(hidden)` once it ends
  // - at once before the element first draws, and wherever motion is off (`animation="none"`, reduced motion)
  ////////////////

  /**
   * Is the element shown?  `el.visible`, which is always `!el.hidden`.
   * - Controlled:  `this.isVisible = false` hides it, as `el.visible = false` or `el.hidden = true` do.
   * - A person's action asks first, with an event the page may cancel:
   *   `this.requestChange("isVisible", false, () => this.send("ui-close", { visible: false }))`.
   * - What it is when the page writes neither name:  `elementSetup.visible`.
   */
  @controlled("visible")
  accessor isVisible = true

  /**
   * Hidden, once its animation has run:  `:state(hidden)`.
   * - What hides it is the `hidden` attribute (`reset.css`):  this state is for a family's own CSS
   *   (`:host(:not(:state(hidden)))`, "shown or on its way out").
   */
  @cssState("hidden")
  get isHidden(): boolean {
    return !this.isVisible && !this.isHiding
  }

  /**
   * Is a hide running right now?  `:state(hiding)`:
   * the `hidden` attribute is already set, and `reset.css` keeps the element on screen until it ends.
   */
  @cssState("hiding")
  @state
  accessor isHiding = false

  /**
   * The animation `visible` / `hidden` run right now:  the first of these that applies.
   * 1. `"none"` when motion is off:  the element's own `animation="none"`;  `none` from around it
   *    (`--ui-motion: none`, which `<ui-root animation="none">`, any element's `animation="none"` or a page's CSS sets);
   *    or the person's reduced-motion setting.  So an element inside can't turn motion back on.
   * 2. the element's own `animation` (`<ui-modal animation="fly down">`, `el.animation = "scale"`)
   * 3. its family's default, `elementSetup.animation`, which is `"fade"` unless the family says otherwise
   * - Untracked:  read as a change runs, never followed.
   */
  @untracked
  get animationToRun(): UIT.Animation {
    const own = E.Reactive.attributeValue(this, "animation") as UIT.Animation | undefined
    if (own === UIT.NO_ANIMATION || this.isMotionOff) return UIT.NO_ANIMATION
    return own ?? this.elementSetup.animation
  }

  /**
   * Is the element's own `animation` `none`?  `:state(still)`:
   * `reset.css` sets `--ui-motion: none` on it, which everything inside inherits (a translated tag's too).
   */
  @cssState("still")
  get isStill(): boolean {
    return E.Reactive.attributeValue(this, "animation") === UIT.NO_ANIMATION
  }

  /**
   * Is motion off around the element:  `--ui-motion: none` reaching it, or the person's reduced-motion setting?
   * - Read from the element's computed style:  custom properties pass into shadow roots, so every element below sees it.
   */
  private get isMotionOff(): boolean {
    if (UI.browser.isReducedMotion) return true
    const { domElement } = this
    if (!domElement.isConnected) return false
    return getComputedStyle(domElement).getPropertyValue(UIT.MOTION_PROPERTY).trim() === UIT.NO_ANIMATION
  }

  /**
   * Hook:  show or hide what the element draws, as `visible` changes;  resolves once it's done.
   * - `animation`:  the one to run (Fomantic's name, `"fade up"`), or `"none"`:  at once.
   *   - `"none"` when the element first draws, so nothing animates in as a page loads;
   *     and wherever motion is off (`animationToRun`).
   *   - An attention animation (`shake`) shows and hides at once too.
   * - While a hide runs, the element stays on screen (`:state(hiding)`);  it's hidden once the promise settles.
   * - Default:  `animation` in or out on the boxes at the top of the shadow root, through `UI.transitions`.
   *   - Why not the element:  most `ui-*` DOM elements are `display: contents`, with no box of their own.
   *   - An element whose shadow root is only a `<slot>` shows and hides at once.
   * - Override it to show and hide your own way (a dialog's `showModal()` / `close()`);
   *   called once the element first draws, then on each change.
   *   A later change may start before this one ends:  check `isVisible` before acting late.
   * - MUST NOT throw:  a throw is logged, and the change just ends.
   */
  protected async onVisibleChange(visible: boolean, animation: UIT.Animation): Promise<void> {
    const { internalState } = this
    // a box the family hides itself (`hidden` on it) is left alone;  one an earlier hide animated out comes back
    const animatedOut = internalState.animatedOut ?? []
    const boxes = [...this.domElement.renderRoot.children].filter(
      (child): child is HTMLElement =>
        child.localName !== "slot" && (!(child as HTMLElement).hidden || animatedOut.includes(child as HTMLElement))
    )
    internalState.animatedOut = undefined
    if (animation === UIT.NO_ANIMATION || UIT.AnimationLookup.isAttention(animation)) {
      if (visible) for (const box of boxes) UI.transitions.reveal(box)
      return
    }
    if (!visible) internalState.animatedOut = boxes
    const name = UIT.AnimationLookup.runtimeNameFor(animation)
    const direction = visible ? UIT.IN : UIT.OUT
    await Promise.all(boxes.map((element) => UI.transitions.animate({ element, name, direction })))
  }

  /**
   * `visible` changed, or the element first drew:  run `onVisibleChange()`.
   * - The first time (once `isReady`) with `"none"`;  then with `animationToRun`.
   */
  @onChange("isVisible", "isReady")
  protected onVisibleOrReadyChanged(isVisible: boolean, isReady: boolean) {
    if (!isReady) return
    const { internalState } = this
    const isFirst = internalState.wasVisible === undefined
    if (!isFirst && internalState.wasVisible === isVisible) return
    internalState.wasVisible = isVisible
    void this.runVisibleChange(isVisible, isFirst ? UIT.NO_ANIMATION : this.animationToRun)
  }

  /**
   * Run `onVisibleChange()`, with `:state(hiding)` on while a hide animates;  a later run takes over.
   * - NEVER throws:  a hook that throws is logged, and the change ends.
   */
  private async runVisibleChange(visible: boolean, animation: UIT.Animation) {
    const { internalState } = this
    const run = (internalState.visibleRun = (internalState.visibleRun ?? 0) + 1)
    this.isHiding = !visible && animation !== UIT.NO_ANIMATION
    try {
      await this.onVisibleChange(visible, animation)
    } catch (error) {
      E.Warnings.warn(`<${this.domElement.localName}>.onVisibleChange()`, "failed;  the change ends here", error)
    }
    if (internalState.visibleRun === run) this.isHiding = false
  }

  ////////////////
  // ## Classes
  ////////////////

  /**
   * The `class` of the top box in the element's shadow DOM, in Fomantic's class names:  `ui small primary button`.
   * - Built from the attributes (through `classValue()`), then `extraClass`, then the noun (`classNoun`).
   */
  get rootClass(): string {
    const { extraClass: extra, classNoun: noun } = this
    return this.elementDefinition.builder.build(this.internalState.classInput, { extra, noun })
  }

  /**
   * Hook:  classes to add just before the noun;  default none.
   * - `UIButton`'s adds `icon` to a button that shows only an icon (`ui primary button` => `ui primary icon button`):
   *   ```ts
   *   protected get extraClass(): string | undefined {
   *     if (!this.hasIcon || this.animated) return undefined
   *     return !this.hasText ? UIT.ICON_CLASS : undefined
   *   }
   *   ```
   * - For a class that follows STATE rather than one attribute;
   *   a class that follows an attribute comes from the vocabulary (`classValue()`).
   */
  protected get extraClass(): string | undefined {
    return undefined
  }

  /**
   * Hook:  the last class word;  default the vocabulary's `noun`.
   * - For an element Fomantic draws as ANOTHER noun:
   *   `<ui-tab>`'s pane is a segment (`ui bottom attached tab segment`),
   *   so `UITab` says `segment` here, and `tab` in `extraClass`.
   */
  protected get classNoun(): string | undefined {
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
  protected wrapperClass(values: Partial<Record<E.AttributeName<V>, unknown>>, extra?: string): string {
    return this.elementDefinition.builder.build(values, { extra })
  }

  /** What only this class uses inside:  ONE field, so it adds one name to the component, not many (`InternalState`). */
  private readonly internalState: InternalState

  ////////////////
  // ## CSS states
  ////////////////

  /**
   * Hook:  `:state()`s for the element worked out in code, when no single member can carry one with `@cssState`.
   * - Default none.
   * - Keys are the vocabulary's state names.
   * - Prefer `@cssState("open")` on the member the state follows.
   * - Not `elementSetup.cssStates`, the list of states that only mirror an attribute:  same name, another thing.
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
   * The user wants to change the `@controlled` accessor named `memberName` to `next`:
   * `this.requestChange("isOpen", true, () => this.send("ui-open", { open: true }))`.
   * - `memberName`:  the name of an accessor ON THIS COMPONENT
   *   (`isOpen`, declared `@controlled("open") accessor isOpen`),
   *   not the DOM element's property (`open`), which it follows.
   * - First `announce()` sends the event;  it returns false if the page cancelled it.
   * - Then `next` is written to the element's property, unless the event was cancelled,
   *   or the page set the property itself while handling it (the page's value wins).
   * - Returns true when `next` was applied.
   */
  requestChange<K extends keyof this & string>(memberName: K, next: this[K], announce: () => boolean): boolean {
    return E.Reactive.requestChange(this, memberName, next, announce)
  }

  /**
   * Is the `@controlled` accessor named `memberName` (`"value"`) reading the PAGE's value right now,
   * rather than the element's own?
   * - A `@controlled` accessor reads its attribute's value when the page gave it one, else its own starting value.
   *   Take a dropdown's `value`:
   *   - `<ui-dropdown>`, `value` never set:  `this.value` is the element's own;  `isControlledByPage("value")` is false
   *   - `<ui-dropdown value="b">`, or `dropdown.value = "b"` from a framework:  `this.value` is the page's `"b"`;  true
   * - So:  true while the attribute's value isn't `undefined`.
   * - What it's for:  the dropdown, select and search keep the page's starting value, to restore on a form reset.
   */
  isControlledByPage(memberName: keyof this & string): boolean {
    return E.Reactive.isControlledByPage(this, memberName)
  }

  ////////////////
  // ## Events
  ////////////////

  /**
   * Listen for event `type` on the element (or on `options.target`), for the element's whole life.
   * - The listener is removed when the element is disposed (`domElement.dispose()`),
   *   NOT when it's moved or disconnected:  the element keeps working after a move.
   * - A method listening from the start is `@E.on("command") onCommand(event)` instead:
   *   the constructor adds it through `on()`, and it runs untracked.
   *   Call `on()` itself for a listener added later, or under a condition.
   * - For a listener that should stop sooner, use your own `AbortController`;  for one call only, `{ once: true }`.
   */
  protected on<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (event: HTMLElementEventMap[K]) => void,
    options?: E.OnOptions
  ): void
  protected on(type: string, listener: (event: Event) => void, options?: E.OnOptions): void
  protected on(type: string, listener: (event: Event) => void, { target, ...options }: E.OnOptions = {}) {
    const listeners = (this.internalState.listeners ??= UIComponent.abortedOnDispose(this.domElement))
    ;(target ?? this.domElement).addEventListener(type, listener, { ...options, signal: listeners.signal })
  }

  /**
   * An `AbortController` aborted when `domElement` is disposed:  `on()`'s, for every listener it adds.
   * - How:  the DOM's own way to remove listeners in a group (DOM API `addEventListener(type, listener, { signal })`,
   *   in every browser since 2021, nothing to do with Solid).
   * - Each `on()` passes its `signal`;  `abort()` removes every listener added with it, so nothing keeps a list.
   */
  private static abortedOnDispose(domElement: DOMElement): AbortController {
    const listeners = new AbortController()
    domElement.addReleaseCallback(() => listeners.abort())
    return listeners
  }

  /**
   * Add the class's `@on` methods as listeners, base class first, through `on()`:  constructor only, in a browser.
   * - Each looks its method up when the event comes, and runs it inside `untrack()`.
   */
  private startListeners() {
    const self = this as unknown as Record<PropertyKey, (event: Event) => unknown>
    for (const { method, type, options } of E.Reactive.listenersOf(this)) {
      const target = options.target && this.domElement[options.target]
      this.on(type, (event) => untrack(() => self[method]!(event)), { ...options, target })
    }
  }

  /** A slot's content changed:  the parts in it may belong to another element now (`PartContext`). */
  @on("slotchange", { target: "renderRoot" })
  protected onSlotChangeForParts(event: Event) {
    E.PartContext.slotChanged(event.target as HTMLSlotElement)
  }

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
  // ## Mounting
  ////////////////

  /**
   * Build `Class`'s component for `domElement` and draw it into its shadow root:
   * what the DOM element's first connect does (`TagSetup.mountComponent`).
   * - In a Solid root of its OWN, with no parent:  it lives until `domElement.dispose()`, whatever happens around it.
   *   So a Solid app's context doesn't reach inside (`appContext` does that).
   * - Inside an error net (Solid's `<Errored>`), always:  see "Errors and fallback".
   * - Released with the DOM element:  the root is disposed, the shadow root emptied.
   */
  private static mount(
    Class: E.UIComponentClass,
    definition: E.ElementDefinition,
    domElement: DOMElement,
    Fallback: E.FallbackClass | undefined
  ) {
    createRoot((dispose) => {
      const root = domElement.renderRoot
      domElement.addReleaseCallback(() => {
        ShadowEvents.unregister(root)
        root.textContent = ""
        dispose()
      })
      // `<Errored>` called as a function;  `children` is a GETTER, so the component is built inside the net
      const view = Errored({
        get children() {
          return untrack(() => new Class(domElement, definition).onMount())
        },
        fallback: (error: Accessor<unknown>) => {
          const cause = error()
          const showsFallback = runWithOwner(null, () => UIComponent.onError(domElement, cause))
          return showsFallback ? UIComponent.renderFallback(domElement, cause, Fallback) : undefined
        }
      })
      domElement.clearServerContent()
      ShadowEvents.register(root)
      insert(root, view)
    })
  }

  ////////////////
  // ## Errors and fallback
  //
  // When an element breaks (its constructor, `render()` or an effect throws):
  // - its error net (`mount()`) catches the error and calls `onError()`, then `renderFallback()`
  // - the element shows a plain-DOM stand-in (a native `<button>`, `<select>` ...):  `elementSetup.Fallback`
  // - the rest of the page keeps working
  //
  // Every element has its own net, always:
  // - without one, an error halts Solid for the whole page (`[REACTIVITY_HALTED]`)
  // - a container's net can't catch it instead:  each element's Solid root has no parent (epic `spell-element`, Q8)
  ////////////////

  /**
   * An error escaped this element's constructor, `render()` or an effect.
   * - SIDE EFFECTS:
   *   - DOM API `:state(errored)` on the element
   *   - logs one `console.error` naming the tag
   *   - sends a cancelable `ui-error` event (`{ error }`):  an app that cancels it keeps the fallback away
   *   - resolves `domElement.ready`, and drops this broken object
   * - Returns whether the element shows its fallback:  false when the app cancelled `ui-error`.
   * - Called outside Solid's drawing (`runWithOwner(null)`), so it may change state.
   */
  private static onError(domElement: DOMElement, error: unknown): boolean {
    domElement.setState(E.ERRORED_STATE, true)
    console.error(`<${domElement.localName}> failed:`, error)
    domElement.component = undefined
    domElement.markReady()
    const event = new CustomEvent(E.ERROR_EVENT, { bubbles: true, composed: true, cancelable: true, detail: { error } })
    return domElement.dispatchEvent(event)
  }

  /**
   * Show the fallback in the shadow root:  `Fallback.render(...)`, or a bare `<slot>` when there's none.
   * - Done a microtask LATER:  Solid clears what the broken render had inserted, which would wipe it out;
   *   and some fallbacks (the dropdown's) must already be in place to attach their validity messages.
   * - The fallback is disposed with the element.
   * - Called by the error net (`mount()`) after this object broke (or was never built).
   */
  private static renderFallback(
    domElement: DOMElement,
    error: unknown,
    Fallback: E.FallbackClass | undefined
  ): undefined {
    E.afterSolidUpdate(() => {
      const root = domElement.renderRoot
      const handle = Fallback
        ? Fallback.render({ domElement, root, error, internals: domElement.internals })
        : (root.replaceChildren(domElement.ownerDocument.createElement("slot")), undefined)
      if (handle) domElement.addReleaseCallback(() => handle.dispose())
    })
    return undefined
  }

  ////////////////
  // ## Defining the element
  //
  // These are called on the component CLASS, before any element exists:
  // - `define()`:  what a component's `index.ts` calls (`UIButton.define()`),
  //   and what an app calls for a translated tag (`UIButton.define("ie-boton", es)`)
  // - `register()`:  the records `define()` starts with;  the server render calls it alone
  // - `tagSetupFor()`:  what the tag's DOM element class carries;  hot reload swaps it in (`HotDefinitions`)
  ////////////////

  /** What the whole page has defined, like `customElements`:  ONE record, for every component class. */
  static readonly registry: E.ComponentRegistry = {
    definitions: new Map(),
    vocabularies: new WeakSet()
  }

  /**
   * Make this component a custom element, under its vocabulary's tag or a translated one.
   * - `UIButton.define("ie-boton", es)` registers `<ie-boton primario color="rojo">`:
   *   its translated attribute, property and event names all reach the same component.
   * - Does nothing for a tag already defined.
   * - Returns the element class.
   * - throws a `TypeError` on a name in `elementSetup.cssStates` the tag has no attribute or member for (a typo)
   */
  static define(this: E.UIComponentClass, tag?: string, dictionary?: E.Dictionary): CustomElementConstructor {
    const definition = new E.ElementDefinition(this.prototype.vocabulary, { tag, dictionary })
    const existing = customElements.get(definition.tag)
    if (existing) return existing
    // record it, make the tag's own DOM element class on `elementSetup.DOMElement`, and define it (DOM API)
    UIComponent.register.call(this, definition)
    // after `register()`, which puts each attribute's getter on the prototype
    const strays = this.prototype.elementSetup.cssStates.filter((state) => !(E.camelCase(state) in this.prototype))
    if (strays.length) {
      throw new TypeError(
        `UIComponent.define():  <${definition.tag}>'s elementSetup.cssStates names ${strays.join(", ")}, ` +
          "which it has no attribute or member for;  fix the name, or give the class that member"
      )
    }
    const Class = DOMElement.subclassForTag(
      this.prototype.elementSetup.DOMElement,
      UIComponent.tagSetupFor(this, definition)
    )
    customElements.define(definition.tag, Class)
    return Class
  }

  /**
   * What the DOM element class of `definition`'s tag carries, for component class `Class`:
   * its definition, shadow root options, whether it's a form control, and how to build its component.
   */
  static tagSetupFor(Class: E.UIComponentClass, definition: E.ElementDefinition): TagSetup {
    const { delegatesFocus, slotAssignment, isAFormControl, Fallback, visible } = Class.prototype.elementSetup
    return {
      elementDefinition: definition,
      shadowRootInit: { mode: "open", delegatesFocus, slotAssignment },
      isAFormControl,
      visible,
      mountComponent: (domElement) => UIComponent.mount(Class, definition, domElement, Fallback)
    }
  }

  /**
   * Record `definition` for the page, WITHOUT defining a custom element.
   * - Adds it to `registry.definitions` and to the parts registry (`PartContext.define()`),
   *   hands its vocabulary and English texts to the runtime,
   *   and puts a getter for each attribute on the class (`Reactive.installAttributeGetters()`).
   * - `define()` starts with it;  the server render calls it alone, since node has no `customElements`.
   */
  static register(this: E.UIComponentClass, definition: E.ElementDefinition) {
    const { vocabulary } = this.prototype
    UIComponent.registry.definitions.set(definition.tag, definition)
    if (this.prototype.elementSetup.root) UIComponent.rootTags.add(definition.tag)
    E.PartContext.define({
      vocabulary,
      tag: definition.tag,
      isAPart: this.prototype.elementSetup.isAPart,
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
    if (!UIComponent.registry.vocabularies.has(vocabulary) && (isRuntimeLoaded || !isServer)) {
      UIComponent.registry.vocabularies.add(vocabulary)
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
}

/** An element holding an app's value for the `ui-*` elements inside it:  a root (`UIComponent.appContext`). */
type AppContextHolder = Element & { appContext?: unknown }

/** `<ui-root>`'s tag:  a root even before its family loads (`UIComponent.isRootTag()`). */
const ROOT_TAG = "ui-root"

/** `UIComponent.internalState`:  what only the base class uses inside. */
type InternalState = {
  /** what `rootClass` builds from:  one getter per attribute, each calling `classValue()` (`ElementDefinition.classInput()`) */
  readonly classInput: E.ClassInput
  /** aborted when the element is disposed, removing every listener `on()` added;  made by the first `on()` */
  listeners?: AbortController
  /** the boxes the shared states made inert (disabled or loading), the only ones they clear again */
  madeInert?: HTMLElement[]
  /** `isVisible` as `onVisibleChange()` last ran with it;  `undefined` before the element first drew */
  wasVisible?: boolean
  /** counts `onVisibleChange()` runs, so only the latest ends the hiding */
  visibleRun?: number
  /** the boxes the default `onVisibleChange()` last animated out (which `UI.transitions` left `hidden`) */
  animatedOut?: HTMLElement[]
}
