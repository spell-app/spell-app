import { Show, createMemo } from "solid-js"
import type { JSX } from "@solidjs/web"

import { PartContext, proto, SlotContent, UIElement } from "$/core"

import { commentsVocabulary } from "./comment.vocabulary.en"
import { CommentFallback } from "./comment.fallback"

import commentCSS from "./comment.css?inline"

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
export class UIComments extends UIElement<typeof commentsVocabulary> {
  @proto static vocabulary = commentsVocabulary
  @proto static styles = { comment: commentCSS }
  @proto static Fallback = CommentFallback
  @proto static delegatesFocus = false

  /** The comment this is the thread of, if any. */
  readonly context = new PartContext(this.host, this.vocabulary.noun)

  /** Light-DOM slot occupancy. */
  readonly slots = new SlotContent(this.host)

  /** A thread of replies inside a comment.  Tracked. */
  readonly nested = createMemo(() => !!this.context.owner.get())

  protected hostStates() {
    return { collapsed: this.attrs.collapsed }
  }

  render(): JSX.Element {
    return (
      <div
        class={this.nested() ? this.threadClasses() : this.classes()}
        part={this.part("comments")}
        aria-disabled={this.attrs.disabled ? TRUE : undefined}
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
    return [collapsed ? COLLAPSED : "", disabled ? DISABLED : "", this.vocabulary.noun].filter(Boolean).join(" ")
  }
}

/** Class of the reply box. */
const REPLY = "reply"

/** ARIA boolean. */
const TRUE = "true"

/** Class words a thread keeps. */
const COLLAPSED = "collapsed"
const DISABLED = "disabled"
