import { Show, createMemo } from "solid-js"
import type { JSX } from "@solidjs/web"

import { Cell, IconGlyph, proto, SlotContent, type AttributeName, type FieldValue, UIT } from "$/ui/core"

import { inputVocabulary } from "./ui-input.vocabulary.en"
import { InputFallback } from "./ui-input.fallback"
import { TextControl } from "./TextControl"

import labelCSS from "$/ui/components/ui-label/ui-label.css?inline"
import inputCSS from "./ui-input.css?inline"
import {
  TYPE,
  DISABLED_PSEUDO,
  FILE,
  LABEL_CLASSES,
  CORNER_LABEL,
  LEFT_CORNER_LABEL,
  type Vocabulary,
  type LabelPlace
} from "./ui-input.types"

/****************
 * ### `<ui-input>`
 * A text field:  `<div class="ui … input" part="input">` around a native `<input part="control">`, with the optional
 * joined label, action buttons and icon box in the order `ui-input.css` documents.
 * - Form-associated (see `TextControl`):  value, native constraints + `rules`, reset, fieldset-disabled.
 * - `type` passes through;  `file` submits the chosen `File`s (one `FormData` entry each) and can't be set from
 *   script, as natively.
 * - Enter submits the form (implicit submission:  the native control has no form of its own in the shadow root):
 *   the form's first submit button is clicked, else `requestSubmit()`.
 ****************/
export class UIInput extends TextControl<Vocabulary> {
  @proto static vocabulary = inputVocabulary
  @proto static styles = { label: labelCSS, input: inputCSS }
  @proto static Fallback = InputFallback

  /** Light-DOM slot occupancy (`label`, `action`, `icon`). */
  readonly slots = new SlotContent(this.host)

  /** Files chosen in a `file` input. */
  readonly files = new Cell<readonly File[]>([])

  ////////////////
  // ## Derived
  ////////////////

  /** Where the joined label goes, if there is one. */
  readonly labelPlace = createMemo((): LabelPlace | undefined => {
    const { labeled, label } = this.attrs
    if (labeled === "corner" || labeled === "left corner") return "corner"
    if (!labeled && !label && !this.slots.has(this.slot("label"))) return undefined
    return labeled === "right" ? "end" : "start"
  })

  /** Where the action slot goes, if anything is in it. */
  readonly actionPlace = createMemo((): "start" | "end" | undefined => {
    const { action } = this.attrs
    if (!action && !this.slots.has(this.slot("action"))) return undefined
    return action === "left" ? "start" : "end"
  })

  /** Shows the icon box:  an icon, or the spinner. */
  readonly hasIconBox = createMemo(() => !!this.attrs.icon || this.slots.has(this.slot("icon")) || this.attrs.loading)

  /** `type="file"`? */
  readonly isFile = createMemo(() => this.attrs.type === FILE)

  /** Glyph of the `icon` attribute. */
  readonly glyph = new IconGlyph(this, () => this.attrs.icon)

  /** Glyph of a corner label (its `label` is an icon name). */
  readonly cornerGlyph = new IconGlyph(this, () => (this.labelPlace() === "corner" ? this.attrs.label : undefined))

  ////////////////
  // ## Element hooks
  ////////////////

  protected classValue(name: AttributeName<Vocabulary>): unknown {
    if (name === "labeled") return this.labelPlace() ? this.attrs.labeled || true : false
    if (name === "action") return this.actionPlace() ? this.attrs.action || true : false
    if (name === "icon-position") return this.hasIconBox() ? this.attrs.iconPosition : undefined
    return super.classValue(name)
  }

  protected extraClasses(): string | undefined {
    const extra = [this.hasIconBox() && this.attrs.iconPosition !== UIT.LEFT ? UIT.ICON : "", this.isFile() ? FILE : ""]
    return extra.filter(Boolean).join(" ") || undefined
  }

  protected constraints(): Record<string, unknown> {
    const { required, pattern, min, max, step, minlength, maxlength, multiple, accept } = this.attrs
    return { required, pattern, min, max, step, minlength, maxlength, multiple, accept }
  }

  /** Files submit themselves:  one entry per file. */
  protected formSubmission(value: FieldValue, name: string | undefined): string | File | FormData | null {
    if (!this.isFile()) return super.formSubmission(value, name)
    const files = this.files.get()
    if (!name || !files.length) return null
    const data = new FormData()
    for (const file of files) data.append(name, file)
    return data
  }

  formReset() {
    super.formReset()
    if (this.control && this.isFile()) this.control.value = ""
    this.files.set([])
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("input")}>
        <Show when={this.labelPlace() === "start"}>{this.label()}</Show>
        <Show when={this.actionPlace() === "start"}>
          <slot name={this.slot("action")} />
        </Show>
        <input
          ref={(element) => (this.control = element)}
          part={this.part("control")}
          type={this.attrs.type ?? "text"}
          placeholder={this.attrs.placeholder}
          autocomplete={this.attrs.autocomplete as never}
          disabled={this.isDisabled()}
          readonly={this.attrs.readonly}
          aria-busy={this.attrs.loading ? "true" : undefined}
          {...this.constraints()}
          {...this.controlAria()}
          {...this.staticControl()}
          onInput={this.onInput}
          onChange={this.onFileOrChange}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          onKeyDown={this.onKeyDown}
        />
        <Show when={this.hasIconBox()}>
          <span class={UIT.ICON} part={this.part("icon")}>
            <slot name={this.slot("icon")}>{this.glyph.svg()}</slot>
          </span>
        </Show>
        <Show when={this.labelPlace() === "end"}>{this.label()}</Show>
        <Show when={this.labelPlace() === "corner"}>
          <span
            class={this.attrs.labeled === "left corner" ? LEFT_CORNER_LABEL : CORNER_LABEL}
            part={this.part("label")}
            aria-hidden="true"
          >
            <span class={UIT.ICON}>
              <slot name={this.slot("label")}>{this.cornerGlyph.svg()}</slot>
            </span>
          </span>
        </Show>
        <Show when={this.actionPlace() === "end"}>
          <slot name={this.slot("action")} />
        </Show>
      </div>
    )
  }

  /** The joined label box, around the `label` slot / shorthand. */
  private label(): JSX.Element {
    return (
      <span class={LABEL_CLASSES} part={this.part("label")}>
        <slot name={this.slot("label")}>{this.attrs.label}</slot>
      </span>
    )
  }

  ////////////////
  // ## Handlers
  ////////////////

  /** `change`:  a file input's value and files arrive here too. */
  private readonly onFileOrChange = (event: Event) => {
    if (this.isFile()) {
      const control = event.currentTarget as HTMLInputElement
      this.files.set([...(control.files ?? [])])
      this.valueState.request(control.value as never, () => true)
    }
    this.onChange(event)
  }

  /** Enter submits the form, as a native field would. */
  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== UIT.ENTER || event.isComposing || event.defaultPrevented) return
    const form = this.formHost.form
    if (!form) return
    event.preventDefault()
    this.touched.set(true)
    const submitter = [...form.elements].find(UIInput.isSubmitter) as HTMLElement | undefined
    if (submitter) submitter.click()
    else form.requestSubmit()
  }

  /**
   * A form's default button:  a native submit button, or a `<ui-button type="submit">` (form-associated, so in
   * `form.elements`).
   */
  private static isSubmitter(element: Element): boolean {
    if (element instanceof HTMLButtonElement || element instanceof HTMLInputElement) {
      return element.type === UIT.SUBMIT && !element.disabled
    }
    return element.getAttribute(TYPE) === UIT.SUBMIT && !element.matches(DISABLED_PSEUDO)
  }
}
