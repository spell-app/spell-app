import { E } from "$/ui/core"
import { inputVocabulary } from "./ui-input.vocabulary.en"
import { textareaVocabulary } from "./ui-textarea.vocabulary.en"
import { FILE, LABEL_CLASSES, type InputHost, type Vocabulary } from "./ui-input.types"

/****************
 * ### `InputFallback`
 * The element's box, plain DOM:  `<div part="input" class="ui … input">` around a native `<input part="control">`
 * (`<textarea>` for a `<ui-textarea>` host), with the `label` shorthand as a joined label.
 * - Still a form control:  every `input` event pushes the value into the host's form value and the native
 *   control's validity into the host's (`setValidity(..., control)`), and dispatches a composed `ui-input`;
 *   `change` dispatches `ui-change`.  `host.value` is set as the person types.
 * - Starting value:  the host's `value` PROPERTY, else its attribute.
 * - Accessible name:  the host's `aria-label`, else `placeholder`.
 ****************/
export class InputFallback extends E.NativeFallback<Vocabulary> {
  @E.proto static vocabulary = inputVocabulary
  @E.proto static degraded = [
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
    const isTextarea = host.localName === textareaVocabulary.tag
    const common = {
      name: this.attr("name"),
      placeholder: this.attr("placeholder"),
      required: this.flag("required"),
      disabled: this.flag("disabled"),
      readonly: this.flag("readonly"),
      minlength: this.attr("minlength"),
      maxlength: this.attr("maxlength"),
      autocomplete: this.attr("autocomplete")
    }
    const control = isTextarea
      ? // `rows` is the textarea vocabulary's alone, so `attr()` (typed on the input's) can't name it
        this.create("textarea", { ...common, rows: this.host.getAttribute(ROWS) })
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
    if (value && control.type !== FILE) control.value = value

    const label = isTextarea ? undefined : this.attr("label")
    const labeled = this.attr("labeled")
    const extra = [label && labeled === null ? LABELED : "", control.type === FILE ? FILE : ""]
    const root = this.create("div", { class: this.classes(extra.filter(Boolean).join(" ") || undefined) })
    const labelBox = label ? this.create("span", { class: LABEL_CLASSES, part: LABEL_PART }, label) : undefined
    if (labelBox && labeled !== "right") root.append(labelBox)
    root.append(control)
    if (labelBox && labeled === "right") root.append(labelBox)
    this.decorate(root, "input")

    this.listen(control, "input", (event) => {
      host.value = control.value
      this.sync()
      this.announce("ui-input", event)
    })
    this.listen(control, "change", (event) => this.announce("ui-change", event))
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
    formInternals.setFormValue(name && control.type !== FILE ? control.value : null)
    if (control.validity.valid) formInternals.setValidity({})
    else formInternals.setValidity(control.validity, control.validationMessage, control)
  }

  /** Dispatch event `name` (`ui-input`, `ui-change`), composed, with the control's value. */
  private announce(name: E.EventName<Vocabulary>, originalEvent: Event) {
    const detail = { value: this.control!.value, originalEvent }
    this.host.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true, detail }))
  }
}

/** Class word of a label given only by the `label` shorthand (no `labeled`). */
const LABELED = "labeled"

/** Part of the joined label. */
const LABEL_PART: E.PartName<Vocabulary> = "label"

/** `<ui-textarea>`'s visible lines. */
const ROWS = "rows"
