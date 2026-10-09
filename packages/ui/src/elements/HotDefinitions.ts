/*! Derived from `@solidjs/element` and `component-register`:  MIT licence, (c) Ryan Carniato. */
import { E, UI } from "$/ui/core"

/****************
 * ### `HotDefinitions`
 * Hot module replacement for `ui`'s elements in `yarn dev`:  an edited component re-renders every live element in
 * place, keeping the element objects, their attributes and their property values.  Dev-only;  NEVER in a build.
 * - Loaded by the Vite plugin (`tools/HotElements.ts`) into every component barrel, before its `define()` calls run.
 *   SIDE EFFECT:  `install()` wraps `UIComponent.define`, and hooks into every DOM element made (`DOMElement.hotReloadHooks`).
 * - Why:  `define()` is idempotent per tag, so a barrel re-run by HMR would return the OLD element class.  The
 *   wrapper records every tag's class and dictionary;  when a DIFFERENT class of the SAME name defines a known tag
 *   -- its module was re-evaluated -- that class takes over EVERY tag the old one had, the translated aliases
 *   (`ie-boton`) included.
 * - The platform can't define a tag twice, so each tag's DOM element class STAYS, and what it reads is swapped in
 *   place (`redefine()`):  its definition, its properties, how it builds its component.  Only when nothing the
 *   platform read once at definition changed (observed attributes, DOM API `formAssociated`, the base class, shadow
 *   root options);  else `update()` reloads the page.
 * - Then the barrel's `import.meta.hot.accept()` calls `update()`, which re-renders every live element of the swapped
 *   classes.  Their component-internal state (a query, an open menu) resets;  their attributes and properties don't.
 * - Also:  English texts the edit changed reach `UI.i18n` (`define()` never overwrites a registered text), and
 *   `updateStyle()` re-registers a component sheet whose `?inline` CSS changed.
 * - NOTE: a vocabulary whose tag was renamed defines the NEW tag;  instances of the old one keep the old class.
 * - `UI.vocabulary.replace()` swaps a changed vocabulary in, and re-resolves the runtime's translated names from it.
 * - Imports the core through `$/ui/core`, as a component file does:  it's loaded into component barrels, and NOTHING
 *   in the core imports it (it's not in the `$/ui/elements` barrel).
 * - STATIC and instance-free on purpose:  ONE record of definitions per page, as `customElements` is.
 * - From solid-element's hot reload, merged into its one user (epic `spell-element`, Q11).
 ****************/
export class HotDefinitions {
  /** Wrap `UIComponent.define`, and hook into every DOM element made;  idempotent. */
  static install() {
    if (HotDefinitions.original) return
    HotDefinitions.original = E.UIComponent.define
    E.UIComponent.define = function (this: E.UIComponentClass, tag?: string, dictionary?: E.Dictionary) {
      return HotDefinitions.define(this, tag, dictionary)
    }
    E.DOMElement.hotReloadHooks = {
      created: (domElement) => HotDefinitions.track(domElement),
      valueSet: (domElement, key, source) => {
        let sources = HotDefinitions.sources.get(domElement)
        if (!sources) HotDefinitions.sources.set(domElement, (sources = {}))
        sources[key] = source
      }
    }
  }

  /** The wrapped `define()`:  record, re-define on a new version of a class, else as declared. */
  static define(Class: E.UIComponentClass, tag?: string, dictionary?: E.Dictionary): CustomElementConstructor {
    const original = HotDefinitions.original!
    const resolved = new E.ElementDefinition(Class.prototype.vocabulary, { tag, dictionary }).tag
    const known = HotDefinitions.tags.get(resolved)
    if (!known) {
      HotDefinitions.tags.set(resolved, { Class, tag, dictionary })
      return original.call(Class, tag, dictionary)
    }
    const defined = customElements.get(resolved)
    if (!defined || known.Class === Class || known.Class.name !== Class.name)
      return original.call(Class, tag, dictionary)
    HotDefinitions.replace(known.Class, Class)
    return defined
  }

  /** `Next` is a new version of `Previous`:  re-define every tag `Previous` had with it (`redefine()`). */
  static replace(Previous: E.UIComponentClass, Next: E.UIComponentClass) {
    const before = Previous.prototype.vocabulary
    const after = Next.prototype.vocabulary
    if (before !== after) {
      HotDefinitions.whenRuntime(() => {
        // `register()` refuses a second vocabulary object for a tag:  swap the new version in, so the registration
        // below is a no-op and localized names re-resolve
        UI.vocabulary.replace(after)
        HotDefinitions.updateTexts(before, after)
      })
    }
    for (const known of HotDefinitions.tags.values()) {
      if (known.Class !== Previous) continue
      known.Class = Next
      const definition = new E.ElementDefinition(Next.prototype.vocabulary, known)
      const TagClass = customElements.get(definition.tag) as E.DOMElementClass | undefined
      if (TagClass) HotDefinitions.redefine(TagClass, Next, definition)
    }
  }

