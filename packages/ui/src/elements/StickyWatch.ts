import { flatParentFor } from "$/ui/util"

import {
  STICKY_MAX_RESERVE,
  STICKY_SCROLLING,
  STICKY_SLACK,
  type StickyWatchEdge,
  type StickyWatchOptions,
  type StickyWatchState,
  type StickyWatchTargets
} from "./elements.types"

/**
 * Watches ONE `position: sticky` box and reports whether CSS has stuck it -- no scroll listener, no JS
 * positioning:  an `IntersectionObserver` on the box and two 1px sentinels (where its edges would be, unstuck),
 * against the nearest scroll container (else the document's viewport).  Library-neutral:  plain DOM, no Solid.
 * - Shared by `<ui-sticky>` (its whole box) and `<ui-section sticky>` (its title bar).  Families may not render each
 *   other's elements, so the behaviour lives here, not in either.
 * - Stuck:  the top sentinel has passed the `offset` line while the box hasn't been pushed above it (else
 *   `bound`:  the end of its containing block pushes it out);  with `pushing`, also:  the bottom sentinel is below
 *   the bottom line.
 * - Reports through the callback after EVERY measurement (`edge`, `bound`, `previous`), so the caller can update
 *   states and fire events on a change (`edge !== previous`).
 * - SIDE EFFECT:  while stuck, it RESERVES the box's room on the scroll container (`<html>` for the page):  inline
 *   `scroll-padding-top` (`-bottom` at the bottom edge) is the furthest edge of every box stuck there, across every
 *   watch on the page.  So Page Down / Space, focus and `scrollIntoView()` keep content out from under it.
 *   Chromium and Firefox honour it for paging;  Safari only for the rest.
 *   - a box taller than half the visible area, or narrower than half its width (`STICKY_MAX_RESERVE`), is a sticky
 *     COLUMN (a sidebar), not a header:  it reserves nothing, or paging would barely move
 *   - the inline property is the watches' while any is stuck, removed once none is:  a page's own
 *     `scroll-padding` belongs in a stylesheet
 */
export class StickyWatch {
  /** Edge stuck to now (last report), or `null`. */
  stuckTo: StickyWatchEdge | null = null

  /** Pushed out by the end of its container (last report). */
  bound = false

  /** Called after every measurement, and by `reset()`. */
  private readonly onReport: (state: StickyWatchState) => void

  /** Box being watched, for the room it reserves. */
  private box?: Element

  /** Element whose scroll padding this reserves room on:  the scroll container, or `<html>`. */
  private scrollRoot?: HTMLElement

  /** Stuck watches, by the element they reserve room on. */
  private static stuckIn = new Map<HTMLElement, Set<StickyWatch>>()

