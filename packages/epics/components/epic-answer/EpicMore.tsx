import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { Fold } from "$/epics/components/epic-item/Fold"

import { epicMoreVocabulary } from "./EpicMore.en"
import { BODY } from "./EpicAnswer.types"

import answerCSS from "./EpicAnswer.css?inline"

/****************
 * ### `EpicMore`
 * The component behind `<epic-more>`:  More Details (Add Details Now) on an item --
 * a plain card under its text and answer, open to start with, folded by its `More Details` heading.
 * The item labels its own text above it `Original reply` (`<epic-item>`).
 ****************/
export class EpicMore extends E.UIComponent<typeof epicMoreVocabulary> {
  @E.proto static vocabulary = epicMoreVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { "epic-answer": answerCSS },
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  /** Open to start with:  it's what was just added. */
  readonly fold = new Fold(() => true)

  /** Unfolded. */
  @E.cssState("open")
  get isOpen(): boolean {
    return this.fold.isOpen()
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("base")}>
        <button
          type="button"
          class={TOGGLE}
          part={this.partForName("toggle")}
          aria-expanded={this.isOpen ? "true" : "false"}
          aria-controls={BODY_ID}
          onClick={this.fold.toggle}
        >
          {Fold.chevron()}
          {this.translationForKey("more")}
        </button>
        <div
          ref={this.fold.watch}
          id={BODY_ID}
          class={BODY}
          part={this.partForName("body")}
          hidden={this.fold.hidden()}
        >
          <slot />
        </div>
      </div>
    )
  }
}

/** Class of its heading, the `<button>` that folds it. */
const TOGGLE = "toggle"

/** `id` of its body, which its toggle controls. */
const BODY_ID = "body"
