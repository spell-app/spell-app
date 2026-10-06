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
 * ### `<ui-placeholder>`
 * A skeleton of content still loading:  `<div class="ui ... placeholder" part="placeholder">` around a slot.
 ****************/
export const placeholderVocabulary = {
  tag: "ui-placeholder",
  topics: ["loading", "feedback", "elements"],
  aka: ["skeleton", "shimmer", "ghost", "loading placeholder", "content loader"],
  skeleton: false,
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
