import { Show } from "solid-js"
import { Dynamic, isServer, type JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { cardVocabulary } from "./UICard.en"
import type { UICards } from "./UICards"

import cardCSS from "./UICard.css?inline"

/**
 * Same nouns:  a rescan finding them again changes nothing (`UICard.slottedNouns`'s `equals`).
 * - Above the class:  `@watches({ equals })` reads it while the class is defined.
 */
function isSameNouns(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
  return a.size === b.size && [...a].every((noun) => b.has(noun))
}

/****************
 * ### `UICard`
 * The component behind `<ui-card>`:  a card of content parts, `<article class="ui ... card" part="card">`.
 * With `href` the whole card is a link, `<a class="ui ... card" href>`.
 *
 * - Why `<article>`:  HTML's "complete, or self-contained, composition" (a person, a product, a post),
 *   which assistive tech lets a reader jump between.
 *   - No ARIA pattern (APG has no card).  A link card is one link, named by its content.
 *   - `link` alone is only Fomantic's hover LOOK:  a card that goes somewhere needs `href`
 *     (a `<button>` card would nest the buttons inside it).
 *
 * - Content:  the generic parts (`<ui-content>`, `<ui-header>`, `<ui-meta>`, `<ui-description>`, `<ui-extra>`),
 *   styled `:state(in-card)` by `UIParts.css`;  a slotted `<img>` is a full-width image.
 *
 * - Shorthands (`image`, `header`, `meta`, `description`, `extra`) draw the same parts as STATIC markup
 *   in the shadow root (`<div class="header in-card">`), styled by the `UIParts.css` this card adopts.
 *   - Order:  the image, one content block (header, meta, description), the slot, then extra.
 *   - A slotted part of the same noun anywhere inside (or a slotted `<img>`, for `image`) wins:
 *     that shorthand isn't drawn.
 *
 * - In a `<ui-cards>` group (`PartContext`, noun `card`):
 *   the DOM element is a `role=listitem` with `:state(in-cards)`,
 *   and every shared variation the card doesn't set comes from the group (`classValue()`).
 *
 * - `loading`:  `aria-busy` (through `internals`) and a visually hidden `role=status` "Loading…".
 * - `disabled`:  unusable, the base class's way (`elementSetup.disabled`):  `aria-disabled`, everything inside inert;
 *   and a link card loses its `href`.
 ****************/
export class UICard extends E.UIComponent<typeof cardVocabulary> {
  @E.proto static vocabulary = cardVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { card: cardCSS, ...E.PartComponent.prototype.elementSetup.styleSheets },
    // `loading`:  Fomantic's veil
    loading: "its own"
  } satisfies Partial<E.ElementSetup>
  ////////////////
  // ## Group
  ////////////////

  /** Group, if any. */
  readonly context = new E.PartContext({ domElement: this.domElement, noun: this.vocabulary.noun })

  /** The group's component. */
  get group(): UICards | undefined {
    return this.context.ownerComponent<UICards>()
  }

  /** A shared variation the card doesn't set comes from its group. */
  protected classValue(name: E.AttributeName<typeof cardVocabulary>): unknown {
    const own = super.classValue(name)
    if (own || !SHARED_VARIATIONS.has(name)) return own
    return this.group?.variationFor(name as UIT.CardSharedVariation)
  }

  ////////////////
  // ## Loading
  ////////////////

  /** `loading`, as `:state(loading)` and `aria-busy`. */
  @E.cssState("loading")
  @E.aria("busy")
  get isLoading(): boolean {
    return this.loading
  }

  /** A list item in a group. */
  @E.aria("role")
  protected get ariaRole(): string | undefined {
    return this.group ? "listitem" : undefined
  }

  ////////////////
  // ## Shorthands
  ////////////////

  /**
   * Nouns the slotted content already has (`header`, `extra` ...;  `image` for an `<img>`).
   * - Follows what's slotted, at any depth:  shorthands yield to it.
   */
  @E.watches({ childList: true, subtree: true, equals: isSameNouns })
  get slottedNouns(): ReadonlySet<string> {
    return isServer ? NOTHING_SLOTTED : this.scan()
  }

  /** Does shorthand `noun` render:  set, and no slotted part of that noun? */
  rendersShorthand(noun: Shorthand): boolean {
    return !!this[noun] && !this.slottedNouns.has(noun)
  }

  /** Some shorthand of the content block renders. */
  get hasContent(): boolean {
    return ContentShorthands.some((noun) => this.rendersShorthand(noun))
  }

  /** Shorthand nouns the light DOM already has, read from the DOM now. */
  private scan(): ReadonlySet<string> {
    const nouns = new Set<string>()
    for (const child of this.domElement.children) if (child.localName === "img" && !child.slot) nouns.add(UIT.IMAGE)
    for (const element of this.domElement.querySelectorAll("*")) {
      const noun = E.UIComponent.registry.definitions.get(element.localName)?.vocabulary.noun
      if (noun && (Shorthands as readonly string[]).includes(noun)) nouns.add(noun)
    }
    return nouns
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** Root element:  a link with `href`, else an article. */
  get rootTag(): "a" | "article" {
    return this.href ? "a" : "article"
  }

  render(): JSX.Element {
    const isLink = () => this.rootTag === "a"
    return (
      <Dynamic
        component={this.rootTag}
        class={this.rootClass}
        part={this.partForName("card")}
        href={isLink() && !this.disabled ? this.href : undefined}
        target={isLink() ? this.target : undefined}
        aria-disabled={isLink() && this.disabled ? "true" : undefined}
      >
        <Show when={this.rendersShorthand(UIT.IMAGE)}>
          <div class={UIT.IMAGE} part={this.partForName("image")}>
            <img src={this.image} alt={this.alt ?? ""} />
          </div>
        </Show>
        <Show when={this.hasContent}>
          <div class={this.staticPart(UIT.CONTENT)} part={this.partForName("content")}>
            <Show when={this.rendersShorthand(UIT.HEADER)}>
              <div class={this.staticPart(UIT.HEADER)} part={this.partForName("header")}>
                {this.header}
              </div>
            </Show>
            <Show when={this.rendersShorthand(META)}>
              <div class={this.staticPart(META)} part={this.partForName("meta")}>
                {this.meta}
              </div>
            </Show>
            <Show when={this.rendersShorthand(UIT.DESCRIPTION)}>
              <div class={this.staticPart(UIT.DESCRIPTION)} part={this.partForName("description")}>
                {this.description}
              </div>
            </Show>
          </div>
        </Show>
        <slot />
        <Show when={this.rendersShorthand(EXTRA)}>
          <div class={this.staticPart(EXTRA)} part={this.partForName("extra")}>
            {this.extra}
          </div>
        </Show>
        <Show when={this.loading}>
          <span class={UIT.VISUALLY_HIDDEN} role="status">
            {this.translationForKey("loading")}
          </span>
        </Show>
      </Dynamic>
    )
  }

  /** Classes of a shorthand block:  the part noun and the static owner class, e.g. `header in-card`. */
  private staticPart(noun: string): string {
    return `${noun} ${UIT.PART_STATIC_CLASS_PREFIX}${this.vocabulary.noun}`
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UICard extends E.AttributeValues<typeof cardVocabulary> {}

/** The `meta` shorthand:  its attribute, part noun and class word. */
const META = "meta"

/** The `extra` shorthand:  its attribute, part noun and class word. */
const EXTRA = "extra"

/** Shorthands drawn in the card's content block, in order. */
const ContentShorthands = [UIT.HEADER, META, UIT.DESCRIPTION] as const

/** Every shorthand attribute, by the part noun it renders. */
const Shorthands = [UIT.IMAGE, UIT.HEADER, META, UIT.DESCRIPTION, EXTRA] as const

/** One of `Shorthands`. */
type Shorthand = (typeof Shorthands)[number]

/** Variations a card takes from its group (`UIT.CardSharedVariation`). */
const SHARED_VARIATIONS: ReadonlySet<string> = new Set<UIT.CardSharedVariation>([
  "size",
  "color",
  "horizontal",
  "raised",
  "link",
  "basic",
  "inverted"
])

/** Nothing slotted:  the server render's `slottedNouns`. */
const NOTHING_SLOTTED: ReadonlySet<string> = new Set()
