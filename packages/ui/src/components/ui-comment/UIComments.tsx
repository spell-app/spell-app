import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { commentsVocabulary } from "./UIComments.en"

import commentCSS from "./UIComment.css?inline"

/****************
 * ### `UIComments`
 * The component behind `<ui-comments>`:
 * a list of comments, `<div class="ui [size] [keyOnly ...] comments" part="comments"><slot></slot></div>`,
 * then the `reply` slot's box (`<div class="reply" part="reply">`) when a reply form is slotted.
 *
 * - It owns its comments (`ownsParts:  comment`):  each `<ui-comment>` gets `:state(in-comments)`.
 *
 * - Inside a `<ui-comment>` (`PartContext`, noun `comments`), it is that comment's THREAD of replies:
 *   `<div class="[collapsed] comments">`, no `ui`, no variations of its own.
 *   It inherits the outer list's (`threaded`, `minimal`, `inverted` ...) as tokens,
 *   as Fomantic's `.ui.threaded.comments .comment > .comments` has it.
 *
 * - No role:  each comment is an `<article>`, which is the structure a reader moves through.
 *
 * - `disabled`:  `aria-disabled` on the root, which assistive tech (and axe) apply to what's inside.
 ****************/
@E.cssStates("collapsed")
export class UIComments extends E.UIComponent<typeof commentsVocabulary> {
  @E.proto static vocabulary = commentsVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { comment: commentCSS },
    delegatesFocus: false,
    // `disabled`:  `aria-disabled` on its box, and a look
    disabled: "its own"
  } satisfies Partial<E.ElementSetup>

  /** The comment this is the thread of, if any. */
  readonly context = new E.PartContext({ domElement: this.domElement, noun: this.vocabulary.noun })

  /** Light-DOM slot occupancy. */
  readonly slots = new E.SlotContent(this.domElement)

  /** A thread of replies inside a comment. */
  get isThread(): boolean {
    return !!this.context.owner
  }

  render(): JSX.Element {
    return (
      <div
        class={this.isThread ? this.threadClasses : this.rootClass}
        part={this.partForName("comments")}
        aria-disabled={this.disabled ? "true" : undefined}
      >
        <slot />
        <Show when={this.slots.hasContent(this.slotForName("reply"))}>
          <div class={REPLY} part={this.partForName("reply")}>
            <slot name={this.slotForName("reply")} />
          </div>
        </Show>
      </div>
    )
  }

  /** A thread's classes:  the noun, and `collapsed` / `disabled`, which a thread keeps. */
  @E.derived
  private get threadClasses(): string {
    return [this.collapsed ? COLLAPSED : "", this.disabled ? UIT.DISABLED : "", this.vocabulary.noun]
      .filter(Boolean)
      .join(" ")
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIComments extends E.AttributeValues<typeof commentsVocabulary> {}

/** The class, part and slot of the reply box (`UIComment` draws one too). */
const REPLY = "reply"

/** The class word a thread of replies keeps (`collapsed comments`). */
const COLLAPSED = "collapsed"
