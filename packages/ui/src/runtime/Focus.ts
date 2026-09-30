import type { Disposer, FocusRoot, RovingItems, RovingOptions } from "./runtime.types"
import { RovingTabindex } from "./RovingTabindex"

/**
 * Focus helpers that see through shadow roots, as `UI.focus`.
 * - Why:  `document.activeElement` stops at the first shadow host, and `querySelectorAll` can't see
 *   into shadow roots or follow slots -- every component with a shadow root breaks naive focus code.
 * - `<dialog>.showModal()` traps focus natively;  `trap()` is only for the non-dialog cases
 *   (a flyout inside a popover, a menu that must keep focus).
 */
export class Focus {
  /**
   * The element that really has focus, descending through open shadow roots.
   * - `null` when nothing (or only `<body>`) is focused.
   */
  activeElementDeep(root: Document | ShadowRoot = document): Element | null {
    let active = root.activeElement
    while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement
    return active === document.body ? null : active
  }

  /**
   * Tabbable elements under `root`, in FLAT-TREE order (the order Tab visits them).
   * - Crosses open shadow roots, and follows `<slot>`s to their assigned elements (or fallback content).
   * - Skips subtrees that are `inert`, `hidden` or not rendered (`checkVisibility()`),
   *   and elements that are `:disabled` or have a negative `tabindex`.
   * - NOTE: positive `tabindex` ordering and "one tab stop per radio group" are NOT modelled;
   *   components shouldn't create either.
   */
  focusables(root: FocusRoot): HTMLElement[] {
    const found: HTMLElement[] = []
    const start = root instanceof Document ? root.documentElement : root
    if (start instanceof Element) this.visit(start, found)
    else this.visitChildren(start, found)
    return found
  }

  /** First tabbable element under `root`, or `null`. */
  first(root: FocusRoot): HTMLElement | null {
    return this.focusables(root)[0] ?? null
  }

  /** Last tabbable element under `root`, or `null`. */
  last(root: FocusRoot): HTMLElement | null {
    return this.focusables(root).at(-1) ?? null
  }

  /** Is `element` inside `container`, following the composed tree (slots, shadow hosts)? */
  containsDeep(container: Node, element: Node | null): boolean {
    let current: Node | null = element
    while (current) {
      if (current === container) return true
      current = (current as Element).assignedSlot ?? current.parentNode ?? hostOf(current)
    }
    return false

    /** Host of shadow root `node`, if it is one. */
    function hostOf(node: Node): Node | null {
      return node instanceof ShadowRoot ? node.host : null
    }
  }

  /**
   * Keep Tab / Shift+Tab cycling inside `root` until the disposer is called.
   * - Tab past the last tabbable wraps to the first, and vice versa;  focus escaping any other way
   *   (a click, a script) is pulled back to the first tabbable.
   * - SIDE EFFECT:  capture listeners on `document` while active.
   */
  trap(root: Element | ShadowRoot): Disposer {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || event.ctrlKey || event.metaKey || event.altKey) return
      const items = this.focusables(root)
      if (!items.length) return event.preventDefault()
      const active = this.activeElementDeep()
      const first = items[0]!
      const last = items.at(-1)!
      if (event.shiftKey && (active === first || !this.containsDeep(root, active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || !this.containsDeep(root, active))) {
        event.preventDefault()
        first.focus()
      }
    }
    const onFocusIn = () => {
      const active = this.activeElementDeep()
      if (active && !this.containsDeep(root, active)) this.first(root)?.focus()
    }
    document.addEventListener("keydown", onKeyDown, { capture: true })
    document.addEventListener("focusin", onFocusIn, { capture: true })
    return () => {
      document.removeEventListener("keydown", onKeyDown, { capture: true })
      document.removeEventListener("focusin", onFocusIn, { capture: true })
    }
  }

  /** Attach a `RovingTabindex` (menus, tabs, listboxes) -- see that class. */
  roving(container: HTMLElement, items: RovingItems, options?: RovingOptions): RovingTabindex {
    return RovingTabindex.attach(container, items, options)
  }

  ////////////////
  // ## Tree walk
  ////////////////

  /** Visit `element` and, unless the subtree is skipped, what it renders. */
  private visit(element: Element, found: HTMLElement[]) {
    if (element.hasAttribute("inert") || element.hasAttribute("hidden")) return
    if (element instanceof HTMLSlotElement) {
      const assigned = element.assignedElements({ flatten: true })
      if (assigned.length) {
        for (const child of assigned) this.visit(child, found)
        return
      }
      // no assigned content -> fallback children render
    } else if (!element.checkVisibility({ visibilityProperty: true })) {
      // NOTE: `display: contents` elements report invisible yet render children -- descend into those
      if (getComputedStyle(element).display !== "contents") return
    } else if (element instanceof HTMLElement && this.isTabbable(element)) {
      found.push(element)
    }
    this.visitChildren(element.shadowRoot ?? element, found)
  }

  /** Visit each child element of `parent`. */
  private visitChildren(parent: Element | ShadowRoot, found: HTMLElement[]) {
    for (const child of parent.children) this.visit(child, found)
  }

  /**
   * Would Tab stop on `element`?  Already known to be rendered.
   * - `tabIndex` is `0` for natively focusable elements and `-1` otherwise, unless `tabindex` says different --
   *   except shadow hosts with `delegatesFocus`, whose shadow content is what's tabbable.
   */
  private isTabbable(element: HTMLElement): boolean {
    if (element.tabIndex < 0) return false
    if (element.matches(":disabled")) return false
    if (element.shadowRoot?.delegatesFocus) return false
    if (element instanceof HTMLInputElement && element.type === "hidden") return false
    if ((element instanceof HTMLAnchorElement || element instanceof HTMLAreaElement) && !element.href) {
      return element.hasAttribute("tabindex")
    }
    return true
  }
}
