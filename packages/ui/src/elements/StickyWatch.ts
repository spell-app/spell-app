import { E } from "$/ui/core"

/****************
 * ### `StickyWatch`
 * Watches ONE `position: sticky` box and reports whether CSS has stuck it -- no scroll listener, no JS
 * positioning:  an `IntersectionObserver` on the box and two 1px sentinels (where its edges would be, unstuck),
 * against the nearest scroll container (else the document's viewport).
 * - Library-neutral:  plain DOM, no Solid;  of the core (`E`), it uses only `E.flatParentFor()` and the folder's types.
 * - Shared by `<ui-sticky>` (its whole box) and `<ui-section sticky>` (its title bar).  Families may not render each
 *   other's elements, so the behaviour lives here, not in either.
 * - Stuck:  the top sentinel has passed the `offset` line while the box hasn't been pushed above it (else
 *   `isBound`:  the end of its containing block pushes it out);  with `pushing`, also:  the bottom sentinel is below
 *   the bottom line.
 * - Reports through the callback after EVERY measurement (`edge`, `isBound`, `previous`), so the caller can update
 *   states and fire events on a change (`edge !== previous`).
 * - SIDE EFFECT:  while stuck, it RESERVES the box's room on the scroll container (`<html>` for the page):  inline
 *   `scroll-padding-top` (`-bottom` at the bottom edge) is the furthest edge of every box stuck there, across every
 *   watch on the page.  So Page Down / Space, focus and `scrollIntoView()` keep content out from under it.
 *   Chromium and Firefox honour it for paging;  Safari only for the rest.
 *   - a box taller than half the visible area, or narrower than half its width (`STICKY_MAX_RESERVE`), is a sticky
 *     COLUMN (a sidebar), not a header:  it reserves nothing, or paging would barely move
 *   - the inline property is the watches' while any is stuck, removed once none is:  a page's own
 *     `scroll-padding` belongs in a stylesheet
 ****************/
export class StickyWatch {
  /** Edge stuck to now (last report);  `undefined` when not stuck. */
  stuckTo: E.StickyWatchEdge | undefined

  /** Called after every measurement, and by `reset()`. */
  private readonly onReport: (state: E.StickyWatchState) => void

  /** Box being watched, for the room it reserves. */
  private box?: Element

  /** Element whose scroll padding this reserves room on:  the scroll container, or `<html>`. */
  private scrollRoot?: HTMLElement

  constructor(onReport: (state: E.StickyWatchState) => void) {
    this.onReport = onReport
  }

  ////////////////
  // ## Observing
  ////////////////

  /**
   * Watch `targets` against the scroll container, with `options`;  returns the undo, which stops watching but
   * keeps the state (call `reset()` to unstick).
   * - Call again (after the undo) whenever the offsets change:  they are the observer's root margins.
   */
  observe(targets: E.StickyWatchTargets, options: E.StickyWatchOptions): () => void {
    const { host, top, bottom, box } = targets
    this.box = box
    const scroller = StickyWatch.scrollContainer(host)
    this.scrollRoot = (scroller as HTMLElement | undefined) ?? host.ownerDocument.documentElement
    const observer = new IntersectionObserver(() => this.measure(targets, scroller, options), {
      root: scroller ?? host.ownerDocument,
      rootMargin: `${-options.offset}px 0px ${-(options.bottomOffset ?? 0)}px 0px`,
      threshold: [0, 1]
    })
    for (const target of [top, bottom, box]) if (target) observer.observe(target)
    // a stuck box that changes size (its text wraps) changes the room it reserves
    const resizes = new ResizeObserver(() => {
      if (this.stuckTo && this.scrollRoot) StickyWatch.reserve(this.scrollRoot)
    })
    resizes.observe(box)
    return () => {
      observer.disconnect()
      resizes.disconnect()
    }
  }

  /** Unstuck and unbound, e.g. once disconnected:  leaves the reservation and reports. */
  reset() {
    this.report(UNSTUCK)
  }

  /** Work out the edge and `isBound` from where the sentinels and the box are now. */
  private measure(targets: E.StickyWatchTargets, scroller: Element | undefined, options: E.StickyWatchOptions) {
    const { host, top, bottom, box } = targets
    const area = StickyWatch.area(scroller, host.ownerDocument)
    const topLine = area.top + options.offset
    const bottomLine = area.bottom - (options.bottomOffset ?? 0)
    const boxRect = box.getBoundingClientRect()
    let edge: E.StickyWatchEdge | undefined
    let isBound = false
    if (top.getBoundingClientRect().top < topLine - E.STICKY_SLACK) {
      if (boxRect.top < topLine - E.STICKY_SLACK) isBound = true
      else edge = "top"
    } else if (options.pushing && bottom && bottom.getBoundingClientRect().top > bottomLine + E.STICKY_SLACK) {
      if (boxRect.bottom > bottomLine + E.STICKY_SLACK) isBound = true
      else edge = "bottom"
    }
    this.report({ edge, isBound })
    if (edge && this.scrollRoot) StickyWatch.reserve(this.scrollRoot)
  }

