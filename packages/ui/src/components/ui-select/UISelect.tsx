import { For, Show, createEffect, createMemo, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { F } from "$/ui/forms"
// REFACTOR: `SlottedItems` reads `<ui-item>`s as data for the dropdown AND the select;  it belongs to the `item`
// family (next to `itemVocabulary`), which would also spare the bundle a shared dropdown / select chunk
import { SlottedItems } from "$/ui/components/ui-dropdown/SlottedItems"
import { selectVocabulary } from "./ui-select.vocabulary.en"
import { SelectFallback } from "./ui-select.fallback"
import { DIVIDER, PLACEHOLDER, type SelectBlock, type Vocabulary } from "./ui-select.types"

import selectCSS from "./ui-select.css?inline"

/****************
 * ### `<ui-select>`
 * A NATIVE `<select>` in the shadow root, in the closed look of Fomantic's `selection dropdown`.
 * - Customizable select:  where the browser has `appearance: base-select` (`UI.browser.supports.baseSelect`), the
 *   select gets a `<button><selectedcontent>` and `ui-select.css` styles the picker (`::picker(select)`) and its
 *   rich options (icon, image, flag, description).  Elsewhere (Safari before 27, Firefox) the same markup is a
 *   plain native select:  every option keeps its text, so nothing shows blank, and the closed box looks the same.
 * - Model:  slotted `<ui-item>`s (`SlottedItems`, shared with the dropdown) + the `options` property;  a `header`
 *   item opens an `<optgroup>`, a `divider` item is an `<hr>`.
 * - `value` is auto-controlled (`Controlled`):  a person's change dispatches `ui-change` first;  a handler that
 *   re-sets `el.value` wins, and the select shows the host's value again.
 * - Single:  an empty first option (the `placeholder`) stands while nothing is chosen, so the browser never
 *   silently chooses the first option;  `required` disables it (it can't be chosen back).
 * - An option's `flag` draws through `UIT.Flags`, the rule `<ui-flag>` draws with;  a flag that isn't a code shows
 *   as its text.
 * - Keyboard, picker, type-ahead and screen-reader semantics are the browser's.
 * - Form-associated:  `multiple` submits one `FormData` entry per value;  `required` => `valueMissing`.
 ****************/
export class UISelect extends F.FormElement<Vocabulary> {
  @E.proto static vocabulary = selectVocabulary
  @E.proto static styles = { select: selectCSS }
  @E.proto static Fallback = SelectFallback

  ////////////////
  // ## State
  ////////////////

  /** Options from slotted `<ui-item>`s. */
  readonly items = new SlottedItems(this.host)

  /** Host `<label>`s and `aria-label`, as the select's name. */
  readonly labels = new F.ControlLabels(this.formHost)

  /** Bumped on every change a person makes, so the `<select>` re-syncs even when the value stayed (a host veto). */
  readonly revision = new E.Cell(0)

  /** `value`:  host-controlled, or internal;  starts from `selected` items. */
  readonly valueState = this.controlled("value", this.selectedItemValues() as never)

  /** Host value to restore on form reset (`undefined`:  back to the `selected` items). */
  private readonly initialValue = untrack(() => this.attrs.value)

  /** The native select. */
  private select?: HTMLSelectElement

  ////////////////
  // ## Derived
  ////////////////

  /** `options` property, validated to an array. */
  readonly propOptions = createMemo((): UIT.SelectOptions => {
    const options = this.attrs.options
    return Array.isArray(options) ? (options as UIT.SelectOptions) : []
  })

  /** What the select holds:  slotted entries grouped under their headers, then the `options` property. */
  readonly blocks = createMemo((): readonly SelectBlock[] => {
    const blocks: SelectBlock[] = []
    let groupOptions: E.MenuOption[] | undefined
    for (const entry of this.items.entries()) {
      if (!("type" in entry)) {
        if (groupOptions) groupOptions.push(entry)
        else blocks.push(entry)
      } else if (entry.type === UIT.HEADER) blocks.push({ header: entry, options: (groupOptions = []) })
      else {
        groupOptions = undefined
        blocks.push(entry)
      }
    }
    return [...blocks, ...this.propOptions()]
  })

  /** Every option, in order. */
  readonly all = createMemo(
    (): readonly E.MenuOption[] => [...this.items.entries().filter(UISelect.isOption), ...this.propOptions()],
    { equals: UISelect.isSameList }
  )

  /** Chosen values, always as an array. */
  readonly values = createMemo(
    (): readonly string[] => {
      const value = this.valueState.get() as unknown
      if (Array.isArray(value)) return value.map(String)
      if (typeof value !== "string" || value === "") return []
      return this.attrs.multiple ? E.Converters.list(value) : [value]
    },
    { equals: UISelect.isSameList }
  )

  /** Render the empty first option:  single, and a `placeholder` or nothing chosen yet. */
  readonly isShowingPlaceholder = createMemo(
    () => !this.attrs.multiple && (this.attrs.placeholder !== undefined || !this.values().length)
  )

  isDisabled(): boolean {
    return this.attrs.disabled || this.isFormDisabled.get()
  }

  /** Name for the select:  its `<label>`s / `aria-label`, else `placeholder`, else `name`. */
  private label(): string | undefined {
    return this.labels.name() ?? this.attrs.placeholder ?? this.attrs.name
  }

  /** Draws the customizable select?  Single only, and only once the runtime (`UI.browser`) is there. */
  private isCustomizable(): boolean {
    return this.isLoaded() && !this.attrs.multiple && UI.browser.supports.baseSelect
  }

  ////////////////
  // ## Element hooks
  ////////////////

  /** The `disabled` class:  also by a disabled fieldset. */
  protected classValue(name: E.AttributeName<Vocabulary>): unknown {
    if (name === "disabled") return this.isDisabled()
    return super.classValue(name)
  }

  protected hostStates() {
    return { disabled: this.isDisabled(), fluid: this.attrs.fluid, customizable: this.isCustomizable() }
  }

  formValue(): E.FieldValue {
    const values = this.values()
    return this.attrs.multiple ? values : (values[0] ?? null)
  }

  protected formName(): string | undefined {
    return this.attrs.name
  }

  /** Back to the starting value;  the `<select>` shows it again. */
  formReset() {
    this.valueState.set(this.initialValue as never)
    this.revision.set(untrack(() => this.revision.get()) + 1)
  }

  protected rules(): E.ValidationRule[] {
    return this.attrs.required ? [UIT.REQUIRED_RULE] : []
  }

  protected validationLabel(): string | undefined {
    return this.label()
  }

  protected validationAnchor(): HTMLElement | undefined {
    return this.select
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** Adds the DOM sync (state => `<select>`) and the label refresh to `FormElement.mount()`. */
  mount() {
    createEffect(
      () => [this.values(), this.blocks(), this.isShowingPlaceholder(), this.revision.get(), this.isLoaded()],
      () => this.syncSelect()
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
    return (
      <select
        ref={(element) => (this.select = element)}
        class={this.classes()}
        part={this.part("select")}
        multiple={this.attrs.multiple}
        disabled={this.isDisabled()}
        required={this.attrs.required}
        aria-label={this.label()}
        aria-invalid={this.validation().valid ? undefined : UIT.TRUE}
        {...this.staticSelect()}
        onChange={this.onChange}
      >
        <Show when={this.isCustomizable()}>
          <button type={UIT.BUTTON} part={this.part("button")}>
            <selectedcontent />
          </button>
        </Show>
        <Show when={this.isShowingPlaceholder()}>
          <option
            class={PLACEHOLDER}
            part={this.part("placeholder")}
            value=""
            disabled={this.attrs.required && this.attrs.placeholder !== undefined}
            {...this.staticOption("")}
          >
            {this.attrs.placeholder ?? ""}
          </option>
        </Show>
        <For each={this.blocks()}>{(block) => this.block(block)}</For>
      </select>
    )
  }

  /** One option, group or divider. */
  private block(block: SelectBlock): JSX.Element {
    if ("options" in block) {
      return (
        <optgroup label={block.header.text} part={this.part("group")}>
          <For each={block.options}>{(option) => this.option(option)}</For>
        </optgroup>
      )
    }
    if ("type" in block) return <hr class={DIVIDER} />
    return this.option(block)
  }

  /**
   * One `<option>`:  icon, image, flag, text, description.
   * - Only the TEXT parts (flag emoji, text, description) count in a plain select:  it shows the option's text
   *   content.  A space keeps the description apart from the text there.
   */
  private option(option: E.MenuOption): JSX.Element {
    const glyph = new E.IconGlyph({
      owner: this,
      name: () => (typeof option.icon === "string" ? option.icon : undefined)
    })
    return (
      <option
        class={UIT.ITEM}
        part={this.part("option")}
        value={option.value}
        disabled={!!option.disabled}
        {...this.staticOption(option.value)}
      >
        <Show when={typeof option.icon === "string"}>
          <span class={UIT.ICON} aria-hidden={UIT.TRUE}>
            {glyph.svg()}
          </span>
        </Show>
        <Show when={typeof option.image === "string"}>
          <img class={AVATAR_IMAGE} src={option.image as string} alt="" />
        </Show>
        <Show when={typeof option.flag === "string"}>
          <span class={FLAG}>{UIT.Flags.emojiFor(option.flag as string) || (option.flag as string)}</span>
        </Show>
        <span class={UIT.TEXT}>{option.text}</span>
        <Show when={option.description}>
          {" "}
          <span class={UIT.DESCRIPTION}>{option.description}</span>
        </Show>
      </option>
    )
  }

  /**
   * Server render only (`$/ui/static`):  the select's `name`, so it submits without JS;  `{}` in a browser, where
   * the HOST submits (`ElementInternals`).
   */
  private staticSelect(): Record<string, unknown> {
    return isServer ? { name: this.attrs.name } : {}
  }

  /**
   * Server render only:  `selected` on the option of `value` while it's chosen (`""`:  the placeholder, while
   * nothing is);  `{}` in a browser, where `syncSelect()` sets it.
   * - The placeholder is also `disabled` while chosen:  a disabled option isn't submitted, so a static form sends
   *   no `name=` for it, as the element sends nothing without a value.  NOTE: a no-JS reader can't go back to it.
   */
  private staticOption(value: string): Record<string, unknown> {
    if (!isServer) return {}
    const values = this.values()
    if (value !== "") return { selected: values.includes(value) }
    const isRequired = this.attrs.required && this.attrs.placeholder !== undefined
    return { selected: !values.length, disabled: isRequired || !values.length }
  }

  /**
   * Show the chosen values in the `<select>`.
   * - Runs after every DOM update that could move the browser's selection (options added, the placeholder
   *   removed) and after each change a person makes, so the select always shows the element's value.
   */
  private syncSelect() {
    const { select } = this
    if (!select) return
    const chosen = new Set(untrack(() => this.values()))
    for (const option of select.options) {
      option.selected = option.classList.contains(PLACEHOLDER) ? !chosen.size : chosen.has(option.value)
    }
  }

  ////////////////
  // ## Handlers
  ////////////////

  /** Someone changed the selection:  `ui-change` through `Controlled`, then re-sync. */
  private readonly onChange = (event: Event) => {
    const select = event.currentTarget as HTMLSelectElement
    const chosen = [...select.selectedOptions].map((option) => option.value).filter((value) => value !== "")
    const value = this.attrs.multiple ? chosen : (chosen[0] ?? "")
    this.valueState.request(value as never, () => {
      this.emit("ui-change", { value, originalEvent: event })
      return true
    })
    this.revision.set(untrack(() => this.revision.get()) + 1)
  }

  /** Values of slotted items marked `selected`, the uncontrolled starting value. */
  private selectedItemValues(): string | string[] | undefined {
    const values = untrack(() => this.items.entries())
      .filter(UISelect.isOption)
      .filter((option) => option.selected)
      .map((option) => option.value)
    if (!values.length) return undefined
    return untrack(() => this.attrs.multiple) ? values : values[0]
  }

  ////////////////
  // ## Statics
  ////////////////

  /**
   * Is `entry` an option (not a header or divider)?
   * - STATIC:  pure, a `filter()` predicate.
   */
  private static isOption(entry: E.MenuEntry): entry is E.MenuOption {
    return !("type" in entry)
  }

  /**
   * Same items in the same order?  Memo `equals` for arrays.
   * - STATIC:  pure, handed to `createMemo()`.
   */
  private static isSameList<T>(a: readonly T[], b: readonly T[]): boolean {
    return a.length === b.length && a.every((item, index) => item === b[index])
  }
}

////////////////
// ## Constants
////////////////

/** Class words of an option's `image`. */
const AVATAR_IMAGE = "ui avatar image"

/** Class word of an option's `flag`. */
const FLAG = "flag"
