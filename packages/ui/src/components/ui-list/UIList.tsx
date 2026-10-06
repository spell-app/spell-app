import { createMemo } from "solid-js"
import { Dynamic, type JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { listVocabulary } from "./ui-list.vocabulary.en"
import { ListFallback } from "./ui-list.fallback"

import listCSS from "./ui-list.css?inline"

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
export class UIList extends E.UIElement<typeof listVocabulary> implements UIT.ItemOwner {
  @E.proto static vocabulary = listVocabulary
  @E.proto static styles = { list: listCSS }
  @E.proto static Fallback = ListFallback
  @E.proto static isPart = true
  @E.proto static delegatesFocus = false

  /** Outer list, when nested. */
  readonly context = new E.PartContext(this.host, this.vocabulary.noun)

  ////////////////
  // ## Derived state
  ////////////////

  /** Outer list's controller:  only a list owns the `list` part.  Tracked. */
  readonly outer = createMemo(() => this.context.ownerController<UIList>())

  /** Nested in another list:  the sub-list form. */
  readonly isNested = createMemo(() => !!this.context.owner.get())

  /** Numbered:  `ordered`, or inside an ordered list. */
  readonly isOrdered = createMemo((): boolean => this.attrs.ordered || !!this.outer()?.isOrdered())

  /** Items are `<button>`s:  `selection`, or inside a selection list. */
  readonly isInteractive = createMemo((): boolean => this.attrs.selection || !!this.outer()?.isInteractive())

  /** What every item gets;  one object while nothing changes, so items don't re-render. */
  readonly items = createMemo((): UIT.ItemContext => ({
    hostRole: UIT.LISTITEM,
    interactive: this.isInteractive(),
    current: UIT.PAGE
  }))

  constructor(...args: ConstructorParameters<typeof E.UIElement>) {
    super(...args)
    // SIDE EFFECT:  one listener for every item's activation
    this.host.addEventListener(UIT.CLICK, this.onClick)
    this.host.addReleaseCallback(() => this.host.removeEventListener(UIT.CLICK, this.onClick))
  }

  /** `ItemOwner`:  how items render.  Tracked. */
  itemContext(): UIT.ItemContext {
    return this.items()
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <Dynamic
        component={this.isOrdered() ? UIT.OL : UIT.UL}
        class={this.isNested() ? this.vocabulary.noun : this.classes()}
        part={this.part("list")}
        role={UIT.LIST}
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
    const detail: UIT.ListSelectDetail = { value: UIList.valueFor(item), item, originalEvent: event }
    this.emit("ui-select", detail)
  }

  /**
   * The item of this list whose link / button `event` went through, or `undefined`.
   * - Walks `composedPath()` inward-out:  the first ITEM on it decides;  an item of a sub-list means the sub-list
   *   handles it.
   * - Only through the item's own root (`<a>` / `<button>` in its shadow):  a click on a plain `<div>` item, or on
   *   a link inside its content, doesn't select it.
   */
  private activatedItem(event: Event): E.UIHost | undefined {
    let root: Element | undefined
    for (const target of event.composedPath()) {
      if (target === this.host) return undefined
      if (!(target instanceof Element)) continue
      const context = ((target as E.UIHost).controller as { context?: E.PartContext } | undefined)?.context
      if (context?.noun !== UIT.ITEM) {
        root = target
        continue
      }
      const isOurs = context.owner.get()?.owner === this.host
      const isInteractive = !!root && root.parentNode === target.shadowRoot && INTERACTIVE_ROOTS.has(root.localName)
      return isOurs && isInteractive && !target.matches(UIT.DISABLED_STATE) ? (target as E.UIHost) : undefined
    }
    return undefined
  }

  /**
   * `ui-select`'s value for `item`:  its `value`, else its `text`, else its trimmed text.
   * - Static:  a pure lookup on the item.
   */
  private static valueFor(item: E.UIHost): string {
    const { value, text } = item as E.UIHost & { value?: string; text?: string }
    return value || text || (item.textContent ?? "").trim()
  }
}

/** Item roots that can be activated:  a link, a button. */
const INTERACTIVE_ROOTS: ReadonlySet<string> = new Set([UIT.ANCHOR_TAG, UIT.BUTTON])
