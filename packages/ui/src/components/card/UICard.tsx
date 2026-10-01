import { Show, createEffect, createMemo, onSettled } from "solid-js"
import { Dynamic, isServer, type JSX } from "@solidjs/web"

import {
  Cell,
  ContentPart,
  PART_STATIC_CLASS_PREFIX,
  PartContext,
  proto,
  UIElement,
  type AttributeName,
  type CardSharedVariation,
  type UIHost
} from "$/ui/core"

import { cardVocabulary } from "./card.vocabulary.en"
import { CardFallback } from "./card.fallback"
import type { UICards } from "./UICards"

import cardCSS from "./card.css?inline"

/** Vocabulary type, for brevity. */
type Vocabulary = typeof cardVocabulary

/****************
 * ### `<ui-card>`
 * A card:  `<article class="ui ... card" part="card">` of content parts;  with `href` the whole card is a link,
 * `<a class="ui ... card" href>`.
 * - Why `<article>`:  HTML's "complete, or self-contained, composition" -- a person, a product, a post -- and
 *   what assistive tech lets a reader jump between.  No ARIA pattern (APG has no card);  a link card is one
 *   link, named by its content.  `link` alone is only Fomantic's hover LOOK:  a card that goes somewhere needs
 *   `href` (a `<button>` card would nest the buttons inside it).
 * - Content:  the generic parts (`<ui-content>`, `<ui-header>`, `<ui-meta>`, `<ui-description>`, `<ui-extra>`),
 *   styled `:state(in-card)` by `parts.css`;  a slotted `<img>` is a full-width image.
 * - Shorthands (`image`, `header`, `meta`, `description`, `extra`) render the same parts as STATIC markup in the
 *   shadow root (`<div class="header in-card">`), styled by the `parts.css` this card adopts.  Order:  image,
 *   one content block (header, meta, description), the slot, extra.  A slotted part of the same noun anywhere
 *   inside (or a slotted `<img>`, for `image`) wins:  that shorthand isn't rendered.
 * - In a `<ui-cards>` group (`PartContext`, noun `card`):  a `role=listitem` host with `:state(in-cards)`, and
 *   every shared variation it doesn't set comes from the group (`classValue()`).
 * - `loading`:  `aria-busy` (internals) and a visually hidden `role=status` "Loading…";  `disabled`:
 *   `aria-disabled`, and a link card loses its `href`.
 ****************/
export class UICard extends UIElement<Vocabulary> {
  @proto static vocabulary = cardVocabulary
  @proto static styles = { card: cardCSS, ...ContentPart.styles }
  @proto static Fallback = CardFallback

  /** Group, if any. */
  readonly context = new PartContext(this.host, this.vocabulary.noun)

  /** Nouns the slotted content already has (`header`, `extra` ...;  `image` for an `<img>`).  Tracked. */
  readonly slotted = new Cell<ReadonlySet<string>>(isServer ? EMPTY : this.scan(), { equals: UICard.sameNouns })

  ////////////////
  // ## Derived state
  ////////////////

  /** The group's controller.  Tracked. */
  readonly group = createMemo(
    () => (this.context.owner.get()?.owner as UIHost | undefined)?.controller as UICards | undefined
  )

  /** Root element:  a link with `href`, else an article. */
  readonly tag = createMemo(() => (this.attrs.href ? LINK : ARTICLE))

  /** Some shorthand of the content block renders. */
  readonly hasContent = createMemo(() => CONTENT_SHORTHANDS.some((noun) => this.shows(noun)))