  /**
   * Swap `TagClass`'s definition, properties and component (`Next`) in place, or record why the platform can't take
   * the change (`update()` then reloads the page).
   * - Each live element's values are carried over (`migrate()`).
   * - NEVER re-renders:  `update()` does, once the whole barrel has re-run.
   * - Throws, changing nothing, when a new attribute property would hide a member of the element (as a first
   *   definition would).
   */
  static redefine(TagClass: E.DOMElementClass, Next: E.UIComponentClass, definition: E.ElementDefinition) {
    E.UIComponent.register.call(Next, definition)
    const next = E.UIComponent.tagSetupFor(Next, definition)
    const reason = HotDefinitions.changeOf(TagClass, E.UIComponent.setupFor(Next).DOMElement, next)
    if (reason) {
      HotDefinitions.pending.refused.push({ tag: definition.tag, reason })
      return
    }
    // dry run on a stand-in with the same chain:  a clash throws BEFORE anything changed
    const Base = Object.getPrototypeOf(TagClass) as typeof E.DOMElement
    const Probe = class extends Base {} as unknown as E.DOMElementClass
    Probe.tagSetup = next
    E.DOMElement.defineProperties(Probe)
    const previous = TagClass.tagSetup.elementDefinition
    E.DOMElement.removeProperties(TagClass)
    TagClass.tagSetup = next
    E.DOMElement.defineProperties(TagClass)
    for (const domElement of HotDefinitions.liveElements(TagClass)) {
      HotDefinitions.migrate(domElement, previous, definition)
    }
    HotDefinitions.pending.swapped.add(TagClass)
  }

  /**
   * Why `TagClass` can't take `next`, or `undefined` if it can.
   * - All of these are read ONCE, by DOM API `customElements.define()` or by the constructor of elements that
   *   already exist.
   */
  static changeOf(TagClass: E.DOMElementClass, Base: typeof E.DOMElement, next: E.TagSetup): string | undefined {
    const before = TagClass.observedAttributes
    const after = next.elementDefinition.attributes.map(({ attribute }) => attribute)
    const added = after.filter((name) => !before.includes(name))
    const removed = before.filter((name) => !after.includes(name))
    if (added.length || removed.length) {
      const diff = [...added.map((name) => `+${name}`), ...removed.map((name) => `-${name}`)].join(" ")
      return `observed attributes changed (${diff})`
    }
    if (Object.getPrototypeOf(TagClass) !== Base) return "DOM element class changed"
    const formAssociated = !!(TagClass as unknown as { formAssociated?: boolean }).formAssociated
    if (formAssociated !== next.isAFormControl) return "formAssociated changed"
    if (JSON.stringify(TagClass.tagSetup.shadowRootInit) !== JSON.stringify(next.shadowRootInit)) {
      return "shadow root options changed"
    }
    return undefined
  }

  /**
   * Finish a hot update:  re-render the live elements of every class swapped since the last call;  or, if a
   * re-definition was refused, log it and `hot.invalidate()` (Vite then reloads the page).
   * - The Vite plugin calls it from each barrel's `import.meta.hot.accept()`.
   */
  static update(hot?: HotContext): HotUpdateResult {
    const refused = HotDefinitions.pending.refused.splice(0)
    const swapped = [...HotDefinitions.pending.swapped]
    HotDefinitions.pending.swapped.clear()
    if (refused.length) {
      const message = refused.map(({ tag, reason }) => `<${tag}>: ${reason}, full reload`).join("\n")
      E.Warnings.warn("HotDefinitions", message)
      hot?.invalidate(message)
      return { reloaded: [], refused }
    }
    for (const TagClass of swapped) {
      for (const domElement of HotDefinitions.liveElements(TagClass)) HotDefinitions.reload(domElement)
    }
    return { reloaded: swapped.map((TagClass) => TagClass.tagSetup.elementDefinition.tag), refused }
  }

  /**
   * A component sheet's `?inline` CSS changed:  re-register it by name (`UIButton.css` => `button`).
   * - The name is the file's, without `UI`, in kebab-case (`UITreeDiagram.css` => `tree-diagram`):
   *   elements register their sheets by that bare name (`@proto static styleSheets = { button: buttonCSS }`).
   * - A second sheet (`UIDimmer.page.css`) or a sheet registered under another name isn't matched:
   *   an edit to it shows after a page reload.
   * - `Styles.register()` replaces the rules of the sheet every shadow root already adopted:  no re-render.
   * - Registered even if no element used it yet, so a later `adoptStyles()` finds the new text (it only
   *   registers names that are missing).
   */
  static updateStyle(this: void, id: string, css: string) {
    const stem = /(?:^|\/)UI([A-Za-z0-9]+)\.css(?:\?|$)/.exec(id)?.[1]
    if (!stem) return
    const name = stem.replace(/(?<=.)([A-Z])/g, "-$1").toLowerCase()
    HotDefinitions.whenRuntime(() => UI.styles.register(name, css))
  }

  ////////////////
  // ## Live elements
  ////////////////

