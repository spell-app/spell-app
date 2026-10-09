import { For, Show, flush, untrack, type Accessor } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { tabsVocabulary } from "./UITabs.en"
import { tabVocabulary } from "./UITab.en"
import { UITab } from "./UITab"
import { MENU, type TabOwner, type TabPaneState } from "./UITab.types"

import menuCSS from "$/ui/components/ui-menu/UIMenu.css?inline"
import tabCSS from "./UITab.css?inline"

/****************
 * ### `UITabs`
 * The component behind `<ui-tabs>`:  a tab set (WAI-ARIA APG tabs) over `<ui-tab>` panes,
 * Fomantic's tab MENU plus its `.ui.tab` panes, as one element:
 *
 *     <div class="ui … tabs" part="tabs">
 *       <div class="ui … menu" part="menu" role="tablist" aria-label aria-orientation>
 *         <button type="button" class="[active] [disabled] item" part="tab" role="tab" aria-selected>label</button>
 *       </div>
 *       <slot></slot>                                   (the panes;  before the menu when `attached="bottom"`)
 *     </div>
 *
 * - The tab list is drawn from the panes' `label` / `icon` in THIS shadow root,
 *   styled by `UIMenu.css` (adopted as is:  the static `.ui.menu .item` rules).
 *   So the look words are the menu's, one class grammar, no second copy of the menu sheet:
 *   `appearance` (or the boolean aliases `tabular`, `pointing secondary`, `text`),
 *   `vertical`, `inverted`, `alignment`, `equal`, sizes, colours.
 * - The owner of the panes (`ownsParts:  tab`, `TabOwner`):  each asks `paneState()` whether it shows,
 *   which edge it joins, and how it looks.
 * - Selection:  `value` is controlled.  A click (or, `automatic`, an arrow key) dispatches the cancelable
 *   `ui-change` first.  Without a `value`:  the first `selected` pane, else the first enabled one;
 *   a `value` that names no pane falls back the same way.
 * - Keyboard (APG):  ONE Tab stop, the selected tab (`UI.focus.roving`);
 *   ArrowLeft / ArrowRight (ArrowUp / ArrowDown when `vertical`), Home, End;  disabled tabs are skipped.
 *   `activation="manual"`:  the arrows move focus only, Enter / Space select;
 *   focus coming back to the list lands on the selected tab.
 * - ARIA:  each tab `aria-controls` its pane (element reflection:  the pane is light DOM, a tree this shadow root
 *   may point into);  the pane is a `tabpanel` named by its label (it can't point back into this shadow root).
 * - The swap:  a View Transition (`document.startViewTransition`) when `UI.browser.supports.viewTransitions`
 *   and the person doesn't prefer reduced motion, else instant.
 *   The tab list follows the selection at once;  the panes swap inside the transition (`shownValue`).
 * - `history`:  the selected value mirrors `location.hash` (see the vocabulary).
 * - SIDE EFFECTS:  `history` pushes history entries, and listens to its window's `hashchange` / `popstate`
 *   while connected.  The page globals (`window`, `document`, `location`, `history`) are the DOM element's
 *   document's, so a tab set in an iframe follows its own frame.
 ****************/
export class UITabs extends E.UIComponent<typeof tabsVocabulary> implements TabOwner {
  @E.proto static vocabulary = tabsVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { menu: menuCSS, tab: tabCSS },
    // the tabs are the focus targets;  a click on a pane must not jump to one
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  /** Builds the tab list's classes:  this vocabulary's words, Fomantic's noun `menu`. */
  @E.proto static menuClassBuilder = new E.ClassBuilder({ ...tabsVocabulary, noun: MENU })
  declare menuClassBuilder: E.ClassBuilder

  ////////////////
  // ## The panes
  ////////////////

  /** Pane DOM elements among the children (upgraded or not);  every write notifies (a re-read of the children). */
  @E.state({ equals: false }) accessor panes: readonly E.DOMElement[] = this.readPanes()

