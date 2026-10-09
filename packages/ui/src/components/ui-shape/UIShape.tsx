import { untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { SIDE, SIDES, type ShapeVocabulary } from "./UIShape.types"
import { shapeVocabulary } from "./UIShape.en"

import shapeCSS from "./UIShape.css?inline"

/****************
 * ### `DOMShapeElement`
 * The DOM element of `<ui-shape>`:
 * it adds Fomantic's `.shape('flip up')` / `'set next side'` as METHODS, `flip()`, `next()` and `previous()`.
 *
 * - Each resolves once its flip has run:  `true` when it showed another side,
 *   `false` when there was none to show (or the element hasn't drawn yet).  Flips queue, as Fomantic's do.
 * - Each writes `activeIndex` (so it reflects, and frameworks see it);
 *   writing `activeIndex` yourself flips too, the `direction` attribute's way.
 * - Above the component:  its `elementSetup` reads this class while the component is defined.
 ****************/
export class DOMShapeElement extends E.DOMElement<UIShape> {
  /** Turn `direction` (default the `direction` attribute) to side `index` (default the next one, wrapping). */
  flip(direction?: UIT.ShapeFlip, index?: number): Promise<boolean> {
    return this.component?.flipTo(direction, index) ?? Promise.resolve(false)
  }

  /** Turn to the next side (wrapping), the `direction` attribute's way. */
  next(): Promise<boolean> {
    return this.flip()
  }

  /** Turn to the previous side (wrapping), the `direction` attribute's way. */
  previous(): Promise<boolean> {
    return this.component?.flipBy(-1) ?? Promise.resolve(false)
  }
}

/****************
 * ### `UIShape`
 * The component behind `<ui-shape>`:  Fomantic's shape, one of its `<ui-side>`s at a time, turning in 3D to another.
 * `<div class="ui … shape [animating]" part="shape"><div class="sides" part="sides"><slot>`.
 *
 * - `activeIndex` is the side shown.  Changing it turns the `direction` way
 *   (`up`, `down`, `left`, `right`, `over`, `back`), then fires `ui-change`;
 *   so do the DOM element's `flip()` / `next()` / `previous()` (`DOMShapeElement`)
 *   and invoker commands (`UIT.ShapeCommands`).
 *   Flips queue;  a flip to the side already shown does nothing.
 *
 * - The flip is Fomantic's own geometry (`shape.js`):  the stage keeps its size,
 *   the next side is staged at 90° (or 180°) around the current one, and the sides box turns with a CSS transition.
 *   The inline styles are cleared after.
 *
 * - SIDE EFFECTS on the sides (this family's own DOM elements):  custom states (`active`, `inactive`, `animating`,
 *   `leaving`) and, during a flip, inline `transform` / `top` / `left`.
 * - Reduced motion:  an instant swap, `ui-change` all the same.
 * - Accessibility:  hidden sides are `display: none`;
 *   the sides box is a polite live region, so the new side is read out after a flip (Fomantic's had no ARIA).
 ****************/
export class UIShape extends E.UIComponent<ShapeVocabulary> {
  @E.proto static vocabulary = shapeVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { shape: shapeCSS },
    DOMElement: DOMShapeElement,
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  ////////////////
  // ## Sides
  ////////////////

  /** The side elements, in order. */
  @E.state accessor sides: E.DOMElement[] = this.findSides()

  /**
   * Has had sides;  until then `shownIndex` is only a guess.
   * - NOTE:  the barrel defines `<ui-shape>` BEFORE `<ui-side>`, so a parsed shape upgrades with no sides yet.
   */
  private hasHadSides = untrack(() => this.sides.length > 0)

  /** The default slot's content changed:  find the sides again. */
  @E.on("slotchange", { target: "renderRoot" })
  protected onSlotChange() {
    this.sides = this.findSides()
  }

  /**
   * The sides changed:  start at `activeIndex` the first time, then show the current side, hide the rest.
   * - Once `isReady` (the sheets are in and the stage is drawn), as when this lived in `render()`.
   * - Writes the DOM element's sides:  a static render (`$/ui/static`) marks them once, before they render.
   */
  @E.onChange("isReady", "sides", { writesDOMElement: true })
  protected onSidesChanged(isReady: boolean, sides: E.DOMElement[]) {
    if (!isReady) return
    this.firstSides(sides)
    this.mark(sides)
  }

  /** The first sides found after none (upgrade order, or content added later):  start at `activeIndex`, not 0. */
  @E.untracked
  private firstSides(sides: readonly E.DOMElement[]) {
    if (this.hasHadSides || !sides.length) return
    this.hasHadSides = true
    this.shownIndex = this.queuedIndex = this.normalize(this.activeSideIndex, sides.length)
  }

  /** Show the current side;  hide the rest. */
  private mark(sides: readonly E.DOMElement[]) {
    sides.forEach((side, index) => {
      side.setState(UIT.ACTIVE, index === this.shownIndex)
      side.setState(INACTIVE, index !== this.shownIndex)
    })
  }

  /** Child elements whose definition's noun is `side` (a `<ui-side>`, or a translated one). */
  private findSides(): E.DOMElement[] {
    return [...this.domElement.children].filter(
      (child): child is E.DOMElement =>
        E.UIComponent.registry.definitions.get(child.localName)?.vocabulary.noun === SIDE
    )
  }

  ////////////////
  // ## The side shown (API through `DOMShapeElement`)
  ////////////////

  /** `activeIndex`:  always the DOM element's property (a number with a default). */
  @E.controlled("active-index") accessor activeSideIndex = 0

  /**
   * Index of the side shown now:
   * NOT a mirror of `activeSideIndex`, it follows the queue (it lags while a flip runs).
   */
  private shownIndex = untrack(() => this.normalize(this.activeSideIndex, this.sides.length))

  /** Where the queue is heading. */
  private queuedIndex = this.shownIndex

  /** The queue:  each flip starts when the one before has finished. */
  private flipQueue: Promise<unknown> = Promise.resolve()

  /**
   * `activeIndex` changed (the DOM element's own write, or `flipTo()`'s):  flip there,
   * unless the queue is heading there.
   * - Once `isReady`, as when this lived in `render()`:  a change before the sheets load flips (animated) once the
   *   stage is drawn, instead of swapping at once.
   */
  @E.onChange("isReady", "activeSideIndex")
  protected onActiveSideIndexChanged(isReady: boolean, index: number) {
    if (!isReady) return
    const next = this.normalize(index, this.sides.length)
    if (next !== this.queuedIndex) void this.enqueue(this.defaultFlip, next)
  }

  /** Turn `direction` to side `index` (default the next one after where the queue is heading, wrapping). */
  @E.untracked
  flipTo(direction?: UIT.ShapeFlip, index?: number): Promise<boolean> {
    const count = this.sides.length
    if (!count) return Promise.resolve(false)
    const to = this.normalize(index ?? this.queuedIndex + 1, count)
    const done = to === this.queuedIndex ? Promise.resolve(false) : this.enqueue(direction ?? this.defaultFlip, to)
    this.activeSideIndex = to
    return done
  }

  /** Turn `step` sides on (negative:  back), the `direction` attribute's way. */
  flipBy(step: number): Promise<boolean> {
    return this.flipTo(undefined, this.queuedIndex + step)
  }

  /**
   * An invoker command aimed at the DOM element (`UIT.ShapeCommands`):  `--next`, `--previous`, `--flip-<direction>`.
   */
  @E.on("command")
  protected onCommand(event: Event) {
    const { command } = event as Event & { command: string }
    if (command === UIT.ShapeCommands.next) void this.flipBy(1)
    else if (command === UIT.ShapeCommands.previous) void this.flipBy(-1)
    else if (command?.startsWith(UIT.ShapeCommands.flip)) {
      const direction = command.slice(UIT.ShapeCommands.flip.length) as UIT.ShapeFlip
      if (UIT.ShapeFlips.includes(direction)) void this.flipTo(direction)
    }
  }

  /** Queue a flip to `index`. */
  private enqueue(direction: UIT.ShapeFlip, index: number): Promise<boolean> {
    this.queuedIndex = index
    const run = this.flipQueue.then(() => this.flip(direction, index))
    this.flipQueue = run.catch(() => false)
    return run
  }

  /** `index` wrapped into `0 .. count - 1`. */
  private normalize(index: number, count: number): number {
    if (!count) return 0
    return ((Math.trunc(index) % count) + count) % count
  }

  ////////////////
  // ## Flipping
  ////////////////

  /** A flip is running:  class `animating`, `:state(animating)`. */
  @E.cssState("animating")
  @E.state
  accessor isFlipping = false

  protected get extraClass(): string | undefined {
    return this.isFlipping ? UIT.ANIMATING : undefined
  }

  /** The stage:  the outer box, which keeps its size while the sides turn. */
  private stage?: HTMLDivElement

  /** The turning box of sides. */
  private box?: HTMLDivElement

  /**
   * One flip, Fomantic's `animate()`:  stage the next side, turn the box, wait for its transition, reset.
   * - Reduced motion, a hidden or disconnected shape:  swap at once.
   */
  @E.untracked
  private async flip(direction: UIT.ShapeFlip, index: number): Promise<boolean> {
    const sides = this.sides
    const active = sides[this.shownIndex]
    const next = sides[index]
    if (!next || index === this.shownIndex) return false
    const { stage, box } = this
    const isInstant = !active || !stage || !box || !this.domElement.isConnected || UI.browser.isReducedMotion
    // `offsetParent` is the platform's:  `null` while hidden
    if (!isInstant && stage.offsetParent !== null) await this.animate({ direction, stage, box, active, next })
    this.shownIndex = index
    this.mark(sides)
    const detail: UIT.ShapeChangeDetail = { activeIndex: index, side: next, flip: direction }
    this.send("ui-change", detail)
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
    const duration = this.cssDuration
    if (duration) box.style.transitionDuration = duration
    void box.offsetWidth
    this.isFlipping = true
    stage.classList.add(UIT.ANIMATING)
    active.setState(LEAVING, true)
    box.style.transform = UIShape.turn(direction, sizes)
    await this.transitionEnd(box)
    for (const element of [stage, box]) element.removeAttribute("style")
    for (const side of [active, next]) for (const property of STAGED) side.style.removeProperty(property)
    stage.classList.remove(UIT.ANIMATING)
    active.setState(LEAVING, false)
    next.setState(UIT.ANIMATING, false)
    this.isFlipping = false
  }

  /** Resolve on the box's `transitionend` (its own), or after its duration plus a fail-safe. */
  private transitionEnd(box: HTMLElement): Promise<void> {
    return new Promise((resolve) => {
      const style = getComputedStyle(box)
      const wait = Math.max(...style.transitionDuration.split(",").map((time) => UIShape.ms(time)))
      const onEnd = (event: TransitionEvent) => {
        if (event.target === box) done()
      }
      const timer = E.after((wait + FAIL_SAFE) / 1000, done)
      box.addEventListener("transitionend", onEnd)

      /** Stop waiting:  the timer and the listener go, and the flip goes on. */
      function done() {
        timer.cancel()
        box.removeEventListener("transitionend", onEnd)
        resolve()
      }
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

  /** The `direction` attribute (or its default);  untracked. */
  private get defaultFlip(): UIT.ShapeFlip {
    return untrack(() => this.direction) ?? DEFAULT_FLIP
  }

  /** `duration` as CSS:  bare digits are ms;  untracked. */
  private get cssDuration(): string | undefined {
    const text = untrack(() => this.duration)?.trim()
    if (!text) return undefined
    return UIT.DIGITS.test(text) ? `${text}ms` : text
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    if (this.rendersInlineOnServer) return this.inlineShape()
    return (
      <div ref={(element) => (this.stage = element)} class={this.rootClass} part={this.partForName("shape")}>
        <div ref={(element) => (this.box = element)} class={SIDES} part={this.partForName("sides")} aria-live="polite">
          <slot />
        </div>
      </div>
    )
  }

  /**
   * A `text` shape in a server render (`$/ui/static`):  its static output is PHRASING content (`<span>`s,
   * as the class grammar's), since the DOM element it replaces sits in running text --
   * a `<div>` would close an open `<p>` when a browser parses the page.  Its sides follow (`UISide`).
   */
  get rendersInlineOnServer(): boolean {
    return isServer && untrack(() => !!this.text)
  }

  /** `render()`'s markup as `<span>`s (`rendersInlineOnServer`). */
  private inlineShape(): JSX.Element {
    return (
      <span class={this.rootClass} part={this.partForName("shape")}>
        <span class={SIDES} part={this.partForName("sides")} aria-live="polite">
          <slot />
        </span>
      </span>
    )
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

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIShape extends E.AttributeValues<ShapeVocabulary> {}

/** What one animated flip works on. */
type FlipParams = {
  /** which way it turns */
  direction: UIT.ShapeFlip
  /** the outer box, held at its size */
  stage: HTMLElement
  /** the turning box of sides */
  box: HTMLElement
  /** the side shown now */
  active: E.DOMElement
  /** the side turning in */
  next: E.DOMElement
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

/** The inline properties a flip stages on the sides. */
const STAGED = ["transform", "top", "left"] as const

/** ms added to the transition before giving up on `transitionend`. */
const FAIL_SAFE = 100
