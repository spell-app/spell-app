/**
 * The English vocabulary of `<ui-labels>`:  every name the tag uses.
 * - Its tag, attributes (each with its kind and allowed values), slots and parts.
 *   The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - How the family's attributes become class words:  `UILabel.en.ts`.
 */

import type { E } from "$/ui/core"

/****************
 * ### `labelsVocabulary`
 * The names of `<ui-labels>`, a group of labels sharing one look:  `<div class="ui … labels">`.
 ****************/
export const labelsVocabulary = {
  tag: "ui-labels",
  topics: ["status", "lists", "elements"],
  aka: ["badges", "chips", "tags", "tag list"],
  noun: "labels",
  description: "Labels can be grouped to share a look.",
  attributes: [
    { name: "size", kind: "size", description: "Size of every label in the group." },
    { name: "color", kind: "color", description: "Hue of every label in the group." },
    { name: "tag", kind: "keyOnly", description: "Every label shaped like a price tag." },
    { name: "basic", kind: "keyOnly", description: "Every label basic (outlined)." },
    { name: "tinted", kind: "keyOnly", description: "Every label tinted (the colour's soft fill and text)." },
    { name: "circular", kind: "keyOnly", description: "Every label a round badge." },
    { name: "horizontal", kind: "keyOnly", description: "Every label a fixed-width tag." },
    { name: "image", kind: "keyOnly", description: "Every label an image label." },
    { name: "fluid", kind: "keyOnly", description: "Every label full width." },
    { name: "centered", kind: "keyOnly", description: "Every label centred." },
    { name: "inverted", kind: "keyOnly", description: "Every label for dark backgrounds." },
    { name: "disabled", kind: "keyOnly", description: "Every label dimmed and inert." }
  ],
  events: [],
  slots: [{ name: "", description: "`<ui-label>`s." }],
  parts: [{ name: "group", description: "The group box." }],
  states: [],
  texts: []
} as const satisfies E.ComponentVocabulary
