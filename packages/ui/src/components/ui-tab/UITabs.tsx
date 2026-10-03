import { For, Show, createEffect, createMemo, flush, untrack, type Accessor } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import {
  Cell,
  ClassBuilder,
  HostAttribute,
  IconGlyph,
  proto,
  UI,
  UIElement,
  type AttributeName,
  type RovingTabindex,
  type UIHost,
  UIT
} from "$/ui/core"

import { tabsVocabulary } from "./ui-tabs.vocabulary.en"
import { TabFallback } from "./ui-tab.fallback"
import { UITab } from "./UITab"

import menuCSS from "$/ui/components/ui-menu/ui-menu.css?inline"
import tabCSS from "./ui-tab.css?inline"
import { MENU_NOUN } from "./ui-tab.types"
import type { TabsVocabulary, TabOwner, TabPaneState } from "./ui-tab.types"
import { NONE, TABLIST, TAB, HASHCHANGE, POPSTATE, TAB_SELECTOR, PANE_NOUN } from "./ui-tab.types"
import {
  VERTICAL,
  TRUE,
  ARIA_LABEL,
  BOTTOM,
  TOP,
  ACTIVE,
  DISABLED,
  ITEM,
  FALSE,
  ICON,
  VISIBLE,
  HORIZONTAL,
  MANUAL
} from "$/ui/components/components.types"

/****************
 * ### `<ui-tabs>`
 * A tab set (WAI-ARIA APG tabs) over `<ui-tab>` panes -- Fomantic's tab MENU plus `.ui.tab` panes, as one element:
 *
 *     <div class="ui ... tabs" part="tabs">
 *       <div class="ui ... menu" part="menu" role="tablist" aria-label aria-orientation>
 *         <button type="button" class="[active] [disabled] item" part="tab" role="tab" aria-selected>label</button>
 *       </div>
 *       <slot></slot>                                   (the panes;  before the menu when `attached="bottom"`)
 *     </div>
 *
 * - The tab list is drawn from the panes' `label` / `icon` in THIS shadow root, styled by `ui-menu.css` (adopted as is:
 *   the static `.ui.menu .item` rules), so the look words (`appearance`, or the boolean aliases `tabular`, `pointing
 *   secondary`, `text`;  `vertical`, `inverted`, `alignment`, `equal`, sizes, colours) are the menu's, one class
 *   grammar, no second copy of the menu sheet.
 * - Owner of the panes (`ownsParts:  tab`, `TabOwner`):  each asks `paneState()` whether it's shown, which edge it
 *   joins, and how it looks.
 * - Selection:  `value` is auto-controlled -- a click (or, `automatic`, an arrow key) dispatches the cancelable
 *   `ui-change` first.  Without a `value`, the first `selected` pane, else the first enabled one;  a `value` that
 *   names no pane falls back the same way.
 * - Keyboard (APG):  ONE Tab stop, the selected tab (`UI.focus.roving`);  ArrowLeft / ArrowRight (ArrowUp /
 *   ArrowDown when `vertical`), Home, End;  disabled tabs are skipped.  `activation="manual"`:  arrows move focus
 *   only, Enter / Space select;  focus returning to the list lands on the selected tab.
 * - ARIA:  each tab `aria-controls` its pane (element reflection:  the pane is light DOM, a tree this shadow root
 *   may point into);  the pane is a `tabpanel` named by its label (it can't point back into this shadow root).
 * - The swap:  a View Transition (`document.startViewTransition`) when `UI.browser.supports.viewTransitions` and
 *   the user doesn't prefer reduced motion, else instant.  The tab list follows the selection at once;  the panes
 *   swap inside the transition (`shown`).
 * - `history`:  the selected value mirrors `location.hash` (see the vocabulary).
 * - SIDE EFFECTS:  `history` pushes history entries and listens to `window`'s `hashchange` / `popstate` while
 *   connected.
 ****************/
export class UITabs extends UIElement<TabsVocabulary> implements TabOwner {
  declare menuBuilder: ClassBuilder

  @proto static vocabulary = tabsVocabulary
  @proto static styles = { menu: menuCSS, tab: tabCSS }
  @proto static Fallback = TabFallback
  // the tabs are the focus targets;  a click on a pane must not jump to one
  @proto static delegatesFocus = false

  /** Builds the tab list's classes:  this vocabulary's words, Fomantic's noun `menu`. */
  @proto static menuBuilder = new ClassBuilder({ ...tabsVocabulary, noun: MENU_NOUN })

  ////////////////
  // ## State
  ////////////////

  /** `value`:  host-controlled, or internal. */
  readonly valueState = this.controlled("value", undefined)

