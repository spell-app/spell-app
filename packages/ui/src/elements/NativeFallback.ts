// Import directly to avoid circular import
import { proto } from "$/ui/util"
import { E } from "$/ui/core"

/****************
 * ### `NativeFallback`
 * Base of the per-component fallbacks:  plain native DOM a host shows when its real render throws.
 * - Library-neutral:  of the core (`E`), it uses only the foundation and `E.ClassBuilder`, NEVER Solid or the runtime
 *   (`UI`), and builds with `createElement` + `setAttribute` (NEVER `innerHTML` with user text), so the fallback
 *   works whatever broke the Solid render.
 * - Same class grammar, `part`s and `<slot>` as the real element, so the component's adopted sheet still
 *   styles it and light-DOM children still show.
 * - Subclasses set `@proto static vocabulary` (or `vocabularies`, one class for several tags) and implement
 *   `build()`;  callers only use `render()`.
 * - Reads the HOST'S ATTRIBUTES (reflected primitives), never its properties, except where a subclass says so
 *   (`dropdown`:  `value`, `options`).
 * - NOTE:  attribute names are canonical English;  a translated host must map its attributes back first.
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
   * - The constructor picks the one whose `tag` is the host's, else the first (a translated tag), into `vocabulary`.
   * - STATIC for the same reason as `vocabulary`;  empty (the default) keeps `vocabulary` as it is.
   */
  @proto static vocabularies: readonly E.ComponentVocabulary[] = []

  /**
   * What the fallback loses against the real component, see `NativeFallbackHandle`.
   * - STATIC:  a fact about the family, written once beside its `build()`, the same for every instance.
   */
  @proto static degraded: readonly string[] = []

  /** Names this fallback reads and renders:  the class's `vocabulary`, or the host tag's from `vocabularies`. */
  declare vocabulary: V

  /** Every tag's vocabulary, for a class serving several tags, see the static. */
  declare vocabularies: readonly V[]

  /** What this fallback loses against the real component, see `NativeFallbackHandle`. */
  declare degraded: readonly string[]

  /** Element that failed. */
  readonly host: HTMLElement

  /** Where the fallback builds. */
  readonly root: E.NativeFallbackRoot

  /** Why the real render failed. */
  readonly error: unknown

  /** Host internals, when the element has them. */
  readonly internals: ElementInternals | undefined

  /** `internals` only when the host is form-associated, so form calls never throw. */
  protected readonly formInternals: ElementInternals | undefined

  /** Undo functions for `listen()`. */
  private readonly disposers: (() => void)[] = []

  /** Made on first `classes()`. */
  private builder: E.ClassBuilder | undefined

  constructor({ host, root, error, internals }: NativeFallbackProps) {
    this.host = host
    this.root = root
    this.error = error
    this.internals = internals
    this.formInternals = (host.constructor as { formAssociated?: boolean }).formAssociated ? internals : undefined
    // Shadows the prototype's `vocabulary` with the host tag's
    const { vocabularies } = this
    if (vocabularies.length) {
      this.vocabulary = vocabularies.find(({ tag }) => tag === host.localName) ?? vocabularies[0]
    }
  }

  ////////////////
  // ## Entry point
  ////////////////

  /**
   * Build the fallback for `host` into `root`, replacing its children.
   * - Call as `ButtonFallback.render({ host: this, root: this.shadowRoot, error, internals: this.internals })`.
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
   * Nodes to put in `root`:  the subclass's whole fallback, built from the host's attributes.
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
   * - Called through the handle `render()` returns, when the host is released.
   * - An override (an observer to disconnect) calls `super.dispose()`.
   */
  dispose() {
    for (const undo of this.disposers.splice(0)) undo()
  }

  ////////////////
  // ## Reading the host
  ////////////////

  /**
   * Host attribute `name`, or `null`.
   * - `null`, not `undefined`:  it IS `getAttribute()`, a platform boundary.  Subclasses test `=== null` for
   *   "absent", and TypeScript wouldn't flag one of those left behind by a switch to `undefined`.
   */
  protected attr(name: E.AttributeNameOf<V>): string | null {
    return this.host.getAttribute(name)
  }

  /** Host attribute `name` as a boolean, `disabled="no"` ~== false. */
  protected flag(name: E.AttributeNameOf<V>): boolean {
    return E.Converters.boolean(this.host.getAttribute(name), name)
  }

  /**
   * Fomantic class string the real element would render, e.g. `ui small primary button`.
   * - Every class-emitting vocabulary attribute is read from the host;  an absent one takes its vocabulary
   *   `default`, as the element's props do (`<ui-sidebar>` => `ui left sidebar`).
   */
  protected classes(extra?: string): string {
    const input: Record<string, unknown> = {}
    for (const spec of this.vocabulary.attributes) {
      const value = this.host.getAttribute(spec.name) ?? NativeFallback.defaultText(spec.default)
      if (value === undefined) continue
      if (spec.kind === "keyOnly") input[spec.name] = E.Converters.boolean(value, spec.name)
      else if (spec.kind === "keyOrValueAndKey") input[spec.name] = E.Converters.keyOrValue(value, undefined)
      else input[spec.name] = value
    }
    this.builder ??= new E.ClassBuilder(this.vocabulary)
    return this.builder.build(input, { extra })
  }

  /** The host's form (`internals.form`, else an ancestor `<form>`), or `undefined`. */
  protected form(): HTMLFormElement | undefined {
    return this.formInternals?.form ?? this.host.closest("form") ?? undefined
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
    const element = this.host.ownerDocument.createElement(tag)
    for (const [name, value] of Object.entries(attributes)) {
      if (value != null && value !== false) element.setAttribute(name, value === true ? "" : value)
    }
    element.append(...children)
    return element
  }

  /**
   * A `<slot>` for light-DOM content, with `fallback` text shown while nothing is slotted.
   * - Takes `null` too:  `fallback` is often `attr()`'s.
   */
  protected slot(fallback?: string | null): HTMLSlotElement {
    return this.create("slot", {}, ...(fallback ? [fallback] : []))
  }

  /**
   * Give `target` its `part` and the host's accessibility attributes.
   * - `name` is one of the vocabulary's parts (typed;  a dev warning for a vocabulary TypeScript can't see, a
   *   class serving several tags);  `extra` parts are added unchecked.
   * - Copies every `aria-*` from the host.  NOTE:  idref ones (`aria-labelledby`) can't cross the shadow
   *   boundary, so they dangle.
   * - A boolean `loading` becomes `aria-busy`;  a vocabulary where it isn't boolean (`<ui-image loading="lazy">`,
   *   the native `<img loading>`) is left alone.
   */
  protected decorate<T extends Element>(target: T, name: PartNameOf<V>, ...extra: string[]): T {
    if (!this.vocabulary.parts.some((part) => part.name === name)) {
      E.Warnings.devWarn(`<${this.vocabulary.tag}> fallback`, `"${name}" is not a part in its vocabulary`)
    }
    target.setAttribute("part", [name, ...extra].join(" "))
    for (const { name: attribute, value } of this.host.attributes) {
      if (attribute.startsWith("aria-")) target.setAttribute(attribute, value)
    }
    const loading = this.vocabulary.attributes.find((attribute) => attribute.name === LOADING)
    if (loading?.kind === "keyOnly" && E.Converters.boolean(this.host.getAttribute(LOADING), LOADING)) {
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
  host: HTMLElement
  /** Where the fallback builds:  the host's shadow root, or the host itself. */
  root: E.NativeFallbackRoot
  /** Why the real render failed. */
  error?: unknown
  /** Host internals, when the element has them:  `errored` state, roles, form calls. */
  internals?: ElementInternals
}

/** Part names of vocabulary `V`, so `decorate()` can't misspell one. */
export type PartNameOf<V extends { parts: readonly { name: string }[] }> = V["parts"][number]["name"]

/** The busy-flag attribute name. */
const LOADING = "loading"
