import * as UIT from "$/ui/components/components.types"

import { CssDisplay, type Disposer, type FocusRoot } from "./runtime.types"
import { RovingTabindex, type RovingTabindexProps } from "./RovingTabindex"

/****************
 * ### `Focus`
 * Focus helpers that see through shadow roots, as `UI.focus`.
 * - In the runtime's lazy chunk (`UIRuntime` builds it);  `Overlays` uses it for focus restore.
 * - Why:  `document.activeElement` stops at the first shadow host, and `querySelectorAll` can't see
 *   into shadow roots or follow slots -- every component with a shadow root breaks naive focus code.
 * - `<dialog>.showModal()` traps focus natively;  `trap()` is only for the non-dialog cases
 *   (a flyout inside a popover, a menu that must keep focus).
 ****************/
export class Focus {
  /**
   * The element that really has focus, descending through open shadow roots.
   * - `undefined` when nothing (or only `root`'s document's `<body>`) is focused.
   * - `root`:  the document or shadow root to start from;  another document (an iframe's) works too.
   */
  activeElementDeep(root: Document | ShadowRoot = document): Element | undefined {
    let active = root.activeElement
    while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement
    // a document's `ownerDocument` is `null`:  then `root` IS the document
    const body = (root.ownerDocument ?? (root as Document)).body
    return !active || active === body ? undefined : active
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

  /** First tabbable element under `root`, or `undefined`. */
  first(root: FocusRoot): HTMLElement | undefined {
    return this.focusables(root)[0]
  }

  /** Last tabbable element under `root`, or `undefined`. */
  last(root: FocusRoot): HTMLElement | undefined {
    return this.focusables(root).at(-1)
  }

  /**
   * The dialog focusing steps, through slots:  after `show()` / `showModal()` of a dialog whose content is SLOTTED
   * (so the focus targets sit in the flat tree, not the dialog's own subtree), focus its `autofocus` element, else its
   * first tabbable.
   * - Chromium does this itself;  Firefox only looks at the dialog's own descendants, and leaves focus on the dialog
   *   (or nowhere);  WebKit focuses the first tabbable of the dialog's OWN subtree (the shadow root's close icon),
   *   not of the flat tree.  So this always focuses the flat-tree target, even when focus is already inside.
   */
  enter(dialog: HTMLElement): void {
    const items = this.focusables(dialog)
    const target = items.find((item) => item.hasAttribute("autofocus")) ?? items[0]
    target?.focus()
  }

  /**
   * If focus is inside `container` (or on it), move it to the next tabbable element after it, as Tab would;
   * none after it:  just take focus away (`blur()`).
   * - For an element that is about to become unusable (`disabled`, `loading`):  call it BEFORE making it inert,
   *   while its own tabbables still count.
   * - Next after the last tabbable inside;  with none inside, the first one after `container` in the light DOM.
   */
  moveOutOf(container: Element): void {
    const page = container.ownerDocument
    const active = this.activeElementDeep(page)
    if (!active || !this.containsDeep(container, active)) return
    const all = this.focusables(page)
    const lastInside = all.findLastIndex((element) => this.containsDeep(container, element))
    const after =
      lastInside >= 0
        ? all.slice(lastInside + 1)
        : all.filter((element) => container.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING)
    const next = after.find((element) => !this.containsDeep(container, element))
    if (next) next.focus()
    else (active as HTMLElement).blur()
  }

  /**
   * Is `element` inside `container`, following the composed tree (slots, shadow hosts)?
   * - Takes the platform's `null` too (`event.relatedTarget`):  never inside.
   */
  containsDeep(container: Node, element: Node | null | undefined): boolean {
    let current = element
    while (current) {
      if (current === container) return true
      current = (current as Element).assignedSlot ?? current.parentNode ?? hostOf(current)
    }
    return false

    /** Host of shadow root `node`, if it is one. */
    function hostOf(node: Node): Node | undefined {
      return node instanceof ShadowRoot ? node.host : undefined
    }
  }

  /**
   * Keep Tab / Shift+Tab cycling inside `root` until the disposer is called.
   * - Tab past the last tabbable wraps to the first, and vice versa;  focus escaping any other way
   *   (a click, a script) is pulled back to the first tabbable.
   * - SIDE EFFECT:  capture listeners on `root`'s document while active.
   */
  trap(root: Element | ShadowRoot): Disposer {
    const page = root.ownerDocument
    const listeners = new AbortController()
    const options = { capture: true, signal: listeners.signal }
    page.addEventListener("keydown", (event) => this.trapTab(root, event), options)
    page.addEventListener("focusin", () => this.pullFocusInto(root), options)
    return () => listeners.abort()
  }

  /** Attach a `RovingTabindex` (menus, tabs, listboxes) -- see that class. */
  roving(props: RovingTabindexProps): RovingTabindex {
    return RovingTabindex.attach(props)
  }

  ////////////////
  // ## Trap
  ////////////////

  /** A `keydown` while `trap(root)` is on:  Tab off either end of `root` wraps round to the other. */
  private trapTab(root: Element | ShadowRoot, event: KeyboardEvent) {
    if (event.key !== UIT.Key.tab || event.ctrlKey || event.metaKey) return
    // NOTE: Alt (Option) + Tab is NOT skipped:  in Safari it is the Tab that reaches links and buttons
    const items = this.focusables(root)
    if (!items.length) return event.preventDefault()
    const active = this.activeElementDeep(root.ownerDocument)
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

  /** Focus moved while `trap(root)` is on:  pull it back into `root` if it got out. */
  private pullFocusInto(root: Element | ShadowRoot) {
    const active = this.activeElementDeep(root.ownerDocument)
    if (active && !this.containsDeep(root, active)) this.first(root)?.focus()
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
      if (getComputedStyle(element).display !== CssDisplay.contents) return
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
    // Firefox reports a `<dialog>`'s tabIndex as 0 (Chromium: -1), but Tab never stops on the box itself
    if (element instanceof HTMLDialogElement && !element.hasAttribute("tabindex")) return false
    if (element.matches(":disabled")) return false
    if (element.shadowRoot?.delegatesFocus) return false
    if (element instanceof HTMLInputElement && element.type === "hidden") return false
    if ((element instanceof HTMLAnchorElement || element instanceof HTMLAreaElement) && !element.href) {
      return element.hasAttribute("tabindex")
    }
    return true
  }
}