  /**
   * Upgraded panes, in order:  the tabs.
   * - `@derived`:  a filter, read by the tab list, every pane and the selection.
   */
  @E.derived({ equals: E.isSameList })
  get tabs(): readonly E.DOMElement[] {
    return this.panes.filter((pane) => pane.component instanceof UITab)
  }

  /** Each tab's value:  its `value`, else its index. */
  @E.derived
  get values(): string[] {
    return this.tabs.map((pane, index) => UITabs.componentOf(pane).value ?? String(index))
  }

  /** A pane re-read is queued. */
  private refreshIsQueued = false

  /** Read the panes again (a slot change, or a pane that upgraded late). */
  private refreshPanes() {
    this.panes = this.readPanes()
  }

  /** Queue `refreshPanes()` once:  it writes a member, so never from the tracked scope that asked. */
  private queueRefresh() {
    // a server render reads every pane before it renders, and writes nothing after
    if (isServer || this.refreshIsQueued) return
    this.refreshIsQueued = true
    E.afterSolidUpdate(() => {
      this.refreshIsQueued = false
      this.refreshPanes()
    })
  }

  /** The pane children, in order, upgraded or not. */
  private readPanes(): E.DOMElement[] {
    return [...this.domElement.children].filter(UITabs.isPane) as E.DOMElement[]
  }

  ////////////////
  // ## TabOwner
  ////////////////

  /**
   * `TabOwner`:  how `pane` shows.  Tracked.
   * - SIDE EFFECT:  a pane not among the tabs yet (it upgraded after the last read) queues a re-read.
   */
  paneState(pane: Element): TabPaneState {
    const index = this.tabs.indexOf(pane as E.DOMElement)
    if (index < 0) this.queueRefresh()
    const edge = this.menuEdge
    return {
      selected: index >= 0 && this.values[index] === this.displayedValue,
      attached: edge ? (edge === UIT.TOP ? UIT.BOTTOM : UIT.TOP) : undefined,
      basic: this.basic,
      inverted: this.inverted
    }
  }

  /** `TabOwner`:  `pane`'s value.  Untracked. */
  valueFor(pane: Element): string {
    return untrack(() => this.values[this.tabs.indexOf(pane as E.DOMElement)]) ?? ""
  }

  ////////////////
  // ## The selection
  ////////////////

  /** `value`:  the DOM element's `value` property when set, else kept here;  `selectedValue` is the one in effect. */
  @E.controlled("value") accessor value: string | undefined = undefined

  /** The selected value (see class docs):  `value` when it names a tab, else the first `selected` or enabled one. */
  @E.derived
  get selectedValue(): string | undefined {
    const values = this.values
    const value = this.value
    if (value !== undefined && values.includes(value)) return value
    const tabs = this.tabs.map(UITabs.componentOf)
    const chosen = tabs.findIndex((tab) => tab.isMarkedSelected && !tab.disabled)
    const first = chosen >= 0 ? chosen : tabs.findIndex((tab) => !tab.disabled)
    return first >= 0 ? values[first] : undefined
  }

  /** Index of the selected tab, or -1. */
  @E.derived
  get selectedIndex(): number {
    return this.values.indexOf(this.selectedValue ?? NO_VALUE)
  }

  /**
   * Select `pane` as a person would:  the cancelable `ui-change` first, then `value` (and, with `history`,
   * a new history entry).  True when applied;  false for a disabled or already selected pane, or a veto.
   */
  select(pane: Element, originalEvent?: Event): boolean {
    const tab = (pane as E.DOMElement).component
    if (!(tab instanceof UITab) || untrack(() => tab.disabled)) return false
    const value = this.valueFor(pane)
    if (value === untrack(() => this.selectedValue)) return false
    const detail: UIT.TabChangeDetail = { value, tab: pane, originalEvent }
    const applied = this.requestChange("value", value, () => this.send("ui-change", detail))
    if (applied && untrack(() => this.history)) UITabs.pushHash(value, this.view)
    return applied
  }

  ////////////////
  // ## The pane on screen
  ////////////////

