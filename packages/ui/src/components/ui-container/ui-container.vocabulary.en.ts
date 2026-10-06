/**
 * Every name `<ui-container>` uses:  tag, attributes (kind + allowed values), slots, parts.
 * Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-container text text-align="justified">` => `ui text justified container`.
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-container>`
 * A container:  `<div class="ui ... container" part="container">` around a slot.
 ****************/
export const containerVocabulary = {
  tag: "ui-container",
  topics: ["layout", "containers", "basic", "elements"],
  aka: ["wrapper", "page width", "content width"],
  noun: "container",
  description: "A container limits content to a maximum width.",
  attributes: [
    { name: "text", kind: "keyOnly", description: "A narrower reading column with larger type." },
    { name: "fluid", kind: "keyOnly", description: "Always the full width of the page." },
    { name: "wide", kind: "keyOnly", description: "A fifth wider than the default container." },
    {
      name: "grid",
      kind: "keyOnly",
      description: "Holds a grid:  widened by the grid's gutters so its columns line up with other containers."
    },
    {
      name: "relaxed",
      kind: "keyOrValueAndKey",
      values: ["very"],
      description: "With `grid`:  room for a `relaxed` (or `very` relaxed) grid's wider gutters."
    },
    {
      name: "text-align",
      kind: "textAlign",
      values: "alignments",
      description: "Aligns its text `left`, `center`, `right`, or `justified` (with hyphenation)."
    },
    {
      name: "scrolling",
      kind: "keyOrValueAndKey",
      values: ["short", "very short", "long", "very long"],
      description:
        "A capped height (per breakpoint) that scrolls;  `short` ... `very long` scale the cap.  Heights are " +
        "tokens:  `--ui-container-scrolling-height` (mobile, 15em), `--ui-container-scrolling-height-tablet` " +
        "(18em), `-computer` (24em), `-widescreen` (30em)."
    },
    { name: "resizable", kind: "keyOnly", description: "With `scrolling`:  people can drag its height." }
  ],
  events: [],
  slots: [{ name: "", description: "Content." }],
  parts: [{ name: "container", description: "The container box." }],
  states: [],
  texts: []
} as const satisfies E.ComponentVocabulary
