import { For, Show, createEffect, createMemo, flush, untrack, type Accessor } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { tabsVocabulary } from "./ui-tabs.vocabulary.en"
import { tabVocabulary } from "./ui-tab.vocabulary.en"
import { TabFallback } from "./ui-tab.fallback"
import { UITab } from "./UITab"
import { MENU, TAB, TABLIST, type TabOwner, type TabPaneState } from "./ui-tab.types"

import menuCSS from "$/ui/components/ui-menu/ui-menu.css?inline"
import tabCSS from "./ui-tab.css?inline"

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
 *   the person doesn't prefer reduced motion, else instant.  The tab list follows the selection at once;  the panes
 *   swap inside the transition (`shown`).
 * - `history`:  the selected value mirrors `location.hash` (see the vocabulary).
 * - SIDE EFFECTS:  `history` pushes history entries and listens to its window's `hashchange` / `popstate` while
 *   connected.  The page globals (`window`, `document`, `location`, `history`) are the HOST's document's, so a
 *   tab set in an iframe follows its own frame.
 ****************/
export class UITabs extends E.UIElement<typeof tabsVocabulary> implements TabOwner {
  @E.proto static vocabulary = tabsVocabulary
  @E.proto static styles = { menu: menuCSS, tab: tabCSS }
  @E.proto static Fallback = TabFallback
  // the tabs are the focus targets;  a click on a pane must not jump to one
  @E.proto static delegatesFocus = false

  /** Builds the tab list's classes:  this vocabulary's words, Fomantic's noun `menu`. */
  @E.proto static menuBuilder = new E.ClassBuilder({ ...tabsVocabulary, noun: MENU })
  declare menuBuilder: E.ClassBuilder

  ////////////////
  // ## State
  ////////////////

  /** `value`:  host-controlled, or internal. */
  readonly valueState = this.controlled("value", undefined)

  /** Host `aria-label`, forwarded to the tab list. */
  readonly ariaLabel = new E.HostAttribute({ host: this.host, name: UIT.ARIA_LABEL })

  /** Pane hosts among the children (upgraded or not);  notifies on every read of the children. */
  readonly panes = new E.Cell<readonly E.UIHost[]>(this.readPanes(), { equals: false })

  /** Value of the pane ON SCREEN:  follows `selectedValue()`, inside a View Transition when there is one. */
  readonly shownValue = new E.Cell<string | undefined>(undefined)

  /** Live roving tabindex over the tabs. */
  private roving: E.RovingTabindex | undefined

  /** The tab list, while rendered. */
  private bar: HTMLElement | undefined

  /** A pane re-read is queued. */
  private isRefreshQueued = false

  /** The key that is moving the roving focus right now (`automatic` selects on it). */
  private key: KeyboardEvent | undefined

  ////////////////
  // ## Derived state
  ////////////////

  /**
   * Upgraded panes, in order:  the tabs.
   * - `lazy` on a server, as are the memos below that read the panes' controllers (`SERVER_LAZY`).
   */
  readonly tabs = createMemo(() => this.panes.get().filter((pane) => pane.controller instanceof UITab), {
    equals: UITabs.sameList,
    ...SERVER_LAZY
  })

  /** Each tab's value:  its `value`, else its index. */
  readonly values = createMemo(
    () => this.tabs().map((pane, index) => UITabs.controllerOf(pane).attrs.value ?? String(index)),
    SERVER_LAZY
  )

  /** The selected value (see class docs). */
  readonly selectedValue = createMemo((): string | undefined => {
    const values = this.values()
    const value = this.valueState.get()
    if (value !== undefined && values.includes(value)) return value
    const tabs = this.tabs().map(UITabs.controllerOf)
    const chosen = tabs.findIndex((tab) => tab.ownSelected() && !tab.attrs.disabled)
    const first = chosen >= 0 ? chosen : tabs.findIndex((tab) => !tab.attrs.disabled)
    return first >= 0 ? values[first] : undefined
  }, SERVER_LAZY)

  /** Index of the selected tab, or -1. */
  readonly selectedIndex = createMemo(() => this.values().indexOf(this.selectedValue() ?? NO_VALUE), SERVER_LAZY)

  /** The pane on screen. */
  readonly displayed = createMemo(() => this.shownValue.get() ?? this.selectedValue(), SERVER_LAZY)

