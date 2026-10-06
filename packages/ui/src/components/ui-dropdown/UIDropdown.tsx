import { For, Show, createEffect, createMemo, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { F } from "$/ui/forms"
import { dropdownVocabulary } from "./ui-dropdown.vocabulary.en"
import { DropdownFallback } from "./ui-dropdown.fallback"
import { SlottedItems } from "./SlottedItems"
import type { Vocabulary } from "./ui-dropdown.types"

import buttonCSS from "$/ui/components/ui-button/ui-button.css?inline"
import dropdownCSS from "./ui-dropdown.css?inline"

/****************
 * ### `<ui-dropdown>`
 * A combobox + listbox:  a `<button>` (or, with `search`, an `<input>`) combobox and an anchor-positioned
 * popover menu, both in the shadow root.
 * - Model:  slotted `<ui-item>`s (`SlottedItems`) + the `options` property + additions, as `MenuOptions`;
 *   memos derive the visible list (exclude chosen, filter, additions) per keystroke.
 * - Invoker commands (`<button commandfor="id" command="--toggle">`, `ToggleCommands`) open / close the menu as a
 *   person's action;  a disabled or read-only dropdown ignores them.
 * - `value` and `open` are auto-controlled (`Controlled`):  events first, the host may veto / override.
 * - Menu rows render only while open (`<For>` keyed by option identity);  `aria-activedescendant` points at
 *   the highlighted row.  Escape and outside clicks come from `UI.overlays`.
 * - Form-associated:  `multiple` submits one `FormData` entry per value;  `required` => `valueMissing`.
 * - An option's `flag` draws through `UIT.Flags`, the rule `<ui-flag>` draws with;  Fomantic's country names
 *   (`france`) are `<ui-flag>`'s alone, so a flag that isn't a code shows as its text.
 * - Static server render (`$/ui/static`):  the menu closed, its rows rendered (their text is in the page), the
 *   `<ui-item>`s dropped, and the value as hidden inputs, so a static form submits it;  choosing needs JS.
 ****************/
export class UIDropdown extends F.FormElement<Vocabulary> {
  /**
   * Rows PageUp / PageDown move.
   * - `@proto`:  a subclass or an instance may set its own.
   */
  declare pageSize: number

  /**
   * How long type-ahead keeps what was typed, in ms:  a key after a longer pause starts a new search.
   * - `@proto`:  a subclass or an instance may set its own (a test, a shorter one).
   */
  declare typeAheadDelay: number

  @E.proto static vocabulary = dropdownVocabulary
  @E.proto static styles = { button: buttonCSS, dropdown: dropdownCSS }
  @E.proto static Fallback = DropdownFallback

  /** Default:  10 rows. */
  @E.proto static pageSize = 10

  /** Default:  500 ms. */
  @E.proto static typeAheadDelay = 500

  ////////////////
  // ## State
  ////////////////

  /** Options from slotted `<ui-item>`s. */
  readonly items = new SlottedItems(this.host)

  /** Light-DOM slot occupancy (`icon`, `trigger`, `header`). */
  readonly slots = new E.SlotContent(this.host)

  /** Values added with `allow-additions`, as options. */
  readonly added = new E.Cell<readonly E.MenuOption[]>([])

  /** Search query. */
  readonly query = new E.Cell("")

  /** Highlighted index into `visible().options`;  `-1` for none. */
  readonly active = new E.Cell(-1)

  /** `open`:  host-controlled, or internal. */
  readonly openState = this.controlled("open", false)

  /** `value`:  host-controlled, or internal;  starts from `selected` items. */
  readonly valueState = this.controlled("value", this.selectedItemValues() as never)

  /** Host value to restore on form reset (`undefined`:  back to the `selected` items). */
  private readonly initialValue = untrack(() => this.attrs.value)

  /** Search-key cache shared by every `MenuOptions` this element derives. */
  private readonly keys = new WeakMap() as NonNullable<F.MenuOptionsProps["keys"]>

  /** Stable DOM id per option. */
  private readonly optionIds = new WeakMap<E.MenuOption, string>()

  /** Type-ahead buffer:  what was typed since the last pause. */
  private typed = ""

  /** Clears `typed` after `typeAheadDelay`. */
  private typedTimer?: ReturnType<typeof setTimeout>

  /** Ids / anchor name, from `UI.ids` once rendering. */
  private ids = { menu: "", text: "", anchor: "" }

  /** The combobox:  the trigger button, or the search input. */
  private combobox?: HTMLElement

  /** The listbox popover. */
  private menu?: HTMLElement

  /** This element's `UI.overlays` entry. */
  private readonly overlay: E.OverlayEntry = {
    element: this.host,
    kind: "popover",
    restoreFocus: false,
    onDismiss: () => void this.setOpen(false)
  }

  /** Listens for invoker commands aimed at the host, until it's released. */
  constructor(...args: ConstructorParameters<typeof F.FormElement>) {
    super(...args)
    const listeners = new AbortController()
    this.host.addEventListener("command", this.onCommand, { signal: listeners.signal })
    this.host.addReleaseCallback(() => listeners.abort())
  }

  ////////////////
  // ## Derived
  ////////////////

  /** `options` property, validated to an array. */
  readonly propOptions = createMemo((): UIT.DropdownOptions => {
    const options = this.attrs.options
    return Array.isArray(options) ? (options as UIT.DropdownOptions) : []
  })

  /** Every option:  slotted, then `options`, then additions. */
  readonly all = createMemo(
    (): readonly E.MenuOption[] => [
      ...this.items.entries().filter(UIDropdown.isOption),
      ...this.propOptions(),
      ...this.added.get()
    ],
    { equals: UIDropdown.isSameList }
  )

  /** Option by value, for texts of chosen values. */
  readonly byValue = createMemo(() => new Map(this.all().map((option) => [option.value, option])))

  /** Chosen values, always as an array. */
  readonly values = createMemo(
    (): readonly string[] => {
      const value = this.valueState.get() as unknown
      if (Array.isArray(value)) return value.map(String)
      if (typeof value !== "string" || value === "") return []
      return this.attrs.multiple ? E.Converters.list(value) : [value]
    },
    { equals: UIDropdown.isSameList }
  )

  /** Chosen values as a set, for row state. */
  readonly chosen = createMemo(() => new Set(this.values()))

  /** The effective query:  only with `search`. */
  readonly effectiveQuery = createMemo(() => (this.attrs.search ? this.query.get() : ""))

  /** Options offered now:  minus chosen (multiple), filtered, plus the addition. */
  readonly visible = createMemo(() => {
    const query = this.effectiveQuery()
    return new F.MenuOptions({ options: this.all(), keys: this.keys })
      .excludeSelected(this.attrs.multiple ? this.values() : [])
      .filter(query, { minCharacters: this.attrs.minCharacters ?? 0 })
      .withAdditions(query, { allowAdditions: this.attrs.allowAdditions && this.canAdd() })
  })

  /** Menu rows:  separators in place while not searching, else just the visible options. */
  readonly rows = createMemo(
    (): readonly (E.MenuEntry | E.MenuAddition)[] => {
      const visible = this.visible()
      const entries = this.items.entries()
      if (this.effectiveQuery() || !entries.some((entry) => "type" in entry)) return visible.options
      const shown = new Set<E.MenuOption>(visible.options)
      const rows: (E.MenuEntry | E.MenuAddition)[] = entries.filter((entry) => "type" in entry || shown.has(entry))
      const slotted = new Set<E.MenuEntry>(entries)
      for (const option of visible.options) if (!slotted.has(option)) rows.push(option)
      return rows
    },
    { equals: UIDropdown.isSameList }
  )

  /** Highlighted option. */
  readonly highlighted = createMemo(() => this.visible().options[this.active.get()] as E.MenuOption | undefined)

  /** Open now. */
  isOpen(): boolean {
    return this.openState.get()
  }

  isDisabled(): boolean {
    return this.attrs.disabled || this.isFormDisabled.get()
  }

  /** Label for the combobox and listbox:  `placeholder`, else `text`, else `name`. */
  private label(): string {
    return this.attrs.placeholder ?? this.attrs.text ?? this.attrs.name ?? ""
  }

  /** Text of `value`:  its option's, else `text` (single), else the value itself. */
  private textFor(value: string): string {
    return this.byValue().get(value)?.text ?? (this.attrs.multiple ? undefined : this.attrs.text) ?? value
  }

  /** Room for another value? */
  private canAdd(): boolean {
    const max = this.attrs.maxSelections
    return !this.attrs.multiple || max === undefined || this.values().length < max
  }

  ////////////////
  // ## Element hooks
  ////////////////

  protected classValue(name: E.AttributeName<Vocabulary>): unknown {
    if (name === "open") return this.isOpen()
    if (name === "disabled") return this.isDisabled()
    return super.classValue(name)
  }

  protected hostStates() {
    return {
      open: this.isOpen(),
      disabled: this.isDisabled(),
      loading: this.attrs.loading,
      fluid: this.attrs.fluid
    }
  }

  formValue(): E.FieldValue {
    const values = this.values()
    return this.attrs.multiple ? values : (values[0] ?? null)
  }

  protected formName(): string | undefined {
    return this.attrs.name
  }

  /** Back to the starting value;  clears the query. */
  formReset() {
    this.valueState.set(this.initialValue as never)
    this.query.set("")
  }

  protected rules(): E.ValidationRule[] {
    return this.attrs.required ? [UIT.REQUIRED_RULE] : []
  }

  protected validationLabel(): string | undefined {
    return this.label() || undefined
  }

  protected validationAnchor(): HTMLElement | undefined {
    return this.combobox
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    this.ids = { menu: UI.ids.next(ID_PREFIX), text: UI.ids.next(ID_PREFIX), anchor: `--${UI.ids.next(ID_PREFIX)}` }
    this.effects()
    return (
      <div
        class={this.classes()}
        style={{ [UIT.DROPDOWN_ANCHOR_PROPERTY]: this.ids.anchor }}
        onClick={this.onRootClick}
      >
        <Show when={this.attrs.multiple}>
          <For each={this.values()}>{(value) => this.chip(value)}</For>
        </Show>
        <Show when={this.attrs.search} fallback={this.trigger()}>
          {this.searchInput()}
          <Show when={this.attrs.multiple}>
            <span class={SIZER} aria-hidden={UIT.TRUE}>
              {this.query.get()}
            </span>
          </Show>
        </Show>
        <Show when={this.attrs.labeled && this.attrs.icon}>{this.labeledIcon()}</Show>
        <span
          id={this.ids.text}
          class={[UIT.TEXT, { [DEFAULT]: this.isShowingPlaceholder(), [FILTERED]: !!this.effectiveQuery() }]}
          part={this.part("text")}
        >
          <slot name={this.slot("trigger")}>{this.displayText()}</slot>
        </span>
        <Show when={this.attrs.clearable && this.values().length && !this.attrs.readonly}>
          <button
            type={UIT.BUTTON}
            class={CLEAR_ICON}
            part={this.part("clear")}
            aria-label={this.text("clear")}
            onClick={this.onClear}
          />
        </Show>
        <span class={CARET_ICON} part={this.part("icon")}>
          <Show when={this.slots.has(this.slot("icon"))}>
            <slot name={this.slot("icon")} />
          </Show>
        </span>
        {this.listbox()}
        {isServer ? this.staticValues() : <slot hidden />}
      </div>
    )
  }

  /** Text shown in `.text`:  chosen text (single), else `text` (a menu's fixed label), else the placeholder. */
  private displayText(): string {
    const [first] = this.values()
    if (first !== undefined && !this.attrs.multiple) return this.textFor(first)
    return this.attrs.text ?? this.attrs.placeholder ?? ""
  }

  /** Showing the placeholder (grey `default` text)? */
  private isShowingPlaceholder(): boolean {
    return !this.values().length && this.attrs.text === undefined
  }

  /** Combobox role and ARIA, shared by the trigger and the search input;  the static render's control mark. */
  private comboboxAttributes() {
    return {
      role: COMBOBOX_ROLE,
      "aria-expanded": this.isOpen() ? UIT.TRUE : UIT.FALSE,
      "aria-controls": this.ids.menu,
      "aria-haspopup": LISTBOX_ROLE,
      "aria-activedescendant": this.isOpen() && this.highlighted() ? this.idFor(this.highlighted()!) : undefined,
      "aria-label": this.label() || undefined,
      "aria-describedby": this.ids.text,
      "aria-busy": this.attrs.loading ? UIT.TRUE : undefined,
      "aria-readonly": this.attrs.readonly ? UIT.TRUE : undefined,
      "aria-required": this.attrs.required ? UIT.TRUE : undefined,
      "aria-invalid": this.validation().valid ? undefined : UIT.TRUE,
      [UIT.STATIC_CONTROL]: isServer ? "" : undefined
    } as const
  }

  /** The covering `<button>` combobox. */
  private trigger(): JSX.Element {
    return (
      <button
        ref={(element) => (this.combobox = element)}
        type={UIT.BUTTON}
        class={TRIGGER}
        part={this.part("trigger")}
        disabled={this.isDisabled()}
        {...this.comboboxAttributes()}
        onClick={this.onTriggerClick}
        onKeyDown={this.onKeyDown}
        onBlur={this.onBlur}
      />
    )
  }

  /** The search `<input>` combobox. */
  private searchInput(): JSX.Element {
    return (
      <input
        ref={(element) => (this.combobox = element)}
        class={SEARCH}
        part={this.part("search")}
        autocomplete="off"
        aria-autocomplete="list"
        disabled={this.isDisabled()}
        readonly={this.attrs.readonly}
        value={this.query.get()}
        {...this.comboboxAttributes()}
        onInput={this.onInput}
        onClick={this.onTriggerClick}
        onKeyDown={this.onKeyDown}
        onBlur={this.onBlur}
      />
    )
  }

  /** A chosen value's label, with its delete button (multiple). */
  private chip(value: string): JSX.Element {
    return (
      <span class={CHIP} part={this.part("label")}>
        {this.textFor(value)}
        <Show when={!this.attrs.readonly && !this.isDisabled()}>
          <button
            type={UIT.BUTTON}
            class={DELETE_ICON}
            tabindex="-1"
            aria-label={this.text("removeValue", { value: this.textFor(value) })}
            onClick={(event) => this.remove(value, event)}
          />
        </Show>
      </span>
    )
  }

  /** The icon block of a `labeled` (icon) dropdown button. */
  private labeledIcon(): JSX.Element {
    return this.iconBox(this.attrs.icon)
  }

  /** An icon box drawing `name`:  once loaded in a browser, at once on a server. */
  private iconBox(name: string | undefined): JSX.Element {
    if (isServer) return <span class={UIT.ICON}>{new E.IconGlyph({ owner: this, name: () => name }).svg()}</span>
    return <span class={UIT.ICON} ref={(element) => void UIDropdown.fillIcon(element, name)} />
  }

  /**
   * Server render only:  the value as hidden inputs (one per value), so a static form submits it without JS.
   * - Why not the combobox:  a `<button>` submits nothing, and a search input holds the query.
   */
  private staticValues(): JSX.Element {
    return (
      <Show when={this.attrs.name}>
        {(name) => (
          <For each={this.values()}>
            {(value) => <input type={HIDDEN_INPUT} name={name()} value={value} disabled={this.isDisabled()} />}
          </For>
        )}
      </Show>
    )
  }

  /** The listbox popover. */
  private listbox(): JSX.Element {
    return (
      <div
        ref={(element) => (this.menu = element)}
        id={this.ids.menu}
        class={[MENU, { [UIT.LEFT]: this.attrs.direction === UIT.LEFT }]}
        role={LISTBOX_ROLE}
        // a server render can't show a popover:  an open menu is a plain one, shown by the root's `active`
        popover={this.attrs.simple || (isServer && this.isOpen()) ? undefined : "manual"}
        part={this.part("menu")}
        aria-label={this.label() || undefined}
        aria-multiselectable={this.attrs.multiple ? UIT.TRUE : undefined}
        onMouseDown={UIDropdown.preventDefault}
      >
        <slot name={this.slot("header")} />
        {/* a server render's rows:  the text is in the page, the menu stays closed */}
        <Show when={this.isOpen() || this.attrs.simple || isServer}>
          <For each={this.rows()}>{(row) => this.row(row)}</For>
          <Show when={!this.visible().length}>
            {/* an option (disabled) rather than a bare div:  a listbox must own options (axe `aria-required-children`) */}
            <div class={UIT.MESSAGE} role={OPTION_ROLE} aria-disabled={UIT.TRUE} aria-selected={UIT.FALSE}>
              {this.attrs.noResultsText ?? this.text("noResults")}
            </div>
          </Show>
        </Show>
      </div>
    )
  }

  /** One menu row. */
  private row(row: E.MenuEntry | E.MenuAddition): JSX.Element {
    if ("type" in row) return this.separator(row)
    if ("addition" in row) return this.addition(row)
    const option = row
    const slot = this.items.slots.get(option)
    return (
      <div
        id={this.idFor(option)}
        class={[
          UIT.ITEM,
          {
            [UIT.ACTIVE]: this.chosen().has(option.value),
            [UIT.SELECTED]: this.highlighted() === option,
            [UIT.DISABLED]: !!option.disabled
          }
        ]}
        role={OPTION_ROLE}
        part={this.part("item")}
        aria-selected={this.chosen().has(option.value) ? UIT.TRUE : UIT.FALSE}
        aria-disabled={option.disabled ? UIT.TRUE : undefined}
        onPointerMove={() => this.highlight(option)}
        onClick={(event) => this.select(option, event)}
      >
        <Show when={slot} fallback={this.optionContent(option)}>
          <slot name={slot} />
        </Show>
      </div>
    )
  }

  /** Icon / image / flag, text with `<mark>`ed matches, description. */
  private optionContent(option: E.MenuOption): JSX.Element {
    return (
      <>
        <Show when={typeof option.icon === "string"}>{this.iconBox(option.icon as string)}</Show>
        <Show when={typeof option.image === "string"}>
          <img class={AVATAR_IMAGE} src={option.image as string} alt="" />
        </Show>
        <Show when={typeof option.flag === "string"}>
          <span class={FLAG}>{UIT.Flags.emojiFor(option.flag as string) || (option.flag as string)}</span>
        </Show>
        <Show when={option.description}>
          <span class={UIT.DESCRIPTION}>{option.description}</span>
        </Show>
        <span class={UIT.TEXT}>{this.markedText(option)}</span>
      </>
    )
  }

  /** `option.text` with the query's matches in `<mark>`. */
  private markedText(option: E.MenuOption): JSX.Element {
    const query = this.effectiveQuery()
    if (!query) return option.text
    const ranges = this.visible().highlights(option, query)
    const parts: JSX.Element[] = []
    let at = 0
    for (const [start, end] of ranges) {
      if (start > at) parts.push(option.text.slice(at, start))
      parts.push(<mark>{option.text.slice(start, end)}</mark>)
      at = end
    }
    if (at < option.text.length) parts.push(option.text.slice(at))
    return parts
  }

  /** The "Add …" row of `allow-additions`. */
  private addition(option: E.MenuAddition): JSX.Element {
    const template = this.attrs.additionText ?? this.text("addItem")
    const [before = "", after = ""] = template.split(VALUE_PLACEHOLDER)
    return (
      <div
        id={this.idFor(option)}
        class={[UIT.ITEM, ADDITION, { [UIT.SELECTED]: this.highlighted() === option }]}
        role={OPTION_ROLE}
        part={this.part("item")}
        aria-selected={UIT.FALSE}
        onPointerMove={() => this.highlight(option)}
        onClick={(event) => this.select(option, event)}
      >
        {before}
        <b>{option.text}</b>
        {after}
      </div>
    )
  }

  /** Header or divider row. */
  private separator(entry: E.MenuSeparator): JSX.Element {
    return entry.type === DIVIDER ? (
      <hr class={DIVIDER} role={PRESENTATION_ROLE} />
    ) : (
      <div class={UIT.HEADER} role={PRESENTATION_ROLE}>
        {entry.text}
      </div>
    )
  }

  /** Stable DOM id of `option`'s row, made on first ask. */
  private idFor(option: E.MenuOption): string {
    let id = this.optionIds.get(option)
    if (!id) this.optionIds.set(option, (id = `${this.ids.menu}-${++UIDropdown.optionCounter}`))
    return id
  }

  ////////////////
  // ## Effects
  ////////////////

  /**
   * Popover + overlay registration while open AND connected;  highlighted row kept in view.
   * - `isConnected`:  `keepAlive` keeps an open dropdown's state when it's removed, but the page must not keep its
   *   overlay entry (Escape / outside clicks) for an element that isn't there;  reconnecting re-registers.
   */
  private effects() {
    createEffect(
      () => this.isOpen() && this.isConnected.get(),
      (isOpen) => {
        const { menu } = this
        if (!isOpen || !menu || !menu.popover) return
        if (!menu.matches(UIT.POPOVER_OPEN)) menu.showPopover()
        UI.overlays.open(this.overlay)
        return () => {
          if (menu.matches(UIT.POPOVER_OPEN)) menu.hidePopover()
          UI.overlays.close(this.overlay)
        }
      }
    )
    createEffect(
      () => (this.isOpen() ? this.highlighted() : undefined),
      (option) => {
        if (option) this.host.renderRoot.getElementById(this.idFor(option))?.scrollIntoView({ block: "nearest" })
      }
    )
  }

  ////////////////
  // ## Transitions
  ////////////////

  /**
   * Open or close, dispatching the cancelable `ui-open` / `ui-close` first.
   * - Opening highlights the chosen option, else the first enabled one.
   * - Returns true when it changed.
   */
  setOpen(open: boolean, originalEvent?: Event): boolean {
    if (open === untrack(() => this.isOpen())) return false
    if (open && (this.isDisabled() || this.attrs.readonly)) return false
    const done = this.openState.request(open, () => this.emit(open ? "ui-open" : "ui-close", { open, originalEvent }))
    if (done && open) {
      const options = untrack(() => this.visible())
      const chosen = options.options.findIndex((option) => untrack(() => this.chosen()).has(option.value))
      this.active.set(chosen >= 0 ? chosen : options.nextEnabledIndex(-1, 1))
    }
    if (done && !open) this.query.set("")
    return done
  }

  /** Choose `option` (or add the addition), as the person did with `originalEvent`. */
  select(option: E.MenuOption, originalEvent?: Event) {
    if (option.disabled || this.attrs.readonly) return
    const values = untrack(() => this.values())
    const isAddition = "addition" in option
    if (this.attrs.multiple) {
      if (!untrack(() => this.canAdd())) return
      const next = [...values, option.value]
      this.commit(next, originalEvent, () => this.emit("ui-add", { value: option.value, originalEvent }))
      this.query.set("")
      this.active.set(0)
    } else {
      this.commit([option.value], originalEvent, () => {
        if (isAddition) this.emit("ui-add", { value: option.value, originalEvent })
      })
      this.setOpen(false, originalEvent)
    }
    if (isAddition) this.added.set([...untrack(() => this.added.get()), { value: option.value, text: option.text }])
  }

  /** Remove one chosen value (multiple). */
  remove(value: string, originalEvent?: Event) {
    if (this.attrs.readonly || this.isDisabled()) return
    const next = untrack(() => this.values()).filter((item) => item !== value)
    this.commit(next, originalEvent, () => this.emit("ui-remove", { value, originalEvent }))
  }

  /**
   * Change the value to `next` through `Controlled`:  `announce()` (ui-add / ui-remove) and `ui-change` first.
   * - Returns true when applied.
   */
  private commit(next: readonly string[], originalEvent: Event | undefined, announce?: () => void): boolean {
    const value = this.attrs.multiple ? [...next] : (next[0] ?? "")
    return this.valueState.request(value as never, () => {
      announce?.()
      this.emit("ui-change", { value, originalEvent })
      return true
    })
  }

  /** Highlight `option` if it's visible. */
  private highlight(option: E.MenuOption) {
    const index = untrack(() => this.visible()).options.indexOf(option)
    if (index >= 0 && index !== untrack(() => this.active.get())) this.active.set(index)
  }

  /** Move the highlight by `delta` enabled options. */
  private move(delta: number) {
    const options = untrack(() => this.visible())
    this.active.set(
      options.nextEnabledIndex(
        untrack(() => this.active.get()),
        delta
      )
    )
  }

  ////////////////
  // ## Handlers
  ////////////////

  /**
   * An invoker command aimed at the host (`ToggleCommands`):  a person's action, ignored when disabled / read-only.
   * - Opening focuses the combobox, as opening it by keyboard leaves it (the keys need it).
   */
  private readonly onCommand = (event: Event) => {
    if (untrack(() => this.isDisabled() || this.attrs.readonly)) return
    const action = UIT.ToggleCommands.action(
      event,
      untrack(() => this.isOpen())
    )
    if (action === "show") {
      this.combobox?.focus({ preventScroll: true })
      this.setOpen(true, event)
    } else if (action === "close") this.setOpen(false, event)
  }

  /** Trigger / input click:  toggle (the input only opens). */
  private readonly onTriggerClick = (event: MouseEvent) => {
    // Safari doesn't focus a <button> on a mouse click, and the keys (arrows, Enter, Escape) need focus here
    // (`detail` is 0 for a keyboard or scripted click, which has the focus it needs, or none to give)
    if (event.detail > 0) this.combobox?.focus({ preventScroll: true })
    if (this.attrs.search && untrack(() => this.isOpen())) return
    this.setOpen(!untrack(() => this.isOpen()), event)
  }

  /** Click on the root outside the combobox (caret, text of a search dropdown):  focus + toggle. */
  private readonly onRootClick = (event: MouseEvent) => {
    const target = event.composedPath()[0]
    if (!this.attrs.search || target === this.combobox || this.menu?.contains(target as Node)) return
    if ((target as Element).closest?.(UIT.BUTTON)) return
    this.combobox?.focus()
    this.setOpen(!untrack(() => this.isOpen()), event)
  }

  /** Clear button. */
  private readonly onClear = (event: MouseEvent) => {
    event.stopPropagation()
    this.commit([], event)
  }

  /** Search typing:  filter, open, highlight the first match, `ui-search`. */
  private readonly onInput = (event: InputEvent) => {
    const query = (event.currentTarget as HTMLInputElement).value
    this.query.set(query)
    this.setOpen(true, event)
    this.active.set(0)
    this.emit("ui-search", { query, originalEvent: event })
  }

  /**
   * Leaving the combobox closes the menu, unless focus stays inside, or moves to (or is lost by a press on) one of
   * this dropdown's invoker buttons:  that button's `command` decides, so `--toggle` closes an open menu instead of
   * closing it here and reopening it.
   */
  private readonly onBlur = (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null
    if (next && (this.host.contains(next) || this.host.renderRoot.contains(next))) return
    const id = this.host.id
    if (id && (next as Element | null)?.closest?.(`[commandfor="${CSS.escape(id)}"]`)) return
    if (this.isLoaded() && UI.overlays.pressedInvokerOf(this.host)) return
    this.setOpen(false, event)
  }

  /** Combobox keyboard pattern (APG), plus type-ahead and Backspace-removes-last. */
  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (this.isDisabled() || event.defaultPrevented) return
    const isOpen = untrack(() => this.isOpen())
    const { key } = event
    switch (key) {
      case UIT.Key.arrowDown:
      case UIT.Key.arrowUp:
        event.preventDefault()
        if (!isOpen) this.setOpen(true, event)
        else this.move(key === UIT.Key.arrowDown ? 1 : -1)
        return
      case UIT.Key.home:
      case UIT.Key.end:
        if (!isOpen) return
        event.preventDefault()
        this.active.set(untrack(() => this.visible()).nextEnabledIndex(-1, key === UIT.Key.home ? 1 : -1))
        return
      case UIT.Key.pageDown:
      case UIT.Key.pageUp:
        if (!isOpen) return
        event.preventDefault()
        this.move(key === UIT.Key.pageDown ? this.pageSize : -this.pageSize)
        return
      case UIT.Key.enter: {
        if (!isOpen) {
          if (this.attrs.search) this.setOpen(true, event)
          return
        }
        event.preventDefault()
        const visible = untrack(() => this.visible())
        const option = untrack(() => this.highlighted()) ?? visible.addition
        if (option) this.select(option, event)
        return
      }
      case UIT.Key.space: {
        if (this.attrs.search || !isOpen) return
        event.preventDefault()
        const option = untrack(() => this.highlighted())
        if (option) this.select(option, event)
        return
      }
      case UIT.Key.tab:
        if (isOpen) this.setOpen(false, event)
        return
      case UIT.Key.backspace: {
        const values = untrack(() => this.values())
        if (this.attrs.search && this.attrs.multiple && !untrack(() => this.query.get()) && values.length) {
          this.remove(values.at(-1)!, event)
        }
        return
      }
    }
    if (!this.attrs.search && key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault()
      this.typeAhead(key, event)
    }
  }

  /** Type-ahead:  extend the buffer, highlight the next match (opening first if needed). */
  private typeAhead(key: string, event: KeyboardEvent) {
    clearTimeout(this.typedTimer)
    this.typed += key
    this.typedTimer = setTimeout(() => (this.typed = ""), this.typeAheadDelay)
    if (!untrack(() => this.isOpen())) this.setOpen(true, event)
    const options = untrack(() => this.visible())
    const index = options.selectionForKey(
      this.typed,
      untrack(() => this.active.get())
    )
    if (index >= 0) this.active.set(index)
  }

  /** Values of slotted items marked `selected`, the uncontrolled starting value. */
  private selectedItemValues(): string | string[] | undefined {
    const values = untrack(() => this.items.entries())
      .filter(UIDropdown.isOption)
      .filter((option) => option.selected)
      .map((option) => option.value)
    if (!values.length) return undefined
    return untrack(() => this.attrs.multiple) ? values : values[0]
  }

  ////////////////
  // ## Statics
  ////////////////

  /**
   * Counter behind option ids.
   * - STATIC:  page-wide, so two dropdowns never share an id.
   */
  private static optionCounter = 0

  /**
   * Same items in the same order?  Memo `equals` for arrays, so a recomputation that yields an equivalent list
   * doesn't wake every row (Solid's dev diagnostics flag it as `UNSTABLE_MEMO_OUTPUT`).
   * - STATIC:  pure, handed to `createMemo()`.
   */
  private static isSameList<T>(a: readonly T[], b: readonly T[]): boolean {
    return a.length === b.length && a.every((item, index) => item === b[index])
  }

  /**
   * Is `entry` an option (not a separator)?
   * - STATIC:  pure, a `filter()` predicate.
   */
  private static isOption(entry: E.MenuEntry): entry is E.MenuOption {
    return !("type" in entry)
  }

  /**
   * `preventDefault()`:  menu presses must not take focus from the combobox.
   * - STATIC:  one handler for every instance.
   */
  private static preventDefault(event: Event) {
    event.preventDefault()
  }

  /**
   * Draw icon `name` from the packs `element` sees (its `<ui-root icons>`, else `UI.icons`) into it, once loaded.
   * - Plain DOM, no signal:  rows are many and their icons never change.
   * - NEVER rejects (fire-and-forget):  a runtime chunk or icon that won't load draws no icon, not a page error,
   *   as `IconGlyph` does.
   * - STATIC:  needs no instance, only the element.
   */
  private static async fillIcon(element: HTMLElement, name: string | undefined) {
    if (!name) return
    try {
      const icons = E.IconGlyph.packsFor(element, (await UI.load()).icons)
      const template = icons.peek(name) ?? (await icons.get(name))
      if (template) element.replaceChildren(E.IconGlyph.draw(template))
    } catch {
      // no icon
    }
  }
}

