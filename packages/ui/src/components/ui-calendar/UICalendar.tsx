import { For, Show, createEffect, createMemo, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"
import { onFormStateRestore } from "@spell-app/solid-element"

import { E, UI, UIT } from "$/ui/core"
import { F } from "$/ui/forms"
import { calendarVocabulary } from "./ui-calendar.vocabulary.en"
import { CalendarFallback } from "./ui-calendar.fallback"
import { CalendarDates } from "./CalendarDates"
import { CalendarText } from "./CalendarText"
import { CalendarView } from "./CalendarView"
import {
  DEFAULT_TYPE,
  type CalendarCell,
  type CalendarPage,
  type Moment,
  type ViewInput,
  type Vocabulary
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
export class UICalendar extends F.FormElement<Vocabulary> {
  @E.proto static vocabulary = calendarVocabulary
  @E.proto static styles = { input: inputCSS, calendar: calendarCSS }
  @E.proto static Fallback = CalendarFallback

  ////////////////
  // ## State
  ////////////////

  /** The page's `Temporal`, once here;  at once when the runtime is loaded and the browser has one. */
  readonly temporal = new E.Cell<E.TemporalAPI | undefined>(UICalendar.temporalNow())

  /** `value`:  host-controlled, or internal (`""`). */
  readonly valueState = this.controlled("value", "" as never)

  /** `open`:  host-controlled, or internal. */
  readonly openState = this.controlled("open", false)

  /** The view shown;  `undefined`:  the type's starting view. */
  readonly modeState = new E.Cell<UIT.CalendarMode | undefined>(undefined)

  /** The focused moment;  `undefined`:  the value's, else `initial-date`, else now. */
  readonly focusState = new E.Cell<Moment | undefined>(undefined)

  /** Text being typed into the field;  `undefined`:  the value's text. */
  readonly typed = new E.Cell<string | undefined>(undefined)

  /** Range start partner:  the calendar `start-calendar` names, once it has rendered. */
  readonly startPartner = new E.Cell<UICalendar | undefined>(undefined)

  /** Range end partner:  the calendar `end-calendar` names, once it has rendered. */
  readonly endPartner = new E.Cell<UICalendar | undefined>(undefined)

  /** Host `<label>`s and `aria-label`, as the field's name. */
  readonly labels = new F.ControlLabels(this.formHost)

  /** The popup button's glyph:  `icon`, else `calendar` (`clock` for `time`). */
  readonly glyph = new E.IconGlyph(
    this,
    () => this.attrs.icon || (this.attrs.type === "time" ? CLOCK_ICON : CALENDAR_ICON)
  )

  /** Previous-page glyph. */
  readonly previousGlyph = new E.IconGlyph(this, () => PREVIOUS_ICON)

  /** Next-page glyph. */
  readonly nextGlyph = new E.IconGlyph(this, () => NEXT_ICON)

  /** Starting value, for form reset:  the `value` ATTRIBUTE. */
  private readonly initialValue = untrack(
    () => this.host.getAttribute(this.definition.attribute("value").attribute) ?? undefined
  )

  /** Ids / anchor name, from `UI.ids` once rendering. */
  private ids = { popup: "", title: "", anchor: "" }

  /** The text field (popup calendars only). */
  private control?: HTMLInputElement

  /** The popover holding the picker (popup calendars only). */
  private popup?: HTMLElement

  /** The `<table role=grid>`, once the picker shows. */
  private grid?: HTMLTableElement

  /** Move real focus to the focused cell after the next render (keyboard, the icon button, a click in a view). */
  private shouldMoveFocus = false

  /** This element's `UI.overlays` entry. */
  private readonly overlay: E.OverlayEntry = {
    element: this.host,
    kind: "popover",
    onDismiss: () => void this.setOpen(false)
  }

  constructor(...args: ConstructorParameters<typeof F.FormElement>) {
    super(...args)
    // SSR renders the field only:  no runtime, no Temporal
    if (!isServer && !untrack(() => this.temporal.get())) {
      void UI.load()
        .then(() => UI.i18n.loadTemporal())
        .then((temporal) => this.temporal.set(temporal))
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
    const temporal = this.temporal.get()
    return temporal ? new CalendarDates({ temporal, type: this.type() }) : undefined
  })

  /**
   * Words in the calendar's locale.
   * - `lazy`:  `UI` exists only once the runtime has loaded, i.e. by the first render.
   */
  readonly words = createMemo(() => new CalendarText({ i18n: UI.i18n, locale: this.attrs.locale ?? UI.i18n.locale }), {
    lazy: true
  })

  /** The chosen moment, or `undefined`. */
  readonly value = createMemo(() => this.dates()?.parse(this.valueState.get()))

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
    UICalendar.later(this.dates(), this.dates()?.parse(this.attrs.min), this.partner("start"))
  )

  /** Latest choosable moment:  `max`, or an earlier range end. */
  readonly max = createMemo(() =>
    UICalendar.earlier(this.dates(), this.dates()?.parse(this.attrs.max), this.partner("end"))
  )

  /** The focused moment (see `focusState`). */
  readonly focusMoment = createMemo((): Moment | undefined => {
    const dates = this.dates()
    if (!dates) return undefined
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

  /** Disabled by its attribute, or by a disabled fieldset. */
  isDisabled(): boolean {
    return this.attrs.disabled || this.formDisabled.get()
  }

  /** The field's text:  what's being typed, else the value's. */
  fieldText(): string {
    const typed = this.typed.get()
    if (typed !== undefined) return typed
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
  private range(dates: CalendarDates, focus: Moment): readonly [Moment, Moment] | undefined {
    const own = this.value() ?? focus
    const start = this.partner("start")
    const end = this.partner("end")
    const span = start ? ([start, own] as const) : end ? ([own, end] as const) : undefined
    return span && dates.compare(span[0], span[1], "minute") <= 0 ? span : undefined
  }

  /** A range partner's value;  tracked. */
  private partner(which: "start" | "end"): Moment | undefined {
    const partner = (which === "start" ? this.startPartner : this.endPartner).get()
    return partner?.value()
  }

  /** Name of the popup button and dialog. */
  private chooseText(): string {
    return this.text(this.type() === "time" ? "calendarChooseTime" : "calendarChooseDate")
  }

  ////////////////
  // ## Element hooks
  ////////////////

  /** `open` and `disabled` follow the state, not the attribute. */
  protected classValue(name: E.AttributeName<Vocabulary>): unknown {
    if (name === "open") return this.isOpen()
    if (name === "disabled") return this.isDisabled()
    return super.classValue(name)
  }

  protected hostStates() {
    return { open: this.isOpen(), disabled: this.isDisabled(), fluid: this.attrs.fluid, inline: this.attrs.inline }
  }

  formValue(): E.FieldValue {
    // `null`:  `setFormValue()`'s "no value"
    return String(this.valueState.get() ?? "") || null
  }

  protected formName(): string | undefined {
    return this.attrs.name
  }

  /** Back to the `value` attribute;  drops typed text. */
  formReset() {
    this.valueState.set((this.initialValue ?? "") as never)
    this.typed.set(undefined)
    this.focusState.set(undefined)
  }

  protected rules(): E.ValidationRule[] {
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

  /** Creates the popover, focus and range-partner effects (`effects()`), then the content. */
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
            class={PICKER_CLASS}
            role={this.labels.name() ? UIT.GROUP : undefined}
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

  /** Server render only (`$/ui/static`):  the field's `STATIC_CONTROL` mark;  `{}` in a browser. */
  private staticControl(): Record<string, unknown> {
    return isServer ? { [UIT.STATIC_CONTROL]: "" } : {}
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
          class={[INPUT_CLASS, { [UIT.FLUID]: this.attrs.fluid, [UIT.DISABLED]: this.isDisabled() }]}
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
            aria-required={this.attrs.required ? UIT.TRUE : undefined}
            aria-invalid={this.validation().valid ? undefined : UIT.TRUE}
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
            aria-expanded={this.isOpen() ? UIT.TRUE : UIT.FALSE}
            aria-controls={this.ids.popup}
            onClick={this.onTriggerClick}
          >
            {this.glyph.svg()}
          </button>
        </div>
        <div
          ref={(element) => (this.popup = element)}
          id={this.ids.popup}
          class={`${POPUP_CLASS} ${this.attrs.position ?? DEFAULT_POSITION}`}
          part={this.part("popup")}
          popover={UIT.MANUAL}
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
              <button type="button" class={TODAY_CLASS} part={this.part("today")} onClick={this.onToday}>
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
          class={PREVIOUS_CLASS}
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
          class={TITLE_CLASS}
          part={this.part("title")}
          disabled={!page().up}
          aria-live="polite"
          onClick={this.onTitleClick}
        >
          {page().title}
        </button>
        <button
          type="button"
          class={NEXT_CLASS}
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
        class={`${TABLE_CLASS} ${E.numberToWord(page().columns)} ${COLUMN_CLASS} ${page().mode}`}
        part={this.part("grid")}
        role="grid"
        aria-labelledby={this.type() === "time" ? undefined : this.ids.title}
        aria-label={
          this.type() === "time" ? this.text(page().mode === "hour" ? "calendarHours" : "calendarMinutes") : undefined
        }
        aria-readonly={this.attrs.readonly ? UIT.TRUE : undefined}
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
          CELL_CLASS,
          {
            [ADJACENT_CLASS]: cell().adjacent,
            [UIT.DISABLED]: cell().disabled,
            [UIT.ACTIVE]: cell().active,
            [TODAY_CELL_CLASS]: cell().today,
            [FOCUS_CLASS]: cell().focus,
            [RANGE_CLASS]: cell().range
          }
        ]}
        part={this.part("cell")}
        tabindex={cell().focus ? 0 : -1}
        aria-selected={cell().active ? UIT.TRUE : UIT.FALSE}
        aria-disabled={cell().disabled ? UIT.TRUE : undefined}
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
      (isOpen) => {
        const { popup } = this
        if (!isOpen || !popup) return
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
        if (this.shouldMoveFocus) this.focusGrid()
      }
    )
    createEffect(
      () => [this.connected.get(), this.attrs.startCalendar, this.attrs.endCalendar] as const,
      ([isConnected, start, end]) => {
        if (!isConnected) return
        void this.resolvePartner(start, this.startPartner)
        void this.resolvePartner(end, this.endPartner)
      }
    )
  }

  /** Find the calendar `id` names in this one's tree, wait for it to render, keep its controller in `cell`. */
  private async resolvePartner(id: string | undefined, cell: E.Cell<UICalendar | undefined>) {
    const found = id
      ? ((this.host.getRootNode() as Document | ShadowRoot).getElementById?.(id) ?? undefined)
      : undefined
    if (!found || !("ready" in found)) return cell.set(undefined)
    await (found as E.UIHost).ready
    const controller = (found as E.UIHost).controller
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
    const isApplied = this.openState.request(open, () => this.emit(open ? "ui-open" : "ui-close", detail))
    if (isApplied && open) {
      this.modeState.set(undefined)
      this.focusState.set(undefined)
    }
    return isApplied
  }

  /**
   * Set the value to `moment` (`undefined` clears), dispatching the cancelable `ui-change` first;  true when applied.
   * - SIDE EFFECT:  drops typed text either way (a vetoed value shows the old one again).
   */
  commit(moment: Moment | undefined, originalEvent?: Event): boolean {
    const dates = untrack(() => this.dates())
    if (!dates) return false
    const value = moment ? dates.format(moment) : ""
    const detail: UIT.CalendarChangeDetail = { value, originalEvent }
    this.typed.set(undefined)
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
      else this.shouldMoveFocus = true
      return
    }
    this.focusState.set(UICalendar.merge(cell.moment, focus, mode))
    this.modeState.set(next)
    this.shouldMoveFocus = true
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
    if (text === undefined) return
    const dates = untrack(() => this.dates())
    if (!dates) return
    if (!text.trim()) return void this.commit(undefined, event)
    const moment = untrack(() => this.words()).read(text, dates)
    const [min, max] = untrack(() => [this.min(), this.max()])
    if (
      !moment ||
      (min && dates.compare(moment, min, "minute") < 0) ||
      (max && dates.compare(moment, max, "minute") > 0)
    )
      return this.typed.set(undefined)
    this.commit(moment, event)
  }

  /** A click in the field opens the popup;  focus stays in the field, for typing. */
  private readonly onFieldClick = (event: MouseEvent) => {
    this.setOpen(true, event)
  }

  /** Field keys:  Enter reads the text;  ArrowDown opens with focus in the grid (or moves it there). */
  private readonly onFieldKeyDown = (event: KeyboardEvent) => {
    if (event.key === UIT.Key.enter) {
      event.preventDefault()
      this.readTyped(event)
      this.setOpen(false, event)
    } else if (event.key === UIT.Key.arrowDown) {
      event.preventDefault()
      this.shouldMoveFocus = true
      if (!this.setOpen(true, event)) this.focusGrid()
    }
  }

  /** The icon button:  toggles;  opening puts focus in the grid (APG). */
  private readonly onTriggerClick = (event: MouseEvent) => {
    const isOpen = untrack(() => this.isOpen())
    this.shouldMoveFocus = !isOpen
    this.setOpen(!isOpen, event)
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
    if (event.key === UIT.Key.enter || event.key === UIT.Key.space) {
      event.preventDefault()
      const cell = untrack(() => this.page())
        ?.rows.flat()
        .find((each) => each.focus)
      if (cell) this.choose(cell, event)
      return
    }
    const next = CalendarView.move(input, event)
    if (!next) return
    event.preventDefault()
    this.focusState.set(next)
    this.shouldMoveFocus = true
  }

  /** Focus leaving the host (to something else that takes focus) closes the popup. */
  private readonly onFocusOut = (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null
    if (!next || this.host.contains(next) || this.host.renderRoot.contains(next)) return
    this.setOpen(false, event)
  }

  ////////////////
  // ## Focus
  ////////////////

  /** Focus the focused cell now, if the grid is showing. */
  private focusGrid() {
    const cell = this.grid?.isConnected ? this.grid.querySelector<HTMLElement>(FOCUSED_CELL) : undefined
    if (!cell) return
    this.shouldMoveFocus = false
    cell.focus()
  }

  /** Focus the field (or, inline, the grid's tab stop). */
  focus(options?: FocusOptions) {
    if (this.control) this.control.focus(options)
    else this.grid?.querySelector<HTMLElement>(FOCUSED_CELL)?.focus(options)
  }

  ////////////////
  // ## Statics
  ////////////////

  /**
   * Load `Temporal` before a static server render, so its pickers render in full (header, grid, cells):  the render
   * is synchronous, and node has no `Temporal`, so `UI.i18n` loads `temporal-polyfill` (`loadTemporal()`).
   * - Called by `StaticRender.prepare(html)` (`$/ui/static`) for a page with this tag;  NEVER in a browser, where
   *   the constructor loads it after first paint, as before.
   * - STATIC:  it runs before any calendar exists (`SSR.StaticPreload`).
   * - NOTE: "today" (highlight, starting page) is then the RENDER's day.
   */
  static preload(): Promise<unknown> {
    return UI.i18n.loadTemporal()
  }

  /**
   * `Temporal` if it's here now:  the runtime is loaded and has one (native, or the polyfill already loaded).
   * - STATIC:  read in a field initializer, before the runtime may exist, hence the global check.
   */
  private static temporalNow(): E.TemporalAPI | undefined {
    return (globalThis as E.RuntimeGlobal)[E.RUNTIME_KEY] ? UI.i18n.temporal : undefined
  }

  /**
   * `moment`'s fields down to `mode`, the finer ones from `focus` (day clamped to the month).
   * - STATIC, as the helpers below:  pure over its arguments.
   */
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
  private static later(
    dates: CalendarDates | undefined,
    a: Moment | undefined,
    b: Moment | undefined
  ): Moment | undefined {
    if (!dates || !a || !b) return a ?? b
    return dates.compare(a, b, "minute") >= 0 ? a : b
  }

  /** The earlier of two bounds (either may be missing). */
  private static earlier(
    dates: CalendarDates | undefined,
    a: Moment | undefined,
    b: Moment | undefined
  ): Moment | undefined {
    if (!dates || !a || !b) return a ?? b
    return dates.compare(a, b, "minute") <= 0 ? a : b
  }

  /** A `json` property as an array (anything else:  empty). */
  private static asArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : []
  }
}

