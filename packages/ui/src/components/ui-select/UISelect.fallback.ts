import { E, UIT } from "$/ui/core"
import { itemVocabulary } from "$/ui/components/ui-item/UIItem.vocabulary.en"
import { selectVocabulary } from "./UISelect.vocabulary.en"
import { DIVIDER, PLACEHOLDER, type Vocabulary } from "./UISelect.types"

/****************
 * ### `SelectFallback`
 * The native fallback of `<ui-select>`:  what it shows when its component breaks,
 * so the chosen value(s) are still submitted and validated with the form.
 *
 * - Its shadow DOM:  the plain native `<select part="select" class="ui … select">`.
 *   It's what `<ui-select>` already is in a browser without the customizable select, minus the reactive model.
 * - The options come from the DOM element's light-DOM `<ui-item>`s (`header` => `<optgroup>`, `divider` => `<hr>`),
 *   then its `options` PROPERTY.
 * - The chosen values come from the `value` property, else the attribute (a comma / space list),
 *   else the `selected` items.
 * - A single select starts with an empty `<option>` (the `placeholder` text) when nothing is chosen,
 *   as the component does.
 * - On `change`:  the form value follows (`FormData` for `multiple`), `domElement.value` is set,
 *   and a composed `ui-change` is sent.
 *   The form value is also set on the first render, so the form submits without a change.
 * - Its accessible name is the DOM element's `aria-label`, else `placeholder`.
 ****************/
export class SelectFallback extends E.NativeFallback<Vocabulary> {
  @E.proto static vocabulary = selectVocabulary
  @E.proto static degraded = [
    "the customizable picker:  option icons and images (flags and descriptions stay, as text)",
    "a `<label for>` naming the element (use `aria-label`)",
    "`:state(invalid)`, `:state(customizable)`",
    "vetoing a change by re-setting `value` in a `ui-change` handler"
  ]

  /** The native select, once built, for `attached()`. */
  private select: HTMLSelectElement | undefined

  protected override build() {
    const domElement = this.domElement as SelectDOMElement
    const isMultiple = this.flag("multiple")
    const isRequired = this.flag("required")
    const placeholder = this.attr("placeholder")
    const select = this.create("select", {
      class: this.classes(),
      multiple: isMultiple,
      required: isRequired,
      disabled: this.flag("disabled")
    })
    this.decorate(select, "select")
    if (!select.hasAttribute(UIT.ARIA_LABEL) && placeholder) select.setAttribute(UIT.ARIA_LABEL, placeholder)

    const choices = this.choices(domElement)
    const chosen = this.chosen(domElement, choices)
    if (!isMultiple && (placeholder !== undefined || !chosen.size)) {
      const empty = this.create(
        "option",
        {
          value: "",
          class: PLACEHOLDER,
          part: PLACEHOLDER_PART,
          disabled: isRequired && placeholder !== undefined
        },
        placeholder ?? ""
      )
      empty.selected = !chosen.size
      select.append(empty)
    }

    let group: HTMLElement = select
    for (const choice of choices) {
      if (choice.type === UIT.HEADER) {
        select.append((group = this.create("optgroup", { label: choice.text, part: GROUP_PART })))
      } else if (choice.type === DIVIDER) {
        select.append(this.create("hr", { class: DIVIDER }))
        group = select
      } else {
        const option = this.create(
          "option",
          { value: choice.value, disabled: choice.disabled, class: UIT.ITEM, part: OPTION_PART },
          choice.text
        )
        option.selected = chosen.has(choice.value)
        group.append(option)
      }
    }

    this.listen(select, "change", (event) => {
      const value = this.sync(select)
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
    this.sync(this.select!)
  }

  /** The values the DOM element says are chosen:  the `value` property, else the attribute, else `selected` items. */
  private chosen(domElement: SelectDOMElement, choices: readonly Choice[]): Set<string> {
    const isMultiple = this.flag("multiple")
    const value = domElement.value ?? this.attr("value")
    if (Array.isArray(value)) return new Set(value.map(String))
    if (value != null && value !== "") return new Set(isMultiple ? E.Converters.list(String(value)) : [String(value)])
    const picked = choices.filter((choice) => choice.type === UIT.ITEM && choice.selected).map((choice) => choice.value)
    return new Set(isMultiple ? picked : picked.slice(0, 1))
  }

  /** The `<ui-item>` children, then the `options` property, as one flat list. */
  private choices(domElement: SelectDOMElement): Choice[] {
    const choices: Choice[] = []
    for (const item of domElement.querySelectorAll(`:scope > ${itemVocabulary.tag}`)) {
      const text = SelectFallback.itemAttribute(item, "text") ?? item.textContent?.trim() ?? ""
      const type = SelectFallback.itemAttribute(item, "type")
      const description = SelectFallback.itemAttribute(item, "description")
      const flag = SelectFallback.itemAttribute(item, "flag")
      choices.push({
        type: type === UIT.HEADER || type === DIVIDER ? type : UIT.ITEM,
        text: [flag ? UIT.Flags.emojiFor(flag) || flag : "", text, description ? ` ${description}` : ""].join(""),
        value: SelectFallback.itemAttribute(item, "value") ?? text,
        disabled: E.Converters.boolean(SelectFallback.itemAttribute(item, "disabled"), "disabled"),
        selected: E.Converters.boolean(SelectFallback.itemAttribute(item, "selected"), "selected")
      })
    }
    for (const option of domElement.options ?? []) {
      choices.push({
        type: UIT.ITEM,
        text: option.description ? `${option.text} ${option.description}` : option.text,
        value: option.value,
        disabled: !!option.disabled,
        selected: !!option.selected
      })
    }
    return choices
  }

  /**
   * Copy the select's value (and validity) onto the DOM element;  return the value.
   * - `multiple` is the select's own.
   */
  private sync(select: HTMLSelectElement): UIT.SelectValue {
    const values = [...select.selectedOptions].map((option) => option.value).filter((value) => value !== "")
    const name = this.attr("name")
    const internals = this.formInternals
    if (internals) {
      if (select.multiple) {
        const data = new FormData()
        for (const value of values) data.append(name ?? "", value)
        internals.setFormValue(name && values.length ? data : null)
      } else internals.setFormValue(name && values.length ? values[0]! : null)
      const isMissing = this.flag("required") && !values.length
      internals.setValidity(isMissing ? { valueMissing: true } : {}, select.validationMessage, select)
    }
    return select.multiple ? values : (values[0] ?? "")
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
  /** the text shown:  the flag emoji, the text and the description, as a plain select shows them */
  text: string
  /** the value submitted */
  value: string
  /** can't be chosen */
  disabled: boolean
  /** chosen by its own `selected` */
  selected: boolean
}

/** What the fallback reads and writes of the DOM element:  all optional, the element may not have upgraded. */
type SelectDOMElement = HTMLElement & {
  /** the chosen value(s), once set as a property */
  value?: UIT.SelectValue
  /** the `options` property, once set */
  options?: readonly E.MenuOption[]
}

/** The event the select's `change` becomes. */
const CHANGE_EVENT: E.EventName<Vocabulary> = "ui-change"

/** The part of the empty first option. */
const PLACEHOLDER_PART: E.PartName<Vocabulary> = "placeholder"

/** The part of each `<optgroup>`. */
const GROUP_PART: E.PartName<Vocabulary> = "group"

/** The part of each `<option>`. */
const OPTION_PART: E.PartName<Vocabulary> = "option"
