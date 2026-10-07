import type { JSX } from "@solidjs/web"

import { proto, UIElement } from "$/ui/core"

import { epicFieldVocabulary } from "./epic-field.vocabulary.en"
import type { EpicFieldVocabulary } from "./epic-phase.types"

import phaseCSS from "./epic-phase.css?inline"

/****************
 * ### `<epic-field>`
 * One named field of a phase (Symptom, Changes, Goal ...).
 * - P4:  shows its children through its slots, nothing more;  its icon and label:  P5's
 ****************/
export class EpicField extends UIElement<EpicFieldVocabulary> {
  @proto static vocabulary = epicFieldVocabulary
  @proto static styles = { phase: phaseCSS }

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("base")}>
        <slot />
      </div>
    )
  }
}