////////////////
// ## Constants
////////////////

/** `UI.ids` prefix. */
const ID_PREFIX = "ui-dropdown"

/** Placeholder in the `addItem` text. */
const VALUE_PLACEHOLDER = "{value}"

/** Hidden input carrying the value in a static server render:  its `type`. */
const HIDDEN_INPUT = "hidden"

/** `role` of the combobox. */
const COMBOBOX_ROLE = "combobox"

/** `role` of the menu, and the combobox's `aria-haspopup`. */
const LISTBOX_ROLE = "listbox"

/** `role` of every row a person can choose (and of the no-results message). */
const OPTION_ROLE = "option"

/** `role` of header and divider rows. */
const PRESENTATION_ROLE = "presentation"

/**
 * Class words of the markup contract (`ui-dropdown.css`) -- grammar, not attributes, so not in the vocabulary.
 * - NOTE: `active` === chosen, `selected` === highlighted:  Fomantic's meanings.
 */
const DEFAULT = "default"

/** Class word of the text while a search filters. */
const FILTERED = "filtered"

/** Class word of the listbox. */
const MENU = "menu"

/** Class word of the "Add …" row. */
const ADDITION = "addition"

/** Class words of a divider row;  also `<ui-item type="divider">`. */
const DIVIDER = "divider"

/** Class word of the covering trigger button. */
const TRIGGER = "trigger"

/** Class word of the search input. */
const SEARCH = "search"

/** Class word of the hidden span that sizes a `multiple` search input to its query. */
const SIZER = "sizer"

/** Class words of the clear button. */
const CLEAR_ICON = "remove icon"

/** Class words of the caret. */
const CARET_ICON = "dropdown icon"

/** Class words of a chosen value's label (`multiple`). */
const CHIP = "ui label"

/** Class words of a chip's delete button. */
const DELETE_ICON = "delete icon"

/** Class words of an option's `image`. */
const AVATAR_IMAGE = "ui avatar image"

/** Class word of an option's `flag`. */
const FLAG = "flag"
