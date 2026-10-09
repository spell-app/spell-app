import { untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { transitionVocabulary } from "./UITransition.en"
import {
  AttentionAnimations,
  DEFAULT_ANIMATION,
  TransitionAnimations,
  type TransitionAnimation,
  type Vocabulary
} from "./UITransition.types"

import transitionCSS from "./UITransition.css?inline"

/****************
 * ### `DOMTransitionElement`
 * The DOM element of `<ui-transition>`:  it adds Fomantic's behaviours as METHODS
 * (`show()`, `hide()`, `toggle()`, `transition()`),
 * since an attention animation (`shake`) has no state an attribute could carry.
 *
 * - Each resolves once its animation has run:  `true` when it finished,
 *   `false` when a later one interrupted it (`interrupt`), or when the element hasn't drawn yet.
 * - `show()` / `hide()` / `toggle()` write `visible` (so it reflects, and frameworks see it),
 *   which queues the animation;  `transition()` is Fomantic's `$(el).transition(name)`.
 * - NOTE: `transition`, not `animate`:  `Element.animate()` is the Web Animations API.
 * - Above the component:  its `elementSetup` reads this class while the component is defined.
 ****************/
export class DOMTransitionElement extends E.DOMElement {
  /** Animate in (the `animation` attribute's), then `ui-show`. */
  show(): Promise<boolean> {
    return this.uiTransition?.animateTo(true) ?? Promise.resolve(false)
  }

  /** Animate out, then `ui-hide`. */
  hide(): Promise<boolean> {
    return this.uiTransition?.animateTo(false) ?? Promise.resolve(false)
  }

  /** `show()` when hidden, else `hide()`. */
  toggle(): Promise<boolean> {
    return this.uiTransition?.toggle() ?? Promise.resolve(false)
  }

  /**
   * Run `animation` (Fomantic's name, `fade up`, or the runtime's, `fade-up`;  default the `animation` attribute's):
   * an attention one in place, an appear / disappear one toggling visibility.  Queued like every other.
   */
  transition(animation?: string): Promise<boolean> {
    return this.uiTransition?.transition(animation) ?? Promise.resolve(false)
  }

  /** Its component, once drawn (`transition` is taken:  the method above). */
  private get uiTransition(): UITransition | undefined {
    return this.component as UITransition | undefined
  }
}

/****************
 * ### `UITransition`
 * The component behind `<ui-transition>`:  shows, hides or shakes its content
 * with the animation catalogue (`animations.css`), through `UI.transitions`.
 * `<div class="ui … transition [visible] [animating]" part="transition"><slot>`.
 *
 * - The BOX animates, not the content:  its `hidden` attribute is what hides it
 *   (`UI.transitions` sets it after an `out`, removes it before an `in`),
 *   so hidden content is out of the page and the accessibility tree.
 *
 * - `visible` drives it:  a change queues an `in` / `out` of `animation`.
 *   - The DOM element's `show()` / `hide()` / `toggle()` / `transition(name)` do the same from script
 *     (`DOMTransitionElement`), and so do invoker commands
 *     (`UIT.TransitionCommands`:  `<button commandfor="id" command="--toggle">`).
 *   - First paint never animates.
 *
 * - A queue, as Fomantic's `queue: true`:  each animation waits for the one before it.
 *   The same animation twice in a row is dropped unless `allow-repeats`;
 *   `interrupt` makes a new one stop the running one instead.
 *
 * - `ui-show` / `ui-hide` once an `in` / `out` has run;  `ui-complete` after every animation.
 * - Reduced motion:  `UI.transitions` skips the motion (the end state at once), so the events still follow.
 ****************/
export class UITransition extends E.UIComponent<Vocabulary> {
  @E.proto static vocabulary = transitionVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { transition: transitionCSS },
    DOMElement: DOMTransitionElement,
    // a click on animated text must not jump focus to a link inside it
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  constructor(...args: ConstructorParameters<typeof E.UIComponent>) {
    super(...args)
    this.on("command", this.onCommand)
  }

  ////////////////
  // ## Visibility
  ////////////////

  /** Shown, or on its way in;  follows the queue, not the `visible` attribute.  `:state(visible)`. */
  @E.cssState("visible")
  @E.state
  accessor isShowing = untrack(() => !!this.visible)

  /** An animation is running.  `:state(animating)`. */
  @E.cssState("animating")
  @E.state
  accessor isAnimating = false

  /** Where the queue is heading:  visible once every queued step has run. */
  private willBeVisible = untrack(() => !!this.visible)

  /**
   * `visible` changed:  queue an `in` / `out`.
   * - Once rendered (`isReady`), as when the render created it:  only then can the box animate.
   */
  @E.onChange("visible", "isReady")
  protected onVisibleChanged(visible: boolean, isReady: boolean) {
    if (isReady && visible !== this.willBeVisible) void this.queueVisibility(visible, this.animationName)
  }

  /** Its state before the noun, the words Fomantic's script added:  `visible`, `animating`. */
  protected get extraClass(): string | undefined {
    const words = [this.isShowing ? UIT.VISIBLE : undefined, this.isAnimating ? UIT.ANIMATING : undefined]
    return words.filter(Boolean).join(" ") || undefined
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** The animated box. */
  private box?: HTMLDivElement

  render(): JSX.Element {
    // a server render (`$/ui/static`) never calls `ref`:  first paint's `hidden` as an attribute
    if (isServer)
      return (
        <div class={this.rootClass} part={this.partForName("transition")} hidden={!this.willBeVisible || undefined}>
          <slot />
        </div>
      )
    return (
      <div ref={(element) => this.attach(element)} class={this.rootClass} part={this.partForName("transition")}>
        <slot />
      </div>
    )
  }

  /** First paint:  hidden unless `visible`, with no animation. */
  private attach(box: HTMLDivElement) {
    this.box = box
    box.hidden = !this.willBeVisible
  }

  ////////////////
  // ## API (through `DOMTransitionElement`)
  ////////////////

  /** Animate to `visible`;  writes the DOM element's `visible` so it reflects. */
  animateTo(visible: boolean, animation = this.animationName): Promise<boolean> {
    const done = visible === this.willBeVisible ? this.lastDone() : this.queueVisibility(visible, animation)
    this.visible = visible
    return done
  }

  /** Flip visibility. */
  toggle(): Promise<boolean> {
    return this.animateTo(!this.willBeVisible)
  }

  /**
   * Run `animation` (default the `animation` attribute's):
   * an attention one in place, an appear / disappear one toggling visibility.
   * - Takes Fomantic's names (`fade up`) or the runtime's (`fade-up`);  an unknown one warns and resolves `false`.
   */
  transition(animation = this.animationName): Promise<boolean> {
    const name = UITransition.fomanticNameFor(animation)
    if (!name) {
      E.Warnings.warn(
        `<${this.domElement.localName}>.transition()`,
        `unknown animation ${JSON.stringify(animation)};  use one of Fomantic's names (\`fade up\`) or the ` +
          `runtime's (\`fade-up\`)`
      )
      return Promise.resolve(false)
    }
    if (UITransition.isAttention(name)) return this.enqueue(STATIC, name)
    return this.animateTo(!this.willBeVisible, name)
  }

  /** An invoker command aimed at the DOM element (`TransitionCommands`). */
  private readonly onCommand = (event: Event) => {
    const { command } = event as Event & { command: string }
    if (command === UIT.TransitionCommands.show) void this.animateTo(true)
    else if (command === UIT.TransitionCommands.close) void this.animateTo(false)
    else if (command === UIT.TransitionCommands.toggle) void this.toggle()
    else if (command === UIT.TransitionCommands.transition) void this.transition()
  }

  ////////////////
  // ## Queue
  ////////////////

  /** Steps waiting to run, in order. */
  private readonly queue: TransitionStep[] = []

  /** The step running now. */
  private runningStep?: TransitionStep

  /** Queue an `in` / `out` of `animation`, heading for `visible`. */
  private queueVisibility(visible: boolean, animation: string): Promise<boolean> {
    this.willBeVisible = visible
    return this.enqueue(visible ? UIT.IN : UIT.OUT, animation)
  }

  /**
   * Add a step, and start it when nothing runs (or at once with `interrupt`).
   * - The same animation the same way as the last queued (or running) step is dropped
   *   unless `allow-repeats`:  its promise is returned instead.
   */
  private enqueue(direction: E.AnimationDirection, animation: string): Promise<boolean> {
    const last = this.queue.at(-1) ?? this.runningStep
    const isRepeat = last?.animation === animation && last.direction === direction
    if (isRepeat && !untrack(() => this.allowRepeats)) return last.done
    const isInterrupting = untrack(() => !!this.interrupt)
    if (isInterrupting) for (const dropped of this.queue.splice(0)) dropped.resolve(false)
    let resolve!: (isCompleted: boolean) => void
    const done = new Promise<boolean>((settle) => (resolve = settle))
    this.queue.push({ direction, animation, done, resolve })
    if (!this.runningStep || isInterrupting) this.next()
    return done
  }

  /** Promise of the last queued (or running) step;  resolved `true` when idle. */
  private lastDone(): Promise<boolean> {
    return (this.queue.at(-1) ?? this.runningStep)?.done ?? Promise.resolve(true)
  }

  /** Start the next step, if any;  a step superseded (`interrupt`) resolves `false` and starts nothing. */
  private next() {
    const step = this.queue.shift()
    this.runningStep = step
    this.isAnimating = !!step
    if (!step) return
    if (step.direction === UIT.IN) this.isShowing = true
    void this.run(step).then((isCompleted) => {
      if (this.runningStep !== step) return step.resolve(false)
      if (step.direction === UIT.OUT) this.isShowing = false
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
    return UI.transitions.animate({ element: box, name, direction: step.direction, ...this.animateOptions })
  }

  /** `ui-show` / `ui-hide` after an `in` / `out`, then `ui-complete`. */
  private announce(step: TransitionStep) {
    const detail: UIT.TransitionDetail = {
      visible: step.direction === STATIC ? this.willBeVisible : step.direction === UIT.IN,
      animation: step.animation
    }
    if (step.direction === UIT.IN) this.send("ui-show", detail)
    else if (step.direction === UIT.OUT) this.send("ui-hide", detail)
    this.send("ui-complete", detail)
  }

  ////////////////
  // ## Settings
  ////////////////

  /** The `animation` attribute, untracked. */
  private get animationName(): string {
    return untrack(() => this.animation) ?? DEFAULT_ANIMATION
  }

  /** `duration` as `UI.transitions` takes it:  bare digits are ms. */
  private get animateOptions(): E.AnimateOptions {
    const duration = untrack(() => this.duration)?.trim()
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

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UITransition extends E.AttributeValues<Vocabulary> {}

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
