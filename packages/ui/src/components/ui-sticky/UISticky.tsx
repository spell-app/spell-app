import { isServer, type JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { stickyVocabulary } from "./UISticky.en"

import stickyCSS from "./UISticky.css?inline"

/****************
 * ### `UISticky`
 * The component behind `<ui-sticky>`:  content that sticks as the page scrolls,
 * `position: sticky` on `<div class="ui … sticky" part="sticky">`, between two 1px sentinels.
 * It only REPORTS what CSS does (`:state(stuck)`, `ui-stick` / `ui-unstick`), through an `IntersectionObserver`:
 * no scroll listener, no JS positioning.
 *
 * - The DOM element is `display: contents`, so the sentinels and the box are children of its PARENT,
 *   which is the box's containing block:  it sticks within its parent (Fomantic's `context`),
 *   whose end pushes it out (`:state(bound)`).
 *
 * - `offset` / `bottom-offset` become `top` / `bottom`
 *   (the PRIVATE custom properties `--_ui-sticky-offset` / `--_ui-sticky-bottom-offset`, inline on the box);
 *   `pushing` also sticks it to the bottom edge.
 *   - Private:  the attributes decide them (the observer measures against the same numbers),
 *     and an inline public name would block the page's value exactly as a sheet declaration does.
 *
 * - Stuck:  the top sentinel (where the box would be) has passed the `offset` line,
 *   while the box hasn't been pushed above it;  with `pushing`, the bottom sentinel is also below the bottom line.
 *   Measured by `StickyWatch` (shared with `<ui-section sticky>`) on every observer callback,
 *   against the nearest scroll container (else the document's viewport).
 *
 * - SIDE EFFECT (`StickyWatch`'s):  while stuck, it RESERVES its room on the scroll container (`<html>` for the page):
 *   inline `scroll-padding-top` (`-bottom` at the bottom edge) is the furthest edge of every box stuck there.
 *   So Page Down / Space, focus and `scrollIntoView()` keep content out from under it.
 *   Chromium and Firefox honour it for paging;  Safari only for the rest.
 *   - A box taller than half the visible area, or narrower than half its width (`STICKY_MAX_RESERVE`),
 *     is a sticky COLUMN (a sidebar), not a header:  it reserves nothing, or paging would barely move.
 *   - The inline property is the stickies' while any is stuck, removed once none is:
 *     a page's own `scroll-padding` belongs in a stylesheet.
 ****************/
export class UISticky extends E.UIComponent<StickyVocabulary> {
  @E.proto static vocabulary = stickyVocabulary
  @E.proto static styleSheets = { sticky: stickyCSS }
  @E.proto static elementSetup = {
    // a wrapper:  a click on its text must not jump to a link inside
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  ////////////////
  // ## Stuck
  ////////////////

  /** Edge it's stuck to;  `undefined` when not stuck. */
  @E.state accessor stuckEdge: UIT.StickyEdge | undefined = undefined

  /** Stuck to an edge. */
  @E.cssState("stuck")
  get isStuck(): boolean {
    return this.stuckEdge !== undefined
  }

  /** Pushed out by the end of its container. */
  @E.cssState("bound")
  @E.state
  accessor isBound = false

  /**
   * The watcher's report:  publish `stuckEdge` / `isBound`, firing `ui-unstick` then `ui-stick` on a change.
   * - Above `stickyWatch`, whose initializer reads it.
   */
  private readonly onStickChange = ({ edge, isBound, previous }: E.StickyWatchState) => {
    this.isBound = isBound
    if (edge === previous) return
    this.stuckEdge = edge
    if (previous) {
      const detail: UIT.StickyDetail = { edge: previous }
      this.send("ui-unstick", detail)
    }
    if (edge) {
      const detail: UIT.StickyDetail = { edge }
      this.send("ui-stick", detail)
    }
  }

  ////////////////
  // ## Watching
  ////////////////

  /** Observes the box and reserves its room while stuck. */
  private readonly stickyWatch = new E.StickyWatch(this.onStickChange)

  /** Sentinel where the box's top would be. */
  private topSentinel?: HTMLDivElement

  /** Sentinel where the box's bottom would be. */
  private bottomSentinel?: HTMLDivElement

  /** The sticky box. */
  private box?: HTMLDivElement

  /**
   * Observe while connected and drawn (`isReady`:  the sentinels exist),
   * again whenever the offsets or `pushing` change;  unstuck once disconnected.
   */
  @E.onChange("isConnected", "isReady", "offset", "bottomOffset", "pushing")
  protected onWatchSettingsChanged(isConnected: boolean) {
    if (isConnected) return this.observe()
    this.stickyWatch.reset()
    return undefined
  }

  /** Watch the sentinels and the box against the scroll container;  returns the undo (the state stays). */
  private observe(): () => void {
    const { topSentinel, bottomSentinel, box } = this
    if (!topSentinel || !bottomSentinel || !box) return () => undefined
    const options: E.StickyWatchOptions = {
      offset: this.offset ?? 0,
      bottomOffset: this.bottomOffset ?? 0,
      pushing: !!this.pushing
    }
    return this.stickyWatch.observe(
      { domElement: this.domElement, top: topSentinel, bottom: bottomSentinel, box },
      options
    )
  }

  ////////////////
  // ## Rendering
  ////////////////

  /**
   * The box's inline tokens:  top and bottom offsets.
   * - A getter, not an inline object:  Solid's server compile (rc.11) drops the `;` between an inline style
   *   object's COMPUTED keys (`--a:1px--b:2`), and the browser then ignores both.
   */
  private get boxStyle(): Record<string, string> {
    return {
      [OFFSET_PROPERTY]: `${this.offset ?? 0}px`,
      [BOTTOM_OFFSET_PROPERTY]: `${this.bottomOffset ?? 0}px`
    }
  }

  render(): JSX.Element {
    const box = (
      <div
        ref={(element) => (this.box = element)}
        class={this.rootClasses}
        part={this.partForName("sticky")}
        style={this.boxStyle}
      >
        <slot />
      </div>
    )
    // a server render (`$/ui/static`):  the box alone, the root;  CSS sticks it, nothing observes
    if (isServer) return box
    return (
      <>
        <div ref={(element) => (this.topSentinel = element)} class={SENTINEL} aria-hidden="true" />
        {box}
        <div ref={(element) => (this.bottomSentinel = element)} class={BOTTOM_SENTINEL} aria-hidden="true" />
      </>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UISticky extends E.AttributeValues<StickyVocabulary> {}

/** The vocabulary type, for brevity. */
type StickyVocabulary = typeof stickyVocabulary

/** The private custom property the box reads for `top` (`offset`), inline:  it wins over the public token's alias. */
const OFFSET_PROPERTY = "--_ui-sticky-offset"

/** The private custom property the box reads for `bottom` (`bottom-offset`), inline. */
const BOTTOM_OFFSET_PROPERTY = "--_ui-sticky-bottom-offset"

/** Class word of the sentinel where the box's top would be. */
const SENTINEL = "sentinel"

/** Class words of the sentinel where the box's bottom would be. */
const BOTTOM_SENTINEL = "bottom sentinel"
