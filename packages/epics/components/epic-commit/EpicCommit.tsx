import type { JSX } from "@solidjs/web"

import { proto, UIElement } from "$/ui/core"

import { epicCommitVocabulary } from "./epic-commit.vocabulary.en"
import { EpicCommitFallback } from "./epic-commit.fallback"
import type { EpicCommitVocabulary } from "./epic-commit.types"

import commitCSS from "./epic-commit.css?inline"

/****************
 * ### `<epic-commit>`
 * One commit of a phase or an item.
 * - P4:  shows its children through its slots, nothing more;  its short sha, linked through `<epic-page repo>`:  P5's
 ****************/
export class EpicCommit extends UIElement<EpicCommitVocabulary> {
  @proto static vocabulary = epicCommitVocabulary
  @proto static styles = { commit: commitCSS }
  @proto static Fallback = EpicCommitFallback

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("base")}>
        <slot />
      </div>
    )
  }
}
