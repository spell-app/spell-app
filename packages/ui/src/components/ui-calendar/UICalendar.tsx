import { For, Show, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { F } from "$/ui/forms"
import { calendarVocabulary } from "./UICalendar.en"
import { CalendarFallback } from "./UICalendar.fallback"
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
} from "./UICalendar.types"

import inputCSS from "$/ui/components/ui-input/UIInput.css?inline"
import calendarCSS from "./UICalendar.css?inline"

/****************
 * ### `UICalendar`
 * The component behind `<ui-calendar>`:  a date and / or time picker.
 *
 * - Its shadow DOM:  a text field (`ui left icon input`) whose icon button opens a popover dialog with the picker;
 *   or, with `inline`, the picker itself.
 *   The picker is a header (previous / title / next) over a `<table role=grid>` in Fomantic's class grammar
 *   (`ui celled center aligned unstackable seven column table day`), then an optional Today / Now button.
 *
 * - Views (Fomantic's modes):  years => months => days => hours => minutes, as far as `type` goes
 *   (`CalendarDates.modes()`).
 *   Choosing a cell in a coarser view opens the next finer one;  the finest sets the value.
 *   The title button goes back up.  Pages, cells and bounds are `CalendarView`'s.
 *
 * - Dates are `Temporal` (`UI.i18n.temporal`):  the browser's own, else `temporal-polyfill`, loaded lazily;
 *   the picker renders once it's here.
 *   Names, formats and the 12 / 24 hour clock are the locale's `Intl` (`CalendarText`).
 *
 * - Keyboard (the WAI-ARIA APG's date picker dialog):
 *   - real focus on ONE gridcell (`tabindex=0`, the focus moment)
 *   - arrows, Home / End, PageUp / PageDown (+ Shift) move it (`CalendarView.move()`), across pages;
 *     Enter / Space choose
 *   - ArrowDown in the field (or on the icon button) opens the popup, with focus in the grid;
 *     Escape (from `UI.overlays`) closes it, and focus returns to where it was
 *   - NOT `UI.focus.roving`:  the tab stop is a DATE that pages the grid, not an item of a fixed list.
 *
 * - Typing:  the field's text is read on `change` / Enter (`CalendarText.read()`);
 *   unreadable or out-of-range text goes back to the value's.
 * - `value` and `open` are controlled (`@controlled`):  `ui-change` / `ui-open` / `ui-close` go first,
 *   and are cancelable.  The `value` ATTRIBUTE is the starting (and form-reset) value.
 * - Ranges (Fomantic's `startCalendar` / `endCalendar`):
 *   `start-calendar="id"` makes this the END (the partner's value is its minimum),
 *   and `end-calendar="id"` the START;  the span between them is highlighted.
 *   The partner is read through its component, so its changes are live.
 * - A form control:  it submits the ISO value;  `required`, reset, a disabled fieldset;  restores a saved state.
 ****************/