  /** Value of the pane ON SCREEN:  follows `selectedValue`, inside a View Transition when there is one. */
  @E.state accessor shownValue: string | undefined = undefined

  /** The pane on screen:  `shownValue`, else the selected one (before the first swap). */
  get displayedValue(): string | undefined {
    return this.shownValue ?? this.selectedValue
  }

  /** The selection changed:  swap the panes. */
  @E.onChange("selectedValue")
  protected onSelectedValueChanged(value: string | undefined) {
    this.show(value)
  }

  /**
   * Put the pane for `value` on screen:  inside a View Transition when the browser has them,
   * the person doesn't prefer reduced motion and another pane was showing;  else at once.
   * - Runs in an effect's APPLY function (a write is allowed there);  the transition's callback runs later,
   *   outside any owner, and flushes so the new panes are in the DOM when it returns.
   */
  private show(value: string | undefined) {
    const before = untrack(() => this.shownValue)
    if (before === undefined || before === value || !this.canTransition) {
      this.shownValue = value
      return
    }
    const transition = this.domElement.ownerDocument.startViewTransition(() => {
      this.shownValue = value
      flush()
    })
    // a newer swap skips this one, which rejects `ready`:  expected, not an error
    transition.ready.catch(() => undefined)
  }

  /** Animate the swap?  See `show()`. */
  private get canTransition(): boolean {
    const { domElement } = this
    if (
      !untrack(() => this.isReady) ||
      !domElement.isConnected ||
      domElement.ownerDocument.visibilityState !== UIT.VISIBLE
    )
      return false
    return UI.browser.supports.viewTransitions && !UI.browser.isReducedMotion
  }

  ////////////////
  // ## The tab list
  ////////////////

  /** In a column:  `:state(vertical)`. */
  @E.cssState("vertical")
  get isVertical(): boolean {
    return !!this.vertical
  }

  /** The tab list's edge:  `top` / `bottom` when `attached` (bare ~== `top`);  never while `vertical`. */
  get menuEdge(): MenuEdge | undefined {
    const attached = this.attached
    if (!attached || this.vertical) return undefined
    return attached === UIT.BOTTOM ? UIT.BOTTOM : UIT.TOP
  }

  /** Where the tabs sit (`alignment`);  none while `vertical`, whose tabs fill their column. */
  get menuAlignment() {
    return this.vertical ? undefined : this.alignment
  }

  /** Tab list classes:  the look words with the noun `menu`. */
  @E.derived
  get menuClasses(): string {
    return this.menuClassBuilder.build({
      size: this.size,
      color: this.color,
      appearance: this.appearance,
      tabular: this.tabular,
      pointing: this.pointing,
      secondary: this.secondary,
      text: this.text,
      inverted: this.inverted,
      vertical: this.vertical,
      fluid: this.fluid,
      compact: this.compact,
      equal: this.equal,
      alignment: this.menuAlignment,
      attached: this.menuEdge
    })
  }

  protected classValue(name: E.AttributeName<typeof tabsVocabulary>): unknown {
    if (name === "attached") return this.menuEdge
    if (name === "alignment") return this.menuAlignment
    return super.classValue(name)
  }

  /** The tab list, while rendered. */
  private bar: HTMLElement | undefined

  /**
   * The tab list rendered:  keep it, and hear its keys in the CAPTURE phase -- before the roving tabindex's own
   * listener moves focus (and before Solid's delegated handlers, which run at the root).
   */
  private attachBar(bar: HTMLElement) {
    this.bar = bar
    bar.addEventListener("keydown", this.onKeyDown, { capture: true })
  }

  /** The tab buttons, in order. */
  private buttons(): HTMLElement[] {
    return this.bar ? [...this.bar.querySelectorAll<HTMLElement>(TAB_SELECTOR)] : []
  }

  ////////////////
  // ## The roving tabindex
  ////////////////

  /** Live roving tabindex over the tabs. */
  private rovingTabindex: E.RovingTabindex | undefined

