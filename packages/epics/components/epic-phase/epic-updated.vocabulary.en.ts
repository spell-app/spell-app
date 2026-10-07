/**
 * Every name `<epic-updated>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-updated>`
 * One change to a phase's plan, fenced under its Symptom / Changes.
 ****************/
export const epicUpdatedVocabulary = {
  tag: "epic-updated",
  topics: ["documentation", "content parts"],
  aka: ["updated", "plan change", "revision", "amendment"],
  skeleton: null,
  noun: "updated",
  ui: false,
  description:
    "One change to a phase's plan (after Owen's feedback, or found while building):  a dated line under its " +
    "Symptom / Changes, kept once the phase is done;  listed in the Plan changes box while the phase is to do.",
  attributes: [
    {
      name: "at",
      kind: "string",
      required: true,
      format: "time",
      description: "When the plan changed:  `2026-10-06 14:30`."
    },
    { name: "phase", kind: "number", description: "The phase active when it changed (`3`)." }
  ],
  events: [],
  slots: [{ name: "", description: "What changed in the plan, and why." }],
  parts: [{ name: "base", description: "The fenced line." }],
  states: [],
  texts: [],
  children: [{ tag: "flow", description: "What changed in the plan, and why." }]
} as const satisfies EpicVocabulary
