import type { JSX } from "@solidjs/web"

import { proto, UIElement } from "$/ui/core"

import { epicPageVocabulary } from "./epic-page.vocabulary.en"
import { EpicPageFallback } from "./epic-page.fallback"
import type { EpicPageVocabulary } from "./epic-page.types"

import pageCSS from "./epic-page.css?inline"

/****************
 * ### `<epic-page>`
 * A plan doc:  one epic's page, its data in attributes, its sections as children.
 * - P4:  shows its children through its slots, nothing more;  the header, meta lines and step label:  P5's
 ****************/
export class EpicPage extends UIElement<EpicPageVocabulary> {
  @proto static vocabulary = epicPageVocabulary
  @proto static styles = { page: pageCSS }
  @proto static Fallback = EpicPageFallback

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("base")}>
        <slot name={this.slot("durable")} />
        <slot />
      </div>
    )
  }
}
