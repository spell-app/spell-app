import type { JSX } from "@solidjs/web"

import { proto, UIElement } from "$/ui/core"

import { epicOverviewVocabulary } from "./epic-overview.vocabulary.en"
import { EpicOverviewFallback } from "./epic-overview.fallback"
import type { EpicOverviewVocabulary } from "./epic-overview.types"

import overviewCSS from "./epic-overview.css?inline"

/****************
 * ### `<epic-overview>`
 * A plan doc's Overview:  summary, kickoff prompt and estimate, then its sub-sections.
 * - P4:  shows its children through its slots, nothing more;  the folded Kickoff prompt and the estimate line:  P5's
 ****************/
export class EpicOverview extends UIElement<EpicOverviewVocabulary> {
  @proto static vocabulary = epicOverviewVocabulary
  @proto static styles = { overview: overviewCSS }
  @proto static Fallback = EpicOverviewFallback

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("base")}>
        <slot name={this.slot("summary")} />
        <slot name={this.slot("prompt")} />
        <slot />
      </div>
    )
  }
}
