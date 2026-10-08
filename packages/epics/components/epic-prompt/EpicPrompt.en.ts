/**
 * Every name `<epic-prompt>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-prompt>`
 * The prompt that started the plan, folded under "Kickoff prompt".
 ****************/
export const epicPromptVocabulary = {
  tag: "epic-prompt",
  topics: ["documentation", "content parts", "containers"],
  aka: ["kickoff prompt", "prompt", "brief", "request", "quote"],
  noun: "prompt",
  ui: false,
  description:
    "The prompt that started the plan, as Owen typed it:  folded under `Kickoff prompt` in the Overview, on the " +
    "ivory of his voice;  unfolded, a quoted card.  The prompt stays the page's own children.",
  attributes: [],
  events: [],
  slots: [{ name: "", description: "The prompt:  `<p>`s." }],
  parts: [
    { name: "base", description: "The fold:  a `<details>`, folded to start with." },
    { name: "title", description: "Its `<summary>`:  the chevron and `Kickoff prompt`." },
    { name: "quote", description: "The card around the prompt, shown unfolded." }
  ],
  states: [],
  texts: [{ key: "title", text: "Kickoff prompt", description: "The fold's title." }],
  children: [{ tag: "flow", description: "The prompt, as typed." }]
} as const satisfies EpicVocabulary
