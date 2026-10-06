import { Show, createMemo, onSettled } from "solid-js"
import { Dynamic, isServer, type JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { cardVocabulary } from "./ui-card.vocabulary.en"
import { CardFallback } from "./ui-card.fallback"
import type { UICards } from "./UICards"
import { ARTICLE, ContentShorthands, EXTRA, META } from "./ui-card.types"

import cardCSS from "./ui-card.css?inline"

/****************
 * ### `<ui-card>`
 * A card:  `<article class="ui ... card" part="card">` of content parts;  with `href` the whole card is a link,
 * `<a class="ui ... card" href>`.
 * - Why `<article>`:  HTML's "complete, or self-contained, composition" -- a person, a product, a post -- and
 *   what assistive tech lets a reader jump between.  No ARIA pattern (APG has no card);  a link card is one
 *   link, named by its content.  `link` alone is only Fomantic's hover LOOK:  a card that goes somewhere needs
 *   `href` (a `<button>` card would nest the buttons inside it).
 * - Content:  the generic parts (`<ui-content>`, `<ui-header>`, `<ui-meta>`, `<ui-description>`, `<ui-extra>`),
 *   styled `:state(in-card)` by `ui-parts.css`;  a slotted `<img>` is a full-width image.
 * - Shorthands (`image`, `header`, `meta`, `description`, `extra`) render the same parts as STATIC markup in the
 *   shadow root (`<div class="header in-card">`), styled by the `ui-parts.css` this card adopts.  Order:  image,
 *   one content block (header, meta, description), the slot, extra.  A slotted part of the same noun anywhere
 *   inside (or a slotted `<img>`, for `image`) wins:  that shorthand isn't rendered.
 * - In a `<ui-cards>` group (`PartContext`, noun `card`):  a `role=listitem` host with `:state(in-cards)`, and
 *   every shared variation it doesn't set comes from the group (`classValue()`).
 * - `loading`:  `aria-busy` (internals) and a visually hidden `role=status` "Loading…";  `disabled`:
 *   `aria-disabled`, and a link card loses its `href`.
 ****************/
export class UICard extends E.UIElement<typeof cardVocabulary> {
  @E.proto static vocabulary = cardVocabulary
  @E.proto static styles = { card: cardCSS, ...E.ContentPart.styles }
  @E.proto static Fallback = CardFallback

  /** Group, if any. */
  readonly context = new E.PartContext({ host: this.host, noun: this.vocabulary.noun })

  /** Nouns the slotted content already has (`header`, `extra` ...;  `image` for an `<img>`).  Tracked. */
  readonly slotted = new E.Cell<ReadonlySet<string>>(isServer ? NOTHING_SLOTTED : this.scan(), {
    equals: UICard.isSameNouns
  })

  ////////////////
  // ## Derived state
  ////////////////

  /** The group's controller.  Tracked. */
  readonly group = createMemo(() => this.context.ownerController<UICards>())

  /** Root element:  a link with `href`, else an article. */
  readonly tag = createMemo(() => (this.attrs.href ? UIT.ANCHOR_TAG : ARTICLE))

  /** Some shorthand of the content block renders. */
  readonly hasContent = createMemo(() => ContentShorthands.some((noun) => this.isShowing(noun)))

  constructor(...args: ConstructorParameters<typeof E.UIElement>) {
    super(...args)
    const { host } = this
    const { internals } = host
    // SIDE EFFECT:  a list item in a group;  busy / disabled for assistive tech
    this.hostEffect(
      () => [this.group() ? UIT.LISTITEM : undefined, this.attrs.loading, this.attrs.disabled] as const,
      ([role, isLoading, isDisabled]) => {
        internals.role = role ?? null
        internals.ariaBusy = isLoading ? UIT.TRUE : null
        internals.ariaDisabled = isDisabled ? UIT.TRUE : null
      }
    )
    if (isServer) return
    // SIDE EFFECT:  shorthands follow what's slotted, at any depth
    onSettled(() => {
      const observer = new MutationObserver(() => this.slotted.set(this.scan()))
      observer.observe(host, { childList: true, subtree: true })
      this.slotted.set(this.scan())
      return () => observer.disconnect()
    })
  }

  /** Does shorthand `noun` render:  set, and no slotted part of that noun?  Tracked. */
  isShowing(noun: Shorthand): boolean {
    return !!this.attrs[noun] && !this.slotted.get().has(noun)
  }

  isDisabled(): boolean {
    return this.attrs.disabled
  }

  /** A shared variation the card doesn't set comes from its group. */
  protected classValue(name: E.AttributeName<typeof cardVocabulary>): unknown {
    const own = super.classValue(name)
    if (own || !SHARED_VARIATIONS.has(name)) return own
    return this.group()?.variationFor(name as UIT.CardSharedVariation)
  }

  protected hostStates() {
    return { disabled: this.attrs.disabled, loading: this.attrs.loading }
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    const isLink = () => this.tag() === UIT.ANCHOR_TAG
    return (
      <Dynamic
        component={this.tag()}
        class={this.classes()}
        part={this.part("card")}
        href={isLink() && !this.attrs.disabled ? this.attrs.href : undefined}
        target={isLink() ? this.attrs.target : undefined}
        aria-disabled={isLink() && this.attrs.disabled ? UIT.TRUE : undefined}
      >
        <Show when={this.isShowing(UIT.IMAGE)}>
          <div class={UIT.IMAGE} part={this.part("image")}>
            <img src={this.attrs.image} alt={this.attrs.alt ?? ""} />
          </div>
        </Show>
        <Show when={this.hasContent()}>
          <div class={this.staticPart(UIT.CONTENT)} part={this.part("content")}>
            <Show when={this.isShowing(UIT.HEADER)}>
              <div class={this.staticPart(UIT.HEADER)} part={this.part("header")}>
                {this.attrs.header}
              </div>
            </Show>
            <Show when={this.isShowing(META)}>
              <div class={this.staticPart(META)} part={this.part("meta")}>
                {this.attrs.meta}
              </div>
            </Show>
            <Show when={this.isShowing(UIT.DESCRIPTION)}>
              <div class={this.staticPart(UIT.DESCRIPTION)} part={this.part("description")}>
                {this.attrs.description}
              </div>
            </Show>
          </div>
        </Show>
        <slot />
        <Show when={this.isShowing(EXTRA)}>
          <div class={this.staticPart(EXTRA)} part={this.part("extra")}>
            {this.attrs.extra}
          </div>
        </Show>
        <Show when={this.attrs.loading}>
          <span class={UIT.VISUALLY_HIDDEN} role={UIT.STATUS}>
            {this.text("loading")}
          </span>
        </Show>
      </Dynamic>
    )
  }

  /** Classes of a shorthand block:  the part noun and the static owner class, e.g. `header in-card`. */
  private staticPart(noun: string): string {
    return `${noun} ${UIT.PART_STATIC_CLASS_PREFIX}${this.vocabulary.noun}`
  }

  /** Shorthand nouns the light DOM already has, read from the DOM now. */
  private scan(): ReadonlySet<string> {
    const nouns = new Set<string>()
    for (const child of this.host.children) if (child.localName === UIT.IMG && !child.slot) nouns.add(UIT.IMAGE)
    for (const element of this.host.querySelectorAll("*")) {
      const noun = E.UIElement.definitions.get(element.localName)?.vocabulary.noun
      if (noun && (Shorthands as readonly string[]).includes(noun)) nouns.add(noun)
    }
    return nouns
  }

  /**
   * Same nouns:  no update.
   * - Static:  the `slotted` cell's `equals`, passed as a value.
   */
  private static isSameNouns(this: void, a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
    return a.size === b.size && [...a].every((noun) => b.has(noun))
  }
}

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

/** Nothing slotted:  the server render's `slotted`. */
const NOTHING_SLOTTED: ReadonlySet<string> = new Set()
