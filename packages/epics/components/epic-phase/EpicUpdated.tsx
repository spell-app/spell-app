import type { JSX } from "@solidjs/web"

import { proto, UIElement } from "$/ui/core"

import { epicUpdatedVocabulary } from "./epic-updated.vocabulary.en"
import type { EpicUpdatedVocabulary } from "./epic-phase.types"

import phaseCSS from "./epic-phase.css?inline"

/****************
 * ### `<epic-updated>`
 * One dated change to a phase's plan.
 * - P4:  shows its children through its slots, nothing more;  its fence and date:  P5's
 ****************/
export class EpicUpdated extends UIElement<EpicUpdatedVocabulary> {
  @proto static vocabulary = epicUpdatedVocabulary
  @proto static styles = { phase: phaseCSS }

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("base")}>
        <slot />
      </div>
    )
  }
}
