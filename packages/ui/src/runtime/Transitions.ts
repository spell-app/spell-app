// Import directly to avoid circular import
import { proto } from "$/ui/util"
import { after, type Prettify } from "$/ui/util"
import * as UIT from "$/ui/components/components.types"

import { CssDisplay, type AnimateOptions, type AnimationDirection, type AnimationName } from "./runtime.types"
import type { Browser } from "./Browser"

/****************
 * ### `Transitions`
 * Runs the keyframe catalogue on elements, as `UI.transitions`.
 * - In the runtime's lazy chunk (`UIRuntime` builds it);  `Visibility` fades lazy images through it.
 * - JS owns only the PROTOCOL;  `animations.css` owns the keyframes:
 *   - sets `data-ui-animation="<name> <direction>"`, e.g. `"fade-up in"`, which `animations.css` matches
 *     (`[data-ui-animation="fade-up in"]` or `~=` token selectors) to apply the animation
 *   - `duration` / `easing` options become `--ui-animation-duration` / `--ui-animation-easing` on the element
 *   - removes the attribute when done
 * - Visibility:
 *   - `in` un-hides first (`hidden` attribute, and the `display: none` a previous `out` may have forced)
 *   - `out` hides when done:  `hidden`, plus inline `display: none` when the element's CSS overrides `[hidden]`
 *     (a `:host { display: block }` beats the UA `[hidden]` rule)
 * - Resolves `true` when the animation ends, `false` when interrupted by another `animate()` on the same element.
 *   Starting an animation cancels the running one -- e.g. `in` while an `out` is mid-way.
 * - Never hangs:
 *   - resolves straight away when no animation applies (reduced motion, `animations.css` not loaded)
 *   - resolves after a fail-safe timeout if `animationend` never comes:
 *     the computed duration plus `failSafeDelay` (Fomantic's `failSafeDelay`)
 * - NOTE: CSS-only transitions (`@starting-style` + `allow-discrete` on popovers / dialogs) need no JS;
 *   `whenTransitionEnds()` is for code that must wait for them.
 ****************/
export class Transitions {
  /**
   * ms added to the computed duration before giving up on `animationend`
   * - `@proto` default (on the prototype, not per instance), as is `forcedDisplayAttribute`:
   *   an instance or subclass overrides it
   */
  declare failSafeDelay: number
  @proto static failSafeDelay = 100

  /** marks an inline `display: none` we set, so `in` only clears ours */
  declare forcedDisplayAttribute: string
  @proto static forcedDisplayAttribute = "data-ui-hidden-by-animation"

  /** `isReducedMotion` */
  private readonly browser: Pick<Browser, "isReducedMotion">
  /** element -> its running animation */
  private readonly running = new WeakMap<Element, RunningAnimation>()

  constructor({ browser }: TransitionsProps) {
    this.browser = browser
  }

  /**
   * Run animation `name` in `direction` on `element` -- see class docs for the protocol.
   * - SIDE EFFECTS:  `data-ui-animation`, `hidden`, inline `display` / custom properties on `element`.
   */
  animate({ element, name, direction, ...options }: AnimateParams): Promise<boolean> {
    this.running.get(element)?.finish(false)
    if (direction === UIT.IN) this.reveal(element)
    if (this.browser.isReducedMotion) {
      element.removeAttribute(ANIMATION_ATTRIBUTE)
      if (direction === UIT.OUT) this.hide(element)
      return Promise.resolve(true)
    }
    this.setOptions(element, options)
    const value = `${name} ${direction}`
    // same value again (e.g. repeated `shake`) -- remove and reflow so the animation restarts
    if (element.getAttribute(ANIMATION_ATTRIBUTE) === value) {
      element.removeAttribute(ANIMATION_ATTRIBUTE)
      void element.offsetWidth
    }
    element.setAttribute(ANIMATION_ATTRIBUTE, value)
    const wait = this.expectedDuration(element)
    if (wait === 0) {
      this.cleanup(element, direction, options)
      return Promise.resolve(true)
    }
    return new Promise<boolean>((resolve) => {
      const listeners = new AbortController()
      const onEnd = (event: AnimationEvent) => {
        if (event.target === element) finish(true)
      }
      const timer = after((wait + this.failSafeDelay) / 1000, () => finish(true))
      const finish = (completed: boolean) => {
        if (this.running.get(element) !== run) return
        this.running.delete(element)
        timer.cancel()
        listeners.abort()
        // an interrupted run leaves the element to its successor
        if (completed) this.cleanup(element, direction, options)
        resolve(completed)
      }
      const run: RunningAnimation = { direction, finish }
      this.running.set(element, run)
      for (const type of END_EVENTS) element.addEventListener(type, onEnd, { signal: listeners.signal })
    })
  }

