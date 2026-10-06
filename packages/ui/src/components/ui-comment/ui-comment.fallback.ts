import { E, UIT } from "$/ui/core"
import { COLLAPSED, REPLY, type Vocabulary } from "./ui-comment.types"
import { commentVocabulary } from "./ui-comment.vocabulary.en"
import { commentsVocabulary } from "./ui-comments.vocabulary.en"

/****************
 * ### `CommentFallback`
 * A comment list or one comment without Solid, keyed by the host's tag -- one class for both, as they share
 * `ui-comment.css`.
 * - `<ui-comments>`:  `<div class="ui ... comments" part="comments"><slot>`;  inside a `<ui-comment>` parent, the
 *   thread form `<div class="[collapsed] comments">`.
 * - `<ui-comment>`:  `<article class="[keyOnly ...] comment" part="comment"><slot>`.
 * - Both:  the `reply` slot in its `div.reply` box, `aria-disabled` while `disabled`.
 ****************/
export class CommentFallback extends E.NativeFallback<Vocabulary> {
  @E.proto static vocabularies = [commentsVocabulary, commentVocabulary]
  @E.proto static degraded = [
    "threads through translated or slotted parents (only a direct `<ui-comment>` parent counts)",
    "the content parts' comment context (`:state(in-comment)`)"
  ]

  protected override build() {
    const isDisabled = this.flag("disabled")
    const isThread =
      this.vocabulary === commentsVocabulary && this.host.parentElement?.localName === commentVocabulary.tag
    const classes = isThread
      ? [this.flag("collapsed") ? COLLAPSED : "", isDisabled ? UIT.DISABLED : "", commentsVocabulary.noun]
          .filter(Boolean)
          .join(" ")
      : this.classes()
    const tag = this.vocabulary === commentVocabulary ? "article" : "div"
    const box = this.create(tag, { class: classes, "aria-disabled": isDisabled ? UIT.TRUE : undefined }, this.slot())
    if (this.host.querySelector(`:scope > [slot="${REPLY}"]`)) {
      box.append(this.create("div", { class: REPLY }, this.create("slot", { name: REPLY })))
    }
    return [this.decorate(box, this.vocabulary.noun)]
  }
}
