/**
 * Every name `<ui-placeholder>` and its shapes use -- `<ui-placeholder-header>`, `<ui-placeholder-paragraph>`,
 * `<ui-placeholder-line>`, `<ui-placeholder-image>`:  tags, attributes (kind + allowed values), slots, parts,
 * states.  Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-placeholder fluid>` => `ui fluid placeholder`;  `<ui-placeholder-line length="very long">` =>
 *   `very long line`;  `<ui-placeholder-header image>` => `image header`.
 * - The shapes are `ui: false`:  Fomantic styles them only inside a placeholder.  They're placeholder-specific
 *   elements, NOT generic content parts -- skeleton shapes, not content;  see `ui-placeholder.css`.
 * - Accessibility:  decorative.  The `<ui-placeholder>` host is `aria-hidden` (internals);  whatever is loading
 *   announces itself.  No texts.
 */

import type { ComponentVocabulary } from "$/ui/vocabulary"

/****************
 * ### `<ui-placeholder-paragraph>`
 * A paragraph's skeleton:  `<div class="paragraph" part="paragraph">` around a slot.
 ****************/
export const placeholderParagraphVocabulary = {
  tag: "ui-placeholder-paragraph",
  topics: ["loading", "content parts", "elements"],
  aka: ["skeleton text", "skeleton paragraph"],
  skeleton: null,
  noun: "paragraph",
  ui: false,
  description: "The skeleton of a paragraph:  a block of lines, of varied lengths unless set.",
  attributes: [],
  events: [],
  slots: [{ name: "", description: "`<ui-placeholder-line>`s." }],
  parts: [{ name: "paragraph", description: "The paragraph block." }],
  states: [],
  texts: []
} as const satisfies ComponentVocabulary
