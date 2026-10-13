import { Repeat, Show } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { F } from "$/ui/forms"
import { ratingVocabulary } from "./UIRating.en"
import { DEFAULT_MAX, RatingFallback } from "./UIRating.fallback"

import ratingCSS from "./UIRating.css?inline"

/****************
 * ### `DOMRatingElement`
 * The DOM element of `<ui-rating>`:  a form control's DOM element (`DOMFormControl`),
 * whose `focus()` goes to the group's TAB STOP.
 *
 * - Why:  `delegatesFocus` hands a plain `focus()` to the shadow root's FIRST focusable element (radio 1),
 *   even when radio 3 is chosen.  Tab and `<label for>` already reach the chosen one.
 * - `DOMElement` refuses a member named like an attribute's property:  `focus` is not one.
 * - Above the component:  its `elementSetup` reads this class while the component is defined.
 ****************/
export class DOMRatingElement extends F.DOMFormControl<UIRating> {
  /** Focus the chosen radio, else the first. */
  override focus(options?: FocusOptions) {
    if (!this.component?.focus(options)) super.focus(options)
  }
}

/****************
 * ### `UIRating`
 * The component behind `<ui-rating>`:  a rating of one to `max-rating` icons, as an APG radio group.
 *
 * - Its shadow DOM:
 *   `<fieldset class="ui … rating" part="rating" role="radiogroup">`
 *   holding one `<label class="[active] [partial] [selected] icon" part="icon">` per point,
 *   each around a native radio (`part="control"`, invisible, over the glyph) and the icon's `<svg>`.
 *
 * - Why native radios in one shadow root:  they ARE a radio group, and each carries its own name ("3 of 5").
 *   - one Tab stop:  the chosen one, else the first
 *   - arrows move and choose (wrapping, as in the APG);  Space chooses
 *   - Home / End choose the first / last;  Backspace / Delete clear when `clearable`.
 *
 * - `value` is controlled (`@controlled`):  a choice sends `ui-change` first;
 *   a handler that sets `el.value` again wins, and the radios show that value.
 *   The ATTRIBUTE is the starting (and reset) value.
 * - Fractions (`value="3.5"`) fill part of the next icon (Fomantic's `partial`, `--full`).
 *   - Only a display:  no radio is chosen, and the group's `aria-description` says "Rated 3.5 of 5".
 *   - A person's choice is always whole.
 * - `clearable`:  choosing the current rating again clears it (Fomantic's `clearable`;  `auto` ~== one icon).
 * - Hover previews a choice (`selected` icons, `selected` root), as Fomantic's script did.
 * - `readonly` (Fomantic's `interactive: false`):  focusable, announced read-only, and nothing changes it.
 *   `disabled`:  a disabled fieldset, out of the tab order and the form.
 * - A form control:  it submits `value` while above 0;  `required` needs one.
 *   Named by the DOM element's `<label for>` / `aria-label` (`ControlLabels`).
 ****************/
