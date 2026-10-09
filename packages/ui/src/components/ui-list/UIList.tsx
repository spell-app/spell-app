import { Dynamic, type JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { listVocabulary } from "./UIList.en"

import listCSS from "./UIList.css?inline"

/****************
 * ### `UIList`
 * The component behind `<ui-list>`:  a list of GENERIC `<ui-item>`s,
 * `<ul class="ui [size] [keyOnly ...] [relaxed] [floated] [aligned] list" part="list" role="list">`
 * around the `<slot>` (an `<ol>` when `ordered`).
 *
 * - It owns its items (`ItemOwner`):  every `<ui-item>` inside finds this list (`PartContext`)
 *   and asks `itemContext()` how to draw itself:
 *   - a DOM element with `role=listitem`;
 *   - in a `selection` list, an interactive box:  a link with `href`, a `<button>` with the item's own `link`,
 *     a `<div>` otherwise.
 *   - Items adopt THIS class's `elementSetup.styleSheets`, so `UIList.css` holds the item rules too,
 *     and the list's variations reach them as inherited tokens.
 *
 * - A part too (`elementSetup.isAPart`, noun `list`):  a `<ui-list>` inside a list is Fomantic's sub-list.
 *   - It draws `<ul class="list">` (no `ui`, no variations of its own) and inherits the outer list's look.
 *   - It's an `<ol>` when it or an outer list is `ordered`, and its items are interactive when an outer list's are.
 *
 * - `role="list"` is explicit:  `list-style: none` drops list semantics in Safari.
 *
 * - Numbering is CSS:  `counter-reset` on this root, `counter-increment` on each item's root (`UIList.css`).
 *   Counters cross the shadow boundaries and nest (`1.2`).
 *
 * - Events:  `ui-select` when an interactive item of THIS list (not of a sub-list) is activated,
 *   from one click listener on the DOM element.
 *   Enter and Space on a link or a button click natively, so the keyboard needs nothing more.
 ****************/
export class UIList extends E.UIComponent<typeof listVocabulary> implements UIT.ItemOwner {
  @E.proto static vocabulary = listVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { list: listCSS },
    isAPart: true,
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  constructor(...args: ConstructorParameters<typeof E.UIComponent>) {
    super(...args)
    // SIDE EFFECT:  one listener for every item's activation
    this.domElement.addEventListener("click", this.onClick)
    this.domElement.addReleaseCallback(() => this.domElement.removeEventListener("click", this.onClick))
  }

  ////////////////
  // ## Nesting
  ////////////////

  /** Outer list, when nested. */
  readonly context = new E.PartContext({ domElement: this.domElement, noun: this.vocabulary.noun })

  /** The outer list's component:  only a list owns the `list` part.  Tracked. */
  get outerList(): UIList | undefined {
    return this.context.ownerComponent<UIList>()
  }

  /** Nested in another list:  the sub-list form. */
  get isNested(): boolean {
    return !!this.context.owner
  }

  /** Numbered:  `ordered`, or inside an ordered list. */
  get isOrdered(): boolean {
    return !!this.ordered || !!this.outerList?.isOrdered
  }

  /** Items are `<button>`s:  `selection`, or inside a selection list. */
  get isInteractive(): boolean {
    return !!this.selection || !!this.outerList?.isInteractive
  }

  ////////////////
  // ## Items
  ////////////////

  /**
   * What every item gets.
   * - `@derived`:  one object while nothing it reads changes, so items don't re-render.
   */
  @E.derived
  get ownItemContext(): UIT.ItemContext {
    return { domElementRole: "listitem", interactive: this.isInteractive, current: "page" }
  }

  /** `ItemOwner`:  how items render.  Tracked. */
  itemContext(): UIT.ItemContext {
    return this.ownItemContext
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <Dynamic
        component={this.isOrdered ? "ol" : "ul"}
        class={this.isNested ? this.vocabulary.noun : this.rootClass}
        part={this.partForName("list")}
        role="list"
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
    this.send("ui-select", detail)
  }

  /**
   * The item of this list whose link / button `event` went through, or `undefined`.
   * - Walks `composedPath()` inward-out:  the first ITEM on it decides;  an item of a sub-list means the sub-list
   *   handles it.
   * - Only through the item's own root (`<a>` / `<button>` in its shadow):  a click on a plain `<div>` item,
   *   or on a link inside its content, doesn't select it.
   */
  private activatedItem(event: Event): E.DOMElement | undefined {
    let root: Element | undefined
    for (const target of event.composedPath()) {
      if (target === this.domElement) return undefined
      if (!(target instanceof Element)) continue
      const context = ((target as E.DOMElement).component as { context?: E.PartContext } | undefined)?.context
      if (context?.noun !== UIT.ITEM) {
        root = target
        continue
      }
      const isOurs = context.owner?.owner === this.domElement
      const isInteractive = !!root && root.parentNode === target.shadowRoot && INTERACTIVE_ROOTS.has(root.localName)
      return isOurs && isInteractive && !target.matches(UIT.DISABLED_STATE) ? (target as E.DOMElement) : undefined
    }
    return undefined
  }

  /**
   * `ui-select`'s value for `item`:  its `value`, else its `text`, else its trimmed text.
   * - Static:  a pure lookup on the item.
   */
  private static valueFor(item: E.DOMElement): string {
    const { value, text } = item as E.DOMElement & { value?: string; text?: string }
    return value || text || (item.textContent ?? "").trim()
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIList extends E.AttributeValues<typeof listVocabulary> {}

/** Item roots that can be activated:  a link, a button. */
const INTERACTIVE_ROOTS: ReadonlySet<string> = new Set(["a", "button"])
