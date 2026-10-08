/**
 * The English vocabulary of `<ui-comment>`:  every name the tag uses.
 * - Its tag, attributes (each with its kind and allowed values), slots, parts and states.
 *   The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-comments threaded minimal size="small">` => `ui small minimal threaded comments`;  a comment has no `ui`
 *   (`<ui-comment collapsed>` => `collapsed comment`).  `UIComment.css` keys on those.
 * - A comment owns the generic content parts (`ownsParts`):  `<ui-avatar>`, `<ui-content>`, `<ui-author>`,
 *   `<ui-meta>` (Fomantic's `.metadata`), `<ui-description>` (Fomantic's `.text`), `<ui-actions>` inside it get
 *   `:state(in-comment)` (`UIParts.css`).  It owns `comments` too:  a `<ui-comments>` inside a comment is its thread
 *   of replies.
 */

import type { E } from "$/ui/core"

/****************
 * ### `commentVocabulary`
 * The names of `<ui-comment>`, one comment:  an `<article class="comment">` of an avatar,
 * a content block and a thread of replies.
 ****************/
export const commentVocabulary = {
  tag: "ui-comment",
  topics: ["social", "content parts", "views"],
  aka: ["reply", "post", "message"],
  skeleton: "header with image, 2 line paragraph",
  noun: "comment",
  ui: false,
  description: "One comment:  who wrote it, when, what, and the replies to it.",
  attributes: [
    { name: "collapsed", kind: "keyOnly", description: "Hidden:  folded away." },
    { name: "disabled", kind: "keyOnly", description: "Faded and inert." }
  ],
  events: [],
  slots: [
    {
      name: "",
      description:
        "`<ui-avatar>`, a `<ui-content>` (author, meta, description, actions) and a `<ui-comments>` thread of replies."
    },
    { name: "reply", description: "A reply form (`<ui-form>`) below the comment." }
  ],
  parts: [
    { name: "comment", description: "The comment box (`<article>`)." },
    { name: "reply", description: "The box around the `reply` slot." }
  ],
  states: [
    { name: "in-comments", description: "In a comment list." },
    { name: "collapsed", description: "`collapsed`." },
    { name: "disabled", description: "`disabled`." }
  ],
  texts: [],
  ownsParts: ["avatar", "content", "author", "meta", "description", "actions", "comments"]
} as const satisfies E.ComponentVocabulary
