/*! Derived from `@solidjs/element` and `component-register`:  MIT licence, (c) Ryan Carniato. */
import type { E } from "$/ui/core"

/**
 * `HTMLElement`, or a stand-in outside a browser, so modules that define DOM elements can be IMPORTED during SSR
 * (the classes are never constructed there).
 * - Module-level, not a static:  the `extends` clause below reads it while the class is being defined.
 */
const HTMLElementOrShim = (globalThis.HTMLElement ?? class {}) as typeof HTMLElement

/****************
 * ### `DOMElement`
 * The base class of every Spell UI DOM element:  the `<ui-button>` in the page, with its attributes,
 * properties and events.  As the platform's `<a>` is an `HTMLAnchorElement`, a `<ui-button>` is a `DOMElement`.
 *
 * - Its COMPONENT (a `UIComponent` subclass, `UIButton`) holds the state and draws the shadow DOM:
 *   `domElement.component` points at it, `component.domElement` back here.
 *   The component is built the first time the element connects, and lives across moves, until `dispose()`d.
 *
 * - This class is the browser's side of a custom element.
 *   Names marked "DOM API" are the browser's, from `HTMLElement` and the custom-element spec, not ours:
 *   - DOM API:  `connectedCallback()` (added to a page)
 *   - DOM API:  `disconnectedCallback()` (removed)
 *   - DOM API:  `attributeChangedCallback()` (an attribute changed)
 *   - DOM API:  `static observedAttributes`
 *   - DOM API:  `attachInternals()`, kept as `internals` (custom states, ARIA defaults, forms)
 *   - DOM API:  `attachShadow()`, the shadow root the component draws into (`renderRoot`)
 *   - DOM API:  `static formAssociated` and the four form callbacks, on form controls
 * - Ours:
 *   - `attributeValues`:  each attribute's normalized value, from its text or a property write
 *   - a property per attribute (`button.size = "large"`), and writing it back to the attribute ("reflection")
 *   - properties a page set before the tag was defined, kept ("the upgrade step")
 *   - the `ready` promise, custom states, the link to the component, swallowing clicks while disabled
 * - Each tag gets its OWN subclass, made by `UIComponent.define()` (`DOMElement.subclassForTag()`):
 *   its `tagSetup` says which attributes it has and how to build its component (see "The tag", at the end).
 *
 * - A family adds its own script API in a subclass, `DOM<Name>Element` (`DOMNagElement`):
 *   `elementSetup.DOMElement` names it.
 * - NOTE: a member named like a property an attribute gets is refused when the tag is defined
 *   (one error naming each clash):  never add one a vocabulary attribute could be called.
 * - Knows its component only by type:  `UIComponent` imports this file, never the other way round.
 * - From solid-element's element class (its fixes 2, 4, 5, 6 and 9), folded in (epic `spell-element`, P2).
 ****************/
export class DOMElement extends HTMLElementOrShim {
  ////////////////
  // ## The element
  ////////////////

  /** This element's component;  `undefined` until it first connects, and again once it broke. */
  component?: E.UIComponent<any>

  /** DOM API:  `attachInternals()`, attached in the constructor:  custom states, ARIA defaults, forms. */
  readonly internals: ElementInternals

  /**
   * Each attribute's value, converted (`size: "large"`, `disabled: true`), by its canonical camelCase key.
   * - Up to date at once, whether the attribute or the property was written:
   *   the component's getters (`this.size`) read it.
   * - The attribute's raw TEXT is not kept here:  it stays on the attribute (DOM API `getAttribute()`).
   */
  readonly attributeValues: Record<string, unknown> = {}

  /** Resolves once the first render is done with its styles adopted (or failed). */
  readonly ready: Promise<void>

  /** What the custom-element callbacks share:  see `ConnectedState`. */
  private readonly connectedState: ConnectedState

