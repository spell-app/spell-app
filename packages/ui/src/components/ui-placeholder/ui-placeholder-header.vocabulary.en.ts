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
 * ### `<ui-placeholder-header>`
 * A header's skeleton, two taller bars:  `<div class="[image] header" part="header">` around a slot.
 ****************/
export const placeholderHeaderVocabulary = {
  tag: "ui-placeholder-header",
  topics: ["loading", "content parts", "elements"],
  aka: ["skeleton heading"],
  skeleton: "none",
  noun: "header",
  ui: false,
  description: "The skeleton of a header:  a block of taller, shorter lines, optionally beside an image.",
  attributes: [{ name: "image", kind: "keyOnly", description: "A square image beside the lines." }],
  events: [],
  slots: [{ name: "", description: "`<ui-placeholder-line>`s, usually two." }],
  parts: [{ name: "header", description: "The header block;  with `image`, its `::before` is the square." }],
  states: [],
  texts: []
} as const satisfies E.ComponentVocabulary