  /** Host `aria-label`, forwarded to the tab list. */
  readonly ariaLabel = new HostAttribute(this.host, ARIA_LABEL)

  /** Pane hosts among the children (upgraded or not);  notifies on every read of the children. */
  readonly panes = new Cell<readonly UIHost[]>(isServer ? [] : this.readPanes(), { equals: false })

  /** Value of the pane ON SCREEN:  follows `selectedValue()`, inside a View Transition when there is one. */
  readonly shownValue = new Cell<string | undefined>(undefined)

  /** Live roving tabindex over the tabs. */
  private roving: RovingTabindex | undefined

  /** The tab list, while rendered. */
  private bar: HTMLElement | undefined

  /** A pane re-read is queued. */
  private refreshQueued = false

  /** The key that is moving the roving focus right now (`automatic` selects on it). */
  private key: KeyboardEvent | undefined

  ////////////////
  // ## Derived state
  ////////////////

  /** Upgraded panes, in order:  the tabs. */
  readonly tabs = createMemo(() => this.panes.get().filter((pane) => pane.controller instanceof UITab), {
    equals: UITabs.sameList
  })

  /** Each tab's value:  its `value`, else its index. */
  readonly values = createMemo(() => this.tabs().map((pane, index) => UITabs.tab(pane).attrs.value ?? String(index)))

  /** The selected value (see class docs). */
  readonly selectedValue = createMemo((): string | undefined => {
    const values = this.values()
    const value = this.valueState.get()
    if (value !== undefined && values.includes(value)) return value
    const tabs = this.tabs().map(UITabs.tab)
    const chosen = tabs.findIndex((tab) => tab.ownSelected() && !tab.attrs.disabled)
    const first = chosen >= 0 ? chosen : tabs.findIndex((tab) => !tab.attrs.disabled)
    return first >= 0 ? values[first] : undefined
  })

  /** Index of the selected tab, or -1. */
  readonly selectedIndex = createMemo(() => this.values().indexOf(this.selectedValue() ?? NONE))

  /** The pane on screen. */
  readonly displayed = createMemo(() => this.shownValue.get() ?? this.selectedValue())

  /** The tab list's edge:  `top` / `bottom` when `attached` (bare ~== `top`);  never while `vertical`. */
  readonly menuEdge = createMemo((): "top" | "bottom" | undefined => {
    const attached = this.attrs.attached
    if (!attached || this.attrs.vertical) return undefined
    return attached === BOTTOM ? BOTTOM : TOP
  })

  /** Where the tabs sit (`alignment`);  none while `vertical`, whose tabs fill their column. */
  readonly alignment = createMemo(() => (this.attrs.vertical ? undefined : this.attrs.alignment))

  /** Tab list classes:  the look words with the noun `menu`. */
  readonly menuClasses = createMemo(() =>
    this.menuBuilder.build({
      size: this.attrs.size,
      color: this.attrs.color,
      appearance: this.attrs.appearance,
      tabular: this.attrs.tabular,
      pointing: this.attrs.pointing,
      secondary: this.attrs.secondary,
      text: this.attrs.text,
      inverted: this.attrs.inverted,
      vertical: this.attrs.vertical,
      fluid: this.attrs.fluid,
      compact: this.attrs.compact,
      equal: this.attrs.equal,
      alignment: this.alignment(),
      attached: this.menuEdge()
    })
  )

  ////////////////
  // ## TabOwner
  ////////////////

  /**
   * `TabOwner`:  how `pane` shows.  Tracked.
   * - SIDE EFFECT:  a pane not among the tabs yet (it upgraded after the last read) queues a re-read.
   */
  paneState(pane: Element): TabPaneState {
    const index = this.tabs().indexOf(pane as UIHost)
    if (index < 0) this.queueRefresh()
    const edge = this.menuEdge()
    return {
      selected: index >= 0 && this.values()[index] === this.displayed(),
      attached: edge ? (edge === TOP ? BOTTOM : TOP) : undefined,
      basic: this.attrs.basic,
      inverted: this.attrs.inverted
    }
  }

  /** `TabOwner`:  `pane`'s value.  Untracked. */
  valueOf(pane: Element): string {
    return untrack(() => this.values()[this.tabs().indexOf(pane as UIHost)]) ?? ""
  }

  ////////////////
  // ## Element hooks
  ////////////////

  protected classValue(name: AttributeName<TabsVocabulary>): unknown {
    if (name === "attached") return this.menuEdge()
    if (name === "alignment") return this.alignment()
    return super.classValue(name)
  }

  protected hostStates() {
    return { vertical: this.attrs.vertical }
  }

