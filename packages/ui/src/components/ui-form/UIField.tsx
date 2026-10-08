import { For, Show, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { fieldVocabulary } from "./ui-field.vocabulary.en"
import { FormFallback } from "./ui-form.fallback"
import { FieldHost } from "./FieldHost"
import { ERROR, INFO, SUCCESS, WARNING } from "./ui-form.types"

import labelCSS from "$/ui/components/ui-label/ui-label.css?inline"
import formCSS from "./ui-form.css?inline"

/****************
 * ### `<ui-field>`
 * One field:  `<div class="… field" part="field">` around the slotted `<label>` and control(s), then its prompt.
 * - The prompt shows while `<ui-form>` says so (`showErrors()`):  a basic pointing `prompt` label (`ui-label.css`)
 *   with `role="alert"`, one line per message.
 * - Failed validation shows `error` over the author's `state`, and clears back to it.
 * - Host:  `display: contents` (`ui-form.css`);  the root is the flex item of a `<ui-fields>` row, which hands it
 *   its width and gutter as inherited tokens.
 * - Hands its controls inherited owner tokens (`InputOwnerTokens`):  full width, and its state's colours.
 * - `disabled` makes the root `inert`, so the slotted controls can't be used.
 * - Always carries `:state(field)`, which is how `<ui-form>` finds a control's field.
 ****************/
export class UIField extends E.UIElement<typeof fieldVocabulary> {
  @E.proto static vocabulary = fieldVocabulary
  @E.proto static styleSheets = { label: labelCSS, form: formCSS }
  @E.proto static elementSetup = { Fallback: FormFallback, Host: FieldHost, delegatesFocus: false }

  ////////////////
  // ## Prompts
  ////////////////

  /** Prompts `<ui-form>` asked to show;  `FieldHost.errors` reads them untracked. */
  @E.state accessor errors: readonly string[] = []

  /** Show `messages` (see `FieldHost`). */
  showErrors(messages: readonly string[]) {
    const current = untrack(() => this.errors)
    if (current.length !== messages.length || current.some((message, index) => message !== messages[index])) {
      this.errors = [...messages]
    }
  }

  ////////////////
  // ## State and classes
  ////////////////

  /** The state shown:  `error` while prompting, else the attribute. */
  get shownState(): UIT.FormState | undefined {
    return this.errors.length ? ERROR : this.state
  }

  /** `:state(error)`:  the state shown is `error`. */
  @E.cssState("error")
  get isError(): boolean {
    return this.shownState === ERROR
  }

  /** `:state(info)`:  the state shown is `info`. */
  @E.cssState("info")
  get isInfo(): boolean {
    return this.shownState === INFO
  }

  /** `:state(success)`:  the state shown is `success`. */
  @E.cssState("success")
  get isSuccess(): boolean {
    return this.shownState === SUCCESS
  }

  /** `:state(warning)`:  the state shown is `warning`. */
  @E.cssState("warning")
  get isWarning(): boolean {
    return this.shownState === WARNING
  }

  /**
   * `:state(disabled)` while `disabled`:  the root is `inert`.
   * - Not an `isDisabled` override:  that would make the host swallow clicks too.
   */
  @E.cssState("disabled")
  get looksDisabled(): boolean {
    return this.disabled
  }

  /** Always `:state(field)`:  how `<ui-form>` finds a control's field. */
  @E.cssState("field")
  get isField(): boolean {
    return true
  }

  protected classValue(name: E.AttributeName<typeof fieldVocabulary>): unknown {
    if (name === "state") return this.shownState
    return super.classValue(name)
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div class={this.rootClasses} part={this.partForName("field")} inert={this.disabled}>
        <slot />
        <Show when={this.errors.length}>
          <span class={this.inline ? INLINE_PROMPT : PROMPT} part={this.partForName("prompt")} role={UIT.ALERT}>
            <For each={this.errors}>{(message) => <span class={UIT.MESSAGE}>{message}</span>}</For>
          </span>
        </Show>
      </div>
    )
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UIField extends E.AttributeValues<typeof fieldVocabulary> {}

/** Class words of the prompt (`ui-label.css` + `ui-form.css`). */
const PROMPT = "ui basic pointing prompt label"

/** Class words of an `inline` field's prompt:  it points left, at the control. */
const INLINE_PROMPT = "ui basic left pointing prompt label"
