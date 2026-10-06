import { NativeFallback, proto, UIT } from "$/ui/core"

import { commentVocabulary } from "./ui-comment.vocabulary.en"
import { commentsVocabulary } from "./ui-comments.vocabulary.en"
import { COLLAPSED, REPLY, Vocabulary } from "./ui-comment.types"

/****************
 * ### `CommentFallback`
 * A comment list or one comment without Solid, keyed by the host's tag -- one class for both, as they share
 * `ui-comment.css`.
 * - `<ui-comments>`:  `<div class="ui ... comments" part="comments"><slot>`;  inside a `<ui-comment>` parent, the
 *   thread form `<div class="[collapsed] comments">`.
 * - `<ui-comment>`:  `<article class="[keyOnly ...] comment" part="comment"><slot>`.
 * - Both:  the `reply` slot in its `div.reply` box, `aria-disabled` while `disabled`.
 ****************/
export class CommentFallback extends NativeFallback<Vocabulary> {
  @proto static vocabularies = [commentsVocabulary, commentVocabulary]
  @proto static degraded = [
    "threads through translated or slotted parents (only a direct `<ui-comment>` parent counts)",
    "the content parts' comment context (`:state(in-comment)`)"
  ]

  protected override build() {
    const disabled = this.flag("disabled") ? UIT.TRUE : null
    const thread =
      this.vocabulary === commentsVocabulary && this.host.parentElement?.localName === commentVocabulary.tag
    const classes = thread
      ? [this.flag("collapsed") ? COLLAPSED : "", disabled ? UIT.DISABLED : "", commentsVocabulary.noun]
          .filter(Boolean)
          .join(" ")
      : this.classes()
    const tag = this.vocabulary === commentVocabulary ? "article" : "div"
    const box = this.create(tag, { class: classes, "aria-disabled": disabled }, this.slot())
    if (this.host.querySelector(`:scope > [slot="${REPLY}"]`)) {
      box.append(this.create("div", { class: REPLY }, this.create("slot", { name: REPLY })))
    }
    return [this.decorate(box, this.vocabulary.noun)]
  }
}
