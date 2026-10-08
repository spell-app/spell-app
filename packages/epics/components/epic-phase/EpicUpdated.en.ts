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
      description: "When the plan changed:  `2026-10-06 14:30`, drawn `10/6/26 14:30`."
    },
    { name: "phase", kind: "number", description: "The phase active when it changed (`3`)." },
    {
      name: "of",
      kind: "number",
      description:
        'A COPY in the Phases section\'s Plan changes box (`slot="changes"`):  the phase whose plan it changes (`5`), ' +
        "drawn as a `P5` link before it.  The plan-doc tool writes the copies;  never on the line in its phase."
    }
  ],
  events: [],
  slots: [{ name: "", description: "What changed in the plan, and why." }],
  parts: [
    { name: "base", description: "The fence:  a dashed orange box." },
    { name: "icon", description: "Its icon, centred on its first line." },
    { name: "label", description: "`Updated`, then its time." }
  ],
  states: [],
  texts: [
    { key: "updated", text: "Updated", description: "Its label." },
    { key: "during", text: "during P{phase}", description: "After its time:  the phase under way then." },
    { key: "of", text: "P{phase}", description: "A Plan changes copy:  the phase it changes, a link to it." }
  ],
  children: [{ tag: "flow", description: "What changed in the plan, and why." }]
} as const satisfies EpicVocabulary
