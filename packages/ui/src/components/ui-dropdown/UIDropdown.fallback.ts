import { E, UIT } from "$/ui/core"
import { itemVocabulary } from "$/ui/components/ui-item/UIItem.vocabulary.en"
import { dropdownVocabulary } from "./UIDropdown.vocabulary.en"

/****************
 * ### `DropdownFallback`
 * The native fallback of `<ui-dropdown>`:  what it shows when its component breaks,
 * so the chosen value(s) are still submitted and validated with the form.
 *
 * - Its shadow DOM:  a native `<select part="trigger select" class="ui … dropdown">`, `multiple` when `multiple`.
 * - The options come from the DOM element's `options` PROPERTY, then its light-DOM `<ui-item>`s
 *   (`header` => `<optgroup>`, `divider` skipped).
 * - The chosen values come from the `value` property, else the attribute (a comma / space list).
 * - A single select starts with an empty `<option>` (the `placeholder` text) when nothing is chosen,
 *   so the browser doesn't silently choose the first option.
 * - On `change`:  the form value follows (`FormData` for `multiple`), `domElement.value` is set,
 *   and a composed `ui-change` is sent.
 *   The form value is also set on the first render, so the form submits without a change.
 * - Its accessible name is the DOM element's `aria-label`, else `placeholder`.
 ****************/
export class DropdownFallback extends E.NativeFallback<typeof dropdownVocabulary> {
  @E.proto static vocabulary = dropdownVocabulary
  @E.proto static degraded = [
    "`search` (typing only jumps to a matching option)",
    "`allow-additions`, `clearable`, `max-selections`",
    "multiple-value labels (a native multi-select list)",
    "option `icon` / `image` / `flag` / `description`",
    "keyboard pattern:  the native `<select>`'s, not the combobox listbox",
    "invoker commands, `ui-open` / `ui-close` / `ui-search` / `ui-add` / `ui-remove`",
    "`readonly` is a disabled select (the value still submits)"
  ]

  /** The native select, once built, for `attached()`. */
  private select: HTMLSelectElement | undefined

  protected override build() {
    const domElement = this.domElement as DropdownDOMElement
    const isMultiple = this.flag("multiple")
    const placeholder = this.attr("placeholder")
    const select = this.create("select", {
      class: this.classes(),
      name: this.attr("name"),
      multiple: isMultiple,
      required: this.flag("required"),
      disabled: this.flag("disabled") || this.flag("readonly"),
      "aria-readonly": this.flag("readonly") ? UIT.TRUE : undefined
    })
    this.decorate(select, "trigger", SELECT_PART)
    if (!select.hasAttribute(UIT.ARIA_LABEL) && placeholder) select.setAttribute(UIT.ARIA_LABEL, placeholder)

    const chosen = this.chosen(domElement, isMultiple)
    const choices = this.choices(domElement)
    const picked = choices.filter((choice) => choice.type === UIT.ITEM && (choice.selected || chosen.has(choice.value)))
    if (!isMultiple && !picked.length) {
      select.append(this.create("option", { value: "", selected: true }, placeholder ?? ""))
    }

    let group: HTMLElement = select
    for (const choice of choices) {
      if (choice.type === UIT.HEADER) select.append((group = this.create("optgroup", { label: choice.text })))
      else if (choice.type === UIT.ITEM) {
        const option = this.create("option", { value: choice.value, disabled: choice.disabled }, choice.text)
        option.selected = picked.includes(choice) && (isMultiple || choice === picked[0])
        group.append(option)
      }
    }

    this.listen(select, "change", (event) => {
      const value = this.sync(select, isMultiple)
      domElement.value = value
      domElement.dispatchEvent(
        new CustomEvent(CHANGE_EVENT, { bubbles: true, composed: true, detail: { value, originalEvent: event } })
      )
    })
    this.select = select
    return [select]
  }

  /** The first form value and validity, which need the select attached. */
  protected override attached() {
    this.sync(this.select!, this.select!.multiple)
  }

  /** The values the DOM element says are chosen. */
  private chosen(domElement: DropdownDOMElement, isMultiple: boolean): Set<string> {
    const value = domElement.value ?? this.attr("value")
    if (!value) return new Set()
    if (Array.isArray(value)) return new Set(value.map(String))
    return new Set(isMultiple ? E.Converters.list(String(value)) : [String(value)])
  }

  /** The `<ui-item>` children, then the `options` property, as one flat list. */
  private choices(domElement: DropdownDOMElement): Choice[] {
    const choices: Choice[] = []
    for (const item of domElement.querySelectorAll(`:scope > ${itemVocabulary.tag}`)) {
      const text = DropdownFallback.itemAttribute(item, "text") ?? item.textContent?.trim() ?? ""
      const type = DropdownFallback.itemAttribute(item, "type")
      choices.push({
        type: type === UIT.HEADER || type === DIVIDER ? type : UIT.ITEM,
        text,
        value: DropdownFallback.itemAttribute(item, "value") ?? text,
        disabled: E.Converters.boolean(DropdownFallback.itemAttribute(item, "disabled"), "disabled"),
        selected: E.Converters.boolean(DropdownFallback.itemAttribute(item, "selected"), "selected")
      })
    }
    for (const option of domElement.options ?? []) {
      choices.push({
        type: UIT.ITEM,
        text: option.text,
        value: option.value,
        disabled: !!option.disabled,
        selected: !!option.selected
      })
    }
    return choices
  }

  /** Copy the select's value (and validity) onto the DOM element;  return the value. */
  private sync(select: HTMLSelectElement, isMultiple: boolean): UIT.DropdownValue {
    const values = isMultiple
      ? [...select.selectedOptions].map((option) => option.value)
      : select.value
        ? [select.value]
        : []
    const name = this.attr("name")
    const internals = this.formInternals
    if (internals) {
      if (isMultiple) {
        const data = new FormData()
        for (const value of values) data.append(name ?? "", value)
        internals.setFormValue(name ? data : null)
      } else internals.setFormValue(name ? (values[0] ?? "") : null)
      const isMissing = select.validity.valueMissing
      internals.setValidity(isMissing ? { valueMissing: true } : {}, select.validationMessage, select)
    }
    return isMultiple ? values : (values[0] ?? "")
  }

  /**
   * The `<ui-item>` attribute `name` of `item`, or `undefined`:  its `getAttribute()`, typed by the item's vocabulary.
   * - Static:  pure, it needs no instance.
   */
  private static itemAttribute(item: Element, name: E.AttributeNameOf<typeof itemVocabulary>): string | undefined {
    return item.getAttribute(name) ?? undefined
  }
}

/** One option, header or divider, from either source. */
type Choice = {
  /** an option, a group header or a divider */
  type: UIT.ItemType
  /** the text shown */
  text: string
  /** the value submitted */
  value: string
  /** can't be chosen */
  disabled: boolean
  /** chosen by its own `selected` */
  selected: boolean
}

/** What the fallback reads and writes of the DOM element:  all optional, the element may not have upgraded. */
type DropdownDOMElement = HTMLElement & {
  /** the chosen value(s), once set as a property */
  value?: UIT.DropdownValue
  /** the `options` property, once set */
  options?: readonly E.MenuOption[]
}

/** The select's second part name, beside the vocabulary's `trigger`:  `::part(select)` styles the native one. */
const SELECT_PART = "select"

/** The `<ui-item type>` of a divider, which the select skips. */
const DIVIDER = "divider"

/** The event the select's `change` becomes. */
const CHANGE_EVENT: E.EventName<typeof dropdownVocabulary> = "ui-change"