  constructor() {
    super()
    const connectedState: ConnectedState = (this.connectedState = {
      isMounted: false,
      releaseCallbacks: [],
      propertyChangedCallbacks: [],
      resolveReady: () => undefined
    })
    this.ready = new Promise((resolve) => (connectedState.resolveReady = resolve))
    this.internals = this.attachInternals()
    const definition = this.tagSetup?.elementDefinition
    if (definition) {
      for (const attribute of definition.attributes) {
        this.attributeValues[attribute.key] = definition.startingValue(attribute)
      }
      this.captureUpgradeValues(definition)
    }
    // capture on the DOM element itself, so a disabled element swallows clicks before page listeners on it run
    this.addEventListener("click", (event) => this.swallowClickWhileDisabled(event), { capture: true })
    if (import.meta.hot) DOMElement.hotReloadHooks?.created(this)
  }

  ////////////////
  // ## Connection
  ////////////////

  /**
   * DOM API:  the element was added to a page.
   * - First time (or after `dispose()`):  re-apply properties set before the upgrade (a real write, so it
   *   reflects), then build and render the component, then hand it what the browser reported before it existed.
   * - Every time:  the component's `onConnect()`.
   * - NEVER writes default values to attributes:  a bare element grows no attributes, as a native one doesn't.
   */
  connectedCallback() {
    this.restoreUpgradeValues()
    const { connectedState } = this
    if (!connectedState.isMounted) {
      connectedState.isMounted = true
      // a bare subclass defined without `subclassForTag()` (a test's stand-in) has no component
      this.tagSetup?.mountComponent(this)
      this.handOverEarlyFormState()
    }
    this.component?.onConnect()
  }

  /**
   * DOM API:  the element was removed from its page.
   * - The component stays, ready for the next connect:  moving an element (re-parenting, sorting a list) keeps its
   *   state.  Only `dispose()` ends it.
   */
  disconnectedCallback() {
    this.component?.onDisconnect()
  }

  /**
   * Release the component and everything it holds (release callbacks, newest first);  idempotent.
   * - A later connect builds a new component.
   */
  dispose() {
    const { connectedState } = this
    if (!connectedState.isMounted) return
    connectedState.isMounted = false
    connectedState.propertyChangedCallbacks.length = 0
    let callback
    while ((callback = connectedState.releaseCallbacks.pop())) callback(this)
  }

  /** Run `callback` when the element is released (`dispose()`), newest first. */
  addReleaseCallback(callback: (domElement: DOMElement) => void) {
    this.connectedState.releaseCallbacks.push(callback)
  }

  ////////////////
  // ## Attributes and properties
  ////////////////

  /**
   * DOM API:  attribute `name` changed to `text` (`null`:  removed).
   * - Converts and stores it;  never writes it back (`primary="yes"` stays `"yes"`).
   * - Ignored while the element writes the attribute itself (reflection), and for an attribute whose property a page
   *   set before the upgrade:  that value wins over the attributes the browser replays during it.
   */
  attributeChangedCallback(name: string, _old: string | null, text: string | null) {
    const definition = this.tagSetup?.elementDefinition
    const attribute = definition?.attributeNamed(name)
    if (
      !attribute ||
      this.connectedState.reflecting === name ||
      this.connectedState.upgradeValues?.has(attribute.property)
    ) {
      return
    }
    this.setValue(attribute, definition.convert(attribute, text), "attribute")
  }

  /** Call `callback` on every attribute value change, equal or not, until `dispose()`. */
  addPropertyChangedCallback(callback: PropertyChangedCallback) {
    this.connectedState.propertyChangedCallbacks.push(callback)
  }

  /**
   * Store `value` for `attribute`, write it back to the attribute when it came from a property, then call the
   * change callbacks.
   * - Callbacks run on every write, equal or not:  setting the same value again is still a decision.
   */
  private setValue(attribute: E.ResolvedAttribute, value: unknown, source: ValueSource) {
    const old = this.attributeValues[attribute.key]
    this.attributeValues[attribute.key] = value
    if (import.meta.hot) DOMElement.hotReloadHooks?.valueSet(this, attribute.key, source)
    if (source === "property" && attribute.reflect) this.reflectAttribute(attribute, value)
    for (const callback of this.connectedState.propertyChangedCallbacks.slice()) {
      callback(attribute.key, value, old, source)
    }
  }

