import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { CommentFallback } from "./ui-comment.fallback"
import { REPLY } from "./ui-comment.types"
import { commentVocabulary } from "./ui-comment.vocabulary.en"

import commentCSS from "./ui-comment.css?inline"

/****************
 * ### `<ui-comment>`
 * One comment:  `<article class="[keyOnly ...] comment" part="comment"><slot></slot></article>`, then the `reply`
 * slot's box (`<div class="reply" part="reply">`) when a reply form is slotted.
 * - Why `<article>`:  HTML names "a user-submitted comment" as its example of a self-contained composition, and
 *   nests replies' articles inside the comment they answer -- which a thread of `<ui-comments>` inside does.
 * - Owner of its content parts (`ownsParts`):  `<ui-avatar>`, `<ui-content>`, `<ui-author>`, `<ui-meta>`,
 *   `<ui-description>`, `<ui-actions>` get `:state(in-comment)`;  a `<ui-comments>` inside is its thread.
 * - In a `<ui-comments>` (`PartContext`, noun `comment`):  `:state(in-comments)`.
 * - `disabled`:  `aria-disabled` on the article, which assistive tech (and axe) apply to what's inside.
 ****************/
export class UIComment extends E.UIElement<typeof commentVocabulary> {
  @E.proto static vocabulary = commentVocabulary
  @E.proto static styleSheets = { comment: commentCSS }
  @E.proto static elementSetup = { Fallback: CommentFallback, delegatesFocus: false }

  /** Its comment list, if any. */
  readonly context = new E.PartContext({ host: this.host, noun: this.vocabulary.noun })

  /** Light-DOM slot occupancy. */
  readonly slots = new E.SlotContent(this.host)

  /** Faded and inert:  its `disabled` attribute. */
  @E.cssState("disabled")
  get isDisabled(): boolean {
    return this.disabled
  }

  /** Folded away:  its `collapsed` attribute. */
  @E.cssState("collapsed")
  get isCollapsed(): boolean {
    return this.collapsed
  }

  render(): JSX.Element {
    return (
      <article
        class={this.rootClasses}
        part={this.partForName("comment")}
        aria-disabled={this.disabled ? UIT.TRUE : undefined}
      >
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
export interface UIComment extends E.AttributeValues<typeof commentVocabulary> {}
