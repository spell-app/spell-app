import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { fieldsVocabulary } from "./ui-fields.vocabulary.en"
import { FormFallback } from "./ui-form.fallback"
import { StateFlags } from "./ui-form.types"

import formCSS from "./ui-form.css?inline"

/****************
 * ### `<ui-fields>`
 * A row (or `grouped` stack) of fields:  `<div class="… fields" part="fields"><slot></slot></div>`.
 * - Host:  `display: contents`;  the root is the flex row, and hands each `<ui-field>` its share of the width
 *   (`widths`), the gutter and its state as inherited tokens (`ui-form.css`).
 * - `disabled` makes the root `inert`.
 ****************/
export class UIFields extends E.UIElement<typeof fieldsVocabulary> {
  @E.proto static vocabulary = fieldsVocabulary
  @E.proto static styles = { form: formCSS }
  @E.proto static Fallback = FormFallback
  @E.proto static delegatesFocus = false

  protected hostStates() {
    return { ...StateFlags.flagsFor(this.attrs.state), disabled: this.attrs.disabled }
  }

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("fields")} inert={this.attrs.disabled}>
        <slot />
      </div>
    )
  }
}
