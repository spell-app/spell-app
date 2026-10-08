import { Match, Switch, onSettled, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { menuVocabulary } from "./UIMenu.en"

import menuCSS from "./UIMenu.css?inline"

/**
 * Same item context, field by field:  items don't re-render for an equal one (`ownItemContext`'s `equals`).
 * - Above the class:  `@derived({ equals })` reads it while the class is defined.
 */
function isSameContext(a: UIT.ItemContext, b: UIT.ItemContext): boolean {
  return (
    a.domElementRole === b.domElementRole &&
    a.role === b.role &&
    a.interactive === b.interactive &&
    a.current === b.current
  )
}

/****************
 * ### `UIMenu`
 * The component behind `<ui-menu>`:  a menu of generic `<ui-item>`s, in one of three shapes
 * (`UIMenu.css` has the markup of each).
 *
 * - DEFAULT, a navigation landmark:  `<nav class="ui ... menu" part="menu" aria-label>` around the slot.
 *   - Items with `href` are links, the selected one `aria-current="page"`;
 *     `link` and `pagination` menus make every other item a `<button>`.
 *   - The DOM element's `aria-label` names the landmark (two navs on a page need distinct names).
 *
 * - `interactive`, an application MENUBAR (WAI-ARIA APG):  `<div role="menubar" aria-orientation>`.
 *   - Items are `role="menuitem"` (their DOM elements `role="none"`),
 *     with ONE Tab stop, and arrow keys, Home and End between them.
 *   - That's a roving tabindex (`UI.focus.roving`) over the items' BOXES (`UIItem.focusTarget`),
 *     never their DOM elements:  a focusable DOM element without a visible role breaks the menubar's
 *     required-children pattern.
 *   - Disabled items are skipped.
 *
 * - SUB-MENU:  a `<ui-menu>` owned by a menu (`PartContext`:  directly, or inside an item)
 *   draws `<div class="[position] menu" part="menu">`, Fomantic's `.right.menu` or a vertical menu's `.item > .menu`,
 *   and hands its items the TOP menu's `ItemContext`.
 *
 * - It owns its items (`ItemOwner`):  they draw themselves as `itemContext()` says,
 *   and adopt this component's `styleSheets` (the item rules live in `UIMenu.css`).
 *   Items ASK for their context, which is also how the menu learns its items' DOM elements (the roving set),
 *   after they upgrade in any order.
 *
 * - Events:  `ui-select` (`{ value, item, originalEvent }`) when a link or button item is activated
 *   (a click, or Enter or Space on it);  only the TOP menu sends it.
 *   - A menu never moves `selected` itself, EXCEPT a `segmented` one (a single-choice control):
 *     it selects the activated item and unselects the rest, unless a listener cancels the `ui-select`.
 ****************/
export class UIMenu extends E.UIComponent<typeof menuVocabulary> implements UIT.ItemOwner {
  @E.proto static vocabulary = menuVocabulary
  @E.proto static styleSheets = { menu: menuCSS }
  @E.proto static elementSetup = {
    // a sub-menu is a part of its menu:  an item's header looks past it to the menu
    isAPart: true,
    // nothing to delegate to:  the items are the focus targets
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  /** Listens for clicks on the DOM element (`ui-select`), and re-applies the roving tabindexes once settled. */
  constructor(...args: ConstructorParameters<typeof E.UIComponent>) {
    super(...args)
    const onClick = (event: MouseEvent) => this.onClick(event)
    this.domElement.addEventListener("click", onClick)
    this.domElement.addReleaseCallback(() => this.domElement.removeEventListener("click", onClick))
    onSettled(() => this.queueRefresh())
  }

  ////////////////
  // ## The menu tree
  ////////////////

  /** Owning menu, when this is a sub-menu. */
  readonly context = new E.PartContext({ domElement: this.domElement, noun: this.vocabulary.noun })

  /** The owning menu's component, when this is a sub-menu:  only menus own `menu` parts. */
  get parentMenu(): UIMenu | undefined {
    return this.context.ownerComponent<UIMenu>()
  }

  /** Top menu of a sub-menu tree. */
  get topMenu(): UIMenu {
    return this.parentMenu?.topMenu ?? this
  }

  /** A sub-menu's classes:  `[position] menu`, no `ui`. */
  private get subMenuClasses(): string {
    return [this.position, this.vocabulary.noun].filter(Boolean).join(" ")
  }

  ////////////////
  // ## Items
  ////////////////

  /** Item DOM elements that asked THIS (top) menu for their context:  the roving candidates. */
  private readonly itemsThatAsked = new WeakSet<Element>()

  /**
   * What this menu's items render as (only the top menu's is read), from its attributes.
   * - The same object while an equal one is computed (`isSameContext()`):  items don't re-render for it.
   */
  @E.derived({ equals: isSameContext })
  get ownItemContext(): UIT.ItemContext {
    const isInteractive = this.interactive
    return {
      domElementRole: isInteractive ? "none" : undefined,
      role: isInteractive ? "menuitem" : undefined,
      interactive: isInteractive || this.link || this.pagination,
      current: "page"
    }
  }

  /**
   * `ItemOwner`:  what `item` renders as -- the TOP menu's published context.  Tracked.
   * - SIDE EFFECT:  records the item for the roving set, and re-applies the roving tabindexes once the item has
   *   (re-)rendered its box.
   */
  itemContext(item: Element): UIT.ItemContext {
    const top = untrack(() => this.topMenu)
    top.itemsThatAsked.add(item)
    top.queueRefresh()
    return top.ownItemContext
  }

  /**
   * A click inside the menu:  `ui-select` when it activated a link / button item (Enter / Space on one click it
   * too).  Only the top menu dispatches;  a sub-menu's clicks bubble to it.
   */
  private onClick(event: MouseEvent) {
    if (this.parentMenu) return
    const item = UIMenu.activatedItem(event)
    if (!item || item.matches(UIT.DISABLED_STATE)) return
    const component = (item as E.DOMElement).component as ItemComponent | undefined
    const value = component?.value ?? item.textContent?.trim() ?? ""
    const isChosen = this.send("ui-select", { value, item, originalEvent: event })
    if (isChosen && this.appearance === SEGMENTED) this.choose(item)
  }

  /**
   * A segmented menu's choice:  `item` becomes the selected item, every other item of this menu tree drops it
   * (the `active` alias too).
   * - Only items that asked THIS menu for their context:  a nested component's items stay alone.
   */
  private choose(item: Element) {
    for (const element of this.domElement.querySelectorAll<ChoosableItem>("*")) {
      if (!this.itemsThatAsked.has(element)) continue
      if (element !== item) element.removeAttribute(UIT.ACTIVE)
      element.selected = element === item
    }
  }

  ////////////////
  // ## The menubar
  ////////////////

  /** Top-level and `interactive`?  `:state(interactive)`;  not `isMenubar`, which also waits for `isReady`. */
  @E.cssState("interactive")
  get isInteractiveMenubar(): boolean {
    return !this.parentMenu && this.interactive
  }

  /** The menubar is live:  top-level, `interactive`, rendered. */
  get isMenubar(): boolean {
    return !this.parentMenu && this.interactive && this.isReady
  }

  /** `vertical`?  `:state(vertical)`. */
  @E.cssState("vertical")
  get isVertical(): boolean {
    return this.vertical
  }

  /** The menubar's arrow-key axis:  `vertical` menus go up and down. */
  private get orientation(): E.RovingOrientation {
    return this.vertical ? "vertical" : "horizontal"
  }

  /** Live roving tabindex while `interactive`. */
  private rovingTabindex: E.RovingTabindex | undefined

  /** The menubar root, while rendered. */
  private bar: HTMLElement | undefined

  /** A refresh of the roving set is queued. */
  private refreshIsQueued = false

  /** SIDE EFFECT:  a roving tabindex over the item DOM elements while this is a menubar;  returns its stop. */
  @E.onChange("isMenubar", "orientation")
  protected onMenubarChanged(isMenubar: boolean, orientation: E.RovingOrientation) {
    if (!isMenubar) return
    queueMicrotask(() => this.startRoving(orientation))
    return () => this.stopRoving()
  }

  /** Start the roving tabindex on the menubar root, the selected item (or the first) as the tab stop. */
  private startRoving(orientation: E.RovingOrientation) {
    this.stopRoving()
    const bar = this.bar
    if (!bar || !this.domElement.isConnected) return
    const boxes = this.menuItems()
    const selected = boxes.findIndex((box) => (box.getRootNode() as ShadowRoot).host?.matches(SELECTED_STATE))
    this.rovingTabindex = UI.focus.roving({
      container: bar,
      items: () => this.menuItems(),
      orientation,
      activeIndex: Math.max(0, selected)
    })
  }

  /** Stop roving;  the item boxes lose the `tabindex`es it set. */
  private stopRoving() {
    if (!this.rovingTabindex) return
    this.rovingTabindex.detach()
    this.rovingTabindex = undefined
    for (const box of this.menuItems()) box.removeAttribute("tabindex")
  }

  /** Re-apply the roving `tabindex`es once, after the item set may have changed (restarting before any focus). */
  private queueRefresh() {
    if (this.refreshIsQueued) return
    this.refreshIsQueued = true
    queueMicrotask(() => {
      this.refreshIsQueued = false
      if (!this.rovingTabindex) return
      if (this.domElement.matches(":focus-within")) this.rovingTabindex.refresh()
      else this.startRoving(untrack(() => this.orientation))
    })
  }

  /**
   * The roving set, in document order:  the item BOXES (`UIItem.focusTarget`) of items owned by this menu tree,
   * `type="item"`, not hidden.  Untracked:  called from handlers and effect cleanups.
   */
  private menuItems(): HTMLElement[] {
    return untrack(() => {
      const boxes: HTMLElement[] = []
      for (const element of this.domElement.querySelectorAll<HTMLElement>("*")) {
        if (!this.itemsThatAsked.has(element) || element.hidden) continue
        const item = (element as E.DOMElement).component as ItemComponent | undefined
        const box = item?.focusTarget
        if (box && item.type === UIT.ITEM) boxes.push(box)
      }
      return boxes
    })
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** The root for this shape:  sub-menu, menubar or landmark;  the DOM element's `aria-label` names the last two. */
  render(): JSX.Element {
    return (
      <Switch>
        <Match when={this.parentMenu}>
          <div class={this.subMenuClasses} part={this.partForName("menu")}>
            <slot />
          </div>
        </Match>
        <Match when={this.interactive}>
          <div
            ref={(element: HTMLElement) => (this.bar = element)}
            class={this.rootClasses}
            part={this.partForName("menu")}
            role="menubar"
            aria-orientation={this.vertical ? "vertical" : undefined}
            aria-label={this.attributes["aria-label"] ?? undefined}
          >
            <slot />
          </div>
        </Match>
        <Match when={true}>
          <nav
            class={this.rootClasses}
            part={this.partForName("menu")}
            aria-label={this.attributes["aria-label"] ?? undefined}
          >
            <slot />
          </nav>
        </Match>
      </Switch>
    )
  }

  ////////////////
  // ## Statics
  ////////////////

  /**
   * The item DOM element whose link / button root the event went through, if any.
   * - STATIC:  needs no instance, only the event's path.
   * - `instanceof` is safe here:  a click handler, which the static render (`$/ui/static`) never runs.
   */
  private static activatedItem(event: Event): Element | undefined {
    for (const target of event.composedPath()) {
      if (!(target instanceof HTMLElement)) continue
      if ((target.localName === "a" || target.localName === "button") && target.part.contains(UIT.ITEM)) {
        const root = target.getRootNode()
        return root instanceof ShadowRoot ? root.host : undefined
      }
    }
    return undefined
  }
}
/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIMenu extends E.AttributeValues<typeof menuVocabulary> {}

////////////////
// ## Constants
////////////////

/** Selector of a selected item DOM element:  the menubar's first tab stop. */
const SELECTED_STATE = ":state(selected)"

/** The `appearance` of a single-choice menu:  it moves `selected` itself. */
const SEGMENTED: UIT.MenuAppearance = "segmented"

////////////////
// ## Item types
////////////////

/** What the menu reads from an item's component (`UIItem`, not imported:  another family). */
type ItemComponent = {
  /** `type` (its vocabulary getter):  `item`, `header` or `divider`;  only `item`s join the roving set */
  readonly type?: string
  /** `value` (its vocabulary getter):  what `ui-select` reports for the item (default its text) */
  readonly value?: string
  /** the item's box that takes focus (its link or button), once rendered */
  focusTarget?: HTMLElement
}

/** What the menu writes on an item's DOM element it chooses (`UIItem`'s reflected `selected`). */
type ChoosableItem = Element & {
  /** the item's `selected` property */
  selected?: boolean
}
