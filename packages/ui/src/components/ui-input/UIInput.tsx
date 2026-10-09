import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { inputVocabulary } from "./UIInput.en"
import { InputFallback } from "./UIInput.fallback"
import { TextControl } from "./TextControl"
import { LABEL_CLASSES, type CommonAttributes, type LabelPlace, type Vocabulary } from "./UIInput.types"

import labelCSS from "$/ui/components/ui-label/UILabel.css?inline"
import inputCSS from "./UIInput.css?inline"

/****************
 * ### `UIInput`
 * The component behind `<ui-input>`:  a one-line text field.
 *
 * - Its shadow DOM:  `<div class="ui … input" part="input">` around a native `<input part="control">`,
 *   with the optional joined label, action buttons and icon box, in the order `UIInput.css` documents.
 * - A form control (see `TextControl`):  its value, native constraints + `rules`, reset, a disabled fieldset.
 * - `type` passes through to the native input.
 *   `file` submits the chosen `File`s (one `FormData` entry each), and script can't set its value, as natively.
 * - Enter submits the form, as in a native field ("implicit submission"):
 *   it clicks the form's first submit button, else calls `requestSubmit()`.
 *   The native input can't do it itself:  inside a shadow root, it belongs to no form.
 ****************/
export class UIInput extends TextControl<Vocabulary> {
  @E.proto static vocabulary = inputVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { label: labelCSS, input: inputCSS },
    Fallback: InputFallback
  } satisfies Partial<E.ElementSetup>

  /** Which slots have light-DOM children (`label`, `action`, `icon`). */
  readonly slots = new E.SlotContent(this.domElement)

  ////////////////
  // ## The label
  ////////////////

  /** Where the joined label goes, if there is one. */
  get labelPlace(): LabelPlace | undefined {
    const { labeled } = this
    if (labeled === "corner" || labeled === "left corner") return "corner"
    if (!labeled && !this.label && !this.slots.hasContent(this.slotForName("label"))) return undefined
    return labeled === "right" ? "end" : "start"
  }

  /** The glyph of a corner label (its `label` is an icon name). */
  readonly cornerGlyph = new E.IconGlyph({
    owner: this,
    name: () => (this.labelPlace === "corner" ? this.label : undefined)
  })

  ////////////////
  // ## The action
  ////////////////

  /** Where the action slot goes, if anything is in it. */
  get actionPlace(): "start" | "end" | undefined {
    const { action } = this
    if (!action && !this.slots.hasContent(this.slotForName("action"))) return undefined
    return action === "left" ? "start" : "end"
  }

  ////////////////
  // ## The icon
  ////////////////

  /** Shows the icon box:  an icon, or the spinner. */
  get hasIconBox(): boolean {
    return !!this.icon || this.slots.hasContent(this.slotForName("icon")) || !!this.loading
  }

  /** The glyph of the `icon` attribute. */
  readonly iconGlyph = new E.IconGlyph({ owner: this, name: () => this.icon })

  ////////////////
  // ## Files
  ////////////////

  /** `type="file"`? */
  get isFileInput(): boolean {
    return this.type === "file"
  }

  /** Files chosen in a `file` input. */
  @E.state accessor files: readonly File[] = []

  /** Files submit themselves:  one entry per file. */
  protected formSubmission(value: E.FieldValue, name: string | undefined): string | File | FormData | null {
    if (!this.isFileInput) return super.formSubmission(value, name)
    const files = this.files
    if (!name || !files.length) return null
    const data = new FormData()
    for (const file of files) data.append(name, file)
    return data
  }

  /** Also clears a file input's chosen files, which only script can. */
  onFormReset() {
    super.onFormReset()
    if (this.control && this.isFileInput) this.control.value = ""
    this.files = []
  }

  /** `change`:  a file input's value and files arrive here too. */
  private readonly onFileOrChange = (event: Event) => {
    if (this.isFileInput) {
      const control = event.currentTarget as HTMLInputElement
      this.files = [...(control.files ?? [])]
      this.requestChange("value", control.value, () => true)
    }
    this.onChange(event)
  }

  ////////////////
  // ## Classes and constraints
  ////////////////

  protected classValue(name: E.AttributeName<Vocabulary>): unknown {
    if (name === "labeled") return this.labelPlace ? this.labeled || true : false
    if (name === "action") return this.actionPlace ? this.action || true : false
    if (name === "icon-position") return this.hasIconBox ? this.iconPosition : undefined
    return super.classValue(name)
  }

  protected get extraClass(): string | undefined {
    const extra = [this.hasIconBox && this.iconPosition !== UIT.LEFT ? UIT.ICON : "", this.isFileInput ? "file" : ""]
    return extra.filter(Boolean).join(" ") || undefined
  }

  protected get constraints(): Record<string, unknown> {
    return {
      required: this.required,
      pattern: this.pattern,
      min: this.min,
      max: this.max,
      step: this.step,
      minlength: this.minlength,
      maxlength: this.maxlength,
      multiple: this.multiple,
      accept: this.accept
    }
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("input")}>
        <Show when={this.labelPlace === "start"}>{this.labelBox()}</Show>
        <Show when={this.actionPlace === "start"}>
          <slot name={this.slotForName("action")} />
        </Show>
        <input
          ref={(element) => (this.control = element)}
          part={this.partForName("control")}
          type={this.type ?? "text"}
          placeholder={this.placeholder}
          autocomplete={this.autocomplete as never}
          inputmode={this.inputmode}
          disabled={this.isDisabled}
          readonly={this.readonly}
          aria-busy={this.loading ? "true" : undefined}
          {...this.constraints}
          {...this.controlAria}
          {...this.staticControl}
          onInput={this.onInput}
          onChange={this.onFileOrChange}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          onKeyDown={this.onKeyDown}
        />
        <Show when={this.hasIconBox}>
          <span class={UIT.ICON} part={this.partForName("icon")}>
            <slot name={this.slotForName("icon")}>{this.iconGlyph.svg}</slot>
          </span>
        </Show>
        <Show when={this.labelPlace === "end"}>{this.labelBox()}</Show>
        <Show when={this.labelPlace === "corner"}>
          <span
            class={this.labeled === "left corner" ? LEFT_CORNER_LABEL : CORNER_LABEL}
            part={this.partForName("label")}
            aria-hidden="true"
          >
            <span class={UIT.ICON}>
              <slot name={this.slotForName("label")}>{this.cornerGlyph.svg}</slot>
            </span>
          </span>
        </Show>
        <Show when={this.actionPlace === "end"}>
          <slot name={this.slotForName("action")} />
        </Show>
      </div>
    )
  }

  /** The joined label box, around the `label` slot / shorthand. */
  private labelBox(): JSX.Element {
    return (
      <span class={LABEL_CLASSES} part={this.partForName("label")}>
        <slot name={this.slotForName("label")}>{this.label}</slot>
      </span>
    )
  }

  ////////////////
  // ## Submitting
  ////////////////

  /** Enter submits the form, as a native field would. */
  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== UIT.Key.enter || event.isComposing || event.defaultPrevented) return
    const form = this.domElement.form
    if (!form) return
    event.preventDefault()
    this.isTouched = true
    const submitter = [...form.elements].find(UIInput.isSubmitter) as HTMLElement | undefined
    if (submitter) submitter.click()
    else form.requestSubmit()
  }

  /**
   * A form's default button:  a native submit button, or a `<ui-button type="submit">` (form-associated,
   * so in `form.elements`).
   * - STATIC:  pure, a `find()` predicate.  `instanceof` is safe here:  a key handler, which the static render never
   *   reaches.
   */
  private static isSubmitter(element: Element): boolean {
    if (element instanceof HTMLButtonElement || element instanceof HTMLInputElement) {
      return element.type === "submit" && !element.disabled
    }
    return element.getAttribute("type") === "submit" && !element.matches(":disabled")
  }
}
/** The vocabulary getters, typed;  `TextControl` types the shared ones, and owns `value`. */
export interface UIInput extends Omit<E.AttributeValues<Vocabulary>, keyof CommonAttributes | "value"> {}

/** Class words of a `labeled="corner"` label (`UIInput.css`). */
const CORNER_LABEL = "ui corner label"

/** Class words of a `labeled="left corner"` label. */
const LEFT_CORNER_LABEL = "ui left corner label"
