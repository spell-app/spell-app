import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { textareaVocabulary } from "./UITextarea.en"
import { InputFallback } from "./UIInput.fallback"
import { TextControl } from "./TextControl"
import type { CommonAttributes } from "./UIInput.types"

import inputCSS from "./UIInput.css?inline"

/****************
 * ### `UITextarea`
 * The component behind `<ui-textarea>`:  a text field of several lines.
 *
 * - Its shadow DOM:  `<div class="ui … input" part="input">` around a native `<textarea part="control">`.
 * - A form control like `<ui-input>` (see `TextControl`);  Enter types a new line, and never submits.
 * - Without `rows`, it takes the height of Fomantic's form textarea (`UIInput.css`).
 ****************/
export class UITextarea extends TextControl<typeof textareaVocabulary> {
  @E.proto static vocabulary = textareaVocabulary
  @E.proto static styleSheets = { input: inputCSS }
  @E.proto static elementSetup = { Fallback: InputFallback } satisfies Partial<E.ElementSetup>

  protected get constraints(): Record<string, unknown> {
    return { required: this.required, minlength: this.minlength, maxlength: this.maxlength }
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("input")}>
        <textarea
          ref={(element) => (this.control = element)}
          part={this.partForName("control")}
          rows={this.rows}
          placeholder={this.placeholder}
          autocomplete={this.autocomplete as never}
          disabled={this.isDisabled}
          readonly={this.readonly}
          {...this.constraints}
          {...this.controlAria}
          {...this.staticControl}
          onInput={this.onInput}
          onChange={this.onChange}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
        />
      </div>
    )
  }
}

/** The vocabulary getters, typed;  `TextControl` types the shared ones, and owns `value`. */
export interface UITextarea extends Omit<
  E.AttributeValues<typeof textareaVocabulary>,
  keyof CommonAttributes | "value"
> {}