  /**
   * Write `value` to `attribute`'s attribute;  nothing when the text is already there.
   * - Synchronous:  the browser calls `attributeChangedCallback()` inside `setAttribute()`, which `reflecting` ignores.
   */
  private reflectAttribute(attribute: E.ResolvedAttribute, value: unknown) {
    const name = attribute.attribute
    const text = this.tagSetup.elementDefinition.attributeText(attribute, value)
    if (this.getAttribute(name) === text) return
    const { connectedState } = this
    const outer = connectedState.reflecting
    connectedState.reflecting = name
    try {
      if (text === null) this.removeAttribute(name)
      else this.setAttribute(name, text)
    } finally {
      connectedState.reflecting = outer
    }
  }

  ////////////////
  // ## The upgrade step
  //
  // A page (or a framework) may set `el.options = [...]` before the tag is defined:  the value lands as an OWN
  // property of the plain element, which would hide the class's getter / setter forever.
  ////////////////

  /** Constructor step:  take own properties set before the upgrade, and store their values at once. */
  private captureUpgradeValues(definition: E.ElementDefinition) {
    const self = this as unknown as Record<string, unknown>
    for (const attribute of definition.attributes) {
      if (!Object.hasOwn(this, attribute.property)) continue
      const value = self[attribute.property]
      delete self[attribute.property]
      ;(this.connectedState.upgradeValues ??= new Map()).set(attribute.property, value)
      this.attributeValues[attribute.key] = definition.convert(attribute, value)
    }
  }

  /** First-connect step:  set the captured values again, through the real setters (so they reflect). */
  private restoreUpgradeValues() {
    const values = this.connectedState.upgradeValues
    if (!values) return
    this.connectedState.upgradeValues = undefined
    for (const [property, value] of values) (this as unknown as Record<string, unknown>)[property] = value
  }

  ////////////////
  // ## Shadow root
  ////////////////

  /**
   * Where the component draws:  the shadow root, made on first use with the tag's `shadowRootInit`.
   * - A shadow root the server rendered (a declarative `<template shadowrootmode>`) is used as is, and emptied
   *   right before the first render (`clearServerContent()`):  no hydration, its content is replaced.
   */
  get renderRoot(): ShadowRoot {
    const { connectedState } = this
    if (connectedState.root) return connectedState.root
    const existing = this.shadowRoot ?? this.internals.shadowRoot
    if (existing) {
      connectedState.hasServerContent = existing.childNodes.length > 0
      return (connectedState.root = existing)
    }
    return (connectedState.root = this.attachShadow(this.tagSetup.shadowRootInit))
  }

  /** Empty a server-rendered shadow root once, right before the first render. */
  clearServerContent() {
    const root = this.renderRoot
    if (!this.connectedState.hasServerContent) return
    this.connectedState.hasServerContent = false
    root.replaceChildren()
  }

  ////////////////
  // ## Forms
  //
  // The browser calls these on a tag defined with DOM API `static formAssociated = true`
  // (`elementSetup.isAFormControl`);  on any other tag, never.
  ////////////////

  /** DOM API:  the element's form owner changed (`null`:  none).  Calls the component's `onFormAssociated()`. */
  formAssociatedCallback(form: HTMLFormElement | null) {
    if (this.component) this.component.onFormAssociated(form)
    else (this.connectedState.earlyForm ??= {}).form = form
  }

  /**
   * DOM API:  a `<fieldset disabled>` around the element started or stopped disabling it.
   * Calls the component's `onFormDisabled()`.
   */
  formDisabledCallback(disabled: boolean) {
    if (this.component) this.component.onFormDisabled(disabled)
    else (this.connectedState.earlyForm ??= {}).disabled = disabled
  }

  /** DOM API:  the form was reset.  Calls the component's `onFormReset()`. */
  formResetCallback() {
    this.component?.onFormReset()
  }

  /**
   * DOM API:  the browser restored a value (back / forward, autofill;  `mode`:  `"restore"` / `"autocomplete"`).
   * Calls the component's `onFormStateRestore()`.
   */
  formStateRestoreCallback(state: File | string | FormData | null, mode: string) {
    this.component?.onFormStateRestore(state, mode)
  }