  /** The tab list's edge:  `top` / `bottom` when `attached` (bare ~== `top`);  never while `vertical`. */
  readonly menuEdge = createMemo((): MenuEdge | undefined => {
    const attached = this.attrs.attached
    if (!attached || this.attrs.vertical) return undefined
    return attached === UIT.BOTTOM ? UIT.BOTTOM : UIT.TOP
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
    const index = this.tabs().indexOf(pane as E.UIHost)
    if (index < 0) this.queueRefresh()
    const edge = this.menuEdge()
    return {
      selected: index >= 0 && this.values()[index] === this.displayed(),
      attached: edge ? (edge === UIT.TOP ? UIT.BOTTOM : UIT.TOP) : undefined,
      basic: this.attrs.basic,
      inverted: this.attrs.inverted
    }
  }

  /** `TabOwner`:  `pane`'s value.  Untracked. */
  valueFor(pane: Element): string {
    return untrack(() => this.values()[this.tabs().indexOf(pane as E.UIHost)]) ?? ""
  }

  ////////////////
  // ## Element hooks
  ////////////////

  protected classValue(name: E.AttributeName<typeof tabsVocabulary>): unknown {
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
        aria-label={this.ariaLabel.get()}
        aria-orientation={this.attrs.vertical ? UIT.VERTICAL : undefined}
        onFocusOut={this.onFocusOut}
      >
        <For each={this.tabs()}>{(pane, index) => this.tab(pane, index)}</For>
      </div>
    )
    const panes = <slot onSlotChange={() => this.refreshPanes()} />
    return (
      <div class={this.classes()} part={this.part("tabs")}>
        {this.menuEdge() === UIT.BOTTOM ? [panes, menu] : [menu, panes]}
      </div>
    )
  }

