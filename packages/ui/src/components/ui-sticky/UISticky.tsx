import { createEffect } from "solid-js"
import type { JSX } from "@solidjs/web"

import { Cell, proto, UIElement, type StickyDetail, type StickyEdge } from "$/ui/core"

import { stickyVocabulary } from "./ui-sticky.vocabulary.en"
import { StickyFallback } from "./ui-sticky.fallback"

import stickyCSS from "./ui-sticky.css?inline"
import { SENTINEL, OFFSET_PROPERTY, BOTTOM_OFFSET_PROPERTY, BOTTOM_SENTINEL, SLACK, SCROLLING } from "./ui-sticky.types"
import type { StickyVocabulary, StickyConfig } from "./ui-sticky.types"
import { TOP, BOTTOM } from "$/ui/components/components.types"

/****************
 * ### `<ui-sticky>`
 * Sticky content:  `position: sticky` on `<div class="ui ... sticky" part="sticky">`, between two 1px sentinels;
 * the element only REPORTS what CSS does (`:state(stuck)`, `ui-stick` / `ui-unstick`), through an
 * `IntersectionObserver` -- no scroll listener, no JS positioning.
 * - The host is `display: contents`, so the sentinels and the box are children of the host's PARENT, which is the
 *   box's containing block:  it sticks within its parent (Fomantic's `context`), whose end pushes it out
 *   (`:state(bound)`).
 * - `offset` / `bottom-offset` become `top` / `bottom` (the PRIVATE custom properties `--_ui-sticky-offset` /
 *   `--_ui-sticky-bottom-offset`, inline on the box);  `pushing` also sticks it to the bottom edge.
 *   - private:  the attributes decide them (the observer measures against the same numbers), and an inline
 *     public name would block the page's value exactly like a sheet declaration
 * - Stuck:  the top sentinel (where the box would be) has passed the `offset` line while the box hasn't been pushed
 *   above it;  with `pushing`, also:  the bottom sentinel is below the bottom line.  Measured on every observer
 *   callback, against the nearest scroll container (else the document's viewport).
 ****************/
export class UISticky extends UIElement<StickyVocabulary> {
  @proto static vocabulary = stickyVocabulary
  @proto static styles = { sticky: stickyCSS }
  @proto static Fallback = StickyFallback
  // a wrapper:  a click on its text must not jump to a link inside
  @proto static delegatesFocus = false

  ////////////////
  // ## State
  ////////////////

  /** Edge it's stuck to, or `null`. */
  readonly edge = new Cell<StickyEdge | null>(null)

  /** Pushed out by the end of its container. */
  readonly bound = new Cell(false)

  /** Sentinel where the box's top would be. */
  private topSentinel?: HTMLDivElement

  /** Sentinel where the box's bottom would be. */
  private bottomSentinel?: HTMLDivElement

  /** The sticky box. */
  private box?: HTMLDivElement

  /** Last reported edge (the cell reads late). */
  private stuckTo: StickyEdge | null = null

  ////////////////
  // ## Element hooks
  ////////////////

  protected hostStates() {
    return { stuck: this.edge.get() !== null, bound: this.bound.get() }
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    this.effects()
    return (
      <>
        <div ref={(element) => (this.topSentinel = element)} class={SENTINEL} aria-hidden="true" />
        <div
          ref={(element) => (this.box = element)}
          class={this.classes()}
          part={this.part("sticky")}
          style={{
            [OFFSET_PROPERTY]: `${this.attrs.offset ?? 0}px`,
            [BOTTOM_OFFSET_PROPERTY]: `${this.attrs.bottomOffset ?? 0}px`
          }}
        >
          <slot />
        </div>
        <div ref={(element) => (this.bottomSentinel = element)} class={BOTTOM_SENTINEL} aria-hidden="true" />
      </>
    )
  }

  /** Observe while connected, again whenever the offsets or `pushing` change;  unstuck once disconnected. */
  private effects() {
    createEffect(
      () => ({
        connected: this.connected.get(),
        offset: this.attrs.offset ?? 0,
        bottomOffset: this.attrs.bottomOffset ?? 0,
        pushing: !!this.attrs.pushing
      }),
      (config) => {
        if (config.connected) return this.observe(config)
        this.report(null, false)
        return undefined
      }
    )
  }

  ////////////////
  // ## Observing
  ////////////////

  /** Watch the sentinels and the box against the scroll container;  returns the undo (the state stays). */
  private observe(config: StickyConfig): () => void {
    const { topSentinel, bottomSentinel, box } = this
    if (!topSentinel || !bottomSentinel || !box) return () => undefined
    const scroller = UISticky.scrollContainer(this.host)
    const observer = new IntersectionObserver(() => this.measure(scroller, config), {
      root: scroller ?? this.host.ownerDocument,
      rootMargin: `${-config.offset}px 0px ${-config.bottomOffset}px 0px`,
      threshold: [0, 1]
    })
    for (const target of [topSentinel, bottomSentinel, box]) observer.observe(target)
    return () => observer.disconnect()
  }

  /** Work out the edge and `bound` from where the sentinels and the box are now. */
  private measure(scroller: Element | null, { offset, bottomOffset, pushing }: StickyConfig) {
    const { topSentinel, bottomSentinel, box } = this
    if (!topSentinel || !bottomSentinel || !box) return
    const area = UISticky.area(scroller, this.host.ownerDocument)
    const topLine = area.top + offset
    const bottomLine = area.bottom - bottomOffset
    const boxRect = box.getBoundingClientRect()
    let edge: StickyEdge | null = null
    let bound = false
    if (topSentinel.getBoundingClientRect().top < topLine - SLACK) {
      if (boxRect.top < topLine - SLACK) bound = true
      else edge = TOP
    } else if (pushing && bottomSentinel.getBoundingClientRect().top > bottomLine + SLACK) {
      if (boxRect.bottom > bottomLine + SLACK) bound = true
      else edge = BOTTOM
    }
    this.report(edge, bound)
  }

  /** Publish `edge` / `bound`, firing `ui-unstick` then `ui-stick` on a change. */
  private report(edge: StickyEdge | null, bound: boolean) {
    this.bound.set(bound)
    const previous = this.stuckTo
    if (edge === previous) return
    this.stuckTo = edge
    this.edge.set(edge)
    if (previous) {
      const detail: StickyDetail = { edge: previous }
      this.emit("ui-unstick", detail)
    }
    if (edge) {
      const detail: StickyDetail = { edge }
      this.emit("ui-stick", detail)
    }
  }

  /** The visible area of `scroller` (its padding box), else of the document's viewport. */
  private static area(scroller: Element | null, document: Document): { top: number; bottom: number } {
    if (!scroller) return { top: 0, bottom: document.documentElement.clientHeight }
    const top = scroller.getBoundingClientRect().top + scroller.clientTop
    return { top, bottom: top + scroller.clientHeight }
  }

  /**
   * Nearest ancestor that scrolls (clips) its content, across shadow roots:  the box sticks in it.  `null` for the
   * document's own scrolling.
   */
  private static scrollContainer(element: Element): Element | null {
    let current: Element | null = element
    while (current) {
      const parent: Element | null = current.parentElement ?? ((current.getRootNode() as ShadowRoot).host || null)
      if (!parent || parent === document.body || parent === document.documentElement) return null
      if (SCROLLING.has(getComputedStyle(parent).overflowY)) return parent
      current = parent
    }
    return null
  }
}
