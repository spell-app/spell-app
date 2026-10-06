/**
 * Every name `<ui-placeholder>` and its shapes use -- `<ui-placeholder-header>`, `<ui-placeholder-paragraph>`,
 * `<ui-placeholder-line>`, `<ui-placeholder-image>`:  tags, attributes (kind + allowed values), slots, parts,
 * states.  Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-placeholder fluid>` => `ui fluid placeholder`;  `<ui-placeholder-line length="very long">` =>
 *   `very long line`;  `<ui-placeholder-header image>` => `image header`.
 * - The shapes are `ui: false`:  Fomantic styles them only inside a placeholder.  They're placeholder-specific
 *   elements, NOT generic content parts -- skeleton shapes, not content;  see `ui-placeholder.css`.
 * - Accessibility:  decorative.  The `<ui-placeholder>` host is `aria-hidden` (internals);  whatever is loading
 *   announces itself.  No texts.
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-placeholder-image>`
 * An image's skeleton:  `<div class="[square] [rectangular] image" part="image">`, empty.
 ****************/
export const placeholderImageVocabulary = {
  tag: "ui-placeholder-image",
  topics: ["loading", "images", "elements"],
  aka: ["skeleton image", "image placeholder"],
  skeleton: "none",
  noun: "image",
  ui: false,
  description: "The skeleton of an image:  a block of fixed height, or of a fixed aspect ratio.",
  attributes: [
    { name: "square", kind: "keyOnly", description: "A 1:1 block as wide as its container." },
    {
      name: "rectangular",
      kind: "keyOnly",
      description: "A 4:3 block as wide as its container;  wins over `square` if both are set."
    }
  ],
  events: [],
  slots: [],
  parts: [{ name: "image", description: "The image block." }],
  states: [],
  texts: []
} as const satisfies E.ComponentVocabulary
