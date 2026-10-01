import { Converters, NativeFallback, proto, type NativeFallbackRoot } from "$/ui/core"

import { itemVocabulary } from "./item.vocabulary.en"

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

  constructor(host: HTMLElement, root: NativeFallbackRoot, error?: unknown, internals?: ElementInternals) {
    super(host, root, error, internals)
    this.owner = OWNERS.get(host.parentElement?.localName ?? "")
  }

  /** Owner noun from the parent's tag, or `undefined`. */
  private readonly owner: string | undefined

  protected override build() {
    if (!this.owner) return [this.slot()]
    if (this.internals && LIST_OWNERS.has(this.owner)) this.internals.role = LISTITEM
    // `active` is the alias of `selected`, which `classes()` can't see:  it isn't a vocabulary attribute
    const alias = !this.flag("selected") && Converters.boolean(this.host.getAttribute(ACTIVE), ACTIVE)
    const selected = this.flag("selected") || alias
    const color = this.attr("color")
    const extra = [this.attr("type") === HEADER ? HEADER : "", alias ? ACTIVE : "", color ? `ui-${color}` : ""]
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
            "aria-current": selected ? PAGE : null
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

/** Host role in a list. */
const LISTITEM = "listitem"

/** `type` of a header item, also its extra class. */
const HEADER = "header"

/** Alias attribute of `selected`, and its class word. */
const ACTIVE = "active"

/** `aria-current` of a selected link. */
const PAGE = "page"
