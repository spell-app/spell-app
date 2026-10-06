import { proto, Warnings } from "$/ui/util"
import { Converters, type ComponentVocabulary } from "$/ui/vocabulary"

import type {
  AttributeNameOf,
  NativeFallbackAttributes,
  NativeFallbackHandle,
  NativeFallbackRoot
} from "./elements.types"
import { ClassBuilder } from "./ClassBuilder"

/****************
 * ### `NativeFallback`
 * Base of the per-component fallbacks:  plain native DOM a host shows when its real render throws.
 * - Library-neutral:  `createElement` + `setAttribute` only (no Solid, NEVER `innerHTML` with user text), so
 *   the fallback works whatever broke the Solid render.
 * - Same class grammar, `part`s and `<slot>` as the real element, so the component's adopted sheet still
 *   styles it and light-DOM children still show.
 * - Subclasses set `@proto static vocabulary` and implement `build()`;  callers only use `render()`.
 * - Reads the HOST'S ATTRIBUTES (reflected primitives), never its properties, except where a subclass says so
 *   (`dropdown`:  `value`, `options`).
 * - NOTE: attribute names are canonical English;  a translated host must map its attributes back first.
 ****************/
export abstract class NativeFallback<V extends ComponentVocabulary = ComponentVocabulary> {
  /** Names this fallback reads and renders. */
  declare vocabulary: V

  /** What this fallback loses against the real component, see `NativeFallbackHandle`. */
  declare degraded: readonly string[]

  @proto static vocabulary: ComponentVocabulary = {
    tag: "",
    noun: "",
    attributes: [],
    events: [],
    slots: [],
    parts: [],
    states: [],
    texts: []
  }

  @proto static degraded: readonly string[] = []

  /** Element that failed. */
  readonly host: HTMLElement

  /** Where the fallback builds. */
  readonly root: NativeFallbackRoot

  /** Why the real render failed. */
  readonly error: unknown

  /** Host internals, when the element has them. */
  readonly internals: ElementInternals | undefined

  /** `internals` only when the host is form-associated, so form calls never throw. */
  protected readonly formInternals: ElementInternals | undefined

  /** Undo functions for `listen()`. */
  private readonly disposers: (() => void)[] = []

  /** Made on first `classes()`. */
  private builder: ClassBuilder | undefined

  constructor(host: HTMLElement, root: NativeFallbackRoot, error?: unknown, internals?: ElementInternals) {
    this.host = host
    this.root = root
    this.error = error
    this.internals = internals
    this.formInternals = (host.constructor as { formAssociated?: boolean }).formAssociated ? internals : undefined
  }

  ////////////////
  // ## Entry point
  ////////////////

  /**
   * Build the fallback for `host` into `root`, replacing its children.
   * - Call as `ButtonFallback.render(this, this.shadowRoot, error, this.internals)`.
   * - SIDE EFFECT: adds custom state `errored` to `internals`, when given.
   * - The component's own adopted stylesheets stay;  only children are replaced.
   */
  static render<T extends NativeFallback>(
    this: new (host: HTMLElement, root: NativeFallbackRoot, error?: unknown, internals?: ElementInternals) => T,
    host: HTMLElement,
    root: NativeFallbackRoot,
    error?: unknown,
    internals?: ElementInternals
  ): NativeFallbackHandle {
    const fallback = new this(host, root, error, internals)
    root.replaceChildren(...fallback.build())
    fallback.attached()
    try {
      internals?.states.add("errored")
    } catch {
      // Safari before 17.4 wants `--errored`;  the state is for page styling only.
    }
    return { dispose: () => fallback.dispose(), degraded: fallback.degraded }
  }

  /** Nodes to put in `root`. */
  protected abstract build(): Node[]

  /**
   * Runs once the built nodes are in `root`, for work that needs them attached, e.g. `setValidity(..., anchor)`.
   * - Default:  nothing.
   */
  protected attached() {}

