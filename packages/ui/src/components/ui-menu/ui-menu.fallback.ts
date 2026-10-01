import { NativeFallback, proto } from "$/ui/core"

import { menuVocabulary } from "./ui-menu.vocabulary.en"

/****************
 * ### `MenuFallback`
 * The menu's markup without owner context or behaviour:
 * - top-level:  `<nav class="ui ... menu" part="menu" aria-label>` around the slot (`interactive` too:  a plain
 *   navigation landmark, no menubar)
 * - inside a `<ui-menu>` / `<ui-item>` parent (canonical tags):  the sub-menu `<div class="[position] menu">`
 ****************/
export class MenuFallback extends NativeFallback<typeof menuVocabulary> {
  @proto static vocabulary = menuVocabulary
  @proto static degraded = [
    "`interactive` (a `<nav>`, not a menubar:  no roving focus, no `menuitem` roles)",
    "`ui-select`",
    "sub-menus under translated or slotted owners (only a direct `<ui-menu>` / `<ui-item>` parent counts)"
  ]

  protected override build() {
    const parent = this.host.parentElement?.localName
    if (parent === menuVocabulary.tag || parent === ITEM_TAG) {
      const classes = [this.attr("position"), menuVocabulary.noun].filter(Boolean).join(" ")
      return [this.decorate(this.create("div", { class: classes }, this.slot()), "menu")]
    }
    return [this.decorate(this.create("nav", { class: this.classes() }, this.slot()), "menu")]
  }
}

/** Canonical tag of the generic item (a sub-menu's usual parent in a vertical menu). */
const ITEM_TAG = "ui-item"
