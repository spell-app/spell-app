import type { JSX } from "@solidjs/web"

import { proto, UIElement } from "$/ui/core"

import { epicUpdateVocabulary } from "./epic-update.vocabulary.en"
import { EpicUpdateFallback } from "./epic-update.fallback"
import type { EpicUpdateVocabulary } from "./epic-update.types"

import updateCSS from "./epic-update.css?inline"

/****************
 * ### `<epic-update>`
 * An UPDATE marker:  what changed while a phase is active.
 * - P4:  shows its children through its slots, nothing more;  the orange UPDATE label, or a note:  P5's
 ****************/
export class EpicUpdate extends UIElement<EpicUpdateVocabulary> {
  @proto static vocabulary = epicUpdateVocabulary
  @proto static styles = { update: updateCSS }
  @proto static Fallback = EpicUpdateFallback

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("base")}>
        <slot />
      </div>
    )
  }
}