  /**
   * One tab:  a `<button role="tab">` in the menu's item grammar, controlling `pane`.
   * - `aria-controls`:  element reflection in a browser;  in a server render (`$/ui/static`), the pane's id.
   *   SIDE EFFECT there:  gives the pane (the render's parsed copy) an id if it has none, which the static output
   *   keeps.
   */
  private tab(pane: E.UIHost, index: Accessor<number>): JSX.Element {
    const tab = UITabs.controllerOf(pane)
    const isSelected = () => index() === this.selectedIndex()
    const glyph = new E.IconGlyph(this, () => tab.attrs.icon)
    return (
      <button
        ref={(button: HTMLButtonElement) => (button.ariaControlsElements = [pane])}
        type="button"
        role={TAB}
        class={[isSelected() && UIT.ACTIVE, tab.attrs.disabled && UIT.DISABLED, UIT.ITEM].filter(Boolean).join(" ")}
        part={this.part("tab")}
        aria-selected={isSelected() ? UIT.TRUE : UIT.FALSE}
        aria-disabled={tab.attrs.disabled ? UIT.TRUE : undefined}
        aria-controls={isServer ? UI.ids.ensure(pane, PANE_ID) : undefined}
        onClick={(event: MouseEvent) => this.select(pane, event)}
      >
        <Show when={glyph.svg()}>
          {(svg) => (
            <i class={UIT.ICON} part={this.part("icon")}>
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
   * Select `pane` as a person would:  the cancelable `ui-change` first, then `value` (and, with `history`, a new
   * history entry).  True when applied;  false for a disabled or already selected pane, or a veto.
   */
  select(pane: Element, originalEvent?: Event): boolean {
    const tab = (pane as E.UIHost).controller
    if (!(tab instanceof UITab) || untrack(() => tab.attrs.disabled)) return false
    const value = this.valueFor(pane)
    if (value === untrack(this.selectedValue)) return false
    const detail: UIT.TabChangeDetail = { value, tab: pane, originalEvent }
    const applied = this.valueState.request(value, () => this.emit("ui-change", detail))
    if (applied && untrack(() => this.attrs.history)) UITabs.pushHash(value, this.view)
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
        for (const type of HISTORY_EVENTS) this.view.addEventListener(type, onNavigate, { signal: listeners.signal })
        queueMicrotask(() => this.fromHash())
        return () => listeners.abort()
      }
    )
  }

  /**
   * Put the pane for `value` on screen:  inside a View Transition when the browser has them, the person doesn't
   * prefer reduced motion and another pane was showing;  else at once.
   * - Runs in an effect's APPLY function (a signal write is allowed there);  the transition's callback runs later,
   *   outside any owner, and flushes so the new panes are in the DOM when it returns.
   */
  private show(value: string | undefined) {
    const before = untrack(this.shownValue.get)
    if (before === undefined || before === value || !this.canTransition()) return this.shownValue.set(value)
    const transition = this.host.ownerDocument.startViewTransition(() => {
      this.shownValue.set(value)
      flush()
    })
    // a newer swap skips this one, which rejects `ready`:  expected, not an error
    transition.ready.catch(() => undefined)
  }

  /** Animate the swap?  See `show()`. */
  private canTransition(): boolean {
    const { host } = this
    if (!untrack(this.loaded) || !host.isConnected || host.ownerDocument.visibilityState !== UIT.VISIBLE) return false
    return UI.browser.supports.viewTransitions && !UI.browser.isReducedMotion
  }

  /** (Re)start the roving tabindex on the tab list, the selected tab as the Tab stop. */
  private startRoving() {
    this.stopRoving()
    const bar = this.bar
    if (!bar || !this.host.isConnected) return
    this.roving = UI.focus.roving({
      container: bar,
      items: () => this.buttons(),
      orientation: untrack(() => this.attrs.vertical) ? UIT.VERTICAL : UIT.HORIZONTAL,
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
    if (!key || key.eventPhase === Event.NONE || untrack(() => this.attrs.activation) === UIT.MANUAL) return
    const pane = untrack(this.tabs)[index]
    if (pane) this.select(pane, key)
  }

  /** Focus left the tab list:  the Tab stop goes back to the selected tab (`manual` may have moved it). */
  private readonly onFocusOut = (event: FocusEvent) => {
    // `relatedTarget`:  `null` when focus left the page
    const next = event.relatedTarget as Node | null
    if (next && this.bar?.contains(next)) return
    if (this.roving && this.roving.activeIndex !== untrack(this.selectedIndex)) this.startRoving()
  }

  /** The URL hash changed (or, `event`-less, the page opened on one):  select the pane it names. */
  private fromHash(event?: Event) {
    const value = UITabs.hashValue(this.view.location)
    const index = untrack(this.values).indexOf(value ?? NO_VALUE)
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
    // a server render reads every pane before it renders, and writes nothing after
    if (isServer || this.isRefreshQueued) return
    this.isRefreshQueued = true
    queueMicrotask(() => {
      this.isRefreshQueued = false
      this.refreshPanes()
    })
  }

  /** The pane children, in order, upgraded or not. */
  private readPanes(): E.UIHost[] {
    return [...this.host.children].filter(UITabs.isPane) as E.UIHost[]
  }

  /** The host's window:  its document's, for `history` and its events. */
  private get view(): Window {
    return this.host.ownerDocument.defaultView ?? window
  }

  ////////////////
  // ## Helpers
  ////////////////

  // Static:  pure, passed around as values (`filter`, `map`, `equals`);  page globals come in as arguments, defaulting
  // to this window's.

  /** A pane child:  an element DEFINED with the pane's noun (`<ui-tab>`, or its translated tag). */
  private static isPane(this: void, element: Element): boolean {
    return E.UIElement.definitions.get(element.localName)?.vocabulary.noun === tabVocabulary.noun
  }

  /** The `UITab` controller of an (upgraded) pane host. */
  private static controllerOf(this: void, pane: E.UIHost): UITab {
    return pane.controller as UITab
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

  /** Same hosts, in the same order. */
  private static sameList(a: readonly Element[], b: readonly Element[]): boolean {
    return a.length === b.length && a.every((element, index) => element === b[index])
  }
}

/** Where the tab list sits when `attached`. */
type MenuEdge = typeof UIT.TOP | typeof UIT.BOTTOM

/**
 * Options of a memo that reads OTHER elements' controllers:  `lazy` on a server only.
 * - Why:  a server memo computes ONCE, and a static render (`$/ui/static`) builds controllers in document order,
 *   so an eager memo here would see panes without controllers;  lazy, it first computes at render time.
 */
const SERVER_LAZY = { lazy: isServer }

/** The tab buttons in the tab list. */
const TAB_SELECTOR = `:scope > [role=${TAB}]`

/** Window events `history` follows. */
const HISTORY_EVENTS = ["hashchange", "popstate"] as const

/** A value no pane has. */
const NO_VALUE = "\u0000"

/** Prefix of the id a server render gives a pane, for its tab's `aria-controls`. */
const PANE_ID = "ui-tab"