  ////////////////
  // ## Rendering
  ////////////////

  mount(): JSX.Element {
    this.effects()
    return super.mount()
  }

  render(): JSX.Element {
    const menu = (
      <div
        ref={(element: HTMLElement) => this.attachBar(element)}
        class={this.menuClasses()}
        part={this.part("menu")}
        role={TABLIST}
        aria-label={this.ariaLabel.get() ?? undefined}
        aria-orientation={this.attrs.vertical ? VERTICAL : undefined}
        onFocusOut={this.onFocusOut}
      >
        <For each={this.tabs()}>{(pane, index) => this.renderTab(pane, index)}</For>
      </div>
    )
    const panes = <slot onSlotChange={() => this.refreshPanes()} />
    return (
      <div class={this.classes()} part={this.part("tabs")}>
        {this.menuEdge() === BOTTOM ? [panes, menu] : [menu, panes]}
      </div>
    )
  }

  /** One tab:  a `<button role="tab">` in the menu's item grammar, controlling `pane`. */
  private renderTab(pane: UIHost, index: Accessor<number>): JSX.Element {
    const tab = UITabs.tab(pane)
    const selected = () => index() === this.selectedIndex()
    const glyph = new IconGlyph(this, () => tab.attrs.icon)
    return (
      <button
        ref={(button: HTMLButtonElement) => (button.ariaControlsElements = [pane])}
        type="button"
        role={TAB}
        class={[selected() && ACTIVE, tab.attrs.disabled && DISABLED, ITEM].filter(Boolean).join(" ")}
        part={this.part("tab")}
        aria-selected={selected() ? TRUE : FALSE}
        aria-disabled={tab.attrs.disabled ? TRUE : undefined}
        onClick={(event: MouseEvent) => this.select(pane, event)}
      >
        <Show when={glyph.svg()}>
          {(svg) => (
            <i class={ICON} part={this.part("icon")}>
              {svg()}
            </i>
          )}
        </Show>
        {tab.attrs.label ?? this.values()[index()]}
      </button>
    )
  }

  ////////////////
  // ## Transitions
  ////////////////

  /**
   * Select `pane` as the user would:  the cancelable `ui-change` first, then `value` (and, with `history`, a new
   * history entry).  True when applied;  false for a disabled or already selected pane, or a veto.
   */
  select(pane: Element, originalEvent?: Event): boolean {
    const tab = (pane as UIHost).controller
    if (!(tab instanceof UITab) || untrack(() => tab.attrs.disabled)) return false
    const value = this.valueOf(pane)
    if (value === untrack(this.selectedValue)) return false
    const detail: UIT.TabChangeDetail = { value, tab: pane, originalEvent }
    const applied = this.valueState.request(value, () => this.emit("ui-change", detail))
    if (applied && untrack(() => this.attrs.history)) UITabs.pushHash(value)
    return applied
  }

  ////////////////
  // ## Effects
  ////////////////

  /**
   * The pane swap, the roving tabindex and `history` -- all once the runtime is loaded (`UI`).
   * - Created in `mount()`:  they read overridable methods and every field.
   */
  private effects() {
    if (isServer) return
    createEffect(
      () => this.selectedValue(),
      (value) => this.show(value)
    )
    createEffect(
      () =>
        this.loaded() && this.connected.get()
          ? { vertical: this.attrs.vertical, count: this.tabs().length, index: this.selectedIndex() }
          : undefined,
      (roving) => {
        if (!roving) return
        queueMicrotask(() => this.startRoving())
        return () => this.stopRoving()
      }
    )
    createEffect(
      () => this.loaded() && this.connected.get() && this.attrs.history,
      (history) => {
        if (!history) return
        const listeners = new AbortController()
        const onNavigate = (event: Event) => this.fromHash(event)
        window.addEventListener(HASHCHANGE, onNavigate, { signal: listeners.signal })
        window.addEventListener(POPSTATE, onNavigate, { signal: listeners.signal })
        queueMicrotask(() => this.fromHash())
        return () => listeners.abort()
      }
    )
  }

  /**
   * Put the pane for `value` on screen:  inside a View Transition when the browser has them, the user doesn't
   * prefer reduced motion and another pane was showing;  else at once.
   * - Runs in an effect's APPLY function (a signal write is allowed there);  the transition's callback runs later,
   *   outside any owner, and flushes so the new panes are in the DOM when it returns.
   */
  private show(value: string | undefined) {
    const before = untrack(this.shownValue.get)
    if (before === undefined || before === value || !this.canTransition()) return this.shownValue.set(value)
    const transition = document.startViewTransition(() => {
      this.shownValue.set(value)
      flush()
    })
    // a newer swap skips this one, which rejects `ready`:  expected, not an error
    transition.ready.catch(() => undefined)
  }

