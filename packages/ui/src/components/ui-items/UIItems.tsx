import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { itemsVocabulary } from "./UIItems.en"

import itemsCSS from "./UIItems.css?inline"

/****************
 * ### `UIItems`
 * The component behind `<ui-items>`:  Fomantic's Items view, each item an image beside its content:
 * `<div class="ui [size] [keyOnly ...] [relaxed] items" part="items" role="list"><slot></div>`
 * around GENERIC `<ui-item>`s:  the same element as a list's or a menu's, never a second item tag.
 *
 * - It owns its items (`ItemOwner`):  every `<ui-item>` inside asks `itemContext()` how to draw itself:
 *   - a DOM element with `role=listitem`, around a `<div>` box (an `<a>` with the item's `href`);
 *   - its `image` shorthand a plain `<img class="image">`;
 *   - and it OWNS its content parts (`ownsParts`), which then style themselves `:state(in-item)`,
 *     where a list's parts see through the item to the list.
 *
 * - Items adopt THIS class's `elementSetup.styleSheets`, so `UIItems.css` holds the item rules too;
 *   the group's variations reach them as inherited tokens.
 *
 * - Stacking answers to THIS DOM element's width:  it's a block and the size container `ui-items`
 *   (`:state(items)`, always on).  With `stack-with="page"` (a private class), it answers to the screen's.
 *
 * - Not interactive:  `link` is Fomantic's hover look;  an item that goes somewhere takes `href` (one link).
 ****************/
export class UIItems extends E.UIComponent<typeof itemsVocabulary> implements UIT.ItemOwner {
  @E.proto static vocabulary = itemsVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { items: itemsCSS },
    delegatesFocus: false,
    // `disabled`:  only a look
    disabled: "its own"
  } satisfies Partial<E.ElementSetup>

  /** Always:  the size container `ui-items` (`:state(items)`). */
  @E.cssState("items")
  get isItemsView(): boolean {
    return true
  }

  /** `ItemOwner`:  how items render -- the same object always, so items never re-render for it. */
  itemContext(): UIT.ItemContext {
    return ITEM_CONTEXT
  }

  /** `stack-with`'s class (`UIT.StackClasses`). */
  protected get extraClass(): string | undefined {
    return UIT.StackClasses.classFor(this.stackWith)
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("items")} role="list">
        <slot />
      </div>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIItems extends E.AttributeValues<typeof itemsVocabulary> {}

/** What every item gets:  a list item owning its parts, its `image` shorthand a bare `.image`. */
const ITEM_CONTEXT: UIT.ItemContext = Object.freeze({
  domElementRole: "listitem",
  interactive: false,
  current: "page",
  ownsParts: true,
  imageClass: UIT.IMAGE
})
