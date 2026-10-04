import { createEffect } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { Cell, proto, StickyWatch, UIElement, UIT, type StickyWatchState } from "$/ui/core"

import { stickyVocabulary } from "./ui-sticky.vocabulary.en"
import { StickyFallback } from "./ui-sticky.fallback"
import {
  SENTINEL,
  OFFSET_PROPERTY,
  BOTTOM_OFFSET_PROPERTY,
  BOTTOM_SENTINEL,
  type StickyVocabulary,
  type StickyConfig
} from "./ui-sticky.types"

import stickyCSS from "./ui-sticky.css?inline"

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
 *   above it;  with `pushing`, also:  the bottom sentinel is below the bottom line.  Measured by `StickyWatch`
 *   (shared with `<ui-section sticky>`) on every observer callback, against the nearest scroll container (else the
 *   document's viewport).
 * - SIDE EFFECT (`StickyWatch`'s):  while stuck, it RESERVES its room on the scroll container (`<html>` for the
 *   page):  inline `scroll-padding-top` (`-bottom` at the bottom edge) is the furthest edge of every box stuck there.
 *   So Page Down / Space, focus and `scrollIntoView()` keep content out from under it.  Chromium and Firefox honour
 *   it for paging;  Safari only for the rest.
 *   - a box taller than half the visible area, or narrower than half its width (`STICKY_MAX_RESERVE`), is a sticky
 *     COLUMN (a sidebar), not a header:  it reserves nothing, or paging would barely move
 *   - the inline property is the stickies' while any is stuck, removed once none is:  a page's own
 *     `scroll-padding` belongs in a stylesheet
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
  readonly edge = new Cell<UIT.StickyEdge | null>(null)

  /** Pushed out by the end of its container. */
  readonly bound = new Cell(false)

  /** Sentinel where the box's top would be. */
  private topSentinel?: HTMLDivElement

  /** Sentinel where the box's bottom would be. */
  private bottomSentinel?: HTMLDivElement

  /** The sticky box. */
  private box?: HTMLDivElement

  /** Observes the box and reserves its room while stuck. */
  private readonly watch = new StickyWatch((state) => this.report(state))

  ////////////////
  // ## Element hooks
  ////////////////

  protected hostStates() {
    return { stuck: this.edge.get() !== null, bound: this.bound.get() }
  }

  ////////////////
  // ## Rendering
  ////////////////

  /**
   * The box's inline tokens:  top and bottom offsets.
   * - A method, not an inline object:  Solid's server compile (rc.11) drops the `;` between an inline style
   *   object's COMPUTED keys (`--a:1px--b:2`), and the browser then ignores both.
   */
  private boxStyle(): Record<string, string> {
    return {
      [OFFSET_PROPERTY]: `${this.attrs.offset ?? 0}px`,
      [BOTTOM_OFFSET_PROPERTY]: `${this.attrs.bottomOffset ?? 0}px`
    }
  }

  render(): JSX.Element {
    this.effects()
    const box = (
      <div
        ref={(element) => (this.box = element)}
        class={this.classes()}
        part={this.part("sticky")}
        style={this.boxStyle()}
      >
        <slot />
      </div>
    )
    // a server render (`$/ui/server`):  the box alone, the root;  CSS sticks it, nothing observes
    if (isServer) return box
    return (
      <>
        <div ref={(element) => (this.topSentinel = element)} class={SENTINEL} aria-hidden="true" />
        {box}
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
        this.watch.reset()
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
    return this.watch.observe({ host: this.host, top: topSentinel, bottom: bottomSentinel, box }, config)
  }

  /** Publish `edge` / `bound`, firing `ui-unstick` then `ui-stick` on a change. */
  private report({ edge, bound, previous }: StickyWatchState) {
    this.bound.set(bound)
    if (edge === previous) return
    this.edge.set(edge)
    if (previous) {
      const detail: UIT.StickyDetail = { edge: previous }
      this.emit("ui-unstick", detail)
    }
    if (edge) {
      const detail: UIT.StickyDetail = { edge }
      this.emit("ui-stick", detail)
    }
  }
}
