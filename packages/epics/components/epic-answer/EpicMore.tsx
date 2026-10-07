import type { JSX } from "@solidjs/web"

import { proto, UIElement, UIT } from "$/ui/core"

import { Chevron } from "$/epics/components/epic-item/Chevron"
import { Fold } from "$/epics/components/epic-item/Fold"

import { epicMoreVocabulary } from "./epic-more.vocabulary.en"
import { BODY, BODY_ID, TOGGLE, type EpicMoreVocabulary } from "./epic-answer.types"

import answerCSS from "./epic-answer.css?inline"

/****************
 * ### `<epic-more>`
 * More Details (Add Details Now) on an item:  a plain card under its text and answer, open to start with, folded by
 * its `More Details` heading.  The item labels its own text above it `Original reply` (`<epic-item>`).
 ****************/
export class EpicMore extends UIElement<EpicMoreVocabulary> {
  @proto static vocabulary = epicMoreVocabulary
  @proto static styles = { answer: answerCSS }
  @proto static delegatesFocus = false

  /** Open to start with:  it's what was just added. */
  readonly fold = new Fold(() => true)

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
          {this.text("more")}
        </button>
        <div ref={this.fold.watch} id={BODY_ID} class={BODY} part={this.part("body")} hidden={this.fold.hidden()}>
          <slot />
        </div>
      </div>
    )
  }
}