  /** Record `edge`, join or leave the stuck watches on a change, then tell the caller. */
  private report({ edge, isBound }: Omit<E.StickyWatchState, "previous">) {
    const previous = this.stuckTo
    if (edge !== previous) {
      this.stuckTo = edge
      this.trackStuck()
    }
    this.onReport({ edge, isBound, previous })
  }

  ////////////////
  // ## Reserving room
  ////////////////

  /** Join or leave (per `stuckTo`) the stuck watches of `scrollRoot`, and re-reserve their room. */
  private trackStuck() {
    const root = this.scrollRoot
    if (!root) return
    let stuckHere = StickyWatch.stuckIn.get(root)
    if (this.stuckTo) {
      if (!stuckHere) StickyWatch.stuckIn.set(root, (stuckHere = new Set()))
      stuckHere.add(this)
    } else if (stuckHere) {
      stuckHere.delete(this)
      if (!stuckHere.size) StickyWatch.stuckIn.delete(root)
    }
    StickyWatch.reserve(root)
  }

  /**
   * Set `root`'s `scroll-padding-top` / `-bottom` to the room its stuck boxes take at each edge;  remove them
   * when there are none.
   * - Static:  the room is shared by EVERY watch stuck in `root` (`stuckIn`), not one watch's.
   * - SIDE EFFECT:  writes `root`'s inline style
   */
  private static reserve(root: HTMLElement) {
    const document = root.ownerDocument
    const area = StickyWatch.area(root === document.documentElement ? undefined : root, document)
    const tallest = (area.bottom - area.top) * E.STICKY_MAX_RESERVE
    const narrowest = root.clientWidth * E.STICKY_MAX_RESERVE
    let top = 0
    let bottom = 0
    for (const watch of StickyWatch.stuckIn.get(root) ?? []) {
      const rect = watch.box?.getBoundingClientRect()
      if (!rect || rect.height > tallest || rect.width < narrowest) continue
      if (watch.stuckTo === "top") top = Math.max(top, rect.bottom - area.top)
      else if (watch.stuckTo === "bottom") bottom = Math.max(bottom, area.bottom - rect.top)
    }
    StickyWatch.setPadding(root, SCROLL_PADDING_TOP, top)
    StickyWatch.setPadding(root, SCROLL_PADDING_BOTTOM, bottom)
  }

  /**
   * Write `property` (whole pixels) on `root`'s inline style, or remove it at 0;  untouched when unchanged.
   * - Static:  a pure helper of `reserve()`, no watch state.
   */
  private static setPadding(root: HTMLElement, property: string, pixels: number) {
    const value = pixels > 0 ? `${Math.ceil(pixels)}px` : ""
    if (root.style.getPropertyValue(property) === value) return
    if (value) root.style.setProperty(property, value)
    else root.style.removeProperty(property)
  }

  ////////////////
  // ## Geometry
  ////////////////

  /**
   * The visible area of `scroller` (its padding box), else of the document's viewport.
   * - Static:  pure geometry, no watch state.
   */
  static area(scroller: Element | undefined, document: Document): { top: number; bottom: number } {
    if (!scroller) return { top: 0, bottom: document.documentElement.clientHeight }
    const top = scroller.getBoundingClientRect().top + scroller.clientTop
    return { top, bottom: top + scroller.clientHeight }
  }

  /**
   * Nearest ancestor that scrolls (clips) its content, up the FLAT tree:  a sticky box sticks in it.  `undefined`
   * for the document's own scrolling.
   * - Flat tree:  a slotted element's next ancestor is its slot, so a box slotted into a component's scrolling
   *   shadow box (a `scrolling` segment, a section's capped content) finds that box.
   * - Static:  pure geometry, no watch state.
   */
  static scrollContainer(element: Element): Element | undefined {
    const document = element.ownerDocument
    let current: Element | undefined = element
    while (current) {
      const parent = E.flatParentFor(current)
      if (!parent || parent === document.body || parent === document.documentElement) return undefined
      if (E.STICKY_SCROLLING.has(getComputedStyle(parent).overflowY)) return parent
      current = parent
    }
    return undefined
  }

  ////////////////
  // ## Page-wide registry
  ////////////////

  /**
   * Stuck watches, by the element they reserve room on.
   * - Static:  page-wide, so boxes stuck in the same scroll container share its padding.  Entries leave as their
   *   watches unstick, so there's no `reset()`.
   */
  private static readonly stuckIn = new Map<HTMLElement, Set<StickyWatch>>()
}

/** What `reset()` reports:  not stuck, not bound. */
const UNSTUCK = { edge: undefined, isBound: false } as const

/** Inline property the watches reserve top room with. */
const SCROLL_PADDING_TOP = "scroll-padding-top"

/** Inline property the watches reserve bottom room with. */
const SCROLL_PADDING_BOTTOM = "scroll-padding-bottom"
