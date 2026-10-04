import { Converters, NativeFallback, proto, UIT } from "$/ui/core"
import { itemVocabulary } from "$/ui/components/ui-item/ui-item.vocabulary.en"

import { dropdownVocabulary } from "./ui-dropdown.vocabulary.en"
import type { Choice, DropdownHost } from "./ui-dropdown.types"

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
export class DropdownFallback extends NativeFallback<typeof dropdownVocabulary> {
  @proto static vocabulary = dropdownVocabulary
  @proto static degraded = [
    "`search` (typing only jumps to a matching option)",
    "`allow-additions`, `clearable`, `max-selections`",
    "multiple-value labels (a native multi-select list)",
    "option `icon` / `image` / `flag` / `description`",
    "keyboard pattern:  the native `<select>`'s, not the combobox listbox",
    "invoker commands, `ui-open` / `ui-close` / `ui-search` / `ui-add` / `ui-remove`",
    "`readonly` is a disabled select (the value still submits)"
  ]

  protected override build() {
    const host = this.host as DropdownHost
    const multiple = this.flag("multiple")
    const placeholder = this.attr("placeholder")
    const select = this.create("select", {
      class: this.classes(),
      name: this.attr("name"),
      multiple,
      required: this.flag("required"),
      disabled: this.flag("disabled") || this.flag("readonly"),
      "aria-readonly": this.flag("readonly") ? "true" : null
    })
    this.decorate(select, "trigger", "select")
    if (!select.hasAttribute("aria-label") && placeholder) select.setAttribute("aria-label", placeholder)

    const chosen = this.chosen(host, multiple)
    const choices = this.choices(host)
    const picked = choices.filter((choice) => choice.type === "item" && (choice.selected || chosen.has(choice.value)))
    if (!multiple && !picked.length)
      select.append(this.create("option", { value: "", selected: true }, placeholder ?? ""))

    let group: HTMLElement = select
    for (const choice of choices) {
      if (choice.type === "header") select.append((group = this.create("optgroup", { label: choice.text })))
      else if (choice.type === "item") {
        const option = this.create("option", { value: choice.value, disabled: choice.disabled }, choice.text)
        option.selected = picked.includes(choice) && (multiple || choice === picked[0])
        group.append(option)
      }
    }

    this.listen(select, "change", (event) => {
      const value = this.sync(select, multiple)
      host.value = value
      host.dispatchEvent(
        new CustomEvent(dropdownVocabulary.events[0].name, {
          bubbles: true,
          composed: true,
          detail: { value, originalEvent: event }
        })
      )
    })
    this.select = select
    return [select]
  }

  /** Built select, for `attached()`. */
  private select: HTMLSelectElement | undefined

  /** First form value + validity, which need the select attached. */
  protected override attached() {
    this.sync(this.select!, this.select!.multiple)
  }

  /** Values the host says are chosen. */
  private chosen(host: DropdownHost, multiple: boolean): Set<string> {
    const value = host.value ?? this.attr("value")
    if (value == null || value === "") return new Set()
    if (Array.isArray(value)) return new Set(value.map(String))
    return new Set(multiple ? Converters.list(String(value)) : [String(value)])
  }

  /** `<ui-item>` children, then the `options` property, as one flat list. */
  private choices(host: DropdownHost): Choice[] {
    const choices: Choice[] = []
    for (const item of host.querySelectorAll(`:scope > ${itemVocabulary.tag}`)) {
      const text = item.getAttribute("text") ?? item.textContent?.trim() ?? ""
      const type = item.getAttribute("type")
      choices.push({
        type: type === "header" || type === "divider" ? type : "item",
        text,
        value: item.getAttribute("value") ?? text,
        disabled: Converters.boolean(item.getAttribute("disabled"), "disabled"),
        selected: Converters.boolean(item.getAttribute("selected"), "selected")
      })
    }
    for (const option of host.options ?? []) {
      choices.push({
        type: "item",
        text: option.text,
        value: option.value,
        disabled: !!option.disabled,
        selected: !!option.selected
      })
    }
    return choices
  }

  /** Push the select's value into the form (and validity);  return it. */
  private sync(select: HTMLSelectElement, multiple: boolean): UIT.DropdownValue {
    const values = multiple
      ? [...select.selectedOptions].map((option) => option.value)
      : select.value
        ? [select.value]
        : []
    const name = this.attr("name")
    const internals = this.formInternals
    if (internals) {
      if (multiple) {
        const data = new FormData()
        for (const value of values) data.append(name ?? "", value)
        internals.setFormValue(name ? data : null)
      } else internals.setFormValue(name ? (values[0] ?? "") : null)
      const missing = select.validity.valueMissing
      internals.setValidity(missing ? { valueMissing: true } : {}, select.validationMessage, select)
    }
    return multiple ? values : (values[0] ?? "")
  }
}
