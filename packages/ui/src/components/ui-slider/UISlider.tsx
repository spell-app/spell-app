import { For, Repeat, Show, createEffect, createMemo, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"
import { onFormStateRestore } from "@spell-app/solid-element"

import { E, UI, UIT } from "$/ui/core"
import { F } from "$/ui/forms"
import { sliderVocabulary } from "./ui-slider.vocabulary.en"
import { SliderFallback } from "./ui-slider.fallback"
import { SliderScale } from "./SliderScale"
import { DEFAULT_MAX, DEFAULT_MIN, DEFAULT_STEP } from "./ui-slider.types"

import sliderCSS from "./ui-slider.css?inline"

/****************
 * ### `<ui-slider>`
 * A slider in Fomantic's markup:  `<div class="ui … slider" part="slider">` around `<div class="inner">` (track,
 * track fill, one or two `thumb`s) and, when `labeled` or `ticked`, `<ul class="auto labels">` (empty labels when only
 * `ticked`:  the sheet draws their ticks).  Labels come every `tick-step` (default `step`).
 * - Thumbs are APG sliders (`role=slider`, `aria-value*`, `aria-orientation`):  no native element has two thumbs or
 *   Fomantic's parts.  A `range`'s thumbs are "Minimum" / "Maximum" inside a `group` named for the host, and each
 *   bounds the other (`preventCrossover`).  The labels are `aria-hidden`:  the thumbs speak their values.
 * - Keys (on a thumb):  arrows step in the direction they point, as Fomantic's (so a `reversed` or `vertical`
 *   slider's arrows follow the thumb, not "right / up increases");  PageUp / PageDown take 2 steps (Fomantic's
 *   `pageMultiplier`);  Home / End go to the thumb's lowest / highest value.  Each key is `ui-input` then `ui-change`.
 * - Pointer:  pressing the track moves the nearest thumb there, dragging follows (pointer capture);  `ui-input` per
 *   new value, `ui-change` once when the drag ends somewhere new.  `smooth` lets the thumb glide between steps.
 * - `value` / `end` are auto-controlled (`Controlled`):  a handler of `ui-input` that re-sets them wins.  The
 *   ATTRIBUTES are the starting (and reset) values.
 * - Positions are CSS:  the element writes ratios (`--_slider-at` per thumb and label, `--_slider-from` /
 *   `--_slider-to` on the inner box) and `ui-slider.css` places everything, `reversed` / `vertical` included.
 * - Form:  `value`;  a `range` submits TWO entries under `name` (`FormData.getAll(name)` ~== `[value, end]`), per
 *   `FormElement`'s multi-value convention.  Restores a saved state (back / forward cache, autofill).
 ****************/
export class UISlider extends F.FormElement<typeof sliderVocabulary> {
  @E.proto static vocabulary = sliderVocabulary
  @E.proto static styles = { slider: sliderCSS }
  @E.proto static Fallback = SliderFallback

  /** `value`:  the host's property, else `min`. */
  readonly valueState = this.controlled("value", undefined)

  /** `end`:  the host's property, else `max`. */
  readonly endState = this.controlled("end", undefined)

  /** Host `<label>`s and `aria-label`, as the thumb's (or range group's) name. */
  readonly labels = new F.ControlLabels(this.formHost)

  /** Thumb being dragged, if any. */
  readonly dragging = new E.Cell<Thumb | undefined>(undefined)

  /** `smooth` drag:  where the dragged thumb is drawn, `0` ... `1`. */
  readonly glide = new E.Cell<number | undefined>(undefined)

  /** Length of the track in px, for label spacing;  `0` until measured. */
  readonly trackLength = new E.Cell(0)

  /** The number line. */
  readonly scale = createMemo(
    () =>
      new SliderScale({
        min: this.attrs.min ?? DEFAULT_MIN,
        max: this.attrs.max ?? DEFAULT_MAX,
        step: this.attrs.step ?? DEFAULT_STEP,
        tickStep: this.attrs.tickStep
      })
  )

  /** The inner box:  track, fill, thumbs. */
  private inner?: HTMLElement

  /** Values when the current drag began, to tell whether it changed anything. */
  private dragStart?: readonly [number, number]

  /** Thumb being dragged, for the handlers:  `dragging` is a microtask late (Solid's writes land on a flush). */
  private dragThumb?: Thumb

  constructor(...args: ConstructorParameters<typeof F.FormElement>) {
    super(...args)
    this.host.addEventListener("click", this.onHostClick)
    onFormStateRestore((state) => this.restore(state))
  }

  ////////////////
  // ## State
  ////////////////

  /** Two thumbs?  Tracked. */
  isRange(): boolean {
    return this.attrs.range
  }

  /** The (first) thumb's value, snapped, and at most `end()` in a range;  tracked. */
  value(): number {
    const scale = this.scale()
    const value = scale.snap(Number(this.valueState.get() ?? scale.min))
    return this.isRange() ? Math.min(value, this.end()) : value
  }

  /** A range's second thumb's value, snapped;  `max` for a single thumb;  tracked. */
  end(): number {
    const scale = this.scale()
    return scale.snap(Number(this.endState.get() ?? scale.max))
  }

  /** Value of `thumb`;  tracked. */
  thumbValue(thumb: Thumb): number {
    return thumb === SECOND ? this.end() : this.value()
  }

  /** Lowest / highest value `thumb` may take:  a range's thumbs bound each other;  tracked. */
  bounds(thumb: Thumb): readonly [number, number] {
    const { min, max } = this.scale()
    if (!this.isRange()) return [min, max]
    return thumb === SECOND ? [this.value(), max] : [min, this.end()]
  }

  isDisabled(): boolean {
    return this.attrs.disabled || this.isFormDisabled.get()
  }

  /** Can a person change it?  Tracked. */
  isInteractive(): boolean {
    return !this.isDisabled() && !this.attrs.readonly
  }

  /** Text for `value`:  its `step-labels` entry, else the number in the page's format. */
  valueText(value: number): string {
    const labels = this.attrs.stepLabels
    const scale = this.scale()
    if (Array.isArray(labels)) {
      const label: unknown = labels[Math.round((value - scale.min) / (scale.step || 1))]
      if (typeof label === "string" || typeof label === "number") return String(label)
    }
    return UI.i18n.formatNumber(value)
  }

  protected classValue(name: E.AttributeName<typeof sliderVocabulary>): unknown {
    if (name === "disabled") return this.isDisabled()
    return super.classValue(name)
  }

  protected hostStates() {
    return { disabled: this.isDisabled(), dragging: this.dragging.get() !== undefined }
  }

  ////////////////
  // ## Form
  ////////////////

  formValue(): E.FieldValue {
    return this.isRange() ? [String(this.value()), String(this.end())] : String(this.value())
  }

  protected formName(): string | undefined {
    return this.attrs.name
  }

  /** Back to the `value` / `end` ATTRIBUTES. */
  formReset() {
    this.valueState.set(E.Converters.number(this.host.getAttribute(this.attributeName("value"))) as never)
    this.endState.set(E.Converters.number(this.host.getAttribute(this.attributeName("end"))) as never)
  }

  /** A saved state:  one value, or a range's two entries.  `null`:  the fork's callback, a platform boundary. */
  private restore(state: File | string | FormData | null) {
    const values =
      state instanceof FormData ? [...state.values()].map(String) : typeof state === "string" ? [state] : []
    if (values[0] !== undefined) this.valueState.set(Number(values[0]) as never)
    if (values[1] !== undefined) this.endState.set(Number(values[1]) as never)
  }

  /** Localized attribute name of canonical `name`. */
  private attributeName(name: E.AttributeName<typeof sliderVocabulary>): string {
    return this.definition.attribute(name).attribute
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** Adds the track measurement (label spacing) and label refresh on connect. */
  mount(): JSX.Element {
    createEffect(
      () => !!this.attrs.labeled,
      (labeled) => {
        if (!labeled) return
        const observer = new ResizeObserver(() => this.measure())
        observer.observe(this.host)
        return () => observer.disconnect()
      }
    )
    createEffect(
      () => this.isConnected.get(),
      (connected) => {
        if (connected) this.labels.refresh()
      }
    )
    return super.mount()
  }

  /**
   * Track length from the HOST's box (always there, unlike the inner box before the first render):  its size less
   * the slider's padding and a thumb, read from the rendered root when there is one.
   */
  private measure() {
    const vertical = untrack(() => this.attrs.vertical)
    const inner = this.inner
    const length = inner?.isConnected
      ? vertical
        ? inner.clientHeight
        : inner.clientWidth
      : vertical
        ? this.host.clientHeight
        : this.host.clientWidth
    this.trackLength.set(length)
  }

  /**
   * The inner box's inline tokens:  the selected range's two ends, as ratios.
   * - A method, not an inline object:  Solid's server compile (rc.11) drops the `;` between an inline style
   *   object's COMPUTED keys (`--a:1px--b:2`), and the browser then ignores both.
   */
  private innerStyle(): Record<string, string> {
    return { [FROM]: String(this.ratio(FIRST, { isFill: true })), [TO]: String(this.ratio(SECOND, { isFill: true })) }
  }

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("slider")}>
        <div
          ref={(element) => (this.inner = element)}
          class={INNER}
          role={this.isRange() ? UIT.GROUP : undefined}
          aria-label={this.isRange() ? this.labels.name() : undefined}
          style={this.innerStyle()}
          {...this.staticMark(UIT.GROUP)}
          onPointerDown={this.onPointerDown}
          onPointerMove={this.onPointerMove}
          onPointerUp={this.onPointerUp}
          onPointerCancel={this.onPointerUp}
        >
          <div class={TRACK} part={this.part("track")} />
          <div class={TRACK_FILL} part={this.part("track-fill")} />
          {this.thumb(FIRST)}
          <Show when={this.isRange()}>{this.thumb(SECOND)}</Show>
        </div>
        <Show when={this.attrs.labeled || this.attrs.ticked}>
          <ul class={LABELS} part={this.part("labels")} aria-hidden={UIT.TRUE}>
            <Repeat count={this.scale().intervals + 1}>{(index) => this.label(index)}</Repeat>
          </ul>
        </Show>
        {isServer && this.staticValues()}
      </div>
    )
  }

  /**
   * Where `thumb` is drawn, `0` ... `1`:  its value's ratio, or the pointer while gliding (`smooth`).
   * - `isFill`:  an end of the track fill instead, where a single thumb's fill starts at `0`.
   */
  private ratio(thumb: Thumb, { isFill = false }: { isFill?: boolean } = {}): number {
    if (isFill && thumb === FIRST && !this.isRange()) return 0
    if (isFill && thumb === SECOND && !this.isRange()) thumb = FIRST
    const glide = this.glide.get()
    if (glide !== undefined && this.dragging.get() === thumb) return glide
    return this.scale().ratio(this.thumbValue(thumb))
  }

  /** Thumb `thumb`:  an APG slider. */
  private thumb(thumb: Thumb): JSX.Element {
    return (
      <div
        class={thumb === SECOND ? SECOND_THUMB : THUMB}
        part={this.part("thumb")}
        role={SLIDER}
        tabindex={this.isDisabled() ? undefined : 0}
        style={{ [AT]: String(this.ratio(thumb)) }}
        aria-valuemin={this.bounds(thumb)[0]}
        aria-valuemax={this.bounds(thumb)[1]}
        aria-valuenow={this.thumbValue(thumb)}
        aria-valuetext={this.valueText(this.thumbValue(thumb))}
        aria-label={this.thumbName(thumb)}
        aria-orientation={this.attrs.vertical ? UIT.VERTICAL : undefined}
        aria-disabled={this.isDisabled() ? UIT.TRUE : undefined}
        aria-readonly={this.attrs.readonly ? UIT.TRUE : undefined}
        {...this.staticMark(thumb)}
        onKeyDown={(event) => this.onKeyDown(thumb, event)}
      />
    )
  }

  /**
   * Server render only (`$/ui/static`):  the `STATIC_CONTROL` mark on `target` when the host's name belongs to it --
   * a single slider's thumb, a range's group;  `{}` in a browser.
   */
  private staticMark(target: Thumb | typeof UIT.GROUP): Record<string, unknown> {
    if (!isServer) return {}
    const isNamed = target === UIT.GROUP ? this.isRange() : target === FIRST && !this.isRange()
    return isNamed ? { [UIT.STATIC_CONTROL]: "" } : {}
  }

  /**
   * Server render only (`$/ui/static`):  the value as hidden inputs (two for a `range`), so a static form submits
   * it without JS;  in a browser the HOST submits (`ElementInternals`).
   */
  private staticValues(): JSX.Element {
    const name = this.attrs.name
    if (!name) return undefined
    const value = this.formValue()
    return (
      <For each={Array.isArray(value) ? value : [value]} keyed={false}>
        {(each) => <input type={HIDDEN} name={name} value={String(each())} disabled={this.isDisabled()} />}
      </For>
    )
  }

  /** A single thumb is named for the host;  a range's are "Minimum" / "Maximum" (the group has the host's name). */
  private thumbName(thumb: Thumb): string | undefined {
    if (!this.isRange()) return this.labels.name()
    return this.text(thumb === SECOND ? "sliderMaximum" : "sliderMinimum")
  }

  /**
   * Step label `index`:  its text (or a half tick, where labels would crowd), at its ratio.
   * - `ticked` without `labeled`:  an empty label, every one full (no text to crowd);  the sheet draws its tick.
   */
  private label(index: number): JSX.Element {
    const scale = () => this.scale()
    const value = () => scale().labelValue(index)
    const full = () =>
      !this.attrs.labeled ||
      index % scale().gap(this.trackLength.get(), LABEL_DISTANCE) === 0 ||
      index === scale().intervals
    return (
      <li
        class={full() ? UIT.LABEL : HALF_TICK_LABEL}
        part={this.part("label")}
        style={{ [AT]: String(scale().ratio(value())) }}
      >
        {full() && this.attrs.labeled ? this.valueText(value()) : ""}
      </li>
    )
  }

  ////////////////
  // ## Changes
  ////////////////

  /**
   * Move `thumb` to `value` (within its bounds) as a person would:  `ui-input` first, then the host property, unless a
   * handler re-set it.  Returns true when the value changed.
   */
  private move(thumb: Thumb, value: number, originalEvent: Event): boolean {
    const [low, high] = untrack(() => this.bounds(thumb))
    const next = Math.min(high, Math.max(low, value))
    if (next === untrack(() => this.thumbValue(thumb))) return false
    const state = thumb === SECOND ? this.endState : this.valueState
    return state.request(next as never, () => this.emit("ui-input", this.detail(thumb, next, originalEvent)))
  }

  /** Event detail with `thumb` at `next`:  `{ value, end?, originalEvent }`. */
  private detail(thumb: Thumb | undefined, next: number | undefined, originalEvent: Event) {
    const value = thumb === FIRST && next !== undefined ? next : untrack(() => this.value())
    if (!untrack(() => this.isRange())) return { value, originalEvent }
    const end = thumb === SECOND && next !== undefined ? next : untrack(() => this.end())
    return { value, end, originalEvent }
  }

  ////////////////
  // ## Handlers
  ////////////////

  /** Keys on a thumb, see the class doc. */
  private onKeyDown(thumb: Thumb, event: KeyboardEvent) {
    const scale = untrack(() => this.scale())
    const current = untrack(() => this.thumbValue(thumb))
    let next: number | undefined
    const steps = this.keySteps(event.key)
    if (steps) next = scale.move(current, steps)
    else if (event.key === UIT.Key.home) next = untrack(() => this.bounds(thumb))[0]
    else if (event.key === UIT.Key.end) next = untrack(() => this.bounds(thumb))[1]
    if (next === undefined) return
    event.preventDefault()
    if (!untrack(() => this.isInteractive())) return
    const value = next
    if (this.move(thumb, value, event)) this.emit("ui-change", this.detail(thumb, value, event))
  }

  /** Steps key `key` takes:  arrows the way they point (Fomantic's `keyMovement`), pages 2;  `0` for other keys. */
  private keySteps(key: string): number {
    const { vertical, reversed } = untrack(() => this.attrs)
    // the value grows downward on a vertical slider (min at the top) and leftward on a reversed horizontal one
    const { arrowUp, arrowDown, arrowLeft, arrowRight, pageUp, pageDown } = UIT.Key
    const grows = vertical ? (reversed ? arrowUp : arrowDown) : reversed ? arrowLeft : arrowRight
    const shrinks = vertical ? (reversed ? arrowDown : arrowUp) : reversed ? arrowRight : arrowLeft
    if (key === grows || (!vertical && key === arrowUp) || (vertical && key === arrowRight)) return 1
    if (key === shrinks || (!vertical && key === arrowDown) || (vertical && key === arrowLeft)) return -1
    if (key === pageUp) return PAGE_MULTIPLIER
    if (key === pageDown) return -PAGE_MULTIPLIER
    return 0
  }

  /** Press on the track or a thumb:  that thumb (else the nearest) jumps to the pointer and is dragged. */
  private readonly onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 || !untrack(() => this.isInteractive()) || !this.inner) return
    event.preventDefault()
    const ratio = this.pointerRatio(event)
    // the pressed element itself:  delegated handlers may see a retargeted `event.target`
    const target = (event.composedPath()[0] as Element).closest?.(THUMB_SELECTOR)
    const thumb = target ? (target.classList.contains(SECOND_CLASS) ? SECOND : FIRST) : this.nearest(ratio)
    this.capture(event.pointerId)
    this.dragStart = untrack(() => [this.value(), this.end()] as const)
    this.dragThumb = thumb
    this.dragging.set(thumb)
    this.inner.querySelectorAll<HTMLElement>(THUMB_SELECTOR)[thumb]?.focus()
    if (!target) this.drag(thumb, ratio, event)
  }

  /** Drag:  follow the pointer. */
  private readonly onPointerMove = (event: PointerEvent) => {
    const thumb = this.dragThumb
    if (thumb === undefined) return
    this.drag(thumb, this.pointerRatio(event), event)
  }

  /** Release:  `ui-change` when the drag moved anything. */
  private readonly onPointerUp = (event: PointerEvent) => {
    if (this.dragThumb === undefined) return
    this.dragThumb = undefined
    if (this.inner?.hasPointerCapture(event.pointerId)) this.inner.releasePointerCapture(event.pointerId)
    this.dragging.set(undefined)
    this.glide.set(undefined)
    const [value, end] = this.dragStart ?? []
    this.dragStart = undefined
    queueMicrotask(() => {
      if (untrack(() => this.value()) !== value || untrack(() => this.end()) !== end) {
        this.emit("ui-change", this.detail(undefined, undefined, event))
      }
    })
  }

  /**
   * Route pointer `id`'s moves to the inner box until release.
   * - A pointer with no pressed button (a synthetic event) can't be captured:  moves then only arrive while over it.
   */
  private capture(id: number) {
    try {
      this.inner?.setPointerCapture(id)
    } catch {
      // not an active pointer
    }
  }

  /** Move `thumb` to the value at `ratio`;  a `smooth` slider draws it at the pointer meanwhile. */
  private drag(thumb: Thumb, ratio: number, event: Event) {
    const scale = untrack(() => this.scale())
    if (untrack(() => this.attrs.smooth)) {
      const [low, high] = untrack(() => this.bounds(thumb))
      this.glide.set(Math.min(scale.ratio(high), Math.max(scale.ratio(low), ratio)))
    }
    this.move(thumb, scale.valueAt(ratio), event)
  }

  /** The pointer's position along the track, `0` (min) ... `1` (max). */
  private pointerRatio(event: PointerEvent): number {
    const inner = this.inner!
    const box = inner.getBoundingClientRect()
    const thumb = inner.querySelector<HTMLElement>(THUMB_SELECTOR)
    const { vertical, reversed } = untrack(() => this.attrs)
    const size = vertical ? (thumb?.offsetHeight ?? 0) : (thumb?.offsetWidth ?? 0)
    const length = (vertical ? box.height : box.width) - size
    const offset = (vertical ? event.clientY - box.top : event.clientX - box.left) - size / 2
    const ratio = length > 0 ? Math.min(1, Math.max(0, offset / length)) : 0
    return reversed ? 1 - ratio : ratio
  }

  /** The thumb nearest `ratio`;  a tie goes to the one that can move that way. */
  private nearest(ratio: number): Thumb {
    if (!untrack(() => this.isRange())) return FIRST
    const scale = untrack(() => this.scale())
    const first = Math.abs(ratio - scale.ratio(untrack(() => this.value())))
    const second = Math.abs(ratio - scale.ratio(untrack(() => this.end())))
    if (first === second) return ratio > scale.ratio(untrack(() => this.value())) ? SECOND : FIRST
    return first < second ? FIRST : SECOND
  }

  /** A click aimed at the HOST itself (its `<label for>`) focuses the first thumb. */
  private readonly onHostClick = (event: MouseEvent) => {
    if (event.composedPath()[0] !== this.host || this.isDisabled()) return
    this.inner?.querySelector<HTMLElement>(THUMB_SELECTOR)?.focus()
  }
}