  /** Animate the swap?  See `show()`. */
  private canTransition(): boolean {
    if (!untrack(this.loaded) || !this.host.isConnected || document.visibilityState !== VISIBLE) return false
    return UI.browser.supports.viewTransitions && !UI.browser.reducedMotion
  }

  /** (Re)start the roving tabindex on the tab list, the selected tab as the Tab stop. */
  private startRoving() {
    this.stopRoving()
    const bar = this.bar
    if (!bar || !this.host.isConnected) return
    this.roving = UI.focus.roving(bar, () => this.buttons(), {
      orientation: untrack(() => this.attrs.vertical) ? VERTICAL : HORIZONTAL,
      activeIndex: Math.max(0, untrack(this.selectedIndex)),
      onChange: (_item, index) => this.onRovingChange(index)
    })
  }

  /** Stop roving (the tabs keep their `tabindex`es until the next start). */
  private stopRoving() {
    this.roving?.detach()
    this.roving = undefined
  }

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
  // ## Handlers
  ////////////////

  /**
   * A key on the tab list:  remember it, so the roving move it causes can select.
   * - NOTE: never cleared on a microtask:  a browser-dispatched event runs a microtask checkpoint between its
   *   listeners, so it would be gone before the roving tabindex's listener runs.  `onRovingChange()` checks the event
   *   is still being dispatched instead.
   */
  private readonly onKeyDown = (event: KeyboardEvent) => {
    this.key = event
  }

  /** The roving focus moved to tab `index`:  select it when a key moved it and activation is `automatic`. */
  private onRovingChange(index: number) {
    const key = this.key
    // a click's focus also moves the roving stop:  only a key still being dispatched counts
    if (!key || key.eventPhase === Event.NONE || untrack(() => this.attrs.activation) === MANUAL) return
    const pane = untrack(this.tabs)[index]
    if (pane) this.select(pane, key)
  }

  /** Focus left the tab list:  the Tab stop goes back to the selected tab (`manual` may have moved it). */
  private readonly onFocusOut = (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null
    if (next && this.bar?.contains(next)) return
    if (this.roving && this.roving.activeIndex !== untrack(this.selectedIndex)) this.startRoving()
  }

  /** The URL hash changed (or, `event`-less, the page opened on one):  select the pane it names. */
  private fromHash(event?: Event) {
    const value = UITabs.hashValue()
    const index = untrack(this.values).indexOf(value ?? NONE)
    const pane = untrack(this.tabs)[index]
    if (!pane || value === untrack(this.selectedValue)) return
    if (event) this.select(pane, event)
    else this.valueState.set(value)
  }

  ////////////////
  // ## Panes
  ////////////////

  /** Read the panes again (a slot change, or a pane that upgraded late). */
  private refreshPanes() {
    this.panes.set(this.readPanes())
  }

  /** Queue `refreshPanes()` once:  it writes a signal, so never from the tracked scope that asked. */
  private queueRefresh() {
    if (this.refreshQueued) return
    this.refreshQueued = true
    queueMicrotask(() => {
      this.refreshQueued = false
      this.refreshPanes()
    })
  }

  /** The pane children, in order, upgraded or not. */
  private readPanes(): UIHost[] {
    return [...this.host.children].filter(UITabs.isPane) as UIHost[]
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** A pane child:  an element DEFINED with the pane's noun (`<ui-tab>`, or its translated tag). */
  private static isPane(this: void, element: Element): boolean {
    return UIElement.definitions.get(element.localName)?.vocabulary.noun === PANE_NOUN
  }

  /** The `UITab` controller of an (upgraded) pane host. */
  private static tab(pane: UIHost): UITab {
    return pane.controller as UITab
  }

  /** The pane value in `location.hash`, or `undefined`. */
  private static hashValue(): string | undefined {
    const hash = location.hash.slice(1)
    if (!hash) return undefined
    try {
      return decodeURIComponent(hash)
    } catch {
      return hash
    }
  }

  /** Record `value` as the URL hash, as a new history entry (no scroll, no `hashchange`). */
  private static pushHash(value: string) {
    const hash = `#${encodeURIComponent(value)}`
    if (location.hash !== hash) history.pushState(history.state, "", hash)
  }

  /** Same hosts, in the same order. */
  private static sameList(a: readonly Element[], b: readonly Element[]): boolean {
    return a.length === b.length && a.every((element, index) => element === b[index])
  }
}
