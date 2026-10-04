import { Converters, NativeFallback, proto, UIT } from "$/ui/core"
import { itemVocabulary } from "$/ui/components/ui-item/ui-item.vocabulary.en"

import { selectVocabulary } from "./ui-select.vocabulary.en"
import { PARTS, SelectFlags } from "./ui-select.types"
import type { SelectHost, Choice } from "./ui-select.types"

/****************
 * ### `SelectFallback`
 * The plain native `<select part="select" class="ui ... select">` -- what `<ui-select>` already is in a browser
 * without the customizable select, minus the reactive model.
 * - Options come from the host's light-DOM `<ui-item>`s (`header` => `<optgroup>`, `divider` => `<hr>`), then its
 *   `options` PROPERTY.  Chosen values come from the `value` property, else the attribute (comma / space list),
 *   else the `selected` items.
 * - A single select starts with an empty `<option>` (the `placeholder` text) when nothing is chosen, as the
 *   element does.
 * - On `change`:  the form value follows (`FormData` for `multiple`), `host.value` is set, and a composed
 *   `ui-change` fires.  The form value is also set on first render, so the form submits without a change.
 * - Accessible name:  the host's `aria-label`, else `placeholder`.
 ****************/
export class SelectFallback extends NativeFallback<typeof selectVocabulary> {
  @proto static vocabulary = selectVocabulary
  @proto static degraded = [
    "the customizable picker:  option icons and images (flags and descriptions stay, as text)",
    "a host `<label for>` naming the select (use `aria-label`)",
    "`:state(invalid)`, `:state(customizable)`",
    "vetoing a change by re-setting `value` in a `ui-change` handler"
  ]

  /** Built select, for `attached()`. */
  private select: HTMLSelectElement | undefined

  protected override build() {
    const host = this.host as SelectHost
    const multiple = this.flag("multiple")
    const required = this.flag("required")
    const placeholder = this.attr("placeholder")
    const select = this.create("select", {
      class: this.classes(),
      multiple,
      required,
      disabled: this.flag("disabled")
    })
    this.decorate(select, "select")
    if (!select.hasAttribute("aria-label") && placeholder) select.setAttribute("aria-label", placeholder)

    const choices = this.choices(host)
    const chosen = this.chosen(host, multiple, choices)
    if (!multiple && (placeholder !== null || !chosen.size)) {
      const empty = this.create("option", {
        value: "",
        class: "placeholder",
        disabled: required && placeholder !== null
      })
      empty.textContent = placeholder ?? ""
      empty.setAttribute("part", PARTS.placeholder)
      empty.selected = !chosen.size
      select.append(empty)
    }

    let group: HTMLElement = select
    for (const choice of choices) {
      if (choice.type === "header") {
        select.append((group = this.create("optgroup", { label: choice.text, part: PARTS.group })))
      } else if (choice.type === "divider") {
        select.append(this.create("hr", { class: "divider" }))
        group = select
      } else {
        const option = this.create("option", { value: choice.value, disabled: choice.disabled, class: "item" })
        option.textContent = choice.text
        option.setAttribute("part", PARTS.option)
        option.selected = chosen.has(choice.value)
        group.append(option)
      }
    }

    this.listen(select, "change", (event) => {
      const value = this.sync(select, multiple)
      host.value = value
      host.dispatchEvent(
        new CustomEvent(selectVocabulary.events[0].name, {
          bubbles: true,
          composed: true,
          detail: { value, originalEvent: event }
        })
      )
    })
    this.select = select
    return [select]
  }

  /** First form value + validity, which need the select attached. */
  protected override attached() {
    this.sync(this.select!, this.select!.multiple)
  }

  /** Values the host says are chosen:  `value` property, else attribute, else `selected` items. */
  private chosen(host: SelectHost, multiple: boolean, choices: readonly Choice[]): Set<string> {
    const value = host.value ?? this.attr("value")
    if (Array.isArray(value)) return new Set(value.map(String))
    if (value != null && value !== "") return new Set(multiple ? Converters.list(String(value)) : [String(value)])
    const picked = choices.filter((choice) => choice.type === "item" && choice.selected).map((choice) => choice.value)
    return new Set(multiple ? picked : picked.slice(0, 1))
  }

  /** `<ui-item>` children, then the `options` property, as one flat list. */
  private choices(host: SelectHost): Choice[] {
    const choices: Choice[] = []
    for (const item of host.querySelectorAll(`:scope > ${itemVocabulary.tag}`)) {
      const text = item.getAttribute("text") ?? item.textContent?.trim() ?? ""
      const type = item.getAttribute("type")
      const description = item.getAttribute("description")
      const flag = item.getAttribute("flag")
      choices.push({
        type: type === "header" || type === "divider" ? type : "item",
        text: [flag ? SelectFlags.emoji(flag) : "", text, description ? ` ${description}` : ""].join(""),
        value: item.getAttribute("value") ?? text,
        disabled: Converters.boolean(item.getAttribute("disabled"), "disabled"),
        selected: Converters.boolean(item.getAttribute("selected"), "selected")
      })
    }
    for (const option of host.options ?? []) {
      choices.push({
        type: "item",
        text: option.description ? `${option.text} ${option.description}` : option.text,
        value: option.value,
        disabled: !!option.disabled,
        selected: !!option.selected
      })
    }
    return choices
  }

  /** Push the select's value into the form (and validity);  return it. */
  private sync(select: HTMLSelectElement, multiple: boolean): UIT.SelectValue {
    const values = [...select.selectedOptions].map((option) => option.value).filter((value) => value !== "")
    const name = this.attr("name")
    const internals = this.formInternals
    if (internals) {
      if (multiple) {
        const data = new FormData()
        for (const value of values) data.append(name ?? "", value)
        internals.setFormValue(name && values.length ? data : null)
      } else internals.setFormValue(name && values.length ? values[0]! : null)
      const missing = this.flag("required") && !values.length
      internals.setValidity(missing ? { valueMissing: true } : {}, select.validationMessage, select)
    }
    return multiple ? values : (values[0] ?? "")
  }
}
