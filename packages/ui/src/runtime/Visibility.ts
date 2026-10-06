import { Warnings } from "$/ui/util"
import * as UIT from "$/ui/components/components.types"

import {
  CssDisplay,
  VisibilityDirection,
  type Disposer,
  type LazyImageOptions,
  type VisibilityCalculations,
  type VisibilityCallbacks,
  type VisibilityOptions
} from "./runtime.types"
import type { Transitions } from "./Transitions"

/****************
 * ### `Visibility`
 * Scroll position callbacks for elements, as `UI.visibility` (and the `UI.observeVisibility()` shortcut):  Fomantic's
 * visibility behaviour on `IntersectionObserver` -- no scroll listener.
 * - In the runtime's lazy chunk (`UIRuntime` builds it);  fades lazy images through `Transitions`.
 * - `observe(element, { onTopVisible, onBottomPassed, onOnScreen ..., once, continuous, offset, context })`
 *   returns the undo.  See `VisibilityCallbacks` for the names;  the calculations are Fomantic's.
 * - Checks happen when something CROSSES:  the element entering / leaving the screen, and its top or bottom edge
 *   crossing the screen top or bottom (two 1px "line" observers).  So `continuous` fires at each crossing, not on
 *   every scrolled pixel, and `onUpdate` likewise.
 * - Measures the element's first BOX:  a `display: contents` element (`<ui-segment>`, `<ui-sticky>` ... hosts) has
 *   none, so it measures the first rendered descendant with one -- its shadow root's root element, else its first
 *   boxed child.  NOTE:  only that one box, not the union of every child's.  Nothing to measure warns once in dev.
 * - `once` (default, as Fomantic's):  each callback fires at most once;  `once: false`:  again each time its condition
 *   turns true.  `...Reverse` callbacks fire when their condition turns false after being true.
 * - `lazyImage(img)`:  Fomantic's `type: 'image'` -- an `<img data-src>` (and `data-srcset`) gets its source once on
 *   screen, preloaded then faded in (`UI.transitions`).  Native `loading="lazy"` needs none of this;  this is for the
 *   fade and the callback.
 ****************/
export class Visibility {
  /** runs the fade of `lazyImage()` */
  private readonly transitions: Pick<Transitions, "animate">

  constructor({ transitions }: VisibilityProps) {
    this.transitions = transitions
  }

  /** Watch `element` against the screen;  see class docs.  Returns the undo. */
  observe(element: Element, options: VisibilityOptions = {}): Disposer {
    const watch = new VisibilityWatch({ element, options })
    return () => watch.dispose()
  }

  /**
   * Give `image` its `data-src` (and `data-srcset`) once it's on screen, then fade it in.
   * - Returns the undo;  a no-op (and a no-op undo) without `data-src`.
   */
  lazyImage(image: HTMLImageElement, options: LazyImageOptions = {}): Disposer {
    const src = image.getAttribute(LAZY_IMAGE_ATTRIBUTES.src)
    if (!src) return () => undefined
    // the callback runs a task after `observe()` returns (checks are queued), so `stop` is set by then
    const stop: Disposer = this.observe(image, {
      once: true,
      offset: options.offset,
      context: options.context,
      onOnScreen: () => {
        stop()
        void this.load(image, src, options)
      }
    })
    return stop
  }

  /** Preload `src`, set it, run the transition, report. */
  private async load(image: HTMLImageElement, src: string, options: LazyImageOptions) {
    const { transition = LAZY_IMAGE_DEFAULTS.transition, duration = LAZY_IMAGE_DEFAULTS.duration } = options
    const srcset = image.getAttribute(LAZY_IMAGE_ATTRIBUTES.srcset)
    const probe = new Image()
    if (srcset) probe.srcset = srcset
    probe.src = src
    try {
      await probe.decode()
    } catch {
      // a broken image:  set it anyway, the browser shows its own broken state
    }
    if (srcset) image.srcset = srcset
    image.src = src
    if (transition !== false) {
      await this.transitions.animate({ element: image, name: transition, direction: UIT.IN, duration })
    }
    options.onLoad?.(image)
  }
}

/** Constructor props for `Visibility`. */
export type VisibilityProps = {
  /** runs `lazyImage()`'s fade;  tests pass a stub */
  transitions: Pick<Transitions, "animate">
}

/****************
 * ### `VisibilityWatch`
 * One `observe()` call:  three observers on the element (the screen, a 1px line at the screen top, one at the
 * bottom), a check when any fires, and the callbacks the check calls.
 * - Checks are coalesced to one per task:  the three observers report the same crossing together.
 * - The line observers' margins are px (a root margin can't say "all but 1px"), so they're rebuilt when the
 *   screen resizes.
 * - Observes `target`, the element's first box (see `Visibility`), re-found when it's gone or boxless at a check:
 *   a host observed before it renders gets its box after its `ready` promise.
 ****************/
