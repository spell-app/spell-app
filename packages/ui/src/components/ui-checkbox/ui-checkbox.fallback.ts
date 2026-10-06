import { E, UIT } from "$/ui/core"
import { checkboxVocabulary } from "./ui-checkbox.vocabulary.en"
import { radioVocabulary } from "./ui-radio.vocabulary.en"
import { CHECKBOX, CHECKED, RADIO, SWITCH, type CheckPartName, type NativeCheckHost } from "./ui-checkbox.types"

/****************
 * ### `CheckboxFallback`
 * The element's markup, plain DOM:  `<div part="checkbox" class="ui … checkbox">` holding a native
 * `<input part="control">` and its `<label for part="label">` around the slot.
 * - A `<ui-radio>` host gets `type="radio"`, and the `radio` class.
 * - Still a form control:  `change` pushes `value` (default `on`) into the host's form value while chosen, the
 *   input's validity into the host's, sets `host.selected`, and dispatches a composed `ui-change`.
 * - Starting state:  the host's `selected` PROPERTY, else its `selected` / `checked` attributes.
 * - Accessible name:  the slotted text, else the host's `aria-label`.
 ****************/
export class CheckboxFallback extends E.NativeFallback<typeof checkboxVocabulary> {
  @E.proto static vocabulary = checkboxVocabulary
  @E.proto static degraded = [
    "radio grouping across elements (each fallback radio is alone in its shadow root) and arrow keys",
    "`ui-change` cannot be vetoed by re-setting `selected`",
    "`:state(invalid)`, form reset of the chosen state",
    "labels from `<label for>` (only `aria-label` names a fitted box)"
  ]

  /** Built input, for `attached()`. */
  private input: HTMLInputElement | undefined

  protected override build() {
    const host = this.host as NativeCheckHost
    const isRadio = host.localName === radioVocabulary.tag
    const id = `${host.localName}-fallback-${++CheckboxFallback.counter}`
    const input = this.create("input", {
      id,
      type: isRadio ? RADIO : CHECKBOX,
      disabled: this.flag("disabled"),
      required: this.flag("required"),
      role: !isRadio && this.attr("type") ? SWITCH : undefined
    })
    this.decorate(input, "control")
    input.checked = host.selected ?? (this.flag("selected") || host.hasAttribute(CHECKED))
    input.indeterminate = !isRadio && this.flag("indeterminate")
    const label = this.create("label", { for: id, part: LABEL_PART }, this.slot(this.attr("label")))
    const root = this.create("div", { class: this.classes(), part: ROOT_PART }, input, label)
    // a radio without a `slider` / `toggle` look says `radio` before its noun, as the element does
    if (isRadio && !this.attr("type")) root.className = root.className.replace(NOUN_AT_END, ` ${RADIO} ${CHECKBOX}`)
    this.listen(input, "click", (event) => {
      if (this.flag("readonly")) event.preventDefault()
    })
    this.listen(input, "change", (event) => {
      host.selected = input.checked
      this.sync()
      const detail = { selected: input.checked, value: this.value(), originalEvent: event }
      host.dispatchEvent(new CustomEvent(this.vocabulary.events[0].name, { bubbles: true, composed: true, detail }))
    })
    this.input = input
    return [root]
  }

  /** First form value + validity, which need the input attached. */
  protected override attached() {
    this.sync()
  }

  /** Push the input's state and validity into the host's. */
  private sync() {
    const { input, formInternals } = this
    if (!input || !formInternals) return
    const name = this.attr("name")
    // `null`:  `setFormValue()`'s "submit nothing"
    formInternals.setFormValue(name && input.checked ? this.value() : null)
    if (input.validity.valid) formInternals.setValidity({})
    else formInternals.setValidity(input.validity, input.validationMessage, input)
  }

  /** What the box submits while chosen:  its `value`, else the native default. */
  private value(): string {
    return this.attr("value") ?? UIT.CHECKBOX_DEFAULT_VALUE
  }

  /**
   * Counter behind the ids of fallback inputs.
   * - STATIC:  page-wide, so two fallbacks never share an id.
   */
  private static counter = 0
}

/** Part of the root box. */
const ROOT_PART: CheckPartName = "checkbox"

/** Part of the `<label>`. */
const LABEL_PART: CheckPartName = "label"

/** The noun ending the class string, which a plain radio's `radio` goes before. */
const NOUN_AT_END = / checkbox$/
