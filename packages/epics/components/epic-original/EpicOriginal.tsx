import type { JSX } from "@solidjs/web"

import { proto, UIElement, UIT } from "$/ui/core"

import { Chevron } from "$/epics/components/epic-item/Chevron"
import { Fold } from "$/epics/components/epic-item/Fold"

import { epicOriginalVocabulary } from "./epic-original.vocabulary.en"
import { EpicOriginalFallback } from "./epic-original.fallback"
import { BODY, BODY_ID, TOGGLE, type EpicOriginalVocabulary } from "./epic-original.types"

import originalCSS from "./epic-original.css?inline"

/****************
 * ### `<epic-original>`
 * An item's Original Discussion:  the text a rewrite or a second answer replaced, one `<epic-version>` each, in a
 * warm aside folded under its heading (as Choices).  Find-in-page unfolds it.
 ****************/
export class EpicOriginal extends UIElement<EpicOriginalVocabulary> {
  @proto static vocabulary = epicOriginalVocabulary
  @proto static styles = { original: originalCSS }
  @proto static Fallback = EpicOriginalFallback
  @proto static delegatesFocus = false

  /** Folded until the reader opens it:  history, not the current text. */
  readonly fold = new Fold(() => false)

  protected hostStates() {
    return { open: this.fold.isOpen() }
  }

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("base")}>
        <button
          type={UIT.BUTTON}
          class={TOGGLE}
          part={this.part("toggle")}
          aria-expanded={this.fold.isOpen() ? UIT.TRUE : UIT.FALSE}
          aria-controls={BODY_ID}
          onClick={this.fold.toggle}
        >
          <Chevron />
          {this.text("original")}
        </button>
        <div ref={this.fold.watch} id={BODY_ID} class={BODY} part={this.part("body")} hidden={this.fold.hidden()}>
          <slot />
        </div>
      </div>
    )
  }
}
