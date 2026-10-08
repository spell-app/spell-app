import { E } from "$/ui/core"
import { inputVocabulary } from "./UIInput.vocabulary.en"
import { textareaVocabulary } from "./UITextarea.vocabulary.en"
import { FILE, LABEL_CLASSES, type Vocabulary } from "./UIInput.types"

/****************
 * ### `InputFallback`
 * The native fallback of `<ui-input>` and `<ui-textarea>`:  what they show when their component breaks,
 * so the field's value is still typed in, validated and submitted with its form.
 *
 * - Its shadow DOM:  `<div part="input" class="ui … input">` around a native `<input part="control">`
 *   (a `<textarea>` for `<ui-textarea>`), with the `label` shorthand as a joined label.
 * - Still a form control.  Every `input` event:
 *   - sets `domElement.value`, and the DOM element's form value
 *   - copies the native control's validity onto the DOM element (`setValidity(..., control)`)
 *   - sends a composed `ui-input`;  `change` sends `ui-change`.
 * - Its starting value is the DOM element's `value` PROPERTY, else its attribute.
 * - Its accessible name is the DOM element's `aria-label`, else `placeholder`.
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

  /** The native control, once built, for `attached()`. */
  private control: HTMLInputElement | HTMLTextAreaElement | undefined

  protected override build() {
    const domElement = this.domElement as InputDOMElement
    const isTextarea = domElement.localName === textareaVocabulary.tag
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
        this.create("textarea", { ...common, rows: this.domElement.getAttribute(ROWS) })
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
    const value = domElement.value ?? this.attr("value")
    if (value && control.type !== FILE) control.value = value

    const label = isTextarea ? undefined : this.attr("label")
    const labeled = this.attr("labeled")
    const extra = [label && labeled === undefined ? LABELED : "", control.type === FILE ? FILE : ""]
    const root = this.create("div", { class: this.classes(extra.filter(Boolean).join(" ") || undefined) })
    const labelBox = label ? this.create("span", { class: LABEL_CLASSES, part: LABEL_PART }, label) : undefined
    if (labelBox && labeled !== "right") root.append(labelBox)
    root.append(control)
    if (labelBox && labeled === "right") root.append(labelBox)
    this.decorate(root, "input")

    this.listen(control, "input", (event) => {
      domElement.value = control.value
      this.sync()
      this.announce("ui-input", event)
    })
    this.listen(control, "change", (event) => this.announce("ui-change", event))
    this.control = control
    return [root]
  }

  /** The first form value and validity, which need the control attached. */
  protected override attached() {
    this.sync()
  }

  /** Copy the control's value and validity onto the DOM element. */
  private sync() {
    const { control, formInternals } = this
    if (!control || !formInternals) return
    const name = this.attr("name")
    formInternals.setFormValue(name && control.type !== FILE ? control.value : null)
    if (control.validity.valid) formInternals.setValidity({})
    else formInternals.setValidity(control.validity, control.validationMessage, control)
  }

  /** Send event `name` (`ui-input`, `ui-change`), composed, with the control's value. */
  private announce(name: E.EventName<Vocabulary>, originalEvent: Event) {
    const detail = { value: this.control!.value, originalEvent }
    this.domElement.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true, detail }))
  }
}

/** What the fallback reads and writes of the DOM element:  `value` is optional, the element may not have upgraded. */
type InputDOMElement = HTMLElement & {
  /** the live value, once set */
  value?: string
}

/** The class word of a label given only by the `label` shorthand (no `labeled`). */
const LABELED = "labeled"

/** The part of the joined label. */
const LABEL_PART: E.PartName<Vocabulary> = "label"

/** `<ui-textarea>`'s visible lines. */
const ROWS = "rows"
