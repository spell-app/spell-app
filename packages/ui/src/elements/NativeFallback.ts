// Import directly to avoid circular import
import { lazy, proto } from "$/ui/util"
import { E } from "$/ui/core"

/****************
 * ### `NativeFallback`
 * The base class of the form controls' fallbacks:  plain native DOM a DOM element shows when its component's render
 * throws, so its form keeps working (`docs/fallback.md`:  only form controls have one).
 * - Library-neutral:  of the core (`E`), it uses only the foundation and `E.ClassBuilder`, NEVER Solid or the runtime
 *   (`UI`), and builds with `createElement` + `setAttribute` (NEVER `innerHTML` with user text), so the fallback
 *   works whatever broke the Solid render.
 * - Same class grammar, `part`s and `<slot>` as the real element, so the component's adopted sheet still
 *   styles it and light-DOM children still show.
 * - Subclasses set `@proto static vocabulary` (or `vocabularies`, one class for several tags) and implement
 *   `build()`;  callers only use `render()`.
 * - Reads the DOM ELEMENT'S ATTRIBUTES (reflected primitives), never its properties, except where a subclass says so
 *   (`dropdown`:  `value`, `options`).
 * - NOTE:  attribute names are canonical English;  a translated DOM element must map its attributes back first.
 ****************/
export abstract class NativeFallback<V extends E.ComponentVocabulary = E.ComponentVocabulary> {
  /**
   * Names the fallback reads and renders, read from the prototype (`@proto`).
   * - STATIC:  one per family, shared by every instance, so no per-instance copy;  a subclass overrides it with
   *   its own `@proto static vocabulary` line, which needs no docstring.
   * - The base's is an empty placeholder.
   */
  @proto static vocabulary: E.ComponentVocabulary = {
    tag: "",
    noun: "",
    attributes: [],
    events: [],
    slots: [],
    parts: [],
    states: [],
    texts: []
  }

  /**
   * One class for several tags (`<ui-card>` + `<ui-cards>`):  every tag's vocabulary, the FIRST the default.
   * - The constructor puts the right one into `vocabulary`:
   *   the one whose `tag` is the DOM element's, else the first (a translated tag).
   * - STATIC for the same reason as `vocabulary`;  empty (the default) keeps `vocabulary` as it is.
   */
  @proto static vocabularies: readonly E.ComponentVocabulary[] = []

  /**
   * What the fallback loses against the real component, see `NativeFallbackHandle`.
   * - STATIC:  a fact about the family, written once beside its `build()`, the same for every instance.
   */
  @proto static degraded: readonly string[] = []

  /** Names this fallback reads and renders:  the class's `vocabulary`, or the DOM element tag's from `vocabularies`. */
  declare vocabulary: V

  /** Every tag's vocabulary, for a class serving several tags, see the static. */
  declare vocabularies: readonly V[]

  /** What this fallback loses against the real component, see `NativeFallbackHandle`. */
  declare degraded: readonly string[]

  /** Element that failed. */
  readonly domElement: HTMLElement

  /** Where the fallback builds. */
  readonly root: E.NativeFallbackRoot

  /** Why the real render failed. */
  readonly error: unknown

  /** DOM element internals, when the element has them. */
  readonly internals: ElementInternals | undefined

  /** `internals` only when the DOM element is form-associated, so form calls never throw. */
  protected readonly formInternals: ElementInternals | undefined

  /** Undo functions for `listen()`. */
  private readonly disposers: (() => void)[] = []

  constructor({ domElement, root, error, internals }: NativeFallbackProps) {
    this.domElement = domElement
    this.root = root
    this.error = error
    this.internals = internals
    this.formInternals = (domElement.constructor as { formAssociated?: boolean }).formAssociated ? internals : undefined
    // Shadows the prototype's `vocabulary` with the DOM element tag's
    const { vocabularies } = this
    if (vocabularies.length) {
      this.vocabulary = vocabularies.find(({ tag }) => tag === domElement.localName) ?? vocabularies[0]
    }
  }

  ////////////////
  // ## Entry point
  ////////////////

  /**
   * Build the fallback for `domElement` into `root`, replacing its children.
   * - Call as `ButtonFallback.render({ domElement: this, root: this.shadowRoot, error, internals: this.internals })`.
   * - SIDE EFFECT:  adds custom state `errored` to `internals`, when given.
   * - The component's own adopted stylesheets stay;  only children are replaced.
   * - STATIC on purpose:  callers never hold the instance, only the handle it returns.
   */
  static render<T extends NativeFallback>(
    this: new (props: NativeFallbackProps) => T,
    props: NativeFallbackProps
  ): E.NativeFallbackHandle {
    const fallback = new this(props)
    props.root.replaceChildren(...fallback.build())
    fallback.attached()
    props.internals?.states.add(E.ERRORED_STATE)
    return { dispose: () => fallback.dispose(), degraded: fallback.degraded }
  }

  /**
   * Nodes to put in `root`:  the subclass's whole fallback, built from the DOM element's attributes.
   * - Called once, by `render()`, before the nodes are attached:  work that needs them in the document goes in
   *   `attached()`.
   * - An override that only builds needs no docstring.
   */
  protected abstract build(): Node[]

  /**
   * Runs once the built nodes are in `root`, for work that needs them attached, e.g. `setValidity(..., anchor)`.
   * - Default:  nothing.
   */
  protected attached() {}

  /**
   * Remove every listener `listen()` added;  the DOM stays, so a later re-render can replace it.
   * - Called through the handle `render()` returns, when the DOM element is released.
   * - An override (an observer to disconnect) calls `super.dispose()`.
   */
  dispose() {
    for (const undo of this.disposers.splice(0)) undo()
  }

