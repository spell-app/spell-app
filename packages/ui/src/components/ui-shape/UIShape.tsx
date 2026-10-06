import { createEffect, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { Cell, proto, UI, UIElement, type UIHost, UIT } from "$/ui/core"

import { shapeVocabulary } from "./ui-shape.vocabulary.en"
import { ShapeHost } from "./ShapeHost"
import { ShapeFallback } from "./ui-shape.fallback"

import shapeCSS from "./ui-shape.css?inline"
import { DEFAULT_FLIP, SIDES, POLITE, INACTIVE, LEAVING, STYLE, STAGED, FAIL_SAFE, SIDE } from "./ui-shape.types"
import type { ShapeVocabulary, ShapeSizes } from "./ui-shape.types"
import { ANIMATING, ACTIVE, DIGITS } from "$/ui/components/components.types"

/****************
 * ### `<ui-shape>`
 * Fomantic's shape:  one of its `<ui-side>`s at a time, turning in 3D to another --
 * `<div class="ui ... shape [animating]" part="shape"><div class="sides" part="sides"><slot>`.
 * - `activeIndex` is the side shown;  changing it (or the host's `flip()` / `next()` / `previous()`,
 *   `ShapeHost`, or an invoker command, `SHAPE_COMMANDS`) turns the `direction` way (`up`, `down`, `left`, `right`,
 *   `over`, `back`), then fires `ui-change`.  Flips queue;  a flip to the side already shown does nothing.
 * - The flip is Fomantic's own geometry (`shape.js`):  the stage keeps its size, the next side is staged at 90° (or
 *   180°) around the current one, and the sides box turns with a CSS transition;  inline styles are cleared after.
 * - SIDE EFFECTS on the sides (this family's own hosts):  custom states (`active`, `inactive`, `animating`,
 *   `leaving`) and, during a flip, inline `transform` / `top` / `left`.
 * - Reduced motion:  an instant swap, `ui-change` all the same.
 * - Accessibility:  hidden sides are `display: none`;  the sides box is a polite live region, so the new side is
 *   read out after a flip (Fomantic's had no ARIA).
 ****************/
export class UIShape extends UIElement<ShapeVocabulary> {
  @proto static vocabulary = shapeVocabulary
  @proto static styles = { shape: shapeCSS }
  @proto static Fallback = ShapeFallback
  @proto static Host = ShapeHost
  @proto static delegatesFocus = false

  ////////////////
  // ## State
  ////////////////

  /** `activeIndex`:  always the host's (a number with a default). */
  readonly activeState = this.controlled("active-index", 0)

  /** The side elements, in order. */
  readonly sides = new Cell<UIHost[]>(this.findSides())

  /** A flip is running. */
  readonly animating = new Cell(false)

  /**
   * Has had sides;  until then `current` is only a guess.
   * - NOTE:  the barrel defines `<ui-shape>` BEFORE `<ui-side>`, so a parsed shape upgrades with no sides yet.
   */
  private hadSides = untrack(() => this.sides.get().length > 0)

  /** Index of the side shown now;  follows the queue, not the attribute. */
  private current = untrack(() => this.normalize(this.activeState.get() ?? 0, this.sides.get().length))

  /** Where the queue is heading. */
  private target = this.current

  /** The queue:  each flip starts when the one before has finished. */
  private queue: Promise<unknown> = Promise.resolve()

  /** The stage and the turning box. */
  private stage?: HTMLDivElement
  private box?: HTMLDivElement

  constructor(...args: ConstructorParameters<typeof UIElement>) {
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
    return this.animating.get() ? ANIMATING : undefined
  }

  protected hostStates() {
    return { animating: this.animating.get() }
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
    if (this.serverInline()) return this.renderInline()
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
  serverInline(): boolean {
    return isServer && untrack(() => !!this.attrs.text)
  }

  /** `render()`'s markup as `<span>`s (`serverInline()`). */
  private renderInline(): JSX.Element {
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

  /** An invoker command aimed at the host (`SHAPE_COMMANDS`):  `--next`, `--previous`, `--flip-<direction>`. */
  private readonly onCommand = (event: Event) => {
    const { command } = event as Event & { command: string }
    if (command === UIT.SHAPE_COMMANDS.next) void this.flipBy(1)
    else if (command === UIT.SHAPE_COMMANDS.previous) void this.flipBy(-1)
    else if (command?.startsWith(UIT.SHAPE_COMMANDS.flip)) {
      const direction = command.slice(UIT.SHAPE_COMMANDS.flip.length) as UIT.ShapeFlip
      if (UIT.SHAPE_FLIPS.includes(direction)) void this.flipTo(direction)
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
    const instant = !active || !stage || !box || !this.host.isConnected || UI.browser.reducedMotion
    if (!instant && stage.offsetParent !== null) await this.animate(direction, stage, box, active, next)
    this.current = index
    this.mark(sides)
    const detail: UIT.ShapeChangeDetail = { activeIndex: index, side: next, flip: direction }
    this.emit("ui-change", detail)
    return true
  }

  /** Stage, turn, wait, reset. */
  private async animate(direction: UIT.ShapeFlip, stage: HTMLElement, box: HTMLElement, active: UIHost, next: UIHost) {
    // the stage keeps its size (Fomantic's `width` / `height: 'initial'`)
    stage.style.width = `${stage.offsetWidth}px`
    stage.style.height = `${stage.offsetHeight}px`
    next.setState(INACTIVE, false)
    next.setState(ANIMATING, true)
    const sizes = { active: this.sizeOf(active), next: this.sizeOf(next) }
    const staged = UIShape.staging(direction, sizes)
    Object.assign(active.style, { transform: staged.active })
    Object.assign(next.style, staged.next)
    const duration = this.duration()
    if (duration) box.style.transitionDuration = duration
    void box.offsetWidth
    this.animating.set(true)
    stage.classList.add(ANIMATING)
    active.setState(LEAVING, true)
    box.style.transform = UIShape.turn(direction, sizes)
    await this.transitionEnd(box)
    for (const element of [stage, box]) element.removeAttribute(STYLE)
    for (const side of [active, next]) for (const property of STAGED) side.style.removeProperty(property)
    stage.classList.remove(ANIMATING)
    active.setState(LEAVING, false)
    next.setState(ANIMATING, false)
    this.animating.set(false)
  }

  /** Resolve on the box's `transitionend` (its own), or after its duration plus a fail-safe. */
  private transitionEnd(box: HTMLElement): Promise<void> {
    return new Promise((resolve) => {
      const style = getComputedStyle(box)
      const wait = Math.max(...style.transitionDuration.split(",").map((time) => UIShape.ms(time)))
      const done = () => {
        clearTimeout(timer)
        box.removeEventListener("transitionend", onEnd)
        resolve()
      }
      const onEnd = (event: TransitionEvent) => {
        if (event.target === box) done()
      }
      const timer = setTimeout(done, wait + FAIL_SAFE)
      box.addEventListener("transitionend", onEnd)
    })
  }

  /** The first sides found after none (upgrade order, or content added later):  start at `activeIndex`, not 0. */
  private firstSides(sides: readonly UIHost[]) {
    if (this.hadSides || !sides.length) return
    this.hadSides = true
    this.current = this.target = this.normalize(
      untrack(() => this.activeState.get() ?? 0),
      sides.length
    )
  }

  /** Show the current side;  hide the rest. */
  private mark(sides: readonly UIHost[]) {
    sides.forEach((side, index) => {
      side.setState(ACTIVE, index === this.current)
      side.setState(INACTIVE, index !== this.current)
    })
  }

  ////////////////
  // ## Geometry (Fomantic's `shape.js`)
  ////////////////

  /** A side's margin box. */
  private sizeOf(side: HTMLElement): { width: number; height: number } {
    const style = getComputedStyle(side)
    const margin = (a: string, b: string) =>
      parseFloat(style.getPropertyValue(a)) + parseFloat(style.getPropertyValue(b))
    return {
      width: side.offsetWidth + margin("margin-left", "margin-right"),
      height: side.offsetHeight + margin("margin-top", "margin-bottom")
    }
  }

  /** Where the active side stays and the next one waits, 90° (or 180°) round (Fomantic's `stage.*`). */
  static staging(direction: UIT.ShapeFlip, sizes: ShapeSizes): { active: string; next: Partial<CSSStyleDeclaration> } {
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
  static turn(direction: UIT.ShapeFlip, { active, next }: ShapeSizes): string {
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

  ////////////////
  // ## Reading
  ////////////////

  /** Child elements whose definition's noun is `side` (a `<ui-side>`, or a translated one). */
  private findSides(): UIHost[] {
    return [...this.host.children].filter(
      (child): child is UIHost => UIElement.definitions.get(child.localName)?.vocabulary.noun === SIDE
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
    return DIGITS.test(text) ? `${text}ms` : text
  }

  /** A CSS time (`0.6s`, `600ms`) in ms. */
  private static ms(time: string): number {
    const value = Number.parseFloat(time)
    if (Number.isNaN(value)) return 0
    return time.trim().endsWith("ms") ? value : value * 1000
  }
}
