/**
 * Every name `<epic-net-effect>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-net-effect>`
 * A "Net effect" list:  what a choice, a reply or a change comes to, in a few bullets.
 ****************/
export const epicNetEffectVocabulary = {
  tag: "epic-net-effect",
  topics: ["documentation", "lists", "content parts"],
  aka: ["net effect", "outcome", "consequences", "result", "what changes"],
  noun: "net-effect",
  ui: false,
  description:
    "The `Net effect` label, with its option when it's one option's (`Net effect (A):`), over its list:  one look " +
    "everywhere -- an item's text, a reply, an option card, an Overview sub-section.  The list stays the page's own " +
    "children.",
  attributes: [
    {
      name: "option",
      kind: "string",
      format: "letter",
      description: "The option it's the net effect of (`A`):  drawn `Net effect (A):`.  Absent:  `Net effect:`."
    },
    {
      name: "recommended",
      kind: "boolean",
      description: "That option is the recommended one:  `Net effect (A, recommended):`, the word in grey."
    }
  ],
  events: [],
  slots: [{ name: "", description: "What it comes to:  a `<ul>`, or a sentence or two." }],
  parts: [
    { name: "base", description: "The label over the content." },
    { name: "label", description: "`Net effect (A, recommended):`, a line of its own." },
    { name: "option", description: "`(A, recommended)`:  only with `option` or `recommended`." },
    { name: "recommended", description: "`recommended`, in grey." }
  ],
  states: [],
  texts: [
    { key: "label", text: "Net effect", description: "The label." },
    { key: "recommended", text: "recommended", description: "After the option's letter, when it's recommended." }
  ],
  children: [{ tag: "flow", description: "What it comes to." }],
  flow: true
} as const satisfies EpicVocabulary
