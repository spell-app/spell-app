import type { JSX } from "@solidjs/web"

import { proto, UIElement } from "$/ui/core"

import { epicSectionVocabulary } from "./epic-section.vocabulary.en"
import { EpicSectionFallback } from "./epic-section.fallback"
import type { EpicSectionVocabulary } from "./epic-section.types"

import sectionCSS from "./epic-section.css?inline"

/****************
 * ### `<epic-section>`
 * One section of a plan doc, by `kind`:  phases, items, the log, or an Overview sub-section.
 * - P4:  shows its children through its slots, nothing more;  its numbered title, icon, counts and fold:  P5's
 ****************/
export class EpicSection extends UIElement<EpicSectionVocabulary> {
  @proto static vocabulary = epicSectionVocabulary
  @proto static styles = { section: sectionCSS }
  @proto static Fallback = EpicSectionFallback

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("base")}>
        <slot name={this.slot("title")} />
        <slot />
      </div>
    )
  }
}
