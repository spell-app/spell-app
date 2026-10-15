/**
 * The English vocabulary of `<ui-event>`:  every name the tag uses.
 * - Its tag, attributes (each with its kind and allowed values), events, slots, parts, states and texts.
 *   The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - The family's grammar notes are in `UIFeed.en.ts`.
 */

import type { E } from "$/ui/core"

/****************
 * ### `eventVocabulary`
 * The names of `<ui-event>`, one event of a feed:  `<div class="[color] [keyOnly ...] event">`,
 * a label (icon, image, text) beside a content block.
 ****************/
export const eventVocabulary = {
  tag: "ui-event",
  topics: ["social", "content parts", "views"],
  aka: ["activity", "feed item", "timeline entry"],
  noun: "event",
  ui: false,
  description: "One event of a feed:  a label (a picture, an icon, a number) beside what happened.",
  attributes: [
    {
      name: "color",
      kind: "color",
      description: "Hue of its number circle and of the line to the next event (`connected`)."
    },
    { name: "icon", kind: "icon", description: "Icon name, shown as the label." },
    { name: "image", kind: "string", description: 'Image URL, shown round as the label (decorative, `alt=""`).' },
    {
      name: "label",
      kind: "string",
      description: "Short text in a circle as the label, e.g. an initial (Fomantic's `data-text`)."
    },
    { name: "basic", kind: "keyOnly", description: "Its number / text circle outlined instead of filled." },
    { name: "disabled", kind: "keyOnly", description: "Faded and inert." }
  ],
  events: [],
  slots: [
    { name: "", description: "The content:  a `<ui-content>` of `<ui-summary>`, `<ui-extra>`, `<ui-meta>` ..." },
    { name: "label", description: "The label's content instead of a shorthand:  an `<img>`, a `<ui-icon>`." }
  ],
  parts: [
    { name: "event", description: "The event box." },
    { name: "label", description: "The label box beside the content." },
    { name: "image", description: "The `<img>` of the `image` shorthand." },
    { name: "icon", description: "The icon box of the `icon` shorthand." }
  ],
  states: [
    { name: "in-feed", description: "In a feed:  `role=listitem`." },
    { name: "disabled", description: "`disabled`." }
  ],
  texts: []
} as const satisfies E.ComponentVocabulary
