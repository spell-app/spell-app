import type { JSX } from "@solidjs/web"

import { proto, UIElement } from "$/ui/core"

import { epicOptionVocabulary } from "./epic-option.vocabulary.en"
import type { EpicOptionVocabulary } from "./epic-choices.types"

import choicesCSS from "./epic-choices.css?inline"

/****************
 * ### `<epic-option>`
 * One option card of a question.
 * - P4:  shows its children through its slots, nothing more;  its letter, title and recommended mark:  P5's
 ****************/
export class EpicOption extends UIElement<EpicOptionVocabulary> {
  @proto static vocabulary = epicOptionVocabulary
  @proto static styles = { choices: choicesCSS }

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("base")}>
        <slot name={this.slot("title")} />
        <slot />
      </div>
    )
  }
}
