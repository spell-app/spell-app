/**
 * Every name `<ui-reveal>` uses:  tag, attributes (kind + allowed values), slots, parts, states.
 * Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:  `<ui-reveal move="right" instant>` =>
 *   `ui instant right move reveal`.  `ui-reveal.css` keys on single words (`.move.right`), so the phrase order is free.
 * - The two contents are SLOTS (`visible`, `hidden`), which the element wraps in Fomantic's `.visible.content` /
 *   `.hidden.content` boxes;  unslotted children join the visible content.
 * - `active` keeps Fomantic's word:  it means REVEALED, not chosen, so it isn't a `selected`.
 */

import type { ComponentVocabulary } from "$/ui/vocabulary"

/****************
 * ### `<ui-reveal>`
 * A reveal:  `<div class="ui ... reveal" part="reveal">` holding the visible content over the hidden one.
 ****************/
export const revealVocabulary = {
  tag: "ui-reveal",
  topics: ["animation", "images", "media", "elements"],
  aka: ["hover reveal", "flip", "slide reveal", "overlay image"],
  skeleton: null,
  noun: "reveal",
  description: "A reveal displays additional content in place of previous content when activated.",
  attributes: [
    { name: "size", kind: "size", description: "Text size of both contents, `mini` ... `massive`." },
    { name: "fade", kind: "keyOnly", description: "The visible content fades out." },
    {
      name: "move",
      kind: "keyOrValueAndKey",
      values: ["right", "up", "down"],
      description: "The visible content moves out:  left (bare), `right`, `up` or `down`."
    },
    {
      name: "rotate",
      kind: "keyOrValueAndKey",
      values: ["left", "right"],
      description: "The visible content rotates away around a bottom corner:  right (bare) or `left`."
    },
    {
      name: "slide",
      kind: "keyOrValueAndKey",
      values: ["right", "up", "down"],
      description: "Both contents slide:  left (bare), `right`, `up` or `down`."
    },
    { name: "instant", kind: "keyOnly", description: "No delay before the transition starts." },
    { name: "visible", kind: "keyOnly", description: "Content overflowing the box stays visible (no clipping)." },
    { name: "active", kind: "keyOnly", description: "Revealed now, without hover or focus." },
    { name: "disabled", kind: "keyOnly", description: "Never reveals." }
  ],
  events: [],
  slots: [
    { name: "visible", description: "What shows first, e.g. an image." },
    { name: "hidden", description: "What the reveal shows on hover, focus or `active`." },
    { name: "", description: "More visible content." }
  ],
  parts: [
    { name: "reveal", description: "The reveal box." },
    { name: "visible", description: "The visible content box." },
    { name: "hidden", description: "The hidden content box." }
  ],
  states: [
    { name: "active", description: "Revealed by `active`." },
    { name: "disabled", description: "Never reveals." }
  ],
  texts: []
} as const satisfies ComponentVocabulary
