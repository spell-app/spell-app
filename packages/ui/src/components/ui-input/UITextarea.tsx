import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { textareaVocabulary } from "./ui-textarea.vocabulary.en"
import { InputFallback } from "./ui-input.fallback"
import { TextControl } from "./TextControl"
import type { CommonAttributes } from "./ui-input.types"

import inputCSS from "./ui-input.css?inline"

/****************
 * ### `<ui-textarea>`
 * A multi-line field:  `<div class="ui … input" part="input">` around a native `<textarea part="control">`.
 * - Form-associated like `<ui-input>` (see `TextControl`);  Enter types a newline, never submits.
 * - Without `rows` it takes Fomantic's form textarea height (`ui-input.css`).
 ****************/
export class UITextarea extends TextControl<typeof textareaVocabulary> {
  @E.proto static vocabulary = textareaVocabulary
  @E.proto static styleSheets = { input: inputCSS }
  @E.proto static elementSetup = { Fallback: InputFallback }

  protected get constraints(): Record<string, unknown> {
    return { required: this.required, minlength: this.minlength, maxlength: this.maxlength }
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClasses} part={this.partForName("input")}>
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
