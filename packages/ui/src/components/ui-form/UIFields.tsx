import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { fieldsVocabulary } from "./UIFields.en"
import { ERROR, INFO, SUCCESS, WARNING } from "./UIForm.types"

import formCSS from "./UIForm.css?inline"

/****************
 * ### `UIFields`
 * The component behind `<ui-fields>`:  a row (or a `grouped` stack) of fields,
 * `<div class="… fields" part="fields"><slot></slot></div>`.
 *
 * - The DOM element is `display: contents`;  the root is the flex row, and hands each `<ui-field>`
 *   its share of the width (`widths`), the gutter and its state as inherited tokens (`UIForm.css`).
 * - `disabled` makes the root `inert`.
 ****************/
export class UIFields extends E.UIComponent<typeof fieldsVocabulary> {
  @E.proto static vocabulary = fieldsVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { form: formCSS },
    delegatesFocus: false,
    // `disabled`:  its content inert, a look;  the element still takes clicks
    disabled: "its own"
  } satisfies Partial<E.ElementSetup>

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

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("fields")} inert={this.disabled}>
        <slot />
      </div>
    )
  }
}

/** The vocabulary getters, typed (`UIComponent`'s doc). */
export interface UIFields extends E.AttributeValues<typeof fieldsVocabulary> {}
