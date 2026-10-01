import { For, Show, createMemo, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import { Cell, proto, UIElement, type AttributeName, UIT } from "$/ui/core"

import { fieldVocabulary } from "./ui-field.vocabulary.en"
import { FormFallback } from "./ui-form.fallback"
import { FieldHost } from "./FieldHost"

import labelCSS from "$/ui/components/ui-label/ui-label.css?inline"
import formCSS from "./ui-form.css?inline"
import { ERROR, PROMPT, INLINE_PROMPT } from "./ui-form.types"

/****************
 * ### `<ui-field>`
 * One field:  `<div class="… field" part="field">` around the slotted `<label>` and control(s), then -- while
 * `<ui-form>` says so (`showErrors()`) -- the inline prompt, a basic pointing `prompt` label (`ui-label.css`) with
 * `role="alert"`, one line per message.
 * - Failed validation shows `error` over the author's `state`, and clears back to it.
 * - Host:  `display: contents` (`ui-form.css`);  the root is the flex item of a `<ui-fields>` row, which hands it
 *   its width and gutter as inherited tokens.
 * - Hands its controls inherited owner tokens (`INPUT_OWNER_TOKENS`):  full width, and its state's colours.
 * - `disabled` makes the root `inert`, so the slotted controls can't be used.
 * - Always carries `:state(field)`, which is how `<ui-form>` finds a control's field.
 ****************/
export class UIField extends UIElement<typeof fieldVocabulary> {
  @proto static vocabulary = fieldVocabulary
  @proto static styles = { label: labelCSS, form: formCSS }
  @proto static Host = FieldHost
  @proto static Fallback = FormFallback
  @proto static delegatesFocus = false

  /** Prompts `<ui-form>` asked to show. */
  readonly errors = new Cell<readonly string[]>([])

  /** The state shown:  `error` while prompting, else the attribute. */
  readonly shownState = createMemo(() => (this.errors.get().length ? ERROR : this.attrs.state))

  /** Show `messages` (see `FieldHost`). */
  showErrors(messages: readonly string[]) {
    const current = untrack(() => this.errors.get())
    if (current.length !== messages.length || current.some((message, index) => message !== messages[index])) {
      this.errors.set([...messages])
    }
  }

  /** Prompts shown now. */
  shownErrors(): readonly string[] {
    return untrack(() => this.errors.get())
  }

  protected classValue(name: AttributeName<typeof fieldVocabulary>): unknown {
    if (name === "state") return this.shownState()
    return super.classValue(name)
  }

  protected hostStates() {
    const state = this.shownState()
    return {
      field: true,
      error: state === ERROR,
      info: state === "info",
      success: state === "success",
      warning: state === "warning",
      disabled: this.attrs.disabled
    }
  }

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("field")} inert={this.attrs.disabled}>
        <slot />
        <Show when={this.errors.get().length}>
          <span class={this.attrs.inline ? INLINE_PROMPT : PROMPT} part={this.part("prompt")} role="alert">
            <For each={this.errors.get()}>{(message) => <span class={UIT.MESSAGE}>{message}</span>}</For>
          </span>
        </Show>
      </div>
    )
  }
}
