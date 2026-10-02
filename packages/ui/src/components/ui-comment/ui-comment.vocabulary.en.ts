/**
 * Every name `<ui-comments>` and `<ui-comment>` use:  tag, attributes (kind + allowed values), slots, parts,
 * states.  Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-comments threaded minimal size="small">` => `ui small minimal threaded comments`;  a comment has no `ui`
 *   (`<ui-comment collapsed>` => `collapsed comment`).  `ui-comment.css` keys on those.
 * - A comment owns the generic content parts (`ownsParts`):  `<ui-avatar>`, `<ui-content>`, `<ui-author>`,
 *   `<ui-meta>` (Fomantic's `.metadata`), `<ui-description>` (Fomantic's `.text`), `<ui-actions>` inside it get
 *   `:state(in-comment)` (`ui-parts.css`).  It owns `comments` too:  a `<ui-comments>` inside a comment is its thread
 *   of replies.
 */

import type { ComponentVocabulary } from "$/ui/vocabulary"

/****************
 * ### `<ui-comment>`
 * One comment:  an `<article class="comment">` of an avatar, a content block and a thread of replies.
 ****************/
export const commentVocabulary = {
  tag: "ui-comment",
  topics: ["social", "content parts", "views"],
  aka: ["reply", "post", "message"],
  skeleton: {
    parts: [
      { shape: "header", image: true },
      { shape: "paragraph", lines: 2 }
    ]
  },
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
} as const satisfies ComponentVocabulary
