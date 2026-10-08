import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"

import { epicReplyVocabulary } from "./EpicReply.en"
import { BODY, EMPTY, HEADER, HEADING_SEPARATOR } from "./EpicAnswer.types"

import answerCSS from "./EpicAnswer.css?inline"

/****************
 * ### `EpicReply`
 * The component behind `<epic-reply>`:  a reply on an item, after its answer -- a card, its heading band
 * `<from> · <at> · re: <re>` (each part only when set), then the reply (its light children).
 * - Claude's (or anyone's but Owen's):  violet, the brand's action colour, apart from the warm answer card.
 * - Owen's (`from="Owen"`):  Revisit's orange, as his note on the page.
 ****************/
export class EpicReply extends E.UIComponent<typeof epicReplyVocabulary> {
  @E.proto static vocabulary = epicReplyVocabulary
  @E.proto static styleSheets = { answer: answerCSS }
  @E.proto static elementSetup = { delegatesFocus: false } satisfies Partial<E.ElementSetup>

  /** Light-DOM slot occupancy:  has it a body? */
  readonly slots = new E.SlotContent(this.domElement)

  /** Its heading:  who, when, about what. */
  get heading(): string {
    const { from, at, re } = this
    return [from, at, re && this.translationForKey("re", { re })].filter(Boolean).join(HEADING_SEPARATOR)
  }

  protected get extraClasses(): string | undefined {
    return FROM_OWEN.test(this.from ?? "") ? OWEN : undefined
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClasses} part={this.partForName("base")}>
        <div class={HEADER} part={this.partForName("header")} hidden={!this.heading}>
          {this.heading}
        </div>
        <div class={[BODY, { [EMPTY]: !this.slots.hasContent("") }]} part={this.partForName("body")}>
          <slot />
        </div>
      </div>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicReply extends E.AttributeValues<typeof epicReplyVocabulary> {}

/** A reply Owen wrote (`from="Owen"`):  his note's orange, not Claude's violet. */
const FROM_OWEN = /^owen$/i

/** Class word on a reply box:  Owen's. */
const OWEN = "owen"
