import { E } from "spell-ui/core"
import { RootLoader } from "spell-ui/components/ui-root"
import type { Core, MenuItem } from "spell-parser/core"

/****************
 * ### `ActionMenus`
 * A running program's ACTIONS, on the page (epic `elemental-spell` P10):  its shortcut keys, and its menus drawn
 * as Spell UI's `<ui-action>`s.
 *
 * - Keys:  `runShortcut()` hands a key to the program's core, which runs the first enabled action bound to it,
 *   from the focused thing up to the app (`core.runShortcut()`).
 * - Menus:  a template's `- its "game menu" is a menu of ...` (spellx's `<menu "GameMenu">`), found by name on a
 *   thing or up its chain (`core.menuOf()`), drawn three ways:
 *   - as a toolbar or menu in a drawing, `<ui-toolbar menu="GameMenu" />`:  `fill()` puts its actions in
 *   - as a right click's menu, `context-menu="GameMenu"` on any element of a drawing:  `showContextMenu()`
 *   - as the app's menu bar, `- its menu bar is "GameMenu"`:  `SpellElement` draws it with `itemsFor()`
 * - Each `<ui-action>` reads its item live (title, enabled, selected), and a click runs it through the core.
 * - STATIC and page-wide on purpose, as `Glides` is:  one context menu on a page at a time.
 * - Knows nothing of the program's classes:  only the core's `menuOf()` / `runShortcut()`.
 ****************/
export class ActionMenus {
  /**
   * Run the program's action for key `event`, if one is bound to it and enabled:  true if one ran.
   * - Not a key something else took already (Spell UI's undo keys, a field's own), nor one typed into a field.
   * - SIDE EFFECT:  a key that ran an action does nothing else (`preventDefault()`).
   */
  static runShortcut(core: Core, focused: object | undefined, event: KeyboardEvent, isMac: boolean): boolean {
    if (event.defaultPrevented || event.isComposing || ActionMenus.isTypedIn(event.composedPath()[0])) return false
    if (!core.runShortcut(focused, event, isMac)) return false
    event.preventDefault()
    return true
  }

  /**
   * Put the actions of menu `menu="GameMenu"` into each toolbar or menu under `root` that names one,
   * from `thing`'s menus or its chain's.
   * - Again when its name changes;  once per element otherwise:  its actions read their items live.
   * - Put in once the element has drawn, a little later.
   * - A menu `thing` hasn't:  left empty, with a warning (the core's).
   */
  static fill(root: ParentNode, thing: object | undefined, core: Core): void {
    for (const element of root.querySelectorAll<HTMLElement>(`[${MENU}]`)) {
      const name = element.getAttribute(MENU) ?? ""
      if (FILLED.get(element) === name) continue
      FILLED.set(element, name)
      for (const made of element.querySelectorAll(`:scope > [${MADE}]`)) made.remove()
      const items = ActionMenus.itemsFor(core.menuOf(thing, name) ?? [])
      // once it has drawn:  an item put in before its owner draws never finds it (`PartContext`)
      void ActionMenus.whenDrawn(element)
        .then(() => FILLED.get(element) === name && element.append(...items))
        .catch((error: unknown) => E.Warnings.warn(`<${element.localName}>`, `can't fill menu "${name}"`, error))
    }
  }