  /** Is `element` mid-animation?  With `direction`, only that way. */
  isAnimating(element: Element, direction?: AnimationDirection): boolean {
    const run = this.running.get(element)
    return !!run && (!direction || run.direction === direction)
  }

  /**
   * Resolve once every animation / transition currently on `element` (and, with `subtree`, its descendants)
   * has finished or been cancelled.
   * - For CSS-driven motion, e.g. waiting for a popover's `@starting-style` entry before measuring it.
   */
  async whenTransitionEnds(element: Element, { subtree = false }: { subtree?: boolean } = {}): Promise<void> {
    await Promise.allSettled(element.getAnimations({ subtree }).map((animation) => animation.finished))
  }

  ////////////////
  // ## Internals
  ////////////////

  /**
   * Undo a previous `out` at once, with no animation:  `element` shows again.
   * - What an `in` does first;  `UIComponent` calls it to show an element with motion off.
   */
  reveal(element: HTMLElement) {
    element.hidden = false
    if (element.hasAttribute(this.forcedDisplayAttribute)) {
      element.style.removeProperty("display")
      element.removeAttribute(this.forcedDisplayAttribute)
    }
  }

  /** Hide after an `out`, forcing `display: none` when CSS overrides `[hidden]`. */
  private hide(element: HTMLElement) {
    element.hidden = true
    if (element.isConnected && getComputedStyle(element).display !== CssDisplay.none) {
      element.style.setProperty("display", CssDisplay.none)
      element.setAttribute(this.forcedDisplayAttribute, "")
    }
  }

  /** Set duration / easing custom properties. */
  private setOptions(element: HTMLElement, { duration, easing }: AnimateOptions) {
    if (duration !== undefined) {
      element.style.setProperty(DURATION_PROPERTY, typeof duration === "number" ? `${duration}ms` : duration)
    }
    if (easing !== undefined) element.style.setProperty(EASING_PROPERTY, easing)
  }

  /** After a completed run:  drop the attribute and option properties, hide after `out`. */
  private cleanup(element: HTMLElement, direction: AnimationDirection, options: AnimateOptions) {
    if (direction === UIT.OUT) this.hide(element)
    element.removeAttribute(ANIMATION_ATTRIBUTE)
    if (options.duration !== undefined) element.style.removeProperty(DURATION_PROPERTY)
    if (options.easing !== undefined) element.style.removeProperty(EASING_PROPERTY)
  }

  /**
   * Longest `delay + duration * iterations` among `element`'s computed animations, in ms;  `0` if none apply.
   * - `infinite` iterations count once:  the fail-safe must still fire.
   */
  private expectedDuration(element: HTMLElement): number {
    if (!element.isConnected) return 0
    const style = getComputedStyle(element)
    const names = style.animationName.split(",").map((name) => name.trim())
    const durations = style.animationDuration.split(",").map(toMs)
    const delays = style.animationDelay.split(",").map(toMs)
    const iterations = style.animationIterationCount.split(",").map((count) => Number.parseFloat(count) || 1)
    let longest = 0
    names.forEach((name, index) => {
      if (name === "none") return
      const duration = durations[index % durations.length] ?? 0
      const delay = delays[index % delays.length] ?? 0
      const repeat = iterations[index % iterations.length] ?? 1
      longest = Math.max(longest, Math.max(0, delay) + duration * repeat)
    })
    return longest

    /** Parse a CSS time (`"0.3s"`, `"200ms"`) to ms. */
    function toMs(time: string): number {
      const value = Number.parseFloat(time)
      if (Number.isNaN(value)) return 0
      return time.trim().endsWith("ms") ? value : value * 1000
    }
  }
}

/** Constructor props for `Transitions`. */
export type TransitionsProps = {
  /** only `isReducedMotion` is read -- tests pass a stub */
  browser: Pick<Browser, "isReducedMotion">
}

/** What `Transitions.animate()` takes:  the element, the animation and its direction, plus `AnimateOptions`. */
export type AnimateParams = Prettify<
  AnimateOptions & {
    /** element to animate;  `in` / `out` also show / hide it */
    element: HTMLElement
    /** one of `ANIMATION_NAMES` */
    name: AnimationName
    /** `in`, `out`, or `static` (attention animations) */
    direction: AnimationDirection
  }
>

/** A running `animate()`. */
type RunningAnimation = {
  /** which way it runs */
  direction: AnimationDirection
  /** settle it:  `true` completed, `false` interrupted */
  finish: (completed: boolean) => void
}

/** Attribute `animations.css` selects on. */
const ANIMATION_ATTRIBUTE = "data-ui-animation"

/** Custom property for the `duration` option. */
const DURATION_PROPERTY = "--ui-animation-duration"

/** Custom property for the `easing` option. */
const EASING_PROPERTY = "--ui-animation-easing"

/** Events that end a run:  finished, or cancelled (its keyframes went away). */
const END_EVENTS = ["animationend", "animationcancel"] as const