export class UIRating extends F.FormComponent<typeof ratingVocabulary> {
  @E.proto static vocabulary = ratingVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { rating: ratingCSS },
    Fallback: RatingFallback,
    DOMElement: DOMRatingElement
  } satisfies Partial<E.ElementSetup>

  /** Shows as invalid only once a person has interacted. */
  @E.proto static invalidShows: E.InvalidTiming = "once touched"

  onFormStateRestore(state: File | string | FormData | null) {
    this.value = Number(state) || 0
  }

  ////////////////
  // ## The rating
  ////////////////

  /** `value`:  set by the page, or chosen;  `0` until either. */
  @E.controlled("value") accessor value: number | undefined = 0

  /** How many icons. */
  get iconCount(): number {
    return Math.max(1, Math.floor(this.maxRating ?? DEFAULT_MAX))
  }

  /** The rating shown, `value` clamped to `0 ... iconCount`. */
  get rating(): number {
    return Math.min(this.iconCount, Math.max(0, Number(this.value) || 0))
  }

  /** Is `point` the partly filled one? */
  isPartlyFilled(point: number): boolean {
    const rating = this.rating
    return rating % 1 !== 0 && point === Math.ceil(rating)
  }

  /** "Rated 3.5 of 5" for a fractional rating, which no radio can show. */
  @E.derived
  private get fractionDescription(): string | undefined {
    const rating = this.rating
    if (rating % 1 === 0) return undefined
    return this.translationForKey("ratingValue", { value: UI.i18n.formatNumber(rating), max: this.iconCount })
  }

  /** The radios show the rating:  on a change, and once rendered. */
  @E.onChange("rating", "iconCount", "isReady")
  protected onRatingChanged() {
    this.syncRadios()
  }

  /** Check exactly the radio of the current rating (none for 0 or a fraction). */
  @E.untracked
  private syncRadios() {
    const rating = this.rating
    for (const radio of this.radios()) radio.checked = Number(radio.value) === rating
  }

  /**
   * A person's choice of `value`:  send `ui-change`, then set the DOM element's property,
   * unless a handler set it first.
   * - Returns true when applied.
   */
  choose(value: number, originalEvent?: Event): boolean {
    this.isTouched = true
    const applied = this.requestChange("value", value, () => this.send("ui-change", { value, originalEvent }))
    if (!applied) E.afterSolidUpdate(() => this.syncRadios())
    return applied
  }

  ////////////////
  // ## Interaction
  ////////////////

  /** Point under the pointer, `0` for none. */
  @E.state accessor hoveredPoint = 0

  /** Can a person change it? */
  get isInteractive(): boolean {
    return !this.isDisabled && !this.readonly
  }

  /** Does choosing the current rating clear it?  `clearable`, or a single icon. */
  get isClearable(): boolean {
    return this.clearable || this.iconCount === 1
  }

  /** `selected` while the pointer previews a choice. */
  protected get extraClass(): string | undefined {
    return this.hoveredPoint ? UIT.SELECTED : undefined
  }

  /** Preview choice `point` while pointing at it. */
  @E.untracked
  private hover(point: number) {
    if (this.isInteractive) this.hoveredPoint = point
  }

  /** The pointer left the group:  no preview. */
  private readonly onPointerLeave = () => {
    this.hoveredPoint = 0
  }

  ////////////////
  // ## Form
  ////////////////

  /** The rating while above `0`;  `null` (`setFormValue()`'s "no value") at `0`. */
  get formValue(): E.FieldValue {
    const rating = this.rating
    return rating > 0 ? String(rating) : null
  }

  /** Back to the `value` ATTRIBUTE. */
  onFormReset() {
    this.value = E.Converters.number(this.attributes.value)
  }

  protected get validationLabel(): string | undefined {
    return this.labels.accessibleName ?? this.name
  }

  protected get validationAnchor(): HTMLElement | undefined {
    return this.radios()[0]
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** The icon, by name. */
  readonly iconGlyph = new E.IconGlyph({ owner: this, name: () => this.icon })

  /** The radio group. */
  private group?: HTMLFieldSetElement

  /** Name tying the radios into one native group. */
  private groupName = ""

  render(): JSX.Element {
    this.groupName = UI.ids.next(ID_PREFIX)
    return (
      <fieldset
        ref={(element) => (this.group = element)}
        class={this.rootClass}
        part={this.partForName("rating")}
        role="radiogroup"
        disabled={this.isDisabled}
        aria-label={this.labels.accessibleName}
        aria-readonly={this.readonly ? "true" : undefined}
        aria-required={this.required ? "true" : undefined}
        aria-invalid={this.isShownInvalid ? "true" : undefined}
        aria-description={this.fractionDescription}
        onPointerLeave={this.onPointerLeave}
        onKeyDown={this.onKeyDown}
      >
        <Repeat count={this.iconCount}>{(index) => this.pointIcon(index + 1)}</Repeat>
      </fieldset>
    )
  }

  /**
   * One point:  its label, radio and glyph (twice when partly filled:  the fill is clipped over the base).
   * - Not `icon()`:  `icon` is the attribute's.
   */
  private pointIcon(point: number): JSX.Element {
    return (
      <label
        class={this.iconClass(point)}
        part={this.partForName("icon")}
        style={this.isPartlyFilled(point) ? { [FULL]: `${Math.round((this.rating % 1) * 100)}%` } : undefined}
        onPointerEnter={() => this.hover(point)}
      >
        <input
          type="radio"
          part={this.partForName("control")}
          name={this.groupName}
          value={String(point)}
          aria-label={this.translationForKey("ratingItem", { value: point, max: this.iconCount })}
          {...this.staticRadio(point)}
          onClick={this.onClick}
          onChange={this.onChange}
        />
        {this.svg()}
        <Show when={this.isPartlyFilled(point)}>{this.svg(FILL)}</Show>
      </label>
    )
  }

  /** `[active] [partial] [selected] icon` for `point`. */
  private iconClass(point: number): string {
    const rating = this.rating
    const words = []
    if (point <= Math.ceil(rating)) words.push(UIT.ACTIVE)
    if (this.isPartlyFilled(point)) words.push(PARTIAL)
    if (point <= this.hoveredPoint) words.push(UIT.SELECTED)
    words.push(UIT.ICON)
    return words.join(" ")
  }

  /**
   * Server render only (`$/ui/static`):  the radio of `point` named for the form (the DOM element's `name`),
   * and `checked` when it is the rating, so a static form submits it.
   * - `{}` in a browser, where the DOM element submits (`ElementInternals`)
   *   and the radios share a generated name.
   */
  private staticRadio(point: number): Record<string, unknown> {
    if (!isServer) return {}
    return { name: this.name ?? this.groupName, checked: this.rating === point }
  }

  /**
   * A fresh glyph `<svg>` (with class `extra`), or nothing until the icon has loaded;  tracked.
   * - Server render:  the glyph as markup (`IconGlyph.svg`), which takes no class:  no partial `fill` copy.
   */
  private svg(extra?: string): SVGSVGElement | undefined {
    if (isServer) return extra ? undefined : this.iconGlyph.svg
    const template = this.iconGlyph.svgTemplate
    if (!template) return undefined
    const svg = E.IconGlyph.draw(template)
    if (extra) svg.classList.add(extra)
    return svg
  }

  /** The radios, in order. */
  private radios(): HTMLInputElement[] {
    return [...(this.group?.querySelectorAll<HTMLInputElement>(RADIO_SELECTOR) ?? [])]
  }

  ////////////////
  // ## Handlers
  ////////////////

  /** `readonly`:  cancel the click (the radio reverts);  the current rating clicked again clears a clearable one. */
  @E.untracked
  private readonly onClick = (event: MouseEvent) => {
    if (this.readonly) {
      event.preventDefault()
      return
    }
    const point = Number((event.currentTarget as HTMLInputElement).value)
    if (point === this.rating && this.isClearable) this.choose(0, event)
  }

  /** A radio was chosen (click, arrows, Space). */
  private readonly onChange = (event: Event) => {
    this.choose(Number((event.currentTarget as HTMLInputElement).value), event)
  }

  /** `readonly` blocks the native keys;  Home / End jump;  Backspace / Delete clear a clearable rating. */
  @E.untracked
  private readonly onKeyDown = (event: KeyboardEvent) => {
    const { key } = event
    if (this.readonly) {
      if (CHOICE_KEYS.has(key)) event.preventDefault()
      return
    }
    if (!this.isInteractive) return
    if (key === UIT.Key.home || key === UIT.Key.end) {
      event.preventDefault()
      const radios = this.radios()
      const target = key === UIT.Key.home ? radios[0] : radios.at(-1)
      target?.focus()
      if (target && !target.checked) this.choose(Number(target.value), event)
      return
    }
    const step = this.wrapStep(event)
    if (step) {
      // the browser's own arrow keys stop at the ends (WebKit):  wrap round, as the others do
      const radios = this.radios().filter((radio) => !radio.disabled)
      const target = step < 0 ? radios.at(-1) : radios[0]
      event.preventDefault()
      target?.focus()
      if (target && !target.checked) this.choose(Number(target.value), event)
      return
    }
    if (CLEAR_KEYS.has(key) && this.isClearable) {
      event.preventDefault()
      this.choose(0, event)
    }
  }

  /**
   * Which way an arrow key would run off the end of the group:
   * -1 before the first radio, 1 past the last,
   * 0 when it is not that (the browser moves, or wraps, on its own).
   */
  private wrapStep(event: KeyboardEvent): -1 | 0 | 1 {
    let step = ARROW_STEPS[event.key]
    if (!step || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return 0
    // a right-to-left group runs the horizontal arrows backwards
    const isHorizontal = event.key === UIT.Key.arrowLeft || event.key === UIT.Key.arrowRight
    if (isHorizontal && getComputedStyle(this.domElement).direction === "rtl") step = -step
    const radios = this.radios().filter((radio) => !radio.disabled)
    const active = this.domElement.shadowRoot?.activeElement
    if (step < 0 && active === radios[0]) return -1
    if (step > 0 && active === radios.at(-1)) return 1
    return 0
  }

  /** A click aimed at the DOM element itself (its `<label for>`) focuses the group's tab stop. */
  protected activateControl() {
    this.focus()
  }

  /**
   * Focus the group's tab stop:  the chosen radio, else the first (`DOMRatingElement.focus()`).
   * - Returns false when there is nothing to focus yet (not rendered, disabled).
   */
  focus(options?: FocusOptions): boolean {
    const radios = this.radios()
    const target = radios.find((radio) => radio.checked) ?? radios[0]
    if (!target || target.disabled) return false
    target.focus(options)
    return true
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIRating extends E.AttributeValues<typeof ratingVocabulary> {}

/** Class word of a partly filled icon. */
const PARTIAL = "partial"

/** Class of the clipped glyph over a partly filled icon. */
const FILL = "fill"

/** Fomantic's custom property for the filled share of a partial icon. */
const FULL = "--full"

/** `UI.ids` prefix of the radios' group name. */
const ID_PREFIX = "ui-rating"

/** The radios, as a selector. */
const RADIO_SELECTOR = "input[type=radio]"

/** Keys that clear the rating. */
const CLEAR_KEYS: ReadonlySet<string> = new Set([UIT.Key.backspace, UIT.Key.delete])

/** Keys that choose natively (or through us), blocked while `readonly`. */
const CHOICE_KEYS: ReadonlySet<string> = new Set([
  UIT.Key.space,
  UIT.Key.arrowUp,
  UIT.Key.arrowDown,
  UIT.Key.arrowLeft,
  UIT.Key.arrowRight,
  UIT.Key.home,
  UIT.Key.end,
  ...CLEAR_KEYS
])

/** Which way each arrow key moves through the points:  `-1` back, `1` on (left-to-right). */
const ARROW_STEPS: Readonly<Record<string, number>> = {
  [UIT.Key.arrowUp]: -1,
  [UIT.Key.arrowDown]: 1,
  [UIT.Key.arrowLeft]: -1,
  [UIT.Key.arrowRight]: 1
}
