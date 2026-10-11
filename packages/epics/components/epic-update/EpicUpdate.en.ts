/**
 * Every name `<epic-update>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-update>`
 * An UPDATE:  a dated block saying what changed in the plan, or a bare orange label on a changed item.
 ****************/
export const epicUpdateVocabulary = {
  tag: "epic-update",
  topics: ["documentation", "notifications", "status"],
  aka: ["update", "updated", "plan change", "changed", "revision", "flag"],
  noun: "update",
  ui: false,
  description:
    "An UPDATE (Owen, 2026-10-11):  a block titled `Update: <summary>`, its date at the right, what changed " +
    "under it.  A phase's plan change sits at the end of its phase's description (after Goal);  an update to " +
    "prose right after the block it changed.  Empty, with no `summary` or `at`:  the orange UPDATE label on an " +
    "item changed while a phase is active.",
  attributes: [
    {
      name: "at",
      kind: "string",
      format: "time",
      description: "When it changed:  `2026-10-11 14:30`, drawn `10/11/26 14:30` at the title's right."
    },
    {
      name: "summary",
      kind: "string",
      description: "What changed, in one line:  the title's words after `Update:`."
    },
    {
      name: "phase",
      kind: "number",
      description:
        "The phase active when it was written (`3`).  `phase 3 done` removes P3's bare labels and the updates " +
        "outside a phase;  a phase's own plan changes stay."
    }
  ],
  events: [],
  slots: [{ name: "", description: "What changed, and why;  none for a bare label." }],
  parts: [
    { name: "base", description: "The block, or the bare label." },
    { name: "header", description: "A block's title row:  the fold chevron, the title, the date." },
    { name: "toggle", description: "A block's fold chevron, a `<button>`, first:  a click folds what changed." },
    { name: "title", description: "A block's `Update: <summary>`." },
    { name: "time", description: "A block's date (`at`), at the right of its title row." },
    { name: "body", description: "What changed, under the title row;  hidden (`until-found`) while folded." },
    { name: "label", description: "The bare orange `UPDATE` label." }
  ],
  states: [
    { name: "block", description: "Drawn as a block:  it has a summary, a date or what changed." },
    { name: "open", description: "A block, unfolded:  it starts so (page state, never written)." }
  ],
  texts: [
    { key: "foldTip", text: "Fold this update", description: "Tooltip of its fold button while open." },
    { key: "unfoldTip", text: "Unfold this update", description: "Tooltip of its fold button while folded." },

    { key: "title", text: "Update", description: "A block's title, in bold, before `: <summary>`." },
    { key: "during", text: "Written during P{phase}", description: "The date's tooltip, after the full date." },
    { key: "label", text: "UPDATE", description: "The bare label." },
    { key: "tip", text: "Changed during P{phase}", description: "The bare label's tooltip." }
  ],
  children: [{ tag: "flow", description: "What changed, and why." }],
  flow: true
} as const satisfies EpicVocabulary
