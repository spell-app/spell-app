import { E, UIT } from "$/ui/core"
import { itemsVocabulary } from "./ui-items.vocabulary.en"

/****************
 * ### `ItemsFallback`
 * The Items view's box without Solid:  `<div class="ui ... items" part="items" role="list"><slot>`, so
 * `ui-items.css` still lays out the items (`ItemFallback` covers those, as `role=listitem` `div.item`s).
 ****************/
export class ItemsFallback extends E.NativeFallback<typeof itemsVocabulary> {
  @E.proto static vocabulary = itemsVocabulary
  @E.proto static degraded = [
    "the size container:  items don't stack in a narrow group",
    "items owning their parts (`:state(in-item)`):  headers, metas, descriptions lose their item look"
  ]

  protected override build() {
    return [this.decorate(this.create("div", { class: this.classes(), role: UIT.LIST }, this.slot()), "items")]
  }
}
