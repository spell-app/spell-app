/**
 * The English vocabulary of `<ui-segments>`:  every name the tag uses.
 * - Its tag, attributes (each with its kind and allowed values), slots, parts and states.
 *   The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - How the family's attributes become class words:  `UISegment.vocabulary.en.ts`.
 */

import type { E } from "$/ui/core"

/****************
 * ### `segmentsVocabulary`
 * The names of `<ui-segments>`, a group of segments in one box:  `<div class="ui … segments" part="group">`.
 ****************/
export const segmentsVocabulary = {
  tag: "ui-segments",
  topics: ["containers", "layout", "elements"],
  aka: ["panel group", "stacked panels"],
  noun: "segments",
  description: "A group of segments can be formatted to appear together.",
  attributes: [
    { name: "size", kind: "size", description: "Text size of every segment in the group." },
    { name: "horizontal", kind: "keyOnly", description: "Side by side instead of stacked." },
    {
      name: "equal-width",
      kind: "keyOnly",
      key: "equal width",
      description: "With `horizontal`:  every segment the same width."
    },
    { name: "wrapping", kind: "keyOnly", description: "With `horizontal`:  segments wrap onto more rows." },
    { name: "stackable", kind: "keyOnly", description: "With `horizontal`:  stacks on mobile." },
    { name: "raised", kind: "keyOnly", description: "Lifted off the page with a shadow." },
    { name: "stacked", kind: "keyOrValueAndKey", values: ["tall"], description: "A page peeking out below." },
    { name: "piled", kind: "keyOnly", description: "A pile of rotated sheets behind the group." },
    { name: "compact", kind: "keyOnly", description: "Only as wide as its content." },
    { name: "basic", kind: "keyOnly", description: "No box of its own." },
    { name: "inverted", kind: "keyOnly", description: "The dark scheme, for every segment in the group." },
    { name: "loading", kind: "keyOnly", description: "Dims the group under a spinner." },
    { name: "disabled", kind: "keyOnly", description: "Dimmed and inert." }
  ],
  events: [],
  slots: [{ name: "", description: "`<ui-segment>`s and nested `<ui-segments>`." }],
  parts: [{ name: "group", description: "The group box." }],
  states: [{ name: "piled", description: "`piled`:  the host is the stacking context the rotated sheets sit behind." }],
  texts: []
} as const satisfies E.ComponentVocabulary
