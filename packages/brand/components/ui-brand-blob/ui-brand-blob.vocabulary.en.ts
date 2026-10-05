/**
 * Every name `<ui-brand-blob>` uses.  Schema:  `ComponentVocabulary`.
 * - Pure data:  `import type` only.
 * - `corner`, `shape` and `tone` are not class words:  the element places and colours its one shape.
 */

import type { ComponentVocabulary } from "$/ui/core"

/****************
 * ### `<ui-brand-blob>`
 * Page art:  one soft lavender shape tucked into a corner of its positioned parent, half off the edge.
 ****************/
export const brandBlobVocabulary = {
  tag: "ui-brand-blob",
  topics: ["images"],
  aka: ["blob", "corner blob", "decoration", "background shape", "motif"],
  skeleton: { height: "0" },
  noun: "blob",
  ui: false,
  description: "A brand blob tucks one soft lavender shape into a corner of its parent, never behind body text.",
  attributes: [
    {
      name: "corner",
      kind: "enum",
      values: ["top-left", "top-right", "bottom-left", "bottom-right"],
      default: "bottom-right",
      description: "Which corner of the parent:  `top-left`, `top-right`, `bottom-left`, `bottom-right`."
    },
    {
      name: "shape",
      kind: "enum",
      values: ["organic", "mound"],
      default: "organic",
      description: "`organic` (a soft egg) or `mound` (a hill rising from the edge, flat side out)."
    },
    {
      name: "tone",
      kind: "enum",
      values: ["blob", "blob-2", "lilac", "violet", "current"],
      default: "blob",
      description:
        "Colour:  `blob` (lavender), `blob-2` (paler, grey-blue), `lilac`, `violet` (between the two), `current` (`currentColor`)."
    }
  ],
  events: [],
  slots: [],
  parts: [{ name: "blob", description: "The shape." }],
  states: [],
  texts: []
} as const satisfies ComponentVocabulary
