import { Converters, NativeFallback, proto, UIT } from "$/ui/core"

import { listVocabulary } from "./ui-list.vocabulary.en"
import { PARENTS, LIST_TAG, ORDERED } from "./ui-list.types"

/****************
 * ### `ListFallback`
 * The list's markup without owner context:  `<ul class="ui ... list" part="list" role="list"><slot>` (`<ol>` when
 * `ordered`), so `ui-list.css` still lays out the items (`ItemFallback` covers those).
 * - Sub-list:  keyed on the light-DOM PARENT's canonical tag instead of owner context.  Inside a `<ui-item>` /
 *   `<ui-list>` it renders `<ul class="list">` (no `ui`, no variations:  it inherits the outer list's tokens),
 *   an `<ol>` when it or the nearest outer `<ui-list>` is `ordered`.
 ****************/
export class ListFallback extends NativeFallback<typeof listVocabulary> {
  @proto static vocabulary = listVocabulary
  @proto static degraded = [
    "sub-lists through translated or slotted parents (only a direct `<ui-item>` / `<ui-list>` parent counts)",
    "`ui-select`"
  ]

  /** Inside another list:  the sub-list form. */
  private readonly nested = PARENTS.has(this.host.parentElement?.localName ?? "")

  protected override build() {
    const outer = this.nested ? this.host.parentElement?.closest(LIST_TAG) : null
    const ordered = this.flag("ordered") || Converters.boolean(outer?.getAttribute(ORDERED) ?? null, ORDERED)
    const list = this.create(ordered ? "ol" : "ul", {
      class: this.nested ? listVocabulary.noun : this.classes(),
      role: UIT.LIST
    })
    list.append(this.slot())
    return [this.decorate(list, "list")]
  }
}
