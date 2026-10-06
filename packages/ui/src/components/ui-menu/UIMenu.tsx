import { Match, Switch, createEffect, createMemo, onSettled, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { menuVocabulary } from "./ui-menu.vocabulary.en"
import { MenuFallback } from "./ui-menu.fallback"
import type { ChoosableItem, ItemController, Vocabulary } from "./ui-menu.types"

import menuCSS from "./ui-menu.css?inline"

/****************
 * ### `<ui-menu>`
 * A menu of generic `<ui-item>`s, in one of three shapes (`ui-menu.css` has the markup contract):
 * - DEFAULT, a navigation landmark:  `<nav class="ui ... menu" part="menu" aria-label>` around the slot.  Items with
 *   `href` are links, the selected one `aria-current="page"`;  `link` / `pagination` menus make every other item a
 *   `<button>`.  The host's `aria-label` names the landmark (two navs on a page need distinct names).
 * - `interactive`, an application MENUBAR (WAI-ARIA APG):  `<div role="menubar" aria-orientation>`;  items are
 *   `role="menuitem"` (hosts `role="none"`), ONE Tab stop with arrow keys / Home / End between them:  a roving
 *   tabindex (`UI.focus.roving`) over the items' BOXES (`UIItem.focusTarget`), never the hosts -- a focusable host
 *   without a visible role breaks the menubar's required-children pattern.  Disabled items are skipped.
 * - SUB-MENU:  a `<ui-menu>` owned by a menu (`PartContext`:  directly, or inside an item) renders
 *   `<div class="[position] menu" part="menu">` -- Fomantic's `.right.menu` or a vertical menu's `.item > .menu`
 *   -- and hands its items the TOP menu's `ItemContext`.
 * - `ItemOwner`:  the items render by what `itemContext()` says, and adopt this element's `styles` (the item rules
 *   live in `ui-menu.css`).  Items ASK for their context, which is also how the menu learns its item hosts (the
 *   roving set), after they upgrade in any order.
 * - Events:  `ui-select` (`{ value, item, originalEvent }`) when a link / button item is activated -- click, or
 *   Enter / Space on it;  only the TOP menu dispatches it.  A menu never moves `selected` itself, EXCEPT a
 *   `segmented` one (a single-choice control):  it selects the activated item and unselects the rest, unless a
 *   listener cancels the `ui-select`.
 ****************/
export class UIMenu extends E.UIElement<Vocabulary> implements UIT.ItemOwner {
  @E.proto static vocabulary = menuVocabulary
  @E.proto static styles = { menu: menuCSS }
  @E.proto static Fallback = MenuFallback
  /** A sub-menu is a part of its menu;  transparent to other parts' climbs (an item's header finds the menu). */
  @E.proto static isPart = true
  /** Nothing to delegate to:  the items are the focus targets. */
  @E.proto static delegatesFocus = false

  /** Owning menu, when this is a sub-menu. */
  readonly context = new E.PartContext(this.host, this.vocabulary.noun)

  /** Host `aria-label`, forwarded to the landmark / menubar. */
  readonly ariaLabel = new E.HostAttribute({ host: this.host, name: UIT.ARIA_LABEL })

  /** Item hosts that asked THIS (top) menu for their context:  the roving candidates. */
  private readonly asked = new WeakSet<Element>()

  /** Live roving tabindex while `interactive`. */
  private roving: E.RovingTabindex | undefined

  /** The menubar root, while rendered. */
  private bar: HTMLElement | undefined

  /** A refresh of the roving set is queued. */
  private isRefreshQueued = false

  ////////////////
  // ## Derived state
  ////////////////

  /** The owning menu's controller, when this is a sub-menu:  only menus own `menu` parts.  Tracked. */
  readonly parent = createMemo(() => this.context.ownerController<UIMenu>())

  /** What this menu's items render as (only the top menu's is read). */
  readonly ownContext = createMemo(() => this.computeContext(), { equals: UIMenu.isSameContext })

  /** The menubar is live:  top-level, `interactive`, rendered. */
  readonly isMenubar = createMemo(() => !this.parent() && this.attrs.interactive && this.loaded())

  /** Listens for clicks on the host (`ui-select`), and runs the roving tabindex while this is a menubar. */
  constructor(...args: ConstructorParameters<typeof E.UIElement>) {
    super(...args)
    const onClick = (event: MouseEvent) => this.onClick(event)
    this.host.addEventListener("click", onClick)
    this.host.addReleaseCallback(() => this.host.removeEventListener("click", onClick))
    // SIDE EFFECT:  roving tabindex over the item hosts while this is a menubar
    createEffect(
      () => (this.isMenubar() ? this.orientation() : undefined),
      (orientation) => {
        if (!orientation) return
        queueMicrotask(() => this.startRoving(orientation))
        return () => this.stopRoving()
      }
    )
    onSettled(() => this.queueRefresh())
  }

  /** Top menu of a sub-menu tree. */
  top(): UIMenu {
    return this.parent()?.top() ?? this
  }

  /**
   * `ItemOwner`:  what `item` renders as -- the TOP menu's published context.  Tracked.
   * - SIDE EFFECT:  records the item for the roving set, and re-applies the roving tabindexes once the item has
   *   (re-)rendered its box.
   */
  itemContext(item: Element): UIT.ItemContext {
    const top = untrack(() => this.top())
    top.asked.add(item)
    top.queueRefresh()
    return top.ownContext()
  }

  /** What this (top) menu's items render as, from its attributes.  Tracked. */
  private computeContext(): UIT.ItemContext {
    const isInteractive = this.attrs.interactive
    return {
      hostRole: isInteractive ? UIT.NONE : undefined,
      role: isInteractive ? MENUITEM_ROLE : undefined,
      interactive: isInteractive || this.attrs.link || this.attrs.pagination,
      current: UIT.PAGE
    }
  }

  /** The menubar's arrow-key axis:  `vertical` menus go up and down.  Tracked. */
  private orientation(): E.RovingOrientation {
    return this.attrs.vertical ? UIT.VERTICAL : UIT.HORIZONTAL
  }

  protected hostStates() {
    return { interactive: !this.parent() && this.attrs.interactive, vertical: this.attrs.vertical }
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** The root for this shape:  sub-menu, menubar or landmark. */
  render(): JSX.Element {
    return (
      <Switch>
        <Match when={this.parent()}>
          <div class={this.subClasses()} part={this.part("menu")}>
            <slot />
          </div>
        </Match>
        <Match when={this.attrs.interactive}>
          <div
            ref={(element: HTMLElement) => (this.bar = element)}
            class={this.classes()}
            part={this.part("menu")}
            role={MENUBAR_ROLE}
            aria-orientation={this.attrs.vertical ? UIT.VERTICAL : undefined}
            aria-label={this.ariaLabel.get()}
          >
            <slot />
          </div>
        </Match>
        <Match when={true}>
          <nav class={this.classes()} part={this.part("menu")} aria-label={this.ariaLabel.get()}>
            <slot />
          </nav>
        </Match>
      </Switch>
    )
  }

  /** A sub-menu's classes:  `[position] menu`, no `ui`. */
  private subClasses(): string {
    return [this.attrs.position, this.vocabulary.noun].filter(Boolean).join(" ")
  }

  ////////////////
  // ## Behaviour
  ////////////////

  /**
   * A click inside the menu:  `ui-select` when it activated a link / button item (Enter / Space on one click it
   * too).  Only the top menu dispatches;  a sub-menu's clicks bubble to it.
   */
  private onClick(event: MouseEvent) {
    if (this.parent()) return
    const item = UIMenu.activatedItem(event)
    if (!item || item.matches(UIT.DISABLED_STATE)) return
    const controller = (item as E.UIHost).controller as ItemController | undefined
    const value = controller?.attrs?.value ?? item.textContent?.trim() ?? ""
    const isChosen = this.emit("ui-select", { value, item, originalEvent: event })
    if (isChosen && this.attrs.appearance === SEGMENTED) this.choose(item)
  }

  /**
   * A segmented menu's choice:  `item` becomes the selected item, every other item of this menu tree drops it
   * (the `active` alias too).
   * - Only items that asked THIS menu for their context:  a nested component's items stay alone.
   */
  private choose(item: Element) {
    for (const element of this.host.querySelectorAll<ChoosableItem>("*")) {
      if (!this.asked.has(element)) continue
      if (element !== item) element.removeAttribute(UIT.ACTIVE)
      element.selected = element === item
    }
  }

  /** Start the roving tabindex on the menubar root, the selected item (or the first) as the tab stop. */
  private startRoving(orientation: E.RovingOrientation) {
    this.stopRoving()
    const bar = this.bar
    if (!bar || !this.host.isConnected) return
    const boxes = this.menuItems()
    const selected = boxes.findIndex((box) => (box.getRootNode() as ShadowRoot).host?.matches(SELECTED_STATE))
    this.roving = UI.focus.roving({
      container: bar,
      items: () => this.menuItems(),
      orientation,
      activeIndex: Math.max(0, selected)
    })
  }

  /** Stop roving;  the item boxes lose the `tabindex`es it set. */
  private stopRoving() {
    if (!this.roving) return
    this.roving.detach()
    this.roving = undefined
    for (const box of this.menuItems()) box.removeAttribute(UIT.TABINDEX)
  }

  /** Re-apply the roving `tabindex`es once, after the item set may have changed (restarting before any focus). */
  private queueRefresh() {
    if (this.isRefreshQueued) return
    this.isRefreshQueued = true
    queueMicrotask(() => {
      this.isRefreshQueued = false
      if (!this.roving) return
      if (this.host.matches(FOCUS_WITHIN)) this.roving.refresh()
      else this.startRoving(untrack(() => this.orientation()))
    })
  }

  /**
   * The roving set, in document order:  the item BOXES (`UIItem.focusTarget`) of items owned by this menu tree,
   * `type="item"`, not hidden.  Untracked:  called from handlers and effect cleanups.
   */
  private menuItems(): HTMLElement[] {
    return untrack(() => {
      const boxes: HTMLElement[] = []
      for (const element of this.host.querySelectorAll<HTMLElement>("*")) {
        if (!this.asked.has(element) || element.hidden) continue
        const item = (element as E.UIHost).controller as ItemController | undefined
        const box = item?.focusTarget
        if (box && item.attrs.type === UIT.ITEM) boxes.push(box)
      }
      return boxes
    })
  }

  ////////////////
  // ## Statics
  ////////////////

  /**
   * The item host whose link / button root the event went through, if any.
   * - STATIC:  needs no instance, only the event's path.
   * - `instanceof` is safe here:  a click handler, which the static render (`$/ui/static`) never runs.
   */
  private static activatedItem(event: Event): Element | undefined {
    for (const target of event.composedPath()) {
      if (!(target instanceof HTMLElement)) continue
      if ((target.localName === UIT.ANCHOR_TAG || target.localName === UIT.BUTTON) && target.part.contains(UIT.ITEM)) {
        const root = target.getRootNode()
        return root instanceof ShadowRoot ? root.host : undefined
      }
    }
    return undefined
  }

  /**
   * Same item context, field by field:  items don't re-render for an equal one.
   * - STATIC:  pure, handed to `createMemo()`.
   */
  private static isSameContext(a: UIT.ItemContext, b: UIT.ItemContext): boolean {
    return a.hostRole === b.hostRole && a.role === b.role && a.interactive === b.interactive && a.current === b.current
  }
}

////////////////
// ## Constants
////////////////

/** `role` of an `interactive` menu's root. */
const MENUBAR_ROLE = "menubar"

/** `role` of an `interactive` menu's item boxes. */
const MENUITEM_ROLE = "menuitem"

/** Selector of a selected item host:  the menubar's first tab stop. */
const SELECTED_STATE = ":state(selected)"

/** Selector of a menu holding focus:  the roving set refreshes in place instead of restarting. */
const FOCUS_WITHIN = ":focus-within"

/** The `appearance` of a single-choice menu:  it moves `selected` itself. */
const SEGMENTED: UIT.MenuAppearance = "segmented"
