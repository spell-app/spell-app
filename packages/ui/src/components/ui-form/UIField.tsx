import { For, Show, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { fieldVocabulary } from "./UIField.en"
import { ERROR, INFO, SUCCESS, WARNING } from "./UIForm.types"

import labelCSS from "$/ui/components/ui-label/UILabel.css?inline"
import formCSS from "./UIForm.css?inline"

/****************
 * ### `DOMFieldElement`
 * The DOM element of `<ui-field>`:  it adds `showErrors()`, which `<ui-form>` calls
 * to show (or, with `[]`, clear) the field's inline prompt and error state.
 *
 * - No attribute is written, so the author's `state` stays theirs.
 * - `errors`:  the prompts shown now.
 * - `DOMElement` checks its members against the attributes' property names;  neither of these is one.
 * - Above the component:  its `elementSetup` reads this class while the component is defined.
 ****************/
export class DOMFieldElement extends E.DOMElement<UIField> {
  /** Show `messages` as the field's prompt (and `error` state);  `[]` clears. */
  showErrors(messages: readonly string[]) {
    this.component?.showErrors(messages)
  }

  /** Prompts shown now. */
  get errors(): readonly string[] {
    return untrack(() => this.component?.errors) ?? []
  }
}

/****************
 * ### `UIField`
 * The component behind `<ui-field>`:  one field of a form,
 * `<div class="… field" part="field">` around the slotted `<label>` and control(s), then its prompt.
 *
 * - The prompt shows while `<ui-form>` says so (`showErrors()`):
 *   a basic pointing `prompt` label (`UILabel.css`) with `role="alert"`, one line per message.
 * - Failed validation shows `error` over the author's `state`, and clears back to it.
 *
 * - The DOM element is `display: contents` (`UIForm.css`):  the root is the flex item of a `<ui-fields>` row,
 *   which hands it its width and gutter as inherited tokens.
 * - It hands its controls inherited owner tokens (`InputOwnerTokens`):  full width, and its state's colours.
 *
 * - `disabled` makes the root `inert`, so the slotted controls can't be used.
 * - Always carries `:state(field)`, which is how `<ui-form>` finds a control's field.
 ****************/
export class UIField extends E.UIComponent<typeof fieldVocabulary> {
  @E.proto static vocabulary = fieldVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { label: labelCSS, form: formCSS },
    DOMElement: DOMFieldElement,
    delegatesFocus: false,
    // `disabled`:  its content inert, a look;  the element still takes clicks
    disabled: "its own"
  } satisfies Partial<E.ElementSetup>

  ////////////////
  // ## Prompts
  ////////////////

  /** Prompts `<ui-form>` asked to show;  `DOMFieldElement.errors` reads them untracked. */
  @E.state accessor errors: readonly string[] = []

  /** Show `messages` (see `DOMFieldElement`). */
  @E.untracked
  showErrors(messages: readonly string[]) {
    const current = this.errors
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
      <div class={this.rootClass} part={this.partForName("field")} inert={this.disabled}>
        <slot />
        <Show when={this.errors.length}>
          <span class={this.inline ? INLINE_PROMPT : PROMPT} part={this.partForName("prompt")} role="alert">
            <For each={this.errors}>{(message) => <span class={UIT.MESSAGE}>{message}</span>}</For>
          </span>
        </Show>
      </div>
    )
  }
}

/** The vocabulary getters, typed (`UIComponent`'s doc). */
export interface UIField extends E.AttributeValues<typeof fieldVocabulary> {}

/** Class words of the prompt (`UILabel.css` + `UIForm.css`). */
const PROMPT = "ui basic pointing prompt label"

/** Class words of an `inline` field's prompt:  it points left, at the control. */
const INLINE_PROMPT = "ui basic left pointing prompt label"
