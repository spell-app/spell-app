/**
 * Every name `<epic-field>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-field>`
 * One named field of a phase:  Symptom, Changes, Goal ...
 ****************/
export const epicFieldVocabulary = {
  tag: "epic-field",
  topics: ["documentation", "content parts"],
  aka: ["field", "goal", "symptom", "verify"],
  skeleton: null,
  noun: "field",
  ui: false,
  description: "One field of a phase, by `name`:  its icon and label are drawn;  its prose is its children.",
  attributes: [
    {
      name: "name",
      kind: "enum",
      values: ["symptom", "changes", "goal", "done", "files", "verify", "to-review"],
      required: true,
      description:
        "Which field:  `symptom` (one line), `changes` (two or three), `goal` (a bullet per outcome), `done` (what " +
        "was built), `files`, `verify` (both hidden until the Phases title's toggles), `to-review` (the script's)."
    }
  ],
  events: [],
  slots: [{ name: "", description: "The field's prose." }],
  parts: [{ name: "base", description: "The field." }],
  states: [],
  texts: [],
  children: [{ tag: "flow", description: "The field's prose." }]
} as const satisfies EpicVocabulary
