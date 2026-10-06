import { For, Show, createMemo, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { fieldVocabulary } from "./ui-field.vocabulary.en"
import { FormFallback } from "./ui-form.fallback"
import { FieldHost } from "./FieldHost"
import { ERROR, StateFlags } from "./ui-form.types"

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
 * - Hands its controls inherited owner tokens (`INPUT_OWNER_TOKENS`):  full width, and its state's colours.
 * - `disabled` makes the root `inert`, so the slotted controls can't be used.
 * - Always carries `:state(field)`, which is how `<ui-form>` finds a control's field.
 ****************/
export class UIField extends E.UIElement<typeof fieldVocabulary> {
  @E.proto static vocabulary = fieldVocabulary
  @E.proto static styles = { label: labelCSS, form: formCSS }
  @E.proto static Host = FieldHost
  @E.proto static Fallback = FormFallback
  @E.proto static delegatesFocus = false

  /** Prompts `<ui-form>` asked to show. */
  readonly errors = new E.Cell<readonly string[]>([])

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

  protected classValue(name: E.AttributeName<typeof fieldVocabulary>): unknown {
    if (name === "state") return this.shownState()
    return super.classValue(name)
  }

  protected hostStates() {
    return { field: true, ...StateFlags.flagsFor(this.shownState()), disabled: this.attrs.disabled }
  }

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("field")} inert={this.attrs.disabled}>
        <slot />
        <Show when={this.errors.get().length}>
          <span class={this.attrs.inline ? INLINE_PROMPT : PROMPT} part={this.part("prompt")} role={UIT.ALERT}>
            <For each={this.errors.get()}>{(message) => <span class={UIT.MESSAGE}>{message}</span>}</For>
          </span>
        </Show>
      </div>
    )
  }
}

/** Class words of the prompt (`ui-label.css` + `ui-form.css`). */
const PROMPT = "ui basic pointing prompt label"

/** Class words of an `inline` field's prompt:  it points left, at the control. */
const INLINE_PROMPT = "ui basic left pointing prompt label"