  constructor(onReport: (state: StickyWatchState) => void) {
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
  observe(targets: StickyWatchTargets, options: StickyWatchOptions): () => void {
    const { host, top, bottom, box } = targets
    this.box = box
    const scroller = StickyWatch.scrollContainer(host)
    this.scrollRoot = (scroller as HTMLElement | null) ?? host.ownerDocument.documentElement
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
    this.report(null, false)
  }

  /** Work out the edge and `bound` from where the sentinels and the box are now. */
  private measure(targets: StickyWatchTargets, scroller: Element | null, options: StickyWatchOptions) {
    const { host, top, bottom, box } = targets
    const area = StickyWatch.area(scroller, host.ownerDocument)
    const topLine = area.top + options.offset
    const bottomLine = area.bottom - (options.bottomOffset ?? 0)
    const boxRect = box.getBoundingClientRect()
    let edge: StickyWatchEdge | null = null
    let bound = false
    if (top.getBoundingClientRect().top < topLine - STICKY_SLACK) {
      if (boxRect.top < topLine - STICKY_SLACK) bound = true
      else edge = TOP
    } else if (options.pushing && bottom && bottom.getBoundingClientRect().top > bottomLine + STICKY_SLACK) {
      if (boxRect.bottom > bottomLine + STICKY_SLACK) bound = true
      else edge = BOTTOM
    }
    this.report(edge, bound)
    if (edge && this.scrollRoot) StickyWatch.reserve(this.scrollRoot)
  }

  /** Record `edge` / `bound`, join or leave the stuck watches on a change, then tell the caller. */
  private report(edge: StickyWatchEdge | null, bound: boolean) {
    const previous = this.stuckTo
    this.bound = bound
    if (edge !== previous) {
      this.stuckTo = edge
      this.trackStuck(edge !== null)
    }
    this.onReport({ edge, bound, previous })
  }

  ////////////////
  // ## Reserving room
  ////////////////

  /** Join or leave the stuck watches of `scrollRoot`, and re-reserve their room. */
  private trackStuck(stuck: boolean) {
    const root = this.scrollRoot
    if (!root) return
    let stuckHere = StickyWatch.stuckIn.get(root)
    if (stuck) {
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
   * - SIDE EFFECT:  writes `root`'s inline style
   */
  private static reserve(root: HTMLElement) {
    const document = root.ownerDocument
    const area = StickyWatch.area(root === document.documentElement ? null : root, document)
    const tallest = (area.bottom - area.top) * STICKY_MAX_RESERVE
    const narrowest = root.clientWidth * STICKY_MAX_RESERVE
    let top = 0
    let bottom = 0
    for (const watch of StickyWatch.stuckIn.get(root) ?? []) {
      const rect = watch.box?.getBoundingClientRect()
      if (!rect || rect.height > tallest || rect.width < narrowest) continue
      if (watch.stuckTo === TOP) top = Math.max(top, rect.bottom - area.top)
      else if (watch.stuckTo === BOTTOM) bottom = Math.max(bottom, area.bottom - rect.top)
    }
    StickyWatch.setPadding(root, SCROLL_PADDING_TOP, top)
    StickyWatch.setPadding(root, SCROLL_PADDING_BOTTOM, bottom)
  }

  /** Write `property` (whole pixels) on `root`'s inline style, or remove it at 0;  untouched when unchanged. */
  private static setPadding(root: HTMLElement, property: string, pixels: number) {
    const value = pixels > 0 ? `${Math.ceil(pixels)}px` : ""
    if (root.style.getPropertyValue(property) === value) return
    if (value) root.style.setProperty(property, value)
    else root.style.removeProperty(property)
  }

  ////////////////
  // ## Geometry
  ////////////////

  /** The visible area of `scroller` (its padding box), else of the document's viewport. */
  static area(scroller: Element | null, document: Document): { top: number; bottom: number } {
    if (!scroller) return { top: 0, bottom: document.documentElement.clientHeight }
    const top = scroller.getBoundingClientRect().top + scroller.clientTop
    return { top, bottom: top + scroller.clientHeight }
  }

  /**
   * Nearest ancestor that scrolls (clips) its content, up the FLAT tree:  a sticky box sticks in it.  `null` for
   * the document's own scrolling.
   * - Flat tree:  a slotted element's next ancestor is its slot, so a box slotted into a component's scrolling
   *   shadow box (a `scrolling` segment, a section's capped content) finds that box.
   */
  static scrollContainer(element: Element): Element | null {
    const document = element.ownerDocument
    let current: Element | null = element
    while (current) {
      const parent = flatParentFor(current)
      if (!parent || parent === document.body || parent === document.documentElement) return null
      if (STICKY_SCROLLING.has(getComputedStyle(parent).overflowY)) return parent
      current = parent
    }
    return null
  }
}

/** Edges, as `StickyWatchEdge`. */
const TOP: StickyWatchEdge = "top"
const BOTTOM: StickyWatchEdge = "bottom"

/** Inline properties the watches reserve room with. */
const SCROLL_PADDING_TOP = "scroll-padding-top"
const SCROLL_PADDING_BOTTOM = "scroll-padding-bottom"