  /** Remove every listener `listen()` added. */
  dispose() {
    for (const undo of this.disposers.splice(0)) undo()
  }

  ////////////////
  // ## Reading the host
  ////////////////

  /** Host attribute `name`, or `null`. */
  protected attr(name: AttributeNameOf<V>): string | null {
    return this.host.getAttribute(name)
  }

  /** Host attribute `name` as a boolean, `disabled="no"` ~== false. */
  protected flag(name: AttributeNameOf<V>): boolean {
    return Converters.boolean(this.host.getAttribute(name), name)
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
      if (value == null) continue
      if (spec.kind === "keyOnly") input[spec.name] = Converters.boolean(value, spec.name)
      else if (spec.kind === "keyOrValueAndKey") input[spec.name] = Converters.keyOrValue(value, undefined)
      else input[spec.name] = value
    }
    this.builder ??= new ClassBuilder(this.vocabulary)
    return this.builder.build(input, { extra })
  }

  /** A vocabulary `default` as attribute text:  `true` => bare (`""`), `false` / `null` / absent => `null`. */
  private static defaultText(value: string | number | boolean | null | undefined): string | null {
    if (value == null || value === false) return null
    return value === true ? "" : String(value)
  }

  /** The host's form (`internals.form`, else an ancestor `<form>`), or `null`. */
  protected form(): HTMLFormElement | null {
    return this.formInternals?.form ?? this.host.closest("form")
  }

  ////////////////
  // ## Building
  ////////////////

  /** Element `tag` with `attributes` and `children` (strings become text nodes). */
  protected create<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    attributes: NativeFallbackAttributes = {},
    ...children: (Node | string)[]
  ): HTMLElementTagNameMap[K] {
    const element = this.host.ownerDocument.createElement(tag)
    for (const [name, value] of Object.entries(attributes)) {
      if (value != null && value !== false) element.setAttribute(name, value === true ? "" : value)
    }
    element.append(...children)
    return element
  }

  /** A `<slot>` for light-DOM content, with `fallback` text shown while nothing is slotted. */
  protected slot(fallback?: string | null): HTMLSlotElement {
    return this.create("slot", {}, ...(fallback ? [fallback] : []))
  }

  /**
   * Give `target` its `part` and the host's accessibility attributes.
   * - `name` MUST be a vocabulary part (dev warning otherwise);  `extra` parts are added unchecked.
   * - Copies every `aria-*` from the host.  NOTE: idref ones (`aria-labelledby`) can't cross the shadow
   *   boundary, so they dangle.
   * - a boolean `loading` becomes `aria-busy`;  a vocabulary where it isn't boolean (`<ui-image loading="lazy">`,
   *   the native `<img loading>`) is left alone.
   */
  protected decorate<E extends Element>(target: E, name: string, ...extra: string[]): E {
    if (!this.vocabulary.parts.some((part) => part.name === name)) {
      Warnings.devWarn(`<${this.vocabulary.tag}> fallback`, `"${name}" is not a part in its vocabulary`)
    }
    target.setAttribute("part", [name, ...extra].join(" "))
    for (const { name: attribute, value } of this.host.attributes) {
      if (attribute.startsWith("aria-")) target.setAttribute(attribute, value)
    }
    const loading = this.vocabulary.attributes.find(({ name }) => name === LOADING)
    if (loading?.kind === "keyOnly" && Converters.boolean(this.host.getAttribute(LOADING), LOADING)) {
      target.setAttribute("aria-busy", "true")
    }
    return target
  }

  /** `addEventListener`, undone by `dispose()`. */
  protected listen<E extends Event = Event>(target: EventTarget, type: string, handler: (event: E) => void) {
    target.addEventListener(type, handler as EventListener)
    this.disposers.push(() => target.removeEventListener(type, handler as EventListener))
  }
}

/** The busy-flag attribute name. */
const LOADING = "loading"
