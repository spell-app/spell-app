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
 * ### `<ui-placeholder-line>`
 * One bar:  `<div class="[length] line" part="line">`, empty.
 ****************/
export const placeholderLineVocabulary = {
  tag: "ui-placeholder-line",
  topics: ["loading", "content parts", "elements"],
  aka: ["skeleton line"],
  skeleton: "none",
  noun: "line",
  ui: false,
  description: "One line of text's skeleton:  a bar.",
  attributes: [
    {
      name: "length",
      kind: "valueOnly",
      values: ["full", "very long", "long", "medium", "short", "very short"],
      description:
        "How long the bar is;  absent, it follows its position in the block.  `medium` IS a length here, not a size."
    }
  ],
  events: [],
  slots: [],
  parts: [{ name: "line", description: "The bar." }],
  states: [],
  texts: []
} as const satisfies E.ComponentVocabulary
