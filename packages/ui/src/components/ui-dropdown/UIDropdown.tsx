import { For, Show, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { F } from "$/ui/forms"
import { dropdownVocabulary } from "./UIDropdown.en"
import { DropdownFallback } from "./UIDropdown.fallback"
import { SlottedItems } from "./SlottedItems"

import buttonCSS from "$/ui/components/ui-button/UIButton.css?inline"
import dropdownCSS from "./UIDropdown.css?inline"

/****************
 * ### `UIDropdown`
 * The component behind `<ui-dropdown>`:  a combobox and its listbox, to choose one value or several.
 *
 * - Its shadow DOM:  a `<button>` combobox (with `search`, an `<input>`),
 *   and an anchor-positioned popover menu.
 *
 * - Its options:  the slotted `<ui-item>`s (`SlottedItems`), then the `options` property, then additions,
 *   as `MenuOptions`.  `@derived` members work out the visible list on each key
 *   (leaving out chosen ones, filtering, adding the addition).
 *
 * - `value` and `open` are controlled (`@controlled`):  the events go first, and a handler may cancel or override.
 * - Invoker commands (`<button commandfor="id" command="--toggle">`, `ToggleCommands`) open and close the menu,
 *   as a person's action;  a disabled or read-only dropdown ignores them.
 * - The menu's rows render only while it's open (`<For>`, keyed by option);
 *   `aria-activedescendant` points at the highlighted row.  Escape and outside clicks come from `UI.overlays`.
 * - A form control:  `multiple` submits one `FormData` entry per value;  `required` => `valueMissing`.
 * - An option's `flag` draws through `UIT.Flags`, the rule `<ui-flag>` draws with.
 *   Fomantic's country names (`france`) are `<ui-flag>`'s alone, so a flag that isn't a code shows as its text.
 *
 * - In a static server render (`$/ui/static`):  the menu is closed, with its rows rendered (their text is in the
 *   page), the `<ui-item>`s are dropped, and the value goes in hidden inputs, so a static form submits it.
 *   Choosing needs script.
 ****************/
export class UIDropdown extends F.FormComponent<typeof dropdownVocabulary> {
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
  @E.protoMerged static elementSetup = {
    styleSheets: { button: buttonCSS, dropdown: dropdownCSS },
    Fallback: DropdownFallback
  } satisfies Partial<E.ElementSetup>

  /** Default:  10 rows. */
  @E.proto static pageSize = 10

  /** Default:  500 ms. */
  @E.proto static typeAheadDelay = 500

  ////////////////
  // ## Options
  ////////////////

  /** Options from slotted `<ui-item>`s. */
  readonly items = new SlottedItems(this.domElement)

  /** Which slots have light-DOM children (`icon`, `trigger`, `header`). */
  readonly slots = new E.SlotContent(this.domElement)

  /** Values added with `allow-additions`, as options. */
  @E.state accessor addedOptions: readonly E.MenuOption[] = []

  /** `options` property, validated to an array. */
  get propertyOptions(): UIT.DropdownOptions {
    const options = this.options
    return Array.isArray(options) ? (options as UIT.DropdownOptions) : []
  }

  /** Every option:  slotted, then `options`, then additions;  the same list while equal. */
  @E.derived({ equals: E.isSameList })
  get allOptions(): readonly E.MenuOption[] {
    return [...this.items.entries.filter(UIDropdown.isOption), ...this.propertyOptions, ...this.addedOptions]
  }

  /** Option by value, for texts of chosen values. */
  @E.derived
  get optionsByValue(): ReadonlyMap<string, E.MenuOption> {
    return new Map(this.allOptions.map((option) => [option.value, option]))
  }

  /** Search-key cache shared by every `MenuOptions` this element derives. */
  private readonly keys = new WeakMap() as NonNullable<F.MenuOptionsProps["keys"]>

  ////////////////
  // ## Value
  ////////////////

  /** `value`:  set by the page, or chosen;  starts from the `selected` items (so it's below `items`). */
  @E.controlled("value")
  accessor value = this.selectedItemValues()

  /** The page's value to restore on a form reset (`undefined`:  back to the `selected` items). */
  private readonly initialValue = this.isControlledByPage("value") ? untrack(() => this.value) : undefined

  /** Chosen values, always as an array;  the same list while equal. */
  @E.derived({ equals: E.isSameList })
  get chosenValues(): readonly string[] {
    const value = this.value as unknown
    if (Array.isArray(value)) return value.map(String)
    if (typeof value !== "string" || value === "") return []
    return this.multiple ? E.Converters.list(value) : [value]
  }

  /** Chosen values as a set, for row state. */
  @E.derived
  get chosenValueSet(): ReadonlySet<string> {
    return new Set(this.chosenValues)
  }

  /** Text of `value`:  its option's, else `text` (single), else the value itself. */
  private textFor(value: string): string {
    return this.optionsByValue.get(value)?.text ?? (this.multiple ? undefined : this.text) ?? value
  }

  /** Room for another value (`max-selections`)? */
  private get hasRoomForMore(): boolean {
    const max = this.maxSelections
    return !this.multiple || max === undefined || this.chosenValues.length < max
  }

  /** Values of slotted items marked `selected`, the uncontrolled starting value. */
  @E.untracked
  private selectedItemValues(): string | string[] | undefined {
    const values = this.items.entries
      .filter(UIDropdown.isOption)
      .filter((option) => option.selected)
      .map((option) => option.value)
    if (!values.length) return undefined
    return this.multiple ? values : values[0]
  }

  /** Choose `option` (or add the addition), as the person did with `originalEvent`. */
  @E.untracked
  select(option: E.MenuOption, originalEvent?: Event) {
    if (option.disabled || this.readonly) return
    const values = this.chosenValues
    const isAddition = "addition" in option
    if (this.multiple) {
      if (!this.hasRoomForMore) return
      const next = [...values, option.value]
      this.commit(next, originalEvent, () => this.send("ui-add", { value: option.value, originalEvent }))
      this.query = ""
      this.highlightedIndex = 0
    } else {
      this.commit([option.value], originalEvent, () => {
        if (isAddition) this.send("ui-add", { value: option.value, originalEvent })
      })
      this.requestOpen(false, originalEvent)
    }
    if (isAddition) this.addedOptions = [...this.addedOptions, { value: option.value, text: option.text }]
  }

  /** Remove one chosen value (multiple). */
  @E.untracked
  remove(value: string, originalEvent?: Event) {
    if (this.readonly || this.isDisabled) return
    const next = this.chosenValues.filter((item) => item !== value)
    this.commit(next, originalEvent, () => this.send("ui-remove", { value, originalEvent }))
  }

  /**
   * Change the value to `next` through `requestChange()`:  `announce()` (ui-add / ui-remove) and `ui-change` first.
   * - Returns true when applied.
   */
  private commit(next: readonly string[], originalEvent: Event | undefined, announce?: () => void): boolean {
    const value = this.multiple ? [...next] : (next[0] ?? "")
    return this.requestChange("value", value, () => {
      announce?.()
      this.send("ui-change", { value, originalEvent })
      return true
    })
  }

  ////////////////
  // ## The form
  ////////////////

  get formValue(): E.FieldValue {
    const values = this.chosenValues
    return this.multiple ? values : (values[0] ?? null)
  }

  protected get formName(): string | undefined {
    return this.name
  }

  /** Back to the starting value;  clears the query. */
  onFormReset() {
    this.value = this.initialValue
    this.query = ""
  }

  protected get validationRules(): E.ValidationRule[] {
    return this.required ? [UIT.REQUIRED_RULE] : []
  }

  protected get validationLabel(): string | undefined {
    return this.label || undefined
  }

  protected get validationAnchor(): HTMLElement | undefined {
    return this.combobox
  }

  ////////////////
  // ## Search
  ////////////////

  /** Search query. */
  @E.state accessor query = ""

  /** The effective query:  only with `search`. */
  get effectiveQuery(): string {
    return this.search ? this.query : ""
  }

  /** Type-ahead buffer:  what was typed since the last pause. */
  private typedSoFar = ""

  /** Clears `typedSoFar` after `typeAheadDelay`. */
  private typeAheadTimer?: E.CancelablePromise<unknown>

  /** Type-ahead:  extend the buffer, highlight the next match (opening first if needed). */
  @E.untracked
  private typeAhead(key: string, event: KeyboardEvent) {
    this.typeAheadTimer?.cancel()
    this.typedSoFar += key
    this.typeAheadTimer = E.after(this.typeAheadDelay / 1000, () => (this.typedSoFar = ""))
    if (!this.isOpen) this.requestOpen(true, event)
    const options = this.visibleOptions
    const index = options.selectionForKey(this.typedSoFar, this.highlightedIndex)
    if (index >= 0) this.highlightedIndex = index
  }

  ////////////////
  // ## The menu rows
  ////////////////

  /** Options offered now:  minus chosen (multiple), filtered, plus the addition. */
  @E.derived
  get visibleOptions(): F.MenuOptions {
    const query = this.effectiveQuery
    return new F.MenuOptions({ options: this.allOptions, keys: this.keys })
      .excludeSelected(this.multiple ? this.chosenValues : [])
      .filter(query, { minCharacters: this.minCharacters ?? 0 })
      .withAdditions(query, { allowAdditions: this.allowAdditions && this.hasRoomForMore })
  }

  /** Menu rows:  separators in place unless searching, else the visible options;  the same list while equal. */
  @E.derived({ equals: E.isSameList })
  get menuRows(): readonly (E.MenuEntry | E.MenuAddition)[] {
    const visible = this.visibleOptions
    const entries = this.items.entries
    if (this.effectiveQuery || !entries.some((entry) => "type" in entry)) return visible.options
    const shown = new Set<E.MenuOption>(visible.options)
    const rows: (E.MenuEntry | E.MenuAddition)[] = entries.filter((entry) => "type" in entry || shown.has(entry))
    const slotted = new Set<E.MenuEntry>(entries)
    for (const option of visible.options) if (!slotted.has(option)) rows.push(option)
    return rows
  }

  /**
   * Highlighted index into `visibleOptions.options`;  `-1` for none.
   * - Fomantic's `selected` class marks it;  its `active` is the CHOSEN option.
   */
  @E.state accessor highlightedIndex = -1

  /** Highlighted option. */
  get highlightedOption(): E.MenuOption | undefined {
    return this.visibleOptions.options[this.highlightedIndex] as E.MenuOption | undefined
  }

  /** Highlight `option` if it's visible. */
  @E.untracked
  private highlight(option: E.MenuOption) {
    const index = this.visibleOptions.options.indexOf(option)
    if (index >= 0 && index !== this.highlightedIndex) this.highlightedIndex = index
  }

  /** Move the highlight by `delta` enabled options. */
  @E.untracked
  private move(delta: number) {
    const options = this.visibleOptions
    this.highlightedIndex = options.nextEnabledIndex(this.highlightedIndex, delta)
  }

  /** Open:  keep the highlighted row in view. */
  @E.onChange("isOpen", "highlightedOption")
  protected onHighlightChanged(isOpen: boolean, option: E.MenuOption | undefined) {
    // `menu`:  rendered, so `idFor()` has the menu's id to build on
    if (!isOpen || !option || !this.menu) return
    this.domElement.renderRoot.getElementById(this.idFor(option))?.scrollIntoView({ block: "nearest" })
  }

  /** Stable DOM id of `option`'s row, made on first ask. */
  private idFor(option: E.MenuOption): string {
    let id = this.optionIds.get(option)
    if (!id) this.optionIds.set(option, (id = `${this.ids.menu}-${++UIDropdown.optionCounter}`))
    return id
  }

  /** Stable DOM id per option. */
  private readonly optionIds = new WeakMap<E.MenuOption, string>()

  ////////////////
  // ## Open
  ////////////////

  /** `open`:  set by the page, or opened and closed by a person;  `:state(open)`. */
  @E.cssState("open")
  @E.controlled("open")
  accessor isOpen = false

  /** This element's `UI.overlays` entry. */
  private readonly overlay: E.OverlayEntry = {
    element: this.domElement,
    kind: "popover",
    restoreFocus: false,
    onDismiss: () => void this.requestOpen(false)
  }

  /**
   * Open or close, dispatching the cancelable `ui-open` / `ui-close` first.
   * - Opening highlights the chosen option, else the first enabled one.
   * - Returns true when it changed.
   */
  @E.untracked
  requestOpen(open: boolean, originalEvent?: Event): boolean {
    if (open === this.isOpen) return false
    if (open && (this.isDisabled || this.readonly)) return false
    const done = this.requestChange("isOpen", open, () =>
      this.send(open ? "ui-open" : "ui-close", { open, originalEvent })
    )
    if (done && open) {
      const options = this.visibleOptions
      const chosen = options.options.findIndex((option) => this.chosenValueSet.has(option.value))
      this.highlightedIndex = chosen >= 0 ? chosen : options.nextEnabledIndex(-1, 1)
    }
    if (done && !open) this.query = ""
    return done
  }

  /**
   * Popover + overlay registration while open AND connected, once rendered.
   * - `isConnected`:  `keepAlive` keeps an open dropdown's state when it's removed, but the page must not keep its
   *   overlay entry (Escape / outside clicks) for an element that isn't there;  reconnecting re-registers.
   * - `isReady`:  the menu renders only then;  an element opened before shows it as it arrives.
   */
  @E.onChange("isOpen", "isConnected", "isReady")
  protected onOpenChanged(isOpen: boolean, isConnected: boolean, isReady: boolean) {
    const { menu } = this
    if (!isOpen || !isConnected || !isReady || !menu || !menu.popover) return undefined
    if (!menu.matches(":popover-open")) menu.showPopover()
    UI.overlays.open(this.overlay)
    return () => {
      if (menu.matches(":popover-open")) menu.hidePopover()
      UI.overlays.close(this.overlay)
    }
  }

  ////////////////
  // ## Disabled, classes and states
  ////////////////

  /** Disabled by its attribute, or by a disabled fieldset;  `:state(disabled)`. */
  @E.cssState("disabled")
  get isDisabled(): boolean {
    return this.disabled || this.formIsDisabled
  }

  /** Busy (`loading`):  `:state(loading)`. */
  @E.cssState("loading")
  get isLoading(): boolean {
    return this.loading
  }

  /** As wide as its container (`fluid`):  `:state(fluid)`. */
  @E.cssState("fluid")
  get isFluid(): boolean {
    return this.fluid
  }

  protected classValue(name: E.AttributeName<typeof dropdownVocabulary>): unknown {
    if (name === "open") return this.isOpen
    if (name === "disabled") return this.isDisabled
    return super.classValue(name)
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** Ids / anchor name, from `UI.ids` once rendering. */
  private ids = { menu: "", text: "", anchor: "" }

  /** The combobox:  the trigger button, or the search input. */
  private combobox?: HTMLElement

  /** The listbox popover. */
  private menu?: HTMLElement

  render(): JSX.Element {
    this.ids = { menu: UI.ids.next(ID_PREFIX), text: UI.ids.next(ID_PREFIX), anchor: `--${UI.ids.next(ID_PREFIX)}` }
    return (
      <div
        class={this.rootClass}
        style={{ [UIT.DROPDOWN_ANCHOR_PROPERTY]: this.ids.anchor }}
        onClick={this.onRootClick}
      >
        <Show when={this.multiple}>
          <For each={this.chosenValues}>{(value) => this.chip(value)}</For>
        </Show>
        <Show when={this.search} fallback={this.trigger()}>
          {this.searchInput()}
          <Show when={this.multiple}>
            <span class={SIZER} aria-hidden="true">
              {this.query}
            </span>
          </Show>
        </Show>
        <Show when={this.labeled && this.icon}>{this.labeledIcon()}</Show>
        <span
          id={this.ids.text}
          class={[UIT.TEXT, { [DEFAULT]: this.placeholderIsShowing, [FILTERED]: !!this.effectiveQuery }]}
          part={this.partForName("text")}
        >
          <slot name={this.slotForName("trigger")}>{this.displayText}</slot>
        </span>
        <Show when={this.clearable && this.chosenValues.length && !this.readonly}>
          <button
            type="button"
            class={CLEAR_ICON}
            part={this.partForName("clear")}
            aria-label={this.translationForKey("clear")}
            onClick={this.onClear}
          />
        </Show>
        <span class={CARET_ICON} part={this.partForName("icon")}>
          <Show when={this.slots.hasContent(this.slotForName("icon"))}>
            <slot name={this.slotForName("icon")} />
          </Show>
        </span>
        {this.listbox()}
        {isServer ? this.staticValues() : <slot hidden />}
      </div>
    )
  }

  /** Label for the combobox and listbox:  `placeholder`, else `text`, else `name`. */
  private get label(): string {
    return this.placeholder ?? this.text ?? this.name ?? ""
  }

  /** Text shown in `.text`:  chosen text (single), else `text` (a menu's fixed label), else the placeholder. */
  private get displayText(): string {
    const [first] = this.chosenValues
    if (first !== undefined && !this.multiple) return this.textFor(first)
    return this.text ?? this.placeholder ?? ""
  }

  /** Showing the placeholder (grey `default` text)? */
  private get placeholderIsShowing(): boolean {
    return !this.chosenValues.length && this.text === undefined
  }

  /** Combobox role and ARIA, shared by the trigger and the search input;  the static render's control mark. */
  private get comboboxAttributes() {
    const highlighted = this.highlightedOption
    return {
      role: "combobox",
      "aria-expanded": this.isOpen ? "true" : "false",
      "aria-controls": this.ids.menu,
      "aria-haspopup": "listbox",
      "aria-activedescendant": this.isOpen && highlighted ? this.idFor(highlighted) : undefined,
      "aria-label": this.label || undefined,
      "aria-describedby": this.ids.text,
      "aria-busy": this.loading ? "true" : undefined,
      "aria-readonly": this.readonly ? "true" : undefined,
      "aria-required": this.required ? "true" : undefined,
      "aria-invalid": this.validation.valid ? undefined : "true",
      [UIT.STATIC_CONTROL]: isServer ? "" : undefined
    } as const
  }

  /** The covering `<button>` combobox. */
  private trigger(): JSX.Element {
    return (
      <button
        ref={(element) => (this.combobox = element)}
        type="button"
        class={TRIGGER}
        part={this.partForName("trigger")}
        disabled={this.isDisabled}
        {...this.comboboxAttributes}
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
        part={this.partForName("search")}
        autocomplete="off"
        aria-autocomplete="list"
        disabled={this.isDisabled}
        readonly={this.readonly}
        value={this.query}
        {...this.comboboxAttributes}
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
      <span class={CHIP} part={this.partForName("label")}>
        {this.textFor(value)}
        <Show when={!this.readonly && !this.isDisabled}>
          <button
            type="button"
            class={DELETE_ICON}
            tabindex="-1"
            aria-label={this.translationForKey("removeValue", { value: this.textFor(value) })}
            onClick={(event) => this.remove(value, event)}
          />
        </Show>
      </span>
    )
  }

  /** The icon block of a `labeled` (icon) dropdown button. */
  private labeledIcon(): JSX.Element {
    return this.iconBox(this.icon)
  }

  /** An icon box drawing `name`:  once loaded in a browser, at once on a server. */
  private iconBox(name: string | undefined): JSX.Element {
    if (isServer) return <span class={UIT.ICON}>{new E.IconGlyph({ owner: this, name: () => name }).svg}</span>
    return <span class={UIT.ICON} ref={(element) => void UIDropdown.fillIcon(element, name)} />
  }

  /**
   * Server render only:  the value as hidden inputs (one per value), so a static form submits it without JS.
   * - Why not the combobox:  a `<button>` submits nothing, and a search input holds the query.
   */
  private staticValues(): JSX.Element {
    return (
      <Show when={this.name}>
        {(name) => (
          <For each={this.chosenValues}>
            {(value) => <input type="hidden" name={name()} value={value} disabled={this.isDisabled} />}
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
        class={[MENU, { [UIT.LEFT]: this.direction === UIT.LEFT }]}
        role="listbox"
        // a server render can't show a popover:  an open menu is a plain one, shown by the root's `active`
        popover={this.simple || (isServer && this.isOpen) ? undefined : "manual"}
        part={this.partForName("menu")}
        aria-label={this.label || undefined}
        aria-multiselectable={this.multiple ? "true" : undefined}
        onMouseDown={UIDropdown.preventDefault}
      >
        <slot name={this.slotForName("header")} />
        {/* a server render's rows:  the text is in the page, the menu stays closed */}
        <Show when={this.isOpen || this.simple || isServer}>
          <For each={this.menuRows}>{(row) => this.row(row)}</For>
          <Show when={!this.visibleOptions.length}>
            {/* an option (disabled) rather than a bare div:  a listbox must own options (axe `aria-required-children`) */}
            <div class={UIT.MESSAGE} role="option" aria-disabled="true" aria-selected="false">
              {this.noResultsText ?? this.translationForKey("noResults")}
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
            [UIT.ACTIVE]: this.chosenValueSet.has(option.value),
            [UIT.SELECTED]: this.highlightedOption === option,
            [UIT.DISABLED]: !!option.disabled
          }
        ]}
        role="option"
        part={this.partForName("item")}
        aria-selected={this.chosenValueSet.has(option.value) ? "true" : "false"}
        aria-disabled={option.disabled ? "true" : undefined}
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
    const query = this.effectiveQuery
    if (!query) return option.text
    const ranges = this.visibleOptions.highlights(option, query)
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
    const template = this.additionText ?? this.translationForKey("addItem")
    const [before = "", after = ""] = template.split(VALUE_PLACEHOLDER)
    return (
      <div
        id={this.idFor(option)}
        class={[UIT.ITEM, ADDITION, { [UIT.SELECTED]: this.highlightedOption === option }]}
        role="option"
        part={this.partForName("item")}
        aria-selected="false"
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
      <hr class={DIVIDER} role="presentation" />
    ) : (
      <div class={UIT.HEADER} role="presentation">
        {entry.text}
      </div>
    )
  }

  ////////////////
  // ## Handlers
  ////////////////

  /**
   * An invoker command aimed at the DOM element (`ToggleCommands`):  a person's action,
   * ignored when disabled or read-only.
   * - Opening focuses the combobox, as opening it by keyboard leaves it (the keys need it).
   */
  @E.on("command")
  protected onCommand(event: Event) {
    if (this.isDisabled || this.readonly) return
    const action = UIT.ToggleCommands.action(event, this.isOpen)
    if (action === "show") {
      this.combobox?.focus({ preventScroll: true })
      this.requestOpen(true, event)
    } else if (action === "close") this.requestOpen(false, event)
  }

  /** Trigger / input click:  toggle (the input only opens). */
  @E.untracked
  private readonly onTriggerClick = (event: MouseEvent) => {
    // Safari doesn't focus a <button> on a mouse click, and the keys (arrows, Enter, Escape) need focus here
    // (`detail` is 0 for a keyboard or scripted click, which has the focus it needs, or none to give)
    if (event.detail > 0) this.combobox?.focus({ preventScroll: true })
    if (this.search && this.isOpen) return
    this.requestOpen(!this.isOpen, event)
  }

  /** Click on the root outside the combobox (caret, text of a search dropdown):  focus + toggle. */
  @E.untracked
  private readonly onRootClick = (event: MouseEvent) => {
    const target = event.composedPath()[0]
    if (!this.search || target === this.combobox || this.menu?.contains(target as Node)) return
    if ((target as Element).closest?.("button")) return
    this.combobox?.focus()
    this.requestOpen(!this.isOpen, event)
  }

  /** Clear button. */
  private readonly onClear = (event: MouseEvent) => {
    event.stopPropagation()
    this.commit([], event)
  }

  /** Search typing:  filter, open, highlight the first match, `ui-search`. */
  private readonly onInput = (event: InputEvent) => {
    const query = (event.currentTarget as HTMLInputElement).value
    this.query = query
    this.requestOpen(true, event)
    this.highlightedIndex = 0
    this.send("ui-search", { query, originalEvent: event })
  }

  /**
   * Leaving the combobox closes the menu, unless focus stays inside, or moves to (or is lost by a press on) one of
   * this dropdown's invoker buttons:  that button's `command` decides, so `--toggle` closes an open menu instead of
   * closing it here and reopening it.
   */
  private readonly onBlur = (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null
    if (next && (this.domElement.contains(next) || this.domElement.renderRoot.contains(next))) return
    const id = this.domElement.id
    if (id && (next as Element | null)?.closest?.(`[commandfor="${CSS.escape(id)}"]`)) return
    if (this.isReady && UI.overlays.pressedInvokerOf(this.domElement)) return
    this.requestOpen(false, event)
  }

  /** Combobox keyboard pattern (APG), plus type-ahead and Backspace-removes-last. */
  @E.untracked
  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (this.isDisabled || event.defaultPrevented) return
    const isOpen = this.isOpen
    const { key } = event
    switch (key) {
      case UIT.Key.arrowDown:
      case UIT.Key.arrowUp:
        event.preventDefault()
        if (!isOpen) this.requestOpen(true, event)
        else this.move(key === UIT.Key.arrowDown ? 1 : -1)
        return
      case UIT.Key.home:
      case UIT.Key.end:
        if (!isOpen) return
        event.preventDefault()
        this.highlightedIndex = this.visibleOptions.nextEnabledIndex(-1, key === UIT.Key.home ? 1 : -1)
        return
      case UIT.Key.pageDown:
      case UIT.Key.pageUp:
        if (!isOpen) return
        event.preventDefault()
        this.move(key === UIT.Key.pageDown ? this.pageSize : -this.pageSize)
        return
      case UIT.Key.enter: {
        if (!isOpen) {
          if (this.search) this.requestOpen(true, event)
          return
        }
        event.preventDefault()
        const visible = this.visibleOptions
        const option = this.highlightedOption ?? visible.addition
        if (option) this.select(option, event)
        return
      }
      case UIT.Key.space: {
        if (this.search || !isOpen) return
        event.preventDefault()
        const option = this.highlightedOption
        if (option) this.select(option, event)
        return
      }
      case UIT.Key.tab:
        if (isOpen) this.requestOpen(false, event)
        return
      case UIT.Key.backspace: {
        const values = this.chosenValues
        if (this.search && this.multiple && !this.query && values.length) {
          this.remove(values.at(-1)!, event)
        }
        return
      }
    }
    if (!this.search && key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault()
      this.typeAhead(key, event)
    }
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

/**
 * The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`).
 * - Minus `value`:  the `@controlled` member of that name wins over its getter, and holds a `string[]` too.
 */
export interface UIDropdown extends Omit<E.AttributeValues<typeof dropdownVocabulary>, "value"> {}

////////////////
// ## Constants
////////////////

/** `UI.ids` prefix. */
const ID_PREFIX = "ui-dropdown"

/** Placeholder in the `addItem` text. */
const VALUE_PLACEHOLDER = "{value}"

/**
 * Class words of the markup contract (`UIDropdown.css`) -- grammar, not attributes, so not in the vocabulary.
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
