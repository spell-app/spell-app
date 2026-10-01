/**
 * Every name `<ui-feed>` and `<ui-event>` use:  tag, attributes (kind + allowed values), slots, parts, states.
 * Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-feed connected ordered size="small">` => `ui small connected ordered feed`;  an event has no `ui`
 *   (`<ui-event basic>` => `basic event`).  `feed.css` keys on those.
 * - The FEED owns the content parts (`ownsParts`):  an event is a part itself, transparent to their climbs, so
 *   `<ui-summary>`, `<ui-date>`, `<ui-meta>`, `<ui-extra>`, `<ui-author>` (Fomantic's `.user`) inside it get
 *   `:state(in-feed)` -- Fomantic's `.ui.feed > .event > .content .summary`.
 */

import type { ComponentVocabulary } from "$/ui/vocabulary"

/****************
 * ### `<ui-feed>`
 * An activity feed:  `<ul class="ui ... feed" role="list">` (`<ol>` when `ordered`) of `<ui-event>`s.
 ****************/
export const feedVocabulary = {
  tag: "ui-feed",
  noun: "feed",
  description: "A feed presents user activity chronologically.",
  attributes: [
    { name: "size", kind: "size", description: "Text size, `mini` ... `massive`;  `medium` is the default." },
    {
      name: "color",
      kind: "color",
      description: "Hue of the events' number circles (`ordered`) and connecting line (`connected`)."
    },
    { name: "connected", kind: "keyOnly", description: "A line joins each event's label to the next." },
    {
      name: "ordered",
      kind: "keyOnly",
      description: "Numbers the events, in a circle where the label goes.  Renders `<ol>`."
    },
    { name: "divided", kind: "keyOnly", description: "A rule between events." },
    { name: "basic", kind: "keyOnly", description: "Ordered:  outlined number circles instead of filled ones." },
    { name: "inverted", kind: "keyOnly", description: "For dark backgrounds:  the dark scheme." },
    { name: "disabled", kind: "keyOnly", description: "Faded and inert." }
  ],
  events: [],
  slots: [{ name: "", description: "`<ui-event>`s." }],
  parts: [{ name: "feed", description: "The `<ul>` / `<ol>` box." }],
  states: [],
  texts: [],
  ownsParts: ["event", "content", "summary", "date", "meta", "extra", "author"]
} as const satisfies ComponentVocabulary

/****************
 * ### `<ui-event>`
 * One event of a feed:  `<div class="[color] [keyOnly ...] event">`, a label (icon, image, text) beside a
 * content block.
 ****************/
export const eventVocabulary = {
  tag: "ui-event",
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
} as const satisfies ComponentVocabulary
