/**
 * The English vocabulary of `<ui-summary>`, one of the 13 generic content parts:  every name the tag uses.
 * - The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - The noun IS the part word, and the class its root carries:  `<ui-summary>` => `class="summary"`.
 *   Parts have no `ui` class (`ui: false`), except a STANDALONE `<ui-header>`, which is Fomantic's `ui header`.
 * - Owners declare the parts they own (`ownsParts` in THEIR vocabularies).
 *   `OwnerContext` finds a part's nearest owner, and the part sets `:state(in-<owner>)`;
 *   its `states` list the owners Fomantic styles it in.
 * - `UIParts.css` styles every part;  its header lists the tokens owners must set.
 */

import type { E } from "$/ui/core"

/****************
 * ### `summaryVocabulary`
 * The names of `<ui-summary>`, a summary:  `<div class="summary">`.
 ****************/
export const summaryVocabulary = {
  tag: "ui-summary",
  topics: ["content parts", "social"],
  aka: ["event summary", "headline"],
  noun: "summary",
  ui: false,
  description: "A feed event's summary line, e.g. who did what, with an inline date.",
  attributes: [],
  events: [],
  slots: [{ name: "", description: "Text, `<ui-author>`, `<ui-date>`." }],
  parts: [{ name: "summary", description: "The summary box." }],
  states: [{ name: "in-feed", description: "Owned by a feed." }],
  texts: []
} as const satisfies E.ComponentVocabulary
