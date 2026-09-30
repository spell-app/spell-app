import { Match, Switch, createEffect, createMemo, onSettled, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import {
  HostAttribute,
  PartContext,
  proto,
  UI,
  UIElement,
  type ItemContext,
  type ItemOwner,
  type RovingTabindex,
  type UIHost
} from "$/core"

import { menuVocabulary } from "./menu.vocabulary.en"
import { MenuFallback } from "./menu.fallback"

import menuCSS from "./menu.css?inline"

/****************
 * ### `<ui-menu>`
 * A menu of generic `<ui-item>`s, in one of three shapes (`menu.css` has the markup contract):
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
 *   live in `menu.css`).  Items ASK for their context, which is also how the menu learns its item hosts (the
 *   roving set), after they upgrade in any order.
 * - Events:  `ui-select` (`{ value, item, originalEvent }`) when a link / button item is activated -- click, or
 *   Enter / Space on it;  only the TOP menu dispatches it.  The menu never moves `selected` itself.
 ****************/
export class UIMenu extends UIElement<typeof menuVocabulary> implements ItemOwner {
  @proto static vocabulary = menuVocabulary
  @proto static styles = { menu: menuCSS }
  @proto static Fallback = MenuFallback
  /** A sub-menu is a part of its menu;  transparent to other parts' climbs (an item's header finds the menu). */
  @proto static isPart = true
  /** Nothing to delegate to:  the items are the focus targets. */
  @proto static delegatesFocus = false

  /** Owning menu, when this is a sub-menu. */
  readonly context = new PartContext(this.host, this.vocabulary.noun)

  /** Host `aria-label`, forwarded to the landmark / menubar. */
  readonly ariaLabel = new HostAttribute(this.host, ARIA_LABEL)

  /** Item hosts that asked THIS (top) menu for their context:  the roving candidates. */
  private readonly asked = new WeakSet<Element>()

  /** Live roving tabindex while `interactive`. */
  private roving: RovingTabindex | undefined

  /** The menubar root, while rendered. */
  private bar: HTMLElement | undefined

  /** A refresh of the roving set is queued. */
  private refreshQueued = false

  ////////////////
  // ## Derived state
  ////////////////

  /** The owning menu's controller, when this is a sub-menu. */
  readonly parent = createMemo((): UIMenu | undefined => {
    const controller = (this.context.owner.get()?.owner as UIHost | undefined)?.controller
    return controller instanceof UIMenu ? controller : undefined
  })

  /** What this menu's items render as (only the top menu's is read). */
  readonly ownContext = createMemo(() => this.computeContext(), { equals: sameContext })

  /** The menubar is live:  top-level, `interactive`, rendered. */
  readonly menubar = createMemo(() => !this.parent() && this.attrs.interactive && this.loaded())

  constructor(...args: ConstructorParameters<typeof UIElement>) {
    super(...args)
    const onClick = (event: MouseEvent) => this.onClick(event)
    this.host.addEventListener("click", onClick)
    this.host.addReleaseCallback(() => this.host.removeEventListener("click", onClick))
    // SIDE EFFECT:  roving tabindex over the item hosts while this is a menubar
    createEffect(
      () => (this.menubar() ? (this.attrs.vertical ? VERTICAL : HORIZONTAL) : undefined),
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
  itemContext(item: Element): ItemContext {
    const top = untrack(() => this.top())
    top.asked.add(item)
    top.queueRefresh()
    return top.ownContext()
  }

  /** What this (top) menu's items render as, from its attributes.  Tracked. */
  private computeContext(): ItemContext {
    const interactive = this.attrs.interactive
    return {
      hostRole: interactive ? NONE : null,
      role: interactive ? MENUITEM : undefined,
      interactive: interactive || this.attrs.link || this.attrs.pagination,
      current: PAGE
    }
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
            role={MENUBAR}
            aria-orientation={this.attrs.vertical ? VERTICAL : undefined}
            aria-label={this.ariaLabel.get() ?? undefined}
          >
            <slot />
          </div>
        </Match>
        <Match when={true}>
          <nav class={this.classes()} part={this.part("menu")} aria-label={this.ariaLabel.get() ?? undefined}>
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
    if (!item || item.matches(DISABLED_STATE)) return
    const controller = (item as UIHost).controller as { attrs?: { value?: string } } | undefined
    const value = controller?.attrs?.value ?? item.textContent?.trim() ?? ""
    this.emit("ui-select", { value, item, originalEvent: event })
  }

  /** The item host whose link / button root the event went through, if any. */
  private static activatedItem(event: Event): Element | undefined {
    for (const target of event.composedPath()) {
      if (!(target instanceof HTMLElement)) continue
      if ((target.localName === LINK || target.localName === BUTTON) && target.part.contains(ITEM_PART)) {
        const root = target.getRootNode()
        return root instanceof ShadowRoot ? root.host : undefined
      }
    }
    return undefined
  }

  /** Start the roving tabindex on the menubar root, the selected item (or the first) as the tab stop. */
  private startRoving(orientation: "horizontal" | "vertical") {
    this.stopRoving()
    const bar = this.bar
    if (!bar || !this.host.isConnected) return
    const boxes = this.menuItems()
    const selected = boxes.findIndex((box) => (box.getRootNode() as ShadowRoot).host?.matches(SELECTED_STATE))
    this.roving = UI.focus.roving(bar, () => this.menuItems(), {
      orientation,
      activeIndex: Math.max(0, selected)
    })
  }

  /** Stop roving;  the item boxes lose the `tabindex`es it set. */
  private stopRoving() {
    if (!this.roving) return
    this.roving.detach()
    this.roving = undefined
    for (const box of this.menuItems()) box.removeAttribute(TABINDEX)
  }

  /** Re-apply the roving `tabindex`es once, after the item set may have changed (restarting before any focus). */
  private queueRefresh() {
    if (this.refreshQueued) return
    this.refreshQueued = true
    queueMicrotask(() => {
      this.refreshQueued = false
      if (!this.roving) return
      const focused = this.host.matches(":focus-within")
      if (focused) this.roving.refresh()
      else this.startRoving(untrack(() => this.attrs.vertical) ? VERTICAL : HORIZONTAL)
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
        const item = (element as UIHost).controller as ItemController | undefined
        const box = item?.focusTarget
        if (box && item.attrs.type === ITEM_TYPE) boxes.push(box)
      }
      return boxes
    })
  }
}

/** What the menu reads from an item's controller (`UIItem`, not imported:  another family). */
type ItemController = { attrs: { type?: string }; focusTarget?: HTMLElement }

/** Same item context, field by field:  items don't re-render for an equal one. */
function sameContext(a: ItemContext, b: ItemContext): boolean {
  return a.hostRole === b.hostRole && a.role === b.role && a.interactive === b.interactive && a.current === b.current
}

/** Host attribute forwarded to the root. */
const ARIA_LABEL = "aria-label"

/** Roles. */
const MENUBAR = "menubar"
const MENUITEM = "menuitem"
const NONE = "none"

/** `aria-current` of a selected link item. */
const PAGE = "page"

/** Orientations (`aria-orientation`, roving). */
const HORIZONTAL = "horizontal"
const VERTICAL = "vertical"

/** Tags of an interactive item root, and its part. */
const LINK = "a"
const BUTTON = "button"
const ITEM_PART = "item"

/** Item `type` in the roving set. */
const ITEM_TYPE = "item"

/** Item host states. */
const SELECTED_STATE = ":state(selected)"
const DISABLED_STATE = ":state(disabled)"

/** Attribute the roving tabindex writes on item hosts. */
const TABINDEX = "tabindex"
