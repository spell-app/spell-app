/**
 * Every name `<ui-divider>` uses:  tag, attributes (kind + allowed values), slots, parts.
 * Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-divider horizontal text-align="left">` => `ui horizontal left aligned divider`.
 */

import type { ComponentVocabulary } from "$/ui/vocabulary"

/****************
 * ### `<ui-divider>`
 * A divider:  `<div class="ui ... divider" role="separator">` around a slot for its text.
 ****************/
export const dividerVocabulary = {
  tag: "ui-divider",
  topics: ["layout", "basic", "typography", "elements"],
  aka: ["separator", "hr", "horizontal rule", "rule", "line"],
  skeleton: { height: "0.25em" },
  noun: "divider",
  description: "A divider visually segments content into groups.",
  attributes: [
    { name: "size", kind: "size", description: "Size of the text, `mini` ... `massive`;  `medium` is the default." },
    { name: "color", kind: "color", description: "Hue of the rule and the text." },
    { name: "horizontal", kind: "keyOnly", description: "Text (or an icon) between two horizontal rules." },
    {
      name: "vertical",
      kind: "keyOnly",
      description: "A vertical rule with optional text, centred in a `position: relative` owner (segment, grid)."
    },
    {
      name: "hidden",
      kind: "keyOnly",
      property: "dividerHidden",
      description:
        "The spacing without the line.  Fomantic's own vocabulary word;  the JS property is `dividerHidden` so " +
        "it doesn't shadow `HTMLElement.hidden` -- `ui-divider.css` overrides the UA `[hidden] { display: none }` " +
        "so the host keeps contributing its margin."
    },
    { name: "fitted", kind: "keyOnly", description: "No space above or below." },
    { name: "clearing", kind: "keyOnly", description: "Clears floated content above it." },
    { name: "section", kind: "keyOnly", description: "More space, to divide sections of content." },
    { name: "inverted", kind: "keyOnly", description: "For dark backgrounds." },
    {
      name: "text-align",
      kind: "textAlign",
      values: ["left", "center", "right"],
      description: "With `horizontal`:  where the text sits;  `left` / `right` drop the rule on that side."
    },
    { name: "icon", kind: "icon", description: "Icon name, shown before the text." }
  ],
  events: [],
  slots: [{ name: "", description: "Text between the rules of a `horizontal` or `vertical` divider." }],
  parts: [
    { name: "divider", description: "The divider box." },
    { name: "icon", description: "The icon box." }
  ],
  states: [],
  texts: []
} as const satisfies ComponentVocabulary