class VisibilityWatch {
  /** watched element */
  private readonly element: Element
  /** what's measured:  `element`, or its first boxed descendant when it has no box */
  private target: Element
  /** already waited for `element`'s `ready` */
  private hasWaited = false
  /** already warned there's nothing to measure */
  private hasWarned = false
  /** callbacks and options */
  private readonly options: VisibilityOptions
  /** live observers */
  private observers: IntersectionObserver[] = []
  /** callbacks that have fired (and, unless `continuous`, won't again while their condition holds) */
  private readonly occurred = new Set<keyof VisibilityCallbacks>()
  /** last calculations, for reverse callbacks */
  private previous?: VisibilityCalculations
  /** element top at the last check, for `direction` */
  private lastTop?: number
  /** a check is queued, see `checkSoon()` */
  private isCheckQueued = false
  /** stops watching the screen size */
  private readonly unwatchSize: () => void

  constructor({ element, options }: VisibilityWatchProps) {
    this.element = element
    this.options = options
    this.target = VisibilityWatch.boxOf(element) ?? element
    this.build()
    const context = options.context
    if (context) {
      const resize = new ResizeObserver(() => this.build())
      resize.observe(context)
      this.unwatchSize = () => resize.disconnect()
    } else {
      const view = element.ownerDocument.defaultView
      const onResize = () => this.build()
      view?.addEventListener(RESIZE, onResize)
      this.unwatchSize = () => view?.removeEventListener(RESIZE, onResize)
    }
  }

  /** Stop:  observers and size watching. */
  dispose() {
    for (const observer of this.observers.splice(0)) observer.disconnect()
    this.unwatchSize()
  }

  ////////////////
  // ## Observers
  ////////////////

  /** (Re)create the three observers on `target` for the current screen height. */
  private build() {
    for (const observer of this.observers.splice(0)) observer.disconnect()
    const { element, target } = this
    const context = this.options.context
    const offset = this.options.offset ?? 0
    const height = context ? context.clientHeight : element.ownerDocument.documentElement.clientHeight
    const root = context ?? element.ownerDocument
    const lineBelowTop = Math.max(0, height - offset - 1)
    const lineAboveBottom = Math.max(0, height - 1)
    for (const [rootMargin, threshold] of [
      [`${-offset}px 0px 0px 0px`, [0, 1]],
      [`${-offset}px 0px ${-lineBelowTop}px 0px`, [0]],
      [`${-lineAboveBottom}px 0px 0px 0px`, [0]]
    ] as const) {
      const observer = new IntersectionObserver(() => this.checkSoon(), { root, rootMargin, threshold: [...threshold] })
      observer.observe(target)
      this.observers.push(observer)
    }
  }

  /** Queue ONE check for this task, however many observers report the crossing. */
  private checkSoon() {
    if (this.isCheckQueued) return
    this.isCheckQueued = true
    setTimeout(() => {
      this.isCheckQueued = false
      if (this.observers.length) this.check()
    })
  }

  ////////////////
  // ## Checking
  ////////////////

  /** Measure, then call what the calculations call for (reverse callbacks first, as Fomantic). */
  private check() {
    if (!this.retarget()) return
    const rect = this.target.getBoundingClientRect()
    if (!rect.width && !rect.height) return
    const calculations = this.calculate(rect)
    const previous = this.previous
    this.previous = calculations
    for (const name of EDGES) {
      if (previous?.[name] && !calculations[name]) this.reverse(REVERSE_KEYS[name], calculations)
    }
    for (const name of CONDITIONS) this.forward(FORWARD_KEYS[name], calculations[name], calculations)
    this.options.onUpdate?.(calculations)
  }

  /**
   * Make sure `target` is still the box to measure;  true to measure it now.
   * - A new box:  observe it instead (its observers queue the next check).
   * - No box yet:  wait once for the element's `ready` (a `UIHost` that hasn't rendered), else warn once in dev.
   */
  private retarget(): boolean {
    const target = this.target
    if (target.isConnected && target !== this.element) return true
    const box = VisibilityWatch.boxOf(this.element)
    if (box && box !== target) {
      this.target = box
      this.build()
      return false
    }
    if (box || !this.element.isConnected || getComputedStyle(this.element).display !== CssDisplay.contents) return true
    const ready = (this.element as { ready?: unknown }).ready
    if (!this.hasWaited && ready instanceof Promise) {
      this.hasWaited = true
      void ready.then(() => this.observers.length && this.checkSoon())
    } else if (import.meta.env.DEV && !this.hasWarned) {
      this.hasWarned = true
      Warnings.warn(
        "UI.observeVisibility()",
        `<${this.element.localName}> is \`display: contents\` with no rendered box inside;  nothing will fire.  ` +
          `Observe an element with a box.`
      )
    }
    return false
  }

