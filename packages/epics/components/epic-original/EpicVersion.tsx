import type { JSX } from "@solidjs/web"

import { proto, UIElement } from "$/ui/core"

import { epicVersionVocabulary } from "./epic-version.vocabulary.en"
import type { EpicVersionVocabulary } from "./epic-original.types"

import originalCSS from "./epic-original.css?inline"

/****************
 * ### `<epic-version>`
 * One earlier version of an item's text.
 * - P4:  shows its children through its slots, nothing more;  its `As of <as-of>` heading:  P5's
 ****************/
export class EpicVersion extends UIElement<EpicVersionVocabulary> {
  @proto static vocabulary = epicVersionVocabulary
  @proto static styles = { original: originalCSS }

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("base")}>
        <slot />
      </div>
    )
  }
}
