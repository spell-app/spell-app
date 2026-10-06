import { Converters, NativeFallback, proto } from "$/ui/core"

import { tabsVocabulary } from "./ui-tabs.vocabulary.en"
import { tabVocabulary } from "./ui-tab.vocabulary.en"
import {
  VALUE,
  TAB,
  ACTIVE_ITEM,
  TAB_PART,
  MENU,
  MENU_PART,
  TABLIST,
  TABPANEL,
  PANE,
  SEGMENT_ACTIVE,
  SEGMENT
} from "./ui-tab.types"
import type { TabFallbackVocabulary } from "./ui-tab.types"
import { TRUE, FALSE, LABEL, BASIC, SELECTED, ACTIVE, ITEM } from "$/ui/components/components.types"

/****************
 * ### `TabFallback`
 * The tab set or one pane without Solid, keyed by the host's tag -- one class for both, as they share `ui-tab.css`.
 * - `<ui-tabs>`:  `<div class="ui ... tabs" part="tabs">` holding the tab list -- `<div class="ui ... menu"
 *   role="tablist">` of `<button role="tab" class="[active] item">`s, one per `<ui-tab>` child's `label` -- and the
 *   panes' slot.  The selected tab:  the pane the host's `value` names, else the first `selected` / `active` pane,
 *   else the first.
 * - `<ui-tab>`:  `<div class="ui [active] tab segment" part="tab">` around the slot;  shown (`:state(selected)`)
 *   while its own `selected` / `active` is set;  a `role=tabpanel` host inside a `<ui-tabs>` parent.
 ****************/
export class TabFallback extends NativeFallback<TabFallbackVocabulary> {
  @proto static vocabularies = [tabVocabulary, tabsVocabulary]
  @proto static degraded = [
    "switching panes:  the tab list is drawn, but a click selects nothing (the panes keep what they showed)",
    "the arrow keys, `ui-change`, `history`, View Transitions, tab icons",
    "a pane's owner-decided look (`attached`, `basic`, `inverted` edges), `lazy` templates, `ui-show`",
    "tabs through translated or slotted parents (only a direct `<ui-tabs>` parent counts)"
  ]

  protected override build() {
    return this.vocabulary === tabsVocabulary ? this.tabs() : this.pane()
  }

  /** `<ui-tabs>`:  the root, its tab list and the panes' slot. */
  private tabs(): Node[] {
    const panes = [...this.host.children].filter((child) => child.localName === tabVocabulary.tag)
    const values = panes.map((pane, index) => pane.getAttribute(VALUE) ?? String(index))
    const selected = TabFallback.selectedIndex(panes, values, this.host.getAttribute(VALUE))
    const tabs = panes.map((pane, index) =>
      this.create(
        "button",
        {
          type: "button",
          role: TAB,
          class: index === selected ? ACTIVE_ITEM : ITEM,
          part: TAB_PART,
          "aria-selected": index === selected ? TRUE : FALSE,
          tabindex: index === selected ? "0" : "-1"
        },
        pane.getAttribute(LABEL) ?? values[index]!
      )
    )
    const words = this.classes().split(" ")
    const menuClass = [...words.slice(0, -1).filter((word) => word !== BASIC), MENU].join(" ")
    const menu = this.create("div", { class: menuClass, part: MENU_PART, role: TABLIST }, ...tabs)
    return [this.decorate(this.create("div", { class: this.classes() }, menu, this.slot()), "tabs")]
  }

  /** `<ui-tab>`:  the pane box, shown while its own `selected` / `active` is set. */
  private pane(): Node[] {
    const selected = TabFallback.ownSelected(this.host)
    if (this.internals) {
      if (this.host.parentElement?.localName === tabsVocabulary.tag) this.internals.role = TABPANEL
      this.internals.states.add(PANE)
      if (selected) this.internals.states.add(SELECTED)
    }
    // `selected` emits `active` itself (its class key);  only the `active` alias needs adding
    const classes = this.classes(selected && !this.flag("selected") ? SEGMENT_ACTIVE : SEGMENT)
    return [this.decorate(this.create("div", { class: classes }, this.slot()), "tab")]
  }

  /** Index of the selected pane:  `value`'s, else the first chosen one, else `0`. */
  private static selectedIndex(panes: Element[], values: string[], value: string | null): number {
    const named = value === null ? -1 : values.indexOf(value)
    if (named >= 0) return named
    return Math.max(0, panes.findIndex(TabFallback.ownSelected))
  }

  /** A pane's own `selected` (or `active`). */
  private static ownSelected(this: void, pane: Element): boolean {
    return (
      Converters.boolean(pane.getAttribute(SELECTED), SELECTED) || Converters.boolean(pane.getAttribute(ACTIVE), ACTIVE)
    )
  }
}
