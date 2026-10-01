import { NativeFallback, proto, type NativeFallbackRoot } from "$/ui/core"

import { commentVocabulary, commentsVocabulary } from "./ui-comment.vocabulary.en"

/** Either vocabulary, for brevity. */
type Vocabulary = typeof commentsVocabulary | typeof commentVocabulary

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
  @proto static degraded = [
    "threads through translated or slotted parents (only a direct `<ui-comment>` parent counts)",
    "the content parts' comment context (`:state(in-comment)`)"
  ]

  constructor(host: HTMLElement, root: NativeFallbackRoot, error?: unknown, internals?: ElementInternals) {
    super(host, root, error, internals)
    // Shadows the prototype's placeholder vocabulary, see `@proto`.
    this.vocabulary = host.localName === commentVocabulary.tag ? commentVocabulary : commentsVocabulary
  }

  protected override build() {
    const disabled = this.flag("disabled") ? TRUE : null
    const thread =
      this.vocabulary === commentsVocabulary && this.host.parentElement?.localName === commentVocabulary.tag
    const classes = thread
      ? [this.flag("collapsed") ? COLLAPSED : "", disabled ? DISABLED : "", commentsVocabulary.noun]
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

/** Class of the reply box, and name of its slot. */
const REPLY = "reply"

/** Class words a thread keeps. */
const COLLAPSED = "collapsed"
const DISABLED = "disabled"

/** ARIA boolean. */
const TRUE = "true"
