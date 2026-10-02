/**
 * Every name `<ui-feed>` and `<ui-event>` use:  tag, attributes (kind + allowed values), slots, parts, states.
 * Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-feed connected ordered size="small">` => `ui small connected ordered feed`;  an event has no `ui`
 *   (`<ui-event basic>` => `basic event`).  `ui-feed.css` keys on those.
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
  topics: ["social", "lists", "data display", "views"],
  aka: ["activity feed", "timeline", "news feed", "activity stream"],
  skeleton: {
    parts: [
      { shape: "header", image: true },
      { shape: "paragraph", lines: 2 }
    ]
  },
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
