import type { JSX } from "@solidjs/web"

import { proto, UIElement } from "$/ui/core"

import { epicOriginalVocabulary } from "./epic-original.vocabulary.en"
import { EpicOriginalFallback } from "./epic-original.fallback"
import type { EpicOriginalVocabulary } from "./epic-original.types"

import originalCSS from "./epic-original.css?inline"

/****************
 * ### `<epic-original>`
 * An item's Original Discussion:  its earlier text, folded.
 * - P4:  shows its children through its slots, nothing more;  the folded aside:  P5's
 ****************/
export class EpicOriginal extends UIElement<EpicOriginalVocabulary> {
  @proto static vocabulary = epicOriginalVocabulary
  @proto static styles = { original: originalCSS }
  @proto static Fallback = EpicOriginalFallback

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("base")}>
        <slot />
      </div>
    )
  }
}