  ////////////////
  // ## Reading the DOM element
  ////////////////

  /** DOM element attribute `name`, or `undefined` when absent (`getAttribute()`'s `null` stops here). */
  protected attr(name: E.AttributeNameOf<V>): string | undefined {
    return this.domElement.getAttribute(name) ?? undefined
  }

  /** DOM element attribute `name` as a boolean, `disabled="no"` ~== false. */
  protected flag(name: E.AttributeNameOf<V>): boolean {
    return E.Converters.boolean(this.domElement.getAttribute(name), name)
  }

  /**
   * Fomantic class string the real element would render, e.g. `ui small primary button`.
   * - Every class-emitting vocabulary attribute is read from the DOM element;  an absent one takes its vocabulary
   *   `default`, as the element's props do (`<ui-sidebar>` => `ui left sidebar`).
   */
  protected classes(extra?: string): string {
    const input: Record<string, unknown> = {}
    for (const spec of this.vocabulary.attributes) {
      const value = this.domElement.getAttribute(spec.name) ?? NativeFallback.defaultText(spec.default)
      if (value === undefined) continue
      if (spec.kind === "keyOnly") input[spec.name] = E.Converters.boolean(value, spec.name)
      else if (spec.kind === "keyOrValueAndKey") input[spec.name] = E.Converters.keyOrValue(value, undefined)
      else input[spec.name] = value
    }
    return this.builder.build(input, { extra })
  }

  /** Builds `classes()`;  made on first use, over the DOM element tag's `vocabulary`. */
  @lazy private get builder(): E.ClassBuilder {
    return new E.ClassBuilder(this.vocabulary)
  }

  /** The DOM element's form (`internals.form`, else an ancestor `<form>`), or `undefined`. */
  protected form(): HTMLFormElement | undefined {
    return this.formInternals?.form ?? this.domElement.closest("form") ?? undefined
  }

  ////////////////
  // ## Building
  ////////////////

  /** Element `tag` with `attributes` and `children` (strings become text nodes). */
  protected create<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    attributes: E.NativeFallbackAttributes = {},
    ...children: (Node | string)[]
  ): HTMLElementTagNameMap[K] {
    const element = this.domElement.ownerDocument.createElement(tag)
    for (const [name, value] of Object.entries(attributes)) {
      if (value != null && value !== false) element.setAttribute(name, value === true ? "" : value)
    }
    element.append(...children)
    return element
  }

  /** A `<slot>` for light-DOM content, with `fallback` text shown while nothing is slotted. */
  protected slot(fallback?: string): HTMLSlotElement {
    return this.create("slot", {}, ...(fallback ? [fallback] : []))
  }

  /**
   * Give `target` its `part` and the DOM element's accessibility attributes.
   * - `name` is one of the vocabulary's parts (typed;  a dev warning for a vocabulary TypeScript can't see, a
   *   class serving several tags);  `extra` parts are added unchecked.
   * - Copies every `aria-*` from the DOM element.  NOTE:  idref ones (`aria-labelledby`) can't cross the shadow
   *   boundary, so they dangle.
   * - A boolean `loading` becomes `aria-busy`;  a vocabulary where it isn't boolean (`<ui-image loading="lazy">`,
   *   the native `<img loading>`) is left alone.
   */
  protected decorate<T extends Element>(target: T, name: PartNameOf<V>, ...extra: string[]): T {
    if (!this.vocabulary.parts.some((part) => part.name === name)) {
      E.Warnings.devWarn(`<${this.vocabulary.tag}> fallback`, `"${name}" is not a part in its vocabulary`)
    }
    target.setAttribute("part", [name, ...extra].join(" "))
    for (const { name: attribute, value } of this.domElement.attributes) {
      if (attribute.startsWith("aria-")) target.setAttribute(attribute, value)
    }
    const loading = this.vocabulary.attributes.find((attribute) => attribute.name === LOADING)
    if (loading?.kind === "keyOnly" && E.Converters.boolean(this.domElement.getAttribute(LOADING), LOADING)) {
      target.setAttribute("aria-busy", "true")
    }
    return target
  }

  /** `addEventListener`, undone by `dispose()`. */
  protected listen<T extends Event = Event>(target: EventTarget, type: string, handler: (event: T) => void) {
    target.addEventListener(type, handler as EventListener)
    this.disposers.push(() => target.removeEventListener(type, handler as EventListener))
  }

  ////////////////
  // ## Helpers
  ////////////////

  /**
   * A vocabulary `default` as attribute text:  `true` => bare (`""`), `false` / absent => `undefined`.
   * - STATIC:  pure, needs no instance.
   */
  private static defaultText(value: string | number | boolean | null | undefined): string | undefined {
    if (value == null || value === false) return undefined
    return value === true ? "" : String(value)
  }
}

/** What a fallback is built from:  `new NativeFallback(props)`, `NativeFallback.render(props)`. */
export type NativeFallbackProps = {
  /** Element that failed. */
  domElement: HTMLElement
  /** Where the fallback builds:  the DOM element's shadow root, or the DOM element itself. */
  root: E.NativeFallbackRoot
  /** Why the real render failed. */
  error?: unknown
  /** DOM element internals, when the element has them:  `errored` state, roles, form calls. */
  internals?: ElementInternals
}

/** Part names of vocabulary `V`, so `decorate()` can't misspell one. */
export type PartNameOf<V extends { parts: readonly { name: string }[] }> = V["parts"][number]["name"]

/** The busy-flag attribute name. */
const LOADING = "loading"
