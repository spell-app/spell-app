/**
 * Every name `<ui-segment>` and `<ui-segments>` use:  tags, attributes (kind + allowed values), slots, parts,
 * states.  Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-segment raised padded="very" attached="top">` => `ui raised very padded top attached segment`.
 * - No `ownsParts`:  Fomantic's segment styles no content parts of its own.  What it hands its content is
 *   inherited (`--ui-inverted`, `color-scheme`, label owner tokens), see `ui-segment.css`.
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-segment>`
 * A segment:  `<div class="ui ... segment" part="segment">` around a slot.
 ****************/
export const segmentVocabulary = {
  tag: "ui-segment",
  topics: ["containers", "layout", "basic", "elements"],
  aka: ["panel", "box", "section", "well", "paper", "card"],
  skeleton: "header, paragraph",
  noun: "segment",
  plural: "segments",
  description: "A segment is used to create a grouping of related content.",
  attributes: [
    { name: "size", kind: "size", description: "Text size, `mini` ... `massive`;  `medium` is the default." },
    {
      name: "color",
      kind: "color",
      description: "Hue of the top edge;  with `inverted`, the fill.  `primary` / `secondary` don't colour a segment."
    },
    { name: "raised", kind: "keyOnly", description: "Lifted off the page with a shadow." },
    {
      name: "stacked",
      kind: "keyOrValueAndKey",
      values: ["tall"],
      description: 'A page peeking out below;  `stacked="tall"` shows two.'
    },
    { name: "piled", kind: "keyOnly", description: "A pile of rotated sheets behind it." },
    { name: "vertical", kind: "keyOnly", description: "A band of a page:  no box, a rule above." },
    { name: "placeholder", kind: "keyOnly", description: "A tinted, centred block reserving room for content." },
    { name: "circular", kind: "keyOnly", description: "A round badge sized by its content." },
    { name: "compact", kind: "keyOnly", description: "Only as wide as its content." },
    {
      name: "padded",
      kind: "keyOrValueAndKey",
      values: ["very"],
      description: 'More padding;  `padded="very"` for even more.'
    },
    { name: "basic", kind: "keyOnly", description: "No box:  no background, border or shadow." },
    { name: "clearing", kind: "keyOnly", description: "Contains its floated children." },
    { name: "floated", kind: "valueAndKey", values: "floats", description: "Floats `left` or `right`." },
    {
      name: "text-align",
      kind: "textAlign",
      values: ["left", "center", "right"],
      description: "Aligns its text `left`, `center` or `right`."
    },
    { name: "secondary", kind: "keyOnly", description: "Less emphasis:  a tinted surface, muted text." },
    { name: "tertiary", kind: "keyOnly", description: "Least emphasis:  a darker tint, muted text." },
    {
      name: "attached",
      kind: "keyOrValueAndKey",
      values: ["top", "bottom", "left", "right"],
      description: "Joined edge to edge with the elements above / below;  bare `attached` sits in the middle."
    },
    { name: "seamless", kind: "keyOnly", description: "With `attached`:  no line where attached segments meet." },
    {
      name: "inverted",
      kind: "keyOnly",
      description: "The dark scheme;  everything inside follows (`color-scheme: dark`, `--ui-inverted`)."
    },
    { name: "loading", kind: "keyOnly", description: "Dims its content under a spinner;  `aria-busy`." },
    { name: "disabled", kind: "keyOnly", description: "Dimmed and inert." },
    {
      name: "fitted",
      kind: "keyOrValueAndKey",
      values: ["horizontally", "vertically"],
      description: "No padding;  `horizontally` / `vertically` keep the other axis' padding."
    },
    {
      name: "scrolling",
      kind: "keyOrValueAndKey",
      values: ["short", "very short", "long", "very long"],
      description: "A capped height (per breakpoint) that scrolls;  `short` ... `very long` scale the cap."
    },
    { name: "resizable", kind: "keyOnly", description: "With `scrolling`:  people can drag its height." }
  ],
  events: [],
  slots: [{ name: "", description: "Content." }],
  parts: [{ name: "segment", description: "The segment box." }],
  states: [
    { name: "piled", description: "`piled`:  the host is the stacking context the rotated sheets sit behind." },
    { name: "inverted", description: "In the dark scheme." },
    { name: "loading", description: "Busy." },
    { name: "disabled", description: "Dimmed and inert." }
  ],
  texts: [{ key: "loading", text: "Loading…", description: "Announced while `loading`." }]
} as const satisfies E.ComponentVocabulary
