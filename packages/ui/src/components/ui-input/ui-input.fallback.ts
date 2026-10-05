import { NativeFallback, proto } from "$/ui/core"

import { inputVocabulary } from "./ui-input.vocabulary.en"
import { textareaVocabulary } from "./ui-textarea.vocabulary.en"
import type { InputHost } from "./ui-input.types"

/****************
 * ### `InputFallback`
 * The element's box, plain DOM:  `<div part="input" class="ui … input">` around a native `<input part="control">`
 * (`<textarea>` for a `<ui-textarea>` host), with the `label` shorthand as a joined label.
 * - Still a form control:  every `input` event pushes the value into the host's form value and the native
 *   control's validity into the host's (`setValidity(..., control)`), and dispatches a composed `ui-input`;
 *   `change` dispatches `ui-change`.  `host.value` is set as the user types.
 * - Starting value:  the host's `value` PROPERTY, else its attribute.
 * - Accessible name:  the host's `aria-label`, else `placeholder`.
 ****************/
export class InputFallback extends NativeFallback<typeof inputVocabulary> {
  @proto static vocabulary = inputVocabulary
  @proto static degraded = [
    "`icon` glyph and the `icon` / `label` / `action` slots",
    "corner labels",
    "`rules` (only the native constraints validate)",
    "`:state(invalid)`, form reset of the value, implicit (Enter) submission",
    "labels from `<label for>` (only `aria-label` / `placeholder` name the control)"
  ]

  /** Built control, for `attached()`. */
  private control: HTMLInputElement | HTMLTextAreaElement | undefined

  protected override build() {
    const host = this.host as InputHost
    const textarea = host.localName === textareaVocabulary.tag
    const disabled = this.flag("disabled")
    const common = {
      name: this.attr("name"),
      placeholder: this.attr("placeholder"),
      required: this.flag("required"),
      disabled,
      readonly: this.flag("readonly"),
      minlength: this.attr("minlength"),
      maxlength: this.attr("maxlength"),
      autocomplete: this.attr("autocomplete")
    }
    const control = textarea
      ? this.create("textarea", { ...common, rows: this.host.getAttribute("rows") })
      : this.create("input", {
          ...common,
          type: this.attr("type") ?? "text",
          pattern: this.attr("pattern"),
          min: this.attr("min"),
          max: this.attr("max"),
          step: this.attr("step"),
          multiple: this.flag("multiple"),
          accept: this.attr("accept"),
          inputmode: this.attr("inputmode")
        })
    this.decorate(control, "control")
    const placeholder = this.attr("placeholder")
    if (!control.hasAttribute("aria-label") && placeholder) control.setAttribute("aria-label", placeholder)
    const value = host.value ?? this.attr("value")
    if (value && control.type !== "file") control.value = value

    const label = textarea ? null : this.attr("label")
    const labeled = this.attr("labeled")
    const extra = [label && labeled === null ? "labeled" : "", control.type === "file" ? "file" : ""]
    const root = this.create("div", { class: this.classes(extra.filter(Boolean).join(" ") || undefined) })
    const labelBox = label ? this.create("span", { class: "ui label", part: "label" }, label) : null
    if (labelBox && labeled !== "right") root.append(labelBox)
    root.append(control)
    if (labelBox && labeled === "right") root.append(labelBox)
    this.decorate(root, "input")

    this.listen(control, "input", (event) => {
      host.value = control.value
      this.sync()
      this.announce(0, event)
    })
    this.listen(control, "change", (event) => this.announce(1, event))
    this.control = control
    return [root]
  }

  /** First form value + validity, which need the control attached. */
  protected override attached() {
    this.sync()
  }

  /** Push the control's value and validity into the host's. */
  private sync() {
    const { control, formInternals } = this
    if (!control || !formInternals) return
    const name = this.attr("name")
    formInternals.setFormValue(name && control.type !== "file" ? control.value : null)
    if (control.validity.valid) formInternals.setValidity({})
    else formInternals.setValidity(control.validity, control.validationMessage, control)
  }

  /** Dispatch the vocabulary's event `index` (`ui-input`, `ui-change`). */
  private announce(index: number, originalEvent: Event) {
    const detail = { value: this.control!.value, originalEvent }
    const init = { bubbles: true, composed: true, detail }
    this.host.dispatchEvent(new CustomEvent(this.vocabulary.events[index]!.name, init))
  }
}
