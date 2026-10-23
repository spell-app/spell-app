/**
 * Every name a drawable thing's element starts with:  its tag (set per type), attributes, events, texts.
 * Schema:  `E.ComponentVocabulary` (`spell-ui/core`).
 * - Each drawable type gets its own copy, with its own tag, e.g. `solitaire-card` -- see `SpellElement.defineFor()`.
 * - Pure data:  `import type` only.
 */

import type { E } from "spell/element"

/****************
 * ### `<spell-element>`
 * A drawable thing, drawn in its own element:  `<solitaire-card>` for a card in a solitaire app.
 * Never defined by this tag:  each drawable type's element copies these names, under its own tag.
 ****************/
export const spellElementVocabulary = {
  tag: "spell-element",
  topics: ["views"],
  aka: ["web component", "custom element", "drawable thing"],
  noun: "drawable thing",
  ui: false,
  description:
    "A spell thing drawn in its own element, with its own shadow root, styles and error boundary:  `a card is a " +
    "drawable thing` in a solitaire app is drawn as `<solitaire-card>`.",
  attributes: [
    {
      name: "thing",
      kind: "json",
      description:
        "The thing it draws:  set by the program that draws it, e.g. `draw the card`.  " +
        'A tag written in markup names the program\'s thing by its `id` instead:  `<solitaire-tableau id="T1">`.'
    },
    {
      name: "move-delay",
      kind: "number",
      description:
        "A list people may reorder (`its items can be reordered`):  how many seconds the pointer rests on a place " +
        "before the dragged items move there, in place of what its type says."
    }
  ],
  events: [],
  slots: [],
  parts: [
    {
      name: "drop-line",
      description: "The line showing where dragged items would go, in a list people may reorder."
    }
  ],
  states: [],
  texts: []
} as const satisfies E.ComponentVocabulary
