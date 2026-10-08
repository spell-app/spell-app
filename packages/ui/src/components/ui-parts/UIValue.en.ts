/**
 * The English vocabulary of `<ui-value>`, one of the 13 generic content parts:  every name the tag uses.
 * - The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - The noun IS the part word, and the class its root carries:  `<ui-value>` => `class="value"`.
 *   Parts have no `ui` class (`ui: false`), except a STANDALONE `<ui-header>`, which is Fomantic's `ui header`.
 * - Owners declare the parts they own (`ownsParts` in THEIR vocabularies).
 *   `OwnerContext` finds a part's nearest owner, and the part sets `:state(in-<owner>)`;
 *   its `states` list the owners Fomantic styles it in.
 * - `UIParts.css` styles every part;  its header lists the tokens owners must set.
 */

import type { E } from "$/ui/core"

/****************
 * ### `valueVocabulary`
 * The names of `<ui-value>`, a value:  `<div class="value">`.
 ****************/
export const valueVocabulary = {
  tag: "ui-value",
  topics: ["content parts", "data display"],
  aka: ["statistic value", "number", "metric value"],
  noun: "value",
  ui: false,
  description: "A statistic's value;  a search result's price.",
  attributes: [{ name: "text", kind: "keyOnly", description: "In a statistic:  a word value, smaller and bold." }],
  events: [],
  slots: [{ name: "", description: "The value:  a number, a word, an icon or image." }],
  parts: [{ name: "value", description: "The value box." }],
  states: [
    { name: "in-statistic", description: "Owned by a statistic." },
    { name: "in-search", description: "Owned by a search." }
  ],
  texts: []
} as const satisfies E.ComponentVocabulary