////////////////
// ## Markup
// Class words of the markup contract (`ui-calendar.css`) -- grammar, not attributes, so not in the vocabulary.
// Fomantic's cell classes:  `active` === chosen, `focus` === the keyboard's cell, `adjacent` === another month's
// day, `range` === inside a range.
////////////////

/** The field's box (`ui-input.css`'s grammar). */
const INPUT_CLASS = "ui left icon input"

/** The popover, before its `position` words. */
const POPUP_CLASS = "ui calendar popup"

/** The picker's box. */
const PICKER_CLASS = "calendar"

/** The previous-page button. */
const PREVIOUS_CLASS = "prev link"

/**
 * The title button.
 * - NOT `UIT.TITLE` (`"title"`, the native tooltip attribute):  a class string of its own (epic `wwod-spell-ui`).
 */
const TITLE_CLASS = "title link"

/** The next-page button. */
const NEXT_CLASS = "next link"

/** The grid, before its column count word, `COLUMN_CLASS` and the view. */
const TABLE_CLASS = "ui celled center aligned unstackable"

/** The grid's words after its column count:  `seven column table`. */
const COLUMN_CLASS = "column table"

/** The Today / Now button. */
const TODAY_CLASS = "today link"

/**
 * Every cell.
 * - NOT `UIT.ANCHOR_TAG` (`"a"`, the link TAG):  Fomantic's `link` class word (epic `wwod-spell-ui`).
 */