  /** Fomantic's calculations for `rect`. */
  private calculate(rect: DOMRect): VisibilityCalculations {
    const context = this.options.context
    const top = (context ? context.getBoundingClientRect().top + context.clientTop : 0) + (this.options.offset ?? 0)
    const bottom = context
      ? context.getBoundingClientRect().top + context.clientTop + context.clientHeight
      : this.element.ownerDocument.documentElement.clientHeight
    const topPassed = top >= rect.top
    const bottomPassed = top >= rect.bottom
    const topVisible = bottom >= rect.top && !topPassed
    const bottomVisible = bottom >= rect.bottom && !bottomPassed
    const passing = topPassed && !bottomPassed
    const onScreen = (topVisible || passing) && !bottomPassed
    const last = this.lastTop
    this.lastTop = rect.top
    // oxfmt-ignore
    const direction =
      last === undefined || last === rect.top ? VisibilityDirection.static
      : rect.top < last ? VisibilityDirection.down
      : VisibilityDirection.up
    return {
      topPassed,
      bottomPassed,
      topVisible,
      bottomVisible,
      passing,
      onScreen,
      offScreen: !onScreen,
      pixelsPassed: passing ? top - rect.top : 0,
      percentagePassed: passing && rect.height ? (top - rect.top) / rect.height : 0,
      direction
    }
  }

  /** A forward callback:  fire while `on` (once, or every check when `continuous`);  re-arm when off unless `once`. */
  private forward(key: keyof VisibilityCallbacks, on: boolean, calculations: VisibilityCalculations) {
    const { once = true, continuous = false } = this.options
    if (!on) {
      if (!once) this.occurred.delete(key)
      return
    }
    if (!continuous && this.occurred.has(key)) return
    this.occurred.add(key)
    this.options[key]?.(calculations)
  }

  /** A reverse callback:  fire on the turn to false (only the first time, with `once`). */
  private reverse(key: keyof VisibilityCallbacks, calculations: VisibilityCalculations) {
    if ((this.options.once ?? true) && this.occurred.has(key)) return
    this.occurred.add(key)
    this.options[key]?.(calculations)
  }

  ////////////////
  // ## Statics
  ////////////////

  /**
   * First element with a box at or inside `element`, in rendered order;  `undefined` for none.
   * - `display: contents`:  a shadow host's shadow root children, a `<slot>`'s assigned (else fallback) elements,
   *   else its children.  `display: none` has no box and none inside.
   * - STATIC:  pure, recursive over the tree, and the constructor needs it before `target` is set.
   */
  private static boxOf(element: Element): Element | undefined {
    const display = getComputedStyle(element).display
    if (display === CssDisplay.none) return undefined
    if (display !== CssDisplay.contents) return element
    const children =
      element instanceof HTMLSlotElement
        ? element.assignedElements({ flatten: true })
        : [...(element.shadowRoot ?? element).children]
    for (const child of children) {
      const box = VisibilityWatch.boxOf(child)
      if (box) return box
    }
    return undefined
  }
}

/** Constructor props for `VisibilityWatch`:  one `observe()` call's arguments. */
type VisibilityWatchProps = {
  /** watched element */
  element: Element
  /** callbacks and options */
  options: VisibilityOptions
}

/** Conditions with a forward callback, in Fomantic's order. */
const CONDITIONS = [
  "onScreen",
  "offScreen",
  "passing",
  "topVisible",
  "bottomVisible",
  "topPassed",
  "bottomPassed"
] as const

/** Conditions with a reverse callback. */
const EDGES = ["passing", "topVisible", "bottomVisible", "topPassed", "bottomPassed"] as const

/** Forward callback of each condition. */
const FORWARD_KEYS: Record<(typeof CONDITIONS)[number], keyof VisibilityCallbacks> = {
  onScreen: "onOnScreen",
  offScreen: "onOffScreen",
  passing: "onPassing",
  topVisible: "onTopVisible",
  bottomVisible: "onBottomVisible",
  topPassed: "onTopPassed",
  bottomPassed: "onBottomPassed"
}

/** Reverse callback of each edge condition. */
const REVERSE_KEYS: Record<(typeof EDGES)[number], keyof VisibilityCallbacks> = {
  passing: "onPassingReverse",
  topVisible: "onTopVisibleReverse",
  bottomVisible: "onBottomVisibleReverse",
  topPassed: "onTopPassedReverse",
  bottomPassed: "onBottomPassedReverse"
}

/** Screen resize event. */
const RESIZE = "resize"

/** Lazy image attributes (Fomantic's `metadata.src` / `metadata.srcset`). */
const LAZY_IMAGE_ATTRIBUTES = { src: "data-src", srcset: "data-srcset" } as const

/** Lazy image transition, unless `lazyImage()`'s options say otherwise (Fomantic's `fade in`, 1000ms). */
const LAZY_IMAGE_DEFAULTS = { transition: "fade", duration: 1000 } as const satisfies LazyImageOptions
