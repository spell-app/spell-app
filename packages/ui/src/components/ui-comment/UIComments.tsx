import { Show, createMemo } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { CommentFallback } from "./ui-comment.fallback"
import { COLLAPSED, REPLY } from "./ui-comment.types"
import { commentsVocabulary } from "./ui-comments.vocabulary.en"

import commentCSS from "./ui-comment.css?inline"

/****************
 * ### `<ui-comments>`
 * A comment list:  `<div class="ui [size] [keyOnly ...] comments" part="comments"><slot></slot></div>`, then the
 * `reply` slot's box (`<div class="reply" part="reply">`) when a reply form is slotted.
 * - Owner of its comments (`ownsParts:  comment`):  each `<ui-comment>` gets `:state(in-comments)`.
 * - Inside a `<ui-comment>` (`PartContext`, noun `comments`):  that comment's THREAD of replies -- `<div
 *   class="[collapsed] comments">`, no `ui`, no variations of its own:  it inherits the outer list's (`threaded`,
 *   `minimal`, `inverted` ...) as tokens, as Fomantic's `.ui.threaded.comments .comment > .comments` has it.
 * - No role:  each comment is an `<article>`, which is the structure a reader moves through.
 * - `disabled`:  `aria-disabled` on the root, which assistive tech (and axe) apply to what's inside.
 ****************/
export class UIComments extends E.UIElement<typeof commentsVocabulary> {
  @E.proto static vocabulary = commentsVocabulary
  @E.proto static styles = { comment: commentCSS }
  @E.proto static Fallback = CommentFallback
  @E.proto static delegatesFocus = false

  /** The comment this is the thread of, if any. */
  readonly context = new E.PartContext(this.host, this.vocabulary.noun)

  /** Light-DOM slot occupancy. */
  readonly slots = new E.SlotContent(this.host)

  /** A thread of replies inside a comment.  Tracked. */
  readonly isThread = createMemo(() => !!this.context.owner.get())

  protected hostStates() {
    return { collapsed: this.attrs.collapsed }
  }

  render(): JSX.Element {
    return (
      <div
        class={this.isThread() ? this.threadClasses() : this.classes()}
        part={this.part("comments")}
        aria-disabled={this.attrs.disabled ? UIT.TRUE : undefined}
      >
        <slot />
        <Show when={this.slots.has(this.slot("reply"))}>
          <div class={REPLY} part={this.part("reply")}>
            <slot name={this.slot("reply")} />
          </div>
        </Show>
      </div>
    )
  }

  /** A thread's classes:  the noun, and `collapsed` / `disabled`, which a thread keeps. */
  private threadClasses(): string {
    const { collapsed, disabled } = this.attrs
    return [collapsed ? COLLAPSED : "", disabled ? UIT.DISABLED : "", this.vocabulary.noun].filter(Boolean).join(" ")
  }
}
