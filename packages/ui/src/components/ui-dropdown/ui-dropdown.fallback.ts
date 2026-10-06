import { E, UIT } from "$/ui/core"
import { itemVocabulary } from "$/ui/components/ui-item/ui-item.vocabulary.en"
import { dropdownVocabulary } from "./ui-dropdown.vocabulary.en"
import type { Choice, DropdownHost, Vocabulary } from "./ui-dropdown.types"

/****************
 * ### `DropdownFallback`
 * A native `<select part="trigger select" class="ui ... dropdown">`, `multiple` when `multiple`.
 * - Options come from the host's `options` PROPERTY, then its light-DOM `<ui-item>`s (`header` => `<optgroup>`,
 *   `divider` skipped).  Chosen values come from the `value` property, else the attribute (comma / space list).
 * - A single select starts with an empty `<option>` (the `placeholder` text) when nothing is chosen, so the
 *   browser doesn't silently choose the first option.
 * - On `change`:  the form value follows (`FormData` for `multiple`), `host.value` is set, and a composed
 *   `ui-change` fires.  The form value is also set on first render, so the form submits without a change.
 * - Accessible name:  the host's `aria-label`, else `placeholder`.
 ****************/
export class DropdownFallback extends E.NativeFallback<Vocabulary> {
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

  /** Built select, for `attached()`. */
  private select: HTMLSelectElement | undefined

  protected override build() {
    const host = this.host as DropdownHost
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

    const chosen = this.chosen(host, isMultiple)
    const choices = this.choices(host)
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
      host.value = value
      host.dispatchEvent(
        new CustomEvent(CHANGE_EVENT, { bubbles: true, composed: true, detail: { value, originalEvent: event } })
      )
    })
    this.select = select
    return [select]
  }

  /** First form value + validity, which need the select attached. */
  protected override attached() {
    this.sync(this.select!, this.select!.multiple)
  }

  /** Values the host says are chosen. */
  private chosen(host: DropdownHost, isMultiple: boolean): Set<string> {
    const value = host.value ?? this.attr("value")
    if (!value) return new Set()
    if (Array.isArray(value)) return new Set(value.map(String))
    return new Set(isMultiple ? E.Converters.list(String(value)) : [String(value)])
  }

  /** `<ui-item>` children, then the `options` property, as one flat list. */
  private choices(host: DropdownHost): Choice[] {
    const choices: Choice[] = []
    for (const item of host.querySelectorAll(`:scope > ${itemVocabulary.tag}`)) {
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
    for (const option of host.options ?? []) {
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

  /** Push the select's value into the form (and validity);  return it. */
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
   * `<ui-item>` attribute `name` of `item`, or `null`:  its `getAttribute()`, typed by the item's vocabulary.
   * - STATIC:  pure, needs no instance.
   */
  private static itemAttribute(item: Element, name: E.AttributeNameOf<typeof itemVocabulary>): string | null {
    return item.getAttribute(name)
  }
}

/** Second part name of the select, beside the vocabulary's `trigger`:  `::part(select)` styles the native one. */
const SELECT_PART = "select"

/** `<ui-item type>` of a divider, which the select skips. */
const DIVIDER = "divider"

/** Event the select's `change` becomes. */
const CHANGE_EVENT: E.EventName<Vocabulary> = "ui-change"
