/**
 * The English vocabulary of `<ui-placeholder>`:  every name the tag uses.
 * - Its tag, attributes (each with its kind and allowed values), slots, parts and states.
 *   The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - The attributes become Fomantic's class words, in Fomantic's order (`ClassBuilder`):
 *   `<ui-placeholder fluid>` => `ui fluid placeholder`;
 *   `<ui-placeholder-line length="very long">` => `very long line`;  `<ui-placeholder-header image>` => `image header`.
 * - The shapes (`<ui-placeholder-header>`, `-paragraph`, `-line`, `-image`) are `ui: false`:
 *   Fomantic styles them only inside a placeholder.
 *   They're the placeholder's own tags, NOT generic content parts:  skeleton shapes,
 *   not content (see `UIPlaceholder.css`).
 * - Accessibility:  decorative.  The `<ui-placeholder>` element is `aria-hidden` (through `internals`);
 *   whatever is loading announces itself.  No texts.
 */

import type { E } from "$/ui/core"

/****************
 * ### `placeholderVocabulary`
 * The names of `<ui-placeholder>`, a skeleton of content still loading:
 * `<div class="ui … placeholder" part="placeholder">` around a slot.
 ****************/
export const placeholderVocabulary = {
  tag: "ui-placeholder",
  topics: ["loading", "feedback", "elements"],
  aka: ["skeleton", "shimmer", "ghost", "loading placeholder", "content loader"],
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
} as const satisfies E.ComponentVocabulary
