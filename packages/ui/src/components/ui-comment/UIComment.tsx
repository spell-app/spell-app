import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { commentVocabulary } from "./UIComment.en"

import commentCSS from "./UIComment.css?inline"

/****************
 * ### `UIComment`
 * The component behind `<ui-comment>`:
 * one comment, `<article class="[keyOnly ...] comment" part="comment"><slot></slot></article>`,
 * then the `reply` slot's box (`<div class="reply" part="reply">`) when a reply form is slotted.
 *
 * - Why `<article>`:  HTML names "a user-submitted comment" as its example of a self-contained composition,
 *   and nests the replies' articles inside the comment they answer, as a thread of `<ui-comments>` inside does.
 *
 * - It owns its content parts (`ownsParts`):
 *   `<ui-avatar>`, `<ui-content>`, `<ui-author>`, `<ui-meta>`, `<ui-description>` and `<ui-actions>`
 *   get `:state(in-comment)`;  a `<ui-comments>` inside is its thread.
 *
 * - In a `<ui-comments>` (`PartContext`, noun `comment`):  `:state(in-comments)`.
 *
 * - `disabled`:  unusable, the base class's way (`elementSetup.disabled`):  faded, the article inert,
 *   `aria-disabled`.
 ****************/
export class UIComment extends E.UIComponent<typeof commentVocabulary> {
  @E.proto static vocabulary = commentVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { comment: commentCSS },
    cssStates: ["collapsed"],
    delegatesFocus: false
  } satisfies Partial<E.ElementSetup>

  /** Its comment list, if any. */
  readonly context = new E.PartContext({ domElement: this.domElement, noun: this.vocabulary.noun })

  /** Light-DOM slot occupancy. */
  readonly slots = new E.SlotContent(this.domElement)

  render(): JSX.Element {
    return (
      <article class={this.rootClass} part={this.partForName("comment")}>
        <slot />
        <Show when={this.slots.hasContent(this.slotForName("reply"))}>
          <div class={REPLY} part={this.partForName("reply")}>
            <slot name={this.slotForName("reply")} />
          </div>
        </Show>
      </article>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIComment extends E.AttributeValues<typeof commentVocabulary> {}

/** The class, part and slot of the reply box (`UIComments` draws one too). */
const REPLY = "reply"