export class UICalendar extends F.FormComponent<Vocabulary> {
  @E.proto static vocabulary = calendarVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { input: inputCSS, calendar: calendarCSS },
    Fallback: CalendarFallback
  } satisfies Partial<E.ElementSetup>

  /** The DOM element's `<label>`s and `aria-label`, as the field's name. */
  readonly labels = new F.ControlLabels(this.domFormElement)

  /** The popup button's glyph:  `icon`, else `calendar` (`clock` for `time`). */
  readonly iconGlyph = new E.IconGlyph({
    owner: this,
    name: () => this.icon || (this.type === "time" ? CLOCK_ICON : CALENDAR_ICON)
  })

  /** Previous-page glyph. */
  readonly previousGlyph = new E.IconGlyph({ owner: this, name: () => PREVIOUS_ICON })

  /** Next-page glyph. */
  readonly nextGlyph = new E.IconGlyph({ owner: this, name: () => NEXT_ICON })

  /** Ids / anchor name, from `UI.ids` once rendering. */
  private ids = { popup: "", title: "", anchor: "" }

  /** The text field (popup calendars only). */
  private control?: HTMLInputElement

  /** The popover holding the picker (popup calendars only). */
  private popup?: HTMLElement

  /** The `<table role=grid>`, once the picker shows. */
  private grid?: HTMLTableElement

  constructor(...args: ConstructorParameters<typeof F.FormComponent>) {
    super(...args)
    // SSR renders the field only:  no runtime, no Temporal
    if (!isServer && !untrack(() => this.temporal)) {
      void UI.load()
        .then(() => UI.i18n.loadTemporal())
        .then((temporal) => {
          this.temporal = temporal
        })
    }
    this.domElement.addEventListener("focusout", this.onFocusOut)
  }

  onFormStateRestore(state: File | string | FormData | null) {
    this.value = typeof state === "string" ? state : ""
  }

  ////////////////
  // ## Dates
  ////////////////

  /** The page's `Temporal`, once here;  at once when the runtime is loaded and the browser has one. */
  @E.state accessor temporal: E.TemporalAPI | undefined = UICalendar.temporalNow()

  /** The calendar's type:  `type`, else Fomantic's default (an unknown `type` converts to `undefined`). */
  get calendarType(): UIT.CalendarType {
    return this.type ?? DEFAULT_TYPE
  }

  /** Date arithmetic, once `Temporal` is here. */
  @E.derived
  get dates(): CalendarDates | undefined {
    const temporal = this.temporal
    return temporal ? new CalendarDates({ temporal, type: this.calendarType }) : undefined
  }

  /**
   * Words in the calendar's locale.
   * - Computed on first read:  `UI` exists only once the runtime has loaded, i.e. by the first render.
   */
  @E.derived
  get words(): CalendarText {
    return new CalendarText({ i18n: UI.i18n, locale: this.locale ?? UI.i18n.locale })
  }

  ////////////////
  // ## The value
  ////////////////

  /** `value`, the ISO string:  set by the page, or picked (`""` to start). */
  @E.controlled("value") accessor value = ""

  /** The chosen moment, or `undefined`. */
  @E.derived
  get chosenMoment(): Moment | undefined {
    return this.dates?.parse(this.value)
  }

  /** Text being typed into the field;  `undefined`:  the value's text. */
  @E.state accessor typedText: string | undefined = undefined

  /** The field's text:  what's being typed, else the value's. */
  @E.derived
  get fieldText(): string {
    const typedText = this.typedText
    if (typedText !== undefined) return typedText
    const chosenMoment = this.chosenMoment
    if (chosenMoment) return this.words.value(chosenMoment, this.calendarType)
    if (!isServer) return ""
    // server render:  no `Temporal`, so the value's fields read by hand, formatted as a browser would
    const fields = CalendarDates.isoFields(String(this.value ?? ""), this.calendarType)
    return fields ? this.words.value(fields, this.calendarType) : String(this.value ?? "")
  }

  /**
   * Set the value to `moment` (`undefined` clears), dispatching the cancelable `ui-change` first;  true when applied.
   * - SIDE EFFECT:  drops typed text either way (a vetoed value shows the old one again).
   */
  commit(moment: Moment | undefined, originalEvent?: Event): boolean {
    const dates = untrack(() => this.dates)
    if (!dates) return false
    const value = moment ? dates.format(moment) : ""
    const detail: UIT.CalendarChangeDetail = { value, originalEvent }
    this.typedText = undefined
    return this.requestChange("value", value, () => this.send("ui-change", detail))
  }

  /** Typing:  kept until `change`. */
  private readonly onInput = (event: Event) => {
    this.typedText = (event.currentTarget as HTMLInputElement).value
  }

  /** `change` (blur or Enter):  read the text. */
  private readonly onChange = (event: Event) => {
    this.commitTypedText(event)
  }

  /** Commit typed text to the value;  empty clears, unreadable or out-of-range reverts. */
  private commitTypedText(event: Event) {
    const text = untrack(() => this.typedText)
    if (text === undefined) return
    const dates = untrack(() => this.dates)
    if (!dates) return
    if (!text.trim()) return void this.commit(undefined, event)
    const moment = untrack(() => this.words).read(text, dates)
    const [earliest, latest] = untrack(() => [this.earliest, this.latest])
    if (
      !moment ||
      (earliest && dates.compare(moment, earliest, "minute") < 0) ||
      (latest && dates.compare(moment, latest, "minute") > 0)
    ) {
      this.typedText = undefined
      return
    }
    this.commit(moment, event)
  }

  ////////////////
  // ## The popup
  ////////////////

  /** `open`, as asked:  set by the page, or opened and closed by a person. */
  @E.controlled("open") accessor isOpen = false

  /** The popup is open now (never `inline`). */
  @E.cssState("open")
  get popupIsOpen(): boolean {
    return this.isOpen && !this.inline
  }

  /** This element's `UI.overlays` entry. */
  private readonly overlay: E.OverlayEntry = {
    element: this.domElement,
    kind: "popover",
    onDismiss: () => void this.requestOpen(false)
  }

  /**
   * Open or close the popup, dispatching the cancelable `ui-open` / `ui-close` first;  true when applied.
   * - Opening starts over in the type's first view, on the value (or `initial-date`, or today).
   */
  requestOpen(open: boolean, originalEvent?: Event): boolean {
    if (this.inline || open === untrack(() => this.popupIsOpen)) return false
    if (open && (this.isDisabled || this.readonly)) return false
    const detail: UIT.CalendarOpenDetail = { open, originalEvent }
    const isApplied = this.requestChange("isOpen", open, () => this.send(open ? "ui-open" : "ui-close", detail))
    if (isApplied && open) {
      this.explicitMode = undefined
      this.explicitFocus = undefined
    }
    return isApplied
  }

  /** Popover + overlay registration while open AND connected AND drawn. */
  @E.onChange("popupIsOpen", "isConnected", "isReady")
  protected onPopupOpenChanged(popupIsOpen: boolean, isConnected: boolean, isReady: boolean) {
    const { popup } = this
    if (!popupIsOpen || !isConnected || !isReady || !popup) return
    if (!popup.matches(":popover-open")) popup.showPopover()
    UI.overlays.open(this.overlay)
    return () => {
      if (popup.matches(":popover-open")) popup.hidePopover()
      UI.overlays.close(this.overlay)
    }
  }

  /** A click in the field opens the popup;  focus stays in the field, for typing. */
  private readonly onFieldClick = (event: MouseEvent) => {
    this.requestOpen(true, event)
  }

  /** Field keys:  Enter reads the text;  ArrowDown opens with focus in the grid (or moves it there). */
  private readonly onFieldKeyDown = (event: KeyboardEvent) => {
    if (event.key === UIT.Key.enter) {
      event.preventDefault()
      this.commitTypedText(event)
      this.requestOpen(false, event)
    } else if (event.key === UIT.Key.arrowDown) {
      event.preventDefault()
      this.shouldMoveFocus = true
      if (!this.requestOpen(true, event)) this.focusGrid()
    }
  }

  /** The icon button:  toggles;  opening puts focus in the grid (APG). */
  private readonly onTriggerClick = (event: MouseEvent) => {
    const popupIsOpen = untrack(() => this.popupIsOpen)
    this.shouldMoveFocus = !popupIsOpen
    this.requestOpen(!popupIsOpen, event)
  }

  /** Focus leaving the DOM element (to something else that takes focus) closes the popup. */
  private readonly onFocusOut = (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null
    if (!next || this.domElement.contains(next) || this.domElement.renderRoot.contains(next)) return
    this.requestOpen(false, event)
  }

  /** Name of the popup button and dialog. */
  private get chooseLabel(): string {
    return this.translationForKey(this.calendarType === "time" ? "calendarChooseTime" : "calendarChooseDate")
  }

  ////////////////
  // ## Views and pages
  ////////////////

  /** The view shown;  `undefined`:  the type's starting view. */
  @E.state accessor explicitMode: UIT.CalendarMode | undefined = undefined

  /** The focused moment;  `undefined`:  the value's, else `initial-date`, else now. */
  @E.state accessor explicitFocus: Moment | undefined = undefined

  /** The views to walk through, coarse to fine. */
  @E.derived
  get modes(): readonly UIT.CalendarMode[] {
    return (
      this.dates?.modes({
        disableMinute: this.disableMinute,
        disableMonth: this.disableMonth,
        disableYear: this.disableYear
      }) ?? []
    )
  }

  /** The view shown. */
  get mode(): UIT.CalendarMode {
    return this.explicitMode ?? CalendarDates.startMode(this.modes)
  }

  /** Earliest choosable moment:  `min`, or a later range start. */
  @E.derived
  get earliest(): Moment | undefined {
    return UICalendar.later(this.dates, this.dates?.parse(this.min), this.partnerMoment("start"))
  }

  /** Latest choosable moment:  `max`, or an earlier range end. */
  @E.derived
  get latest(): Moment | undefined {
    return UICalendar.earlier(this.dates, this.dates?.parse(this.max), this.partnerMoment("end"))
  }

  /** The focused moment (see `explicitFocus`). */
  @E.derived
  get focusedMoment(): Moment | undefined {
    const dates = this.dates
    if (!dates) return undefined
    const start = this.explicitFocus ?? this.chosenMoment ?? dates.parse(this.initialDate) ?? dates.now()
    return this.explicitFocus ? start : dates.clamp(start, this.earliest, this.latest)
  }

  /** The page shown, see `CalendarView`. */
  @E.derived
  get page(): CalendarPage | undefined {
    const input = this.viewInput
    return input ? CalendarView.build(input) : undefined
  }

  /** What `CalendarView` needs, or `undefined` before `Temporal`. */
  private get viewInput(): ViewInput | undefined {
    const dates = this.dates
    const focus = this.focusedMoment
    if (!dates || !focus) return undefined
    const words = this.words
    return {
      dates,
      text: words,
      mode: this.mode,
      modes: this.modes,
      focus,
      value: this.chosenMoment,
      today: dates.now(),
      min: this.earliest,
      max: this.latest,
      firstDayOfWeek: this.firstDayOfWeek ?? words.firstDayOfWeek(),
      disabledDates: new Set(UICalendar.asArray(this.disabledDates).map((date) => String(date))),
      disabledDays: new Set(UICalendar.asArray(this.disabledDaysOfWeek).map(Number)),
      selectAdjacentDays: this.selectAdjacentDays,
      range: this.range(dates, focus)
    }
  }

  /** The span to highlight:  from a range start to this end, or from this start to a range end. */
  private range(dates: CalendarDates, focus: Moment): readonly [Moment, Moment] | undefined {
    const own = this.chosenMoment ?? focus
    const start = this.partnerMoment("start")
    const end = this.partnerMoment("end")
    const span = start ? ([start, own] as const) : end ? ([own, end] as const) : undefined
    return span && dates.compare(span[0], span[1], "minute") <= 0 ? span : undefined
  }

  /**
   * A cell was chosen:  the finest view sets the value (and closes the popup);  a coarser one opens the next view
   * on that cell, keeping the finer fields of the focus (a month chosen keeps the day, clamped).
   */
  choose(cell: CalendarCell, originalEvent?: Event) {
    const dates = untrack(() => this.dates)
    const focus = untrack(() => this.focusedMoment)
    if (!dates || !focus || cell.disabled || this.readonly || this.isDisabled) return
    const modes = untrack(() => this.modes)
    const mode = untrack(() => this.mode)
    const next = modes[modes.indexOf(mode) + 1]
    if (!next) {
      this.explicitFocus = cell.moment
      if (this.commit(cell.moment, originalEvent)) this.requestOpen(false, originalEvent)
      else this.shouldMoveFocus = true
      return
    }
    this.explicitFocus = UICalendar.merge(cell.moment, focus, mode)
    this.explicitMode = next
    this.shouldMoveFocus = true
  }

  /** Page to `target` (previous / next), keeping keyboard focus where it was. */
  private turnPage(target: Moment, event: Event) {
    event.preventDefault()
    this.explicitFocus = target
  }

  /** The title:  up to the coarser view. */
  private readonly onTitleClick = () => {
    const up = untrack(() => this.page)?.up
    if (up) this.explicitMode = up
  }

  /** Today / Now:  the value becomes today (to the type's unit), and the popup closes. */
  private readonly onToday = (event: MouseEvent) => {
    const dates = untrack(() => this.dates)
    if (!dates || this.readonly || this.isDisabled) return
    const final = untrack(() => this.modes).at(-1)!
    if (this.commit(dates.floor(dates.now(), final), event)) this.requestOpen(false, event)
  }

  /** Grid keys (APG):  move the focus moment, choose, or pass on. */
  private readonly onGridKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
    const input = untrack(() => this.viewInput)
    if (!input) return
    if (event.key === UIT.Key.enter || event.key === UIT.Key.space) {
      event.preventDefault()
      const cell = untrack(() => this.page)
        ?.rows.flat()
        .find((each) => each.focus)
      if (cell) this.choose(cell, event)
      return
    }
    const next = CalendarView.move(input, event)
    if (!next) return
    event.preventDefault()
    this.explicitFocus = next
    this.shouldMoveFocus = true
  }

  ////////////////
  // ## Range partners
  ////////////////

  /** Range start partner:  the calendar `start-calendar` names, once it has rendered. */
  @E.state accessor startPartner: UICalendar | undefined = undefined

  /** Range end partner:  the calendar `end-calendar` names, once it has rendered. */
  @E.state accessor endPartner: UICalendar | undefined = undefined

  /** A range partner's chosen moment. */
  private partnerMoment(which: "start" | "end"): Moment | undefined {
    const partner = which === "start" ? this.startPartner : this.endPartner
    return partner?.chosenMoment
  }

  /** Connected, or the partner ids changed:  find the partners. */
  @E.onChange("isConnected", "startCalendar", "endCalendar")
  protected onPartnersChanged(isConnected: boolean, start: string | undefined, end: string | undefined) {
    if (!isConnected) return
    void this.resolvePartner(start, "startPartner")
    void this.resolvePartner(end, "endPartner")
  }

  /** Find the calendar `id` names in this one's tree, wait for it to render, keep its component in `which`. */
  private async resolvePartner(id: string | undefined, which: "startPartner" | "endPartner") {
    const found = id
      ? ((this.domElement.getRootNode() as Document | ShadowRoot).getElementById?.(id) ?? undefined)
      : undefined
    if (!found || !("ready" in found)) {
      this[which] = undefined
      return
    }
    await (found as E.DOMElement).ready
    const component = (found as E.DOMElement).component
    this[which] = component instanceof UICalendar ? component : undefined
  }

  ////////////////
  // ## Disabled and classes
  ////////////////

  /** Disabled by its attribute, or by a disabled fieldset. */
  @E.cssState("disabled")
  get isDisabled(): boolean {
    return this.disabled || this.formIsDisabled
  }

  /** Block-level:  its `fluid` attribute. */
  @E.cssState("fluid")
  get isFluid(): boolean {
    return this.fluid
  }

  /** The grid sits in the page:  its `inline` attribute. */
  @E.cssState("inline")
  get isInline(): boolean {
    return this.inline
  }

  /** `open` and `disabled` follow the state, not the attribute. */
  protected classValue(name: E.AttributeName<Vocabulary>): unknown {
    if (name === "open") return this.popupIsOpen
    if (name === "disabled") return this.isDisabled
    return super.classValue(name)
  }

  ////////////////
  // ## Form
  ////////////////

  /** Starting value, for form reset:  the `value` ATTRIBUTE. */
  private readonly initialValue = untrack(() => this.attributes.value) ?? undefined

  get formValue(): E.FieldValue {
    // `null`:  `setFormValue()`'s "no value"
    return String(this.value ?? "") || null
  }

  protected get formName(): string | undefined {
    return this.name
  }

  /** Back to the `value` attribute;  drops typed text. */
  onFormReset() {
    this.value = this.initialValue ?? ""
    this.typedText = undefined
    this.explicitFocus = undefined
  }

  protected get validationRules(): E.ValidationRule[] {
    return this.required ? [UIT.REQUIRED_RULE] : []
  }

  protected get validationLabel(): string | undefined {
    return this.labels.accessibleName ?? this.placeholder
  }

  protected get validationAnchor(): HTMLElement | undefined {
    return this.control ?? this.grid?.querySelector<HTMLElement>(FOCUSED_CELL) ?? undefined
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    this.ids = { popup: UI.ids.next(ID_PREFIX), title: UI.ids.next(ID_PREFIX), anchor: `--${UI.ids.next(ID_PREFIX)}` }
    return (
      <div class={this.rootClass} part={this.partForName("calendar")} style={{ [ANCHOR_PROPERTY]: this.ids.anchor }}>
        <Show when={this.inline} fallback={this.popupMode()}>
          <div
            class={PICKER_CLASS}
            role={this.labels.accessibleName ? "group" : undefined}
            aria-label={this.labels.accessibleName}
            inert={this.isDisabled}
          >
            {this.picker()}
          </div>
        </Show>
        {isServer && this.staticValue()}
      </div>
    )
  }

  /** Server render only (`$/ui/static`):  the field's `STATIC_CONTROL` mark;  `{}` in a browser. */
  private get staticControl(): Record<string, unknown> {
    return isServer ? { [UIT.STATIC_CONTROL]: "" } : {}
  }

  /**
   * Server render only:  the ISO value as a hidden input, so a static form submits it as the DOM element would
   * (`ElementInternals`) -- the field shows it formatted.
   */
  private staticValue(): JSX.Element {
    const name = this.name
    const value = this.formValue
    if (!name || value === null) return undefined
    return <input type="hidden" name={name} value={String(value)} disabled={this.isDisabled} />
  }

  /** Field + icon button + popover. */
  private popupMode(): JSX.Element {
    return (
      <>
        <div
          class={[INPUT_CLASS, { [UIT.FLUID]: this.fluid, [UIT.DISABLED]: this.isDisabled }]}
          part={this.partForName("input")}
        >
          <input
            ref={(element) => (this.control = element)}
            part={this.partForName("control")}
            type="text"
            autocomplete="off"
            placeholder={this.placeholder}
            disabled={this.isDisabled}
            readonly={this.readonly}
            value={this.fieldText}
            aria-label={this.labels.accessibleName ?? this.placeholder}
            aria-required={this.required ? "true" : undefined}
            aria-invalid={this.validation.valid ? undefined : "true"}
            {...this.staticControl}
            onInput={this.onInput}
            onChange={this.onChange}
            onClick={this.onFieldClick}
            onKeyDown={this.onFieldKeyDown}
          />
          <button
            type="button"
            class={UIT.ICON}
            part={this.partForName("trigger")}
            disabled={this.isDisabled || this.readonly}
            aria-label={this.chooseLabel}
            aria-haspopup="dialog"
            aria-expanded={this.popupIsOpen ? "true" : "false"}
            aria-controls={this.ids.popup}
            onClick={this.onTriggerClick}
          >
            {this.iconGlyph.svg}
          </button>
        </div>
        <div
          ref={(element) => (this.popup = element)}
          id={this.ids.popup}
          class={`${POPUP_CLASS} ${this.position ?? DEFAULT_POSITION}`}
          part={this.partForName("popup")}
          popover="manual"
          role="dialog"
          aria-label={this.chooseLabel}
        >
          <Show when={this.popupIsOpen}>{this.picker()}</Show>
        </div>
      </>
    )
  }

  /** Header, grid, today button;  nothing until `Temporal` is here. */
  private picker(): JSX.Element {
    return (
      <Show when={this.page}>
        {(page) => (
          <>
            <Show when={this.calendarType !== "time"}>{this.header(page)}</Show>
            {this.table(page)}
            <Show when={this.today}>
              <button type="button" class={TODAY_CLASS} part={this.partForName("today")} onClick={this.onToday}>
                {this.translationForKey(this.dates?.hasTime ? "calendarNow" : "calendarToday")}
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
      <div class={UIT.HEADER} part={this.partForName("header")}>
        <button
          type="button"
          class={PREVIOUS_CLASS}
          part={this.partForName("previous")}
          disabled={page().previous.disabled}
          aria-label={this.translationForKey(PAGE_TEXTS[page().mode][0])}
          onClick={(event) => this.turnPage(page().previous.target, event)}
        >
          {this.previousGlyph.svg}
        </button>
        <button
          type="button"
          id={this.ids.title}
          class={TITLE_CLASS}
          part={this.partForName("title")}
          disabled={!page().up}
          aria-live="polite"
          onClick={this.onTitleClick}
        >
          {page().title}
        </button>
        <button
          type="button"
          class={NEXT_CLASS}
          part={this.partForName("next")}
          disabled={page().next.disabled}
          aria-label={this.translationForKey(PAGE_TEXTS[page().mode][1])}
          onClick={(event) => this.turnPage(page().next.target, event)}
        >
          {this.nextGlyph.svg}
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
        part={this.partForName("grid")}
        role="grid"
        aria-labelledby={this.calendarType === "time" ? undefined : this.ids.title}
        aria-label={
          this.calendarType === "time"
            ? this.translationForKey(page().mode === "hour" ? "calendarHours" : "calendarMinutes")
            : undefined
        }
        aria-readonly={this.readonly ? "true" : undefined}
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
        part={this.partForName("cell")}
        tabindex={cell().focus ? 0 : -1}
        aria-selected={cell().active ? "true" : "false"}
        aria-disabled={cell().disabled ? "true" : undefined}
        aria-current={cell().today && this.mode === "day" ? "date" : undefined}
        aria-label={cell().label}
        onClick={(event) => this.choose(cell(), event)}
      >
        {cell().text}
      </td>
    )
  }

  ////////////////
  // ## Focus
  ////////////////

  /** Move real focus to the focused cell after the next render (keyboard, the icon button, a click in a view). */
  private shouldMoveFocus = false

  /** The page (or the popup) changed:  real focus to the focused cell, when asked. */
  @E.onChange("page", "popupIsOpen")
  protected onPageChanged() {
    if (this.shouldMoveFocus) this.focusGrid()
  }

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
   * Load `Temporal` before a static server render, so its pickers render in full (header, grid, cells):
   * the render is synchronous, and node has no `Temporal`, so `UI.i18n` loads `temporal-polyfill` (`loadTemporal()`).
   * - Called by `StaticRender.prepare(html)` (`$/ui/static`) for a page with this tag;  NEVER in a browser,
   *   where the constructor loads it after first paint, as before.
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

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UICalendar extends E.AttributeValues<Vocabulary> {}

////////////////
// ## Markup
// Class words of the markup contract (`UICalendar.css`) -- grammar, not attributes, so not in the vocabulary.
// Fomantic's cell classes:  `active` === chosen, `focus` === the keyboard's cell, `adjacent` === another month's
// day, `range` === inside a range.
////////////////

/** The field's box (`UIInput.css`'s grammar). */
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
 * - NOT the link TAG, `"a"`:  Fomantic's `link` class word (epic `wwod-spell-ui`).
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

/** Inline custom property naming the field's anchor (`UICalendar.css`). */
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
