/**
 * The English vocabulary of `<ui-date>`, one of the 13 generic content parts:  every name the tag uses.
 * - The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - The noun IS the part word, and the class its root carries:  `<ui-date>` => `class="date"`.
 *   Parts have no `ui` class (`ui: false`), except a STANDALONE `<ui-header>`, which is Fomantic's `ui header`.
 * - Owners declare the parts they own (`ownsParts` in THEIR vocabularies).
 *   `OwnerContext` finds a part's nearest owner, and the part sets `:state(in-<owner>)`;
 *   its `states` list the owners Fomantic styles it in.
 * - `UIParts.css` styles every part;  its header lists the tokens owners must set.
 */

import type { E } from "$/ui/core"

/****************
 * ### `dateVocabulary`
 * The names of `<ui-date>`, a date:  `<time class="date">`.
 ****************/
export const dateVocabulary = {
  tag: "ui-date",
  topics: ["content parts", "date & time", "social"],
  aka: ["timestamp", "time ago", "posted at"],
  noun: "date",
  ui: false,
  description: "When something happened;  inline and small inside a summary.",
  attributes: [
    {
      name: "datetime",
      kind: "string",
      property: "dateTime",
      description: "Machine-readable date, as `<time datetime>`."
    }
  ],
  events: [],
  slots: [{ name: "", description: "The human-readable date." }],
  parts: [{ name: "date", description: "The `<time>`." }],
  states: [{ name: "in-feed", description: "Owned by a feed." }],
  texts: []
} as const satisfies E.ComponentVocabulary
