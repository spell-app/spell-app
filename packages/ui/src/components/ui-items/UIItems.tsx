import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { ItemsFallback } from "./ui-items.fallback"
import { itemsVocabulary } from "./ui-items.vocabulary.en"

import itemsCSS from "./ui-items.css?inline"

/****************
 * ### `<ui-items>`
 * The Items view:  `<div class="ui [size] [keyOnly ...] [relaxed] items" part="items" role="list"><slot></div>`
 * around GENERIC `<ui-item>`s -- the same element as a list's or a menu's, never a second item tag.
 * - Owner of items (`ItemOwner`):  every `<ui-item>` inside asks `itemContext()` how to render -- a
 *   `role=listitem` host;  a `<div>` box (an `<a>` with the item's `href`);  its `image` shorthand a plain
 *   `<img class="image">`;  and it OWNS its content parts (`ownsParts`), which then style themselves
 *   `:state(in-item)`, where a list's parts see through the item to the list.
 * - Items adopt THIS class's `styles`, so `ui-items.css` holds the item rules too;  the group's variations reach them
 *   as inherited tokens.  Stacking answers to THIS host's width:  it's a block and the size container
 *   `ui-items` (`:state(items)`, always on);  or to the screen's, with `stack-with="page"` (a private class).
 * - Not interactive:  `link` is Fomantic's hover look;  an item that goes somewhere takes `href` (one link).
 ****************/
export class UIItems extends E.UIElement<typeof itemsVocabulary> implements UIT.ItemOwner {
  @E.proto static vocabulary = itemsVocabulary
  @E.proto static styleSheets = { items: itemsCSS }
  @E.proto static elementSetup = { Fallback: ItemsFallback, delegatesFocus: false }

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
  protected get extraClasses(): string | undefined {
    return UIT.StackClasses.classFor(this.stackWith)
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClasses} part={this.partForName("items")} role={UIT.LIST}>
        <slot />
      </div>
    )
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UIItems extends E.AttributeValues<typeof itemsVocabulary> {}

/** What every item gets:  a list item owning its parts, its `image` shorthand a bare `.image`. */
const ITEM_CONTEXT: UIT.ItemContext = Object.freeze({
  hostRole: UIT.LISTITEM,
  interactive: false,
  current: UIT.PAGE,
  ownsParts: true,
  imageClass: UIT.IMAGE
})
