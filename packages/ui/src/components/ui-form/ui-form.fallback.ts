import { E } from "$/ui/core"
import { formVocabulary } from "./ui-form.vocabulary.en"
import { fieldVocabulary } from "./ui-field.vocabulary.en"
import { fieldsVocabulary } from "./ui-fields.vocabulary.en"

/****************
 * ### `FormFallback`
 * `<div part="<noun>" class="ui … form" | "… field" | "… fields"><slot></slot></div>` for a form, field or fields.
 * - Keyed by the host's tag (`vocabularies`).
 * - The same markup as the elements, so `ui-form.css` lays it out unchanged, and the native `<form>` inside keeps
 *   submitting natively.
 * - `disabled` still makes the root `inert`.
 ****************/
export class FormFallback extends E.NativeFallback {
  @E.proto static vocabularies = [formVocabulary, fieldVocabulary, fieldsVocabulary]
  @E.proto static degraded = [
    "validation:  `rules`, prompts, `ui-valid` / `ui-invalid` / `ui-success` / `ui-failure` (the browser's own " +
      "constraint validation takes over)",
    "`values` / `validate()` / `reset()` / `clear()`, `prevent-leaving`",
    "the error state after a failed submit"
  ]

  protected override build() {
    const root = this.create("div", { class: this.classes(), inert: this.flag("disabled") }, this.slot())
    return [this.decorate(root, this.vocabulary.noun)]
  }
}
