import { For, Show, createEffect, createMemo, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import {
  Cell,
  Converters,
  IconGlyph,
  proto,
  SlotContent,
  type AttributeName,
  type FieldValue,
  type MenuAddition,
  type MenuEntry,
  type MenuOption,
  type MenuSeparator,
  type OverlayEntry,
  type ValidationRule,
  UI,
  UIT
} from "$/ui/core"
import { FormElement, MenuOptions } from "$/ui/forms"

import { dropdownVocabulary } from "./ui-dropdown.vocabulary.en"
import { DropdownFallback } from "./ui-dropdown.fallback"
import { SlottedItems } from "./SlottedItems"
import {
  ADDITION,
  DEFAULT,
  FILTERED,
  ID_PREFIX,
  ITEM,
  LEFT,
  MENU,
  REGIONAL_A,
  SELECTED,
  TEXT,
  VALUE_PLACEHOLDER,
  Vocabulary
} from "./ui-dropdown.types"

import buttonCSS from "$/ui/components/ui-button/ui-button.css?inline"
import dropdownCSS from "./ui-dropdown.css?inline"

/****************
 * ### `<ui-dropdown>`
 * A combobox + listbox:  a `<button>` (or, with `search`, an `<input>`) combobox and an anchor-positioned
 * popover menu, both in the shadow root.
 * - Model:  slotted `<ui-item>`s (`SlottedItems`) + the `options` property + additions, as `MenuOptions`;
 *   memos derive the visible list (exclude chosen, filter, additions) per keystroke.
 * - Invoker commands (`<button commandfor="id" command="--toggle">`, `TOGGLE_COMMANDS`) open / close the menu as a user
 *   action;  a disabled or read-only dropdown ignores them.
 * - `value` and `open` are auto-controlled (`Controlled`):  events first, the host may veto / override.
 * - Menu rows render only while open (`<For>` keyed by option identity);  `aria-activedescendant` points at
 *   the highlighted row.  Escape and outside clicks come from `UI.overlays`.
 * - Form-associated:  `multiple` submits one `FormData` entry per value;  `required` => `valueMissing`.
 ****************/
export class UIDropdown extends FormElement<Vocabulary> {
  @proto static vocabulary = dropdownVocabulary
  @proto static styles = { button: buttonCSS, dropdown: dropdownCSS }
  @proto static Fallback = DropdownFallback

  /** Rows PageUp / PageDown move. */
  static pageSize = 10

  /** Type-ahead buffer timeout, ms. */
  static typeAheadDelay = 500

  ////////////////
  // ## State
  ////////////////

  /** Options from slotted `<ui-item>`s. */
  readonly items = new SlottedItems(this.host)

  /** Light-DOM slot occupancy (`icon`, `trigger`, `header`). */
  readonly slots = new SlotContent(this.host)

  /** Values added with `allow-additions`, as options. */
  readonly added = new Cell<readonly MenuOption[]>([])

  /** Search query. */
  readonly query = new Cell("")

  /** Highlighted index into `visible().options`;  `-1` for none. */
  readonly active = new Cell(-1)

  /** `open`:  host-controlled, or internal. */
  readonly openState = this.controlled("open", false)

  /** `value`:  host-controlled, or internal;  starts from `selected` items. */
  readonly valueState = this.controlled("value", this.selectedItemValues() as never)

  /** Host value to restore on form reset (`undefined`:  back to the `selected` items). */
  private readonly initialValue = untrack(() => this.attrs.value)

  /** Search-key cache shared by every `MenuOptions` this element derives. */
  private readonly keys = new WeakMap() as NonNullable<ConstructorParameters<typeof MenuOptions>[2]>

  /** Stable DOM id per option. */
  private readonly optionIds = new WeakMap<MenuOption, string>()

  /** Type-ahead buffer and its timer. */
  private typed = ""
  private typedTimer?: ReturnType<typeof setTimeout>

  /** Ids / anchor name, from `UI.ids` once rendering. */
  private ids = { menu: "", text: "", anchor: "" }

  /** The combobox (trigger button or search input), and the menu. */
  private combobox?: HTMLElement
  private menu?: HTMLElement

  /** This element's `UI.overlays` entry. */
  private readonly overlay: OverlayEntry = {
    element: this.host,
    kind: "popover",
    restoreFocus: false,
    onDismiss: () => void this.setOpen(false)
  }

  constructor(...args: ConstructorParameters<typeof FormElement>) {
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
    (): readonly MenuOption[] => [
      ...this.items.entries().filter(UIDropdown.isOption),
      ...this.propOptions(),
      ...this.added.get()
    ],
    { equals: UIDropdown.sameItems }
  )

  /** Option by value, for texts of chosen values. */
  readonly byValue = createMemo(() => new Map(this.all().map((option) => [option.value, option])))

  /** Chosen values, always as an array. */
  readonly values = createMemo(
    (): readonly string[] => {
      const value = this.valueState.get() as unknown
      if (Array.isArray(value)) return value.map(String)
      if (typeof value !== "string" || value === "") return []
      return this.attrs.multiple ? Converters.list(value) : [value]
    },
    { equals: UIDropdown.sameItems }
  )

  /** Chosen values as a set, for row state. */
  readonly chosen = createMemo(() => new Set(this.values()))

  /** The effective query:  only with `search`. */
  readonly effectiveQuery = createMemo(() => (this.attrs.search ? this.query.get() : ""))

  /** Options offered now:  minus chosen (multiple), filtered, plus the addition. */
  readonly visible = createMemo(() => {
    const query = this.effectiveQuery()
    return new MenuOptions(this.all(), undefined, this.keys)
      .excludeSelected(this.attrs.multiple ? this.values() : [])
      .filter(query, { minCharacters: this.attrs.minCharacters ?? 0 })
      .withAdditions(query, { allowAdditions: this.attrs.allowAdditions && this.canAdd() })
  })

  /** Menu rows:  separators in place while not searching, else just the visible options. */
  readonly rows = createMemo(
    (): readonly (MenuEntry | MenuAddition)[] => {
      const visible = this.visible()
      const entries = this.items.entries()
      if (this.effectiveQuery() || !entries.some((entry) => "type" in entry)) return visible.options
      const shown = new Set<MenuOption>(visible.options)
      const rows: (MenuEntry | MenuAddition)[] = entries.filter((entry) => "type" in entry || shown.has(entry))
      const slotted = new Set<MenuEntry>(entries)
      for (const option of visible.options) if (!slotted.has(option)) rows.push(option)
      return rows
    },
    { equals: UIDropdown.sameItems }
  )

  /** Highlighted option. */
  readonly highlighted = createMemo(() => this.visible().options[this.active.get()] as MenuOption | undefined)

  /** Open now. */
  isOpen(): boolean {
    return this.openState.get()
  }

  isDisabled(): boolean {
    return this.attrs.disabled || this.formDisabled.get()
  }

  /** Label for the combobox and listbox:  `placeholder`, else `text`, else `name`. */
  private label(): string {
    return this.attrs.placeholder ?? this.attrs.text ?? this.attrs.name ?? ""
  }

  /** Text of `value`:  its option's, else `text` (single), else the value itself. */
  private textOf(value: string): string {
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

  protected classValue(name: AttributeName<Vocabulary>): unknown {
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

  formValue(): FieldValue {
    const values = this.values()
    return this.attrs.multiple ? values : (values[0] ?? null)
  }

  protected formName(): string | undefined {
    return this.attrs.name
  }

  formReset() {
    this.valueState.set(this.initialValue as never)
    this.query.set("")
  }

  protected rules(): ValidationRule[] {
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
            <span class="sizer" aria-hidden="true">
              {this.query.get()}
            </span>
          </Show>
        </Show>
        <Show when={this.attrs.labeled && this.attrs.icon}>{this.labeledIcon()}</Show>
        <span
          id={this.ids.text}
          class={[TEXT, { [DEFAULT]: this.showsPlaceholder(), [FILTERED]: !!this.effectiveQuery() }]}
          part={this.part("text")}
        >
          <slot name={this.slot("trigger")}>{this.displayText()}</slot>
        </span>
        <Show when={this.attrs.clearable && this.values().length && !this.attrs.readonly}>
          <button
            type="button"
            class="remove icon"
            part={this.part("clear")}
            aria-label={this.text("clear")}
            onClick={this.onClear}
          />
        </Show>
        <span class="dropdown icon" part={this.part("icon")}>
          <Show when={this.slots.has(this.slot("icon"))}>
            <slot name={this.slot("icon")} />
          </Show>
        </span>
        {this.menuElement()}
        <slot hidden />
      </div>
    )
  }

  /** Text shown in `.text`:  chosen text (single), else `text` (a menu's fixed label), else the placeholder. */
  private displayText(): string {
    const [first] = this.values()
    if (first !== undefined && !this.attrs.multiple) return this.textOf(first)
    return this.attrs.text ?? this.attrs.placeholder ?? ""
  }

  /** Showing the placeholder (grey `default` text)? */
  private showsPlaceholder(): boolean {
    return !this.values().length && this.attrs.text === undefined
  }

  /** Combobox ARIA shared by the trigger and the search input. */
  private comboboxProps() {
    return {
      role: "combobox",
      "aria-expanded": this.isOpen() ? "true" : "false",
      "aria-controls": this.ids.menu,
      "aria-haspopup": "listbox",
      "aria-activedescendant": this.isOpen() && this.highlighted() ? this.optionId(this.highlighted()!) : undefined,
      "aria-label": this.label() || undefined,
      "aria-describedby": this.ids.text,
      "aria-busy": this.attrs.loading ? "true" : undefined,
      "aria-readonly": this.attrs.readonly ? "true" : undefined,
      "aria-required": this.attrs.required ? "true" : undefined,
      "aria-invalid": this.validation().valid ? undefined : "true"
    } as const
  }

  /** The covering `<button>` combobox. */
  private trigger(): JSX.Element {
    return (
      <button
        ref={(element) => (this.combobox = element)}
        type="button"
        class="trigger"
        part={this.part("trigger")}
        disabled={this.isDisabled()}
        {...this.comboboxProps()}
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
        class="search"
        part={this.part("search")}
        autocomplete="off"
        aria-autocomplete="list"
        disabled={this.isDisabled()}
        readonly={this.attrs.readonly}
        value={this.query.get()}
        {...this.comboboxProps()}
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
      <span class="ui label" part={this.part("label")}>
        {this.textOf(value)}
        <Show when={!this.attrs.readonly && !this.isDisabled()}>
          <button
            type="button"
            class="delete icon"
            tabindex="-1"
            aria-label={this.text("removeValue", { value: this.textOf(value) })}
            onClick={(event) => this.remove(value, event)}
          />
        </Show>
      </span>
    )
  }

  /** The icon block of a `labeled` (icon) dropdown button. */
  private labeledIcon(): JSX.Element {
    return <span class={UIT.ICON} ref={(element) => void SVGIcon.fill(element, this.attrs.icon)} />
  }

  /** The listbox popover. */
  private menuElement(): JSX.Element {
    return (
      <div
        ref={(element) => (this.menu = element)}
        id={this.ids.menu}
        class={[MENU, { [LEFT]: this.attrs.direction === "left" }]}
        role="listbox"
        popover={this.attrs.simple ? undefined : "manual"}
        part={this.part("menu")}
        aria-label={this.label() || undefined}
        aria-multiselectable={this.attrs.multiple ? "true" : undefined}
        onMouseDown={UIDropdown.preventDefault}
      >
        <slot name={this.slot("header")} />
        <Show when={this.isOpen() || this.attrs.simple}>
          <For each={this.rows()}>{(row) => this.row(row)}</For>
          <Show when={!this.visible().length}>
            {/* an option (disabled) rather than a bare div:  a listbox must own options (axe `aria-required-children`) */}
            <div class="message" role="option" aria-disabled="true" aria-selected="false">
              {this.attrs.noResultsText ?? this.text("noResults")}
            </div>
          </Show>
        </Show>
      </div>
    )
  }

  /** One menu row. */
  private row(row: MenuEntry | MenuAddition): JSX.Element {
    if ("type" in row) return this.separator(row)
    if ("addition" in row) return this.additionRow(row)
    const option = row
    const slot = this.items.slots.get(option)
    return (
      <div
        id={this.optionId(option)}
        class={[
          ITEM,
          {
            [UIT.ACTIVE]: this.chosen().has(option.value),
            [SELECTED]: this.highlighted() === option,
            [UIT.DISABLED]: !!option.disabled
          }
        ]}
        role="option"
        part={this.part("item")}
        aria-selected={this.chosen().has(option.value) ? "true" : "false"}
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
  private optionContent(option: MenuOption): JSX.Element {
    return (
      <>
        <Show when={typeof option.icon === "string"}>
          <span class={UIT.ICON} ref={(element) => void SVGIcon.fill(element, option.icon as string)} />
        </Show>
        <Show when={typeof option.image === "string"}>
          <img class="ui avatar image" src={option.image as string} alt="" />
        </Show>
        <Show when={typeof option.flag === "string"}>
          <span class="flag">{UIDropdown.flagEmoji(option.flag as string)}</span>
        </Show>
        <Show when={option.description}>
          <span class="description">{option.description}</span>
        </Show>
        <span class={TEXT}>{this.highlightText(option)}</span>
      </>
    )
  }

  /** `option.text` with the query's matches in `<mark>`. */
  private highlightText(option: MenuOption): JSX.Element {
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
  private additionRow(option: MenuAddition): JSX.Element {
    const template = this.attrs.additionText ?? this.text("addItem")
    const [before = "", after = ""] = template.split(VALUE_PLACEHOLDER)
    return (
      <div
        id={this.optionId(option)}
        class={[ITEM, ADDITION, { [SELECTED]: this.highlighted() === option }]}
        role="option"
        part={this.part("item")}
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
  private separator(entry: MenuSeparator): JSX.Element {
    return entry.type === "divider" ? (
      <hr class="divider" role="presentation" />
    ) : (
      <div class="header" role="presentation">
        {entry.text}
      </div>
    )
  }

  /** Stable id for `option`'s row. */
  private optionId(option: MenuOption): string {
    let id = this.optionIds.get(option)
    if (!id) this.optionIds.set(option, (id = `${this.ids.menu}-${++UIDropdown.optionCounter}`))
    return id
  }

  ////////////////
  // ## Effects
  ////////////////

  /**
   * Popover + overlay registration while open AND connected;  highlighted row kept in view.
   * - `connected`:  `keepAlive` keeps an open dropdown's state when it's removed, but the page must not keep its
   *   overlay entry (Escape / outside clicks) for an element that isn't there;  reconnecting re-registers.
   */
  private effects() {
    createEffect(
      () => this.isOpen() && this.connected.get(),
      (open) => {
        const { menu } = this
        if (!open || !menu || !menu.popover) return
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
        if (option) this.host.renderRoot.getElementById(this.optionId(option))?.scrollIntoView({ block: "nearest" })
      }
    )
  }

  ////////////////
  // ## Transitions
  ////////////////

  /**
   * Open or close, dispatching the cancelable `ui-open` / `ui-close` first.
   * - Opening highlights the chosen option, else the first enabled one.
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

  /** Choose `option` (or add the addition), as the user did with `originalEvent`. */
  select(option: MenuOption, originalEvent?: Event) {
    if (option.disabled || this.attrs.readonly) return
    const values = untrack(() => this.values())
    const addition = "addition" in option
    if (this.attrs.multiple) {
      if (!untrack(() => this.canAdd())) return
      const next = [...values, option.value]
      this.commit(next, originalEvent, () => this.emit("ui-add", { value: option.value, originalEvent }))
      this.query.set("")
      this.active.set(0)
    } else {
      this.commit([option.value], originalEvent, () => {
        if (addition) this.emit("ui-add", { value: option.value, originalEvent })
      })
      this.setOpen(false, originalEvent)
    }
    if (addition) this.added.set([...untrack(() => this.added.get()), { value: option.value, text: option.text }])
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
  private highlight(option: MenuOption) {
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
   * An invoker command aimed at the host (`TOGGLE_COMMANDS`):  a user action, ignored when disabled / read-only.
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
    if ((target as Element).closest?.("button")) return
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
    if (this.loaded() && UI.overlays.pressedInvokerOf(this.host)) return
    this.setOpen(false, event)
  }

  /** Combobox keyboard pattern (APG), plus type-ahead and Backspace-removes-last. */
  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (this.isDisabled() || event.defaultPrevented) return
    const open = untrack(() => this.isOpen())
    const { key } = event
    switch (key) {
      case "ArrowDown":
      case "ArrowUp":
        event.preventDefault()
        if (!open) this.setOpen(true, event)
        else this.move(key === "ArrowDown" ? 1 : -1)
        return
      case "Home":
      case "End":
        if (!open) return
        event.preventDefault()
        this.active.set(untrack(() => this.visible()).nextEnabledIndex(-1, key === "Home" ? 1 : -1))
        return
      case "PageDown":
      case "PageUp":
        if (!open) return
        event.preventDefault()
        this.move(key === "PageDown" ? UIDropdown.pageSize : -UIDropdown.pageSize)
        return
      case "Enter": {
        if (!open) {
          if (this.attrs.search) this.setOpen(true, event)
          return
        }
        event.preventDefault()
        const visible = untrack(() => this.visible())
        const option = untrack(() => this.highlighted()) ?? visible.addition
        if (option) this.select(option, event)
        return
      }
      case " ":
        if (this.attrs.search || !open) return
        event.preventDefault()
        if (untrack(() => this.highlighted()))
          this.select(
            untrack(() => this.highlighted())!,
            event
          )
        return
      case "Tab":
        if (open) this.setOpen(false, event)
        return
      case "Backspace": {
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
    this.typedTimer = setTimeout(() => (this.typed = ""), UIDropdown.typeAheadDelay)
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

  /**
   * Same items in the same order?  Memo `equals` for arrays, so a recomputation that yields an equivalent list
   * doesn't wake every row (Solid's dev diagnostics flag it as `UNSTABLE_MEMO_OUTPUT`).
   */
  private static sameItems<T>(a: readonly T[], b: readonly T[]): boolean {
    return a.length === b.length && a.every((item, index) => item === b[index])
  }

  /** Is `entry` an option (not a separator)? */
  private static isOption(entry: MenuEntry): entry is MenuOption {
    return !("type" in entry)
  }

  /** Counter behind option ids. */
  private static optionCounter = 0

  /** `preventDefault()`:  menu presses must not take focus from the combobox. */
  private static preventDefault(event: Event) {
    event.preventDefault()
  }

  /** Country code => flag emoji (regional indicators), e.g. `fr` => 🇫🇷;  other text unchanged. */
  private static flagEmoji(code: string): string {
    if (!/^[a-z]{2}$/i.test(code)) return code
    const upper = code.toUpperCase()
    return String.fromCodePoint(REGIONAL_A + upper.charCodeAt(0) - 65, REGIONAL_A + upper.charCodeAt(1) - 65)
  }
}

////////////////
// ## Helpers
////////////////

/**
 * Draws an icon from the packs the element sees (its `<ui-root icons>`, else `UI.icons`) into it once it has loaded.
 * - Plain DOM, no signal:  rows are many and their icons never change.
 */
class SVGIcon {
  /** Replace `element`'s content with icon `name`, when loaded. */
  static async fill(element: HTMLElement, name: string | undefined) {
    if (!name) return
    const icons = IconGlyph.packsFor(element, (await UI.load()).icons)
    const template = icons.peek(name) ?? (await icons.get(name))
    if (template) element.replaceChildren(IconGlyph.draw(template))
  }
}