  /**
   * After the component was built:  hand it what the browser reported before it existed.
   * - Why:  the browser calls DOM API `formAssociatedCallback()` as the element is INSERTED,
   *   before `connectedCallback()` builds the component.
   */
  private handOverEarlyFormState() {
    const early = this.connectedState.earlyForm
    const { component } = this
    if (!early || !component) return
    this.connectedState.earlyForm = undefined
    if (early.form !== undefined) component.onFormAssociated(early.form)
    if (early.disabled !== undefined) component.onFormDisabled(early.disabled)
  }

  ////////////////
  // ## States
  ////////////////

  /** Add or remove custom state `name` (DOM API `:state(name)`). */
  setState(name: string, on: boolean) {
    if (on) this.internals.states.add(name)
    else this.internals.states.delete(name)
  }

  /** Resolve `ready`;  called by the component once it has rendered with styles, or by the error path. */
  markReady() {
    this.connectedState.resolveReady()
  }

  ////////////////
  // ## Events
  ////////////////

  /** Swallow clicks while the component says the element is disabled. */
  private swallowClickWhileDisabled(event: MouseEvent) {
    if (!this.component?.isDisabled) return
    event.preventDefault()
    event.stopImmediatePropagation()
  }

  ////////////////
  // ## The tag
  //
  // Each tag's OWN subclass carries a `tagSetup` (made by `subclassForTag()`, swapped in place by hot reload).
  ////////////////

  /**
   * What this tag's class carries:  its definition, shadow root options, whether it's a form control, how to build
   * its component (`TagSetup`).
   * - Set on each tag's own class by `subclassForTag()`;  `undefined` on `DOMElement` and the family bases.
   */
  declare static tagSetup: TagSetup

  /** This element's class's `tagSetup`. */
  private get tagSetup(): TagSetup {
    return (this.constructor as DOMElementClass).tagSetup
  }

  /** DOM API:  the attributes the browser reports changes of (`attributeChangedCallback()`), read once at definition. */
  static get observedAttributes(): string[] {
    return this.tagSetup?.elementDefinition.attributes.map(({ attribute }) => attribute) ?? []
  }

  /**
   * Make the class for one tag:  a subclass of `Base` carrying `tag`, a property per attribute and
   * DOM API `static formAssociated`.  It's not defined yet:  `UIComponent.define()` does that.
   * - Throws a `TypeError` naming EVERY attribute property that would hide a member of the element (Q6).
   */
  static subclassForTag(Base: typeof DOMElement, tag: TagSetup): DOMElementClass {
    const name = className(tag.elementDefinition.tag)
    const Class = { [name]: class extends Base {} }[name] as unknown as DOMElementClass
    Class.tagSetup = tag
    Object.defineProperty(Class, "formAssociated", { value: tag.isAFormControl })
    DOMElement.defineProperties(Class)
    return Class
  }

  /**
   * Put a getter / setter per attribute on `Class.prototype`, from `Class.tagSetup`.
   * - Reading one gives the converted value;  writing one converts, stores, and writes the attribute back.
   * - On the PROTOTYPE, so `"size" in button` is true before the element connects (frameworks check it).
   * - Throws first, changing nothing, when any would hide a member of the element by accident.
   *   A property the vocabulary NAMES itself (`property: "inputMode"`, not its attribute name camelCased) takes
   *   over the member on purpose:  `<ui-input>`'s `inputMode` mirrors the browser's own.
   */
  static defineProperties(Class: DOMElementClass) {
    const { elementDefinition } = Class.tagSetup
    const prototype = Class.prototype
    const clashes = elementDefinition.attributes
      .filter(({ key, property }) => property === key)
      .map(({ property }) => property)
      .filter((property) => property in prototype || INSTANCE_FIELDS.includes(property))
    if (clashes.length) {
      throw new TypeError(
        `<${elementDefinition.tag}>:  ${clashes.map((property) => JSON.stringify(property)).join(", ")} ` +
          `would hide the element's own member${clashes.length === 1 ? "" : "s"};  ` +
          `rename the attribute's property in its vocabulary (\`property: "..."\`)`
      )
    }
    for (const attribute of elementDefinition.attributes) {
      Object.defineProperty(prototype, attribute.property, {
        get(this: DOMElement) {
          return this.attributeValues[attribute.key]
        },
        set(this: DOMElement, value: unknown) {
          this.setValue(attribute, this.tagSetup.elementDefinition.convert(attribute, value), "property")
        },
        enumerable: true,
        configurable: true
      })
    }
  }

