import { NativeFallback, proto, type NativeFallbackRoot } from "$/ui/core"

import { fieldVocabulary, fieldsVocabulary, formVocabulary } from "./ui-form.vocabulary.en"

/****************
 * ### `FormFallback`
 * `<div part="<noun>" class="ui … form" | "… field" | "… fields"><slot></slot></div>` for a form, field or fields --
 * keyed by the host's tag.  The same markup as the elements, so `ui-form.css` lays it out unchanged, and the native
 * `<form>` inside keeps submitting natively.
 * - `disabled` still makes the root `inert`.
 ****************/
export class FormFallback extends NativeFallback {
  @proto static degraded = [
    "validation:  `rules`, prompts, `ui-valid` / `ui-invalid` / `ui-success` / `ui-failure` (the browser's own " +
      "constraint validation takes over)",
    "`values` / `validate()` / `reset()` / `clear()`, `prevent-leaving`",
    "the error state after a failed submit"
  ]

  constructor(host: HTMLElement, root: NativeFallbackRoot, error?: unknown, internals?: ElementInternals) {
    super(host, root, error, internals)
    // Shadows the prototype's placeholder vocabulary, see `@proto`.
    this.vocabulary = VOCABULARIES.find((vocabulary) => vocabulary.tag === host.localName) ?? formVocabulary
  }

  protected override build() {
    const root = this.create("div", { class: this.classes(), inert: this.flag("disabled") }, this.slot())
    return [this.decorate(root, this.vocabulary.noun)]
  }
}

/** Every vocabulary of the family. */
const VOCABULARIES = [formVocabulary, fieldVocabulary, fieldsVocabulary] as const
