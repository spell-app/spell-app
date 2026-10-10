/**
 * The English vocabulary of `<ui-brand-blob>`:  every name the tag uses.
 * - The shape is `E.ComponentVocabulary`.
 * - Pure data:  `import type` only.
 * - `corner`, `shape` and `tone` are not class words:  the component places and colours its one shape.
 */

import type { E } from "$/ui/core"

/****************
 * ### `brandBlobVocabulary`
 * The names of `<ui-brand-blob>`, page art:  one soft lavender shape tucked into a corner of its positioned parent,
 * half off the edge.
 ****************/
export const brandBlobVocabulary = {
  tag: "ui-brand-blob",
  topics: ["images"],
  aka: ["blob", "corner blob", "decoration", "background shape", "motif"],
  skeleton: "0 tall",
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
      values: ["organic", "mound", "wave"],
      default: "organic",
      description:
        "`organic` (a soft egg), `mound` (a hill rising from the edge, flat side out) or `wave` (a corner wash with an " +
        "S-curved edge, as the Brand Montage poster's;  flush in its corner, no overhang by default)."
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
} as const satisfies E.ComponentVocabulary