  /** Remove the properties `defineProperties()` put on `Class.prototype` (hot reload, before it puts new ones). */
  static removeProperties(Class: DOMElementClass) {
    for (const { property } of Class.tagSetup.elementDefinition.attributes) {
      delete (Class.prototype as unknown as Record<string, unknown>)[property]
    }
  }

  ////////////////
  // ## Hot reload
  ////////////////

  /**
   * Development only:  what every DOM element tells hot reload (`HotDefinitions` installs it):  that it was made, and
   * where each attribute value came from.
   * - Every call is under `import.meta.hot`, so a build drops them.
   */
  static hotReloadHooks?: DOMElementHotHooks
}

/** Readable class name for devtools:  `ui-button` => `UiButton`. */
function className(tag: string): string {
  return tag.replace(/(^|-)(\w)/g, (_match, _dash, char: string) => char.toUpperCase()).replace(/\W/g, "")
}

/**
 * `DOMElement`'s own instance fields:  an attribute property of one of these names would be hidden by it.
 * - `in prototype` can't see them (they're made per instance):  keep this list in step with the class.
 */
const INSTANCE_FIELDS: readonly string[] = ["internals", "attributeValues", "component", "ready", "connectedState"]

////////////////
// ## Types
////////////////

/** The class `subclassForTag()` makes for one tag. */
export type DOMElementClass = typeof DOMElement & { new (): DOMElement }

/** What one tag's class carries:  `subclassForTag()`'s input (hot reload swaps it in place). */
export type TagSetup = {
  /** the tag's definition:  its attributes, their names and how they convert */
  elementDefinition: E.ElementDefinition
  /** options for its shadow root (DOM API `attachShadow()`):  always open;  focus delegation and slot assignment vary */
  shadowRootInit: ShadowRootInit
  /** DOM API `static formAssociated`:  read once, at definition */
  isAFormControl: boolean
  /** build and render the component;  called on the element's first connect (and again after `dispose()`) */
  mountComponent: (domElement: DOMElement) => void
}

/** A change callback (`addPropertyChangedCallback()`):  key, new value, old value, where it came from. */
export type PropertyChangedCallback = (key: string, value: unknown, old: unknown, source: ValueSource) => void

/** Where an attribute value came from:  its attribute's text, or a property write. */
export type ValueSource = "attribute" | "property"

/** Hot reload's hooks into every DOM element:  `HotDefinitions` installs them, in development only. */
export type DOMElementHotHooks = {
  /** a DOM element was made */
  created(domElement: DOMElement): void
  /** an attribute value was written */
  valueSet(domElement: DOMElement, key: string, source: ValueSource): void
}

/** `DOMElement`'s private connectedState, ONE field (so attribute names can't clash with many). */
type ConnectedState = {
  /** the component has been built (and not disposed since) */
  isMounted: boolean
  /** `addReleaseCallback()`'s */
  releaseCallbacks: ((domElement: DOMElement) => void)[]
  /** `addPropertyChangedCallback()`'s */
  propertyChangedCallbacks: PropertyChangedCallback[]
  /** resolves `ready` */
  resolveReady: () => void
  /** the attribute being written back right now, whose `attributeChangedCallback()` is ignored */
  reflecting?: string
  /** properties set before the upgrade, by property name, until the first connect */
  upgradeValues?: Map<string, unknown>
  /** the shadow root, once made */
  root?: ShadowRoot
  /** the shadow root came from the server, with content to clear before the first render */
  hasServerContent?: boolean
  /** form state the browser reported before the component existed */
  earlyForm?: { form?: HTMLFormElement | null; disabled?: boolean }
}
