/**
 * Every name `<ui-shape>` and `<ui-side>` use:  tags, attributes (kind + allowed values), events, slots, parts,
 * states, texts.  Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:  `<ui-shape cube>` => `ui cube shape`;  the
 *   element adds `animating` after the noun while it flips.
 * - A side has no `ui` (Fomantic's `.side`);  which one shows is the shape's `active-index`, not an attribute of the
 *   side.
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-side>`
 * One side of a `<ui-shape>`:  `<div class="side" part="side"><slot>`;  the shape shows, hides and turns it.
 ****************/
export const sideVocabulary = {
  tag: "ui-side",
  topics: ["animation", "content parts", "modules"],
  aka: ["shape side", "face"],
  noun: "side",
  ui: false,
  description: "One side of a shape.",
  attributes: [],
  events: [],
  slots: [{ name: "", description: "The side's content." }],
  parts: [{ name: "side", description: "The face." }],
  states: [
    { name: "side", description: "Always:  its shape finds it by this." },
    { name: "active", description: "The side shown (set by the shape)." },
    { name: "inactive", description: "Another side is shown:  hidden (set by the shape)." },
    { name: "animating", description: "Turning into view (set by the shape)." },
    { name: "leaving", description: "Turning out of view (set by the shape)." }
  ],
  texts: []
} as const satisfies E.ComponentVocabulary
