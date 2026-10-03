import { For, Show, createEffect, createMemo, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"
import { onFormStateRestore } from "@spell-app/solid-element"

import {
  Cell,
  IconGlyph,
  numberToWord,
  proto,
  RUNTIME_KEY,
  type AttributeName,
  type FieldValue,
  type OverlayEntry,
  type RuntimeGlobal,
  type TemporalAPI,
  type UIHost,
  type ValidationRule,
  UI,
  UIT
} from "$/ui/core"
import { ControlLabels, FormElement } from "$/ui/forms"

import { calendarVocabulary } from "./ui-calendar.vocabulary.en"
import { CalendarFallback } from "./ui-calendar.fallback"
import { CalendarDates } from "./CalendarDates"
import { CalendarText } from "./CalendarText"
import { CalendarView } from "./CalendarView"
import {
  ADJACENT,
  ANCHOR_PROPERTY,
  CALENDAR_ICON,
  CLOCK_ICON,
  COLUMN,
  CalendarCell,
  CalendarPage,
  DEFAULT_POSITION,
  DEFAULT_TYPE,
  ENTER,
  FLUID,
  FOCUS,
  FOCUSED_CELL,
  HIDDEN,
  ID_PREFIX,
  INPUT,
  LINK,
  Moment,
  NEXT,
  NEXT_ICON,
  PAGE_TEXTS,
  PICKER,
  POPUP,
  PREVIOUS,
  PREVIOUS_ICON,
  RANGE,
  SPACE,
  STATIC_CONTROL,
  TABLE,
  TITLE,
  TODAY,
  TODAY_CELL,
  ViewInput,
  Vocabulary
} from "./ui-calendar.types"

import inputCSS from "$/ui/components/ui-input/ui-input.css?inline"
import calendarCSS from "./ui-calendar.css?inline"

/****************
 * ### `<ui-calendar>`
 * A date / time picker:  a text field (`ui left icon input`) whose icon button opens a popover dialog with the
 * picker, or the picker `inline`.  The picker is a header (previous / title / next) over a `<table role=grid>` in
 * Fomantic's class grammar (`ui celled center aligned unstackable seven column table day`), then an optional
 * Today / Now button.
 * - Views (Fomantic's modes):  years => months => days => hours => minutes, as far as `type` goes
 *   (`CalendarDates.modes()`).  Choosing a cell in a coarser view opens the next finer one;  the finest sets the
 *   value.  The title button goes back up.  Pages, cells and bounds are `CalendarView`'s.
 * - Dates are `Temporal` (`UI.i18n.temporal`):  the browser's own, else `temporal-polyfill`, loaded lazily -- the
 *   picker renders once it's here.  Names, formats and the 12 / 24 hour clock are the locale's `Intl`
 *   (`CalendarText`).
 * - Keyboard (WAI-ARIA APG date picker dialog):  real focus on ONE gridcell (`tabindex=0`, the focus moment);
 *   arrows, Home / End, PageUp / PageDown (+ Shift) move it (`CalendarView.move()`), across pages;  Enter / Space
 *   choose.  ArrowDown in the field (or the icon button) opens the popup with focus in the grid;  Escape (from
 *   `UI.overlays`) closes it and focus returns to where it was.  NOT `UI.focus.roving`:  the tab stop is a DATE
 *   that pages the grid, not an item of a fixed list.
 * - Typing:  the field's text is read on `change` / Enter (`CalendarText.read()`);  unreadable or out-of-range
 *   text reverts to the value's.
 * - `value` and `open` are auto-controlled (`Controlled`):  `ui-change` / `ui-open` / `ui-close` come first and
 *   are cancelable.  The `value` ATTRIBUTE is the starting (and form-reset) value.
 * - Ranges (Fomantic's `startCalendar` / `endCalendar`):  `start-calendar="id"` makes this the END -- the partner's
 *   value is its minimum -- and `end-calendar="id"` the START;  the span between them is highlighted.  The partner
 *   is read through its controller, so its changes are live.
 * - Form-associated:  submits the ISO value;  `required`;  reset;  fieldset-disabled;  restores a saved state.
 ****************/
export class UICalendar extends FormElement<Vocabulary> {
  @proto static vocabulary = calendarVocabulary
  @proto static styles = { input: inputCSS, calendar: calendarCSS }
  @proto static Fallback = CalendarFallback

  ////////////////
  // ## State
  ////////////////

  /** The page's `Temporal`, once here;  at once when the runtime is loaded and the browser has one. */
  readonly temporal = new Cell<TemporalAPI | undefined>(UICalendar.temporalNow())

  /** `value`:  host-controlled, or internal (`""`). */
  readonly valueState = this.controlled("value", "" as never)

  /** `open`:  host-controlled, or internal. */
  readonly openState = this.controlled("open", false)

  /** The view shown;  `undefined`:  the type's starting view. */
  readonly modeState = new Cell<UIT.CalendarMode | undefined>(undefined)

  /** The focused moment;  `null`:  the value's, else `initial-date`, else now. */
  readonly focusState = new Cell<Moment | null>(null)

  /** Text being typed into the field;  `null`:  the value's text. */
  readonly typed = new Cell<string | null>(null)

  /** Range partners:  the calendars `start-calendar` / `end-calendar` name, once they have rendered. */
  readonly startPartner = new Cell<UICalendar | undefined>(undefined)
  readonly endPartner = new Cell<UICalendar | undefined>(undefined)

  /** Host `<label>`s and `aria-label`, as the field's name. */
  readonly labels = new ControlLabels(this.formHost)

  /** The popup button's glyph:  `icon`, else `calendar` (`clock` for `time`). */
  readonly glyph = new IconGlyph(
    this,
    () => this.attrs.icon || (this.attrs.type === "time" ? CLOCK_ICON : CALENDAR_ICON)
  )

  /** Previous / next page glyphs. */
  readonly previousGlyph = new IconGlyph(this, () => PREVIOUS_ICON)
  readonly nextGlyph = new IconGlyph(this, () => NEXT_ICON)

  /** Starting value, for form reset:  the `value` ATTRIBUTE. */
  private readonly initialValue = untrack(() => this.host.getAttribute(this.definition.attribute("value").attribute))

  /** Ids / anchor name, from `UI.ids` once rendering. */
  private ids = { popup: "", title: "", anchor: "" }

  /** The field, the popup and the grid. */
  private control?: HTMLInputElement
  private popup?: HTMLElement
  private grid?: HTMLTableElement

  /** Move real focus to the focused cell after the next render (keyboard, the icon button, a click in a view). */
  private moveFocus = false

  /** This element's `UI.overlays` entry. */
  private readonly overlay: OverlayEntry = {
    element: this.host,
    kind: "popover",
    onDismiss: () => void this.setOpen(false)
  }

  constructor(...args: ConstructorParameters<typeof FormElement>) {
    super(...args)
    // SSR renders the field only:  no runtime, no Temporal
    if (!isServer && !untrack(() => this.temporal.get())) {
      void UI.load()
        .then(() => UI.i18n.loadTemporal())
        .then((T) => this.temporal.set(T))
    }
    onFormStateRestore((state) => this.valueState.set((typeof state === "string" ? state : "") as never))
    this.host.addEventListener("focusout", this.onFocusOut)
  }

  ////////////////
  // ## Derived
  ////////////////

  /** The calendar's type. */
  readonly type = createMemo((): UIT.CalendarType => this.attrs.type ?? DEFAULT_TYPE)

  /** Date arithmetic, once `Temporal` is here. */
  readonly dates = createMemo(() => {
    const T = this.temporal.get()
    return T ? new CalendarDates(T, this.type()) : undefined
  })

  /**
   * Words in the calendar's locale.
   * - `lazy`:  `UI` exists only once the runtime has loaded, i.e. by the first render.
   */
  readonly words = createMemo(() => new CalendarText(UI.i18n, this.attrs.locale ?? UI.i18n.locale), { lazy: true })

  /** The chosen moment, or `null`. */
  readonly value = createMemo(() => this.dates()?.parse(this.valueState.get()) ?? null)

  /** The views to walk through, coarse to fine. */
  readonly modes = createMemo(
    (): readonly UIT.CalendarMode[] =>
      this.dates()?.modes({
        disableMinute: this.attrs.disableMinute,
        disableMonth: this.attrs.disableMonth,
        disableYear: this.attrs.disableYear
      }) ?? []
  )

  /** The view shown. */
  readonly mode = createMemo((): UIT.CalendarMode => this.modeState.get() ?? CalendarDates.startMode(this.modes()))

  /** Earliest choosable moment:  `min`, or a later range start. */
  readonly min = createMemo(() =>
    UICalendar.later(this.dates(), this.dates()?.parse(this.attrs.min) ?? null, this.partner("start"))
  )

  /** Latest choosable moment:  `max`, or an earlier range end. */
  readonly max = createMemo(() =>
    UICalendar.earlier(this.dates(), this.dates()?.parse(this.attrs.max) ?? null, this.partner("end"))
  )

  /** The focused moment (see `focusState`). */
  readonly focusMoment = createMemo((): Moment | null => {
    const dates = this.dates()
    if (!dates) return null
    const start = this.focusState.get() ?? this.value() ?? dates.parse(this.attrs.initialDate) ?? dates.now()
    return this.focusState.get() ? start : dates.clamp(start, this.min(), this.max())
  })

  /** The page shown, see `CalendarView`. */
  readonly page = createMemo((): CalendarPage | undefined => {
    const input = this.viewInput()
    return input ? CalendarView.build(input) : undefined
  })

  /** Open now (never `inline`). */
  isOpen(): boolean {
    return this.openState.get() && !this.attrs.inline
  }

  isDisabled(): boolean {
    return this.attrs.disabled || this.formDisabled.get()
  }

  /** The field's text:  what's being typed, else the value's. */
  fieldText(): string {
    const typed = this.typed.get()
    if (typed !== null) return typed
    const value = this.value()
    if (value) return this.words().value(value, this.type())
    if (!isServer) return ""
    // server render:  no `Temporal`, so the value's fields read by hand, formatted as a browser would
    const fields = CalendarDates.isoFields(String(this.valueState.get() ?? ""), this.type())
    return fields ? this.words().value(fields, this.type()) : String(this.valueState.get() ?? "")
  }

  /** What `CalendarView` needs, or `undefined` before `Temporal`;  tracked. */
  private viewInput(): ViewInput | undefined {
    const dates = this.dates()
    const focus = this.focusMoment()
    if (!dates || !focus) return undefined
    const words = this.words()
    return {
      dates,
      text: words,
      mode: this.mode(),
      modes: this.modes(),
      focus,
      value: this.value(),
      today: dates.now(),
      min: this.min(),
      max: this.max(),
      firstDayOfWeek: this.attrs.firstDayOfWeek ?? words.firstDayOfWeek(),
      disabledDates: new Set(UICalendar.asArray(this.attrs.disabledDates).map((date) => String(date))),
      disabledDays: new Set(UICalendar.asArray(this.attrs.disabledDaysOfWeek).map(Number)),
      selectAdjacentDays: this.attrs.selectAdjacentDays,
      range: this.range(dates, focus)
    }
  }

  /** The span to highlight:  from a range start to this end, or from this start to a range end. */
  private range(dates: CalendarDates, focus: Moment): readonly [Moment, Moment] | null {
    const own = this.value() ?? focus
    const start = this.partner("start")
    const end = this.partner("end")
    const span = start ? ([start, own] as const) : end ? ([own, end] as const) : null
    return span && dates.compare(span[0], span[1], "minute") <= 0 ? span : null
  }

  /** A range partner's value;  tracked. */
  private partner(which: "start" | "end"): Moment | null {
    const partner = (which === "start" ? this.startPartner : this.endPartner).get()
    return partner?.value() ?? null
  }

  /** Name of the popup button and dialog. */
  private chooseText(): string {
    return this.text(this.type() === "time" ? "calendarChooseTime" : "calendarChooseDate")
  }

  ////////////////
  // ## Element hooks
  ////////////////

  protected classValue(name: AttributeName<Vocabulary>): unknown {
    if (name === "open") return this.isOpen()
    if (name === "disabled") return this.isDisabled()
    return super.classValue(name)
  }

  protected hostStates() {
    return { open: this.isOpen(), disabled: this.isDisabled(), fluid: this.attrs.fluid, inline: this.attrs.inline }
  }

  formValue(): FieldValue {
    return String(this.valueState.get() ?? "") || null
  }

  protected formName(): string | undefined {
    return this.attrs.name
  }

  /** Back to the `value` attribute;  drops typed text. */
  formReset() {
    this.valueState.set((this.initialValue ?? "") as never)
    this.typed.set(null)
    this.focusState.set(null)
  }

  protected rules(): ValidationRule[] {
    return this.attrs.required ? [UIT.REQUIRED_RULE] : []
  }

  protected validationLabel(): string | undefined {
    return this.labels.name() ?? this.attrs.placeholder
  }

  protected validationAnchor(): HTMLElement | undefined {
    return this.control ?? this.grid?.querySelector<HTMLElement>(FOCUSED_CELL) ?? undefined
  }

  ////////////////
  // ## Rendering
  ////////////////

  mount(): JSX.Element {
    this.effects()
    return super.mount()
  }

  render(): JSX.Element {
    this.ids = { popup: UI.ids.next(ID_PREFIX), title: UI.ids.next(ID_PREFIX), anchor: `--${UI.ids.next(ID_PREFIX)}` }
    return (
      <div class={this.classes()} part={this.part("calendar")} style={{ [ANCHOR_PROPERTY]: this.ids.anchor }}>
        <Show when={this.attrs.inline} fallback={this.popupMode()}>
          <div
            class={PICKER}
            role={this.labels.name() ? "group" : undefined}
            aria-label={this.labels.name()}
            inert={this.isDisabled()}
          >
            {this.picker()}
          </div>
        </Show>
        {isServer && this.staticValue()}
      </div>
    )
  }

  /** Server render only (`$/ui/server`):  the field's `STATIC_CONTROL` mark;  `{}` in a browser. */
  private staticControl(): Record<string, unknown> {
    return isServer ? { [STATIC_CONTROL]: "" } : {}
  }

  /**
   * Server render only:  the ISO value as a hidden input, so a static form submits it as the HOST would
   * (`ElementInternals`) -- the field shows it formatted.
   */
  private staticValue(): JSX.Element {
    const name = this.attrs.name
    const value = this.formValue()
    if (!name || value === null) return undefined
    return <input type={HIDDEN} name={name} value={String(value)} disabled={this.isDisabled()} />
  }

  /** Field + icon button + popover. */
  private popupMode(): JSX.Element {
    return (
      <>
        <div
          class={[INPUT, { [FLUID]: this.attrs.fluid, [UIT.DISABLED]: this.isDisabled() }]}
          part={this.part("input")}
        >
          <input
            ref={(element) => (this.control = element)}
            part={this.part("control")}
            type="text"
            autocomplete="off"
            placeholder={this.attrs.placeholder}
            disabled={this.isDisabled()}
            readonly={this.attrs.readonly}
            value={this.fieldText()}
            aria-label={this.labels.name() ?? this.attrs.placeholder}
            aria-required={this.attrs.required ? "true" : undefined}
            aria-invalid={this.validation().valid ? undefined : "true"}
            {...this.staticControl()}
            onInput={this.onInput}
            onChange={this.onChange}
            onClick={this.onFieldClick}
            onKeyDown={this.onFieldKeyDown}
          />
          <button
            type="button"
            class={UIT.ICON}
            part={this.part("trigger")}
            disabled={this.isDisabled() || this.attrs.readonly}
            aria-label={this.chooseText()}
            aria-haspopup="dialog"
            aria-expanded={this.isOpen() ? "true" : "false"}
            aria-controls={this.ids.popup}
            onClick={this.onTriggerClick}
          >
            {this.glyph.svg()}
          </button>
        </div>
        <div
          ref={(element) => (this.popup = element)}
          id={this.ids.popup}
          class={`${POPUP} ${this.attrs.position ?? DEFAULT_POSITION}`}
          part={this.part("popup")}
          popover="manual"
          role="dialog"
          aria-label={this.chooseText()}
        >
          <Show when={this.isOpen()}>{this.picker()}</Show>
        </div>
      </>
    )
  }

  /** Header, grid, today button;  nothing until `Temporal` is here. */
  private picker(): JSX.Element {
    return (
      <Show when={this.page()}>
        {(page) => (
          <>
            <Show when={this.type() !== "time"}>{this.header(page)}</Show>
            {this.table(page)}
            <Show when={this.attrs.today}>
              <button type="button" class={TODAY} part={this.part("today")} onClick={this.onToday}>
                {this.text(this.dates()?.hasTime ? "calendarNow" : "calendarToday")}
              </button>
            </Show>
          </>
        )}
      </Show>
    )
  }

  /** Previous / title / next. */
  private header(page: () => CalendarPage): JSX.Element {
    return (
      <div class={UIT.HEADER} part={this.part("header")}>
        <button
          type="button"
          class={PREVIOUS}
          part={this.part("previous")}
          disabled={page().previous.disabled}
          aria-label={this.text(PAGE_TEXTS[page().mode][0])}
          onClick={(event) => this.turn(page().previous.target, event)}
        >
          {this.previousGlyph.svg()}
        </button>
        <button
          type="button"
          id={this.ids.title}
          class={TITLE}
          part={this.part("title")}
          disabled={!page().up}
          aria-live="polite"
          onClick={this.onTitleClick}
        >
          {page().title}
        </button>
        <button
          type="button"
          class={NEXT}
          part={this.part("next")}
          disabled={page().next.disabled}
          aria-label={this.text(PAGE_TEXTS[page().mode][1])}
          onClick={(event) => this.turn(page().next.target, event)}
        >
          {this.nextGlyph.svg()}
        </button>
      </div>
    )
  }

  /** The grid:  weekday heads (days), then the cells. */
  private table(page: () => CalendarPage): JSX.Element {
    return (
      <table
        ref={(element) => (this.grid = element)}
        class={`${TABLE} ${numberToWord(page().columns)} ${COLUMN} ${page().mode}`}
        part={this.part("grid")}
        role="grid"
        aria-labelledby={this.type() === "time" ? undefined : this.ids.title}
        aria-label={
          this.type() === "time" ? this.text(page().mode === "hour" ? "calendarHours" : "calendarMinutes") : undefined
        }
        aria-readonly={this.attrs.readonly ? "true" : undefined}
        onKeyDown={this.onGridKeyDown}
      >
        <Show when={page().weekdays.length}>
          <thead>
            <tr>
              <For each={page().weekdays} keyed={false}>
                {(day) => (
                  <th scope="col" abbr={day().label}>
                    {day().text}
                  </th>
                )}
              </For>
            </tr>
          </thead>
        </Show>
        <tbody>
          <For each={page().rows} keyed={false}>
            {(row) => (
              <tr>
                <For each={row()} keyed={false}>
                  {(cell) => this.cell(cell)}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    )
  }

  /** One gridcell;  its DOM node stays put across pages (`keyed={false}`), only its content changes. */
  private cell(cell: () => CalendarCell): JSX.Element {
    return (
      <td
        role="gridcell"
        class={[
          LINK,
          {
            [ADJACENT]: cell().adjacent,
            [UIT.DISABLED]: cell().disabled,
            [UIT.ACTIVE]: cell().active,
            [TODAY_CELL]: cell().today,
            [FOCUS]: cell().focus,
            [RANGE]: cell().range
          }
        ]}
        part={this.part("cell")}
        tabindex={cell().focus ? 0 : -1}
        aria-selected={cell().active ? "true" : "false"}
        aria-disabled={cell().disabled ? "true" : undefined}
        aria-current={cell().today && this.mode() === "day" ? "date" : undefined}
        aria-label={cell().label}
        onClick={(event) => this.choose(cell(), event)}
      >
        {cell().text}
      </td>
    )
  }

  ////////////////
  // ## Effects
  ////////////////

  /**
   * Popover + overlay registration while open AND connected;  real focus to the focused cell when asked;  range
   * partners resolved on connect.
   * - Created in `mount()`:  they read overridable methods and every field.
   */
  private effects() {
    createEffect(
      () => this.isOpen() && this.connected.get() && this.loaded(),
      (open) => {
        const { popup } = this
        if (!open || !popup) return
        if (!popup.matches(UIT.POPOVER_OPEN)) popup.showPopover()
        UI.overlays.open(this.overlay)
        return () => {
          if (popup.matches(UIT.POPOVER_OPEN)) popup.hidePopover()
          UI.overlays.close(this.overlay)
        }
      }
    )
    createEffect(
      () => [this.page(), this.isOpen()],
      () => {
        if (!this.moveFocus) return
        const cell = this.grid?.isConnected ? this.grid.querySelector<HTMLElement>(FOCUSED_CELL) : null
        if (!cell) return
        this.moveFocus = false
        cell.focus()
      }
    )
    createEffect(
      () => [this.connected.get(), this.attrs.startCalendar, this.attrs.endCalendar] as const,
      ([connected, start, end]) => {
        if (!connected) return
        void this.resolvePartner(start, this.startPartner)
        void this.resolvePartner(end, this.endPartner)
      }
    )
  }

  /** Find the calendar `id` names in this one's tree, wait for it to render, keep its controller in `cell`. */
  private async resolvePartner(id: string | undefined, cell: Cell<UICalendar | undefined>) {
    const found = id ? (this.host.getRootNode() as Document | ShadowRoot).getElementById?.(id) : null
    if (!found || !("ready" in found)) return cell.set(undefined)
    await (found as UIHost).ready
    const controller = (found as UIHost).controller
    cell.set(controller instanceof UICalendar ? controller : undefined)
  }

  ////////////////
  // ## Transitions
  ////////////////

  /**
   * Open or close the popup, dispatching the cancelable `ui-open` / `ui-close` first;  true when applied.
   * - Opening starts over in the type's first view, on the value (or `initial-date`, or today).
   */
  setOpen(open: boolean, originalEvent?: Event): boolean {
    if (this.attrs.inline || open === untrack(() => this.isOpen())) return false
    if (open && (this.isDisabled() || this.attrs.readonly)) return false
    const detail: UIT.CalendarOpenDetail = { open, originalEvent }
    const done = this.openState.request(open, () => this.emit(open ? "ui-open" : "ui-close", detail))
    if (done && open) {
      this.modeState.set(undefined)
      this.focusState.set(null)
    }
    return done
  }

  /**
   * Set the value to `moment` (`null` clears), dispatching the cancelable `ui-change` first;  true when applied.
   * - SIDE EFFECT:  drops typed text either way (a vetoed value shows the old one again).
   */
  commit(moment: Moment | null, originalEvent?: Event): boolean {
    const dates = untrack(() => this.dates())
    if (!dates) return false
    const value = moment ? dates.format(moment) : ""
    const detail: UIT.CalendarChangeDetail = { value, originalEvent }
    this.typed.set(null)
    return this.valueState.request(value as never, () => this.emit("ui-change", detail))
  }

  /**
   * A cell was chosen:  the finest view sets the value (and closes the popup);  a coarser one opens the next view
   * on that cell, keeping the finer fields of the focus (a month chosen keeps the day, clamped).
   */
  choose(cell: CalendarCell, originalEvent?: Event) {
    const dates = untrack(() => this.dates())
    const focus = untrack(() => this.focusMoment())
    if (!dates || !focus || cell.disabled || this.attrs.readonly || this.isDisabled()) return
    const modes = untrack(() => this.modes())
    const mode = untrack(() => this.mode())
    const next = modes[modes.indexOf(mode) + 1]
    if (!next) {
      this.focusState.set(cell.moment)
      if (this.commit(cell.moment, originalEvent)) this.setOpen(false, originalEvent)
      else this.moveFocus = true
      return
    }
    this.focusState.set(UICalendar.merge(cell.moment, focus, mode))
    this.modeState.set(next)
    this.moveFocus = true
  }

  /** Page to `target` (previous / next), keeping keyboard focus where it was. */
  private turn(target: Moment, event: Event) {
    event.preventDefault()
    this.focusState.set(target)
  }

  ////////////////
  // ## Handlers
  ////////////////

  /** Typing:  kept until `change`. */
  private readonly onInput = (event: Event) => {
    this.typed.set((event.currentTarget as HTMLInputElement).value)
  }

  /** `change` (blur or Enter):  read the text. */
  private readonly onChange = (event: Event) => {
    this.readTyped(event)
  }

  /** Read typed text into the value;  empty clears, unreadable or out-of-range reverts. */
  private readTyped(event: Event) {
    const text = untrack(() => this.typed.get())
    if (text === null) return
    const dates = untrack(() => this.dates())
    if (!dates) return
    if (!text.trim()) return void this.commit(null, event)
    const moment = untrack(() => this.words()).read(text, dates)
    const [min, max] = untrack(() => [this.min(), this.max()])
    if (
      !moment ||
      (min && dates.compare(moment, min, "minute") < 0) ||
      (max && dates.compare(moment, max, "minute") > 0)
    )
      return this.typed.set(null)
    this.commit(moment, event)
  }

  /** A click in the field opens the popup;  focus stays in the field, for typing. */
  private readonly onFieldClick = (event: MouseEvent) => {
    this.setOpen(true, event)
  }

  /** Field keys:  Enter reads the text;  ArrowDown opens with focus in the grid (or moves it there). */
  private readonly onFieldKeyDown = (event: KeyboardEvent) => {
    if (event.key === ENTER) {
      event.preventDefault()
      this.readTyped(event)
      this.setOpen(false, event)
    } else if (event.key === UIT.ARROW_DOWN) {
      event.preventDefault()
      this.moveFocus = true
      if (!this.setOpen(true, event)) this.focusGrid()
    }
  }

  /** The icon button:  toggles;  opening puts focus in the grid (APG). */
  private readonly onTriggerClick = (event: MouseEvent) => {
    const open = untrack(() => this.isOpen())
    this.moveFocus = !open
    this.setOpen(!open, event)
  }

  /** The title:  up to the coarser view. */
  private readonly onTitleClick = () => {
    const up = untrack(() => this.page())?.up
    if (up) this.modeState.set(up)
  }

  /** Today / Now:  the value becomes today (to the type's unit), and the popup closes. */
  private readonly onToday = (event: MouseEvent) => {
    const dates = untrack(() => this.dates())
    if (!dates || this.attrs.readonly || this.isDisabled()) return
    const final = untrack(() => this.modes()).at(-1)!
    if (this.commit(dates.floor(dates.now(), final), event)) this.setOpen(false, event)
  }

  /** Grid keys (APG):  move the focus moment, choose, or pass on. */
  private readonly onGridKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
    const input = untrack(() => this.viewInput())
    if (!input) return
    if (event.key === ENTER || event.key === SPACE) {
      event.preventDefault()
      const cell = untrack(() => this.page())
        ?.rows.flat()
        .find((each) => each.focus)
      if (cell) this.choose(cell, event)
      return
    }
    const next = CalendarView.move(input, event.key, event.shiftKey)
    if (!next) return
    event.preventDefault()
    this.focusState.set(next)
    this.moveFocus = true
  }

  /** Focus leaving the host (to something else that takes focus) closes the popup. */
  private readonly onFocusOut = (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null
    if (!next || this.host.contains(next) || this.host.renderRoot.contains(next)) return
    this.setOpen(false, event)
  }

  /** Focus the focused cell now, if the grid is showing. */
  private focusGrid() {
    const cell = this.grid?.isConnected ? this.grid.querySelector<HTMLElement>(FOCUSED_CELL) : null
    if (!cell) return
    this.moveFocus = false
    cell.focus()
  }

  /** Focus the field (or, inline, the grid's tab stop). */
  focus(options?: FocusOptions) {
    if (this.control) this.control.focus(options)
    else this.grid?.querySelector<HTMLElement>(FOCUSED_CELL)?.focus(options)
  }

  /**
   * `Temporal` if it's here now:  the runtime is loaded and has one (native, or the polyfill already loaded).
   * - Read in a field initializer, before the runtime may exist, hence the global check.
   */
  private static temporalNow(): TemporalAPI | undefined {
    return (globalThis as RuntimeGlobal)[RUNTIME_KEY] ? UI.i18n.temporal : undefined
  }

  /** `moment`'s fields down to `mode`, the finer ones from `focus` (day clamped to the month). */
  private static merge(moment: Moment, focus: Moment, mode: UIT.CalendarMode): Moment {
    switch (mode) {
      case "year":
        return focus.with({ year: moment.year })
      case "month":
        return focus.with({ year: moment.year, month: moment.month })
      case "day":
        return focus.with({ year: moment.year, month: moment.month, day: moment.day })
      case "hour":
        return focus.with({ year: moment.year, month: moment.month, day: moment.day, hour: moment.hour })
      default:
        return moment
    }
  }

  /** The later of two bounds (either may be missing). */
  private static later(dates: CalendarDates | undefined, a: Moment | null, b: Moment | null): Moment | null {
    if (!dates || !a || !b) return a ?? b
    return dates.compare(a, b, "minute") >= 0 ? a : b
  }

  /** The earlier of two bounds (either may be missing). */
  private static earlier(dates: CalendarDates | undefined, a: Moment | null, b: Moment | null): Moment | null {
    if (!dates || !a || !b) return a ?? b
    return dates.compare(a, b, "minute") <= 0 ? a : b
  }

  /** A `json` property as an array (anything else:  empty). */
  private static asArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : []
  }
}

////////////////
// ## Helpers
////////////////
