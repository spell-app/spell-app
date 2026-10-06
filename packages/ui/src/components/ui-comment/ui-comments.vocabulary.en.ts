/**
 * Every name `<ui-comments>` uses:  tag, attributes (kind + allowed values), events, slots, parts, states,
 * texts.  Schema:  `E.ComponentVocabulary`.
 * - The family's grammar notes are in `ui-comment.vocabulary.en.ts`.
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-comments>`
 * A comment list:  `<div class="ui ... comments">` of `<ui-comment>`s;  inside a comment, its thread of replies
 * (`<div class="comments">`).
 ****************/
export const commentsVocabulary = {
  tag: "ui-comments",
  topics: ["social", "lists", "data display", "views"],
  aka: ["discussion", "thread", "replies"],
  skeleton: "none",
  noun: "comments",
  description: "A list of comments, or the thread of replies to one.",
  attributes: [
    { name: "size", kind: "size", description: "Text size, `mini` ... `massive`;  `medium` is the default." },
    { name: "threaded", kind: "keyOnly", description: "A line down the left of each thread of replies." },
    {
      name: "minimal",
      kind: "keyOnly",
      description: "Each comment's actions hidden until the comment is hovered (and shown to keyboard focus)."
    },
    { name: "inverted", kind: "keyOnly", description: "For dark backgrounds:  the dark scheme." },
    { name: "collapsed", kind: "keyOnly", description: "Hidden:  a thread of replies folded away." },
    { name: "disabled", kind: "keyOnly", description: "Faded and inert." }
  ],
  events: [],
  slots: [
    { name: "", description: "`<ui-comment>`s, and a heading (`<ui-header dividing>`)." },
    { name: "reply", description: "A reply form (`<ui-form>`) below the comments." }
  ],
  parts: [
    { name: "comments", description: "The comment list box." },
    { name: "reply", description: "The box around the `reply` slot." }
  ],
  states: [
    { name: "in-comment", description: 'Inside a comment:  its thread of replies (`class="comments"`, no `ui`).' },
    { name: "collapsed", description: "`collapsed`." }
  ],
  texts: [],
  ownsParts: ["comment"]
} as const satisfies E.ComponentVocabulary
