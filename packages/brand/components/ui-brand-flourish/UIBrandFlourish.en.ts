/**
 * The English vocabulary of `<ui-brand-flourish>`:  every name the tag uses.
 * - The shape is `ComponentVocabulary`.
 * - Pure data:  `import type` only;  `variant`'s values are written out (the types file's `VARIANTS`).
 */

import type { ComponentVocabulary } from "$/ui/core"

/****************
 * ### `brandFlourishVocabulary`
 * The names of `<ui-brand-flourish>`, page art:  a generated swoop, blobs, curls, a sparkle trail or a rising wave,
 * filling its positioned parent.
 ****************/
export const brandFlourishVocabulary = {
  tag: "ui-brand-flourish",
  topics: ["images", "animation"],
  aka: ["flourish", "decoration", "swoosh", "blob", "background art", "squiggle"],
  skeleton: "0 tall",
  noun: "flourish",
  ui: false,
  description:
    "A brand flourish draws generated page art (swoops, blobs, curls, sparkles) behind its parent's content.",
  attributes: [
    {
      name: "variant",
      kind: "enum",
      values: ["swoop", "blobs", "edge-curls", "sparkle-trail", "rising-wave"],
      default: "swoop",
      description: "Which flourish:  `swoop`, `blobs`, `edge-curls`, `sparkle-trail`, `rising-wave`."
    },
    {
      name: "seed",
      kind: "number",
      default: 7,
      description: "Which one of the variant:  another seed, another shape."
    },
    { name: "stroke", kind: "string", description: "Line colour;  default the theme's flourish line (lilac)." },
    { name: "fill", kind: "string", description: "Shape colour;  default the theme's blob (lavender)." },
    { name: "fill2", kind: "string", description: "Second shape colour;  default the theme's second blob." },
    { name: "weight", kind: "number", default: 1.6, description: "Line weight, px." }
  ],
  events: [],
  slots: [],
  parts: [{ name: "art", description: "The `<svg>`." }],
  states: [],
  texts: []
} as const satisfies ComponentVocabulary
