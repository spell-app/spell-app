import { Converters, NativeFallback, proto, type NativeFallbackRoot } from "$/ui/core"

import { listVocabulary } from "./list.vocabulary.en"

/****************
 * ### `ListFallback`
 * The list's markup without owner context:  `<ul class="ui ... list" part="list" role="list"><slot>` (`<ol>` when
 * `ordered`), so `list.css` still lays out the items (`ItemFallback` covers those).
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

  constructor(host: HTMLElement, root: NativeFallbackRoot, error?: unknown, internals?: ElementInternals) {
    super(host, root, error, internals)
    this.nested = PARENTS.has(host.parentElement?.localName ?? "")
  }

  /** Inside another list:  the sub-list form. */
  private readonly nested: boolean

  protected override build() {
    const outer = this.nested ? this.host.parentElement?.closest(LIST) : null
    const ordered = this.flag("ordered") || Converters.boolean(outer?.getAttribute(ORDERED) ?? null, ORDERED)
    const list = this.create(ordered ? "ol" : "ul", {
      class: this.nested ? listVocabulary.noun : this.classes(),
      role: ROLE
    })
    list.append(this.slot())
    return [this.decorate(list, "list")]
  }
}

/** Parent tags (canonical only) that make a list a sub-list. */
const PARENTS: ReadonlySet<string> = new Set(["ui-item", "ui-list"])

/** Canonical tag of a list, for the outer list's `ordered`. */
const LIST = "ui-list"

/** Attribute that numbers the items. */
const ORDERED = "ordered"

/** Explicit list role:  `list-style: none` drops the list semantics in Safari. */
const ROLE = "list"
