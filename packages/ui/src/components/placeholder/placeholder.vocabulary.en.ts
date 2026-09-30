/**
 * Every name `<ui-placeholder>` and its shapes use -- `<ui-placeholder-header>`, `<ui-placeholder-paragraph>`,
 * `<ui-placeholder-line>`, `<ui-placeholder-image>`:  tags, attributes (kind + allowed values), slots, parts,
 * states.  Schema:  `ComponentVocabulary` (`$/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-placeholder fluid>` => `ui fluid placeholder`;  `<ui-placeholder-line length="very long">` =>
 *   `very long line`;  `<ui-placeholder-header image>` => `image header`.
 * - The shapes are `ui: false`:  Fomantic styles them only inside a placeholder.  They're placeholder-specific
 *   elements, NOT generic content parts -- skeleton shapes, not content;  see `placeholder.css`.
 * - Accessibility:  decorative.  The `<ui-placeholder>` host is `aria-hidden` (internals);  whatever is loading
 *   announces itself.  No texts.
 */

import type { ComponentVocabulary } from "$/vocabulary"

/****************
 * ### `<ui-placeholder>`
 * A skeleton of content still loading:  `<div class="ui ... placeholder" part="placeholder">` around a slot.
 ****************/
export const placeholderVocabulary = {
  tag: "ui-placeholder",
  noun: "placeholder",
  description: "A placeholder is used to reserve space for content that soon will appear in a layout.",
  attributes: [
    { name: "fluid", kind: "keyOnly", description: "As wide as its container, instead of a capped width." },
    { name: "inverted", kind: "keyOnly", description: "For dark backgrounds:  the dark scheme." }
  ],
  events: [],
  slots: [
    {
      name: "",
      description:
        "Shapes:  `<ui-placeholder-header>`, `<ui-placeholder-paragraph>`, `<ui-placeholder-line>`, `<ui-placeholder-image>`."
    }
  ],
  parts: [{ name: "placeholder", description: "The placeholder box." }],
  states: [
    {
      name: "placeholder",
      description: "Always set:  lets a placeholder find placeholder siblings, for the gap between consecutive ones."
    }
  ],
  texts: []
} as const satisfies ComponentVocabulary

/****************
 * ### `<ui-placeholder-header>`
 * A header's skeleton, two taller bars:  `<div class="[image] header" part="header">` around a slot.
 ****************/
export const placeholderHeaderVocabulary = {
  tag: "ui-placeholder-header",
  noun: "header",
  ui: false,
  description: "The skeleton of a header:  a block of taller, shorter lines, optionally beside an image.",
  attributes: [{ name: "image", kind: "keyOnly", description: "A square image beside the lines." }],
  events: [],
  slots: [{ name: "", description: "`<ui-placeholder-line>`s, usually two." }],
  parts: [{ name: "header", description: "The header block;  with `image`, its `::before` is the square." }],
  states: [],
  texts: []
} as const satisfies ComponentVocabulary

/****************
 * ### `<ui-placeholder-paragraph>`
 * A paragraph's skeleton:  `<div class="paragraph" part="paragraph">` around a slot.
 ****************/
export const placeholderParagraphVocabulary = {
  tag: "ui-placeholder-paragraph",
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

/****************
 * ### `<ui-placeholder-line>`
 * One bar:  `<div class="[length] line" part="line">`, empty.
 ****************/
export const placeholderLineVocabulary = {
  tag: "ui-placeholder-line",
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
} as const satisfies ComponentVocabulary

/****************
 * ### `<ui-placeholder-image>`
 * An image's skeleton:  `<div class="[square] [rectangular] image" part="image">`, empty.
 ****************/
export const placeholderImageVocabulary = {
  tag: "ui-placeholder-image",
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
} as const satisfies ComponentVocabulary
