import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { fieldsVocabulary } from "./ui-fields.vocabulary.en"
import { FormFallback } from "./ui-form.fallback"
import { ERROR, INFO, SUCCESS, WARNING } from "./ui-form.types"

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
  @E.proto static styleSheets = { form: formCSS }
  @E.proto static elementSetup = { Fallback: FormFallback, delegatesFocus: false }

  /** `:state(error)`:  `state="error"`. */
  @E.cssState("error")
  get isError(): boolean {
    return this.state === ERROR
  }

  /** `:state(info)`:  `state="info"`. */
  @E.cssState("info")
  get isInfo(): boolean {
    return this.state === INFO
  }

  /** `:state(success)`:  `state="success"`. */
  @E.cssState("success")
  get isSuccess(): boolean {
    return this.state === SUCCESS
  }

  /** `:state(warning)`:  `state="warning"`. */
  @E.cssState("warning")
  get isWarning(): boolean {
    return this.state === WARNING
  }

  /**
   * `:state(disabled)` while `disabled`:  the root is `inert`.
   * - Not an `isDisabled` override:  that would make the host swallow clicks too.
   */
  @E.cssState("disabled")
  get looksDisabled(): boolean {
    return this.disabled
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClasses} part={this.partForName("fields")} inert={this.disabled}>
        <slot />
      </div>
    )
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UIFields extends E.AttributeValues<typeof fieldsVocabulary> {}
