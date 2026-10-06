import { createEffect, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { ShapeHost } from "./ShapeHost"
import { ShapeFallback } from "./ui-shape.fallback"
import { POLITE, SIDE, SIDES, type ShapeVocabulary } from "./ui-shape.types"
import { shapeVocabulary } from "./ui-shape.vocabulary.en"

import shapeCSS from "./ui-shape.css?inline"

/****************
 * ### `<ui-shape>`
 * Fomantic's shape:  one of its `<ui-side>`s at a time, turning in 3D to another --
 * `<div class="ui ... shape [animating]" part="shape"><div class="sides" part="sides"><slot>`.
 * - `activeIndex` is the side shown;  changing it (or the host's `flip()` / `next()` / `previous()`,
 *   `ShapeHost`, or an invoker command, `UIT.SHAPE_COMMANDS`) turns the `direction` way (`up`, `down`, `left`,
 *   `right`, `over`, `back`), then fires `ui-change`.  Flips queue;  a flip to the side already shown does nothing.
 * - The flip is Fomantic's own geometry (`shape.js`):  the stage keeps its size, the next side is staged at 90° (or
 *   180°) around the current one, and the sides box turns with a CSS transition;  inline styles are cleared after.
 * - SIDE EFFECTS on the sides (this family's own hosts):  custom states (`active`, `inactive`, `animating`,
 *   `leaving`) and, during a flip, inline `transform` / `top` / `left`.
 * - Reduced motion:  an instant swap, `ui-change` all the same.
 * - Accessibility:  hidden sides are `display: none`;  the sides box is a polite live region, so the new side is
 *   read out after a flip (Fomantic's had no ARIA).
 ****************/
export class UIShape extends E.UIElement<ShapeVocabulary> {
  @E.proto static vocabulary = shapeVocabulary
  @E.proto static styles = { shape: shapeCSS }
  @E.proto static Fallback = ShapeFallback
  @E.proto static Host = ShapeHost
  @E.proto static delegatesFocus = false

  ////////////////
  // ## State
  ////////////////

  /** `activeIndex`:  always the host's (a number with a default). */
  readonly activeState = this.controlled("active-index", 0)

  /** The side elements, in order. */
  readonly sides = new E.Cell<E.UIHost[]>(this.findSides())

  /** A flip is running. */
  readonly isAnimating = new E.Cell(false)

  /**
   * Has had sides;  until then `current` is only a guess.
   * - NOTE:  the barrel defines `<ui-shape>` BEFORE `<ui-side>`, so a parsed shape upgrades with no sides yet.
   */
  private hasHadSides = untrack(() => this.sides.get().length > 0)

  /** Index of the side shown now;  follows the queue, not the attribute. */
  private current = untrack(() => this.normalize(this.activeState.get() ?? 0, this.sides.get().length))

  /** Where the queue is heading. */
  private target = this.current

  /** The queue:  each flip starts when the one before has finished. */
  private queue: Promise<unknown> = Promise.resolve()

  /** The stage:  the outer box, which keeps its size while the sides turn. */
  private stage?: HTMLDivElement

  /** The turning box of sides. */
  private box?: HTMLDivElement

  constructor(...args: ConstructorParameters<typeof E.UIElement>) {
    super(...args)
    const listeners = new AbortController()
    const options = { signal: listeners.signal }
    this.host.renderRoot.addEventListener("slotchange", () => this.sides.set(this.findSides()), options)
    this.host.addEventListener("command", this.onCommand, options)
    this.host.addReleaseCallback(() => listeners.abort())
  }

  ////////////////
  // ## Element hooks
  ////////////////

  protected extraClasses(): string | undefined {
    return this.isAnimating.get() ? UIT.ANIMATING : undefined
  }

  protected hostStates() {
    return { animating: this.isAnimating.get() }
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    // a host effect:  a static render (`$/ui/static`) marks the sides once, before they render
    this.hostEffect(
      () => this.sides.get(),
      (sides) => {
        this.firstSides(sides)
        this.mark(sides)
      }
    )
    createEffect(
      () => this.activeState.get() ?? 0,
      (index) => {
        const next = this.normalize(index, untrack(() => this.sides.get()).length)
        if (next !== this.target) void this.enqueue(untrack(() => this.attrs.direction) ?? DEFAULT_FLIP, next)
      }
    )
    if (this.isServerInline()) return this.inlineShape()
    return (
      <div ref={(element) => (this.stage = element)} class={this.classes()} part={this.part("shape")}>
        <div ref={(element) => (this.box = element)} class={SIDES} part={this.part("sides")} aria-live={POLITE}>
          <slot />
        </div>
      </div>
    )
  }

  /**
   * A `text` shape in a server render (`$/ui/static`):  its static output is PHRASING content (`<span>`s, as the
   * class grammar's), since the host it replaces sits in running text -- a `<div>` would close an open `<p>` when a
   * browser parses the page.  Its sides follow (`UISide`).
   */
  isServerInline(): boolean {
    return isServer && untrack(() => !!this.attrs.text)
  }

  /** `render()`'s markup as `<span>`s (`isServerInline()`). */
  private inlineShape(): JSX.Element {
    return (
      <span class={this.classes()} part={this.part("shape")}>
        <span class={SIDES} part={this.part("sides")} aria-live={POLITE}>
          <slot />
        </span>
      </span>
    )
  }

  ////////////////
  // ## API (through `ShapeHost`)
  ////////////////

  /** Turn `direction` to side `index` (default the next one after where the queue is heading, wrapping). */
  flipTo(direction?: UIT.ShapeFlip, index?: number): Promise<boolean> {
    const count = untrack(() => this.sides.get()).length
    if (!count) return Promise.resolve(false)
    const to = this.normalize(index ?? this.target + 1, count)
    const done = to === this.target ? Promise.resolve(false) : this.enqueue(direction ?? this.defaultFlip(), to)
    this.activeState.set(to)
    return done
  }

  /** Turn `step` sides on (negative:  back), the `direction` attribute's way. */
  flipBy(step: number): Promise<boolean> {
    return this.flipTo(undefined, this.target + step)
  }

  /** An invoker command aimed at the host (`UIT.SHAPE_COMMANDS`):  `--next`, `--previous`, `--flip-<direction>`. */
  private readonly onCommand = (event: Event) => {
    const { command } = event as Event & { command: string }
    if (command === UIT.SHAPE_COMMANDS.next) void this.flipBy(1)
    else if (command === UIT.SHAPE_COMMANDS.previous) void this.flipBy(-1)
    else if (command?.startsWith(UIT.SHAPE_COMMANDS.flip)) {
      const direction = command.slice(UIT.SHAPE_COMMANDS.flip.length) as UIT.ShapeFlip
      if (UIT.ShapeFlips.includes(direction)) void this.flipTo(direction)
    }
  }

  ////////////////
  // ## Flipping
  ////////////////

  /** Queue a flip to `index`. */
  private enqueue(direction: UIT.ShapeFlip, index: number): Promise<boolean> {
    this.target = index
    const run = this.queue.then(() => this.flip(direction, index))
    this.queue = run.catch(() => false)
    return run
  }

  /**
   * One flip, Fomantic's `animate()`:  stage the next side, turn the box, wait for its transition, reset.
   * - Reduced motion, a hidden or disconnected shape:  swap at once.
   */
  private async flip(direction: UIT.ShapeFlip, index: number): Promise<boolean> {
    const sides = untrack(() => this.sides.get())
    const active = sides[this.current]
    const next = sides[index]
    if (!next || index === this.current) return false
    const { stage, box } = this
    const isInstant = !active || !stage || !box || !this.host.isConnected || UI.browser.isReducedMotion
    // `offsetParent` is the platform's:  `null` while hidden
    if (!isInstant && stage.offsetParent !== null) await this.animate({ direction, stage, box, active, next })
    this.current = index
    this.mark(sides)
    const detail: UIT.ShapeChangeDetail = { activeIndex: index, side: next, flip: direction }
    this.emit("ui-change", detail)
    return true
  }

  /** Stage, turn, wait, reset. */
  private async animate({ direction, stage, box, active, next }: FlipParams) {
    // the stage keeps its size (Fomantic's `width` / `height: 'initial'`)
    stage.style.width = `${stage.offsetWidth}px`
    stage.style.height = `${stage.offsetHeight}px`
    next.setState(INACTIVE, false)
    next.setState(UIT.ANIMATING, true)
    const sizes = { active: this.sizeOf(active), next: this.sizeOf(next) }
    const staged = UIShape.staging(direction, sizes)
    Object.assign(active.style, { transform: staged.active })
    Object.assign(next.style, staged.next)
    const duration = this.duration()
    if (duration) box.style.transitionDuration = duration
    void box.offsetWidth
    this.isAnimating.set(true)
    stage.classList.add(UIT.ANIMATING)
    active.setState(LEAVING, true)
    box.style.transform = UIShape.turn(direction, sizes)
    await this.transitionEnd(box)
    for (const element of [stage, box]) element.removeAttribute(STYLE)
    for (const side of [active, next]) for (const property of STAGED) side.style.removeProperty(property)
    stage.classList.remove(UIT.ANIMATING)
    active.setState(LEAVING, false)
    next.setState(UIT.ANIMATING, false)
    this.isAnimating.set(false)
  }

  /** Resolve on the box's `transitionend` (its own), or after its duration plus a fail-safe. */
  private transitionEnd(box: HTMLElement): Promise<void> {
    return new Promise((resolve) => {
      const style = getComputedStyle(box)
      const wait = Math.max(...style.transitionDuration.split(",").map((time) => UIShape.ms(time)))
      const onEnd = (event: TransitionEvent) => {
        if (event.target === box) done()
      }
      const timer = setTimeout(done, wait + FAIL_SAFE)
      box.addEventListener("transitionend", onEnd)

      /** Stop waiting:  the timer and the listener go, and the flip goes on. */
      function done() {
        clearTimeout(timer)
        box.removeEventListener("transitionend", onEnd)
        resolve()
      }
    })
  }

  /** The first sides found after none (upgrade order, or content added later):  start at `activeIndex`, not 0. */
  private firstSides(sides: readonly E.UIHost[]) {
    if (this.hasHadSides || !sides.length) return
    this.hasHadSides = true
    this.current = this.target = this.normalize(
      untrack(() => this.activeState.get() ?? 0),
      sides.length
    )
  }

  /** Show the current side;  hide the rest. */
  private mark(sides: readonly E.UIHost[]) {
    sides.forEach((side, index) => {
      side.setState(UIT.ACTIVE, index === this.current)
      side.setState(INACTIVE, index !== this.current)
    })
  }

  /** A side's margin box. */
  private sizeOf(side: HTMLElement): Size {
    const style = getComputedStyle(side)
    return {
      width: side.offsetWidth + margins("margin-left", "margin-right"),
      height: side.offsetHeight + margins("margin-top", "margin-bottom")
    }

    /** The two margins, in px. */
    function margins(first: string, second: string): number {
      return parseFloat(style.getPropertyValue(first)) + parseFloat(style.getPropertyValue(second))
    }
  }

  ////////////////
  // ## Reading
  ////////////////

  /** Child elements whose definition's noun is `side` (a `<ui-side>`, or a translated one). */
  private findSides(): E.UIHost[] {
    return [...this.host.children].filter(
      (child): child is E.UIHost => E.UIElement.definitions.get(child.localName)?.vocabulary.noun === SIDE
    )
  }

  /** `index` wrapped into `0 .. count - 1`. */
  private normalize(index: number, count: number): number {
    if (!count) return 0
    return ((Math.trunc(index) % count) + count) % count
  }

  /** The `direction` attribute. */
  private defaultFlip(): UIT.ShapeFlip {
    return untrack(() => this.attrs.direction) ?? DEFAULT_FLIP
  }

  /** `duration` as CSS:  bare digits are ms. */
  private duration(): string | undefined {
    const text = untrack(() => this.attrs.duration)?.trim()
    if (!text) return undefined
    return UIT.DIGITS.test(text) ? `${text}ms` : text
  }

  ////////////////
  // ## Geometry (Fomantic's `shape.js`):  static, as it's pure
  ////////////////

  /** Where the active side stays and the next one waits, 90° (or 180°) round (Fomantic's `stage.*`). */
  private static staging(
    direction: UIT.ShapeFlip,
    sizes: Sizes
  ): { active: string; next: Partial<CSSStyleDeclaration> } {
    const { active, next } = sizes
    if (direction === "up" || direction === "down") {
      const origin = (active.height - next.height) / 2
      const sign = direction === "up" ? 1 : -1
      return {
        active: "rotateX(0deg)",
        next: {
          top: `${origin}px`,
          transform: `rotateX(${sign * 90}deg) translateZ(${active.height / 2}px) translateY(${-sign * (next.height / 2)}px)`
        }
      }
    }
    const origin = (active.width - next.width) / 2
    if (direction === "over" || direction === "back") {
      return { active: "rotateY(0deg)", next: { left: `${origin}px`, transform: "rotateY(-180deg)" } }
    }
    const sign = direction === "left" ? -1 : 1
    return {
      active: "rotateY(0deg)",
      next: {
        left: `${origin}px`,
        transform: `rotateY(${sign * 90}deg) translateZ(${active.width / 2}px) translateX(${sign * (next.width / 2)}px)`
      }
    }
  }

  /** How the sides box turns (Fomantic's `get.transform.*`). */
  private static turn(direction: UIT.ShapeFlip, { active, next }: Sizes): string {
    switch (direction) {
      case "up":
        return `translateY(${next.height - active.height / 2}px) translateZ(${-active.height / 2}px) rotateX(-90deg)`
      case "down":
        return `translateY(${-active.height / 2}px) translateZ(${-active.height / 2}px) rotateX(90deg)`
      case "left":
        return `translateX(${next.width - active.width / 2}px) translateZ(${-active.width / 2}px) rotateY(90deg)`
      case "right":
        return `translateX(${-active.width / 2}px) translateZ(${-active.width / 2}px) rotateY(-90deg)`
      case "over":
        return `translateX(${-(active.width - next.width) / 2}px) rotateY(180deg)`
      case "back":
        return `translateX(${-(active.width - next.width) / 2}px) rotateY(-180deg)`
    }
  }

  /** A CSS time (`0.6s`, `600ms`) in ms. */
  private static ms(time: string): number {
    const value = Number.parseFloat(time)
    if (Number.isNaN(value)) return 0
    return time.trim().endsWith("ms") ? value : value * 1000
  }
}

/** What one animated flip works on. */
type FlipParams = {
  /** which way it turns */
  direction: UIT.ShapeFlip
  /** the outer box, held at its size */
  stage: HTMLElement
  /** the turning box of sides */
  box: HTMLElement
  /** the side shown now */
  active: E.UIHost
  /** the side turning in */
  next: E.UIHost
}

/** A margin box, in px. */
type Size = { width: number; height: number }

/** Margin-box sizes of the active and next sides. */
type Sizes = { active: Size; next: Size }

/** Default of `direction` (the vocabulary's). */
const DEFAULT_FLIP: UIT.ShapeFlip = "left"

/** A side's state while another is shown:  hidden. */
const INACTIVE = "inactive"

/** The active side's state while it turns away. */
const LEAVING = "leaving"

/** Its own boxes' inline styles are cleared after a flip (the attribute);  on the sides, only what it staged. */
const STYLE = "style"

/** The inline properties a flip stages on the sides. */
const STAGED = ["transform", "top", "left"] as const

/** ms added to the transition before giving up on `transitionend`. */
const FAIL_SAFE = 100