/** A thumb:  the first (`value`) or, in a range, the second (`end`);  also its index among the thumbs. */
type Thumb = 0 | 1

/** The first thumb. */
const FIRST: Thumb = 0

/** A range's second thumb. */
const SECOND: Thumb = 1

/** Fomantic's `labelDistance`:  least px between full labels. */
const LABEL_DISTANCE = 100

/** Fomantic's `pageMultiplier`:  steps per PageUp / PageDown. */
const PAGE_MULTIPLIER = 2

/** Class of the inner box:  track, fill, thumbs. */
const INNER = "inner"

/** Class of the track. */
const TRACK = "track"

/** Class of the track's selected stretch. */
const TRACK_FILL = "track-fill"

/** Class of a thumb. */
const THUMB = "thumb"

/** A thumb, as a selector. */
const THUMB_SELECTOR = `.${THUMB}`

/** Class word of a range's second thumb. */
const SECOND_CLASS = "second"

/** Classes of a range's second thumb. */
const SECOND_THUMB = `${SECOND_CLASS} ${THUMB}`

/** Classes of the labels' list. */
const LABELS = "auto labels"

/** Classes of a label too crowded to show in full:  a half tick. */
const HALF_TICK_LABEL = "halftick label"

/** Custom property `ui-slider.css` places a thumb or label by:  its ratio along the track. */
const AT = "--_slider-at"

/** Custom property of the fill's start ratio. */
const FROM = "--_slider-from"

/** Custom property of the fill's end ratio. */
const TO = "--_slider-to"

/** Role of a thumb. */
const SLIDER = "slider"

/** `type` of the inputs carrying the value in a static server render. */
const HIDDEN = "hidden"
