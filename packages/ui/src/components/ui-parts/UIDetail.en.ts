/**
 * The English vocabulary of `<ui-detail>`, one of the 13 generic content parts:  every name the tag uses.
 * - The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - The noun IS the part word, and the class its root carries:  `<ui-detail>` => `class="detail"`.
 *   Parts have no `ui` class (`ui: false`), except a STANDALONE `<ui-header>`, which is Fomantic's `ui header`.
 * - Owners declare the parts they own (`ownsParts` in THEIR vocabularies).
 *   `OwnerContext` finds a part's nearest owner, and the part sets `:state(in-<owner>)`;
 *   its `states` list the owners Fomantic styles it in.
 * - `UIParts.css` styles every part;  its header lists the tokens owners must set.
 */

import type { E } from "$/ui/core"

/****************
 * ### `detailVocabulary`
 * The names of `<ui-detail>`, a detail:  `<span class="detail">` (`<a>` with `href`).
 ****************/
export const detailVocabulary = {
  tag: "ui-detail",
  topics: ["content parts", "text"],
  aka: ["secondary text", "note"],
  noun: "detail",
  ui: false,
  description: "A label's dimmer second value, e.g. a count.",
  attributes: [{ name: "href", kind: "string", description: 'Renders a link (`<a class="detail" href>`).' }],
  events: [],
  slots: [{ name: "", description: "Text, an icon." }],
  parts: [{ name: "detail", description: "The detail box." }],
  states: [{ name: "in-label", description: "Owned by a label." }],
  texts: []
} as const satisfies E.ComponentVocabulary
