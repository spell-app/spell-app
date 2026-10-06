import { E, UIT } from "$/ui/core"
import { listVocabulary } from "./ui-list.vocabulary.en"

/****************
 * ### `ListFallback`
 * The list's markup without owner context:  `<ul class="ui ... list" part="list" role="list"><slot>` (`<ol>` when
 * `ordered`), so `ui-list.css` still lays out the items (`ItemFallback` covers those).
 * - Sub-list:  keyed on the light-DOM PARENT's canonical tag instead of owner context.  Inside a `<ui-item>` /
 *   `<ui-list>` it renders `<ul class="list">` (no `ui`, no variations:  it inherits the outer list's tokens),
 *   an `<ol>` when it or the nearest outer `<ui-list>` is `ordered`.
 ****************/
export class ListFallback extends E.NativeFallback<typeof listVocabulary> {
  @E.proto static vocabulary = listVocabulary
  @E.proto static degraded = [
    "sub-lists through translated or slotted parents (only a direct `<ui-item>` / `<ui-list>` parent counts)",
    "`ui-select`"
  ]

  /** Inside another list:  the sub-list form. */
  private readonly isNested = PARENTS.has(this.host.parentElement?.localName ?? "")

  protected override build() {
    const outer = this.isNested ? this.host.parentElement?.closest(listVocabulary.tag) : undefined
    const isOrdered = this.flag("ordered") || E.Converters.boolean(outer?.getAttribute(UIT.ORDERED), UIT.ORDERED)
    const list = this.create(isOrdered ? UIT.OL : UIT.UL, {
      class: this.isNested ? listVocabulary.noun : this.classes(),
      role: UIT.LIST
    })
    list.append(this.slot())
    return [this.decorate(list, "list")]
  }
}

/** Parent tags (canonical only) that make a list a sub-list. */
const PARENTS: ReadonlySet<string> = new Set(["ui-item", "ui-list"])
