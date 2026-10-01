import { createMemo } from "solid-js"
import { Dynamic, type JSX } from "@solidjs/web"

import {
  PartContext,
  proto,
  UIElement,
  type ItemContext,
  type ItemOwner,
  type ListSelectDetail,
  type UIHost,
  LIST,
  LISTITEM,
  PAGE,
  ITEM,
  DISABLED_STATE,
  CLICK
} from "$/ui/core"

import { listVocabulary } from "./ui-list.vocabulary.en"
import { ListFallback } from "./ui-list.fallback"

import listCSS from "./ui-list.css?inline"
import { UL, OL, INTERACTIVE } from "./ui-list.types"

/****************
 * ### `<ui-list>`
 * A list:  `<ul class="ui [size] [keyOnly ...] [relaxed] [floated] [aligned] list" part="list" role="list">`
 * around the `<slot>` (`<ol>` when `ordered`);  its children are GENERIC `<ui-item>`s.
 * - Owner of items (`ItemOwner`):  every `<ui-item>` inside finds this list (`PartContext`) and asks
 *   `itemContext()` how to render -- a `role=listitem` host;  a `<button>` in a `selection` list (a link with
 *   `href`, a `<button>` with the item's own `link`, a `<div>` otherwise).  Items adopt THIS class's `styles`,
 *   so `ui-list.css` holds the item rules too, and the list's variations reach them as inherited tokens.
 * - A part too (`isPart`, noun `list`):  a `<ui-list>` inside a list is Fomantic's sub-list.  It renders
 *   `<ul class="list">` (no `ui`, no variations of its own) and inherits the outer list's look;  it's an `<ol>` when
 *   it or an outer list is `ordered`, and its items are interactive when an outer list's are.
 * - `role="list"` explicitly:  `list-style: none` drops list semantics in Safari.
 * - Numbering is CSS:  `counter-reset` on this root, `counter-increment` on each item root (`ui-list.css`);  counters
 *   cross the shadow boundaries and nest (`1.2`).
 * - Events:  `ui-select` when an interactive item of THIS list (not of a sub-list) is activated -- one click
 *   listener on the host;  Enter / Space on a link / button click natively, so keyboard needs nothing more.
 ****************/
export class UIList extends UIElement<typeof listVocabulary> implements ItemOwner {
  @proto static vocabulary = listVocabulary
  @proto static styles = { list: listCSS }
  @proto static Fallback = ListFallback
  @proto static isPart = true
  @proto static delegatesFocus = false

  /** Outer list, when nested. */
  readonly context = new PartContext(this.host, this.vocabulary.noun)

  ////////////////
  // ## Derived state
  ////////////////

  /** Outer list's controller:  only a list owns the `list` part.  Tracked. */
  readonly outer = createMemo(
    () => (this.context.owner.get()?.owner as UIHost | undefined)?.controller as UIList | undefined
  )

  /** Nested in another list:  the sub-list form. */
  readonly nested = createMemo(() => !!this.context.owner.get())

  /** Numbered:  `ordered`, or inside an ordered list. */
  readonly isOrdered = createMemo((): boolean => this.attrs.ordered || !!this.outer()?.isOrdered())

  /** Items are `<button>`s:  `selection`, or inside a selection list. */
  readonly isInteractive = createMemo((): boolean => this.attrs.selection || !!this.outer()?.isInteractive())

  /** What every item gets;  one object while nothing changes, so items don't re-render. */
  readonly items = createMemo((): ItemContext => ({
    hostRole: LISTITEM,
    interactive: this.isInteractive(),
    current: PAGE
  }))

  constructor(...args: ConstructorParameters<typeof UIElement>) {
    super(...args)
    // SIDE EFFECT:  one listener for every item's activation
    this.host.addEventListener(CLICK, this.onClick)
    this.host.addReleaseCallback(() => this.host.removeEventListener(CLICK, this.onClick))
  }

  /** `ItemOwner`:  how items render.  Tracked. */
  itemContext(): ItemContext {
    return this.items()
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <Dynamic
        component={this.isOrdered() ? OL : UL}
        class={this.nested() ? this.vocabulary.noun : this.classes()}
        part={this.part("list")}
        role={LIST}
      >
        <slot />
      </Dynamic>
    )
  }

  ////////////////
  // ## Events
  ////////////////

  /** A click (or Enter / Space) on an interactive item of THIS list:  `ui-select`. */
  private readonly onClick = (event: MouseEvent) => {
    const item = this.activatedItem(event)
    if (!item) return
    const detail: ListSelectDetail = { value: UIList.valueOf(item), item, originalEvent: event }
    this.emit("ui-select", detail)
  }

  /**
   * The item of this list whose link / button `event` went through, or `undefined`.
   * - Walks `composedPath()` inward-out:  the first ITEM on it decides;  an item of a sub-list means the sub-list
   *   handles it.
   * - Only through the item's own root (`<a>` / `<button>` in its shadow):  a click on a plain `<div>` item, or on
   *   a link inside its content, doesn't select it.
   */
  private activatedItem(event: Event): UIHost | undefined {
    let root: Element | undefined
    for (const target of event.composedPath()) {
      if (target === this.host) return undefined
      if (!(target instanceof Element)) continue
      const context = ((target as UIHost).controller as { context?: PartContext } | undefined)?.context
      if (context?.noun !== ITEM) {
        root = target
        continue
      }
      const ours = context.owner.get()?.owner === this.host
      const interactive = !!root && root.parentNode === target.shadowRoot && INTERACTIVE.has(root.localName)
      return ours && interactive && !target.matches(DISABLED_STATE) ? (target as UIHost) : undefined
    }
    return undefined
  }

  /** `ui-select`'s value:  the item's `value`, else its `text`, else its trimmed text. */
  private static valueOf(item: UIHost): string {
    const { value, text } = item as UIHost & { value?: string; text?: string }
    return value || text || (item.textContent ?? "").trim()
  }
}