  /** The key that is moving the roving focus right now (`automatic` selects on it). */
  private focusMovingKey: KeyboardEvent | undefined

  /**
   * The roving tabindex, (re)started once rendered and connected, and whenever `vertical`, the tabs or the selected
   * index change (`tabs` keeps its identity while the same DOM elements are in it).
   */
  @E.onChange("isReady", "isConnected", "isVertical", "tabs", "selectedIndex")
  protected onRovingChanged(isReady: boolean, isConnected: boolean) {
    if (!isReady || !isConnected) return
    E.afterSolidUpdate(() => this.startRoving())
    return () => this.stopRoving()
  }

  /** (Re)start the roving tabindex on the tab list, the selected tab as the Tab stop. */
  private startRoving() {
    this.stopRoving()
    const bar = this.bar
    if (!bar || !this.domElement.isConnected) return
    this.rovingTabindex = UI.focus.roving({
      container: bar,
      items: () => this.buttons(),
      orientation: untrack(() => this.vertical) ? "vertical" : "horizontal",
      activeIndex: Math.max(
        0,
        untrack(() => this.selectedIndex)
      ),
      onChange: (_item, index) => this.onRovingChange(index)
    })
  }

  /** Stop roving (the tabs keep their `tabindex`es until the next start). */
  private stopRoving() {
    this.rovingTabindex?.detach()
    this.rovingTabindex = undefined
  }

  /**
   * A key on the tab list:  remember it, so the roving move it causes can select.
   * - NOTE: never cleared on a microtask:  a browser-dispatched event runs a microtask checkpoint between its
   *   listeners, so it would be gone before the roving tabindex's listener runs.  `onRovingChange()` checks the event
   *   is still being dispatched instead.
   */
  private readonly onKeyDown = (event: KeyboardEvent) => {
    this.focusMovingKey = event
  }

  /** The roving focus moved to tab `index`:  select it when a key moved it and activation is `automatic`. */
  private onRovingChange(index: number) {
    const key = this.focusMovingKey
    // a click's focus also moves the roving stop:  only a key still being dispatched counts
    if (!key || key.eventPhase === Event.NONE || untrack(() => this.activation) === "manual") return
    const pane = untrack(() => this.tabs)[index]
    if (pane) this.select(pane, key)
  }

  /** Focus left the tab list:  the Tab stop goes back to the selected tab (`manual` may have moved it). */
  private readonly onFocusOut = (event: FocusEvent) => {
    // `relatedTarget`:  `null` when focus left the page
    const next = event.relatedTarget as Node | null
    if (next && this.bar?.contains(next)) return
    const roving = this.rovingTabindex
    if (roving && roving.activeIndex !== untrack(() => this.selectedIndex)) this.startRoving()
  }

  ////////////////
  // ## History
  ////////////////

  /** `history`, once rendered and connected:  follow the window's `hashchange` / `popstate`, and the hash now. */
  @E.onChange("isReady", "isConnected", "history")
  protected onHistoryChanged(isReady: boolean, isConnected: boolean, history: boolean | undefined) {
    if (!(isReady && isConnected && history)) return
    const listeners = new AbortController()
    const onNavigate = (event: Event) => this.onHashChange(event)
    for (const type of HISTORY_EVENTS) this.view.addEventListener(type, onNavigate, { signal: listeners.signal })
    E.afterSolidUpdate(() => this.onHashChange())
    return () => listeners.abort()
  }

  /** The URL hash changed (or, `event`-less, the page opened on one):  select the pane it names. */
  private onHashChange(event?: Event) {
    const value = UITabs.hashValue(this.view.location)
    const index = untrack(() => this.values).indexOf(value ?? NO_VALUE)
    const pane = untrack(() => this.tabs)[index]
    if (!pane || value === untrack(() => this.selectedValue)) return
    if (event) this.select(pane, event)
    else this.value = value
  }

