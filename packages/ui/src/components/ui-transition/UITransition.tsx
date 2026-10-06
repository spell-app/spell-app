import { createEffect, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { transitionVocabulary } from "./ui-transition.vocabulary.en"
import { TransitionHost } from "./TransitionHost"
import { TransitionFallback } from "./ui-transition.fallback"
import {
  AttentionAnimations,
  DEFAULT_ANIMATION,
  TransitionAnimations,
  type TransitionAnimation,
  type Vocabulary
} from "./ui-transition.types"

import transitionCSS from "./ui-transition.css?inline"

/****************
 * ### `<ui-transition>`
 * Shows, hides or shakes its content with the animation catalogue (`animations.css`) through `UI.transitions`:
 * `<div class="ui ... transition [visible] [animating]" part="transition"><slot>`.
 * - The BOX animates, not the content:  its `hidden` attribute is what hides it (`UI.transitions` sets it after an
 *   `out`, removes it before an `in`), so hidden content is out of the page and the accessibility tree.
 * - `visible` drives it:  a change queues an `in` / `out` of `animation`;  the host's `show()` / `hide()` /
 *   `toggle()` / `transition(name)` do the same from script (`TransitionHost`), and invoker commands without any
 *   (`TRANSITION_COMMANDS`:  `<button commandfor="id" command="--toggle">`).  First paint never animates.
 * - Queue, as Fomantic's `queue: true`:  each animation waits for the one before it;  the same animation twice in a
 *   row is dropped unless `allow-repeats`;  `interrupt` makes a new one stop the running one instead.
 * - `ui-show` / `ui-hide` once an `in` / `out` has run, `ui-complete` after every animation.
 * - Reduced motion:  `UI.transitions` skips the motion (the end state at once), so events still follow.
 ****************/
export class UITransition extends E.UIElement<Vocabulary> {
  @E.proto static vocabulary = transitionVocabulary
  @E.proto static styles = { transition: transitionCSS }
  @E.proto static Fallback = TransitionFallback
  @E.proto static Host = TransitionHost
  // a click on animated text must not jump focus to a link inside it
  @E.proto static delegatesFocus = false

  ////////////////
  // ## State
  ////////////////

  /** `visible`:  always the host's (a boolean), written by the host methods so it reflects. */
  readonly visibleState = this.controlled("visible", false)

  /** Shown, or on its way in;  follows the queue, not the attribute. */
  readonly isVisible = new E.Cell(untrack(() => !!this.attrs.visible))

  /** An animation is running. */
  readonly isAnimating = new E.Cell(false)

  /** The animated box. */
  private box?: HTMLDivElement

  /** Where the queue is heading:  visible once every queued step has run. */
  private isHeadingVisible = untrack(() => !!this.attrs.visible)

  /** Steps waiting to run, in order. */
  private readonly queue: TransitionStep[] = []

  /** The step running now. */
  private running?: TransitionStep

  constructor(...args: ConstructorParameters<typeof E.UIElement>) {
    super(...args)
    const listeners = new AbortController()
    this.host.addEventListener("command", this.onCommand, { signal: listeners.signal })
    this.host.addReleaseCallback(() => listeners.abort())
  }

  ////////////////
  // ## Element hooks
  ////////////////

  /** Its state after the noun, as Fomantic's script added it:  `visible`, `animating`. */
  protected extraClasses(): string | undefined {
    const words = [this.isVisible.get() ? UIT.VISIBLE : undefined, this.isAnimating.get() ? UIT.ANIMATING : undefined]
    return words.filter(Boolean).join(" ") || undefined
  }

  protected hostStates() {
    return { visible: this.isVisible.get(), animating: this.isAnimating.get() }
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    // in the render, not `mount()`:  it calls nothing a subclass overrides, and only runs once the box can animate
    createEffect(
      () => !!this.attrs.visible,
      (isVisible) => {
        if (isVisible !== this.isHeadingVisible) void this.queueVisibility(isVisible, this.animationName())
      }
    )
    // a server render (`$/ui/static`) never calls `ref`:  first paint's `hidden` as an attribute
    if (isServer)
      return (
        <div class={this.classes()} part={this.part("transition")} hidden={!this.isHeadingVisible || undefined}>
          <slot />
        </div>
      )
    return (
      <div ref={(element) => this.attach(element)} class={this.classes()} part={this.part("transition")}>
        <slot />
      </div>
    )
  }

  /** First paint:  hidden unless `visible`, with no animation. */
  private attach(box: HTMLDivElement) {
    this.box = box
    box.hidden = !this.isHeadingVisible
  }

  ////////////////
  // ## API (through `TransitionHost`)
  ////////////////

  /** Animate to `visible`;  writes the host's `visible` so it reflects. */
  setVisible(visible: boolean, animation = this.animationName()): Promise<boolean> {
    const done = visible === this.isHeadingVisible ? this.lastDone() : this.queueVisibility(visible, animation)
    this.visibleState.set(visible)
    return done
  }

  /** Flip visibility. */
  toggle(): Promise<boolean> {
    return this.setVisible(!this.isHeadingVisible)
  }

  /**
   * Run `animation` (default the `animation` attribute's):  an attention one in place, an appear / disappear one
   * toggling visibility.
   * - Takes Fomantic's names (`fade up`) or the runtime's (`fade-up`);  an unknown one warns and resolves `false`.
   */
  transition(animation = this.animationName()): Promise<boolean> {
    const name = UITransition.fomanticNameFor(animation)
    if (!name) {
      E.Warnings.warn(
        `<${this.host.localName}>.transition()`,
        `unknown animation ${JSON.stringify(animation)};  use one of Fomantic's names (\`fade up\`) or the ` +
          `runtime's (\`fade-up\`)`
      )
      return Promise.resolve(false)
    }
    if (UITransition.isAttention(name)) return this.enqueue(STATIC, name)
    return this.setVisible(!this.isHeadingVisible, name)
  }

  /** An invoker command aimed at the host (`TRANSITION_COMMANDS`). */
  private readonly onCommand = (event: Event) => {
    const { command } = event as Event & { command: string }
    if (command === UIT.TRANSITION_COMMANDS.show) void this.setVisible(true)
    else if (command === UIT.TRANSITION_COMMANDS.close) void this.setVisible(false)
    else if (command === UIT.TRANSITION_COMMANDS.toggle) void this.toggle()
    else if (command === UIT.TRANSITION_COMMANDS.transition) void this.transition()
  }

  ////////////////
  // ## Queue
  ////////////////

  /** Queue an `in` / `out` of `animation`, heading for `visible`. */
  private queueVisibility(visible: boolean, animation: string): Promise<boolean> {
    this.isHeadingVisible = visible
    return this.enqueue(visible ? UIT.IN : UIT.OUT, animation)
  }

  /**
   * Add a step, and start it when nothing runs (or at once with `interrupt`).
   * - The same animation the same way as the last queued (or running) step is dropped unless `allow-repeats`:  its
   *   promise is returned instead.
   */
  private enqueue(direction: E.AnimationDirection, animation: string): Promise<boolean> {
    const last = this.queue.at(-1) ?? this.running
    const isRepeat = last?.animation === animation && last.direction === direction
    if (isRepeat && !untrack(() => this.attrs.allowRepeats)) return last.done
    const isInterrupting = untrack(() => !!this.attrs.interrupt)
    if (isInterrupting) for (const dropped of this.queue.splice(0)) dropped.resolve(false)
    let resolve!: (isCompleted: boolean) => void
    const done = new Promise<boolean>((settle) => (resolve = settle))
    this.queue.push({ direction, animation, done, resolve })
    if (!this.running || isInterrupting) this.next()
    return done
  }

  /** Promise of the last queued (or running) step;  resolved `true` when idle. */
  private lastDone(): Promise<boolean> {
    return (this.queue.at(-1) ?? this.running)?.done ?? Promise.resolve(true)
  }

  /** Start the next step, if any;  a step superseded (`interrupt`) resolves `false` and starts nothing. */
  private next() {
    const step = this.queue.shift()
    this.running = step
    this.isAnimating.set(!!step)
    if (!step) return
    if (step.direction === UIT.IN) this.isVisible.set(true)
    void this.run(step).then((isCompleted) => {
      if (this.running !== step) return step.resolve(false)
      if (step.direction === UIT.OUT) this.isVisible.set(false)
      this.announce(step)
      step.resolve(isCompleted)
      this.next()
    })
  }

  /**
   * Animate `step` on the box through `UI.transitions`.
   * - An attention animation asked to show / hide (the `animation` attribute is `shake`) just shows / hides.
   */
  private run(step: TransitionStep): Promise<boolean> {
    const box = this.box
    if (!box?.isConnected) {
      if (box && step.direction !== STATIC) box.hidden = step.direction === UIT.OUT
      return Promise.resolve(false)
    }
    const name = UITransition.runtimeNameFor(step.animation)
    if (step.direction !== STATIC && UITransition.isAttention(step.animation)) {
      box.hidden = step.direction === UIT.OUT
      return Promise.resolve(true)
    }
    return UI.transitions.animate({ element: box, name, direction: step.direction, ...this.animateOptions() })
  }

  /** `ui-show` / `ui-hide` after an `in` / `out`, then `ui-complete`. */
  private announce(step: TransitionStep) {
    const detail: UIT.TransitionDetail = {
      visible: step.direction === STATIC ? this.isHeadingVisible : step.direction === UIT.IN,
      animation: step.animation
    }
    if (step.direction === UIT.IN) this.emit("ui-show", detail)
    else if (step.direction === UIT.OUT) this.emit("ui-hide", detail)
    this.emit("ui-complete", detail)
  }

  ////////////////
  // ## Settings
  ////////////////

  /** The `animation` attribute, untracked. */
  private animationName(): string {
    return untrack(() => this.attrs.animation) ?? DEFAULT_ANIMATION
  }

  /** `duration` as `UI.transitions` takes it:  bare digits are ms. */
  private animateOptions(): E.AnimateOptions {
    const duration = untrack(() => this.attrs.duration)?.trim()
    if (!duration) return {}
    return { duration: UIT.DIGITS.test(duration) ? Number(duration) : duration }
  }

  ////////////////
  // ## Animation names
  ////////////////

  /**
   * Fomantic's name for `animation` (either spelling), or `undefined` when it isn't one.
   * - Static, as the two below:  pure lookups over the animation tables.
   */
  private static fomanticNameFor(animation: string): TransitionAnimation | undefined {
    const text = animation.trim().replace(/\s+/g, " ")
    if ((TransitionAnimations as readonly string[]).includes(text)) return text as TransitionAnimation
    return TransitionAnimations.find((name) => UITransition.runtimeNameFor(name) === text)
  }

  /** The runtime catalogue's name for Fomantic's:  `fade up` => `fade-up`, `horizontal flip` => `flip-horizontal`. */
  private static runtimeNameFor(animation: string): E.AnimationName {
    const special = RUNTIME_NAMES[animation]
    return (special ?? animation.replace(/ /g, "-")) as E.AnimationName
  }

  /** An attention animation (runs in place)? */
  private static isAttention(animation: string): boolean {
    return (AttentionAnimations as readonly string[]).includes(animation)
  }
}

/** One queued animation. */
type TransitionStep = {
  /** `in`, `out`, or `static` (attention, in place) */
  direction: E.AnimationDirection
  /** Fomantic's name */
  animation: string
  /** resolves when it has run:  `true` finished, `false` superseded */
  done: Promise<boolean>
  /** settles `done` */
  resolve: (isCompleted: boolean) => void
}

/** Direction of an attention animation:  in place, visibility unchanged. */
const STATIC = "static"

/** Fomantic names whose runtime name isn't the kebab-cased one. */
const RUNTIME_NAMES: Readonly<Record<string, string>> = {
  "horizontal flip": "flip-horizontal",
  "vertical flip": "flip-vertical",
  slide: "slide-down",
  swing: "swing-down"
}
