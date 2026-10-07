import type { JSX } from "@solidjs/web"

import { proto, UIElement } from "$/ui/core"

import { epicPhaseVocabulary } from "./epic-phase.vocabulary.en"
import { EpicPhaseFallback } from "./epic-phase.fallback"
import type { EpicPhaseVocabulary } from "./epic-phase.types"

import phaseCSS from "./epic-phase.css?inline"

/****************
 * ### `<epic-phase>`
 * One phase of the plan:  its fields, plan updates and commits as children.
 * - P4:  shows its children through its slots, nothing more;  its status icon, estimate badge and fold:  P5's
 ****************/
export class EpicPhase extends UIElement<EpicPhaseVocabulary> {
  @proto static vocabulary = epicPhaseVocabulary
  @proto static styles = { phase: phaseCSS }
  @proto static Fallback = EpicPhaseFallback

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("base")}>
        <slot name={this.slot("title")} />
        <slot />
      </div>
    )
  }
}