  /** The DOM element's window:  its document's, for `history` and its events. */
  private get view(): Window {
    return this.domElement.ownerDocument.defaultView ?? window
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    const menu = (
      <div
        ref={(element: HTMLElement) => this.attachBar(element)}
        class={this.menuClasses}
        part={this.partForName("menu")}
        role="tablist"
        aria-label={this.attributes["aria-label"] ?? undefined}
        aria-orientation={this.vertical ? "vertical" : undefined}
        onFocusOut={this.onFocusOut}
      >
        <For each={this.tabs}>{(pane, index) => this.tab(pane, index)}</For>
      </div>
    )
    const panes = <slot onSlotChange={() => this.refreshPanes()} />
    return (
      <div class={this.rootClass} part={this.partForName("tabs")}>
        {this.menuEdge === UIT.BOTTOM ? [panes, menu] : [menu, panes]}
      </div>
    )
  }

  /**
   * One tab:  a `<button role="tab">` in the menu's item grammar, controlling `pane`.
   * - `aria-controls`:  element reflection in a browser;  in a server render (`$/ui/static`), the pane's id.
   *   SIDE EFFECT there:
   *   gives the pane (the render's parsed copy) an id if it has none, which the static output keeps.
   */
  private tab(pane: E.DOMElement, index: Accessor<number>): JSX.Element {
    const tab = UITabs.componentOf(pane)
    const isSelected = () => index() === this.selectedIndex
    const glyph = new E.IconGlyph({ owner: this, name: () => tab.icon })
    return (
      <button
        ref={(button: HTMLButtonElement) => (button.ariaControlsElements = [pane])}
        type="button"
        role="tab"
        class={[isSelected() && UIT.ACTIVE, tab.disabled && UIT.DISABLED, UIT.ITEM].filter(Boolean).join(" ")}
        part={this.partForName("tab")}
        aria-selected={isSelected() ? "true" : "false"}
        aria-disabled={tab.disabled ? "true" : undefined}
        aria-controls={isServer ? UI.ids.ensure(pane, PANE_ID) : undefined}
        onClick={(event: MouseEvent) => this.select(pane, event)}
      >
        <Show when={glyph.svg}>
          {(svg) => (
            <i class={UIT.ICON} part={this.partForName("icon")}>
              {svg()}
            </i>
          )}
        </Show>
        {tab.label ?? this.values[index()]}
      </button>
    )
  }

  ////////////////
  // ## Helpers
  ////////////////

  // Static:  pure, passed around as values (`filter`, `map`);
  // page globals come in as arguments, defaulting to this window's.

  /** A pane child:  an element DEFINED with the pane's noun (`<ui-tab>`, or its translated tag). */
  private static isPane(this: void, element: Element): boolean {
    return E.UIComponent.registry.definitions.get(element.localName)?.vocabulary.noun === tabVocabulary.noun
  }

  /** The `UITab` component of an (upgraded) pane. */
  private static componentOf(this: void, pane: E.DOMElement): UITab {
    return pane.component as UITab
  }

  /** The pane value in `location.hash`, or `undefined`. */
  private static hashValue(location: Location = window.location): string | undefined {
    const hash = location.hash.slice(1)
    if (!hash) return undefined
    try {
      return decodeURIComponent(hash)
    } catch {
      return hash
    }
  }

  /** Record `value` as `view`'s URL hash, as a new history entry (no scroll, no `hashchange`). */
  private static pushHash(value: string, view: Window = window) {
    const hash = `#${encodeURIComponent(value)}`
    const { history, location } = view
    if (location.hash !== hash) history.pushState(history.state, "", hash)
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UITabs extends E.AttributeValues<typeof tabsVocabulary> {}

/** Where the tab list sits when `attached`. */
type MenuEdge = typeof UIT.TOP | typeof UIT.BOTTOM

/** The tab buttons in the tab list. */
const TAB_SELECTOR = ":scope > [role=tab]"

/** Window events `history` follows. */
const HISTORY_EVENTS = ["hashchange", "popstate"] as const

/** A value no pane has. */
const NO_VALUE = "\u0000"

/** Prefix of the id a server render gives a pane, for its tab's `aria-controls`. */
const PANE_ID = "ui-tab"