  /** Remember `domElement` as a live element of its class;  weak, so tracking never keeps an element alive. */
  static track(domElement: E.DOMElement) {
    const TagClass = domElement.constructor as E.DOMElementClass
    let refs = HotDefinitions.live.get(TagClass)
    if (!refs) HotDefinitions.live.set(TagClass, (refs = new Set()))
    refs.add(new WeakRef(domElement))
  }

  /** Every element of `TagClass` still in memory, connected or not. */
  static liveElements(TagClass: E.DOMElementClass): E.DOMElement[] {
    const refs = HotDefinitions.live.get(TagClass)
    const found: E.DOMElement[] = []
    for (const ref of refs ?? []) {
      const domElement = ref.deref()
      if (domElement) found.push(domElement)
      else refs!.delete(ref)
    }
    return found
  }

  /**
   * Dispose `domElement`'s component and, if connected, build and render its class's CURRENT component.
   * - Kept:  the element, its attributes, its property values (`attributeValues`), its shadow root and adopted sheets.
   *   Lost:  state inside the component.
   * - Clears DOM API `:state(errored)`, so an element whose render failed recovers with the next good component.
   * - A detached element is only disposed:  it renders the current component on its next connect.
   */
  static reload(domElement: E.DOMElement) {
    domElement.dispose()
    domElement.renderRoot.textContent = ""
    domElement.setState(E.ERRORED_STATE, false)
    if (domElement.isConnected) domElement.connectedCallback()
  }

  /**
   * Carry `domElement`'s values over to the `next` definition.
   * - Last written as a PROPERTY:  kept as is (a framework's rich data, a controlled value).
   * - Last written by its ATTRIBUTE:  converted again (a vocabulary that learned a value).
   * - Never written:  the new starting value.  Attributes the new definition dropped are dropped.
   */
  private static migrate(domElement: E.DOMElement, previous: E.ElementDefinition, next: E.ElementDefinition) {
    const sources = HotDefinitions.sources.get(domElement) ?? {}
    const values = domElement.attributeValues
    const kept: Record<string, unknown> = {}
    for (const attribute of next.attributes) {
      const isKnown = previous.attributes.some(({ key }) => key === attribute.key)
      const source = isKnown ? sources[attribute.key] : undefined
      if (source === "property") kept[attribute.key] = values[attribute.key]
      else if (source === "attribute") {
        kept[attribute.key] = next.convert(attribute, domElement.getAttribute(attribute.attribute))
      } else kept[attribute.key] = next.startingValue(attribute)
    }
    for (const key of Object.keys(values)) delete values[key]
    Object.assign(values, kept)
  }

  ////////////////
  // ## Helpers
  ////////////////

  /**
   * Run `task` now if the runtime is loaded, else once it is.
   * - Queued behind registrations `define()` already queued, ahead of the ones it queues next (same promise).
   */
  private static whenRuntime(task: () => void) {
    if ((globalThis as E.RuntimeGlobal)[E.RUNTIME_KEY]) task()
    else void UI.load().then(task)
  }

  /**
   * English texts the `next` version of a vocabulary changed, as its new defaults.
   * - Defaults sit below every registered string (`I18n.registerDefaults()`), so a translation still wins.
   */
  private static updateTexts(previous: E.ComponentVocabulary, next: E.ComponentVocabulary) {
    const previousTexts = new Map(previous.texts.map(({ key, text }) => [key, text]))
    const changed: Record<string, string> = {}
    for (const { key, text } of next.texts) if (previousTexts.get(key) !== text) changed[key] = text
    if (Object.keys(changed).length) UI.i18n.registerDefaults(changed, next.tag)
  }

  ////////////////
  // ## Page-wide registry
  ////////////////

  /** Every tag defined so far, with what defined it;  by resolved tag. */
  private static readonly tags = new Map<string, HotTag>()

  /** Live elements per tag class. */
  private static readonly live = new WeakMap<E.DOMElementClass, Set<WeakRef<E.DOMElement>>>()

  /** Where each element's attribute values last came from, by key:  `migrate()` reads it. */
  private static readonly sources = new WeakMap<E.DOMElement, Record<string, E.ValueSource>>()

  /** Swaps and refusals since the last `update()`. */
  private static readonly pending = {
    swapped: new Set<E.DOMElementClass>(),
    refused: [] as HotRefusal[]
  }

  /** `UIComponent.define` as declared, once `install()` has run. */
  private static original?: typeof E.UIComponent.define
}

/** What defined one tag:  enough to define it again with a new version of the class. */
type HotTag = {
  /** Current class. */
  Class: E.UIComponentClass
  /** `define()`'s `tag` argument, as passed. */
  tag?: string
  /** `define()`'s `dictionary` argument. */
  dictionary?: E.Dictionary
}

/** A re-definition the platform can't take:  the tag, and why. */
export type HotRefusal = { tag: string; reason: string }

/** `update()`'s result:  the tags re-rendered, or the refusals that reloaded the page. */
export type HotUpdateResult = { reloaded: string[]; refused: HotRefusal[] }

/** The part of Vite's `import.meta.hot` `update()` uses. */
export type HotContext = { invalidate(message?: string): void }

HotDefinitions.install()
