/**
 * Every name `<epic-update>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-update>`
 * An UPDATE marker:  what changed while a phase is active.
 ****************/
export const epicUpdateVocabulary = {
  tag: "epic-update",
  topics: ["documentation", "notifications", "status"],
  aka: ["update", "changed", "new", "flag"],
  skeleton: null,
  noun: "update",
  ui: false,
  description:
    "An UPDATE marker, while a phase is active:  empty, an orange UPDATE label (on a new or changed item);  with " +
    "children, a note of what changed, just before the prose it's about.  `phase <N> done` removes its phase's.",
  attributes: [
    {
      name: "phase",
      kind: "number",
      required: true,
      description: "The phase it belongs to (`2`):  removed when that phase is done."
    }
  ],
  events: [],
  slots: [{ name: "", description: "What changed;  none for a bare label." }],
  parts: [
    { name: "base", description: "The label or note." },
    { name: "label", description: "The orange `UPDATE` label:  alone when empty, the note's heading otherwise." }
  ],
  states: [{ name: "note", description: "It has children:  drawn as a note, not a bare label." }],
  texts: [
    { key: "label", text: "UPDATE", description: "The label." },
    { key: "tip", text: "Changed during P{phase}", description: "The label's tooltip." }
  ],
  children: [{ tag: "flow", description: "What changed." }],
  flow: true
} as const satisfies EpicVocabulary
