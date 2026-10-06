import { createEffect, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import {
  Cell,
  proto,
  UI,
  UIElement,
  type AnimateOptions,
  type AnimationDirection,
  type AnimationName,
  UIT,
  Warnings
} from "$/ui/core"

import { TRANSITION_ANIMATIONS, TRANSITION_ATTENTION_ANIMATIONS } from "./ui-transition.types"
import { transitionVocabulary } from "./ui-transition.vocabulary.en"
import { TransitionHost } from "./TransitionHost"
import { TransitionFallback } from "./ui-transition.fallback"

import transitionCSS from "./ui-transition.css?inline"
import { STATIC, DEFAULT_ANIMATION, RUNTIME_NAMES } from "./ui-transition.types"
import type { TransitionVocabulary, TransitionStep } from "./ui-transition.types"
import { VISIBLE, ANIMATING, IN, OUT, DIGITS } from "$/ui/components/components.types"

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
export class UITransition extends UIElement<TransitionVocabulary> {
  @proto static vocabulary = transitionVocabulary
  @proto static styles = { transition: transitionCSS }
  @proto static Fallback = TransitionFallback
  @proto static Host = TransitionHost
  // a click on animated text must not jump focus to a link inside it
  @proto static delegatesFocus = false

  ////////////////
  // ## State
  ////////////////

  /** `visible`:  always the host's (a boolean), written by the host methods so it reflects. */
  readonly visibleState = this.controlled("visible", false)

  /** Shown, or on its way in;  follows the queue, not the attribute. */
  readonly shown = new Cell(untrack(() => !!this.attrs.visible))

  /** An animation is running. */
  readonly animating = new Cell(false)

  /** The animated box. */
  private box?: HTMLDivElement

  /** Where the queue is heading:  visible once every queued step has run. */
  private target = untrack(() => !!this.attrs.visible)

  /** Steps waiting to run, in order. */
  private readonly queue: TransitionStep[] = []

  /** The step running now. */
  private running?: TransitionStep

  constructor(...args: ConstructorParameters<typeof UIElement>) {
    super(...args)
    const listeners = new AbortController()
    this.host.addEventListener("command", this.onCommand, { signal: listeners.signal })
    this.host.addReleaseCallback(() => listeners.abort())
  }

  ////////////////
  // ## Element hooks
  ////////////////

  protected extraClasses(): string | undefined {
    const words = [this.shown.get() ? VISIBLE : undefined, this.animating.get() ? ANIMATING : undefined]
    return words.filter(Boolean).join(" ") || undefined
  }

  protected hostStates() {
    return { visible: this.shown.get(), animating: this.animating.get() }
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    createEffect(
      () => !!this.attrs.visible,
      (visible) => {
        if (visible !== this.target) void this.queueVisibility(visible, this.animationName())
      }
    )
    // a server render (`$/ui/static`) never calls `ref`:  first paint's `hidden` as an attribute
    if (isServer)
      return (
        <div class={this.classes()} part={this.part("transition")} hidden={!this.target || undefined}>
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
    box.hidden = !this.target
  }

  ////////////////
  // ## API (through `TransitionHost`)
  ////////////////

  /** Animate to `visible`;  writes the host's `visible` so it reflects. */
  setVisible(visible: boolean, animation = this.animationName()): Promise<boolean> {
    const done = visible === this.target ? this.lastDone() : this.queueVisibility(visible, animation)
    this.visibleState.set(visible)
    return done
  }

  /** Flip visibility. */
  toggle(): Promise<boolean> {
    return this.setVisible(!this.target)
  }

  /**
   * Run `animation` (default the `animation` attribute's):  an attention one in place, an appear / disappear one
   * toggling visibility.
   * - Takes Fomantic's names (`fade up`) or the runtime's (`fade-up`);  an unknown one warns and resolves `false`.
   */
  transition(animation = this.animationName()): Promise<boolean> {
    const name = UITransition.fomanticName(animation)
    if (!name) {
      Warnings.warn(`<${this.host.localName}>`, `unknown animation ${JSON.stringify(animation)}`)
      return Promise.resolve(false)
    }
    if (UITransition.isAttention(name)) return this.enqueue(STATIC, name)
    return this.setVisible(!this.target, name)
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
    this.target = visible
    return this.enqueue(visible ? IN : OUT, animation)
  }

  /**
   * Add a step, and start it when nothing runs (or at once with `interrupt`).
   * - The same animation the same way as the last queued (or running) step is dropped unless `allow-repeats`:  its
   *   promise is returned instead.
   */
  private enqueue(direction: AnimationDirection, animation: string): Promise<boolean> {
    const last = this.queue.at(-1) ?? this.running
    const repeat = last?.animation === animation && last.direction === direction
    if (repeat && !untrack(() => this.attrs.allowRepeats)) return last.done
    const interrupt = untrack(() => !!this.attrs.interrupt)
    if (interrupt) for (const dropped of this.queue.splice(0)) dropped.resolve(false)
    let resolve!: (completed: boolean) => void
    const done = new Promise<boolean>((settle) => (resolve = settle))
    this.queue.push({ direction, animation, done, resolve })
    if (!this.running || interrupt) this.next()
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
    this.animating.set(!!step)
    if (!step) return
    if (step.direction === IN) this.shown.set(true)
    void this.run(step).then((completed) => {
      if (this.running !== step) return step.resolve(false)
      if (step.direction === OUT) this.shown.set(false)
      this.announce(step)
      step.resolve(completed)
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
      if (box && step.direction !== STATIC) box.hidden = step.direction === OUT
      return Promise.resolve(false)
    }
    const name = UITransition.runtimeName(step.animation)
    if (step.direction !== STATIC && UITransition.isAttention(step.animation)) {
      box.hidden = step.direction === OUT
      return Promise.resolve(true)
    }
    return UI.transitions.animate({ element: box, name, direction: step.direction, ...this.options() })
  }

  /** `ui-show` / `ui-hide` after an `in` / `out`, then `ui-complete`. */
  private announce(step: TransitionStep) {
    const detail: UIT.TransitionDetail = {
      visible: step.direction === STATIC ? this.target : step.direction === IN,
      animation: step.animation
    }
    if (step.direction === IN) this.emit("ui-show", detail)
    else if (step.direction === OUT) this.emit("ui-hide", detail)
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
  private options(): AnimateOptions {
    const duration = untrack(() => this.attrs.duration)?.trim()
    if (!duration) return {}
    return { duration: DIGITS.test(duration) ? Number(duration) : duration }
  }

  /** Fomantic's name for `animation` (either spelling), or `undefined` when it isn't one. */
  static fomanticName(animation: string): string | undefined {
    const text = animation.trim().replace(/\s+/g, " ")
    if ((TRANSITION_ANIMATIONS as readonly string[]).includes(text)) return text
    return TRANSITION_ANIMATIONS.find((name) => UITransition.runtimeName(name) === text)
  }

  /** The runtime catalogue's name for Fomantic's:  `fade up` => `fade-up`, `horizontal flip` => `flip-horizontal`. */
  static runtimeName(animation: string): AnimationName {
    const special = RUNTIME_NAMES[animation]
    return (special ?? animation.replace(/ /g, "-")) as AnimationName
  }

  /** An attention animation (runs in place)? */
  static isAttention(animation: string): boolean {
    return (TRANSITION_ATTENTION_ANIMATIONS as readonly string[]).includes(animation)
  }
}
