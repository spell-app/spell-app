import { For, Repeat, Show, createEffect, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { F } from "$/ui/forms"
import { sliderVocabulary } from "./UISlider.en"
import { SliderFallback } from "./UISlider.fallback"
import { SliderScale } from "./SliderScale"
import { DEFAULT_MAX, DEFAULT_MIN, DEFAULT_STEP } from "./UISlider.types"

import sliderCSS from "./UISlider.css?inline"

/****************
 * ### `UISlider`
 * The component behind `<ui-slider>`:  a slider, to choose a number (or, with `range`, two) by dragging a thumb.
 *
 * - Its shadow DOM, in Fomantic's markup:
 *   `<div class="ui … slider" part="slider">` around `<div class="inner">` (the track, its fill, one or two `thumb`s)
 *   and, when `labeled` or `ticked`, `<ul class="auto labels">` (empty labels when only `ticked`:
 *   the sheet draws their ticks).  Labels come every `tick-step` (default `step`).
 *
 * - The thumbs are APG sliders (`role=slider`, `aria-value*`, `aria-orientation`):
 *   no native element has two thumbs, or Fomantic's parts.
 *   A `range`'s thumbs are "Minimum" / "Maximum", inside a `group` named for the DOM element,
 *   and each bounds the other (`preventCrossover`).
 *   The labels are `aria-hidden`:  the thumbs speak their values.
 *
 * - Keys (on a thumb):
 *   - arrows step in the direction they point,
 *     as Fomantic's (so a `reversed` or `vertical` slider's arrows follow the thumb, not "right / up increases")
 *   - PageUp / PageDown take 2 steps (Fomantic's `pageMultiplier`)
 *   - Home / End go to the thumb's lowest / highest value
 *   - each key sends `ui-input`, then `ui-change`.
 * - Pointer:  pressing the track moves the nearest thumb there, and dragging follows (pointer capture);
 *   `ui-input` for each new value, `ui-change` once when the drag ends somewhere new.
 *   `smooth` lets the thumb glide between steps.
 *
 * - `value` / `end` are controlled (`@controlled`):  a `ui-input` handler that sets them again wins.
 *   The ATTRIBUTES are the starting (and reset) values.
 * - Positions are CSS:  the component writes ratios (`--_slider-at` per thumb and label,
 *   `--_slider-from` / `--_slider-to` on the inner box), and `UISlider.css` places everything,
 *   `reversed` / `vertical` included.
 * - A form control:  it submits `value`;  a `range` submits TWO entries under `name`
 *   (`FormData.getAll(name)` ~== `[value, end]`), per `FormComponent`'s multi-value convention.
 *   It restores a saved state (back / forward cache, autofill).
 ****************/
export class UISlider extends F.FormComponent<typeof sliderVocabulary> {
  @E.proto static vocabulary = sliderVocabulary
  @E.proto static styleSheets = { slider: sliderCSS }
  @E.proto static elementSetup = { Fallback: SliderFallback } satisfies Partial<E.ElementSetup>

  /** The DOM element's `<label>`s and `aria-label`, as the thumb's (or range group's) name. */
  readonly labels = new F.ControlLabels(this.domFormElement)

  /** The inner box:  track, fill, thumbs. */
  private inner?: HTMLElement

  constructor(...args: ConstructorParameters<typeof F.FormComponent>) {
    super(...args)
    this.domElement.addEventListener("click", this.onDOMElementClick)
  }

  ////////////////
  // ## Values
  ////////////////

  /** `value`:  set by the page, or moved;  `min` until either. */
  @E.controlled("value") accessor value: number | undefined = undefined

  /** `end`:  set by the page, or moved;  `max` until either. */
  @E.controlled("end") accessor end: number | undefined = undefined

  /** The number line. */
  @E.derived
  get scale(): SliderScale {
    return new SliderScale({
      min: this.min ?? DEFAULT_MIN,
      max: this.max ?? DEFAULT_MAX,
      step: this.step ?? DEFAULT_STEP,
      tickStep: this.tickStep
    })
  }

  /** The (first) thumb's value, snapped, and at most `snappedEnd` in a range. */
  get snappedValue(): number {
    const scale = this.scale
    const value = scale.snap(Number(this.value ?? scale.min))
    return this.range ? Math.min(value, this.snappedEnd) : value
  }

  /** A range's second thumb's value, snapped;  `max` for a single thumb. */
  get snappedEnd(): number {
    const scale = this.scale
    return scale.snap(Number(this.end ?? scale.max))
  }

  /** Value of `thumb`;  tracked. */
  thumbValue(thumb: Thumb): number {
    return thumb === SECOND ? this.snappedEnd : this.snappedValue
  }

  /** Lowest / highest value `thumb` may take:  a range's thumbs bound each other;  tracked. */
  bounds(thumb: Thumb): readonly [number, number] {
    const { min, max } = this.scale
    if (!this.range) return [min, max]
    return thumb === SECOND ? [this.snappedValue, max] : [min, this.snappedEnd]
  }

  /** Text for `value`:  its `step-labels` entry, else the number in the page's format. */
  valueText(value: number): string {
    const labels = this.stepLabels
    const scale = this.scale
    if (Array.isArray(labels)) {
      const label: unknown = labels[Math.round((value - scale.min) / (scale.step || 1))]
      if (typeof label === "string" || typeof label === "number") return String(label)
    }
    return UI.i18n.formatNumber(value)
  }

  /**
   * Move `thumb` to `value` (within its bounds) as a person would:  send `ui-input`,
   * then set the DOM element's property, unless a handler set it first.
   * - Returns true when the value changed.
   */
  private move(thumb: Thumb, value: number, originalEvent: Event): boolean {
    const [low, high] = untrack(() => this.bounds(thumb))
    const next = Math.min(high, Math.max(low, value))
    if (next === untrack(() => this.thumbValue(thumb))) return false
    return this.requestChange(thumb === SECOND ? "end" : "value", next, () =>
      this.send("ui-input", this.detail(thumb, next, originalEvent))
    )
  }

  /** Event detail with `thumb` at `next`:  `{ value, end?, originalEvent }`. */
  private detail(thumb: Thumb | undefined, next: number | undefined, originalEvent: Event) {
    const value = thumb === FIRST && next !== undefined ? next : untrack(() => this.snappedValue)
    if (!untrack(() => this.range)) return { value, originalEvent }
    const end = thumb === SECOND && next !== undefined ? next : untrack(() => this.snappedEnd)
    return { value, end, originalEvent }
  }

  ////////////////
  // ## Disabled
  ////////////////

  /** Disabled by its attribute, or by a disabled fieldset. */
  @E.cssState("disabled")
  get isDisabled(): boolean {
    return this.disabled || this.formIsDisabled
  }

  /** Can a person change it? */
  get isInteractive(): boolean {
    return !this.isDisabled && !this.readonly
  }

  protected classValue(name: E.AttributeName<typeof sliderVocabulary>): unknown {
    if (name === "disabled") return this.isDisabled
    return super.classValue(name)
  }

  ////////////////
  // ## Form
  ////////////////

  get formValue(): E.FieldValue {
    return this.range ? [String(this.snappedValue), String(this.snappedEnd)] : String(this.snappedValue)
  }

  protected get formName(): string | undefined {
    return this.name
  }

  /** Back to the `value` / `end` ATTRIBUTES. */
  onFormReset() {
    this.value = E.Converters.number(this.attributes.value)
    this.end = E.Converters.number(this.attributes.end)
  }

  /** A saved state:  one value, or a range's two entries.  `null`:  DOM API `formStateRestoreCallback()`'s. */
  onFormStateRestore(state: File | string | FormData | null) {
    const values =
      state instanceof FormData ? [...state.values()].map(String) : typeof state === "string" ? [state] : []
    if (values[0] !== undefined) this.value = Number(values[0])
    if (values[1] !== undefined) this.end = Number(values[1])
  }

  ////////////////
  // ## Track and labels
  ////////////////

  /** The length of the track in px, for label spacing;  `0` until measured. */
  @E.state accessor trackLength = 0

  /** Adds the track measurement (label spacing) while `labeled`. */
  onMount(): JSX.Element {
    createEffect(
      () => !!this.labeled,
      (labeled) => {
        if (!labeled) return
        const observer = new ResizeObserver(() => this.measure())
        observer.observe(this.domElement)
        return () => observer.disconnect()
      }
    )
    return super.onMount()
  }

  /** Connected:  read the name from the DOM element's labels again. */
  @E.onChange("isConnected")
  protected onConnectedChanged(isConnected: boolean) {
    if (isConnected) this.labels.refresh()
  }

  /**
   * Track length from the DOM element's box (always there, unlike the inner box before the first render):
   * its size less the slider's padding and a thumb, read from the rendered root when there is one.
   */
  private measure() {
    const vertical = untrack(() => this.vertical)
    const inner = this.inner
    const length = inner?.isConnected
      ? vertical
        ? inner.clientHeight
        : inner.clientWidth
      : vertical
        ? this.domElement.clientHeight
        : this.domElement.clientWidth
    this.trackLength = length
  }

  ////////////////
  // ## Rendering
  ////////////////

  /**
   * The inner box's inline tokens:  the selected range's two ends, as ratios.
   * - A getter, not an inline object:  Solid's server compile (rc.11) drops the `;` between an inline style
   *   object's COMPUTED keys (`--a:1px--b:2`), and the browser then ignores both.
   */
  private get innerStyle(): Record<string, string> {
    return { [FROM]: String(this.ratio(FIRST, { isFill: true })), [TO]: String(this.ratio(SECOND, { isFill: true })) }
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("slider")}>
        <div
          ref={(element) => (this.inner = element)}
          class={INNER}
          role={this.range ? "group" : undefined}
          aria-label={this.range ? this.labels.accessibleName : undefined}
          style={this.innerStyle}
          {...this.staticMark("group")}
          onPointerDown={this.onPointerDown}
          onPointerMove={this.onPointerMove}
          onPointerUp={this.onPointerUp}
          onPointerCancel={this.onPointerUp}
        >
          <div class={TRACK} part={this.partForName("track")} />
          <div class={TRACK_FILL} part={this.partForName("track-fill")} />
          {this.thumb(FIRST)}
          <Show when={this.range}>{this.thumb(SECOND)}</Show>
        </div>
        <Show when={this.labeled || this.ticked}>
          <ul class={LABELS} part={this.partForName("labels")} aria-hidden="true">
            <Repeat count={this.scale.intervals + 1}>{(index) => this.label(index)}</Repeat>
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
    if (isFill && thumb === FIRST && !this.range) return 0
    if (isFill && thumb === SECOND && !this.range) thumb = FIRST
    const glideRatio = this.glideRatio
    if (glideRatio !== undefined && this.draggedThumb === thumb) return glideRatio
    return this.scale.ratio(this.thumbValue(thumb))
  }

  /** Thumb `thumb`:  an APG slider. */
  private thumb(thumb: Thumb): JSX.Element {
    return (
      <div
        class={thumb === SECOND ? SECOND_THUMB : THUMB}
        part={this.partForName("thumb")}
        role="slider"
        tabindex={this.isDisabled ? undefined : 0}
        style={{ [AT]: String(this.ratio(thumb)) }}
        aria-valuemin={this.bounds(thumb)[0]}
        aria-valuemax={this.bounds(thumb)[1]}
        aria-valuenow={this.thumbValue(thumb)}
        aria-valuetext={this.valueText(this.thumbValue(thumb))}
        aria-label={this.thumbName(thumb)}
        aria-orientation={this.vertical ? "vertical" : undefined}
        aria-disabled={this.isDisabled ? "true" : undefined}
        aria-readonly={this.readonly ? "true" : undefined}
        {...this.staticMark(thumb)}
        onKeyDown={(event) => this.onKeyDown(thumb, event)}
      />
    )
  }

  /**
   * Server render only (`$/ui/static`):  the `STATIC_CONTROL` mark on `target`,
   * when the DOM element's name belongs to it (a single slider's thumb, a range's group);  `{}` in a browser.
   */
  private staticMark(target: Thumb | "group"): Record<string, unknown> {
    if (!isServer) return {}
    const isNamed = target === "group" ? this.range : target === FIRST && !this.range
    return isNamed ? { [UIT.STATIC_CONTROL]: "" } : {}
  }

  /**
   * Server render only (`$/ui/static`):  the value as hidden inputs (two for a `range`),
   * so a static form submits it without script;  in a browser the DOM element submits (`ElementInternals`).
   */
  private staticValues(): JSX.Element {
    const name = this.name
    if (!name) return undefined
    const value = this.formValue
    return (
      <For each={Array.isArray(value) ? value : [value]} keyed={false}>
        {(each) => <input type="hidden" name={name} value={String(each())} disabled={this.isDisabled} />}
      </For>
    )
  }

  /**
   * A single thumb is named for the DOM element;
   * a range's are "Minimum" / "Maximum" (the group has the DOM element's name).
   */
  private thumbName(thumb: Thumb): string | undefined {
    if (!this.range) return this.labels.accessibleName
    return this.translationForKey(thumb === SECOND ? "sliderMaximum" : "sliderMinimum")
  }

  /**
   * Step label `index`:  its text (or a half tick, where labels would crowd), at its ratio.
   * - `ticked` without `labeled`:  an empty label, every one full (no text to crowd);  the sheet draws its tick.
   */
  private label(index: number): JSX.Element {
    const scale = () => this.scale
    const value = () => scale().labelValue(index)
    const full = () =>
      !this.labeled || index % scale().gap(this.trackLength, LABEL_DISTANCE) === 0 || index === scale().intervals
    return (
      <li
        class={full() ? UIT.LABEL : HALF_TICK_LABEL}
        part={this.partForName("label")}
        style={{ [AT]: String(scale().ratio(value())) }}
      >
        {full() && this.labeled ? this.valueText(value()) : ""}
      </li>
    )
  }

  ////////////////
  // ## Dragging
  ////////////////

  /** Thumb being dragged, if any. */
  @E.state accessor draggedThumb: Thumb | undefined = undefined

  /** A thumb is being dragged. */
  @E.cssState("dragging")
  get isDragging(): boolean {
    return this.draggedThumb !== undefined
  }

  /** `smooth` drag:  where the dragged thumb is drawn, `0` ... `1`. */
  @E.state accessor glideRatio: number | undefined = undefined

  /** Values when the current drag began, to tell whether it changed anything. */
  private valuesAtDragStart?: readonly [number, number]

  /** Press on the track or a thumb:  that thumb (else the nearest) jumps to the pointer and is dragged. */
  private readonly onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 || !untrack(() => this.isInteractive) || !this.inner) return
    event.preventDefault()
    const ratio = this.pointerRatio(event)
    // the pressed element itself:  delegated handlers may see a retargeted `event.target`
    const target = (event.composedPath()[0] as Element).closest?.(THUMB_SELECTOR)
    const thumb = target ? (target.classList.contains(SECOND_CLASS) ? SECOND : FIRST) : this.nearest(ratio)
    this.capture(event.pointerId)
    this.valuesAtDragStart = untrack(() => [this.snappedValue, this.snappedEnd] as const)
    this.draggedThumb = thumb
    this.inner.querySelectorAll<HTMLElement>(THUMB_SELECTOR)[thumb]?.focus()
    if (!target) this.drag(thumb, ratio, event)
  }

  /** Drag:  follow the pointer. */
  private readonly onPointerMove = (event: PointerEvent) => {
    const thumb = this.draggedThumb
    if (thumb === undefined) return
    this.drag(thumb, this.pointerRatio(event), event)
  }

  /** Release:  `ui-change` when the drag moved anything. */
  private readonly onPointerUp = (event: PointerEvent) => {
    if (this.draggedThumb === undefined) return
    this.draggedThumb = undefined
    if (this.inner?.hasPointerCapture(event.pointerId)) this.inner.releasePointerCapture(event.pointerId)
    this.glideRatio = undefined
    const [value, end] = this.valuesAtDragStart ?? []
    this.valuesAtDragStart = undefined
    E.afterSolidUpdate(() => {
      if (untrack(() => this.snappedValue) !== value || untrack(() => this.snappedEnd) !== end) {
        this.send("ui-change", this.detail(undefined, undefined, event))
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
    const scale = untrack(() => this.scale)
    if (untrack(() => this.smooth)) {
      const [low, high] = untrack(() => this.bounds(thumb))
      this.glideRatio = Math.min(scale.ratio(high), Math.max(scale.ratio(low), ratio))
    }
    this.move(thumb, scale.valueAt(ratio), event)
  }

  /** The pointer's position along the track, `0` (min) ... `1` (max). */
  private pointerRatio(event: PointerEvent): number {
    const inner = this.inner!
    const box = inner.getBoundingClientRect()
    const thumb = inner.querySelector<HTMLElement>(THUMB_SELECTOR)
    const [vertical, reversed] = untrack(() => [this.vertical, this.reversed])
    const size = vertical ? (thumb?.offsetHeight ?? 0) : (thumb?.offsetWidth ?? 0)
    const length = (vertical ? box.height : box.width) - size
    const offset = (vertical ? event.clientY - box.top : event.clientX - box.left) - size / 2
    const ratio = length > 0 ? Math.min(1, Math.max(0, offset / length)) : 0
    return reversed ? 1 - ratio : ratio
  }

  /** The thumb nearest `ratio`;  a tie goes to the one that can move that way. */
  private nearest(ratio: number): Thumb {
    if (!untrack(() => this.range)) return FIRST
    const scale = untrack(() => this.scale)
    const first = Math.abs(ratio - scale.ratio(untrack(() => this.snappedValue)))
    const second = Math.abs(ratio - scale.ratio(untrack(() => this.snappedEnd)))
    if (first === second) return ratio > scale.ratio(untrack(() => this.snappedValue)) ? SECOND : FIRST
    return first < second ? FIRST : SECOND
  }

  ////////////////
  // ## Keys and clicks
  ////////////////

  /** Keys on a thumb, see the class doc. */
  private onKeyDown(thumb: Thumb, event: KeyboardEvent) {
    const scale = untrack(() => this.scale)
    const current = untrack(() => this.thumbValue(thumb))
    let next: number | undefined
    const steps = this.keySteps(event.key)
    if (steps) next = scale.move(current, steps)
    else if (event.key === UIT.Key.home) next = untrack(() => this.bounds(thumb))[0]
    else if (event.key === UIT.Key.end) next = untrack(() => this.bounds(thumb))[1]
    if (next === undefined) return
    event.preventDefault()
    if (!untrack(() => this.isInteractive)) return
    const value = next
    if (this.move(thumb, value, event)) this.send("ui-change", this.detail(thumb, value, event))
  }

  /** Steps key `key` takes:  arrows the way they point (Fomantic's `keyMovement`), pages 2;  `0` for other keys. */
  private keySteps(key: string): number {
    const [vertical, reversed] = untrack(() => [this.vertical, this.reversed])
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

  /** A click aimed at the DOM element itself (its `<label for>`) focuses the first thumb. */
  private readonly onDOMElementClick = (event: MouseEvent) => {
    if (event.composedPath()[0] !== this.domElement || this.isDisabled) return
    this.inner?.querySelector<HTMLElement>(THUMB_SELECTOR)?.focus()
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UISlider extends E.AttributeValues<typeof sliderVocabulary> {}

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

/** Custom property `UISlider.css` places a thumb or label by:  its ratio along the track. */
const AT = "--_slider-at"

/** Custom property of the fill's start ratio. */
const FROM = "--_slider-from"

/** Custom property of the fill's end ratio. */
const TO = "--_slider-to"
