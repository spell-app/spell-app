/**
 * Every name `<spell-example>` has:  tag, attributes, slots, parts.
 * Schema:  `E.ComponentVocabulary` (`spell-ui/core`).
 * - Pure data:  `import type` only.
 */

import type { E } from "spell-ui/core"

/****************
 * ### `<spell-example>`
 * A notebook's example (epic `elemental-spell` P16):  its title, its live result, and its code under it.
 ****************/
export const spellExampleVocabulary = {
  tag: "spell-example",
  topics: ["containers"],
  aka: ["notebook example", "live example"],
  noun: "example",
  ui: false,
  description:
    "A notebook's example:  its title, its live result, then its code.  A notebook's `<example \"...\">` compiles to " +
    "it;  the notebook's page puts each one's code in its `code` slot.",
  attributes: [{ name: "name", kind: "string", description: "Its title:  `one counter`." }],
  events: [],
  slots: [
    { name: "", description: "Its result:  what the example draws." },
    { name: "code", description: "Its code, under the result:  the notebook's page puts it there." }
  ],
  parts: [
    { name: "example", description: "The whole frame." },
    { name: "title", description: "Its title." },
    { name: "result", description: "The box round its result." }
  ],
  states: [],
  texts: []
} as const satisfies E.ComponentVocabulary
