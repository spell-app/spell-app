import { E, UIT } from "$/ui/core"
import { itemVocabulary } from "./ui-item.vocabulary.en"

/****************
 * ### `ItemFallback`
 * The item's markup without owner context:  keyed on its light-DOM PARENT's canonical tag instead.
 * - Inside a `<ui-list>` / `<ui-menu>` / `<ui-items>`:  `<a class="... item" part="item" href>` (with `href`) or
 *   `<div class="... item" part="item">` around the slot;  `role=listitem` on the host (internals) in a list or
 *   the Items view.
 * - Elsewhere (a dropdown option, loose):  `<slot>`, as the real element renders unowned.
 ****************/
export class ItemFallback extends E.NativeFallback<typeof itemVocabulary> {
  @E.proto static vocabulary = itemVocabulary
  @E.proto static degraded = [
    "owner context through translated or slotted owners (only a direct `<ui-list>` / `<ui-menu>` / `<ui-items>` " +
      "parent counts);  owning its content parts in the Items view",
    "`icon` / `image` shorthands",
    "`link` / interactive items (a `<div>` unless `href`), `menuitem` roles, `aria-current`"
  ]

  /** Owner noun from the parent's tag, or `undefined`. */
  private readonly owner = OWNERS.get(this.host.parentElement?.localName ?? "")

  protected override build() {
    if (!this.owner) return [this.slot()]
    if (this.internals && LIST_OWNERS.has(this.owner)) this.internals.role = UIT.LISTITEM
    // `active` is the alias of `selected`, which `classes()` can't see:  it isn't a vocabulary attribute
    const isAlias = !this.flag("selected") && E.Converters.boolean(this.host.getAttribute(UIT.ACTIVE), UIT.ACTIVE)
    const isSelected = this.flag("selected") || isAlias
    const color = this.attr("color")
    const extra = [
      this.attr("type") === UIT.HEADER ? UIT.HEADER : "",
      isAlias ? UIT.ACTIVE : "",
      color ? `${UIT.COLOR_CLASS_PREFIX}${color}` : ""
    ]
      .filter(Boolean)
      .join(" ")
    const href = this.flag("disabled") ? undefined : this.attr("href")
    const box =
      href === undefined
        ? this.create("div", { class: this.classes(extra || undefined) })
        : this.create(UIT.ANCHOR_TAG, {
            class: this.classes(extra || undefined),
            href,
            target: this.attr("target"),
            "aria-current": isSelected ? UIT.PAGE : undefined
          })
    box.append(this.slot())
    return [this.decorate(box, "item")]
  }
}

/** Owner tags the fallback recognizes (canonical only), => owner noun. */
const OWNERS: ReadonlyMap<string, string> = new Map([
  ["ui-list", "list"],
  ["ui-menu", "menu"],
  ["ui-items", "items"]
])

/** Owner nouns whose items are list items. */
const LIST_OWNERS: ReadonlySet<string> = new Set(["list", "items"])
