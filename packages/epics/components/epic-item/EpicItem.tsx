import type { JSX } from "@solidjs/web"

import { proto, UIElement } from "$/ui/core"

import { epicItemVocabulary } from "./epic-item.vocabulary.en"
import { EpicItemFallback } from "./epic-item.fallback"
import type { EpicItemVocabulary } from "./epic-item.types"

import itemCSS from "./epic-item.css?inline"

/****************
 * ### `<epic-item>`
 * One item -- question, judgement call, caveat, todo, issue or test -- its kind its id's letter.
 * - P4:  shows its children through its slots, nothing more;  the id chip, line, review label and fold:  P5's
 ****************/
export class EpicItem extends UIElement<EpicItemVocabulary> {
  @proto static vocabulary = epicItemVocabulary
  @proto static styles = { item: itemCSS }
  @proto static Fallback = EpicItemFallback

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("base")}>
        <slot name={this.slot("title")} />
        <slot />
      </div>
    )
  }
}
