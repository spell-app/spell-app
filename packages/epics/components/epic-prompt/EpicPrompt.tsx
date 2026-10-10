import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { epicPromptVocabulary } from "./EpicPrompt.en"

import promptCSS from "./EpicPrompt.css?inline"

/****************
 * ### `EpicPrompt`
 * The component behind `<epic-prompt>`:  the prompt that started the plan, folded under `Kickoff prompt`.
 * - A native `<details>`, folded to start with:
 *   - folded:  a chevron and `Kickoff prompt` on the brand's ivory (Owen's voice, Q20)
 *   - unfolded:  the prompt a quoted card on it
 *   - whether it's open is page state, never in the file
 * - The prompt is its light children, through the default slot inside the `<details>`:
 *   find-in-page unfolds it, and the live update sees them (Q12).
 * - `<epic-overview>` draws it where it drew `<blockquote slot="prompt">`:  after the summary, above the estimate.
 ****************/
export class EpicPrompt extends E.UIComponent<typeof epicPromptVocabulary> {
  @E.proto static vocabulary = epicPromptVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { "epic-prompt": promptCSS },
    // a container:  a click on its text must not jump to the `<summary>`
    delegatesFocus: false,
    // `disabled`:  unusable, its fold too;  `loading`:  the shared spinner
    disabled: "unusable",
    loading: "loader"
  } satisfies Partial<E.ElementSetup>

  /** The fold's chevron. */
  readonly chevron = new E.IconGlyph({ owner: this, name: () => "chevron right" })

  render(): JSX.Element {
    return (
      <details class={this.rootClass} part={this.partForName("base")}>
        <summary class={TITLE} part={this.partForName("title")}>
          <span class={CHEVRON} aria-hidden="true">
            {this.chevron.svg}
          </span>
          {this.translationForKey("title")}
        </summary>
        <blockquote class={QUOTE} part={this.partForName("quote")}>
          <slot />
        </blockquote>
      </details>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicPrompt extends E.AttributeValues<typeof epicPromptVocabulary> {}

/** Classes of the shadow markup:  the fold's title, its chevron, the card around the prompt. */
const TITLE = "title"
const CHEVRON = "chevron"
const QUOTE = "quote"
