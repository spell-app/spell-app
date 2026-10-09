import { For, Show, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { F } from "$/ui/forms"
// REFACTOR: `SlottedItems` reads `<ui-item>`s as data for the dropdown AND the select;  it belongs to the `item`
// family (next to `itemVocabulary`), which would also spare the bundle a shared dropdown / select chunk
import { SlottedItems } from "$/ui/components/ui-dropdown/SlottedItems"
import { selectVocabulary } from "./UISelect.en"
import { SelectFallback } from "./UISelect.fallback"
import { DIVIDER, PLACEHOLDER, type SelectBlock, type Vocabulary } from "./UISelect.types"

import selectCSS from "./UISelect.css?inline"

/****************
 * ### `UISelect`
 * The component behind `<ui-select>`:  a NATIVE `<select>` in the shadow root,
 * in the closed look of Fomantic's `selection dropdown`.
 *
 * - The customizable select:  where the browser has `appearance: base-select` (`UI.browser.supports.baseSelect`),
 *   the select gets a `<button><selectedcontent>`, and `UISelect.css` styles the picker (`::picker(select)`)
 *   and its rich options (icon, image, flag, description).
 *   Elsewhere (Safari before 27, Firefox) the same markup is a plain native select:
 *   every option keeps its text, so nothing shows blank, and the closed box looks the same.
 *
 * - Its options:  the slotted `<ui-item>`s (`SlottedItems`, shared with the dropdown), then the `options` property.
 *   A `header` item opens an `<optgroup>`;  a `divider` item is an `<hr>`.
 * - `value` is controlled (`@controlled`):  a person's change sends `ui-change` first;
 *   a handler that sets `el.value` again wins, and the select shows that value.
 * - A single select shows an empty first option (the `placeholder`) while nothing is chosen,
 *   so the browser never silently chooses the first option.  `required` disables it (it can't be chosen back).
 * - An option's `flag` draws through `UIT.Flags`, the rule `<ui-flag>` draws with;
 *   a flag that isn't a code shows as its text.
 * - Keyboard, picker, type-ahead and screen-reader behaviour are the browser's.
 * - A form control:  `multiple` submits one `FormData` entry per value;  `required` => `valueMissing`.
 ****************/
export class UISelect extends F.FormComponent<Vocabulary> {
  @E.proto static vocabulary = selectVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { select: selectCSS },
    Fallback: SelectFallback
  } satisfies Partial<E.ElementSetup>

  ////////////////
  // ## Options
  ////////////////

  /** Options from slotted `<ui-item>`s. */
  readonly items = new SlottedItems(this.domElement)

  /** `options` property, validated to an array. */
  get propertyOptions(): UIT.SelectOptions {
    const options = this.options
    return Array.isArray(options) ? (options as UIT.SelectOptions) : []
  }

  /** What the select holds:  slotted entries grouped under their headers, then the `options` property. */
  @E.derived
  get blocks(): readonly SelectBlock[] {
    const blocks: SelectBlock[] = []
    let groupOptions: E.MenuOption[] | undefined
    for (const entry of this.items.entries) {
      if (!("type" in entry)) {
        if (groupOptions) groupOptions.push(entry)
        else blocks.push(entry)
      } else if (entry.type === UIT.HEADER) blocks.push({ header: entry, options: (groupOptions = []) })
      else {
        groupOptions = undefined
        blocks.push(entry)
      }
    }
    return [...blocks, ...this.propertyOptions]
  }

  ////////////////
  // ## Value
  ////////////////

  /** `value`:  set by the page, or chosen;  starts from the `selected` items. */
  @E.controlled("value") accessor value: UIT.SelectValue | undefined = this.selectedItemValues()

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

  /** Render the empty first option:  single, and a `placeholder` or nothing chosen yet. */
  get placeholderIsShowing(): boolean {
    return !this.multiple && (this.placeholder !== undefined || !this.chosenValues.length)
  }

  /** Bumped on every change a person makes, so the `<select>` shows the value again even when it stayed (a veto). */
  @E.state accessor selectRevision = 0

  /** The value, the options or the placeholder changed (or a person chose):  the `<select>` shows the value again. */
  @E.onChange("chosenValues", "blocks", "placeholderIsShowing", "selectRevision", "isReady")
  protected onOptionsChanged() {
    this.syncSelect()
  }

  /**
   * Show the chosen values in the `<select>`.
   * - Runs after every DOM update that could move the browser's selection (options added,
   *   the placeholder removed) and after each change a person makes, so the select always shows the element's value.
   */
  private syncSelect() {
    const { select } = this
    if (!select) return
    const chosen = new Set(untrack(() => this.chosenValues))
    for (const option of select.options) {
      option.selected = option.classList.contains(PLACEHOLDER) ? !chosen.size : chosen.has(option.value)
    }
  }

  /** Someone changed the selection:  `ui-change` through `requestChange()`, then re-sync. */
  private readonly onChange = (event: Event) => {
    const select = event.currentTarget as HTMLSelectElement
    const chosen = [...select.selectedOptions].map((option) => option.value).filter((value) => value !== "")
    const value = this.multiple ? chosen : (chosen[0] ?? "")
    this.requestChange("value", value, () => {
      this.send("ui-change", { value, originalEvent: event })
      return true
    })
    this.selectRevision++
  }

  /** Values of slotted items marked `selected`, the uncontrolled starting value. */
  private selectedItemValues(): string | string[] | undefined {
    const values = untrack(() => this.items.entries)
      .filter(UISelect.isOption)
      .filter((option) => option.selected)
      .map((option) => option.value)
    if (!values.length) return undefined
    return untrack(() => this.multiple) ? values : values[0]
  }

  get formValue(): E.FieldValue {
    const values = this.chosenValues
    return this.multiple ? values : (values[0] ?? null)
  }

  protected get formName(): string | undefined {
    return this.name
  }

  /** Back to the starting value;  the `<select>` shows it again. */
  onFormReset() {
    this.value = this.initialValue
    this.selectRevision++
  }

  ////////////////
  // ## Disabled
  ////////////////

  /** Can't be used now:  `disabled`, or a disabled fieldset / form. */
  @E.cssState("disabled")
  get isDisabled(): boolean {
    return this.disabled || this.formIsDisabled
  }

  /** The `disabled` class:  also by a disabled fieldset. */
  protected classValue(name: E.AttributeName<Vocabulary>): unknown {
    if (name === "disabled") return this.isDisabled
    return super.classValue(name)
  }

  ////////////////
  // ## Look
  ////////////////

  /** Block-level:  `fluid`. */
  @E.cssState("fluid")
  get isFluid(): boolean {
    return this.fluid
  }

  /** Draws the customizable select?  Single only, and only once the runtime (`UI.browser`) is there. */
  @E.cssState("customizable")
  private get isCustomizable(): boolean {
    return this.isReady && !this.multiple && UI.browser.supports.baseSelect
  }

  ////////////////
  // ## Label
  ////////////////

  /** The DOM element's `<label>`s and `aria-label`, as the select's name. */
  readonly labels = new F.ControlLabels(this.domFormElement)

  /** Name for the select:  its `<label>`s / `aria-label`, else `placeholder`, else `name`. */
  private get label(): string | undefined {
    return this.labels.accessibleName ?? this.placeholder ?? this.name
  }

  /** Connected:  read the DOM element's `<label>`s again. */
  @E.onChange("isConnected")
  protected onConnectedChanged(isConnected: boolean) {
    if (isConnected) this.labels.refresh()
  }

  ////////////////
  // ## Validity
  ////////////////

  protected get validationRules(): E.ValidationRule[] {
    return this.required ? [UIT.REQUIRED_RULE] : []
  }

  protected get validationLabel(): string | undefined {
    return this.label
  }

  protected get validationAnchor(): HTMLElement | undefined {
    return this.select
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** The native select. */
  private select?: HTMLSelectElement

  render(): JSX.Element {
    return (
      <select
        ref={(element) => (this.select = element)}
        class={this.rootClass}
        part={this.partForName("select")}
        multiple={this.multiple}
        disabled={this.isDisabled}
        required={this.required}
        aria-label={this.label}
        aria-invalid={this.validation.valid ? undefined : "true"}
        {...this.staticSelect}
        onChange={this.onChange}
      >
        <Show when={this.isCustomizable}>
          <button type="button" part={this.partForName("button")}>
            <selectedcontent />
          </button>
        </Show>
        <Show when={this.placeholderIsShowing}>
          <option
            class={PLACEHOLDER}
            part={this.partForName("placeholder")}
            value=""
            disabled={this.required && this.placeholder !== undefined}
            {...this.staticOption("")}
          >
            {this.placeholder ?? ""}
          </option>
        </Show>
        <For each={this.blocks}>{(block) => this.block(block)}</For>
      </select>
    )
  }

  /** One option, group or divider. */
  private block(block: SelectBlock): JSX.Element {
    if ("options" in block) {
      return (
        <optgroup label={block.header.text} part={this.partForName("group")}>
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
        part={this.partForName("option")}
        value={option.value}
        disabled={!!option.disabled}
        {...this.staticOption(option.value)}
      >
        <Show when={typeof option.icon === "string"}>
          <span class={UIT.ICON} aria-hidden="true">
            {glyph.svg}
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
   * The select's extra attributes in a server render (`$/ui/static`):  its `name`, so it submits without script.
   * - `{}` in a browser, where the DOM element submits (`ElementInternals`).
   */
  private get staticSelect(): Record<string, unknown> {
    return isServer ? { name: this.name } : {}
  }

  /**
   * Server render only:  `selected` on the option of `value` while it's chosen (`""`:  the placeholder,
   * while nothing is);  `{}` in a browser, where `syncSelect()` sets it.
   * - The placeholder is also `disabled` while chosen:  a disabled option isn't submitted, so a static form sends
   *   no `name=` for it, as the component sends nothing without a value.  NOTE: a no-JS reader can't go back to it.
   */
  private staticOption(value: string): Record<string, unknown> {
    if (!isServer) return {}
    const values = this.chosenValues
    if (value !== "") return { selected: values.includes(value) }
    const isRequired = this.required && this.placeholder !== undefined
    return { selected: !values.length, disabled: isRequired || !values.length }
  }

  ////////////////
  // ## Statics
  ////////////////

  /**
   * Is `entry` an option (not a header or divider)?
   * - Static:  pure, a `filter()` predicate.
   */
  private static isOption(entry: E.MenuEntry): entry is E.MenuOption {
    return !("type" in entry)
  }
}

/**
 * The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`).
 * - Minus `value`:  the `@controlled` accessor of that name wins, and its property may be a `string[]`.
 */
export interface UISelect extends Omit<E.AttributeValues<Vocabulary>, "value"> {}

////////////////
// ## Constants
////////////////

/** Class words of an option's `image`. */
const AVATAR_IMAGE = "ui avatar image"

/** Class word of an option's `flag`. */
const FLAG = "flag"