  constructor(...args: ConstructorParameters<typeof UIElement>) {
    super(...args)
    const { host } = this
    const { internals } = host
    // SIDE EFFECT:  a list item in a group;  busy / disabled for assistive tech
    createEffect(
      () => [this.group() ? LISTITEM : null, this.attrs.loading, this.attrs.disabled] as const,
      ([role, loading, disabled]) => {
        internals.role = role
        internals.ariaBusy = loading ? TRUE : null
        internals.ariaDisabled = disabled ? TRUE : null
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
  shows(noun: Shorthand): boolean {
    return !!this.attrs[noun] && !this.slotted.get().has(noun)
  }

  isDisabled(): boolean {
    return this.attrs.disabled
  }

  /** A shared variation the card doesn't set comes from its group. */
  protected classValue(name: AttributeName<Vocabulary>): unknown {
    const own = super.classValue(name)
    if (own || !SHARED.has(name)) return own
    return this.group()?.shared(name as CardSharedVariation)
  }

  protected hostStates() {
    return { disabled: this.attrs.disabled, loading: this.attrs.loading }
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    const link = () => this.tag() === LINK
    return (
      <Dynamic
        component={this.tag()}
        class={this.classes()}
        part={this.part("card")}
        href={link() && !this.attrs.disabled ? this.attrs.href : undefined}
        target={link() ? this.attrs.target : undefined}
        aria-disabled={link() && this.attrs.disabled ? TRUE : undefined}
      >
        <Show when={this.shows(IMAGE)}>
          <div class={IMAGE} part={this.part("image")}>
            <img src={this.attrs.image} alt={this.attrs.alt ?? ""} />
          </div>
        </Show>
        <Show when={this.hasContent()}>
          <div class={this.staticPart(CONTENT)} part={this.part("content")}>
            <Show when={this.shows(HEADER)}>
              <div class={this.staticPart(HEADER)} part={this.part("header")}>
                {this.attrs.header}
              </div>
            </Show>
            <Show when={this.shows(META)}>
              <div class={this.staticPart(META)} part={this.part("meta")}>
                {this.attrs.meta}
              </div>
            </Show>
            <Show when={this.shows(DESCRIPTION)}>
              <div class={this.staticPart(DESCRIPTION)} part={this.part("description")}>
                {this.attrs.description}
              </div>
            </Show>
          </div>
        </Show>
        <slot />
        <Show when={this.shows(EXTRA)}>
          <div class={this.staticPart(EXTRA)} part={this.part("extra")}>
            {this.attrs.extra}
          </div>
        </Show>
        <Show when={this.attrs.loading}>
          <span class={VISUALLY_HIDDEN} role={STATUS}>
            {this.text("loading")}
          </span>
        </Show>
      </Dynamic>
    )
  }

  /** Classes of a shorthand block:  the part noun and the static owner class, e.g. `header in-card`. */
  private staticPart(noun: string): string {
    return `${noun} ${PART_STATIC_CLASS_PREFIX}${this.vocabulary.noun}`
  }

  /** Shorthand nouns the light DOM already has, read from the DOM now. */
  private scan(): ReadonlySet<string> {
    const nouns = new Set<string>()
    for (const child of this.host.children) if (child.localName === IMG && !child.slot) nouns.add(IMAGE)
    for (const element of this.host.querySelectorAll("*")) {
      const noun = UIElement.definitions.get(element.localName)?.vocabulary.noun
      if (noun && (SHORTHANDS as readonly string[]).includes(noun)) nouns.add(noun)
    }
    return nouns
  }

  /** Same nouns:  no update. */
  private static sameNouns(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
    return a.size === b.size && [...a].every((noun) => b.has(noun))
  }
}

/** Shorthand attributes, by the part noun each renders. */
type Shorthand = (typeof SHORTHANDS)[number]

/** Shorthand nouns. */
const IMAGE = "image"
const CONTENT = "content"
const HEADER = "header"
const META = "meta"
const DESCRIPTION = "description"
const EXTRA = "extra"

/** Every shorthand, and those rendered in the content block. */
const SHORTHANDS = [IMAGE, HEADER, META, DESCRIPTION, EXTRA] as const
const CONTENT_SHORTHANDS = [HEADER, META, DESCRIPTION] as const

/** Variations a card takes from its group (`CardSharedVariation`). */
const SHARED: ReadonlySet<string> = new Set<CardSharedVariation>([
  "size",
  "color",
  "horizontal",
  "raised",
  "link",
  "basic",
  "inverted"
])

/** Nothing slotted. */
const EMPTY: ReadonlySet<string> = new Set()

/** Root tags. */
const LINK = "a"
const ARTICLE = "article"

/** A light-DOM image. */
const IMG = "img"

/** Host role in a group. */
const LISTITEM = "listitem"

/** ARIA boolean. */
const TRUE = "true"

/** Utility class (`utilities.css`, adopted in every root) for the loading announcement. */
const VISUALLY_HIDDEN = "ui-visually-hidden-force"

/** Role of the loading announcement. */
const STATUS = "status"
