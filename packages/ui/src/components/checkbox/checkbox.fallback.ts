import { NativeFallback, proto } from "$/core"

import { checkboxVocabulary, radioVocabulary } from "./checkbox.vocabulary.en"

/****************
 * ### `CheckboxFallback`
 * The element's markup, plain DOM:  `<div part="checkbox" class="ui … checkbox">` holding a native
 * `<input part="control">` (`type="radio"` for a `<ui-radio>` host, which also gets the `radio` class) and its
 * `<label for part="label">` around the slot.
 * - Still a form control:  `change` pushes `value` (default `on`) into the host's form value while chosen, the
 *   input's validity into the host's, sets `host.selected`, and dispatches a composed `ui-change`.
 * - Starting state:  the host's `selected` PROPERTY, else its `selected` / `checked` attributes.
 * - Accessible name:  the slotted text, else the host's `aria-label`.
 ****************/
export class CheckboxFallback extends NativeFallback<typeof checkboxVocabulary> {
  @proto static vocabulary = checkboxVocabulary
  @proto static degraded = [
    "radio grouping across elements (each fallback radio is alone in its shadow root) and arrow keys",
    "`ui-change` cannot be vetoed by re-setting `selected`",
    "`:state(invalid)`, form reset of the chosen state",
    "labels from `<label for>` (only `aria-label` names a fitted box)"
  ]

  /** Built input, for `attached()`. */
  private input: HTMLInputElement | undefined

  protected override build() {
    const host = this.host as CheckHost
    const radio = host.localName === radioVocabulary.tag
    const id = `${host.localName}-fallback-${++counter}`
    const input = this.create("input", {
      id,
      type: radio ? "radio" : "checkbox",
      disabled: this.flag("disabled"),
      required: this.flag("required"),
      role: !radio && this.attr("type") ? "switch" : null
    })
    this.decorate(input, "control")
    input.checked = host.selected ?? (this.flag("selected") || host.hasAttribute("checked"))
    input.indeterminate = !radio && this.flag("indeterminate")
    const label = this.create("label", { for: id, part: "label" }, this.slot(this.attr("label")))
    const type = radio && !this.attr("type") ? "radio" : undefined
    const root = this.create("div", { class: this.classes(), part: "checkbox" }, input, label)
    if (type) root.className = root.className.replace(/ checkbox$/, ` ${type} checkbox`)
    this.listen(input, "click", (event) => {
      if (this.flag("readonly")) event.preventDefault()
    })
    this.listen(input, "change", (event) => {
      host.selected = input.checked
      this.sync()
      const value = this.attr("value") ?? "on"
      const detail = { selected: input.checked, value, originalEvent: event }
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
    formInternals.setFormValue(name && input.checked ? (this.attr("value") ?? "on") : null)
    if (input.validity.valid) formInternals.setValidity({})
    else formInternals.setValidity(input.validity, input.validationMessage, input)
  }
}

/** Ids of fallback inputs. */
let counter = 0

/** The part of a checkbox / radio host the fallback touches;  optional, the element may not have upgraded. */
type CheckHost = HTMLElement & { selected?: boolean }
