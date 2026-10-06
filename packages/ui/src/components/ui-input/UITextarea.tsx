import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { textareaVocabulary } from "./ui-textarea.vocabulary.en"
import { InputFallback } from "./ui-input.fallback"
import { TextControl } from "./TextControl"

import inputCSS from "./ui-input.css?inline"

/****************
 * ### `<ui-textarea>`
 * A multi-line field:  `<div class="ui … input" part="input">` around a native `<textarea part="control">`.
 * - Form-associated like `<ui-input>` (see `TextControl`);  Enter types a newline, never submits.
 * - Without `rows` it takes Fomantic's form textarea height (`ui-input.css`).
 ****************/
export class UITextarea extends TextControl<typeof textareaVocabulary> {
  @E.proto static vocabulary = textareaVocabulary
  @E.proto static styles = { input: inputCSS }
  @E.proto static Fallback = InputFallback

  protected constraints(): Record<string, unknown> {
    const { required, minlength, maxlength } = this.attrs
    return { required, minlength, maxlength }
  }

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("input")}>
        <textarea
          ref={(element) => (this.control = element)}
          part={this.part("control")}
          rows={this.attrs.rows}
          placeholder={this.attrs.placeholder}
          autocomplete={this.attrs.autocomplete as never}
          disabled={this.isDisabled()}
          readonly={this.attrs.readonly}
          {...this.constraints()}
          {...this.controlAria()}
          {...this.staticControl()}
          onInput={this.onInput}
          onChange={this.onChange}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
        />
      </div>
    )
  }
}