const CELL_CLASS = "link"

/** A day of another month. */
const ADJACENT_CLASS = "adjacent"

/** The cell holding today. */
const TODAY_CELL_CLASS = "today"

/** The keyboard's cell. */
const FOCUS_CLASS = "focus"

/** A cell inside the range. */
const RANGE_CLASS = "range"

/** The grid's tab stop:  the focused cell. */
const FOCUSED_CELL = "td[tabindex='0']"

////////////////
// ## Other constants
////////////////

/** Fomantic's default popup position. */
const DEFAULT_POSITION = "bottom left"

/** `UI.ids` prefix. */
const ID_PREFIX = "ui-calendar"

/** Hidden input carrying an inline calendar's value in a static server render:  `type`. */
const HIDDEN = "hidden"

/** Inline custom property naming the field's anchor (`ui-calendar.css`). */
const ANCHOR_PROPERTY = "--_ui-calendar-anchor"

/** Glyph of the popup button of a date calendar. */
const CALENDAR_ICON = "calendar"

/** Glyph of the popup button of a `time` calendar. */
const CLOCK_ICON = "clock"

/** Glyph of the previous-page button. */
const PREVIOUS_ICON = "chevron-left"

/** Glyph of the next-page button. */
const NEXT_ICON = "chevron-right"

/** Previous / next text keys, per view. */
const PAGE_TEXTS = {
  year: ["calendarPreviousYears", "calendarNextYears"],
  month: ["calendarPreviousYear", "calendarNextYear"],
  day: ["calendarPreviousMonth", "calendarNextMonth"],
  hour: ["calendarPreviousDay", "calendarNextDay"],
  minute: ["calendarPreviousDay", "calendarNextDay"]
} as const
