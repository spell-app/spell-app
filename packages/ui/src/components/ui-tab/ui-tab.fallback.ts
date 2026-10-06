import { E, UIT } from "$/ui/core"
import { tabsVocabulary } from "./ui-tabs.vocabulary.en"
import { tabVocabulary } from "./ui-tab.vocabulary.en"
import { MENU, SEGMENT, TAB, TABLIST, TABPANEL } from "./ui-tab.types"

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
export class TabFallback extends E.NativeFallback<FallbackVocabulary> {
  @E.proto static vocabularies = [tabVocabulary, tabsVocabulary]
  @E.proto static degraded = [
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
    const selected = TabFallback.selectedIndex(panes, values, this.attr(VALUE))
    const tabs = panes.map((pane, index) =>
      this.create(
        "button",
        {
          type: "button",
          role: TAB,
          class: index === selected ? `${UIT.ACTIVE} ${UIT.ITEM}` : UIT.ITEM,
          part: TAB,
          "aria-selected": index === selected ? UIT.TRUE : UIT.FALSE,
          [UIT.TABINDEX]: index === selected ? "0" : "-1"
        },
        pane.getAttribute(UIT.LABEL) ?? values[index]!
      )
    )
    const words = this.classes().split(" ")
    const menuClass = [...words.slice(0, -1).filter((word) => word !== UIT.BASIC), MENU].join(" ")
    const menu = this.create("div", { class: menuClass, part: MENU, role: TABLIST }, ...tabs)
    return [this.decorate(this.create("div", { class: this.classes() }, menu, this.slot()), "tabs")]
  }

  /** `<ui-tab>`:  the pane box, shown while its own `selected` / `active` is set. */
  private pane(): Node[] {
    const isSelected = TabFallback.isOwnSelected(this.host)
    if (this.internals) {
      if (this.host.parentElement?.localName === tabsVocabulary.tag) this.internals.role = TABPANEL
      this.internals.states.add(PANE)
      if (isSelected) this.internals.states.add(UIT.SELECTED)
    }
    // `selected` emits `active` itself (its class key);  only the `active` alias needs adding
    const classes = this.classes(isSelected && !this.flag("selected") ? `${SEGMENT} ${UIT.ACTIVE}` : SEGMENT)
    return [this.decorate(this.create("div", { class: classes }, this.slot()), "tab")]
  }

  /**
   * Index of the selected pane:  `value`'s, else the first chosen one, else `0`.
   * - Static:  pure.
   */
  private static selectedIndex(panes: Element[], values: string[], value: string | undefined): number {
    const named = value === undefined ? -1 : values.indexOf(value)
    if (named >= 0) return named
    return Math.max(0, panes.findIndex(TabFallback.isOwnSelected))
  }

  /** A pane's own `selected` (or `active`).  Static:  passed as a value to `findIndex()`. */
  private static isOwnSelected(this: void, pane: Element): boolean {
    return (
      E.Converters.boolean(pane.getAttribute(UIT.SELECTED), UIT.SELECTED) ||
      E.Converters.boolean(pane.getAttribute(UIT.ACTIVE), UIT.ACTIVE)
    )
  }
}

/** Either vocabulary:  the fallback serves both tags. */
type FallbackVocabulary = typeof tabsVocabulary | typeof tabVocabulary

/** The `value` attribute of the tabs and of each pane. */
const VALUE = "value"

/** Host state every pane carries (`ui-tab.css`). */
const PANE = "pane"