  /**
   * Show the menu named by the nearest `context-menu=` on `event`'s path, from `thing` up its chain, where the
   * person right-clicked:  true if there was one.
   * - SIDE EFFECT:  the browser's own menu doesn't show;  the menu goes when an action runs, at Escape, or at a
   *   press anywhere else.
   */
  static showContextMenu(event: MouseEvent, stopAt: Element, thing: object | undefined, core: Core): boolean {
    const name = ActionMenus.contextMenuName(event, stopAt)
    const items = name ? core.menuOf(thing, name) : undefined
    if (!items?.length) return false
    event.preventDefault()
    ActionMenus.closeContextMenu()
    const menu = document.createElement(MENU_TAG)
    menu.setAttribute("vertical", "")
    menu.setAttribute("aria-label", name!)
    menu.setAttribute(MADE, "")
    Object.assign(menu.style, {
      position: "fixed",
      left: `${event.clientX}px`,
      top: `${event.clientY}px`,
      zIndex: "1000"
    })
    menu.append(...ActionMenus.itemsFor(items))
    for (const tag of [MENU_TAG, ACTION_TAG, ITEM_TAG])
      RootLoader.loadTag(tag)?.catch((error: unknown) => E.Warnings.warn("context-menu", `can't load <${tag}>`, error))
    document.body.append(menu)
    const stop = new AbortController()
    const close = () => {
      stop.abort()
      menu.remove()
    }
    ActionMenus.closeOpenMenu = close
    // an action run closes it, after its own click
    menu.addEventListener(
      "click",
      (click) => click.composedPath().some((at) => (at as Element).localName === ACTION_TAG) && close()
    )
    window.addEventListener("keydown", (key) => key.key === "Escape" && close(), { signal: stop.signal })
    window.addEventListener("pointerdown", (press) => !press.composedPath().includes(menu) && close(), {
      capture: true,
      signal: stop.signal
    })
    return true
  }

  /** Close the context menu showing, if one is. */
  static closeContextMenu(): void {
    ActionMenus.closeOpenMenu?.()
    ActionMenus.closeOpenMenu = undefined
  }

  /** A menu's items as elements:  a `<ui-action>` drawing each action, a divider for each line between groups. */
  static itemsFor(items: readonly MenuItem[]): HTMLElement[] {
    return items.map((item) => {
      const element = document.createElement(item.kind === "action" ? ACTION_TAG : ITEM_TAG)
      element.setAttribute(MADE, "")
      if (item.kind === "separator") element.setAttribute("type", "divider")
      else Object.assign(element, { action: item })
      return element
    })
  }

  ////////////////
  // ## Internals
  ////////////////

  /** How to close the context menu showing. */
  private static closeOpenMenu: (() => void) | undefined

  /** Once `element` is defined and has drawn (its `ready`). */
  private static async whenDrawn(element: HTMLElement): Promise<void> {
    await customElements.whenDefined(element.localName)
    await (element as { ready?: Promise<void> }).ready
  }

  /** The nearest `context-menu=` on `event`'s path, up to `stopAt`. */
  private static contextMenuName(event: Event, stopAt: Element): string | undefined {
    for (const target of event.composedPath()) {
      const name = (target as Element).getAttribute?.(CONTEXT_MENU)
      if (name) return name
      if (target === stopAt) return undefined
    }
    return undefined
  }

  /** Is `target` somewhere people type:  a text field, a text area, a select, editable text?  Its keys are its own. */
  private static isTypedIn(target: EventTarget | undefined): boolean {
    if (!(target instanceof HTMLElement)) return false
    if (target.isContentEditable || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
      return true
    }
    return target instanceof HTMLInputElement && !NOT_TYPED_IN.has(target.type)
  }
}

/** The attribute naming the menu a toolbar or menu in a drawing shows:  `<ui-toolbar menu="GameMenu" />`. */
const MENU = "menu"

/** The attribute naming the menu a right click on an element shows:  `context-menu="GameMenu"`. */
const CONTEXT_MENU = "context-menu"

/** Marks the elements made here, so a menu filled again takes them away first. */
const MADE = "data-spell-action-menu"

/** The tags a menu is drawn with. */
const MENU_TAG = "ui-menu"
const ACTION_TAG = "ui-action"
const ITEM_TAG = "ui-item"

/** Each toolbar or menu filled, with the name it was filled from. */
const FILLED = new WeakMap<Element, string>()

/** The inputs that take no typing:  a key pressed in one may run an action. */
const NOT_TYPED_IN = new Set(["button", "checkbox", "radio", "range", "color", "file", "submit", "reset", "image"])
