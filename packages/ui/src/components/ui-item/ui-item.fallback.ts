import { Converters, NativeFallback, proto, UIT } from "$/ui/core"

import { itemVocabulary } from "./ui-item.vocabulary.en"
import { OWNERS, LIST_OWNERS } from "./ui-item.types"

/****************
 * ### `ItemFallback`
 * The item's markup without owner context:  keyed on its light-DOM PARENT's canonical tag instead.
 * - Inside a `<ui-list>` / `<ui-menu>` / `<ui-items>`:  `<a class="... item" part="item" href>` (with `href`) or
 *   `<div class="... item" part="item">` around the slot;  `role=listitem` on the host (internals) in a list or
 *   the Items view.
 * - Elsewhere (a dropdown option, loose):  `<slot>`, as the real element renders unowned.
 ****************/
export class ItemFallback extends NativeFallback<typeof itemVocabulary> {
  @proto static vocabulary = itemVocabulary
  @proto static degraded = [
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
    const alias = !this.flag("selected") && Converters.boolean(this.host.getAttribute(UIT.ACTIVE), UIT.ACTIVE)
    const selected = this.flag("selected") || alias
    const color = this.attr("color")
    const extra = [
      this.attr("type") === UIT.HEADER ? UIT.HEADER : "",
      alias ? UIT.ACTIVE : "",
      color ? `ui-${color}` : ""
    ]
      .filter(Boolean)
      .join(" ")
    const href = this.flag("disabled") ? null : this.attr("href")
    const box =
      href === null
        ? this.create("div", { class: this.classes(extra || undefined) })
        : this.create("a", {
            class: this.classes(extra || undefined),
            href,
            target: this.attr("target"),
            "aria-current": selected ? UIT.PAGE : null
          })
    box.append(this.slot())
    return [this.decorate(box, "item")]
  }
}
