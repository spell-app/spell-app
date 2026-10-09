import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { Chevron } from "$/epics/components/epic-item/Chevron"
import { Fold } from "$/epics/components/epic-item/Fold"

import { epicOriginalVocabulary } from "./EpicOriginal.en"

import originalCSS from "./EpicOriginal.css?inline"

/****************
 * ### `EpicOriginal`
 * The component behind `<epic-original>`:  an item's Original Discussion -- the text a rewrite or a second answer
 * replaced, one `<epic-version>` each, in a warm aside folded under its heading (as Choices).  Find-in-page unfolds it.
 ****************/
export class EpicOriginal extends E.UIComponent<typeof epicOriginalVocabulary> {
  @E.proto static vocabulary = epicOriginalVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { "epic-original": originalCSS },
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  /** Folded until the reader opens it:  history, not the current text. */
  readonly fold = new Fold(() => false)

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
          <Chevron />
          {this.translationForKey("original")}
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

/** Class names inside the shadow root. */
const TOGGLE = "toggle"
const BODY = "body"

/** `id` of the aside's body, which its toggle controls. */
const BODY_ID = "body"
