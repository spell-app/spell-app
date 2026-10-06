import { Repeat, Show, createEffect, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"
import { onFormStateRestore } from "@spell-app/solid-element"

import { E, UI, UIT } from "$/ui/core"
import { F } from "$/ui/forms"
import { ratingVocabulary } from "./ui-rating.vocabulary.en"
import { RatingFallback } from "./ui-rating.fallback"
import { RatingHost } from "./RatingHost"
import { DEFAULT_MAX, RADIO, RADIOGROUP } from "./ui-rating.types"

import ratingCSS from "./ui-rating.css?inline"

/****************
 * ### `<ui-rating>`
 * A rating as an APG radio group:  `<fieldset class="ui … rating" part="rating" role="radiogroup">` holding one
 * `<label class="[active] [partial] [selected] icon" part="icon">` per point, each around a native radio
 * (`part="control"`, invisible, over the glyph) and the icon's `<svg>`.
 * - Why native radios in one shadow root:  they ARE a radio group -- one Tab stop (the chosen one, else the first),
 *   arrows move and choose (wrapping, as APG), Space chooses -- and each carries its own name ("3 of 5").  Home /
 *   End choose the first / last;  Backspace / Delete clear when `clearable`.
 * - `value` is auto-controlled (`Controlled`):  a choice dispatches `ui-change` first;  a handler that re-sets
 *   `el.value` wins and the radios show the host's value again.  The ATTRIBUTE is the starting (and reset) value.
 * - Fractions (`value="3.5"`) fill part of the next icon (Fomantic's `partial`, `--full`) -- display:  no radio is
 *   chosen, and the group's `aria-description` says "Rated 3.5 of 5".  A person's choice is always whole.
 * - `clearable`:  choosing the current rating again clears it (Fomantic's `clearable`;  `auto` ~== one icon).
 * - Hover previews a choice (`selected` icons, `selected` root), as Fomantic's JS did.
 * - `readonly` (Fomantic's `interactive: false`):  focusable, announced read-only, nothing changes it.  `disabled`:
 *   a disabled fieldset -- out of the tab order and the form.
 * - Form:  `value` while above 0;  `required` needs one.  Named by the host's `<label for>` / `aria-label`
 *   (`ControlLabels`).
 ****************/
export class UIRating extends F.FormElement<typeof ratingVocabulary> {
  @E.proto static vocabulary = ratingVocabulary
  @E.proto static styles = { rating: ratingCSS }
  @E.proto static Fallback = RatingFallback
  @E.proto static Host = RatingHost

  /** `value`:  the host's property, else `0`. */
  readonly valueState = this.controlled("value", 0)

  /** Point under the pointer, `0` for none. */
  readonly hovered = new E.Cell(0)

  /** A person has interacted:  only then does it show as invalid. */
  readonly isTouched = new E.Cell(false)

  /** Host `<label>`s and `aria-label`, as the group's name. */
  readonly labels = new F.ControlLabels(this.formHost)

  /** The icon, by name. */
  readonly glyph = new E.IconGlyph({ owner: this, name: () => this.attrs.icon })

  /** The radio group. */
  private group?: HTMLFieldSetElement

  /** Name tying the radios into one native group. */
  private groupName = ""

  constructor(...args: ConstructorParameters<typeof F.FormElement>) {
    super(...args)
    this.host.addEventListener("invalid", this.onInvalid)
    this.host.addEventListener("click", this.onHostClick)
    onFormStateRestore((state) => this.valueState.set(Number(state) || 0))
  }

  ////////////////
  // ## State
  ////////////////

  /** How many icons;  tracked. */
  max(): number {
    return Math.max(1, Math.floor(this.attrs.maxRating ?? DEFAULT_MAX))
  }

  /** Current rating, `0 ... max()`;  tracked. */
  value(): number {
    return Math.min(this.max(), Math.max(0, Number(this.valueState.get()) || 0))
  }

  isDisabled(): boolean {
    return this.attrs.disabled || this.isFormDisabled.get()
  }

  /** Can a person change it?  Tracked. */
  isInteractive(): boolean {
    return !this.isDisabled() && !this.attrs.readonly
  }

  /** Does choosing the current rating clear it?  Tracked. */
  isClearable(): boolean {
    return this.attrs.clearable || this.max() === 1
  }

  /** Is `point` the partly filled one?  Tracked. */
  isPartial(point: number): boolean {
    const value = this.value()
    return value % 1 !== 0 && point === Math.ceil(value)
  }

  protected classValue(name: E.AttributeName<typeof ratingVocabulary>): unknown {
    if (name === "disabled") return this.isDisabled()
    return super.classValue(name)
  }

  /** `selected` while the pointer previews a choice. */
  protected extraClasses(): string | undefined {
    return this.hovered.get() ? UIT.SELECTED : undefined
  }

  protected hostStates() {
    return { disabled: this.isDisabled() }
  }

  ////////////////
  // ## Form
  ////////////////

  /** The rating while above `0`;  `null` (`setFormValue()`'s "no value") at `0`. */
  formValue(): E.FieldValue {
    const value = this.value()
    return value > 0 ? String(value) : null
  }

  protected formName(): string | undefined {
    return this.attrs.name
  }

  /** Back to the `value` ATTRIBUTE;  forgets the interaction. */
  formReset() {
    const attribute = this.definition.attribute("value").attribute
    this.valueState.set(E.Converters.number(this.host.getAttribute(attribute)) as never)
    this.isTouched.set(false)
  }

  protected rules(): E.ValidationRule[] {
    return this.attrs.required ? [UIT.REQUIRED_RULE] : []
  }

  protected validationLabel(): string | undefined {
    return this.labels.name() ?? this.attrs.name
  }

  protected validationAnchor(): HTMLElement | undefined {
    return this.radios()[0]
  }

  protected showsInvalid(result: E.ValidationResult): boolean {
    return !result.valid && this.isTouched.get()
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** Adds the radio sync (host value => radios) and label refresh on connect. */
  mount(): JSX.Element {
    createEffect(
      () => [this.value(), this.max(), this.isLoaded()] as const,
      () => this.syncRadios()
    )
    createEffect(
      () => this.isConnected.get(),
      (connected) => {
        if (connected) this.labels.refresh()
      }
    )
    return super.mount()
  }

  render(): JSX.Element {
    this.groupName = UI.ids.next(ID_PREFIX)
    return (
      <fieldset
        ref={(element) => (this.group = element)}
        class={this.classes()}
        part={this.part("rating")}
        role={RADIOGROUP}
        disabled={this.isDisabled()}
        aria-label={this.labels.name()}
        aria-readonly={this.attrs.readonly ? UIT.TRUE : undefined}
        aria-required={this.attrs.required ? UIT.TRUE : undefined}
        aria-invalid={this.isTouched.get() && !this.validation().valid ? UIT.TRUE : undefined}
        aria-description={this.description()}
        onPointerLeave={this.onLeave}
        onKeyDown={this.onKeyDown}
      >
        <Repeat count={this.max()}>{(index) => this.icon(index + 1)}</Repeat>
      </fieldset>
    )
  }

  /** One point:  its label, radio and glyph (twice when partly filled:  the fill is clipped over the base). */
  private icon(point: number): JSX.Element {
    return (
      <label
        class={this.iconClass(point)}
        part={this.part("icon")}
        style={this.isPartial(point) ? { [FULL]: `${Math.round((this.value() % 1) * 100)}%` } : undefined}
        onPointerEnter={() => this.hover(point)}
      >
        <input
          type={RADIO}
          part={this.part("control")}
          name={this.groupName}
          value={String(point)}
          aria-label={this.text("ratingItem", { value: point, max: this.max() })}
          {...this.staticRadio(point)}
          onClick={this.onClick}
          onChange={this.onChange}
        />
        {this.svg()}
        <Show when={this.isPartial(point)}>{this.svg(FILL)}</Show>
      </label>
    )
  }

  /** `[active] [partial] [selected] icon` for `point`. */
  private iconClass(point: number): string {
    const value = this.value()
    const words = []
    if (point <= Math.ceil(value)) words.push(UIT.ACTIVE)
    if (this.isPartial(point)) words.push(PARTIAL)
    if (point <= this.hovered.get()) words.push(UIT.SELECTED)
    words.push(UIT.ICON)
    return words.join(" ")
  }

  /**
   * Server render only (`$/ui/static`):  the radio of `point` named for the form (the host's `name`) and
   * `checked` when it is the value, so a static form submits the rating;  `{}` in a browser, where the HOST submits
   * (`ElementInternals`) and the radios share a generated name.
   */
  private staticRadio(point: number): Record<string, unknown> {
    if (!isServer) return {}
    return { name: this.attrs.name ?? this.groupName, checked: this.value() === point }
  }

  /**
   * A fresh glyph `<svg>` (with class `extra`), or nothing until the icon has loaded;  tracked.
   * - Server render:  the glyph as markup (`IconGlyph.svg()`), which takes no class:  no partial `fill` copy.
   */
  private svg(extra?: string): SVGSVGElement | undefined {
    if (isServer) return extra ? undefined : this.glyph.svg()
    const template = this.glyph.data.get()
    if (!template) return undefined
    const svg = E.IconGlyph.draw(template)
    if (extra) svg.classList.add(extra)
    return svg
  }

  /** "Rated 3.5 of 5" for a fractional rating, which no radio can show. */
  private description(): string | undefined {
    const value = this.value()
    if (value % 1 === 0) return undefined
    return this.text("ratingValue", { value: UI.i18n.formatNumber(value), max: this.max() })
  }

  /** The radios, in order. */
  private radios(): HTMLInputElement[] {
    return [...(this.group?.querySelectorAll<HTMLInputElement>(RADIO_SELECTOR) ?? [])]
  }

  /** Check exactly the radio of the current value (none for 0 or a fraction). */
  private syncRadios() {
    const value = untrack(() => this.value())
    for (const radio of this.radios()) radio.checked = Number(radio.value) === value
  }

  ////////////////
  // ## Handlers
  ////////////////

  /**
   * A person's choice of `value`:  `ui-change`, then the host property, unless a handler re-set it.
   * - Returns true when applied.
   */
  choose(value: number, originalEvent?: Event): boolean {
    this.isTouched.set(true)
    const applied = this.valueState.request(value as never, () => this.emit("ui-change", { value, originalEvent }))
    if (!applied) queueMicrotask(() => this.syncRadios())
    return applied
  }

  /** Preview choice `point` while pointing at it. */
  private hover(point: number) {
    if (untrack(() => this.isInteractive())) this.hovered.set(point)
  }

  /** The pointer left the group:  no preview. */
  private readonly onLeave = () => {
    this.hovered.set(0)
  }

  /** `readonly`:  cancel the click (the radio reverts);  the current rating clicked again clears a clearable one. */
  private readonly onClick = (event: MouseEvent) => {
    if (untrack(() => this.attrs.readonly)) {
      event.preventDefault()
      return
    }
    const point = Number((event.currentTarget as HTMLInputElement).value)
    if (point === untrack(() => this.value()) && untrack(() => this.isClearable())) this.choose(0, event)
  }

  /** A radio was chosen (click, arrows, Space). */
  private readonly onChange = (event: Event) => {
    this.choose(Number((event.currentTarget as HTMLInputElement).value), event)
  }

  /** `readonly` blocks the native keys;  Home / End jump;  Backspace / Delete clear a clearable rating. */
  private readonly onKeyDown = (event: KeyboardEvent) => {
    const { key } = event
    if (untrack(() => this.attrs.readonly)) {
      if (CHOICE_KEYS.has(key)) event.preventDefault()
      return
    }
    if (!untrack(() => this.isInteractive())) return
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
    if (CLEAR_KEYS.has(key) && untrack(() => this.isClearable())) {
      event.preventDefault()
      this.choose(0, event)
    }
  }

  /**
   * Which way an arrow key would run off the end of the group:  -1 before the first radio, 1 past the last, 0 when
   * it is not that (the browser moves, or wraps, on its own).
   */
  private wrapStep(event: KeyboardEvent): -1 | 0 | 1 {
    let step = ARROW_STEPS[event.key]
    if (!step || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return 0
    // a right-to-left group runs the horizontal arrows backwards
    const isHorizontal = event.key === UIT.Key.arrowLeft || event.key === UIT.Key.arrowRight
    if (isHorizontal && getComputedStyle(this.host).direction === RTL) step = -step
    const radios = this.radios().filter((radio) => !radio.disabled)
    const active = this.host.shadowRoot?.activeElement
    if (step < 0 && active === radios[0]) return -1
    if (step > 0 && active === radios.at(-1)) return 1
    return 0
  }

  /** A submit or `reportValidity()` found it invalid:  show it. */
  private readonly onInvalid = () => {
    this.isTouched.set(true)
  }

  /** A click aimed at the HOST itself (its `<label for>`) focuses the group's tab stop. */
  private readonly onHostClick = (event: MouseEvent) => {
    if (event.composedPath()[0] !== this.host || this.isDisabled()) return
    this.focus()
  }

  /**
   * Focus the group's tab stop:  the chosen radio, else the first (`RatingHost.focus()`).
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

/** Class word of a partly filled icon. */
const PARTIAL = "partial"

/** Class of the clipped glyph over a partly filled icon. */
const FILL = "fill"

/** Fomantic's custom property for the filled share of a partial icon. */
const FULL = "--full"

/** `UI.ids` prefix of the radios' group name. */
const ID_PREFIX = "ui-rating"

/** The radios, as a selector. */
const RADIO_SELECTOR = `input[type=${RADIO}]`

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

/** A right-to-left `direction`. */
const RTL = "rtl"
